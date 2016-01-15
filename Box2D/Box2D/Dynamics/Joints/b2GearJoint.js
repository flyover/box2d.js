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

goog.provide('box2d.b2GearJoint');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Joint');
goog.require('box2d.b2Math');
goog.require('box2d.b2RevoluteJoint');
goog.require('box2d.b2PrismaticJoint');

/** 
 * Gear joint definition. This definition requires two existing 
 * revolute or prismatic joints (any combination will work). 
 * @export 
 * @constructor 
 * @extends {box2d.b2JointDef} 
 */
box2d.b2GearJointDef = function() {
  box2d.b2JointDef.call(this, box2d.b2JointType.e_gearJoint); // base class constructor
}

goog.inherits(box2d.b2GearJointDef, box2d.b2JointDef);

/** 
 * The first revolute/prismatic joint attached to the gear 
 * joint. 
 * @export 
 * @type {box2d.b2Joint}
 */
box2d.b2GearJointDef.prototype.joint1 = null;

/** 
 * The second revolute/prismatic joint attached to the gear 
 * joint. 
 * @export 
 * @type {box2d.b2Joint}
 */
box2d.b2GearJointDef.prototype.joint2 = null;

/** 
 * The gear ratio. 
 * @see box2d.b2GearJoint for explanation. 
 * @export 
 * @type {number}
 */
box2d.b2GearJointDef.prototype.ratio = 1;

/** 
 * A gear joint is used to connect two joints together. Either 
 * joint can be a revolute or prismatic joint. You specify a 
 * gear ratio to bind the motions together: 
 * coordinateA + ratio * coordinateB = constant 
 * The ratio can be negative or positive. If one joint is a 
 * revolute joint and the other joint is a prismatic joint, then 
 * the ratio will have units of length or units of 1/length. 
 * warning You have to manually destroy the gear joint if jointA 
 * or jointB is destroyed. 
 * @export 
 * @constructor 
 * @extends {box2d.b2Joint} 
 * @param {box2d.b2GearJointDef} def 
 */
