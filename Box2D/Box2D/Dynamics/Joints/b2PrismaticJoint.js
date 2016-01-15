/*
 * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
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

goog.provide('box2d.b2PrismaticJoint');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Joint');
goog.require('box2d.b2Math');

/** 
 * Prismatic joint definition. This requires defining a line of 
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
box2d.b2PrismaticJointDef = function() {
  box2d.b2JointDef.call(this, box2d.b2JointType.e_prismaticJoint); // base class constructor

  this.localAnchorA = new box2d.b2Vec2();
  this.localAnchorB = new box2d.b2Vec2();
  this.localAxisA = new box2d.b2Vec2(1, 0);
}

goog.inherits(box2d.b2PrismaticJointDef, box2d.b2JointDef);

/** 
 * The local anchor point relative to bodyA's origin. 
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJointDef.prototype.localAnchorA = null;

/** 
 * The local anchor point relative to bodyB's origin. 
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJointDef.prototype.localAnchorB = null;

/** 
 * The local translation unit axis in bodyA. 
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJointDef.prototype.localAxisA = null;

/** 
 * The constrained angle between the bodies: bodyB_angle - 
 * bodyA_angle. 
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJointDef.prototype.referenceAngle = 0;

/** 
 * Enable/disable the joint limit. 
 * @export 
 * @type {boolean}
 */
box2d.b2PrismaticJointDef.prototype.enableLimit = false;

/** 
 * The lower translation limit, usually in meters. 
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJointDef.prototype.lowerTranslation = 0;

/** 
 * The upper translation limit, usually in meters. 
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJointDef.prototype.upperTranslation = 0;

/** 
 * Enable/disable the joint motor. 
 * @export 
 * @type {boolean}
 */
box2d.b2PrismaticJointDef.prototype.enableMotor = false;

/** 
 * The maximum motor torque, usually in N-m. 
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJointDef.prototype.maxMotorForce = 0;

/** 
 * The desired motor speed in radians per second. 
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJointDef.prototype.motorSpeed = 0;

/** 
 * Initialize the bodies, anchors, axis, and reference angle 
 * using the world anchor and unit world axis. 
 * @export 
 * @return {void} 
 * @param {box2d.b2Body} bA 
 * @param {box2d.b2Body} bB 
 * @param {box2d.b2Vec2} anchor 
 * @param {box2d.b2Vec2} axis 
 */
box2d.b2PrismaticJointDef.prototype.Initialize = function(bA, bB, anchor, axis) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
  this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
  this.bodyA.GetLocalVector(axis, this.localAxisA);
  this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
}

/** 
 * A prismatic joint. This joint provides one degree of freedom: 
 * translation along an axis fixed in bodyA. Relative rotation 
 * is prevented. You can use a joint limit to restrict the range 
 * of motion and a joint motor to drive the motion or to model 
 * joint friction. 
 * @export 
 * @constructor 
 * @extends {box2d.b2Joint} 
 * @param {box2d.b2PrismaticJointDef} def 
 */
box2d.b2PrismaticJoint = function(def) {
  box2d.b2Joint.call(this, def); // base class constructor

  this.m_localAnchorA = def.localAnchorA.Clone();
  this.m_localAnchorB = def.localAnchorB.Clone();
  this.m_localXAxisA = def.localAxisA.Clone().SelfNormalize();
  this.m_localYAxisA = box2d.b2Cross_S_V2(1.0, this.m_localXAxisA, new box2d.b2Vec2());
  this.m_referenceAngle = def.referenceAngle;
  this.m_impulse = new box2d.b2Vec3(0, 0, 0);
  this.m_lowerTranslation = def.lowerTranslation;
  this.m_upperTranslation = def.upperTranslation;
  this.m_maxMotorForce = def.maxMotorForce;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableLimit = def.enableLimit;
  this.m_enableMotor = def.enableMotor;

  this.m_localCenterA = new box2d.b2Vec2();
  this.m_localCenterB = new box2d.b2Vec2();
  this.m_axis = new box2d.b2Vec2(0, 0);
  this.m_perp = new box2d.b2Vec2(0, 0);
  this.m_K = new box2d.b2Mat33();
  this.m_K3 = new box2d.b2Mat33();
  this.m_K2 = new box2d.b2Mat22();

  this.m_qA = new box2d.b2Rot();
  this.m_qB = new box2d.b2Rot();
  this.m_lalcA = new box2d.b2Vec2();
  this.m_lalcB = new box2d.b2Vec2();
  this.m_rA = new box2d.b2Vec2();
  this.m_rB = new box2d.b2Vec2();
}

goog.inherits(box2d.b2PrismaticJoint, box2d.b2Joint);

// Solver shared
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJoint.prototype.m_localAnchorA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJoint.prototype.m_localAnchorB = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJoint.prototype.m_localXAxisA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJoint.prototype.m_localYAxisA = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_referenceAngle = 0;
/**
 * @export 
 * @type {box2d.b2Vec3}
 */
