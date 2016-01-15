/*
 * Copyright (c) 2007 Erin Catto http://www.box2d.org
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

goog.provide('box2d.b2PulleyJoint');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Joint');
goog.require('box2d.b2Math');

/**
 * @export
 * @const
 * @type {number}
 */
box2d.b2_minPulleyLength = 2;

/**
 * Pulley joint definition. This requires two ground anchors,
 * two dynamic body anchor points, and a pulley ratio.
 * @export
 * @constructor
 * @extends {box2d.b2JointDef}
 */
box2d.b2PulleyJointDef = function() {
  box2d.b2JointDef.call(this, box2d.b2JointType.e_pulleyJoint); // base class constructor
  this.collideConnected = true;

  this.groundAnchorA = new box2d.b2Vec2(-1, 1);
  this.groundAnchorB = new box2d.b2Vec2(1, 1);

  this.localAnchorA = new box2d.b2Vec2(-1, 0);
  this.localAnchorB = new box2d.b2Vec2(1, 0);
}

goog.inherits(box2d.b2PulleyJointDef, box2d.b2JointDef);

/**
 * The first ground anchor in world coordinates. This point
 * never moves.
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PulleyJointDef.prototype.groundAnchorA = null;

/**
 * The second ground anchor in world coordinates. This point
 * never moves.
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PulleyJointDef.prototype.groundAnchorB = null;

/**
 * The local anchor point relative to bodyA's origin.
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PulleyJointDef.prototype.localAnchorA = null;

/**
 * The local anchor point relative to bodyB's origin.
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PulleyJointDef.prototype.localAnchorB = null;

/**
 * The a reference length for the segment attached to bodyA.
 * @export
 * @type {number}
 */
box2d.b2PulleyJointDef.prototype.lengthA = 0;

/**
 * The a reference length for the segment attached to bodyB.
 * @export
 * @type {number}
 */
box2d.b2PulleyJointDef.prototype.lengthB = 0;

/**
 * The pulley ratio, used to simulate a block-and-tackle.
 * @export
 * @type {number}
 */
box2d.b2PulleyJointDef.prototype.ratio = 1;

/**
 * @export
 * @return {void}
 * @param {box2d.b2Body} bA
 * @param {box2d.b2Body} bB
 * @param {box2d.b2Vec2} groundA
 * @param {box2d.b2Vec2} groundB
 * @param {box2d.b2Vec2} anchorA
 * @param {box2d.b2Vec2} anchorB
 * @param {number} r
 */
box2d.b2PulleyJointDef.prototype.Initialize = function(bA, bB, groundA, groundB, anchorA, anchorB, r) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.groundAnchorA.Copy(groundA);
  this.groundAnchorB.Copy(groundB);
  this.bodyA.GetLocalPoint(anchorA, this.localAnchorA);
  this.bodyB.GetLocalPoint(anchorB, this.localAnchorB);
  this.lengthA = box2d.b2Distance(anchorA, groundA);
  this.lengthB = box2d.b2Distance(anchorB, groundB);
  this.ratio = r;
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(this.ratio > box2d.b2_epsilon);
  }
}

/**
 * The pulley joint is connected to two bodies and two fixed ground points.
 * The pulley supports a ratio such that:
 * lengthA + ratio * lengthB <= constant
 * Yes, the force transmitted is scaled by the ratio.
 * Warning: the pulley joint can get a bit squirrelly by itself.
 * They often work better when combined with prismatic joints.
 * You should also cover the the anchor points with static
 * shapes to prevent one side from going to zero length.
 * @export
 * @constructor
 * @extends {box2d.b2Joint}
 * @param {box2d.b2PulleyJointDef} def
 */
