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

goog.provide('box2d.b2WeldJoint');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Joint');
goog.require('box2d.b2Math');

/** 
 * Weld joint definition. You need to specify local anchor 
 * points where they are attached and the relative body angle. 
 * The position of the anchor points is important for computing 
 * the reaction torque. 
 * @export 
 * @constructor 
 * @extends {box2d.b2JointDef} 
 */
box2d.b2WeldJointDef = function ()
{
	box2d.b2JointDef.call(this, box2d.b2JointType.e_weldJoint); // base class constructor

	this.localAnchorA = new box2d.b2Vec2();
	this.localAnchorB = new box2d.b2Vec2();
}

goog.inherits(box2d.b2WeldJointDef, box2d.b2JointDef);

/** 
 * The local anchor point relative to bodyA's origin. 
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2WeldJointDef.prototype.localAnchorA = null;

/** 
 * The local anchor point relative to bodyB's origin. 
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2WeldJointDef.prototype.localAnchorB = null;

/** 
 * The bodyB angle minus bodyA angle in the reference state 
 * (radians). 
 * @export 
 * @type {number}
 */
box2d.b2WeldJointDef.prototype.referenceAngle = 0;

/** 
 * The mass-spring-damper frequency in Hertz. Rotation only. 
 * Disable softness with a value of 0. 
 * @export 
 * @type {number}
 */
box2d.b2WeldJointDef.prototype.frequencyHz = 0;

/** 
 * The damping ratio. 0 = no damping, 1 = critical damping. 
 * @export 
 * @type {number}
 */
box2d.b2WeldJointDef.prototype.dampingRatio = 0;

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2Body} bA 
 * @param {box2d.b2Body} bB 
 * @param {box2d.b2Vec2} anchor 
 */
box2d.b2WeldJointDef.prototype.Initialize = function (bA, bB, anchor)
{
	this.bodyA = bA;
	this.bodyB = bB;
	this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
	this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
	this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
}

/** 
 * A weld joint essentially glues two bodies together. A weld 
 * joint may distort somewhat because the island constraint 
 * solver is approximate. 
 * @export 
 * @constructor 
 * @extends {box2d.b2Joint} 
 * @param {box2d.b2WeldJointDef} def 
 */
box2d.b2WeldJoint = function (def)
{
	box2d.b2Joint.call(this, def); // base class constructor

	this.m_frequencyHz = def.frequencyHz;
	this.m_dampingRatio = def.dampingRatio;

	this.m_localAnchorA = def.localAnchorA.Clone();
	this.m_localAnchorB = def.localAnchorB.Clone();
	this.m_referenceAngle = def.referenceAngle;
	this.m_impulse = new box2d.b2Vec3(0, 0, 0);

	this.m_rA = new box2d.b2Vec2();
	this.m_rB = new box2d.b2Vec2();
	this.m_localCenterA = new box2d.b2Vec2();
	this.m_localCenterB = new box2d.b2Vec2();
	this.m_mass = new box2d.b2Mat33();

	this.m_qA = new box2d.b2Rot();
	this.m_qB = new box2d.b2Rot();
	this.m_lalcA = new box2d.b2Vec2();
	this.m_lalcB = new box2d.b2Vec2();
	this.m_K = new box2d.b2Mat33();
}

goog.inherits(box2d.b2WeldJoint, box2d.b2Joint);

/**
 * @export 
 * @type {number}
 */
box2d.b2WeldJoint.prototype.m_frequencyHz = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2WeldJoint.prototype.m_dampingRatio = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2WeldJoint.prototype.m_bias = 0;

// Solver shared
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2WeldJoint.prototype.m_localAnchorA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2WeldJoint.prototype.m_localAnchorB = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2WeldJoint.prototype.m_referenceAngle = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2WeldJoint.prototype.m_gamma = 0;
/**
 * @export 
 * @type {box2d.b2Vec3}
 */
box2d.b2WeldJoint.prototype.m_impulse = null;

// Solver temp
/**
 * @export 
 * @type {number}
 */