box2d.b2PrismaticJoint.prototype.m_impulse = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_motorImpulse = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_lowerTranslation = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_upperTranslation = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_maxMotorForce = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_motorSpeed = 0;
/**
 * @export 
 * @type {boolean}
 */
box2d.b2PrismaticJoint.prototype.m_enableLimit = false;
/**
 * @export 
 * @type {boolean}
 */
box2d.b2PrismaticJoint.prototype.m_enableMotor = false;
/**
 * @export 
 * @type {box2d.b2LimitState}
 */
box2d.b2PrismaticJoint.prototype.m_limitState = box2d.b2LimitState.e_inactiveLimit;

// Solver temp
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_indexA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_indexB = 0;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJoint.prototype.m_localCenterA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJoint.prototype.m_localCenterB = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_invMassA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_invMassB = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_invIA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_invIB = 0;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJoint.prototype.m_axis = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJoint.prototype.m_perp = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_s1 = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_s2 = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_a1 = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_a2 = 0;
/**
 * @export 
 * @type {box2d.b2Mat33}
 */
box2d.b2PrismaticJoint.prototype.m_K = null;
/**
 * @export 
 * @type {box2d.b2Mat33}
 */
box2d.b2PrismaticJoint.prototype.m_K3 = null;
/**
 * @export 
 * @type {box2d.b2Mat22}
 */
box2d.b2PrismaticJoint.prototype.m_K2 = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2PrismaticJoint.prototype.m_motorMass = 0;

/**
 * @export 
 * @type {box2d.b2Rot}
 */
box2d.b2PrismaticJoint.prototype.m_qA = null;
/**
 * @export 
 * @type {box2d.b2Rot}
 */
box2d.b2PrismaticJoint.prototype.m_qB = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJoint.prototype.m_lalcA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJoint.prototype.m_lalcB = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJoint.prototype.m_rA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PrismaticJoint.prototype.m_rB = null;

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2SolverData} data
 */