box2d.b2GearJoint = function(def) {
  box2d.b2Joint.call(this, def); // base class constructor

  this.m_joint1 = def.joint1;
  this.m_joint2 = def.joint2;

  this.m_localAnchorA = new box2d.b2Vec2();
  this.m_localAnchorB = new box2d.b2Vec2();
  this.m_localAnchorC = new box2d.b2Vec2();
  this.m_localAnchorD = new box2d.b2Vec2();

  this.m_localAxisC = new box2d.b2Vec2();
  this.m_localAxisD = new box2d.b2Vec2();

  this.m_lcA = new box2d.b2Vec2(), this.m_lcB = new box2d.b2Vec2(), this.m_lcC = new box2d.b2Vec2(), this.m_lcD = new box2d.b2Vec2();
  this.m_JvAC = new box2d.b2Vec2(), this.m_JvBD = new box2d.b2Vec2();

  this.m_qA = new box2d.b2Rot(), this.m_qB = new box2d.b2Rot(), this.m_qC = new box2d.b2Rot(), this.m_qD = new box2d.b2Rot();
  this.m_lalcA = new box2d.b2Vec2(), this.m_lalcB = new box2d.b2Vec2(), this.m_lalcC = new box2d.b2Vec2(), this.m_lalcD = new box2d.b2Vec2();

  this.m_typeA = this.m_joint1.GetType();
  this.m_typeB = this.m_joint2.GetType();

  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(this.m_typeA === box2d.b2JointType.e_revoluteJoint || this.m_typeA === box2d.b2JointType.e_prismaticJoint);
  }
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(this.m_typeB === box2d.b2JointType.e_revoluteJoint || this.m_typeB === box2d.b2JointType.e_prismaticJoint);
  }

  /*float32*/
  var coordinateA, coordinateB;

  // TODO_ERIN there might be some problem with the joint edges in b2Joint.

  this.m_bodyC = this.m_joint1.GetBodyA();
  this.m_bodyA = this.m_joint1.GetBodyB();

  // Get geometry of joint1
  /*box2d.b2Transform*/
  var xfA = this.m_bodyA.m_xf;
  /*float32*/
  var aA = this.m_bodyA.m_sweep.a;
  /*box2d.b2Transform*/
  var xfC = this.m_bodyC.m_xf;
  /*float32*/
  var aC = this.m_bodyC.m_sweep.a;

  if (this.m_typeA === box2d.b2JointType.e_revoluteJoint) {
    /*box2d.b2RevoluteJoint*/
    var revolute = def.joint1;
    this.m_localAnchorC.Copy(revolute.m_localAnchorA);
    this.m_localAnchorA.Copy(revolute.m_localAnchorB);
    this.m_referenceAngleA = revolute.m_referenceAngle;
    this.m_localAxisC.SetZero();

    coordinateA = aA - aC - this.m_referenceAngleA;
  } else {
    /*box2d.b2PrismaticJoint*/
    var prismatic = def.joint1;
    this.m_localAnchorC.Copy(prismatic.m_localAnchorA);
    this.m_localAnchorA.Copy(prismatic.m_localAnchorB);
    this.m_referenceAngleA = prismatic.m_referenceAngle;
    this.m_localAxisC.Copy(prismatic.m_localXAxisA);

    //		b2Vec2 pC = m_localAnchorC;
    var pC = this.m_localAnchorC;
    //		b2Vec2 pA = b2MulT(xfC.q, b2Mul(xfA.q, m_localAnchorA) + (xfA.p - xfC.p));
    var pA = box2d.b2MulT_R_V2(
      xfC.q,
      box2d.b2Add_V2_V2(
        box2d.b2Mul_R_V2(xfA.q, this.m_localAnchorA, box2d.b2Vec2.s_t0),
        box2d.b2Sub_V2_V2(xfA.p, xfC.p, box2d.b2Vec2.s_t1),
        box2d.b2Vec2.s_t0),
      box2d.b2Vec2.s_t0); // pA uses s_t0
    //		coordinateA = b2Dot(pA - pC, m_localAxisC);
    coordinateA = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(pA, pC, box2d.b2Vec2.s_t0), this.m_localAxisC);
  }

  this.m_bodyD = this.m_joint2.GetBodyA();
  this.m_bodyB = this.m_joint2.GetBodyB();

  // Get geometry of joint2
  /*box2d.b2Transform*/
  var xfB = this.m_bodyB.m_xf;
  /*float32*/
  var aB = this.m_bodyB.m_sweep.a;
  /*box2d.b2Transform*/
  var xfD = this.m_bodyD.m_xf;
  /*float32*/
  var aD = this.m_bodyD.m_sweep.a;

  if (this.m_typeB === box2d.b2JointType.e_revoluteJoint) {
    /*box2d.b2RevoluteJoint*/
    var revolute = def.joint2;
    this.m_localAnchorD.Copy(revolute.m_localAnchorA);
    this.m_localAnchorB.Copy(revolute.m_localAnchorB);
    this.m_referenceAngleB = revolute.m_referenceAngle;
    this.m_localAxisD.SetZero();

    coordinateB = aB - aD - this.m_referenceAngleB;
  } else {
    /*box2d.b2PrismaticJoint*/
    var prismatic = def.joint2;
    this.m_localAnchorD.Copy(prismatic.m_localAnchorA);
    this.m_localAnchorB.Copy(prismatic.m_localAnchorB);
    this.m_referenceAngleB = prismatic.m_referenceAngle;
    this.m_localAxisD.Copy(prismatic.m_localXAxisA);

    //		b2Vec2 pD = m_localAnchorD;
    var pD = this.m_localAnchorD;
    //		b2Vec2 pB = b2MulT(xfD.q, b2Mul(xfB.q, m_localAnchorB) + (xfB.p - xfD.p));
    var pB = box2d.b2MulT_R_V2(
      xfD.q,
      box2d.b2Add_V2_V2(
        box2d.b2Mul_R_V2(xfB.q, this.m_localAnchorB, box2d.b2Vec2.s_t0),
        box2d.b2Sub_V2_V2(xfB.p, xfD.p, box2d.b2Vec2.s_t1),
        box2d.b2Vec2.s_t0),
      box2d.b2Vec2.s_t0); // pB uses s_t0
    //		coordinateB = b2Dot(pB - pD, m_localAxisD);
    coordinateB = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(pB, pD, box2d.b2Vec2.s_t0), this.m_localAxisD);
  }

  this.m_ratio = def.ratio;

  this.m_constant = coordinateA + this.m_ratio * coordinateB;

  this.m_impulse = 0;
}

