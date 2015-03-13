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

goog.provide('box2d.b2RevoluteJoint');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Joint');
goog.require('box2d.b2Math');

/** 
 * Revolute joint definition. This requires defining an anchor 
 * point where the bodies are joined. The definition uses local 
 * anchor points so that the initial configuration can violate 
 * the constraint slightly. You also need to specify the initial 
 * relative angle for joint limits. This helps when saving and 
 * loading a game. 
 * The local anchor points are measured from the body's origin 
 * rather than the center of mass because: 
 * 1. you might not know where the center of mass will be. 
 * 2. if you add/remove shapes from a body and recompute the 
 * mass, the joints will be broken. 
 * @export 
 * @constructor 
 * @extends {box2d.b2JointDef} 
 */
box2d.b2RevoluteJointDef = function ()
{
	box2d.b2JointDef.call(this, box2d.b2JointType.e_revoluteJoint); // base class constructor

	this.localAnchorA = new box2d.b2Vec2(0, 0);
	this.localAnchorB = new box2d.b2Vec2(0, 0);
}

goog.inherits(box2d.b2RevoluteJointDef, box2d.b2JointDef);

/** 
 * The local anchor point relative to bodyA's origin. 
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2RevoluteJointDef.prototype.localAnchorA = null;

/** 
 * The local anchor point relative to bodyB's origin. 
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2RevoluteJointDef.prototype.localAnchorB = null;

/** 
 * The bodyB angle minus bodyA angle in the reference state 
 * (radians). 
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJointDef.prototype.referenceAngle = 0;

/** 
 * A flag to enable joint limits. 
 * @export 
 * @type {boolean}
 */
box2d.b2RevoluteJointDef.prototype.enableLimit = false;

/** 
 * The lower angle for the joint limit (radians). 
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJointDef.prototype.lowerAngle = 0;

/** 
 * The upper angle for the joint limit (radians). 
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJointDef.prototype.upperAngle = 0;

/** 
 * A flag to enable the joint motor. 
 * @export 
 * @type {boolean}
 */
box2d.b2RevoluteJointDef.prototype.enableMotor = false;

/** 
 * The desired motor speed. Usually in radians per second. 
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJointDef.prototype.motorSpeed = 0;

/** 
 * The maximum motor torque used to achieve the desired motor 
 * speed. 
 * Usually in N-m. 
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJointDef.prototype.maxMotorTorque = 0;

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2Body} bA 
 * @param {box2d.b2Body} bB 
 * @param {box2d.b2Vec2} anchor 
 */
box2d.b2RevoluteJointDef.prototype.Initialize = function (bA, bB, anchor)
{
	this.bodyA = bA;
	this.bodyB = bB;
	this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
	this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
	this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
}

/** 
 * A revolute joint constrains two bodies to share a common 
 * point while they are free to rotate about the point. The 
 * relative rotation about the shared point is the joint angle. 
 * You can limit the relative rotation with a joint limit that 
 * specifies a lower and upper angle. You can use a motor to 
 * drive the relative rotation about the shared point. A maximum 
 * motor torque is provided so that infinite forces are not 
 * generated. 
 * @export 
 * @constructor 
 * @extends {box2d.b2Joint} 
 * @param {box2d.b2RevoluteJointDef} def 
 */
box2d.b2RevoluteJoint = function (def)
{
	box2d.b2Joint.call(this, def); // base class constructor

	this.m_localAnchorA = new box2d.b2Vec2();
	this.m_localAnchorB = new box2d.b2Vec2();
	this.m_impulse = new box2d.b2Vec3();

	this.m_rA = new box2d.b2Vec2();
	this.m_rB = new box2d.b2Vec2();
	this.m_localCenterA = new box2d.b2Vec2();
	this.m_localCenterB = new box2d.b2Vec2();
	this.m_mass = new box2d.b2Mat33();

	this.m_qA = new box2d.b2Rot();
	this.m_qB = new box2d.b2Rot();
	this.m_lalcA = new box2d.b2Vec2();
	this.m_lalcB = new box2d.b2Vec2();
	this.m_K = new box2d.b2Mat22();

	this.m_localAnchorA.Copy(def.localAnchorA);
	this.m_localAnchorB.Copy(def.localAnchorB);
	this.m_referenceAngle = def.referenceAngle;

	this.m_impulse.SetZero();
	this.m_motorImpulse = 0;

	this.m_lowerAngle = def.lowerAngle;
	this.m_upperAngle = def.upperAngle;
	this.m_maxMotorTorque = def.maxMotorTorque;
	this.m_motorSpeed = def.motorSpeed;
	this.m_enableLimit = def.enableLimit;
	this.m_enableMotor = def.enableMotor;
	this.m_limitState = box2d.b2LimitState.e_inactiveLimit;
}