box2d.b2PrismaticJoint.prototype.InitVelocityConstraints = function(data) {
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

  /*box2d.b2Rot*/
  var qA = this.m_qA.SetAngle(aA),
    qB = this.m_qB.SetAngle(aB);

  // Compute the effective masses.
  //	b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
  box2d.b2Sub_V2_V2(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
  var rA = box2d.b2Mul_R_V2(qA, this.m_lalcA, this.m_rA);
  //	b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
  box2d.b2Sub_V2_V2(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
  var rB = box2d.b2Mul_R_V2(qB, this.m_lalcB, this.m_rB);
  //	b2Vec2 d = (cB - cA) + rB - rA;
  var d = box2d.b2Add_V2_V2(
    box2d.b2Sub_V2_V2(cB, cA, box2d.b2Vec2.s_t0),
    box2d.b2Sub_V2_V2(rB, rA, box2d.b2Vec2.s_t1),
    box2d.b2PrismaticJoint.prototype.InitVelocityConstraints.s_d);

  /*float32*/
  var mA = this.m_invMassA,
    mB = this.m_invMassB;
  /*float32*/
  var iA = this.m_invIA,
    iB = this.m_invIB;

  // Compute motor Jacobian and effective mass.
  {
    //		m_axis = b2Mul(qA, m_localXAxisA);
    box2d.b2Mul_R_V2(qA, this.m_localXAxisA, this.m_axis);
    //		m_a1 = b2Cross(d + rA, m_axis);
    this.m_a1 = box2d.b2Cross_V2_V2(box2d.b2Add_V2_V2(d, rA, box2d.b2Vec2.s_t0), this.m_axis);
    //		m_a2 = b2Cross(rB, m_axis);
    this.m_a2 = box2d.b2Cross_V2_V2(rB, this.m_axis);

    this.m_motorMass = mA + mB + iA * this.m_a1 * this.m_a1 + iB * this.m_a2 * this.m_a2;
    if (this.m_motorMass > 0) {
      this.m_motorMass = 1 / this.m_motorMass;
    }
  }

  // Prismatic constraint.
  {
    //		m_perp = b2Mul(qA, m_localYAxisA);
    box2d.b2Mul_R_V2(qA, this.m_localYAxisA, this.m_perp);

    //		m_s1 = b2Cross(d + rA, m_perp);
    this.m_s1 = box2d.b2Cross_V2_V2(box2d.b2Add_V2_V2(d, rA, box2d.b2Vec2.s_t0), this.m_perp);
    //		m_s2 = b2Cross(rB, m_perp);
    this.m_s2 = box2d.b2Cross_V2_V2(rB, this.m_perp);

    //		float32 s1test;
    //		s1test = b2Cross(rA, m_perp);

    //		float32 k11 = mA + mB + iA * m_s1 * m_s1 + iB * m_s2 * m_s2;
    this.m_K.ex.x = mA + mB + iA * this.m_s1 * this.m_s1 + iB * this.m_s2 * this.m_s2;
    //		float32 k12 = iA * m_s1 + iB * m_s2;
    this.m_K.ex.y = iA * this.m_s1 + iB * this.m_s2;
    //		float32 k13 = iA * m_s1 * m_a1 + iB * m_s2 * m_a2;
    this.m_K.ex.z = iA * this.m_s1 * this.m_a1 + iB * this.m_s2 * this.m_a2;
    this.m_K.ey.x = this.m_K.ex.y;
    //		float32 k22 = iA + iB;
    this.m_K.ey.y = iA + iB;
    if (this.m_K.ey.y === 0) {
      // For bodies with fixed rotation.
      this.m_K.ey.y = 1;
    }
    //		float32 k23 = iA * m_a1 + iB * m_a2;
    this.m_K.ey.z = iA * this.m_a1 + iB * this.m_a2;
    this.m_K.ez.x = this.m_K.ex.z;
    this.m_K.ez.y = this.m_K.ey.z;
    //		float32 k33 = mA + mB + iA * m_a1 * m_a1 + iB * m_a2 * m_a2;
    this.m_K.ez.z = mA + mB + iA * this.m_a1 * this.m_a1 + iB * this.m_a2 * this.m_a2;

    //		m_K.ex.Set(k11, k12, k13);
    //		m_K.ey.Set(k12, k22, k23);
    //		m_K.ez.Set(k13, k23, k33);
  }

  // Compute motor and limit terms.
  if (this.m_enableLimit) {
    //		float32 jointTranslation = b2Dot(m_axis, d);
    var jointTranslation = box2d.b2Dot_V2_V2(this.m_axis, d);
    if (box2d.b2Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * box2d.b2_linearSlop) {
      this.m_limitState = box2d.b2LimitState.e_equalLimits;
    } else if (jointTranslation <= this.m_lowerTranslation) {
      if (this.m_limitState !== box2d.b2LimitState.e_atLowerLimit) {
        this.m_limitState = box2d.b2LimitState.e_atLowerLimit;
        this.m_impulse.z = 0;
      }
    } else if (jointTranslation >= this.m_upperTranslation) {
      if (this.m_limitState !== box2d.b2LimitState.e_atUpperLimit) {
        this.m_limitState = box2d.b2LimitState.e_atUpperLimit;
        this.m_impulse.z = 0;
      }
    } else {
      this.m_limitState = box2d.b2LimitState.e_inactiveLimit;
      this.m_impulse.z = 0;
    }
  } else {
    this.m_limitState = box2d.b2LimitState.e_inactiveLimit;
    this.m_impulse.z = 0;
  }

  if (!this.m_enableMotor) {
    this.m_motorImpulse = 0;
  }

  if (data.step.warmStarting) {
    // Account for variable time step.
    //		m_impulse *= data.step.dtRatio;
    this.m_impulse.SelfMulScalar(data.step.dtRatio);
    this.m_motorImpulse *= data.step.dtRatio;

    //		b2Vec2 P = m_impulse.x * m_perp + (m_motorImpulse + m_impulse.z) * m_axis;
    var P = box2d.b2Add_V2_V2(
      box2d.b2Mul_S_V2(this.m_impulse.x, this.m_perp, box2d.b2Vec2.s_t0),
      box2d.b2Mul_S_V2((this.m_motorImpulse + this.m_impulse.z), this.m_axis, box2d.b2Vec2.s_t1),
      box2d.b2PrismaticJoint.prototype.InitVelocityConstraints.s_P);
    //		float32 LA = m_impulse.x * m_s1 + m_impulse.y + (m_motorImpulse + m_impulse.z) * m_a1;
    var LA = this.m_impulse.x * this.m_s1 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a1;
    //		float32 LB = m_impulse.x * m_s2 + m_impulse.y + (m_motorImpulse + m_impulse.z) * m_a2;
    var LB = this.m_impulse.x * this.m_s2 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a2;

    //		vA -= mA * P;
    vA.SelfMulSub(mA, P);
    wA -= iA * LA;

    //		vB += mB * P;
    vB.SelfMulAdd(mB, P);
    wB += iB * LB;
  } else {
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0;
  }

  //	data.velocities[this.m_indexA].v = vA;
  data.velocities[this.m_indexA].w = wA;
  //	data.velocities[this.m_indexB].v = vB;
  data.velocities[this.m_indexB].w = wB;
}
box2d.b2PrismaticJoint.prototype.InitVelocityConstraints.s_d = new box2d.b2Vec2();
box2d.b2PrismaticJoint.prototype.InitVelocityConstraints.s_P = new box2d.b2Vec2();

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2SolverData} data
 */
box2d.b2PrismaticJoint.prototype.SolveVelocityConstraints = function(data) {
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

  // Solve linear motor constraint.
  if (this.m_enableMotor && this.m_limitState !== box2d.b2LimitState.e_equalLimits) {
    //		float32 Cdot = b2Dot(m_axis, vB - vA) + m_a2 * wB - m_a1 * wA;
    var Cdot = box2d.b2Dot_V2_V2(this.m_axis, box2d.b2Sub_V2_V2(vB, vA, box2d.b2Vec2.s_t0)) + this.m_a2 * wB - this.m_a1 * wA;
    var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
    var oldImpulse = this.m_motorImpulse;
    var maxImpulse = data.step.dt * this.m_maxMotorForce;
    this.m_motorImpulse = box2d.b2Clamp(this.m_motorImpulse + impulse, (-maxImpulse), maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;

    //		b2Vec2 P = impulse * m_axis;
    var P = box2d.b2Mul_S_V2(impulse, this.m_axis, box2d.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_P);
    var LA = impulse * this.m_a1;
    var LB = impulse * this.m_a2;

    //		vA -= mA * P;
    vA.SelfMulSub(mA, P);
    wA -= iA * LA;

    //		vB += mB * P;
    vB.SelfMulAdd(mB, P);
    wB += iB * LB;
  }

  //	b2Vec2 Cdot1;
  //	Cdot1.x = b2Dot(m_perp, vB - vA) + m_s2 * wB - m_s1 * wA;
  var Cdot1_x = box2d.b2Dot_V2_V2(this.m_perp, box2d.b2Sub_V2_V2(vB, vA, box2d.b2Vec2.s_t0)) + this.m_s2 * wB - this.m_s1 * wA;
  //	Cdot1.y = wB - wA;
  var Cdot1_y = wB - wA;

  if (this.m_enableLimit && this.m_limitState !== box2d.b2LimitState.e_inactiveLimit) {
    // Solve prismatic and limit constraint in block form.
    //		float32 Cdot2;
    //		Cdot2 = b2Dot(m_axis, vB - vA) + m_a2 * wB - m_a1 * wA;
    var Cdot2 = box2d.b2Dot_V2_V2(this.m_axis, box2d.b2Sub_V2_V2(vB, vA, box2d.b2Vec2.s_t0)) + this.m_a2 * wB - this.m_a1 * wA;
    //		box2d.b2Vec3 Cdot(Cdot1.x, Cdot1.y, Cdot2);

    //		box2d.b2Vec3 f1 = m_impulse;
    var f1 = box2d.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_f1.Copy(this.m_impulse);
    //		box2d.b2Vec3 df =  m_K.Solve33(-Cdot);
    var df = this.m_K.Solve33((-Cdot1_x), (-Cdot1_y), (-Cdot2), box2d.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_df3);
    //		m_impulse += df;
    this.m_impulse.SelfAdd(df);

    if (this.m_limitState === box2d.b2LimitState.e_atLowerLimit) {
      this.m_impulse.z = box2d.b2Max(this.m_impulse.z, 0);
    } else if (this.m_limitState === box2d.b2LimitState.e_atUpperLimit) {
      this.m_impulse.z = box2d.b2Min(this.m_impulse.z, 0);
    }

    // f2(1:2) = invK(1:2,1:2) * (-Cdot(1:2) - K(1:2,3) * (f2(3) - f1(3))) + f1(1:2)
    //		b2Vec2 b = -Cdot1 - (m_impulse.z - f1.z) * box2d.b2Vec2(m_K.ez.x, m_K.ez.y);
    var b_x = (-Cdot1_x) - (this.m_impulse.z - f1.z) * this.m_K.ez.x;
    var b_y = (-Cdot1_y) - (this.m_impulse.z - f1.z) * this.m_K.ez.y;
    //		b2Vec2 f2r = m_K.Solve22(b) + box2d.b2Vec2(f1.x, f1.y);
    var f2r = this.m_K.Solve22(b_x, b_y, box2d.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_f2r);
    f2r.x += f1.x;
    f2r.y += f1.y;
    //		m_impulse.x = f2r.x;
    this.m_impulse.x = f2r.x;
    //		m_impulse.y = f2r.y;
    this.m_impulse.y = f2r.y;

    //		df = m_impulse - f1;
    df.x = this.m_impulse.x - f1.x;
    df.y = this.m_impulse.y - f1.y;
    df.z = this.m_impulse.z - f1.z;

    //		b2Vec2 P = df.x * m_perp + df.z * m_axis;
    var P = box2d.b2Add_V2_V2(
      box2d.b2Mul_S_V2(df.x, this.m_perp, box2d.b2Vec2.s_t0),
      box2d.b2Mul_S_V2(df.z, this.m_axis, box2d.b2Vec2.s_t1),
      box2d.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_P);
    //		float32 LA = df.x * m_s1 + df.y + df.z * m_a1;
    var LA = df.x * this.m_s1 + df.y + df.z * this.m_a1;
    //		float32 LB = df.x * m_s2 + df.y + df.z * m_a2;
    var LB = df.x * this.m_s2 + df.y + df.z * this.m_a2;

    //		vA -= mA * P;
    vA.SelfMulSub(mA, P);
    wA -= iA * LA;

    //		vB += mB * P;
    vB.SelfMulAdd(mB, P);
    wB += iB * LB;
  } else {
    // Limit is inactive, just solve the prismatic constraint in block form.
    //		b2Vec2 df = m_K.Solve22(-Cdot1);
    var df = this.m_K.Solve22((-Cdot1_x), (-Cdot1_y), box2d.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_df2);
    this.m_impulse.x += df.x;
    this.m_impulse.y += df.y;

    //		b2Vec2 P = df.x * m_perp;
    var P = box2d.b2Mul_S_V2(df.x, this.m_perp, box2d.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_P);
    //		float32 LA = df.x * m_s1 + df.y;
    var LA = df.x * this.m_s1 + df.y;
    //		float32 LB = df.x * m_s2 + df.y;
    var LB = df.x * this.m_s2 + df.y;

    //		vA -= mA * P;
    vA.SelfMulSub(mA, P);
    wA -= iA * LA;

    //		vB += mB * P;
    vB.SelfMulAdd(mB, P);
    wB += iB * LB;
  }

  //	data.velocities[this.m_indexA].v = vA;
  data.velocities[this.m_indexA].w = wA;
  //	data.velocities[this.m_indexB].v = vB;
  data.velocities[this.m_indexB].w = wB;
}
box2d.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_P = new box2d.b2Vec2();
box2d.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_f2r = new box2d.b2Vec2();
box2d.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_f1 = new box2d.b2Vec3();
box2d.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_df3 = new box2d.b2Vec3();
box2d.b2PrismaticJoint.prototype.SolveVelocityConstraints.s_df2 = new box2d.b2Vec2();

/** 
 * @export 
 * @return {boolean} 
 * @param {box2d.b2SolverData} data 
 */
box2d.b2PrismaticJoint.prototype.SolvePositionConstraints = function(data) {
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

  /*float32*/
  var mA = this.m_invMassA,
    mB = this.m_invMassB;
  /*float32*/
  var iA = this.m_invIA,
    iB = this.m_invIB;

  //	b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
  var rA = box2d.b2Mul_R_V2(qA, this.m_lalcA, this.m_rA);
  //	b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
  var rB = box2d.b2Mul_R_V2(qB, this.m_lalcB, this.m_rB);
  //	b2Vec2 d = cB + rB - cA - rA;
  var d = box2d.b2Sub_V2_V2(
    box2d.b2Add_V2_V2(cB, rB, box2d.b2Vec2.s_t0),
    box2d.b2Add_V2_V2(cA, rA, box2d.b2Vec2.s_t1),
    box2d.b2PrismaticJoint.prototype.SolvePositionConstraints.s_d);

  //	b2Vec2 axis = b2Mul(qA, m_localXAxisA);
  var axis = box2d.b2Mul_R_V2(qA, this.m_localXAxisA, this.m_axis);
  //	float32 a1 = b2Cross(d + rA, axis);
  var a1 = box2d.b2Cross_V2_V2(box2d.b2Add_V2_V2(d, rA, box2d.b2Vec2.s_t0), axis);
  //	float32 a2 = b2Cross(rB, axis);
  var a2 = box2d.b2Cross_V2_V2(rB, axis);
  //	b2Vec2 perp = b2Mul(qA, m_localYAxisA);
  var perp = box2d.b2Mul_R_V2(qA, this.m_localYAxisA, this.m_perp);

  //	float32 s1 = b2Cross(d + rA, perp);
  var s1 = box2d.b2Cross_V2_V2(box2d.b2Add_V2_V2(d, rA, box2d.b2Vec2.s_t0), perp);
  //	float32 s2 = b2Cross(rB, perp);
  var s2 = box2d.b2Cross_V2_V2(rB, perp);

  //	box2d.b2Vec3 impulse;
  var impulse = box2d.b2PrismaticJoint.prototype.SolvePositionConstraints.s_impulse;
  //	b2Vec2 C1;
  //	C1.x = b2Dot(perp, d);
  var C1_x = box2d.b2Dot_V2_V2(perp, d);
  //	C1.y = aB - aA - m_referenceAngle;
  var C1_y = aB - aA - this.m_referenceAngle;

  var linearError = box2d.b2Abs(C1_x);
  var angularError = box2d.b2Abs(C1_y);

  var active = false;
  var C2 = 0;
  if (this.m_enableLimit) {
    //		float32 translation = b2Dot(axis, d);
    var translation = box2d.b2Dot_V2_V2(axis, d);
    if (box2d.b2Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * box2d.b2_linearSlop) {
      // Prevent large angular corrections
      C2 = box2d.b2Clamp(translation, (-box2d.b2_maxLinearCorrection), box2d.b2_maxLinearCorrection);
      linearError = box2d.b2Max(linearError, box2d.b2Abs(translation));
      active = true;
    } else if (translation <= this.m_lowerTranslation) {
      // Prevent large linear corrections and allow some slop.
      C2 = box2d.b2Clamp(translation - this.m_lowerTranslation + box2d.b2_linearSlop, (-box2d.b2_maxLinearCorrection), 0);
      linearError = box2d.b2Max(linearError, this.m_lowerTranslation - translation);
      active = true;
    } else if (translation >= this.m_upperTranslation) {
      // Prevent large linear corrections and allow some slop.
      C2 = box2d.b2Clamp(translation - this.m_upperTranslation - box2d.b2_linearSlop, 0, box2d.b2_maxLinearCorrection);
      linearError = box2d.b2Max(linearError, translation - this.m_upperTranslation);
      active = true;
    }
  }

  if (active) {
    //		float32 k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
    var k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
    //		float32 k12 = iA * s1 + iB * s2;
    var k12 = iA * s1 + iB * s2;
    //		float32 k13 = iA * s1 * a1 + iB * s2 * a2;
    var k13 = iA * s1 * a1 + iB * s2 * a2;
    //		float32 k22 = iA + iB;
    var k22 = iA + iB;
    if (k22 === 0) {
      // For fixed rotation
      k22 = 1;
    }
    //		float32 k23 = iA * a1 + iB * a2;
    var k23 = iA * a1 + iB * a2;
    //		float32 k33 = mA + mB + iA * a1 * a1 + iB * a2 * a2;
    var k33 = mA + mB + iA * a1 * a1 + iB * a2 * a2;

    //		box2d.b2Mat33 K;
    var K = this.m_K3;
    K.ex.Set(k11, k12, k13);
    K.ey.Set(k12, k22, k23);
    K.ez.Set(k13, k23, k33);

    //		box2d.b2Vec3 C;
    //		C.x = C1.x;
    //		C.y = C1.y;
    //		C.z = C2;

    //		impulse = K.Solve33(-C);
    impulse = K.Solve33((-C1_x), (-C1_y), (-C2), impulse);
  } else {
    //		float32 k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
    var k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
    //		float32 k12 = iA * s1 + iB * s2;
    var k12 = iA * s1 + iB * s2;
    //		float32 k22 = iA + iB;
    var k22 = iA + iB;
    if (k22 === 0) {
      k22 = 1;
    }

    //		box2d.b2Mat22 K;
    var K2 = this.m_K2;
    //		K.ex.Set(k11, k12);
    K2.ex.Set(k11, k12);
    //		K.ey.Set(k12, k22);
    K2.ey.Set(k12, k22);

    //		b2Vec2 impulse1 = K.Solve(-C1);
    var impulse1 = K2.Solve((-C1_x), (-C1_y), box2d.b2PrismaticJoint.prototype.SolvePositionConstraints.s_impulse1);
    impulse.x = impulse1.x;
    impulse.y = impulse1.y;
    impulse.z = 0;
  }

  //	b2Vec2 P = impulse.x * perp + impulse.z * axis;
  var P = box2d.b2Add_V2_V2(
    box2d.b2Mul_S_V2(impulse.x, perp, box2d.b2Vec2.s_t0),
    box2d.b2Mul_S_V2(impulse.z, axis, box2d.b2Vec2.s_t1),
    box2d.b2PrismaticJoint.prototype.SolvePositionConstraints.s_P);
  //	float32 LA = impulse.x * s1 + impulse.y + impulse.z * a1;
  var LA = impulse.x * s1 + impulse.y + impulse.z * a1;
  //	float32 LB = impulse.x * s2 + impulse.y + impulse.z * a2;
  var LB = impulse.x * s2 + impulse.y + impulse.z * a2;

  //	cA -= mA * P;
  cA.SelfMulSub(mA, P);
  aA -= iA * LA;
  //	cB += mB * P;
  cB.SelfMulAdd(mB, P);
  aB += iB * LB;

  //	data.positions[this.m_indexA].c = cA;
  data.positions[this.m_indexA].a = aA;
  //	data.positions[this.m_indexB].c = cB;
  data.positions[this.m_indexB].a = aB;

  return linearError <= box2d.b2_linearSlop && angularError <= box2d.b2_angularSlop;
}
box2d.b2PrismaticJoint.prototype.SolvePositionConstraints.s_d = new box2d.b2Vec2();
box2d.b2PrismaticJoint.prototype.SolvePositionConstraints.s_impulse = new box2d.b2Vec3();
box2d.b2PrismaticJoint.prototype.SolvePositionConstraints.s_impulse1 = new box2d.b2Vec2();
box2d.b2PrismaticJoint.prototype.SolvePositionConstraints.s_P = new box2d.b2Vec2();

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2PrismaticJoint.prototype.GetAnchorA = function(out) {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
}

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2PrismaticJoint.prototype.GetAnchorB = function(out) {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
}

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {number} inv_dt 
 * @param {box2d.b2Vec2} out
 */
box2d.b2PrismaticJoint.prototype.GetReactionForce = function(inv_dt, out) {
  //	return inv_dt * (m_impulse.x * m_perp + (m_motorImpulse + m_impulse.z) * m_axis);
  return out.Set(inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x), inv_dt * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y));
}