goog.inherits(box2d.b2GearJoint, box2d.b2Joint);

/**
 * @export 
 * @type {box2d.b2Joint}
 */
box2d.b2GearJoint.prototype.m_joint1 = null;
/**
 * @export 
 * @type {box2d.b2Joint}
 */
box2d.b2GearJoint.prototype.m_joint2 = null;

/**
 * @export 
 * @type {box2d.b2JointType}
 */
box2d.b2GearJoint.prototype.m_typeA = box2d.b2JointType.e_unknownJoint;
/**
 * @export 
 * @type {box2d.b2JointType}
 */
box2d.b2GearJoint.prototype.m_typeB = box2d.b2JointType.e_unknownJoint;

// Body A is connected to body C
// Body B is connected to body D
/**
 * @export 
 * @type {box2d.b2Body}
 */
box2d.b2GearJoint.prototype.m_bodyC = null;
/**
 * @export 
 * @type {box2d.b2Body}
 */
box2d.b2GearJoint.prototype.m_bodyD = null;

// Solver shared
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2GearJoint.prototype.m_localAnchorA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2GearJoint.prototype.m_localAnchorB = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2GearJoint.prototype.m_localAnchorC = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2GearJoint.prototype.m_localAnchorD = null;

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2GearJoint.prototype.m_localAxisC = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2GearJoint.prototype.m_localAxisD = null;

/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_referenceAngleA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_referenceAngleB = 0;

/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_constant = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_ratio = 0;

/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_impulse = 0;

// Solver temp
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_indexA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_indexB = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_indexC = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_indexD = 0;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2GearJoint.prototype.m_lcA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2GearJoint.prototype.m_lcB = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2GearJoint.prototype.m_lcC = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2GearJoint.prototype.m_lcD = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_mA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_mB = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_mC = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_mD = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_iA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_iB = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_iC = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_iD = 0;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2GearJoint.prototype.m_JvAC = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2GearJoint.prototype.m_JvBD = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_JwA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_JwB = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_JwC = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_JwD = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2GearJoint.prototype.m_mass = 0;

/**
 * @export 
 * @type {box2d.b2Rot}
 */
box2d.b2GearJoint.prototype.m_qA = null;
/**
 * @export 
 * @type {box2d.b2Rot}
 */
box2d.b2GearJoint.prototype.m_qB = null;
/**
 * @export 
 * @type {box2d.b2Rot}
 */
box2d.b2GearJoint.prototype.m_qC = null;
/**
 * @export 
 * @type {box2d.b2Rot}
 */
box2d.b2GearJoint.prototype.m_qD = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2GearJoint.prototype.m_lalcA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2GearJoint.prototype.m_lalcB = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2GearJoint.prototype.m_lalcC = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2GearJoint.prototype.m_lalcD = null;

/**
 * @param {box2d.b2SolverData} data
 */
