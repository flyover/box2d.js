/*
 * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

goog.provide('box2d.b2Island');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Timer');
goog.require('box2d.b2TimeStep');
goog.require('box2d.b2WorldCallbacks');
goog.require('box2d.b2ContactSolver');

/*
Position Correction Notes
=========================
I tried the several algorithms for position correction of the 2D revolute joint.
I looked at these systems:
- simple pendulum (1m diameter sphere on massless 5m stick) with initial angular velocity of 100 rad/s.
- suspension bridge with 30 1m long planks of length 1m.
- multi-link chain with 30 1m long links.

Here are the algorithms:

Baumgarte - A fraction of the position error is added to the velocity error. There is no
separate position solver.

Pseudo Velocities - After the velocity solver and position integration,
the position error, Jacobian, and effective mass are recomputed. Then
the velocity constraints are solved with pseudo velocities and a fraction
of the position error is added to the pseudo velocity error. The pseudo
velocities are initialized to zero and there is no warm-starting. After
the position solver, the pseudo velocities are added to the positions.
This is also called the First Order World method or the Position LCP method.

Modified Nonlinear Gauss-Seidel (NGS) - Like Pseudo Velocities except the
position error is re-computed for each constraint and the positions are updated
after the constraint is solved. The radius vectors (aka Jacobians) are
re-computed too (otherwise the algorithm has horrible instability). The pseudo
velocity states are not needed because they are effectively zero at the beginning
of each iteration. Since we have the current position error, we allow the
iterations to terminate early if the error becomes smaller than box2d.b2_linearSlop.

Full NGS or just NGS - Like Modified NGS except the effective mass are re-computed
each time a constraint is solved.

Here are the results:
Baumgarte - this is the cheapest algorithm but it has some stability problems,
especially with the bridge. The chain links separate easily close to the root
and they jitter as they struggle to pull together. This is one of the most common
methods in the field. The big drawback is that the position correction artificially
affects the momentum, thus leading to instabilities and false bounce. I used a
bias factor of 0.2. A larger bias factor makes the bridge less stable, a smaller
factor makes joints and contacts more spongy.

Pseudo Velocities - the is more stable than the Baumgarte method. The bridge is
stable. However, joints still separate with large angular velocities. Drag the
simple pendulum in a circle quickly and the joint will separate. The chain separates
easily and does not recover. I used a bias factor of 0.2. A larger value lead to
the bridge collapsing when a heavy cube drops on it.

Modified NGS - this algorithm is better in some ways than Baumgarte and Pseudo
Velocities, but in other ways it is worse. The bridge and chain are much more
stable, but the simple pendulum goes unstable at high angular velocities.

Full NGS - stable in all tests. The joints display good stiffness. The bridge
still sags, but this is better than infinite forces.

Recommendations
Pseudo Velocities are not really worthwhile because the bridge and chain cannot
recover from joint separation. In other cases the benefit over Baumgarte is small.

Modified NGS is not a robust method for the revolute joint due to the violent
instability seen in the simple pendulum. Perhaps it is viable with other constraint
types, especially scalar constraints where the effective mass is a scalar.

This leaves Baumgarte and Full NGS. Baumgarte has small, but manageable instabilities
and is very fast. I don't think we can escape Baumgarte, especially in highly
demanding cases where high constraint fidelity is not needed.

Full NGS is robust and easy on the eyes. I recommend this as an option for
higher fidelity simulation and certainly for suspension bridges and long chains.
Full NGS might be a good choice for ragdolls, especially motorized ragdolls where
joint separation can be problematic. The number of NGS iterations can be reduced
for better performance without harming robustness much.

Each joint in a can be handled differently in the position solver. So I recommend
a system where the user can select the algorithm on a per joint basis. I would
probably default to the slower Full NGS and let the user select the faster
Baumgarte method in performance critical scenarios.
*/

