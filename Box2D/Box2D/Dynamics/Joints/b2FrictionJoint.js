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

goog.provide('box2d.b2FrictionJoint');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Joint');
goog.require('box2d.b2Math');

/** 
 * Friction joint definition. 
 * @export 
 * @constructor 
 * @extends {box2d.b2JointDef} 
 */
box2d.b2FrictionJointDef = function() {
  box2d.b2JointDef.call(this, box2d.b2JointType.e_frictionJoint); // base class constructor

  this.localAnchorA = new box2d.b2Vec2();
  this.localAnchorB = new box2d.b2Vec2();
}

goog.inherits(box2d.b2FrictionJointDef, box2d.b2JointDef);

/** 
 * The local anchor point relative to bodyA's origin. 
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2FrictionJointDef.prototype.localAnchorA = null;

/** 
 * The local anchor point relative to bodyB's origin. 
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2FrictionJointDef.prototype.localAnchorB = null;

/** 
 * The maximum friction force in N. 
 * @export 
 * @type {number}
 */
box2d.b2FrictionJointDef.prototype.maxForce = 0;

/** 
 * The maximum friction torque in N-m. 
 * @export 
 * @type {number}
 */
box2d.b2FrictionJointDef.prototype.maxTorque = 0;

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2Body} bA 
 * @param {box2d.b2Body} bB 
 * @param {box2d.b2Vec2} anchor 
 */
box2d.b2FrictionJointDef.prototype.Initialize = function(bA, bB, anchor) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
  this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
}

/** 
 * Friction joint. This is used for top-down friction. It 
 * provides 2D translational friction and angular friction. 
 * @export 
 * @constructor 
 * @extends {box2d.b2Joint} 
 * @param {box2d.b2FrictionJointDef} def 
 */
box2d.b2FrictionJoint = function(def) {
  box2d.b2Joint.call(this, def); // base class constructor

  this.m_localAnchorA = def.localAnchorA.Clone();
  this.m_localAnchorB = def.localAnchorB.Clone();

  this.m_linearImpulse = new box2d.b2Vec2().SetZero();
  this.m_maxForce = def.maxForce;
  this.m_maxTorque = def.maxTorque;

  this.m_rA = new box2d.b2Vec2();
  this.m_rB = new box2d.b2Vec2();
  this.m_localCenterA = new box2d.b2Vec2();
  this.m_localCenterB = new box2d.b2Vec2();
  this.m_linearMass = new box2d.b2Mat22().SetZero();

  this.m_qA = new box2d.b2Rot();
  this.m_qB = new box2d.b2Rot();
  this.m_lalcA = new box2d.b2Vec2();
  this.m_lalcB = new box2d.b2Vec2();
  this.m_K = new box2d.b2Mat22();
}

goog.inherits(box2d.b2FrictionJoint, box2d.b2Joint);

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2FrictionJoint.prototype.m_localAnchorA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2FrictionJoint.prototype.m_localAnchorB = null;

// Solver shared
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2FrictionJoint.prototype.m_linearImpulse = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2FrictionJoint.prototype.m_angularImpulse = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2FrictionJoint.prototype.m_maxForce = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2FrictionJoint.prototype.m_maxTorque = 0;

// Solver temp
/**
 * @export 
 * @type {number}
 */
box2d.b2FrictionJoint.prototype.m_indexA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2FrictionJoint.prototype.m_indexB = 0;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2FrictionJoint.prototype.m_rA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2FrictionJoint.prototype.m_rB = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2FrictionJoint.prototype.m_localCenterA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2FrictionJoint.prototype.m_localCenterB = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2FrictionJoint.prototype.m_invMassA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2FrictionJoint.prototype.m_invMassB = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2FrictionJoint.prototype.m_invIA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2FrictionJoint.prototype.m_invIB = 0;
/**
 * @export 
 * @type {box2d.b2Mat22}
 */
box2d.b2FrictionJoint.prototype.m_linearMass = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2FrictionJoint.prototype.m_angularMass = 0;

/**
 * @export 
 * @type {box2d.b2Rot}
 */