/** 
 * @export 
 * @return {number} 
 * @param {number} inv_dt 
 */
box2d.b2PrismaticJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.y;
}

/** 
 * The local anchor point relative to bodyA's origin. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out 
 */
box2d.b2PrismaticJoint.prototype.GetLocalAnchorA = function(out) {
  return out.Copy(this.m_localAnchorA);
}

/** 
 * The local anchor point relative to bodyB's origin. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out 
 */
box2d.b2PrismaticJoint.prototype.GetLocalAnchorB = function(out) {
  return out.Copy(this.m_localAnchorB);
}

/** 
 * The local joint axis relative to bodyA. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out 
 */
box2d.b2PrismaticJoint.prototype.GetLocalAxisA = function(out) {
  return out.Copy(this.m_localXAxisA);
}

/** 
 * Get the reference angle. 
 * @export 
 * @return {number}
 */
box2d.b2PrismaticJoint.prototype.GetReferenceAngle = function() {
  return this.m_referenceAngle;
}

/** 
 * @export 
 * @return {number}
 */
box2d.b2PrismaticJoint.prototype.GetJointTranslation = function() {
  //	b2Vec2 pA = m_bodyA.GetWorldPoint(m_localAnchorA);
  var pA = this.m_bodyA.GetWorldPoint(this.m_localAnchorA, box2d.b2PrismaticJoint.prototype.GetJointTranslation.s_pA);
  //	b2Vec2 pB = m_bodyB.GetWorldPoint(m_localAnchorB);
  var pB = this.m_bodyB.GetWorldPoint(this.m_localAnchorB, box2d.b2PrismaticJoint.prototype.GetJointTranslation.s_pB);
  //	b2Vec2 d = pB - pA;
  var d = box2d.b2Sub_V2_V2(pB, pA, box2d.b2PrismaticJoint.prototype.GetJointTranslation.s_d);
  //	b2Vec2 axis = m_bodyA.GetWorldVector(m_localXAxisA);
  var axis = this.m_bodyA.GetWorldVector(this.m_localXAxisA, box2d.b2PrismaticJoint.prototype.GetJointTranslation.s_axis);

  //	float32 translation = b2Dot(d, axis);
  var translation = box2d.b2Dot_V2_V2(d, axis);
  return translation;
}
box2d.b2PrismaticJoint.prototype.GetJointTranslation.s_pA = new box2d.b2Vec2();
box2d.b2PrismaticJoint.prototype.GetJointTranslation.s_pB = new box2d.b2Vec2();
box2d.b2PrismaticJoint.prototype.GetJointTranslation.s_d = new box2d.b2Vec2();
box2d.b2PrismaticJoint.prototype.GetJointTranslation.s_axis = new box2d.b2Vec2();