/*
Cache Performance

The Box2D solvers are dominated by cache misses. Data structures are designed
to increase the number of cache hits. Much of misses are due to random access
to body data. The constraint structures are iterated over linearly, which leads
to few cache misses.

The bodies are not accessed during iteration. Instead read only data, such as
the mass values are stored with the constraints. The mutable data are the constraint
impulses and the bodies velocities/positions. The impulses are held inside the
constraint structures. The body velocities/positions are held in compact, temporary
arrays to increase the number of cache hits. Linear and angular velocity are
stored in a single array since multiple arrays lead to multiple misses.
*/

/*
2D Rotation

R = [cos(theta) -sin(theta)]
    [sin(theta) cos(theta) ]

thetaDot = omega

Let q1 = cos(theta), q2 = sin(theta).
R = [q1 -q2]
    [q2  q1]

q1Dot = -thetaDot * q2
q2Dot = thetaDot * q1

q1_new = q1_old - dt * w * q2
q2_new = q2_old + dt * w * q1
then normalize.

This might be faster than computing sin+cos.
However, we can compute sin+cos of the same angle fast.
*/

/**
 * This is an internal class.
 * @export
 * @constructor
 */
box2d.b2Island = function() {
  this.m_bodies = new Array(1024); // TODO: b2Settings
  this.m_contacts = new Array(1024); // TODO: b2Settings
  this.m_joints = new Array(1024); // TODO: b2Settings

  this.m_positions = box2d.b2Position.MakeArray(1024); // TODO: b2Settings
  this.m_velocities = box2d.b2Velocity.MakeArray(1024); // TODO: b2Settings
}

/**
 * @export
 * @type {*}
 */
box2d.b2Island.prototype.m_allocator = null;
/**
 * @export
 * @type {box2d.b2ContactListener}
 */
box2d.b2Island.prototype.m_listener = null;

/**
 * @export
 * @type {Array.<box2d.b2Body>}
 */
box2d.b2Island.prototype.m_bodies = null;
/**
 * @export
 * @type {Array.<box2d.b2Contact>}
 */
box2d.b2Island.prototype.m_contacts = null;
/**
 * @export
 * @type {Array.<box2d.b2Joint>}
 */
box2d.b2Island.prototype.m_joints = null;

/**
 * @export
 * @type {Array.<box2d.b2Position>}
 */
box2d.b2Island.prototype.m_positions = null;
/**
 * @export
 * @type {Array.<box2d.b2Velocity>}
 */
box2d.b2Island.prototype.m_velocities = null;

/**
 * @export
 * @type {number}
 */
box2d.b2Island.prototype.m_bodyCount = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2Island.prototype.m_jointCount = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2Island.prototype.m_contactCount = 0;

/**
 * @export
 * @type {number}
 */
box2d.b2Island.prototype.m_bodyCapacity = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2Island.prototype.m_contactCapacity = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2Island.prototype.m_jointCapacity = 0;

/**
 * @export
 * @return {void}
 * @param {number} bodyCapacity
 * @param {number} contactCapacity
 * @param {number} jointCapacity
 * @param allocator
 * @param {box2d.b2ContactListener} listener
 */
box2d.b2Island.prototype.Initialize = function(bodyCapacity, contactCapacity, jointCapacity, allocator, listener) {
  this.m_bodyCapacity = bodyCapacity;
  this.m_contactCapacity = contactCapacity;
  this.m_jointCapacity = jointCapacity;
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0;

  this.m_allocator = allocator;
  this.m_listener = listener;

  // TODO:
  while (this.m_bodies.length < bodyCapacity) {
    this.m_bodies[this.m_bodies.length] = null;
  }
  // TODO:
  while (this.m_contacts.length < contactCapacity) {
    this.m_contacts[this.m_contacts.length] = null;
  }
  // TODO:
  while (this.m_joints.length < jointCapacity) {
    this.m_joints[this.m_joints.length] = null;
  }

  // TODO:
  if (this.m_positions.length < bodyCapacity) {
    var new_length = box2d.b2Max(this.m_positions.length * 2, bodyCapacity);

    if (box2d.DEBUG) {
      window.console.log("box2d.b2Island.m_positions: " + new_length);
    }

    while (this.m_positions.length < new_length) {
      this.m_positions[this.m_positions.length] = new box2d.b2Position();
    }
  }
  // TODO:
  if (this.m_velocities.length < bodyCapacity) {
    var new_length = box2d.b2Max(this.m_velocities.length * 2, bodyCapacity);

    if (box2d.DEBUG) {
      window.console.log("box2d.b2Island.m_velocities: " + new_length);
    }

    while (this.m_velocities.length < new_length) {
      this.m_velocities[this.m_velocities.length] = new box2d.b2Velocity();
    }
  }
}