box2d.b2FrictionJoint.prototype.m_qA = null;
/**
 * @export 
 * @type {box2d.b2Rot}
 */
box2d.b2FrictionJoint.prototype.m_qB = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2FrictionJoint.prototype.m_lalcA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2FrictionJoint.prototype.m_lalcB = null;
/**
 * @export 
 * @type {box2d.b2Mat22}
 */
box2d.b2FrictionJoint.prototype.m_K = null;

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2SolverData} data
 */
box2d.b2FrictionJoint.prototype.InitVelocityConstraints = function(data) {
  this.m_indexA = this.m_bodyA.m_islandIndex;
  this.m_indexB = this.m_bodyB.m_islandIndex;
  this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
  this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
  this.m_invMassA = this.m_bodyA.m_invMass;
  this.m_invMassB = this.m_bodyB.m_invMass;
  this.m_invIA = this.m_bodyA.m_invI;
  this.m_invIB = this.m_bodyB.m_invI;

  //	/*box2d.b2Vec2&*/ var cA = data.positions[this.m_indexA].c;
  /*float32*/
  var aA = data.positions[this.m_indexA].a;
  /*box2d.b2Vec2&*/
  var vA = data.velocities[this.m_indexA].v;
  /*float32*/
  var wA = data.velocities[this.m_indexA].w;

  //	/*box2d.b2Vec2&*/ var cB = data.positions[this.m_indexB].c;
  /*float32*/
  var aB = data.positions[this.m_indexB].a;
  /*box2d.b2Vec2&*/
  var vB = data.velocities[this.m_indexB].v;
  /*float32*/
  var wB = data.velocities[this.m_indexB].w;

  //	/*box2d.b2Rot*/ var qA = new box2d.b2Rot(aA), /*box2d.b2Rot*/ qB = new box2d.b2Rot(aB);
  var qA = this.m_qA.SetAngle(aA),
    qB = this.m_qB.SetAngle(aB);

  // Compute the effective mass matrix.
  //	m_rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
  box2d.b2Sub_V2_V2(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
  var rA = box2d.b2Mul_R_V2(qA, this.m_lalcA, this.m_rA);
  //	m_rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
  box2d.b2Sub_V2_V2(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
  var rB = box2d.b2Mul_R_V2(qB, this.m_lalcB, this.m_rB);

  // J = [-I -r1_skew I r2_skew]
  //     [ 0       -1 0       1]
  // r_skew = [-ry; rx]

  // Matlab
  // K = [ mA+r1y^2*iA+mB+r2y^2*iB,  -r1y*iA*r1x-r2y*iB*r2x,          -r1y*iA-r2y*iB]
  //     [  -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB,           r1x*iA+r2x*iB]
  //     [          -r1y*iA-r2y*iB,           r1x*iA+r2x*iB,                   iA+iB]

  /*float32*/
  var mA = this.m_invMassA,
    mB = this.m_invMassB;
  /*float32*/
  var iA = this.m_invIA,
    iB = this.m_invIB;

  /*box2d.b2Mat22*/
  var K = this.m_K; //new box2d.b2Mat22();
  K.ex.x = mA + mB + iA * rA.y * rA.y + iB * rB.y * rB.y;
  K.ex.y = -iA * rA.x * rA.y - iB * rB.x * rB.y;
  K.ey.x = K.ex.y;
  K.ey.y = mA + mB + iA * rA.x * rA.x + iB * rB.x * rB.x;

  K.GetInverse(this.m_linearMass);

  this.m_angularMass = iA + iB;
  if (this.m_angularMass > 0) {
    this.m_angularMass = 1 / this.m_angularMass;
  }

  if (data.step.warmStarting) {
    // Scale impulses to support a variable time step.
    //		m_linearImpulse *= data.step.dtRatio;
    this.m_linearImpulse.SelfMul(data.step.dtRatio);
    this.m_angularImpulse *= data.step.dtRatio;

    //		/*box2d.b2Vec2*/ var P(m_linearImpulse.x, m_linearImpulse.y);
    /*box2d.b2Vec2*/
    var P = this.m_linearImpulse;

    //		vA -= mA * P;
    vA.SelfMulSub(mA, P);
    //		wA -= iA * (b2Cross(m_rA, P) + m_angularImpulse);
    wA -= iA * (box2d.b2Cross_V2_V2(this.m_rA, P) + this.m_angularImpulse);
    //		vB += mB * P;
    vB.SelfMulAdd(mB, P);
    //		wB += iB * (b2Cross(m_rB, P) + m_angularImpulse);
    wB += iB * (box2d.b2Cross_V2_V2(this.m_rB, P) + this.m_angularImpulse);
  } else {
    this.m_linearImpulse.SetZero();
    this.m_angularImpulse = 0;
  }

  //	data.velocities[this.m_indexA].v = vA;
  data.velocities[this.m_indexA].w = wA;
  //	data.velocities[this.m_indexB].v = vB;
  data.velocities[this.m_indexB].w = wB;
}

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2SolverData} data
 */
box2d.b2FrictionJoint.prototype.SolveVelocityConstraints = function(data) {
  /*box2d.b2Vec2&*/
  var vA = data.velocities[this.m_indexA].v;
  /*float32*/
  var wA = data.velocities[this.m_indexA].w;
  /*box2d.b2Vec2&*/
  var vB = data.velocities[this.m_indexB].v;
  /*float32*/
  var wB = data.velocities[this.m_indexB].w;

  /*float32*/
  var mA = this.m_invMassA,
    mB = this.m_invMassB;
  /*float32*/
  var iA = this.m_invIA,
    iB = this.m_invIB;

  /*float32*/
  var h = data.step.dt;

  // Solve angular friction
  {
    /*float32*/
    var Cdot = wB - wA;
    /*float32*/
    var impulse = (-this.m_angularMass * Cdot);

    /*float32*/
    var oldImpulse = this.m_angularImpulse;
    /*float32*/
    var maxImpulse = h * this.m_maxTorque;
    this.m_angularImpulse = box2d.b2Clamp(this.m_angularImpulse + impulse, (-maxImpulse), maxImpulse);
    impulse = this.m_angularImpulse - oldImpulse;

    wA -= iA * impulse;
    wB += iB * impulse;
  }

  // Solve linear friction
  {
    //		b2Vec2 Cdot = vB + b2Cross(wB, m_rB) - vA - b2Cross(wA, m_rA);
    var Cdot = box2d.b2Sub_V2_V2(
      box2d.b2AddCross_V2_S_V2(vB, wB, this.m_rB, box2d.b2Vec2.s_t0),
      box2d.b2AddCross_V2_S_V2(vA, wA, this.m_rA, box2d.b2Vec2.s_t1),
      box2d.b2FrictionJoint.prototype.SolveVelocityConstraints.s_Cdot);

    //		b2Vec2 impulse = -b2Mul(m_linearMass, Cdot);
    var impulseV = box2d.b2Mul_M22_V2(this.m_linearMass, Cdot, box2d.b2FrictionJoint.prototype.SolveVelocityConstraints.s_impulseV).SelfNeg();
    //		b2Vec2 oldImpulse = m_linearImpulse;
    var oldImpulseV = box2d.b2FrictionJoint.prototype.SolveVelocityConstraints.s_oldImpulseV.Copy(this.m_linearImpulse);
    //		m_linearImpulse += impulse;
    this.m_linearImpulse.SelfAdd(impulseV);

    /*float32*/
    var maxImpulse = h * this.m_maxForce;

    if (this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse) {
      this.m_linearImpulse.Normalize();
      this.m_linearImpulse.SelfMul(maxImpulse);
    }

    //		impulse = m_linearImpulse - oldImpulse;
    box2d.b2Sub_V2_V2(this.m_linearImpulse, oldImpulseV, impulseV);

    //		vA -= mA * impulse;
    vA.SelfMulSub(mA, impulseV);
    //		wA -= iA * b2Cross(m_rA, impulse);
    wA -= iA * box2d.b2Cross_V2_V2(this.m_rA, impulseV);

    //		vB += mB * impulse;
    vB.SelfMulAdd(mB, impulseV);
    //		wB += iB * b2Cross(m_rB, impulse);
    wB += iB * box2d.b2Cross_V2_V2(this.m_rB, impulseV);
  }

  //	data.velocities[this.m_indexA].v = vA;
  data.velocities[this.m_indexA].w = wA;
  //	data.velocities[this.m_indexB].v = vB;
  data.velocities[this.m_indexB].w = wB;
}
box2d.b2FrictionJoint.prototype.SolveVelocityConstraints.s_Cdot = new box2d.b2Vec2();
box2d.b2FrictionJoint.prototype.SolveVelocityConstraints.s_impulseV = new box2d.b2Vec2();
box2d.b2FrictionJoint.prototype.SolveVelocityConstraints.s_oldImpulseV = new box2d.b2Vec2();

/** 
 * @export 
 * @return {boolean} 
 * @param {box2d.b2SolverData} data 
 */
box2d.b2FrictionJoint.prototype.SolvePositionConstraints = function(data) {
  return true;
}

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2FrictionJoint.prototype.GetAnchorA = function(out) {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
}

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2FrictionJoint.prototype.GetAnchorB = function(out) {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
}

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {number} inv_dt 
 * @param {box2d.b2Vec2} out
 */
box2d.b2FrictionJoint.prototype.GetReactionForce = function(inv_dt, out) {
  return out.Set(inv_dt * this.m_linearImpulse.x, inv_dt * this.m_linearImpulse.y);
}

/** 
 * @export 
 * @return {number} 
 * @param {number} inv_dt 
 */
box2d.b2FrictionJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_angularImpulse;
}