box2d.b2GearJoint.prototype.InitVelocityConstraints = function(data) {
  this.m_indexA = this.m_bodyA.m_islandIndex;
  this.m_indexB = this.m_bodyB.m_islandIndex;
  this.m_indexC = this.m_bodyC.m_islandIndex;
  this.m_indexD = this.m_bodyD.m_islandIndex;
  this.m_lcA.Copy(this.m_bodyA.m_sweep.localCenter);
  this.m_lcB.Copy(this.m_bodyB.m_sweep.localCenter);
  this.m_lcC.Copy(this.m_bodyC.m_sweep.localCenter);
  this.m_lcD.Copy(this.m_bodyD.m_sweep.localCenter);
  this.m_mA = this.m_bodyA.m_invMass;
  this.m_mB = this.m_bodyB.m_invMass;
  this.m_mC = this.m_bodyC.m_invMass;
  this.m_mD = this.m_bodyD.m_invMass;
  this.m_iA = this.m_bodyA.m_invI;
  this.m_iB = this.m_bodyB.m_invI;
  this.m_iC = this.m_bodyC.m_invI;
  this.m_iD = this.m_bodyD.m_invI;

  /*float32*/
  var aA = data.positions[this.m_indexA].a;
  /*box2d.b2Vec2&*/
  var vA = data.velocities[this.m_indexA].v;
  /*float32*/
  var wA = data.velocities[this.m_indexA].w;

  /*float32*/
  var aB = data.positions[this.m_indexB].a;
  /*box2d.b2Vec2&*/
  var vB = data.velocities[this.m_indexB].v;
  /*float32*/
  var wB = data.velocities[this.m_indexB].w;

  /*float32*/
  var aC = data.positions[this.m_indexC].a;
  /*box2d.b2Vec2&*/
  var vC = data.velocities[this.m_indexC].v;
  /*float32*/
  var wC = data.velocities[this.m_indexC].w;

  /*float32*/
  var aD = data.positions[this.m_indexD].a;
  /*box2d.b2Vec2&*/
  var vD = data.velocities[this.m_indexD].v;
  /*float32*/
  var wD = data.velocities[this.m_indexD].w;

  //	box2d.b2Rot qA(aA), qB(aB), qC(aC), qD(aD);
  var qA = this.m_qA.SetAngle(aA),
    qB = this.m_qB.SetAngle(aB),
    qC = this.m_qC.SetAngle(aC),
    qD = this.m_qD.SetAngle(aD);

  this.m_mass = 0;

  if (this.m_typeA === box2d.b2JointType.e_revoluteJoint) {
    this.m_JvAC.SetZero();
    this.m_JwA = 1;
    this.m_JwC = 1;
    this.m_mass += this.m_iA + this.m_iC;
  } else {
    //		b2Vec2 u = b2Mul(qC, m_localAxisC);
    var u = box2d.b2Mul_R_V2(qC, this.m_localAxisC, box2d.b2GearJoint.prototype.InitVelocityConstraints.s_u);
    //		b2Vec2 rC = b2Mul(qC, m_localAnchorC - m_lcC);
    box2d.b2Sub_V2_V2(this.m_localAnchorC, this.m_lcC, this.m_lalcC);
    var rC = box2d.b2Mul_R_V2(qC, this.m_lalcC, box2d.b2GearJoint.prototype.InitVelocityConstraints.s_rC);
    //		b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_lcA);
    box2d.b2Sub_V2_V2(this.m_localAnchorA, this.m_lcA, this.m_lalcA);
    var rA = box2d.b2Mul_R_V2(qA, this.m_lalcA, box2d.b2GearJoint.prototype.InitVelocityConstraints.s_rA);
    //		m_JvAC = u;
    this.m_JvAC.Copy(u);
    //		m_JwC = b2Cross(rC, u);
    this.m_JwC = box2d.b2Cross_V2_V2(rC, u);
    //		m_JwA = b2Cross(rA, u);
    this.m_JwA = box2d.b2Cross_V2_V2(rA, u);
    this.m_mass += this.m_mC + this.m_mA + this.m_iC * this.m_JwC * this.m_JwC + this.m_iA * this.m_JwA * this.m_JwA;
  }

  if (this.m_typeB === box2d.b2JointType.e_revoluteJoint) {
    this.m_JvBD.SetZero();
    this.m_JwB = this.m_ratio;
    this.m_JwD = this.m_ratio;
    this.m_mass += this.m_ratio * this.m_ratio * (this.m_iB + this.m_iD);
  } else {
    //		b2Vec2 u = b2Mul(qD, m_localAxisD);
    var u = box2d.b2Mul_R_V2(qD, this.m_localAxisD, box2d.b2GearJoint.prototype.InitVelocityConstraints.s_u);
    //		b2Vec2 rD = b2Mul(qD, m_localAnchorD - m_lcD);
    box2d.b2Sub_V2_V2(this.m_localAnchorD, this.m_lcD, this.m_lalcD);
    var rD = box2d.b2Mul_R_V2(qD, this.m_lalcD, box2d.b2GearJoint.prototype.InitVelocityConstraints.s_rD);
    //		b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_lcB);
    box2d.b2Sub_V2_V2(this.m_localAnchorB, this.m_lcB, this.m_lalcB);
    var rB = box2d.b2Mul_R_V2(qB, this.m_lalcB, box2d.b2GearJoint.prototype.InitVelocityConstraints.s_rB);
    //		m_JvBD = m_ratio * u;
    box2d.b2Mul_S_V2(this.m_ratio, u, this.m_JvBD);
    //		m_JwD = m_ratio * b2Cross(rD, u);
    this.m_JwD = this.m_ratio * box2d.b2Cross_V2_V2(rD, u);
    //		m_JwB = m_ratio * b2Cross(rB, u);
    this.m_JwB = this.m_ratio * box2d.b2Cross_V2_V2(rB, u);
    this.m_mass += this.m_ratio * this.m_ratio * (this.m_mD + this.m_mB) + this.m_iD * this.m_JwD * this.m_JwD + this.m_iB * this.m_JwB * this.m_JwB;
  }

  // Compute effective mass.
  this.m_mass = this.m_mass > 0 ? 1 / this.m_mass : 0;

  if (data.step.warmStarting) {
    //		vA += (m_mA * m_impulse) * m_JvAC;
    vA.SelfMulAdd(this.m_mA * this.m_impulse, this.m_JvAC);
    wA += this.m_iA * this.m_impulse * this.m_JwA;
    //		vB += (m_mB * m_impulse) * m_JvBD;
    vB.SelfMulAdd(this.m_mB * this.m_impulse, this.m_JvBD);
    wB += this.m_iB * this.m_impulse * this.m_JwB;
    //		vC -= (m_mC * m_impulse) * m_JvAC;
    vC.SelfMulSub(this.m_mC * this.m_impulse, this.m_JvAC);
    wC -= this.m_iC * this.m_impulse * this.m_JwC;
    //		vD -= (m_mD * m_impulse) * m_JvBD;
    vD.SelfMulSub(this.m_mD * this.m_impulse, this.m_JvBD);
    wD -= this.m_iD * this.m_impulse * this.m_JwD;
  } else {
    this.m_impulse = 0;
  }

  //	data.velocities[this.m_indexA].v = vA;
  data.velocities[this.m_indexA].w = wA;
  //	data.velocities[this.m_indexB].v = vB;
  data.velocities[this.m_indexB].w = wB;
  //	data.velocities[this.m_indexC].v = vC;
  data.velocities[this.m_indexC].w = wC;
  //	data.velocities[this.m_indexD].v = vD;
  data.velocities[this.m_indexD].w = wD;
}
box2d.b2GearJoint.prototype.InitVelocityConstraints.s_u = new box2d.b2Vec2();
box2d.b2GearJoint.prototype.InitVelocityConstraints.s_rA = new box2d.b2Vec2();
box2d.b2GearJoint.prototype.InitVelocityConstraints.s_rB = new box2d.b2Vec2();
box2d.b2GearJoint.prototype.InitVelocityConstraints.s_rC = new box2d.b2Vec2();
box2d.b2GearJoint.prototype.InitVelocityConstraints.s_rD = new box2d.b2Vec2();