/**
 * @export
 * @return {void}
 */
box2d.b2Island.prototype.Clear = function() {
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0;
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2Body} body
 */
box2d.b2Island.prototype.AddBody = function(body) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(this.m_bodyCount < this.m_bodyCapacity);
  }
  body.m_islandIndex = this.m_bodyCount;
  this.m_bodies[this.m_bodyCount++] = body;
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2Contact} contact
 */
box2d.b2Island.prototype.AddContact = function(contact) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(this.m_contactCount < this.m_contactCapacity);
  }
  this.m_contacts[this.m_contactCount++] = contact;
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2Joint} joint
 */
box2d.b2Island.prototype.AddJoint = function(joint) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(this.m_jointCount < this.m_jointCapacity);
  }
  this.m_joints[this.m_jointCount++] = joint;
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2Profile} profile
 * @param {box2d.b2TimeStep} step
 * @param {box2d.b2Vec2} gravity
 * @param {boolean} allowSleep
 */
box2d.b2Island.prototype.Solve = function(profile, step, gravity, allowSleep) {
  /*box2d.b2Timer*/
  var timer = box2d.b2Island.s_timer.Reset();

  /*float32*/
  var h = step.dt;

  // Integrate velocities and apply damping. Initialize the body state.
  for (var i = 0; i < this.m_bodyCount; ++i) {
    /*box2d.b2Body*/
    var b = this.m_bodies[i];

    /*box2d.b2Vec2&*/
    var c = this.m_positions[i].c.Copy(b.m_sweep.c);
    /*float32*/
    var a = b.m_sweep.a;
    /*box2d.b2Vec2&*/
    var v = this.m_velocities[i].v.Copy(b.m_linearVelocity);
    /*float32*/
    var w = b.m_angularVelocity;

    // Store positions for continuous collision.
    b.m_sweep.c0.Copy(b.m_sweep.c);
    b.m_sweep.a0 = b.m_sweep.a;

    if (b.m_type === box2d.b2BodyType.b2_dynamicBody) {
      // Integrate velocities.
      v.x += h * (b.m_gravityScale * gravity.x + b.m_invMass * b.m_force.x);
      v.y += h * (b.m_gravityScale * gravity.y + b.m_invMass * b.m_force.y);
      w += h * b.m_invI * b.m_torque;

      // Apply damping.
      // ODE: dv/dt + c * v = 0
      // Solution: v(t) = v0 * exp(-c * t)
      // Time step: v(t + dt) = v0 * exp(-c * (t + dt)) = v0 * exp(-c * t) * exp(-c * dt) = v * exp(-c * dt)
      // v2 = exp(-c * dt) * v1
      // Pade approximation:
      // v2 = v1 * 1 / (1 + c * dt)
      v.SelfMul(1.0 / (1.0 + h * b.m_linearDamping));
      w *= 1.0 / (1.0 + h * b.m_angularDamping);
    }

    //		this.m_positions[i].c = c;
    this.m_positions[i].a = a;
    //		this.m_velocities[i].v = v;
    this.m_velocities[i].w = w;
  }

  timer.Reset();

  // Solver data
  /*box2d.b2SolverData*/
  var solverData = box2d.b2Island.s_solverData;
  solverData.step.Copy(step);
  solverData.positions = this.m_positions;
  solverData.velocities = this.m_velocities;

  // Initialize velocity constraints.
  /*box2d.b2ContactSolverDef*/
  var contactSolverDef = box2d.b2Island.s_contactSolverDef;
  contactSolverDef.step.Copy(step);
  contactSolverDef.contacts = this.m_contacts;
  contactSolverDef.count = this.m_contactCount;
  contactSolverDef.positions = this.m_positions;
  contactSolverDef.velocities = this.m_velocities;
  contactSolverDef.allocator = this.m_allocator;

  /*box2d.b2ContactSolver*/
  var contactSolver = box2d.b2Island.s_contactSolver.Initialize(contactSolverDef);
  contactSolver.InitializeVelocityConstraints();

  if (step.warmStarting) {
    contactSolver.WarmStart();
  }

  for (var i = 0; i < this.m_jointCount; ++i) {
    this.m_joints[i].InitVelocityConstraints(solverData);
  }

  profile.solveInit = timer.GetMilliseconds();

  // Solve velocity constraints.
  timer.Reset();
  for (var i = 0; i < step.velocityIterations; ++i) {
    for (var j = 0; j < this.m_jointCount; ++j) {
      this.m_joints[j].SolveVelocityConstraints(solverData);
    }

    contactSolver.SolveVelocityConstraints();
  }

  // Store impulses for warm starting
  contactSolver.StoreImpulses();
  profile.solveVelocity = timer.GetMilliseconds();

  // Integrate positions.
  for (var i = 0; i < this.m_bodyCount; ++i) {
    /*box2d.b2Vec2&*/
    var c = this.m_positions[i].c;
    /*float32*/
    var a = this.m_positions[i].a;
    /*box2d.b2Vec2&*/
    var v = this.m_velocities[i].v;
    /*float32*/
    var w = this.m_velocities[i].w;

    // Check for large velocities
    /*box2d.b2Vec2*/
    var translation = box2d.b2Mul_S_V2(h, v, box2d.b2Island.s_translation);
    if (box2d.b2Dot_V2_V2(translation, translation) > box2d.b2_maxTranslationSquared) {
      /*float32*/
      var ratio = box2d.b2_maxTranslation / translation.Length();
      v.SelfMul(ratio);
    }

    /*float32*/
    var rotation = h * w;
    if (rotation * rotation > box2d.b2_maxRotationSquared) {
      /*float32*/
      var ratio = box2d.b2_maxRotation / box2d.b2Abs(rotation);
      w *= ratio;
    }

    // Integrate
    c.x += h * v.x;
    c.y += h * v.y;
    a += h * w;

    //		this.m_positions[i].c = c;
    this.m_positions[i].a = a;
    //		this.m_velocities[i].v = v;
    this.m_velocities[i].w = w;
  }

  // Solve position constraints
  timer.Reset();
  /*bool*/
  var positionSolved = false;
  for (var i = 0; i < step.positionIterations; ++i) {
    /*bool*/
    var contactsOkay = contactSolver.SolvePositionConstraints();

    /*bool*/
    var jointsOkay = true;
    for (var j = 0; j < this.m_jointCount; ++j) {
      /*bool*/
      var jointOkay = this.m_joints[j].SolvePositionConstraints(solverData);
      jointsOkay = jointsOkay && jointOkay;
    }

    if (contactsOkay && jointsOkay) {
      // Exit early if the position errors are small.
      positionSolved = true;
      break;
    }
  }

  // Copy state buffers back to the bodies
  for (var i = 0; i < this.m_bodyCount; ++i) {
    /** @type {box2d.b2Body} */
    var body = this.m_bodies[i];
    body.m_sweep.c.Copy(this.m_positions[i].c);
    body.m_sweep.a = this.m_positions[i].a;
    body.m_linearVelocity.Copy(this.m_velocities[i].v);
    body.m_angularVelocity = this.m_velocities[i].w;
    body.SynchronizeTransform();
  }

  profile.solvePosition = timer.GetMilliseconds();

  this.Report(contactSolver.m_velocityConstraints);

  if (allowSleep) {
    /*float32*/
    var minSleepTime = box2d.b2_maxFloat;

    /*float32*/
    var linTolSqr = box2d.b2_linearSleepTolerance * box2d.b2_linearSleepTolerance;
    /*float32*/
    var angTolSqr = box2d.b2_angularSleepTolerance * box2d.b2_angularSleepTolerance;

    for (var i = 0; i < this.m_bodyCount; ++i) {
      /*box2d.b2Body*/
      var b = this.m_bodies[i];
      if (b.GetType() === box2d.b2BodyType.b2_staticBody) {
        continue;
      }

      if (!b.m_flag_autoSleepFlag ||
        b.m_angularVelocity * b.m_angularVelocity > angTolSqr ||
        box2d.b2Dot_V2_V2(b.m_linearVelocity, b.m_linearVelocity) > linTolSqr) {
        b.m_sleepTime = 0;
        minSleepTime = 0;
      } else {
        b.m_sleepTime += h;
        minSleepTime = box2d.b2Min(minSleepTime, b.m_sleepTime);
      }
    }

    if (minSleepTime >= box2d.b2_timeToSleep && positionSolved) {
      for (var i = 0; i < this.m_bodyCount; ++i) {
        /*box2d.b2Body*/
        var b = this.m_bodies[i];
        b.SetAwake(false);
      }
    }
  }
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2TimeStep} subStep
 * @param {number} toiIndexA
 * @param {number} toiIndexB
 */