goog.inherits(box2d.b2RevoluteJoint, box2d.b2Joint);

// Solver shared
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2RevoluteJoint.prototype.m_localAnchorA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2RevoluteJoint.prototype.m_localAnchorB = null;
/**
 * @export 
 * @type {box2d.b2Vec3}
 */
box2d.b2RevoluteJoint.prototype.m_impulse = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJoint.prototype.m_motorImpulse = 0;

/**
 * @export 
 * @type {boolean}
 */
box2d.b2RevoluteJoint.prototype.m_enableMotor = false;
/**
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJoint.prototype.m_maxMotorTorque = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJoint.prototype.m_motorSpeed = 0;

/**
 * @export 
 * @type {boolean}
 */
box2d.b2RevoluteJoint.prototype.m_enableLimit = false;
/**
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJoint.prototype.m_referenceAngle = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJoint.prototype.m_lowerAngle = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJoint.prototype.m_upperAngle = 0;

// Solver temp
/**
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJoint.prototype.m_indexA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJoint.prototype.m_indexB = 0;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2RevoluteJoint.prototype.m_rA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2RevoluteJoint.prototype.m_rB = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2RevoluteJoint.prototype.m_localCenterA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2RevoluteJoint.prototype.m_localCenterB = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJoint.prototype.m_invMassA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJoint.prototype.m_invMassB = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJoint.prototype.m_invIA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJoint.prototype.m_invIB = 0;
/**
 * @export 
 * @type {box2d.b2Mat33}
 */
box2d.b2RevoluteJoint.prototype.m_mass = null; // effective mass for point-to-point constraint.
/**
 * @export 
 * @type {number}
 */
box2d.b2RevoluteJoint.prototype.m_motorMass = 0; // effective mass for motor/limit angular constraint.
/**
 * @export 
 * @type {box2d.b2LimitState}
 */
box2d.b2RevoluteJoint.prototype.m_limitState = box2d.b2LimitState.e_inactiveLimit;

/**
 * @export 
 * @type {box2d.b2Rot}
 */
box2d.b2RevoluteJoint.prototype.m_qA = null;
/**
 * @export 
 * @type {box2d.b2Rot}
 */
box2d.b2RevoluteJoint.prototype.m_qB = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2RevoluteJoint.prototype.m_lalcA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2RevoluteJoint.prototype.m_lalcB = null;
/**
 * @export 
 * @type {box2d.b2Mat22}
 */
box2d.b2RevoluteJoint.prototype.m_K = null;

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2SolverData} data
 */
box2d.b2RevoluteJoint.prototype.InitVelocityConstraints = function (data)
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

