/*
 * Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
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

goog.provide('box2d.b2WheelJoint');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Math');

/**
 * Wheel joint definition. This requires defining a line of
 * motion using an axis and an anchor point. The definition uses
 * local anchor points and a local axis so that the initial
 * configuration can violate the constraint slightly. The joint
 * translation is zero when the local anchor points coincide in
 * world space. Using local anchors and a local axis helps when
 * saving and loading a game.
 * @export
 * @constructor
 * @extends {box2d.b2JointDef}
 */
box2d.b2WheelJointDef = function() {
  box2d.b2JointDef.call(this, box2d.b2JointType.e_wheelJoint); // base class constructor

  this.localAnchorA = new box2d.b2Vec2(0, 0);
  this.localAnchorB = new box2d.b2Vec2(0, 0);
  this.localAxisA = new box2d.b2Vec2(1, 0);
}

goog.inherits(box2d.b2WheelJointDef, box2d.b2JointDef);

/**
 * The local anchor point relative to bodyA's origin.
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2WheelJointDef.prototype.localAnchorA = null;

/**
 * The local anchor point relative to bodyB's origin.
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2WheelJointDef.prototype.localAnchorB = null;

/**
 * The local translation axis in bodyA.
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2WheelJointDef.prototype.localAxisA = null;

/**
 * Enable/disable the joint motor.
 * @export
 * @type {boolean}
 */
box2d.b2WheelJointDef.prototype.enableMotor = false;

/**
 * The maximum motor torque, usually in N-m.
 * @export
 * @type {number}
 */
box2d.b2WheelJointDef.prototype.maxMotorTorque = 0;

/**
 * The desired motor speed in radians per second.
 * @export
 * @type {number}
 */
box2d.b2WheelJointDef.prototype.motorSpeed = 0;

/**
 * Suspension frequency, zero indicates no suspension
 * @export
 * @type {number}
 */
box2d.b2WheelJointDef.prototype.frequencyHz = 2;

/**
 * Suspension damping ratio, one indicates critical damping
 * @export
 * @type {number}
 */
box2d.b2WheelJointDef.prototype.dampingRatio = 0.7;

/**
 * @export
 * @return {void}
 * @param {box2d.b2Body} bA
 * @param {box2d.b2Body} bB
 * @param {box2d.b2Vec2} anchor
 * @param {box2d.b2Vec2} axis
 */
box2d.b2WheelJointDef.prototype.Initialize = function(bA, bB, anchor, axis) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
  this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
  this.bodyA.GetLocalVector(axis, this.localAxisA);
}

/**
 * A wheel joint. This joint provides two degrees of freedom:
 * translation along an axis fixed in bodyA and rotation in the
 * plane. In other words, it is a point to line constraint with
 * a rotational motor and a linear spring/damper.
 * This joint is designed for vehicle suspensions.
 * @export
 * @constructor
 * @extends {box2d.b2Joint}
 * @param {box2d.b2WheelJointDef} def
 */
box2d.b2WheelJoint = function(def) {
  box2d.b2Joint.call(this, def); // base class constructor

  this.m_frequencyHz = def.frequencyHz;
  this.m_dampingRatio = def.dampingRatio;

  this.m_localAnchorA = def.localAnchorA.Clone();
  this.m_localAnchorB = def.localAnchorB.Clone();
  this.m_localXAxisA = def.localAxisA.Clone();
  this.m_localYAxisA = box2d.b2Cross_S_V2(1.0, this.m_localXAxisA, new box2d.b2Vec2());

  this.m_maxMotorTorque = def.maxMotorTorque;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableMotor = def.enableMotor;

  this.m_localCenterA = new box2d.b2Vec2();
  this.m_localCenterB = new box2d.b2Vec2();

  this.m_ax = new box2d.b2Vec2(), this.m_ay = new box2d.b2Vec2();

  this.m_qA = new box2d.b2Rot();
  this.m_qB = new box2d.b2Rot();
  this.m_lalcA = new box2d.b2Vec2();
  this.m_lalcB = new box2d.b2Vec2();
  this.m_rA = new box2d.b2Vec2();
  this.m_rB = new box2d.b2Vec2();

  this.m_ax.SetZero();
  this.m_ay.SetZero();
}

goog.inherits(box2d.b2WheelJoint, box2d.b2Joint);

/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_frequencyHz = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_dampingRatio = 0;