box2d.b2Island.prototype.SolveTOI = function(subStep, toiIndexA, toiIndexB) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(toiIndexA < this.m_bodyCount);
  }
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(toiIndexB < this.m_bodyCount);
  }

  // Initialize the body state.
  for (var i = 0; i < this.m_bodyCount; ++i) {
    /*box2d.b2Body*/
    var b = this.m_bodies[i];
    this.m_positions[i].c.Copy(b.m_sweep.c);
    this.m_positions[i].a = b.m_sweep.a;
    this.m_velocities[i].v.Copy(b.m_linearVelocity);
    this.m_velocities[i].w = b.m_angularVelocity;
  }

  /*box2d.b2ContactSolverDef*/
  var contactSolverDef = box2d.b2Island.s_contactSolverDef;
  contactSolverDef.contacts = this.m_contacts;
  contactSolverDef.count = this.m_contactCount;
  contactSolverDef.allocator = this.m_allocator;
  contactSolverDef.step.Copy(subStep);
  contactSolverDef.positions = this.m_positions;
  contactSolverDef.velocities = this.m_velocities;
  /*box2d.b2ContactSolver*/
  var contactSolver = box2d.b2Island.s_contactSolver.Initialize(contactSolverDef);

  // Solve position constraints.
  for (var i = 0; i < subStep.positionIterations; ++i) {
    /*bool*/
    var contactsOkay = contactSolver.SolveTOIPositionConstraints(toiIndexA, toiIndexB);
    if (contactsOkay) {
      break;
    }
  }

  /*
  #if 0
  	// Is the new position really safe?
  	for (int32 i = 0; i < this.m_contactCount; ++i)
  	{
  		box2d.b2Contact* c = this.m_contacts[i];
  		box2d.b2Fixture* fA = c.GetFixtureA();
  		box2d.b2Fixture* fB = c.GetFixtureB();

  		box2d.b2Body* bA = fA.GetBody();
  		box2d.b2Body* bB = fB.GetBody();

  		int32 indexA = c.GetChildIndexA();
  		int32 indexB = c.GetChildIndexB();

  		box2d.b2DistanceInput input;
  		input.proxyA.Set(fA.GetShape(), indexA);
  		input.proxyB.Set(fB.GetShape(), indexB);
  		input.transformA = bA.GetTransform();
  		input.transformB = bB.GetTransform();
  		input.useRadii = false;

  		box2d.b2DistanceOutput output;
  		box2d.b2SimplexCache cache;
  		cache.count = 0;
  		box2d.b2Distance(&output, &cache, &input);

  		if (output.distance === 0 || cache.count === 3)
  		{
  			cache.count += 0;
  		}
  	}
  #endif
  */

  // Leap of faith to new safe state.
  this.m_bodies[toiIndexA].m_sweep.c0.Copy(this.m_positions[toiIndexA].c);
  this.m_bodies[toiIndexA].m_sweep.a0 = this.m_positions[toiIndexA].a;
  this.m_bodies[toiIndexB].m_sweep.c0.Copy(this.m_positions[toiIndexB].c);
  this.m_bodies[toiIndexB].m_sweep.a0 = this.m_positions[toiIndexB].a;

  // No warm starting is needed for TOI events because warm
  // starting impulses were applied in the discrete solver.
  contactSolver.InitializeVelocityConstraints();

  // Solve velocity constraints.
  for (var i = 0; i < subStep.velocityIterations; ++i) {
    contactSolver.SolveVelocityConstraints();
  }

  // Don't store the TOI contact forces for warm starting
  // because they can be quite large.

  /*float32*/
  var h = subStep.dt;

  // Integrate positions
  for (var i = 0; i < this.m_bodyCount; ++i) {
    /*box2d.b2Vec2&*/
    var c = this.m_positions[i].c;
    /*float32*/
    var a = this.m_positions[i].a;
    /*box2d.b2Vec2&*/
    var v = this.m_velocities[i].v;
    /*float32*/
    var w = this.m_velocities[i].w;

    // Check for large velocities
    /*box2d.b2Vec2*/
    var translation = box2d.b2Mul_S_V2(h, v, box2d.b2Island.s_translation);
    if (box2d.b2Dot_V2_V2(translation, translation) > box2d.b2_maxTranslationSquared) {
      /*float32*/
      var ratio = box2d.b2_maxTranslation / translation.Length();
      v.SelfMul(ratio);
    }

    /*float32*/
    var rotation = h * w;
    if (rotation * rotation > box2d.b2_maxRotationSquared) {
      /*float32*/
      var ratio = box2d.b2_maxRotation / box2d.b2Abs(rotation);
      w *= ratio;
    }

    // Integrate
    c.SelfMulAdd(h, v);
    a += h * w;

    //		this.m_positions[i].c = c;
    this.m_positions[i].a = a;
    //		this.m_velocities[i].v = v;
    this.m_velocities[i].w = w;

    // Sync bodies
    /*box2d.b2Body*/
    var body = this.m_bodies[i];
    body.m_sweep.c.Copy(c);
    body.m_sweep.a = a;
    body.m_linearVelocity.Copy(v);
    body.m_angularVelocity = w;
    body.SynchronizeTransform();
  }

  this.Report(contactSolver.m_velocityConstraints);
}