//	b2Rot qA(aA), qB(aB);
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

	/*bool*/ var fixedRotation = (iA + iB === 0);

	this.m_mass.ex.x = mA + mB + this.m_rA.y * this.m_rA.y * iA + this.m_rB.y * this.m_rB.y * iB;
	this.m_mass.ey.x = -this.m_rA.y * this.m_rA.x * iA - this.m_rB.y * this.m_rB.x * iB;
	this.m_mass.ez.x = -this.m_rA.y * iA - this.m_rB.y * iB;
	this.m_mass.ex.y = this.m_mass.ey.x;
	this.m_mass.ey.y = mA + mB + this.m_rA.x * this.m_rA.x * iA + this.m_rB.x * this.m_rB.x * iB;
	this.m_mass.ez.y = this.m_rA.x * iA + this.m_rB.x * iB;
	this.m_mass.ex.z = this.m_mass.ez.x;
	this.m_mass.ey.z = this.m_mass.ez.y;
	this.m_mass.ez.z = iA + iB;

	this.m_motorMass = iA + iB;
	if (this.m_motorMass > 0)
	{
		this.m_motorMass = 1 / this.m_motorMass;
	}

	if (!this.m_enableMotor || fixedRotation)
	{
		this.m_motorImpulse = 0;
	}

	if (this.m_enableLimit && !fixedRotation)
	{
		/*float32*/ var jointAngle = aB - aA - this.m_referenceAngle;
		if (box2d.b2Abs(this.m_upperAngle - this.m_lowerAngle) < 2 * box2d.b2_angularSlop)
		{
			this.m_limitState = box2d.b2LimitState.e_equalLimits;
		}
		else if (jointAngle <= this.m_lowerAngle)
		{
			if (this.m_limitState !== box2d.b2LimitState.e_atLowerLimit)
			{
				this.m_impulse.z = 0;
			}
			this.m_limitState = box2d.b2LimitState.e_atLowerLimit;
		}
		else if (jointAngle >= this.m_upperAngle)
		{
			if (this.m_limitState !== box2d.b2LimitState.e_atUpperLimit)
			{
				this.m_impulse.z = 0;
			}
			this.m_limitState = box2d.b2LimitState.e_atUpperLimit;
		}
		else
		{
			this.m_limitState = box2d.b2LimitState.e_inactiveLimit;
			this.m_impulse.z = 0;
		}
	}
	else
	{
		this.m_limitState = box2d.b2LimitState.e_inactiveLimit;
	}

	if (data.step.warmStarting)
	{
		// Scale impulses to support a variable time step.
		this.m_impulse.SelfMulScalar(data.step.dtRatio);
		this.m_motorImpulse *= data.step.dtRatio;

//		b2Vec2 P(m_impulse.x, m_impulse.y);
		var P = box2d.b2RevoluteJoint.prototype.InitVelocityConstraints.s_P.Set(this.m_impulse.x, this.m_impulse.y);

//		vA -= mA * P;
		vA.SelfMulSub(mA, P);
		wA -= iA * (box2d.b2Cross_V2_V2(this.m_rA, P) + this.m_motorImpulse + this.m_impulse.z);

//		vB += mB * P;
		vB.SelfMulAdd(mB, P);
		wB += iB * (box2d.b2Cross_V2_V2(this.m_rB, P) + this.m_motorImpulse + this.m_impulse.z);
	}
	else
	{
		this.m_impulse.SetZero();
		this.m_motorImpulse = 0;
	}

//	data.velocities[this.m_indexA].v = vA;
	data.velocities[this.m_indexA].w = wA;
//	data.velocities[this.m_indexB].v = vB;
	data.velocities[this.m_indexB].w = wB;
}
box2d.b2RevoluteJoint.prototype.InitVelocityConstraints.s_P = new box2d.b2Vec2();

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2SolverData} data
 */