// Solver shared
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2WheelJoint.prototype.m_localAnchorA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2WheelJoint.prototype.m_localAnchorB = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2WheelJoint.prototype.m_localXAxisA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2WheelJoint.prototype.m_localYAxisA = null;

/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_impulse = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_motorImpulse = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_springImpulse = 0;

/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_maxMotorTorque = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_motorSpeed = 0;
/**
 * @export
 * @type {boolean}
 */
box2d.b2WheelJoint.prototype.m_enableMotor = false;

// Solver temp
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_indexA = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_indexB = 0;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2WheelJoint.prototype.m_localCenterA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2WheelJoint.prototype.m_localCenterB = null;
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_invMassA = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_invMassB = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_invIA = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_invIB = 0;

/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2WheelJoint.prototype.m_ax = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2WheelJoint.prototype.m_ay = null;
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_sAx = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_sBx = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_sAy = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_sBy = 0;

/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_mass = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_motorMass = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_springMass = 0;

/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_bias = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2WheelJoint.prototype.m_gamma = 0;

/**
 * @export
 * @type {box2d.b2Rot}
 */
box2d.b2WheelJoint.prototype.m_qA = null;
/**
 * @export
 * @type {box2d.b2Rot}
 */
box2d.b2WheelJoint.prototype.m_qB = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2WheelJoint.prototype.m_lalcA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2WheelJoint.prototype.m_lalcB = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2WheelJoint.prototype.m_rA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2WheelJoint.prototype.m_rB = null;

/**
 * Get the motor speed, usually in radians per second.
 * @export
 * @return {number}
 */
box2d.b2WheelJoint.prototype.GetMotorSpeed = function() {
  return this.m_motorSpeed;
}

/**
 * @export
 * @return {number}
 */
box2d.b2WheelJoint.prototype.GetMaxMotorTorque = function() {
  return this.m_maxMotorTorque;
}

/**
 * @export
 * @return {void}
 * @param {number} hz
 */
box2d.b2WheelJoint.prototype.SetSpringFrequencyHz = function(hz) {
  this.m_frequencyHz = hz;
}

/**
 * @export
 * @return {number}
 */
box2d.b2WheelJoint.prototype.GetSpringFrequencyHz = function() {
  return this.m_frequencyHz;
}

/**
 * @export
 * @return {void}
 * @param {number} ratio
 */
box2d.b2WheelJoint.prototype.SetSpringDampingRatio = function(ratio) {
  this.m_dampingRatio = ratio;
}

/**
 * @export
 * @return {number}
 */
box2d.b2WheelJoint.prototype.GetSpringDampingRatio = function() {
  return this.m_dampingRatio;
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2SolverData} data
 */