box2d.b2PulleyJoint = function(def) {
  box2d.b2Joint.call(this, def); // base class constructor

  this.m_groundAnchorA = new box2d.b2Vec2();
  this.m_groundAnchorB = new box2d.b2Vec2();
  this.m_localAnchorA = new box2d.b2Vec2();
  this.m_localAnchorB = new box2d.b2Vec2();

  this.m_uA = new box2d.b2Vec2();
  this.m_uB = new box2d.b2Vec2();
  this.m_rA = new box2d.b2Vec2();
  this.m_rB = new box2d.b2Vec2();
  this.m_localCenterA = new box2d.b2Vec2();
  this.m_localCenterB = new box2d.b2Vec2();

  this.m_qA = new box2d.b2Rot();
  this.m_qB = new box2d.b2Rot();
  this.m_lalcA = new box2d.b2Vec2();
  this.m_lalcB = new box2d.b2Vec2();

  this.m_groundAnchorA.Copy(def.groundAnchorA);
  this.m_groundAnchorB.Copy(def.groundAnchorB);
  this.m_localAnchorA.Copy(def.localAnchorA);
  this.m_localAnchorB.Copy(def.localAnchorB);

  this.m_lengthA = def.lengthA;
  this.m_lengthB = def.lengthB;

  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(def.ratio !== 0);
  }
  this.m_ratio = def.ratio;

  this.m_constant = def.lengthA + this.m_ratio * def.lengthB;

  this.m_impulse = 0;
}

goog.inherits(box2d.b2PulleyJoint, box2d.b2Joint);

/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PulleyJoint.prototype.m_groundAnchorA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PulleyJoint.prototype.m_groundAnchorB = null;

/**
 * @export
 * @type {number}
 */
box2d.b2PulleyJoint.prototype.m_lengthA = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2PulleyJoint.prototype.m_lengthB = 0;

// Solver shared
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PulleyJoint.prototype.m_localAnchorA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PulleyJoint.prototype.m_localAnchorB = null;
/**
 * @export
 * @type {number}
 */
box2d.b2PulleyJoint.prototype.m_constant = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2PulleyJoint.prototype.m_ratio = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2PulleyJoint.prototype.m_impulse = 0;

// Solver temp
/**
 * @export
 * @type {number}
 */
box2d.b2PulleyJoint.prototype.m_indexA = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2PulleyJoint.prototype.m_indexB = 0;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PulleyJoint.prototype.m_uA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PulleyJoint.prototype.m_uB = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PulleyJoint.prototype.m_rA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PulleyJoint.prototype.m_rB = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PulleyJoint.prototype.m_localCenterA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PulleyJoint.prototype.m_localCenterB = null;
/**
 * @export
 * @type {number}
 */
box2d.b2PulleyJoint.prototype.m_invMassA = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2PulleyJoint.prototype.m_invMassB = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2PulleyJoint.prototype.m_invIA = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2PulleyJoint.prototype.m_invIB = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2PulleyJoint.prototype.m_mass = 0;

/**
 * @export
 * @type {box2d.b2Rot}
 */
box2d.b2PulleyJoint.prototype.m_qA = null;
/**
 * @export
 * @type {box2d.b2Rot}
 */
box2d.b2PulleyJoint.prototype.m_qB = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PulleyJoint.prototype.m_lalcA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PulleyJoint.prototype.m_lalcB = null;

/**
 * @export
 * @return {void}
 * @param {box2d.b2SolverData} data
 */