box2d.b2RevoluteJoint.prototype.SolveVelocityConstraints = function (data)
{
	/*box2d.b2Vec2&*/ var vA = data.velocities[this.m_indexA].v;
	/*float32*/ var wA = data.velocities[this.m_indexA].w;
	/*box2d.b2Vec2&*/ var vB = data.velocities[this.m_indexB].v;
	/*float32*/ var wB = data.velocities[this.m_indexB].w;

	/*float32*/ var mA = this.m_invMassA, mB = this.m_invMassB;
	/*float32*/ var iA = this.m_invIA, iB = this.m_invIB;

	/*bool*/ var fixedRotation = (iA + iB === 0);

	// Solve motor constraint.
	if (this.m_enableMotor && this.m_limitState !== box2d.b2LimitState.e_equalLimits && !fixedRotation)
	{
		/*float32*/ var Cdot = wB - wA - this.m_motorSpeed;
		/*float32*/ var impulse = -this.m_motorMass * Cdot;
		/*float32*/ var oldImpulse = this.m_motorImpulse;
		/*float32*/ var maxImpulse = data.step.dt * this.m_maxMotorTorque;
		this.m_motorImpulse = box2d.b2Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
		impulse = this.m_motorImpulse - oldImpulse;

		wA -= iA * impulse;
		wB += iB * impulse;
	}

	// Solve limit constraint.
	if (this.m_enableLimit && this.m_limitState !== box2d.b2LimitState.e_inactiveLimit && !fixedRotation)
	{
//		b2Vec2 Cdot1 = vB + b2Cross(wB, m_rB) - vA - b2Cross(wA, m_rA);
		var Cdot1 = box2d.b2Sub_V2_V2(
			box2d.b2AddCross_V2_S_V2(vB, wB, this.m_rB, box2d.b2Vec2.s_t0),
			box2d.b2AddCross_V2_S_V2(vA, wA, this.m_rA, box2d.b2Vec2.s_t1),
			box2d.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_Cdot1)
		/*float32*/ var Cdot2 = wB - wA;
//		b2Vec3 Cdot(Cdot1.x, Cdot1.y, Cdot2);

//		b2Vec3 impulse = -this.m_mass.Solve33(Cdot);
		var impulse = this.m_mass.Solve33(Cdot1.x, Cdot1.y, Cdot2, box2d.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_impulse3).SelfNeg();

		if (this.m_limitState === box2d.b2LimitState.e_equalLimits)
		{
			this.m_impulse.SelfAdd(impulse);
		}
		else if (this.m_limitState === box2d.b2LimitState.e_atLowerLimit)
		{
			/*float32*/ var newImpulse = this.m_impulse.z + impulse.z;
			if (newImpulse < 0)
			{
//				b2Vec2 rhs = -Cdot1 + m_impulse.z * b2Vec2(m_mass.ez.x, m_mass.ez.y);
				var rhs_x = -Cdot1.x + this.m_impulse.z * this.m_mass.ez.x;
				var rhs_y = -Cdot1.y + this.m_impulse.z * this.m_mass.ez.y;
				/*box2d.b2Vec2*/ var reduced = this.m_mass.Solve22(rhs_x, rhs_y, box2d.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_reduced);
				impulse.x = reduced.x;
				impulse.y = reduced.y;
				impulse.z = -this.m_impulse.z;
				this.m_impulse.x += reduced.x;
				this.m_impulse.y += reduced.y;
				this.m_impulse.z = 0;
			}
			else
			{
				this.m_impulse.SelfAdd(impulse);
			}
		}
		else if (this.m_limitState === box2d.b2LimitState.e_atUpperLimit)
		{
			/*float32*/ var newImpulse = this.m_impulse.z + impulse.z;
			if (newImpulse > 0)
			{
//				b2Vec2 rhs = -Cdot1 + m_impulse.z * b2Vec2(m_mass.ez.x, m_mass.ez.y);
				var rhs_x = -Cdot1.x + this.m_impulse.z * this.m_mass.ez.x;
				var rhs_y = -Cdot1.y + this.m_impulse.z * this.m_mass.ez.y;
				/*box2d.b2Vec2*/ var reduced = this.m_mass.Solve22(rhs_x, rhs_y, box2d.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_reduced);
				impulse.x = reduced.x;
				impulse.y = reduced.y;
				impulse.z = -this.m_impulse.z;
				this.m_impulse.x += reduced.x;
				this.m_impulse.y += reduced.y;
				this.m_impulse.z = 0;
			}
			else
			{
				this.m_impulse.SelfAdd(impulse);
			}
		}

//		b2Vec2 P(impulse.x, impulse.y);
		var P = box2d.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_P.Set(impulse.x, impulse.y);

//		vA -= mA * P;
		vA.SelfMulSub(mA, P);
		wA -= iA * (box2d.b2Cross_V2_V2(this.m_rA, P) + impulse.z);

//		vB += mB * P;
		vB.SelfMulAdd(mB, P);
		wB += iB * (box2d.b2Cross_V2_V2(this.m_rB, P) + impulse.z);
	}
	else
	{
		// Solve point-to-point constraint
//		b2Vec2 Cdot = vB + b2Cross(wB, m_rB) - vA - b2Cross(wA, m_rA);
		var Cdot = box2d.b2Sub_V2_V2(
			box2d.b2AddCross_V2_S_V2(vB, wB, this.m_rB, box2d.b2Vec2.s_t0),
			box2d.b2AddCross_V2_S_V2(vA, wA, this.m_rA, box2d.b2Vec2.s_t1),
			box2d.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_Cdot)
//		b2Vec2 impulse = m_mass.Solve22(-Cdot);
		/*box2d.b2Vec2*/ var impulse = this.m_mass.Solve22(-Cdot.x, -Cdot.y, box2d.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_impulse2);

		this.m_impulse.x += impulse.x;
		this.m_impulse.y += impulse.y;

//		vA -= mA * impulse;
		vA.SelfMulSub(mA, impulse);
		wA -= iA * box2d.b2Cross_V2_V2(this.m_rA, impulse);

//		vB += mB * impulse;
		vB.SelfMulAdd(mB, impulse);
		wB += iB * box2d.b2Cross_V2_V2(this.m_rB, impulse);
	}

//	data.velocities[this.m_indexA].v = vA;
	data.velocities[this.m_indexA].w = wA;
//	data.velocities[this.m_indexB].v = vB;
	data.velocities[this.m_indexB].w = wB;
}
box2d.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_P = new box2d.b2Vec2();
box2d.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_Cdot = new box2d.b2Vec2();
box2d.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_Cdot1 = new box2d.b2Vec2();
box2d.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_impulse3 = new box2d.b2Vec3();
box2d.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_reduced = new box2d.b2Vec2();
box2d.b2RevoluteJoint.prototype.SolveVelocityConstraints.s_impulse2 = new box2d.b2Vec2();