box2d.b2WheelJoint.prototype.InitVelocityConstraints = function(data) {
  this.m_indexA = this.m_bodyA.m_islandIndex;
  this.m_indexB = this.m_bodyB.m_islandIndex;
  this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
  this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
  this.m_invMassA = this.m_bodyA.m_invMass;
  this.m_invMassB = this.m_bodyB.m_invMass;
  this.m_invIA = this.m_bodyA.m_invI;
  this.m_invIB = this.m_bodyB.m_invI;

  /*float32*/
  var mA = this.m_invMassA,
    mB = this.m_invMassB;
  /*float32*/
  var iA = this.m_invIA,
    iB = this.m_invIB;

  /*box2d.b2Vec2&*/
  var cA = data.positions[this.m_indexA].c;
  /*float32*/
  var aA = data.positions[this.m_indexA].a;
  /*box2d.b2Vec2&*/
  var vA = data.velocities[this.m_indexA].v;
  /*float32*/
  var wA = data.velocities[this.m_indexA].w;

  /*box2d.b2Vec2&*/
  var cB = data.positions[this.m_indexB].c;
  /*float32*/
  var aB = data.positions[this.m_indexB].a;
  /*box2d.b2Vec2&*/
  var vB = data.velocities[this.m_indexB].v;
  /*float32*/
  var wB = data.velocities[this.m_indexB].w;

  /*box2d.b2Rot*/
  var qA = this.m_qA.SetAngle(aA),
    qB = this.m_qB.SetAngle(aB);

  // Compute the effective masses.
  //  box2d.b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
  box2d.b2Sub_V2_V2(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
  var rA = box2d.b2Mul_R_V2(qA, this.m_lalcA, this.m_rA);
  //  box2d.b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
  box2d.b2Sub_V2_V2(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
  var rB = box2d.b2Mul_R_V2(qB, this.m_lalcB, this.m_rB);
  //  box2d.b2Vec2 d = cB + rB - cA - rA;
  var d = box2d.b2Sub_V2_V2(
    box2d.b2Add_V2_V2(cB, rB, box2d.b2Vec2.s_t0),
    box2d.b2Add_V2_V2(cA, rA, box2d.b2Vec2.s_t1),
    box2d.b2WheelJoint.prototype.InitVelocityConstraints.s_d);

  // Point to line constraint
  {
    //    m_ay = b2Mul(qA, m_localYAxisA);
    box2d.b2Mul_R_V2(qA, this.m_localYAxisA, this.m_ay);
    //    m_sAy = b2Cross(d + rA, m_ay);
    this.m_sAy = box2d.b2Cross_V2_V2(box2d.b2Add_V2_V2(d, rA, box2d.b2Vec2.s_t0), this.m_ay);
    //    m_sBy = b2Cross(rB, m_ay);
    this.m_sBy = box2d.b2Cross_V2_V2(rB, this.m_ay);

    this.m_mass = mA + mB + iA * this.m_sAy * this.m_sAy + iB * this.m_sBy * this.m_sBy;

    if (this.m_mass > 0) {
      this.m_mass = 1 / this.m_mass;
    }
  }

  // Spring constraint
  this.m_springMass = 0;
  this.m_bias = 0;
  this.m_gamma = 0;
  if (this.m_frequencyHz > 0) {
    //    m_ax = b2Mul(qA, m_localXAxisA);
    box2d.b2Mul_R_V2(qA, this.m_localXAxisA, this.m_ax);
    //    m_sAx = b2Cross(d + rA, m_ax);
    this.m_sAx = box2d.b2Cross_V2_V2(box2d.b2Add_V2_V2(d, rA, box2d.b2Vec2.s_t0), this.m_ax);
    //    m_sBx = b2Cross(rB, m_ax);
    this.m_sBx = box2d.b2Cross_V2_V2(rB, this.m_ax);

    /*float32*/
    var invMass = mA + mB + iA * this.m_sAx * this.m_sAx + iB * this.m_sBx * this.m_sBx;

    if (invMass > 0) {
      this.m_springMass = 1 / invMass;

      /*float32*/
      var C = box2d.b2Dot_V2_V2(d, this.m_ax);

      // Frequency
      /*float32*/
      var omega = 2 * box2d.b2_pi * this.m_frequencyHz;

      // Damping coefficient
      /*float32*/
      var dc = 2 * this.m_springMass * this.m_dampingRatio * omega;

      // Spring stiffness
      /*float32*/
      var k = this.m_springMass * omega * omega;

      // magic formulas
      /*float32*/
      var h = data.step.dt;
      this.m_gamma = h * (dc + h * k);
      if (this.m_gamma > 0) {
        this.m_gamma = 1 / this.m_gamma;
      }

      this.m_bias = C * h * k * this.m_gamma;

      this.m_springMass = invMass + this.m_gamma;
      if (this.m_springMass > 0) {
        this.m_springMass = 1 / this.m_springMass;
      }
    }
  } else {
    this.m_springImpulse = 0;
  }

  // Rotational motor
  if (this.m_enableMotor) {
    this.m_motorMass = iA + iB;
    if (this.m_motorMass > 0) {
      this.m_motorMass = 1 / this.m_motorMass;
    }
  } else {
    this.m_motorMass = 0;
    this.m_motorImpulse = 0;
  }

  if (data.step.warmStarting) {
    // Account for variable time step.
    this.m_impulse *= data.step.dtRatio;
    this.m_springImpulse *= data.step.dtRatio;
    this.m_motorImpulse *= data.step.dtRatio;

    //    box2d.b2Vec2 P = m_impulse * m_ay + m_springImpulse * m_ax;
    var P = box2d.b2Add_V2_V2(
      box2d.b2Mul_S_V2(this.m_impulse, this.m_ay, box2d.b2Vec2.s_t0),
      box2d.b2Mul_S_V2(this.m_springImpulse, this.m_ax, box2d.b2Vec2.s_t1),
      box2d.b2WheelJoint.prototype.InitVelocityConstraints.s_P);
    //    float32 LA = m_impulse * m_sAy + m_springImpulse * m_sAx + m_motorImpulse;
    /*float32*/
    var LA = this.m_impulse * this.m_sAy + this.m_springImpulse * this.m_sAx + this.m_motorImpulse;
    //    float32 LB = m_impulse * m_sBy + m_springImpulse * m_sBx + m_motorImpulse;
    /*float32*/
    var LB = this.m_impulse * this.m_sBy + this.m_springImpulse * this.m_sBx + this.m_motorImpulse;

    //    vA -= m_invMassA * P;
    vA.SelfMulSub(this.m_invMassA, P);
    wA -= this.m_invIA * LA;

    //    vB += m_invMassB * P;
    vB.SelfMulAdd(this.m_invMassB, P);
    wB += this.m_invIB * LB;
  } else {
    this.m_impulse = 0;
    this.m_springImpulse = 0;
    this.m_motorImpulse = 0;
  }

  //  data.velocities[this.m_indexA].v = vA;
  data.velocities[this.m_indexA].w = wA;
  //  data.velocities[this.m_indexB].v = vB;
  data.velocities[this.m_indexB].w = wB;
}
box2d.b2WheelJoint.prototype.InitVelocityConstraints.s_d = new box2d.b2Vec2();
box2d.b2WheelJoint.prototype.InitVelocityConstraints.s_P = new box2d.b2Vec2();

/**
 * @export
 * @return {void}
 * @param {box2d.b2SolverData} data
 */
box2d.b2WheelJoint.prototype.SolveVelocityConstraints = function(data) {
  /*float32*/
  var mA = this.m_invMassA,
    mB = this.m_invMassB;
  /*float32*/
  var iA = this.m_invIA,
    iB = this.m_invIB;

  /*box2d.b2Vec2&*/
  var vA = data.velocities[this.m_indexA].v;
  /*float32*/
  var wA = data.velocities[this.m_indexA].w;
  /*box2d.b2Vec2&*/
  var vB = data.velocities[this.m_indexB].v;
  /*float32*/
  var wB = data.velocities[this.m_indexB].w;

  // Solve spring constraint
  {
    /*float32*/
    var Cdot = box2d.b2Dot_V2_V2(this.m_ax, box2d.b2Sub_V2_V2(vB, vA, box2d.b2Vec2.s_t0)) + this.m_sBx * wB - this.m_sAx * wA;
    /*float32*/
    var impulse = -this.m_springMass * (Cdot + this.m_bias + this.m_gamma * this.m_springImpulse);
    this.m_springImpulse += impulse;

    //    box2d.b2Vec2 P = impulse * m_ax;
    var P = box2d.b2Mul_S_V2(impulse, this.m_ax, box2d.b2WheelJoint.prototype.SolveVelocityConstraints.s_P);
    /*float32*/
    var LA = impulse * this.m_sAx;
    /*float32*/
    var LB = impulse * this.m_sBx;

    //    vA -= mA * P;
    vA.SelfMulSub(mA, P);
    wA -= iA * LA;

    //    vB += mB * P;
    vB.SelfMulAdd(mB, P);
    wB += iB * LB;
  }

  // Solve rotational motor constraint
  {
    /*float32*/
    var Cdot = wB - wA - this.m_motorSpeed;
    /*float32*/
    var impulse = -this.m_motorMass * Cdot;

    /*float32*/
    var oldImpulse = this.m_motorImpulse;
    /*float32*/
    var maxImpulse = data.step.dt * this.m_maxMotorTorque;
    this.m_motorImpulse = box2d.b2Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;

    wA -= iA * impulse;
    wB += iB * impulse;
  }

  // Solve point to line constraint
  {
    /*float32*/
    var Cdot = box2d.b2Dot_V2_V2(this.m_ay, box2d.b2Sub_V2_V2(vB, vA, box2d.b2Vec2.s_t0)) + this.m_sBy * wB - this.m_sAy * wA;
    /*float32*/
    var impulse = -this.m_mass * Cdot;
    this.m_impulse += impulse;

    //    box2d.b2Vec2 P = impulse * m_ay;
    var P = box2d.b2Mul_S_V2(impulse, this.m_ay, box2d.b2WheelJoint.prototype.SolveVelocityConstraints.s_P);
    /*float32*/
    var LA = impulse * this.m_sAy;
    /*float32*/
    var LB = impulse * this.m_sBy;

    //    vA -= mA * P;
    vA.SelfMulSub(mA, P);
    wA -= iA * LA;

    //    vB += mB * P;
    vB.SelfMulAdd(mB, P);
    wB += iB * LB;
  }

  //  data.velocities[this.m_indexA].v = vA;
  data.velocities[this.m_indexA].w = wA;
  //  data.velocities[this.m_indexB].v = vB;
  data.velocities[this.m_indexB].w = wB;
}
box2d.b2WheelJoint.prototype.SolveVelocityConstraints.s_P = new box2d.b2Vec2();

/**
 * @export
 * @return {boolean}
 * @param {box2d.b2SolverData} data
 */
box2d.b2WheelJoint.prototype.SolvePositionConstraints = function(data) {
  /*box2d.b2Vec2&*/
  var cA = data.positions[this.m_indexA].c;
  /*float32*/
  var aA = data.positions[this.m_indexA].a;
  /*box2d.b2Vec2&*/
  var cB = data.positions[this.m_indexB].c;
  /*float32*/
  var aB = data.positions[this.m_indexB].a;

  /*box2d.b2Rot*/
  var qA = this.m_qA.SetAngle(aA),
    qB = this.m_qB.SetAngle(aB);

  //  box2d.b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
  box2d.b2Sub_V2_V2(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
  var rA = box2d.b2Mul_R_V2(qA, this.m_lalcA, this.m_rA);
  //  box2d.b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
  box2d.b2Sub_V2_V2(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
  var rB = box2d.b2Mul_R_V2(qB, this.m_lalcB, this.m_rB);
  //  box2d.b2Vec2 d = (cB - cA) + rB - rA;
  var d = box2d.b2Add_V2_V2(
    box2d.b2Sub_V2_V2(cB, cA, box2d.b2Vec2.s_t0),
    box2d.b2Sub_V2_V2(rB, rA, box2d.b2Vec2.s_t1),
    box2d.b2WheelJoint.prototype.SolvePositionConstraints.s_d);

  //  box2d.b2Vec2 ay = b2Mul(qA, m_localYAxisA);
  var ay = box2d.b2Mul_R_V2(qA, this.m_localYAxisA, this.m_ay);

  //  float32 sAy = b2Cross(d + rA, ay);
  var sAy = box2d.b2Cross_V2_V2(box2d.b2Add_V2_V2(d, rA, box2d.b2Vec2.s_t0), ay);
  //  float32 sBy = b2Cross(rB, ay);
  var sBy = box2d.b2Cross_V2_V2(rB, ay);

  //  float32 C = b2Dot(d, ay);
  var C = box2d.b2Dot_V2_V2(d, this.m_ay);

  /*float32*/
  var k = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_sAy * this.m_sAy + this.m_invIB * this.m_sBy * this.m_sBy;

  /*float32*/
  var impulse;
  if (k !== 0) {
    impulse = -C / k;
  } else {
    impulse = 0;
  }

  //  box2d.b2Vec2 P = impulse * ay;
  var P = box2d.b2Mul_S_V2(impulse, ay, box2d.b2WheelJoint.prototype.SolvePositionConstraints.s_P);
  /*float32*/
  var LA = impulse * sAy;
  /*float32*/
  var LB = impulse * sBy;

  //  cA -= m_invMassA * P;
  cA.SelfMulSub(this.m_invMassA, P);
  aA -= this.m_invIA * LA;
  //  cB += m_invMassB * P;
  cB.SelfMulAdd(this.m_invMassB, P);
  aB += this.m_invIB * LB;

  //  data.positions[this.m_indexA].c = cA;
  data.positions[this.m_indexA].a = aA;
  //  data.positions[this.m_indexB].c = cB;
  data.positions[this.m_indexB].a = aB;

  return box2d.b2Abs(C) <= box2d.b2_linearSlop;
}
box2d.b2WheelJoint.prototype.SolvePositionConstraints.s_d = new box2d.b2Vec2();
box2d.b2WheelJoint.prototype.SolvePositionConstraints.s_P = new box2d.b2Vec2();

/**
 * @export
 * @return {box2d.b2WheelJointDef}
 * @param {box2d.b2WheelJointDef} def
 */
box2d.b2WheelJoint.prototype.GetDefinition = function(def) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(false);
  } // TODO
  return def;
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2WheelJoint.prototype.GetAnchorA = function(out) {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2WheelJoint.prototype.GetAnchorB = function(out) {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {number} inv_dt
 * @param {box2d.b2Vec2} out
 */
box2d.b2WheelJoint.prototype.GetReactionForce = function(inv_dt, out) {
  //  return inv_dt * (m_impulse * m_ay + m_springImpulse * m_ax);
  out.x = inv_dt * (this.m_impulse * this.m_ay.x + this.m_springImpulse * this.m_ax.x);
  out.y = inv_dt * (this.m_impulse * this.m_ay.y + this.m_springImpulse * this.m_ax.y);
  return out;
}

/**
 * @export
 * @return {number}
 * @param {number} inv_dt
 */
box2d.b2WheelJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_motorImpulse;
}

/**
 * The local anchor point relative to bodyA's origin.
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2WheelJoint.prototype.GetLocalAnchorA = function(out) {
  return out.Copy(this.m_localAnchorA);
}

/**
 * The local anchor point relative to bodyB's origin.
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2WheelJoint.prototype.GetLocalAnchorB = function(out) {
  return out.Copy(this.m_localAnchorB);
}

/**
 * The local joint axis relative to bodyA.
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2WheelJoint.prototype.GetLocalAxisA = function(out) {
  return out.Copy(this.m_localXAxisA);
}

/**
 * @export
 * @return {number}
 */
box2d.b2WheelJoint.prototype.GetJointTranslation = function() {
  return this.GetPrismaticJointTranslation();
}

/**
 * @export
 * @return {number}
 */
box2d.b2WheelJoint.prototype.GetJointSpeed = function() {
  return this.GetRevoluteJointSpeed();
}

/**
 * @export
 * @return {number}
 */
box2d.b2WheelJoint.prototype.GetPrismaticJointTranslation = function() {
  /*box2d.b2Body*/
  var bA = this.m_bodyA;
  /*box2d.b2Body*/
  var bB = this.m_bodyB;

  /*box2d.b2Vec2*/
  var pA = bA.GetWorldPoint(this.m_localAnchorA, new box2d.b2Vec2());
  /*box2d.b2Vec2*/
  var pB = bB.GetWorldPoint(this.m_localAnchorB, new box2d.b2Vec2());
  /*box2d.b2Vec2*/
  var d = box2d.b2Sub_V2_V2(pB, pA, new box2d.b2Vec2());
  /*box2d.b2Vec2*/
  var axis = bA.GetWorldVector(this.m_localXAxisA, new box2d.b2Vec2());

  /*float32*/
  var translation = box2d.b2Dot_V2_V2(d, axis);
  return translation;
}

/**
 * @export
 * @return {number}
 */
box2d.b2WheelJoint.prototype.GetPrismaticJointSpeed = function() {
  /*box2d.b2Body*/
  var bA = this.m_bodyA;
  /*box2d.b2Body*/
  var bB = this.m_bodyB;

  //  b2Vec2 rA = b2Mul(bA->m_xf.q, m_localAnchorA - bA->m_sweep.localCenter);
  box2d.b2Sub_V2_V2(this.m_localAnchorA, bA.m_sweep.localCenter, this.m_lalcA);
  var rA = box2d.b2Mul_R_V2(bA.m_xf.q, this.m_lalcA, this.m_rA);
  //  b2Vec2 rB = b2Mul(bB->m_xf.q, m_localAnchorB - bB->m_sweep.localCenter);
  box2d.b2Sub_V2_V2(this.m_localAnchorB, bB.m_sweep.localCenter, this.m_lalcB);
  var rB = box2d.b2Mul_R_V2(bB.m_xf.q, this.m_lalcB, this.m_rB);
  //  b2Vec2 pA = bA->m_sweep.c + rA;
  var pA = box2d.b2Add_V2_V2(bA.m_sweep.c, rA, box2d.b2Vec2.s_t0); // pA uses s_t0
  //  b2Vec2 pB = bB->m_sweep.c + rB;
  var pB = box2d.b2Add_V2_V2(bB.m_sweep.c, rB, box2d.b2Vec2.s_t1); // pB uses s_t1
  //  b2Vec2 d = pB - pA;
  var d = box2d.b2Sub_V2_V2(pB, pA, box2d.b2Vec2.s_t2); // d uses s_t2
  //  b2Vec2 axis = b2Mul(bA.m_xf.q, m_localXAxisA);
  var axis = bA.GetWorldVector(this.m_localXAxisA, new box2d.b2Vec2());

  var vA = bA.m_linearVelocity;
  var vB = bB.m_linearVelocity;
  var wA = bA.m_angularVelocity;
  var wB = bB.m_angularVelocity;

  //  float32 speed = b2Dot(d, b2Cross(wA, axis)) + b2Dot(axis, vB + b2Cross(wB, rB) - vA - b2Cross(wA, rA));
  var speed =
    box2d.b2Dot_V2_V2(d, box2d.b2Cross_S_V2(wA, axis, box2d.b2Vec2.s_t0)) +
    box2d.b2Dot_V2_V2(
      axis,
      box2d.b2Sub_V2_V2(
        box2d.b2AddCross_V2_S_V2(vB, wB, rB, box2d.b2Vec2.s_t0),
        box2d.b2AddCross_V2_S_V2(vA, wA, rA, box2d.b2Vec2.s_t1),
        box2d.b2Vec2.s_t0));
  return speed;
}

/**
 * @export
 * @return {number}
 */
box2d.b2WheelJoint.prototype.GetRevoluteJointAngle = function() {
  //  b2Body* bA = this.m_bodyA;
  //  b2Body* bB = this.m_bodyB;
  //  return bB->this.m_sweep.a - bA->this.m_sweep.a;
  return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a;
}

/**
 * @export
 * @return {number}
 */
box2d.b2WheelJoint.prototype.GetRevoluteJointSpeed = function() {
  /*float32*/
  var wA = this.m_bodyA.m_angularVelocity;
  /*float32*/
  var wB = this.m_bodyB.m_angularVelocity;
  return wB - wA;
}

/**
 * @export
 * @return {boolean}
 */
box2d.b2WheelJoint.prototype.IsMotorEnabled = function() {
  return this.m_enableMotor;
}

/**
 * @export
 * @return {void}
 * @param {boolean} flag
 */
box2d.b2WheelJoint.prototype.EnableMotor = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableMotor = flag;
}

/**
 * Set the motor speed, usually in radians per second.
 * @export
 * @return {void}
 * @param {number} speed
 */
box2d.b2WheelJoint.prototype.SetMotorSpeed = function(speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed;
}

/**
 * Set/Get the maximum motor force, usually in N-m.
 * @export
 * @return {void}
 * @param {number} force
 */
box2d.b2WheelJoint.prototype.SetMaxMotorTorque = function(force) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_maxMotorTorque = force;
}

/**
 * Get the current motor torque given the inverse time step,
 * usually in N-m.
 * @export
 * @return {number}
 * @param {number} inv_dt
 */
box2d.b2WheelJoint.prototype.GetMotorTorque = function(inv_dt) {
  return inv_dt * this.m_motorImpulse;
}

/**
 * Dump to b2Log
 * @export
 * @return {void}
 */
box2d.b2WheelJoint.prototype.Dump = function() {
  if (box2d.DEBUG) {
    var indexA = this.m_bodyA.m_islandIndex;
    var indexB = this.m_bodyB.m_islandIndex;

    box2d.b2Log("  /*box2d.b2WheelJointDef*/ var jd = new box2d.b2WheelJointDef();\n");
    box2d.b2Log("  jd.bodyA = bodies[%d];\n", indexA);
    box2d.b2Log("  jd.bodyB = bodies[%d];\n", indexB);
    box2d.b2Log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ('true') : ('false'));
    box2d.b2Log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
    box2d.b2Log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
    box2d.b2Log("  jd.localAxisA.Set(%.15f, %.15f);\n", this.m_localXAxisA.x, this.m_localXAxisA.y);
    box2d.b2Log("  jd.enableMotor = %s;\n", (this.m_enableMotor) ? ('true') : ('false'));
    box2d.b2Log("  jd.motorSpeed = %.15f;\n", this.m_motorSpeed);
    box2d.b2Log("  jd.maxMotorTorque = %.15f;\n", this.m_maxMotorTorque);
    box2d.b2Log("  jd.frequencyHz = %.15f;\n", this.m_frequencyHz);
    box2d.b2Log("  jd.dampingRatio = %.15f;\n", this.m_dampingRatio);
    box2d.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
  }
}