/**
 * @param {box2d.b2SolverData} data
 */
box2d.b2GearJoint.prototype.SolveVelocityConstraints = function(data) {
  /*box2d.b2Vec2&*/
  var vA = data.velocities[this.m_indexA].v;
  /*float32*/
  var wA = data.velocities[this.m_indexA].w;
  /*box2d.b2Vec2&*/
  var vB = data.velocities[this.m_indexB].v;
  /*float32*/
  var wB = data.velocities[this.m_indexB].w;
  /*box2d.b2Vec2&*/
  var vC = data.velocities[this.m_indexC].v;
  /*float32*/
  var wC = data.velocities[this.m_indexC].w;
  /*box2d.b2Vec2&*/
  var vD = data.velocities[this.m_indexD].v;
  /*float32*/
  var wD = data.velocities[this.m_indexD].w;

  //	float32 Cdot = b2Dot(m_JvAC, vA - vC) + b2Dot(m_JvBD, vB - vD);
  var Cdot =
    box2d.b2Dot_V2_V2(this.m_JvAC, box2d.b2Sub_V2_V2(vA, vC, box2d.b2Vec2.s_t0)) +
    box2d.b2Dot_V2_V2(this.m_JvBD, box2d.b2Sub_V2_V2(vB, vD, box2d.b2Vec2.s_t0));
  Cdot += (this.m_JwA * wA - this.m_JwC * wC) + (this.m_JwB * wB - this.m_JwD * wD);

  /*float32*/
  var impulse = -this.m_mass * Cdot;
  this.m_impulse += impulse;

  //	vA += (m_mA * impulse) * m_JvAC;
  vA.SelfMulAdd((this.m_mA * impulse), this.m_JvAC);
  wA += this.m_iA * impulse * this.m_JwA;
  //	vB += (m_mB * impulse) * m_JvBD;
  vB.SelfMulAdd((this.m_mB * impulse), this.m_JvBD);
  wB += this.m_iB * impulse * this.m_JwB;
  //	vC -= (m_mC * impulse) * m_JvAC;
  vC.SelfMulSub((this.m_mC * impulse), this.m_JvAC);
  wC -= this.m_iC * impulse * this.m_JwC;
  //	vD -= (m_mD * impulse) * m_JvBD;
  vD.SelfMulSub((this.m_mD * impulse), this.m_JvBD);
  wD -= this.m_iD * impulse * this.m_JwD;

  //	data.velocities[this.m_indexA].v = vA;
  data.velocities[this.m_indexA].w = wA;
  //	data.velocities[this.m_indexB].v = vB;
  data.velocities[this.m_indexB].w = wB;
  //	data.velocities[this.m_indexC].v = vC;
  data.velocities[this.m_indexC].w = wC;
  //	data.velocities[this.m_indexD].v = vD;
  data.velocities[this.m_indexD].w = wD;
}