/** 
 * The local anchor point relative to bodyA's origin. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out 
 */
box2d.b2FrictionJoint.prototype.GetLocalAnchorA = function(out) {
  return out.Copy(this.m_localAnchorA);
}

/** 
 * The local anchor point relative to bodyB's origin. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out 
 */
box2d.b2FrictionJoint.prototype.GetLocalAnchorB = function(out) {
  return out.Copy(this.m_localAnchorB);
}

/** 
 * Set the maximum friction force in N. 
 * @export 
 * @return {void} 
 * @param {number} force
 */
box2d.b2FrictionJoint.prototype.SetMaxForce = function(force) {
  this.m_maxForce = force;
}

/** 
 * Get the maximum friction force in N. 
 * @export 
 * @return {number}
 */
box2d.b2FrictionJoint.prototype.GetMaxForce = function() {
  return this.m_maxForce;
}

/** 
 * Set the maximum friction torque in N*m. 
 * @export 
 * @return {void} 
 * @param {number} torque
 */
box2d.b2FrictionJoint.prototype.SetMaxTorque = function(torque) {
  this.m_maxTorque = torque;
}

/** 
 * Get the maximum friction torque in N*m. 
 * @export 
 * @return {number}
 */
box2d.b2FrictionJoint.prototype.GetMaxTorque = function() {
  return this.m_maxTorque;
}

/** 
 * Dump joint to dmLog 
 * @export 
 * @return {void}
 */
box2d.b2FrictionJoint.prototype.Dump = function() {
  if (box2d.DEBUG) {
    var indexA = this.m_bodyA.m_islandIndex;
    var indexB = this.m_bodyB.m_islandIndex;

    box2d.b2Log("  /*box2d.b2FrictionJointDef*/ var jd = new box2d.b2FrictionJointDef();\n");
    box2d.b2Log("  jd.bodyA = bodies[%d];\n", indexA);
    box2d.b2Log("  jd.bodyB = bodies[%d];\n", indexB);
    box2d.b2Log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ('true') : ('false'));
    box2d.b2Log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
    box2d.b2Log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
    box2d.b2Log("  jd.maxForce = %.15f;\n", this.m_maxForce);
    box2d.b2Log("  jd.maxTorque = %.15f;\n", this.m_maxTorque);
    box2d.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
  }
}