box2d.b2WeldJoint.prototype.m_indexA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2WeldJoint.prototype.m_indexB = 0;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2WeldJoint.prototype.m_rA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2WeldJoint.prototype.m_rB = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2WeldJoint.prototype.m_localCenterA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2WeldJoint.prototype.m_localCenterB = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2WeldJoint.prototype.m_invMassA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2WeldJoint.prototype.m_invMassB = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2WeldJoint.prototype.m_invIA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2WeldJoint.prototype.m_invIB = 0;
/**
 * @export 
 * @type {box2d.b2Mat33}
 */
box2d.b2WeldJoint.prototype.m_mass = null;

/**
 * @export 
 * @type {box2d.b2Rot}
 */
box2d.b2WeldJoint.prototype.m_qA = null;
/**
 * @export 
 * @type {box2d.b2Rot}
 */
box2d.b2WeldJoint.prototype.m_qB = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2WeldJoint.prototype.m_lalcA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2WeldJoint.prototype.m_lalcB = null;
/**
 * @export 
 * @type {box2d.b2Mat33}
 */
box2d.b2WeldJoint.prototype.m_K = null;

/**
 * @param {box2d.b2SolverData} data
 */
box2d.b2WeldJoint.prototype.InitVelocityConstraints = function (data)
{
	this.m_indexA = this.m_bodyA.m_islandIndex;
	this.m_indexB = this.m_bodyB.m_islandIndex;
	this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
	this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
	this.m_invMassA = this.m_bodyA.m_invMass;
	this.m_invMassB = this.m_bodyB.m_invMass;
	this.m_invIA = this.m_bodyA.m_invI;
	this.m_invIB = this.m_bodyB.m_invI;

	/*float32*/ var aA = data.positions[this.m_indexA].a;
	/*box2d.b2Vec2&*/ var vA = data.velocities[this.m_indexA].v;
	/*float32*/ var wA = data.velocities[this.m_indexA].w;

	/*float32*/ var aB = data.positions[this.m_indexB].a;
	/*box2d.b2Vec2&*/ var vB = data.velocities[this.m_indexB].v;
	/*float32*/ var wB = data.velocities[this.m_indexB].w;

	/*box2d.b2Rot*/ var qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);