/** 
 * @export 
 * @return {boolean} 
 * @param {box2d.b2SolverData} data 
 */
box2d.b2GearJoint.prototype.SolvePositionConstraints = function(data) {
  /*box2d.b2Vec2&*/
  var cA = data.positions[this.m_indexA].c;
  /*float32*/
  var aA = data.positions[this.m_indexA].a;
  /*box2d.b2Vec2&*/
  var cB = data.positions[this.m_indexB].c;
  /*float32*/
  var aB = data.positions[this.m_indexB].a;
  /*box2d.b2Vec2&*/
  var cC = data.positions[this.m_indexC].c;
  /*float32*/
  var aC = data.positions[this.m_indexC].a;
  /*box2d.b2Vec2&*/
  var cD = data.positions[this.m_indexD].c;
  /*float32*/
  var aD = data.positions[this.m_indexD].a;

  //	box2d.b2Rot qA(aA), qB(aB), qC(aC), qD(aD);
  var qA = this.m_qA.SetAngle(aA),
    qB = this.m_qB.SetAngle(aB),
    qC = this.m_qC.SetAngle(aC),
    qD = this.m_qD.SetAngle(aD);

  /*float32*/
  var linearError = 0;

  /*float32*/
  var coordinateA, coordinateB;

  /*box2d.b2Vec2*/
  var JvAC = this.m_JvAC,
    JvBD = this.m_JvBD;
  /*float32*/
  var JwA, JwB, JwC, JwD;
  /*float32*/
  var mass = 0;

  if (this.m_typeA === box2d.b2JointType.e_revoluteJoint) {
    JvAC.SetZero();
    JwA = 1;
    JwC = 1;
    mass += this.m_iA + this.m_iC;

    coordinateA = aA - aC - this.m_referenceAngleA;
  } else {
    //		b2Vec2 u = b2Mul(qC, m_localAxisC);
    var u = box2d.b2Mul_R_V2(qC, this.m_localAxisC, box2d.b2GearJoint.prototype.SolvePositionConstraints.s_u);
    //		b2Vec2 rC = b2Mul(qC, m_localAnchorC - m_lcC);
    var rC = box2d.b2Mul_R_V2(qC, this.m_lalcC, box2d.b2GearJoint.prototype.SolvePositionConstraints.s_rC);
    //		b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_lcA);
    var rA = box2d.b2Mul_R_V2(qA, this.m_lalcA, box2d.b2GearJoint.prototype.SolvePositionConstraints.s_rA);
    //		JvAC = u;
    JvAC.Copy(u);
    //		JwC = b2Cross(rC, u);
    JwC = box2d.b2Cross_V2_V2(rC, u);
    //		JwA = b2Cross(rA, u);
    JwA = box2d.b2Cross_V2_V2(rA, u);
    mass += this.m_mC + this.m_mA + this.m_iC * JwC * JwC + this.m_iA * JwA * JwA;

    //		b2Vec2 pC = m_localAnchorC - m_lcC;
    var pC = this.m_lalcC;
    //		b2Vec2 pA = b2MulT(qC, rA + (cA - cC));
    var pA = box2d.b2MulT_R_V2(
      qC,
      box2d.b2Add_V2_V2(
        rA,
        box2d.b2Sub_V2_V2(cA, cC, box2d.b2Vec2.s_t0),
        box2d.b2Vec2.s_t0),
      box2d.b2Vec2.s_t0); // pA uses s_t0
    //		coordinateA = b2Dot(pA - pC, m_localAxisC);
    coordinateA = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(pA, pC, box2d.b2Vec2.s_t0), this.m_localAxisC);
  }

  if (this.m_typeB === box2d.b2JointType.e_revoluteJoint) {
    JvBD.SetZero();
    JwB = this.m_ratio;
    JwD = this.m_ratio;
    mass += this.m_ratio * this.m_ratio * (this.m_iB + this.m_iD);

    coordinateB = aB - aD - this.m_referenceAngleB;
  } else {
    //		b2Vec2 u = b2Mul(qD, m_localAxisD);
    var u = box2d.b2Mul_R_V2(qD, this.m_localAxisD, box2d.b2GearJoint.prototype.SolvePositionConstraints.s_u);
    //		b2Vec2 rD = b2Mul(qD, m_localAnchorD - m_lcD);
    var rD = box2d.b2Mul_R_V2(qD, this.m_lalcD, box2d.b2GearJoint.prototype.SolvePositionConstraints.s_rD);
    //		b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_lcB);
    var rB = box2d.b2Mul_R_V2(qB, this.m_lalcB, box2d.b2GearJoint.prototype.SolvePositionConstraints.s_rB);
    //		JvBD = m_ratio * u;
    box2d.b2Mul_S_V2(this.m_ratio, u, JvBD);
    //		JwD = m_ratio * b2Cross(rD, u);
    JwD = this.m_ratio * box2d.b2Cross_V2_V2(rD, u);
    //		JwB = m_ratio * b2Cross(rB, u);
    JwB = this.m_ratio * box2d.b2Cross_V2_V2(rB, u);
    mass += this.m_ratio * this.m_ratio * (this.m_mD + this.m_mB) + this.m_iD * JwD * JwD + this.m_iB * JwB * JwB;

    //		b2Vec2 pD = m_localAnchorD - m_lcD;
    var pD = this.m_lalcD;
    //		b2Vec2 pB = b2MulT(qD, rB + (cB - cD));
    var pB = box2d.b2MulT_R_V2(
      qD,
      box2d.b2Add_V2_V2(
        rB,
        box2d.b2Sub_V2_V2(cB, cD, box2d.b2Vec2.s_t0),
        box2d.b2Vec2.s_t0),
      box2d.b2Vec2.s_t0); // pB uses s_t0
    //		coordinateB = b2Dot(pB - pD, m_localAxisD);
    coordinateB = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(pB, pD, box2d.b2Vec2.s_t0), this.m_localAxisD);
  }

  /*float32*/
  var C = (coordinateA + this.m_ratio * coordinateB) - this.m_constant;

  /*float32*/
  var impulse = 0;
  if (mass > 0) {
    impulse = -C / mass;
  }

  //	cA += m_mA * impulse * JvAC;
  cA.SelfMulAdd(this.m_mA * impulse, JvAC);
  aA += this.m_iA * impulse * JwA;
  //	cB += m_mB * impulse * JvBD;
  cB.SelfMulAdd(this.m_mB * impulse, JvBD);
  aB += this.m_iB * impulse * JwB;
  //	cC -= m_mC * impulse * JvAC;
  cC.SelfMulSub(this.m_mC * impulse, JvAC);
  aC -= this.m_iC * impulse * JwC;
  //	cD -= m_mD * impulse * JvBD;
  cD.SelfMulSub(this.m_mD * impulse, JvBD);
  aD -= this.m_iD * impulse * JwD;

  //	data.positions[this.m_indexA].c = cA;
  data.positions[this.m_indexA].a = aA;
  //	data.positions[this.m_indexB].c = cB;
  data.positions[this.m_indexB].a = aB;
  //	data.positions[this.m_indexC].c = cC;
  data.positions[this.m_indexC].a = aC;
  //	data.positions[this.m_indexD].c = cD;
  data.positions[this.m_indexD].a = aD;

  // TODO_ERIN not implemented
  return linearError < box2d.b2_linearSlop;
}
box2d.b2GearJoint.prototype.SolvePositionConstraints.s_u = new box2d.b2Vec2();
box2d.b2GearJoint.prototype.SolvePositionConstraints.s_rA = new box2d.b2Vec2();
box2d.b2GearJoint.prototype.SolvePositionConstraints.s_rB = new box2d.b2Vec2();
box2d.b2GearJoint.prototype.SolvePositionConstraints.s_rC = new box2d.b2Vec2();
box2d.b2GearJoint.prototype.SolvePositionConstraints.s_rD = new box2d.b2Vec2();

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2GearJoint.prototype.GetAnchorA = function(out) {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
}

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2GearJoint.prototype.GetAnchorB = function(out) {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
}

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {number} inv_dt 
 * @param {box2d.b2Vec2} out
 */