/** 
 * @export 
 * @return {number}
 */
box2d.b2PrismaticJoint.prototype.GetJointSpeed = function() {
  /*box2d.b2Body*/
  var bA = this.m_bodyA;
  /*box2d.b2Body*/
  var bB = this.m_bodyB;

  //	b2Vec2 rA = b2Mul(bA->m_xf.q, m_localAnchorA - bA->m_sweep.localCenter);
  box2d.b2Sub_V2_V2(this.m_localAnchorA, bA.m_sweep.localCenter, this.m_lalcA);
  var rA = box2d.b2Mul_R_V2(bA.m_xf.q, this.m_lalcA, this.m_rA);
  //	b2Vec2 rB = b2Mul(bB->m_xf.q, m_localAnchorB - bB->m_sweep.localCenter);
  box2d.b2Sub_V2_V2(this.m_localAnchorB, bB.m_sweep.localCenter, this.m_lalcB);
  var rB = box2d.b2Mul_R_V2(bB.m_xf.q, this.m_lalcB, this.m_rB);
  //	b2Vec2 pA = bA->m_sweep.c + rA;
  var pA = box2d.b2Add_V2_V2(bA.m_sweep.c, rA, box2d.b2Vec2.s_t0); // pA uses s_t0
  //	b2Vec2 pB = bB->m_sweep.c + rB;
  var pB = box2d.b2Add_V2_V2(bB.m_sweep.c, rB, box2d.b2Vec2.s_t1); // pB uses s_t1
  //	b2Vec2 d = pB - pA;
  var d = box2d.b2Sub_V2_V2(pB, pA, box2d.b2Vec2.s_t2); // d uses s_t2
  //	b2Vec2 axis = b2Mul(bA.m_xf.q, m_localXAxisA);
  var axis = bA.GetWorldVector(this.m_localXAxisA, this.m_axis);

  var vA = bA.m_linearVelocity;
  var vB = bB.m_linearVelocity;
  var wA = bA.m_angularVelocity;
  var wB = bB.m_angularVelocity;

  //	float32 speed = b2Dot(d, b2Cross(wA, axis)) + b2Dot(axis, vB + b2Cross(wB, rB) - vA - b2Cross(wA, rA));
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
 * @return {boolean}
 */
box2d.b2PrismaticJoint.prototype.IsLimitEnabled = function() {
  return this.m_enableLimit;
}

/** 
 * @export 
 * @return {void} 
 * @param {boolean} flag
 */
box2d.b2PrismaticJoint.prototype.EnableLimit = function(flag) {
  if (flag !== this.m_enableLimit) {
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_enableLimit = flag;
    this.m_impulse.z = 0;
  }
}

/** 
 * @export 
 * @return {number}
 */
box2d.b2PrismaticJoint.prototype.GetLowerLimit = function() {
  return this.m_lowerTranslation;
}

/** 
 * @export 
 * @return {number}
 */
box2d.b2PrismaticJoint.prototype.GetUpperLimit = function() {
  return this.m_upperTranslation;
}

/** 
 * @export 
 * @return {void} 
 * @param {number} upper 
 * @param {number} lower 
 */
box2d.b2PrismaticJoint.prototype.SetLimits = function(lower, upper) {
  if (lower !== this.m_lowerTranslation || upper !== this.m_upperTranslation) {
    this.m_bodyA.SetAwake(true);
    this.m_bodyB.SetAwake(true);
    this.m_lowerTranslation = lower;
    this.m_upperTranslation = upper;
    this.m_impulse.z = 0;
  }
}

/** 
 * @export 
 * @return {boolean}
 */
box2d.b2PrismaticJoint.prototype.IsMotorEnabled = function() {
  return this.m_enableMotor;
}

/** 
 * @export 
 * @return {void} 
 * @param {boolean} flag
 */
box2d.b2PrismaticJoint.prototype.EnableMotor = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableMotor = flag;
}