/**
 * @export
 * @return {void}
 * @param {Array.<box2d.b2ContactVelocityConstraint>} constraints
 */
box2d.b2Island.prototype.Report = function(constraints) {
  if (this.m_listener === null) {
    return;
  }

  for (var i = 0; i < this.m_contactCount; ++i) {
    /** @type {box2d.b2Contact} */
    var c = this.m_contacts[i];

    if (!c) {
      continue;
    }

    /** @type {box2d.b2ContactVelocityConstraint} */
    var vc = constraints[i];

    /*box2d.b2ContactImpulse*/
    var impulse = box2d.b2Island.s_impulse;
    impulse.count = vc.pointCount;
    for (var j = 0; j < vc.pointCount; ++j) {
      impulse.normalImpulses[j] = vc.points[j].normalImpulse;
      impulse.tangentImpulses[j] = vc.points[j].tangentImpulse;
    }

    this.m_listener.PostSolve(c, impulse);
  }
}

box2d.b2Island.s_timer = new box2d.b2Timer();
box2d.b2Island.s_solverData = new box2d.b2SolverData();
box2d.b2Island.s_contactSolverDef = new box2d.b2ContactSolverDef();
box2d.b2Island.s_contactSolver = new box2d.b2ContactSolver();
box2d.b2Island.s_translation = new box2d.b2Vec2();
box2d.b2Island.s_impulse = new box2d.b2ContactImpulse();