//	m_rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
	box2d.b2Sub_V2_V2(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
	box2d.b2Mul_R_V2(qA, this.m_lalcA, this.m_rA);
//	m_rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
	box2d.b2Sub_V2_V2(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
	box2d.b2Mul_R_V2(qB, this.m_lalcB, this.m_rB);

	// J = [-I -r1_skew I r2_skew]
	//     [ 0       -1 0       1]
	// r_skew = [-ry; rx]

	// Matlab
	// K = [ mA+r1y^2*iA+mB+r2y^2*iB,  -r1y*iA*r1x-r2y*iB*r2x,          -r1y*iA-r2y*iB]
	//     [  -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB,           r1x*iA+r2x*iB]
	//     [          -r1y*iA-r2y*iB,           r1x*iA+r2x*iB,                   iA+iB]

	/*float32*/ var mA = this.m_invMassA, mB = this.m_invMassB;
	/*float32*/ var iA = this.m_invIA, iB = this.m_invIB;

	/*b2Mat33*/ var K = this.m_K;
	K.ex.x = mA + mB + this.m_rA.y * this.m_rA.y * iA + this.m_rB.y * this.m_rB.y * iB;
	K.ey.x = -this.m_rA.y * this.m_rA.x * iA - this.m_rB.y * this.m_rB.x * iB;
	K.ez.x = -this.m_rA.y * iA - this.m_rB.y * iB;
	K.ex.y = K.ey.x;
	K.ey.y = mA + mB + this.m_rA.x * this.m_rA.x * iA + this.m_rB.x * this.m_rB.x * iB;
	K.ez.y = this.m_rA.x * iA + this.m_rB.x * iB;
	K.ex.z = K.ez.x;
	K.ey.z = K.ez.y;
	K.ez.z = iA + iB;

	if (this.m_frequencyHz > 0)
	{
		K.GetInverse22(this.m_mass);

		/*float32*/ var invM = iA + iB;
		/*float32*/ var m = invM > 0 ? 1 / invM : 0;

		/*float32*/ var C = aB - aA - this.m_referenceAngle;

		// Frequency
		/*float32*/ var omega = 2 * box2d.b2_pi * this.m_frequencyHz;

		// Damping coefficient
		/*float32*/ var d = 2 * m * this.m_dampingRatio * omega;

		// Spring stiffness
		/*float32*/ var k = m * omega * omega;

		// magic formulas
		/*float32*/ var h = data.step.dt;
		this.m_gamma = h * (d + h * k);
		this.m_gamma = this.m_gamma !== 0 ? 1 / this.m_gamma : 0;
		this.m_bias = C * h * k * this.m_gamma;

		invM += this.m_gamma;
		this.m_mass.ez.z = invM !== 0 ? 1 / invM : 0;
	}
	else if (K.ez.z === 0)
	{
		K.GetInverse22(this.m_mass);
		this.m_gamma = 0;
		this.m_bias = 0;
	}
	else
	{
		K.GetSymInverse33(this.m_mass);
		this.m_gamma = 0;
		this.m_bias = 0;
	}

	if (data.step.warmStarting)
	{
		// Scale impulses to support a variable time step.
		this.m_impulse.SelfMulScalar(data.step.dtRatio);

//		box2d.b2Vec2 P(m_impulse.x, m_impulse.y);
		var P = box2d.b2WeldJoint.prototype.InitVelocityConstraints.s_P.Set(this.m_impulse.x, this.m_impulse.y);

//		vA -= mA * P;
		vA.SelfMulSub(mA, P);
		wA -= iA * (box2d.b2Cross_V2_V2(this.m_rA, P) + this.m_impulse.z);

//		vB += mB * P;
		vB.SelfMulAdd(mB, P);
		wB += iB * (box2d.b2Cross_V2_V2(this.m_rB, P) + this.m_impulse.z);
	}
	else
	{
		this.m_impulse.SetZero();
	}

//	data.velocities[this.m_indexA].v = vA;
	data.velocities[this.m_indexA].w = wA;
//	data.velocities[this.m_indexB].v = vB;
	data.velocities[this.m_indexB].w = wB;
}
box2d.b2WeldJoint.prototype.InitVelocityConstraints.s_P = new box2d.b2Vec2();

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2SolverData} data
 */