box2d.b2PulleyJoint.prototype.InitVelocityConstraints = function(data) {
  this.m_indexA = this.m_bodyA.m_islandIndex;
  this.m_indexB = this.m_bodyB.m_islandIndex;
  this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
  this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
  this.m_invMassA = this.m_bodyA.m_invMass;
  this.m_invMassB = this.m_bodyB.m_invMass;
  this.m_invIA = this.m_bodyA.m_invI;
  this.m_invIB = this.m_bodyB.m_invI;

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

  //  box2d.b2Rot qA(aA), qB(aB);
  /*box2d.b2Rot*/
  var qA = this.m_qA.SetAngle(aA),
    qB = this.m_qB.SetAngle(aB);

  //  m_rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
  box2d.b2Sub_V2_V2(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
  box2d.b2Mul_R_V2(qA, this.m_lalcA, this.m_rA);
  //  m_rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
  box2d.b2Sub_V2_V2(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
  box2d.b2Mul_R_V2(qB, this.m_lalcB, this.m_rB);

  // Get the pulley axes.
  //  m_uA = cA + m_rA - m_groundAnchorA;
  this.m_uA.Copy(cA).SelfAdd(this.m_rA).SelfSub(this.m_groundAnchorA);
  //  m_uB = cB + m_rB - m_groundAnchorB;
  this.m_uB.Copy(cB).SelfAdd(this.m_rB).SelfSub(this.m_groundAnchorB);

  /*float32*/
  var lengthA = this.m_uA.Length();
  /*float32*/
  var lengthB = this.m_uB.Length();

  if (lengthA > 10 * box2d.b2_linearSlop) {
    this.m_uA.SelfMul(1 / lengthA);
  } else {
    this.m_uA.SetZero();
  }

  if (lengthB > 10 * box2d.b2_linearSlop) {
    this.m_uB.SelfMul(1 / lengthB);
  } else {
    this.m_uB.SetZero();
  }

  // Compute effective mass.
  /*float32*/
  var ruA = box2d.b2Cross_V2_V2(this.m_rA, this.m_uA);
  /*float32*/
  var ruB = box2d.b2Cross_V2_V2(this.m_rB, this.m_uB);

  /*float32*/
  var mA = this.m_invMassA + this.m_invIA * ruA * ruA;
  /*float32*/
  var mB = this.m_invMassB + this.m_invIB * ruB * ruB;

  this.m_mass = mA + this.m_ratio * this.m_ratio * mB;

  if (this.m_mass > 0) {
    this.m_mass = 1 / this.m_mass;
  }

  if (data.step.warmStarting) {
    // Scale impulses to support variable time steps.
    this.m_impulse *= data.step.dtRatio;

    // Warm starting.
    //    box2d.b2Vec2 PA = -(m_impulse) * m_uA;
    var PA = box2d.b2Mul_S_V2(-(this.m_impulse), this.m_uA, box2d.b2PulleyJoint.prototype.InitVelocityConstraints.s_PA);
    //    box2d.b2Vec2 PB = (-m_ratio * m_impulse) * m_uB;
    var PB = box2d.b2Mul_S_V2((-this.m_ratio * this.m_impulse), this.m_uB, box2d.b2PulleyJoint.prototype.InitVelocityConstraints.s_PB);

    //    vA += m_invMassA * PA;
    vA.SelfMulAdd(this.m_invMassA, PA);
    wA += this.m_invIA * box2d.b2Cross_V2_V2(this.m_rA, PA);
    //    vB += m_invMassB * PB;
    vB.SelfMulAdd(this.m_invMassB, PB);
    wB += this.m_invIB * box2d.b2Cross_V2_V2(this.m_rB, PB);
  } else {
    this.m_impulse = 0;
  }

  //  data.velocities[this.m_indexA].v = vA;
  data.velocities[this.m_indexA].w = wA;
  //  data.velocities[this.m_indexB].v = vB;
  data.velocities[this.m_indexB].w = wB;
}
box2d.b2PulleyJoint.prototype.InitVelocityConstraints.s_PA = new box2d.b2Vec2();
box2d.b2PulleyJoint.prototype.InitVelocityConstraints.s_PB = new box2d.b2Vec2();

/**
 * @export
 * @return {void}
 * @param {box2d.b2SolverData} data
 */
box2d.b2PulleyJoint.prototype.SolveVelocityConstraints = function(data) {
  /*box2d.b2Vec2&*/
  var vA = data.velocities[this.m_indexA].v;
  /*float32*/
  var wA = data.velocities[this.m_indexA].w;
  /*box2d.b2Vec2&*/
  var vB = data.velocities[this.m_indexB].v;
  /*float32*/
  var wB = data.velocities[this.m_indexB].w;

  //  b2Vec2 vpA = vA + b2Cross(wA, m_rA);
  var vpA = box2d.b2AddCross_V2_S_V2(vA, wA, this.m_rA, box2d.b2PulleyJoint.prototype.SolveVelocityConstraints.s_vpA);
  //  b2Vec2 vpB = vB + b2Cross(wB, m_rB);
  var vpB = box2d.b2AddCross_V2_S_V2(vB, wB, this.m_rB, box2d.b2PulleyJoint.prototype.SolveVelocityConstraints.s_vpB);

  /*float32*/
  var Cdot = -box2d.b2Dot_V2_V2(this.m_uA, vpA) - this.m_ratio * box2d.b2Dot_V2_V2(this.m_uB, vpB);
  /*float32*/
  var impulse = -this.m_mass * Cdot;
  this.m_impulse += impulse;

  //  b2Vec2 PA = -impulse * m_uA;
  var PA = box2d.b2Mul_S_V2(-impulse, this.m_uA, box2d.b2PulleyJoint.prototype.SolveVelocityConstraints.s_PA);
  //  b2Vec2 PB = -m_ratio * impulse * m_uB;
  var PB = box2d.b2Mul_S_V2(-this.m_ratio * impulse, this.m_uB, box2d.b2PulleyJoint.prototype.SolveVelocityConstraints.s_PB);
  //  vA += m_invMassA * PA;
  vA.SelfMulAdd(this.m_invMassA, PA);
  wA += this.m_invIA * box2d.b2Cross_V2_V2(this.m_rA, PA);
  //  vB += m_invMassB * PB;
  vB.SelfMulAdd(this.m_invMassB, PB);
  wB += this.m_invIB * box2d.b2Cross_V2_V2(this.m_rB, PB);

  //  data.velocities[this.m_indexA].v = vA;
  data.velocities[this.m_indexA].w = wA;
  //  data.velocities[this.m_indexB].v = vB;
  data.velocities[this.m_indexB].w = wB;
}
box2d.b2PulleyJoint.prototype.SolveVelocityConstraints.s_vpA = new box2d.b2Vec2();
box2d.b2PulleyJoint.prototype.SolveVelocityConstraints.s_vpB = new box2d.b2Vec2();
box2d.b2PulleyJoint.prototype.SolveVelocityConstraints.s_PA = new box2d.b2Vec2();
box2d.b2PulleyJoint.prototype.SolveVelocityConstraints.s_PB = new box2d.b2Vec2();

/**
 * @export
 * @return {boolean}
 * @param {box2d.b2SolverData} data
 */
box2d.b2PulleyJoint.prototype.SolvePositionConstraints = function(data) {
  /*box2d.b2Vec2&*/
  var cA = data.positions[this.m_indexA].c;
  /*float32*/
  var aA = data.positions[this.m_indexA].a;
  /*box2d.b2Vec2&*/
  var cB = data.positions[this.m_indexB].c;
  /*float32*/
  var aB = data.positions[this.m_indexB].a;

  //  box2d.b2Rot qA(aA), qB(aB);
  /*box2d.b2Rot*/
  var qA = this.m_qA.SetAngle(aA),
    qB = this.m_qB.SetAngle(aB);

  //  b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
  box2d.b2Sub_V2_V2(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
  var rA = box2d.b2Mul_R_V2(qA, this.m_lalcA, this.m_rA);
  //  b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
  box2d.b2Sub_V2_V2(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
  var rB = box2d.b2Mul_R_V2(qB, this.m_lalcB, this.m_rB);

  // Get the pulley axes.
  //  b2Vec2 uA = cA + rA - m_groundAnchorA;
  var uA = this.m_uA.Copy(cA).SelfAdd(rA).SelfSub(this.m_groundAnchorA);
  //  b2Vec2 uB = cB + rB - m_groundAnchorB;
  var uB = this.m_uB.Copy(cB).SelfAdd(rB).SelfSub(this.m_groundAnchorB);

  /*float32*/
  var lengthA = uA.Length();
  /*float32*/
  var lengthB = uB.Length();

  if (lengthA > 10 * box2d.b2_linearSlop) {
    uA.SelfMul(1 / lengthA);
  } else {
    uA.SetZero();
  }

  if (lengthB > 10 * box2d.b2_linearSlop) {
    uB.SelfMul(1 / lengthB);
  } else {
    uB.SetZero();
  }

  // Compute effective mass.
  /*float32*/
  var ruA = box2d.b2Cross_V2_V2(rA, uA);
  /*float32*/
  var ruB = box2d.b2Cross_V2_V2(rB, uB);

  /*float32*/
  var mA = this.m_invMassA + this.m_invIA * ruA * ruA;
  /*float32*/
  var mB = this.m_invMassB + this.m_invIB * ruB * ruB;

  /*float32*/
  var mass = mA + this.m_ratio * this.m_ratio * mB;

  if (mass > 0) {
    mass = 1 / mass;
  }

  /*float32*/
  var C = this.m_constant - lengthA - this.m_ratio * lengthB;
  /*float32*/
  var linearError = box2d.b2Abs(C);

  /*float32*/
  var impulse = -mass * C;

  //  b2Vec2 PA = -impulse * uA;
  var PA = box2d.b2Mul_S_V2(-impulse, uA, box2d.b2PulleyJoint.prototype.SolvePositionConstraints.s_PA);
  //  b2Vec2 PB = -m_ratio * impulse * uB;
  var PB = box2d.b2Mul_S_V2(-this.m_ratio * impulse, uB, box2d.b2PulleyJoint.prototype.SolvePositionConstraints.s_PB);

  //  cA += m_invMassA * PA;
  cA.SelfMulAdd(this.m_invMassA, PA);
  aA += this.m_invIA * box2d.b2Cross_V2_V2(rA, PA);
  //  cB += m_invMassB * PB;
  cB.SelfMulAdd(this.m_invMassB, PB);
  aB += this.m_invIB * box2d.b2Cross_V2_V2(rB, PB);

  //  data.positions[this.m_indexA].c = cA;
  data.positions[this.m_indexA].a = aA;
  //  data.positions[this.m_indexB].c = cB;
  data.positions[this.m_indexB].a = aB;

  return linearError < box2d.b2_linearSlop;
}
box2d.b2PulleyJoint.prototype.SolvePositionConstraints.s_PA = new box2d.b2Vec2();
box2d.b2PulleyJoint.prototype.SolvePositionConstraints.s_PB = new box2d.b2Vec2();

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2PulleyJoint.prototype.GetAnchorA = function(out) {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2PulleyJoint.prototype.GetAnchorB = function(out) {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {number} inv_dt
 * @param {box2d.b2Vec2} out
 */
box2d.b2PulleyJoint.prototype.GetReactionForce = function(inv_dt, out) {
  //  b2Vec2 P = m_impulse * m_uB;
  //  return inv_dt * P;
  return out.Set(inv_dt * this.m_impulse * this.m_uB.x, inv_dt * this.m_impulse * this.m_uB.y);
}

/**
 * @export
 * @return {number}
 * @param {number} inv_dt
 */
box2d.b2PulleyJoint.prototype.GetReactionTorque = function(inv_dt) {
  return 0;
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2PulleyJoint.prototype.GetGroundAnchorA = function(out) {
  return out.Copy(this.m_groundAnchorA);
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2PulleyJoint.prototype.GetGroundAnchorB = function(out) {
  return out.Copy(this.m_groundAnchorB);
}

/**
 * Get the current length of the segment attached to bodyA.
 * @export
 * @return {number}
 */
box2d.b2PulleyJoint.prototype.GetLengthA = function() {
  return this.m_lengthA;
}

/**
 * Get the current length of the segment attached to bodyB.
 * @export
 * @return {number}
 */
box2d.b2PulleyJoint.prototype.GetLengthB = function() {
  return this.m_lengthB;
}

/**
 * Get the pulley ratio.
 * @export
 * @return {number}
 */
box2d.b2PulleyJoint.prototype.GetRatio = function() {
  return this.m_ratio;
}

/**
 * Get the current length of the segment attached to bodyA.
 * @export
 * @return {number}
 */
box2d.b2PulleyJoint.prototype.GetCurrentLengthA = function() {
  //  b2Vec2 p = m_bodyA->GetWorldPoint(m_localAnchorA);
  //  b2Vec2 s = m_groundAnchorA;
  //  b2Vec2 d = p - s;
  //  return d.Length();
  var p = this.m_bodyA.GetWorldPoint(this.m_localAnchorA, box2d.b2PulleyJoint.prototype.GetCurrentLengthA.s_p);
  var s = this.m_groundAnchorA;
  return box2d.b2Distance(p, s);
}
box2d.b2PulleyJoint.prototype.GetCurrentLengthA.s_p = new box2d.b2Vec2();

/**
 * Get the current length of the segment attached to bodyB.
 * @export
 * @return {number}
 */
box2d.b2PulleyJoint.prototype.GetCurrentLengthB = function() {
  //  b2Vec2 p = m_bodyB->GetWorldPoint(m_localAnchorB);
  //  b2Vec2 s = m_groundAnchorB;
  //  b2Vec2 d = p - s;
  //  return d.Length();
  var p = this.m_bodyB.GetWorldPoint(this.m_localAnchorB, box2d.b2PulleyJoint.prototype.GetCurrentLengthB.s_p);
  var s = this.m_groundAnchorB;
  return box2d.b2Distance(p, s);
}
box2d.b2PulleyJoint.prototype.GetCurrentLengthB.s_p = new box2d.b2Vec2();

/**
 * Dump joint to dmLog
 * @export
 * @return {void}
 */
box2d.b2PulleyJoint.prototype.Dump = function() {
  if (box2d.DEBUG) {
    var indexA = this.m_bodyA.m_islandIndex;
    var indexB = this.m_bodyB.m_islandIndex;

    box2d.b2Log("  /*box2d.b2PulleyJointDef*/ var jd = new box2d.b2PulleyJointDef();\n");
    box2d.b2Log("  jd.bodyA = bodies[%d];\n", indexA);
    box2d.b2Log("  jd.bodyB = bodies[%d];\n", indexB);
    box2d.b2Log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ('true') : ('false'));
    box2d.b2Log("  jd.groundAnchorA.Set(%.15f, %.15f);\n", this.m_groundAnchorA.x, this.m_groundAnchorA.y);
    box2d.b2Log("  jd.groundAnchorB.Set(%.15f, %.15f);\n", this.m_groundAnchorB.x, this.m_groundAnchorB.y);
    box2d.b2Log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
    box2d.b2Log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
    box2d.b2Log("  jd.lengthA = %.15f;\n", this.m_lengthA);
    box2d.b2Log("  jd.lengthB = %.15f;\n", this.m_lengthB);
    box2d.b2Log("  jd.ratio = %.15f;\n", this.m_ratio);
    box2d.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
  }
}

/**
 * Implement b2Joint::ShiftOrigin
 * @export
 * @return {void}
 * @param {box2d.b2Vec2} newOrigin
 */
box2d.b2PulleyJoint.prototype.ShiftOrigin = function(newOrigin) {
  this.m_groundAnchorA.SelfSub(newOrigin);
  this.m_groundAnchorB.SelfSub(newOrigin);
}