/** 
 * @export 
 * @return {void} 
 * @param {number} speed 
 */
box2d.b2PrismaticJoint.prototype.SetMotorSpeed = function(speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed;
}

/** 
 * @export 
 * @return {number}
 */
box2d.b2PrismaticJoint.prototype.GetMotorSpeed = function() {
  return this.m_motorSpeed;
}

/** 
 * @export 
 * @return {void} 
 * @param {number} force
 */
box2d.b2PrismaticJoint.prototype.SetMaxMotorForce = function(force) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_maxMotorForce = force;
}

/** 
 * @export 
 * @return {number}
 */
box2d.b2PrismaticJoint.prototype.GetMaxMotorForce = function() {
  return this.m_maxMotorForce;
}

/** 
 * @export 
 * @return {number}
 * @param {number} inv_dt 
 */
box2d.b2PrismaticJoint.prototype.GetMotorForce = function(inv_dt) {
  return inv_dt * this.m_motorImpulse;
}

/** 
 * Dump to b2Log 
 * @export 
 * @return {void}
 */
box2d.b2PrismaticJoint.prototype.Dump = function() {
  if (box2d.DEBUG) {
    var indexA = this.m_bodyA.m_islandIndex;
    var indexB = this.m_bodyB.m_islandIndex;

    box2d.b2Log("  /*box2d.b2PrismaticJointDef*/ var jd = new box2d.b2PrismaticJointDef();\n");
    box2d.b2Log("  jd.bodyA = bodies[%d];\n", indexA);
    box2d.b2Log("  jd.bodyB = bodies[%d];\n", indexB);
    box2d.b2Log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ('true') : ('false'));
    box2d.b2Log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
    box2d.b2Log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
    box2d.b2Log("  jd.localAxisA.Set(%.15f, %.15f);\n", this.m_localXAxisA.x, this.m_localXAxisA.y);
    box2d.b2Log("  jd.referenceAngle = %.15f;\n", this.m_referenceAngle);
    box2d.b2Log("  jd.enableLimit = %s;\n", (this.m_enableLimit) ? ('true') : ('false'));
    box2d.b2Log("  jd.lowerTranslation = %.15f;\n", this.m_lowerTranslation);
    box2d.b2Log("  jd.upperTranslation = %.15f;\n", this.m_upperTranslation);
    box2d.b2Log("  jd.enableMotor = %s;\n", (this.m_enableMotor) ? ('true') : ('false'));
    box2d.b2Log("  jd.motorSpeed = %.15f;\n", this.m_motorSpeed);
    box2d.b2Log("  jd.maxMotorForce = %.15f;\n", this.m_maxMotorForce);
    box2d.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
  }
}