box2d.b2WeldJoint.prototype.SolveVelocityConstraints = function (data)
{
	/*box2d.b2Vec2&*/ var vA = data.velocities[this.m_indexA].v;
	/*float32*/ var wA = data.velocities[this.m_indexA].w;
	/*box2d.b2Vec2&*/ var vB = data.velocities[this.m_indexB].v;
	/*float32*/ var wB = data.velocities[this.m_indexB].w;

	/*float32*/ var mA = this.m_invMassA, mB = this.m_invMassB;
	/*float32*/ var iA = this.m_invIA, iB = this.m_invIB;

	if (this.m_frequencyHz > 0)
	{
		/*float32*/ var Cdot2 = wB - wA;

		/*float32*/ var impulse2 = -this.m_mass.ez.z * (Cdot2 + this.m_bias + this.m_gamma * this.m_impulse.z);
		this.m_impulse.z += impulse2;

		wA -= iA * impulse2;
		wB += iB * impulse2;

//		b2Vec2 Cdot1 = vB + b2CrossSV(wB, this.m_rB) - vA - b2CrossSV(wA, this.m_rA);
		var Cdot1 = box2d.b2Sub_V2_V2(
			box2d.b2AddCross_V2_S_V2(vB, wB, this.m_rB, box2d.b2Vec2.s_t0),
			box2d.b2AddCross_V2_S_V2(vA, wA, this.m_rA, box2d.b2Vec2.s_t1),
			box2d.b2WeldJoint.prototype.SolveVelocityConstraints.s_Cdot1)

//		b2Vec2 impulse1 = -b2Mul22(m_mass, Cdot1);
		var impulse1 = box2d.b2Mul_M33_X_Y(this.m_mass, Cdot1.x, Cdot1.y, box2d.b2WeldJoint.prototype.SolveVelocityConstraints.s_impulse1).SelfNeg();
		this.m_impulse.x += impulse1.x;
		this.m_impulse.y += impulse1.y;

//		b2Vec2 P = impulse1;
		var P = impulse1;

//		vA -= mA * P;
		vA.SelfMulSub(mA, P);
//		wA -= iA * b2Cross(m_rA, P);
		wA -= iA * box2d.b2Cross_V2_V2(this.m_rA, P);

//		vB += mB * P;
		vB.SelfMulAdd(mB, P);
//		wB += iB * b2Cross(m_rB, P);
		wB += iB * box2d.b2Cross_V2_V2(this.m_rB, P);
	}
	else
	{
//		b2Vec2 Cdot1 = vB + b2Cross(wB, this.m_rB) - vA - b2Cross(wA, this.m_rA);
		var Cdot1 = box2d.b2Sub_V2_V2(
			box2d.b2AddCross_V2_S_V2(vB, wB, this.m_rB, box2d.b2Vec2.s_t0),
			box2d.b2AddCross_V2_S_V2(vA, wA, this.m_rA, box2d.b2Vec2.s_t1),
			box2d.b2WeldJoint.prototype.SolveVelocityConstraints.s_Cdot1)
		/*float32*/ var Cdot2 = wB - wA;
//		b2Vec3 var Cdot(Cdot1.x, Cdot1.y, Cdot2);
	
//		b2Vec3 impulse = -b2Mul(m_mass, Cdot);
		var impulse = box2d.b2Mul_M33_X_Y_Z(this.m_mass, Cdot1.x, Cdot1.y, Cdot2, box2d.b2WeldJoint.prototype.SolveVelocityConstraints.s_impulse).SelfNeg();
		this.m_impulse.SelfAdd(impulse);
	
//		box2d.b2Vec2 P(impulse.x, impulse.y);
		var P = box2d.b2WeldJoint.prototype.SolveVelocityConstraints.s_P.Set(impulse.x, impulse.y);
	
//		vA -= mA * P;
		vA.SelfMulSub(mA, P);
		wA -= iA * (box2d.b2Cross_V2_V2(this.m_rA, P) + impulse.z);
	
//		vB += mB * P;
		vB.SelfMulAdd(mB, P);
		wB += iB * (box2d.b2Cross_V2_V2(this.m_rB, P) + impulse.z);
	}

//	data.velocities[this.m_indexA].v = vA;
	data.velocities[this.m_indexA].w = wA;
//	data.velocities[this.m_indexB].v = vB;
	data.velocities[this.m_indexB].w = wB;
}
box2d.b2WeldJoint.prototype.SolveVelocityConstraints.s_Cdot1 = new box2d.b2Vec2();
box2d.b2WeldJoint.prototype.SolveVelocityConstraints.s_impulse1 = new box2d.b2Vec2();
box2d.b2WeldJoint.prototype.SolveVelocityConstraints.s_impulse = new box2d.b2Vec3();
box2d.b2WeldJoint.prototype.SolveVelocityConstraints.s_P = new box2d.b2Vec2();

/**
 * @export 
 * @return {boolean} 
 * @param {box2d.b2SolverData} data 
 */
box2d.b2WeldJoint.prototype.SolvePositionConstraints = function (data)
{
	/*box2d.b2Vec2&*/ var cA = data.positions[this.m_indexA].c;
	/*float32*/ var aA = data.positions[this.m_indexA].a;
	/*box2d.b2Vec2&*/ var cB = data.positions[this.m_indexB].c;
	/*float32*/ var aB = data.positions[this.m_indexB].a;

	/*box2d.b2Rot*/ var qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);

	/*float32*/ var mA = this.m_invMassA, mB = this.m_invMassB;
	/*float32*/ var iA = this.m_invIA, iB = this.m_invIB;