/** 
 * @export 
 * @return {boolean} 
 * @param {box2d.b2SolverData} data 
 */
box2d.b2RevoluteJoint.prototype.SolvePositionConstraints = function (data)
{
	/*box2d.b2Vec2&*/ var cA = data.positions[this.m_indexA].c;
	/*float32*/ var aA = data.positions[this.m_indexA].a;
	/*box2d.b2Vec2&*/ var cB = data.positions[this.m_indexB].c;
	/*float32*/ var aB = data.positions[this.m_indexB].a;

//	b2Rot qA(aA), qB(aB);
	/*box2d.b2Rot*/ var qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);

	/*float32*/ var angularError = 0;
	/*float32*/ var positionError = 0;

	/*bool*/ var fixedRotation = (this.m_invIA + this.m_invIB === 0);

	// Solve angular limit constraint.
	if (this.m_enableLimit && this.m_limitState !== box2d.b2LimitState.e_inactiveLimit && !fixedRotation)
	{
		/*float32*/ var angle = aB - aA - this.m_referenceAngle;
		/*float32*/ var limitImpulse = 0;

		if (this.m_limitState === box2d.b2LimitState.e_equalLimits)
		{
			// Prevent large angular corrections
			/*float32*/ var C = box2d.b2Clamp(angle - this.m_lowerAngle, -box2d.b2_maxAngularCorrection, box2d.b2_maxAngularCorrection);
			limitImpulse = -this.m_motorMass * C;
			angularError = box2d.b2Abs(C);
		}
		else if (this.m_limitState === box2d.b2LimitState.e_atLowerLimit)
		{
			/*float32*/ var C = angle - this.m_lowerAngle;
			angularError = -C;

			// Prevent large angular corrections and allow some slop.
			C = box2d.b2Clamp(C + box2d.b2_angularSlop, -box2d.b2_maxAngularCorrection, 0);
			limitImpulse = -this.m_motorMass * C;
		}
		else if (this.m_limitState === box2d.b2LimitState.e_atUpperLimit)
		{
			/*float32*/ var C = angle - this.m_upperAngle;
			angularError = C;

			// Prevent large angular corrections and allow some slop.
			C = box2d.b2Clamp(C - box2d.b2_angularSlop, 0, box2d.b2_maxAngularCorrection);
			limitImpulse = -this.m_motorMass * C;
		}

		aA -= this.m_invIA * limitImpulse;
		aB += this.m_invIB * limitImpulse;
	}

	// Solve point-to-point constraint.
	{
		qA.SetAngle(aA);
		qB.SetAngle(aB);
//		b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
		box2d.b2Sub_V2_V2(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
		var rA = box2d.b2Mul_R_V2(qA, this.m_lalcA, this.m_rA);
//		b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
		box2d.b2Sub_V2_V2(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
		var rB = box2d.b2Mul_R_V2(qB, this.m_lalcB, this.m_rB);

//		b2Vec2 C = cB + rB - cA - rA;
		var C = 
			box2d.b2Sub_V2_V2(
				box2d.b2Add_V2_V2(cB, rB, box2d.b2Vec2.s_t0), 
				box2d.b2Add_V2_V2(cA, rA, box2d.b2Vec2.s_t1), 
				box2d.b2RevoluteJoint.prototype.SolvePositionConstraints.s_C);
		positionError = C.Length();

		/*float32*/ var mA = this.m_invMassA, mB = this.m_invMassB;
		/*float32*/ var iA = this.m_invIA, iB = this.m_invIB;

		var K = this.m_K;
		K.ex.x = mA + mB + iA * rA.y * rA.y + iB * rB.y * rB.y;
		K.ex.y = -iA * rA.x * rA.y - iB * rB.x * rB.y;
		K.ey.x = K.ex.y;
		K.ey.y = mA + mB + iA * rA.x * rA.x + iB * rB.x * rB.x;

//		b2Vec2 impulse = -K.Solve(C);
		/*box2d.b2Vec2*/ var impulse = K.Solve(C.x, C.y, box2d.b2RevoluteJoint.prototype.SolvePositionConstraints.s_impulse).SelfNeg();

//		cA -= mA * impulse;
		cA.SelfMulSub(mA, impulse);
		aA -= iA * box2d.b2Cross_V2_V2(rA, impulse);

//		cB += mB * impulse;
		cB.SelfMulAdd(mB, impulse);
		aB += iB * box2d.b2Cross_V2_V2(rB, impulse);
	}

//	data.positions[this.m_indexA].c = cA;
	data.positions[this.m_indexA].a = aA;
//	data.positions[this.m_indexB].c = cB;
	data.positions[this.m_indexB].a = aB;
	
	return positionError <= box2d.b2_linearSlop && angularError <= box2d.b2_angularSlop;
}
box2d.b2RevoluteJoint.prototype.SolvePositionConstraints.s_C = new box2d.b2Vec2();
box2d.b2RevoluteJoint.prototype.SolvePositionConstraints.s_impulse = new box2d.b2Vec2();

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2RevoluteJoint.prototype.GetAnchorA = function (out)
{
	return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
}

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2RevoluteJoint.prototype.GetAnchorB = function (out)
{
	return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
}

/** 
 * Get the reaction force given the inverse time step. 
 * Unit is N.
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {number} inv_dt 
 * @param {box2d.b2Vec2} out
 */
box2d.b2RevoluteJoint.prototype.GetReactionForce = function (inv_dt, out)
{
//	b2Vec2 P(this.m_impulse.x, this.m_impulse.y);
//	return inv_dt * P;
	return out.Set(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y);
}

/** 
 * Get the reaction torque due to the joint limit given the 
 * inverse time step. 
 * Unit is N*m. 
 * @export 
 * @return {number} 
 * @param {number} inv_dt 
 */
box2d.b2RevoluteJoint.prototype.GetReactionTorque = function (inv_dt)
{
	return inv_dt * this.m_impulse.z;
}

/** 
 * The local anchor point relative to bodyA's origin. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out 
 */
box2d.b2RevoluteJoint.prototype.GetLocalAnchorA = function (out) { return out.Copy(this.m_localAnchorA); }

/** 
 * The local anchor point relative to bodyB's origin. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2=} out 
 */
box2d.b2RevoluteJoint.prototype.GetLocalAnchorB = function (out) { return out.Copy(this.m_localAnchorB); }

/** 
 * Get the reference angle. 
 * @export 
 * @return {number}
 */
box2d.b2RevoluteJoint.prototype.GetReferenceAngle = function () { return this.m_referenceAngle; }

/** 
 * @export 
 * @return {number}
 */
box2d.b2RevoluteJoint.prototype.GetJointAngle = function ()
{
//	b2Body* bA = this.m_bodyA;
//	b2Body* bB = this.m_bodyB;
//	return bB->this.m_sweep.a - bA->this.m_sweep.a - this.m_referenceAngle;
	return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a - this.m_referenceAngle;
}

/** 
 * @export 
 * @return {number}
 */
box2d.b2RevoluteJoint.prototype.GetJointSpeed = function ()
{
//	b2Body* bA = this.m_bodyA;
//	b2Body* bB = this.m_bodyB;
//	return bB->this.m_angularVelocity - bA->this.m_angularVelocity;
	return this.m_bodyB.m_angularVelocity - this.m_bodyA.m_angularVelocity;
}

/** 
 * @export 
 * @return {boolean}
 */
box2d.b2RevoluteJoint.prototype.IsMotorEnabled = function ()
{
	return this.m_enableMotor;
}

/** 
 * @export 
 * @return {void} 
 * @param {boolean} flag
 */
box2d.b2RevoluteJoint.prototype.EnableMotor = function (flag)
{
	if (this.m_enableMotor !== flag)
	{
		this.m_bodyA.SetAwake(true);
		this.m_bodyB.SetAwake(true);
		this.m_enableMotor = flag;
	}
}

/** 
 * Get the current motor torque given the inverse time step. 
 * Unit is N*m. 
 * @export 
 * @return {number}
 * @param {number} inv_dt 
 */
box2d.b2RevoluteJoint.prototype.GetMotorTorque = function (inv_dt)
{
	return inv_dt * this.m_motorImpulse;
}

/** 
 * @export 
 * @return {number}
 */
box2d.b2RevoluteJoint.prototype.GetMotorSpeed = function ()
{
	return this.m_motorSpeed;
}

/** 
 * @export 
 * @return {void} 
 * @param {number} torque
 */
box2d.b2RevoluteJoint.prototype.SetMaxMotorTorque = function (torque)
{
	this.m_maxMotorTorque = torque;
}

/** 
 * @export 
 * @return {number}
 */
box2d.b2RevoluteJoint.prototype.GetMaxMotorTorque = function () { return this.m_maxMotorTorque; }

/** 
 * @export 
 * @return {boolean}
 */
box2d.b2RevoluteJoint.prototype.IsLimitEnabled = function ()
{
	return this.m_enableLimit;
}

/** 
 * @export 
 * @return {void} 
 * @param {boolean} flag
 */
box2d.b2RevoluteJoint.prototype.EnableLimit = function (flag)
{
	if (flag !== this.m_enableLimit)
	{
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
box2d.b2RevoluteJoint.prototype.GetLowerLimit = function ()
{
	return this.m_lowerAngle;
}

/** 
 * @export 
 * @return {number}
 */
box2d.b2RevoluteJoint.prototype.GetUpperLimit = function ()
{
	return this.m_upperAngle;
}

/** 
 * @export 
 * @return {void} 
 * @param {number} lower 
 * @param {number} upper 
 */
box2d.b2RevoluteJoint.prototype.SetLimits = function (lower, upper)
{
	
	if (lower !== this.m_lowerAngle || upper !== this.m_upperAngle)
	{
		this.m_bodyA.SetAwake(true);
		this.m_bodyB.SetAwake(true);
		this.m_impulse.z = 0;
		this.m_lowerAngle = lower;
		this.m_upperAngle = upper;
	}
}

/** 
 * @export 
 * @return {void} 
 * @param {number} speed
 */
box2d.b2RevoluteJoint.prototype.SetMotorSpeed = function (speed)
{
	if (this.m_motorSpeed !== speed)
	{
		this.m_bodyA.SetAwake(true);
		this.m_bodyB.SetAwake(true);
		this.m_motorSpeed = speed;
	}
}

/** 
 * Dump to b2Log. 
 * @export 
 * @return {void}
 */
box2d.b2RevoluteJoint.prototype.Dump = function ()
{
	if (box2d.DEBUG)
	{
		var indexA = this.m_bodyA.m_islandIndex;
		var indexB = this.m_bodyB.m_islandIndex;
	
		box2d.b2Log("  /*box2d.b2RevoluteJointDef*/ var jd = new box2d.b2RevoluteJointDef();\n");
		box2d.b2Log("  jd.bodyA = bodies[%d];\n", indexA);
		box2d.b2Log("  jd.bodyB = bodies[%d];\n", indexB);
		box2d.b2Log("  jd.collideConnected = %s;\n", (this.m_collideConnected)?('true'):('false'));
		box2d.b2Log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
		box2d.b2Log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
		box2d.b2Log("  jd.referenceAngle = %.15f;\n", this.m_referenceAngle);
		box2d.b2Log("  jd.enableLimit = %s;\n", (this.m_enableLimit)?('true'):('false'));
		box2d.b2Log("  jd.lowerAngle = %.15f;\n", this.m_lowerAngle);
		box2d.b2Log("  jd.upperAngle = %.15f;\n", this.m_upperAngle);
		box2d.b2Log("  jd.enableMotor = %s;\n", (this.m_enableMotor)?('true'):('false'));
		box2d.b2Log("  jd.motorSpeed = %.15f;\n", this.m_motorSpeed);
		box2d.b2Log("  jd.maxMotorTorque = %.15f;\n", this.m_maxMotorTorque);
		box2d.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
	}
}