box2d.b2GearJoint.prototype.GetReactionForce = function(inv_dt, out) {
  //	b2Vec2 P = m_impulse * m_JvAC;
  //	return inv_dt * P;
  return box2d.b2Mul_S_V2(inv_dt * this.m_impulse, this.m_JvAC, out);
}

/** 
 * @export 
 * @return {number} 
 * @param {number} inv_dt 
 */
box2d.b2GearJoint.prototype.GetReactionTorque = function(inv_dt) {
  //	float32 L = m_impulse * m_JwA;
  //	return inv_dt * L;
  return inv_dt * this.m_impulse * this.m_JwA;
}

/** 
 * Get the first joint. 
 * @export 
 * @return {box2d.b2Joint}
 */
box2d.b2GearJoint.prototype.GetJoint1 = function() {
  return this.m_joint1;
}

/** 
 * Get the second joint. 
 * @export 
 * @return {box2d.b2Joint}
 */
box2d.b2GearJoint.prototype.GetJoint2 = function() {
  return this.m_joint2;
}

/** 
 * @export 
 * @return {number}
 */
box2d.b2GearJoint.prototype.GetRatio = function() {
  return this.m_ratio;
}

/** 
 * @export 
 * @return {void} 
 * @param {number} ratio
 */
box2d.b2GearJoint.prototype.SetRatio = function(ratio) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(box2d.b2IsValid(ratio));
  }
  this.m_ratio = ratio;
}

/** 
 * Dump joint to dmLog 
 * @export 
 * @return {void}
 */
box2d.b2GearJoint.prototype.Dump = function() {
  if (box2d.DEBUG) {
    var indexA = this.m_bodyA.m_islandIndex;
    var indexB = this.m_bodyB.m_islandIndex;

    var index1 = this.m_joint1.m_index;
    var index2 = this.m_joint2.m_index;

    box2d.b2Log("  /*box2d.b2GearJointDef*/ var jd = new box2d.b2GearJointDef();\n");
    box2d.b2Log("  jd.bodyA = bodies[%d];\n", indexA);
    box2d.b2Log("  jd.bodyB = bodies[%d];\n", indexB);
    box2d.b2Log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ('true') : ('false'));
    box2d.b2Log("  jd.joint1 = joints[%d];\n", index1);
    box2d.b2Log("  jd.joint2 = joints[%d];\n", index2);
    box2d.b2Log("  jd.ratio = %.15f;\n", this.m_ratio);
    box2d.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
  }
}