//	b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
	box2d.b2Sub_V2_V2(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
	var rA = box2d.b2Mul_R_V2(qA, this.m_lalcA, this.m_rA);
//	b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
	box2d.b2Sub_V2_V2(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
	var rB = box2d.b2Mul_R_V2(qB, this.m_lalcB, this.m_rB);

	/*float32*/ var positionError, angularError;

	/*b2Mat33*/ var K = this.m_K;
	K.ex.x = mA + mB + rA.y * rA.y * iA + rB.y * rB.y * iB;
	K.ey.x = -rA.y * rA.x * iA - rB.y * rB.x * iB;
	K.ez.x = -rA.y * iA - rB.y * iB;
	K.ex.y = K.ey.x;
	K.ey.y = mA + mB + rA.x * rA.x * iA + rB.x * rB.x * iB;
	K.ez.y = rA.x * iA + rB.x * iB;
	K.ex.z = K.ez.x;
	K.ey.z = K.ez.y;
	K.ez.z = iA + iB;

	if (this.m_frequencyHz > 0)
	{
//		b2Vec2 C1 =  cB + rB - cA - rA;
		var C1 = 
			box2d.b2Sub_V2_V2(
				box2d.b2Add_V2_V2(cB, rB, box2d.b2Vec2.s_t0), 
				box2d.b2Add_V2_V2(cA, rA, box2d.b2Vec2.s_t1), 
				box2d.b2WeldJoint.prototype.SolvePositionConstraints.s_C1);
		positionError = C1.Length();
		angularError = 0;

//		b2Vec2 P = -K.Solve22(C1);
		var P = K.Solve22(C1.x, C1.y, box2d.b2WeldJoint.prototype.SolvePositionConstraints.s_P).SelfNeg();

//		cA -= mA * P;
		cA.SelfMulSub(mA, P);
		aA -= iA * box2d.b2Cross_V2_V2(rA, P);

//		cB += mB * P;
		cB.SelfMulAdd(mB, P);
		aB += iB * box2d.b2Cross_V2_V2(rB, P);
	}
	else
	{
//		b2Vec2 C1 =  cB + rB - cA - rA;
		var C1 = 
			box2d.b2Sub_V2_V2(
				box2d.b2Add_V2_V2(cB, rB, box2d.b2Vec2.s_t0), 
				box2d.b2Add_V2_V2(cA, rA, box2d.b2Vec2.s_t1), 
				box2d.b2WeldJoint.prototype.SolvePositionConstraints.s_C1);
		/*float32*/ var C2 = aB - aA - this.m_referenceAngle;
	
		positionError = C1.Length();
		angularError = box2d.b2Abs(C2);
	
//		b2Vec3 C(C1.x, C1.y, C2);
	
//		b2Vec3 impulse;
		/*box2d.b2Vec3*/ var impulse = box2d.b2WeldJoint.prototype.SolvePositionConstraints.s_impulse;
		if (K.ez.z > 0)
		{ 
//			impulse = -K.Solve33(C);
			K.Solve33(C1.x, C1.y, C2, impulse).SelfNeg();
		} 
		else
		{ 
//			b2Vec2 impulse2 = -K.Solve22(C1);
			var impulse2 = K.Solve22(C1.x, C1.y, box2d.b2WeldJoint.prototype.SolvePositionConstraints.s_impulse2).SelfNeg();
//			impulse.Set(impulse2.x, impulse2.y, 0.0f);
			impulse.x = impulse2.x;
			impulse.y = impulse2.y;
			impulse.z = 0;
		} 

//		b2Vec2 P(impulse.x, impulse.y);
		var P = box2d.b2WeldJoint.prototype.SolvePositionConstraints.s_P.Set(impulse.x, impulse.y);
	
//		cA -= mA * P;
		cA.SelfMulSub(mA, P);
		aA -= iA * (box2d.b2Cross_V2_V2(this.m_rA, P) + impulse.z);
	
//		cB += mB * P;
		cB.SelfMulAdd(mB, P);
		aB += iB * (box2d.b2Cross_V2_V2(this.m_rB, P) + impulse.z);
	}

//	data.positions[this.m_indexA].c = cA;
	data.positions[this.m_indexA].a = aA;
//	data.positions[this.m_indexB].c = cB;
	data.positions[this.m_indexB].a = aB;

	return positionError <= box2d.b2_linearSlop && angularError <= box2d.b2_angularSlop;
}
box2d.b2WeldJoint.prototype.SolvePositionConstraints.s_C1 = new box2d.b2Vec2();
box2d.b2WeldJoint.prototype.SolvePositionConstraints.s_P = new box2d.b2Vec2();
box2d.b2WeldJoint.prototype.SolvePositionConstraints.s_impulse = new box2d.b2Vec3();
box2d.b2WeldJoint.prototype.SolvePositionConstraints.s_impulse2 = new box2d.b2Vec2();

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2WeldJoint.prototype.GetAnchorA = function (out)
{
	return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
}

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2WeldJoint.prototype.GetAnchorB = function (out)
{
	return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
}

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {number} inv_dt 
 * @param {box2d.b2Vec2} out
 */
box2d.b2WeldJoint.prototype.GetReactionForce = function (inv_dt, out)
{
//	box2d.b2Vec2 P(this.m_impulse.x, this.m_impulse.y);
//	return inv_dt * P;
	return out.Set(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y);
}

/** 
 * @export 
 * @return {number} 
 * @param {number} inv_dt 
 */
box2d.b2WeldJoint.prototype.GetReactionTorque = function (inv_dt)
{
	return inv_dt * this.m_impulse.z;
}

/** 
 * The local anchor point relative to bodyA's origin. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out 
 */
box2d.b2WeldJoint.prototype.GetLocalAnchorA = function (out) { return out.Copy(this.m_localAnchorA); }

/** 
 * The local anchor point relative to bodyB's origin. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out 
 */
box2d.b2WeldJoint.prototype.GetLocalAnchorB = function (out) { return out.Copy(this.m_localAnchorB); }

/** 
 * Get the reference angle. 
 * @export 
 * @return {number}
 */
box2d.b2WeldJoint.prototype.GetReferenceAngle = function () { return this.m_referenceAngle; }

/** 
 * Set/get frequency in Hz. 
 * @return {void} 
 * @param {number} hz 
 */
box2d.b2WeldJoint.prototype.SetFrequency = function (hz) { this.m_frequencyHz = hz; }
/** 
 * @export 
 * @return {number}
 */
box2d.b2WeldJoint.prototype.GetFrequency = function () { return this.m_frequencyHz; }

/** 
 * Set/get damping ratio. 
 * @return {void} 
 * @param {number} ratio 
 */
box2d.b2WeldJoint.prototype.SetDampingRatio = function (ratio) { this.m_dampingRatio = ratio; }
/** 
 * @export 
 * @return {number}
 */
box2d.b2WeldJoint.prototype.GetDampingRatio = function () { return this.m_dampingRatio; }

/** 
 * Dump to b2Log 
 * @export 
 * @return {void}
 */
box2d.b2WeldJoint.prototype.Dump = function ()
{
	if (box2d.DEBUG)
	{
		var indexA = this.m_bodyA.m_islandIndex;
		var indexB = this.m_bodyB.m_islandIndex;
	
		box2d.b2Log("  /*box2d.b2WeldJointDef*/ var jd = new box2d.b2WeldJointDef();\n");
		box2d.b2Log("  jd.bodyA = bodies[%d];\n", indexA);
		box2d.b2Log("  jd.bodyB = bodies[%d];\n", indexB);
		box2d.b2Log("  jd.collideConnected = %s;\n", (this.m_collideConnected)?('true'):('false'));
		box2d.b2Log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
		box2d.b2Log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
		box2d.b2Log("  jd.referenceAngle = %.15f;\n", this.m_referenceAngle);
		box2d.b2Log("  jd.frequencyHz = %.15f;\n", this.m_frequencyHz);
		box2d.b2Log("  jd.dampingRatio = %.15f;\n", this.m_dampingRatio);
		box2d.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
	}
}

