/*
* Copyright (c) 2006-2012 Erin Catto http://www.box2d.org
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

goog.provide('box2d.b2MotorJoint');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Math');

/** 
 * Motor joint definition. 
 * @export 
 * @constructor 
 * @extends {box2d.b2JointDef} 
 */
box2d.b2MotorJointDef = function ()
{
	box2d.b2JointDef.call(this, box2d.b2JointType.e_motorJoint); // base class constructor

	this.linearOffset = new box2d.b2Vec2(0, 0);
}

goog.inherits(box2d.b2MotorJointDef, box2d.b2JointDef);

/** 
 * Position of bodyB minus the position of bodyA, in bodyA's 
 * frame, in meters. 
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2MotorJointDef.prototype.linearOffset = null;

/** 
 * The bodyB angle minus bodyA angle in radians. 
 * @export 
 * @type {number}
 */
box2d.b2MotorJointDef.prototype.angularOffset = 0;

/** 
 * The maximum motor force in N. 
 * @export 
 * @type {number}
 */
box2d.b2MotorJointDef.prototype.maxForce = 1;

/** 
 * The maximum motor torque in N-m. 
 * @export 
 * @type {number}
 */
box2d.b2MotorJointDef.prototype.maxTorque = 1;

/** 
 * Position correction factor in the range [0,1]. 
 * @export 
 * @type {number}
 */
box2d.b2MotorJointDef.prototype.correctionFactor = 0.3;

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2Body} bA 
 * @param {box2d.b2Body} bB 
 */
box2d.b2MotorJointDef.prototype.Initialize = function (bA, bB)
{
	this.bodyA = bA;
	this.bodyB = bB;
//	b2Vec2 xB = bodyB->GetPosition();
//	linearOffset = bodyA->GetLocalPoint(xB);
	this.bodyA.GetLocalPoint(this.bodyB.GetPosition(), this.linearOffset);

	/** @type {number} */ var angleA = this.bodyA.GetAngle();
	/** @type {number} */ var angleB = this.bodyB.GetAngle();
	this.angularOffset = angleB - angleA;
}

/** 
 * A motor joint is used to control the relative motion between 
 * two bodies. A typical usage is to control the movement of a 
 * dynamic body with respect to the ground. 
 * @export 
 * @constructor 
 * @extends {box2d.b2Joint} 
 * @param {box2d.b2MotorJointDef} def 
 */
box2d.b2MotorJoint = function (def)
{
	box2d.b2Joint.call(this, def); // base class constructor

	this.m_linearOffset = def.linearOffset.Clone();
	this.m_linearImpulse = new box2d.b2Vec2(0, 0);
	this.m_maxForce = def.maxForce;
	this.m_maxTorque = def.maxTorque;
	this.m_correctionFactor = def.correctionFactor;

	this.m_rA = new box2d.b2Vec2(0, 0);
	this.m_rB = new box2d.b2Vec2(0, 0);
	this.m_localCenterA = new box2d.b2Vec2(0, 0);
	this.m_localCenterB = new box2d.b2Vec2(0, 0);
	this.m_linearError = new box2d.b2Vec2(0, 0);
	this.m_linearMass = new box2d.b2Mat22();

	this.m_qA = new box2d.b2Rot();
	this.m_qB = new box2d.b2Rot();
	this.m_K = new box2d.b2Mat22();
}

goog.inherits(box2d.b2MotorJoint, box2d.b2Joint);

// Solver shared
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2MotorJoint.prototype.m_linearOffset = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2MotorJoint.prototype.m_angularOffset = 0;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2MotorJoint.prototype.m_linearImpulse = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2MotorJoint.prototype.m_angularImpulse = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2MotorJoint.prototype.m_maxForce = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2MotorJoint.prototype.m_maxTorque = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2MotorJoint.prototype.m_correctionFactor = 0.3;

// Solver temp
/**
 * @export 
 * @type {number}
 */
box2d.b2MotorJoint.prototype.m_indexA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2MotorJoint.prototype.m_indexB = 0;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2MotorJoint.prototype.m_rA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2MotorJoint.prototype.m_rB = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2MotorJoint.prototype.m_localCenterA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2MotorJoint.prototype.m_localCenterB = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2MotorJoint.prototype.m_linearError = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2MotorJoint.prototype.m_angularError = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2MotorJoint.prototype.m_invMassA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2MotorJoint.prototype.m_invMassB = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2MotorJoint.prototype.m_invIA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2MotorJoint.prototype.m_invIB = 0;
/**
 * @export 
 * @type {box2d.b2Mat22}
 */
box2d.b2MotorJoint.prototype.m_linearMass = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2MotorJoint.prototype.m_angularMass = 0;

/**
 * @export 
 * @type {box2d.b2Rot}
 */
box2d.b2MotorJoint.prototype.m_qA = null;
/**
 * @export 
 * @type {box2d.b2Rot}
 */
box2d.b2MotorJoint.prototype.m_qB = null;
/**
 * @export 
 * @type {box2d.b2Mat22}
 */
box2d.b2MotorJoint.prototype.m_K = null;

/** 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out 
 */
box2d.b2MotorJoint.prototype.GetAnchorA = function (out)
{
	return this.m_bodyA.GetPosition(out);
}
/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out 
 */
box2d.b2MotorJoint.prototype.GetAnchorB = function (out)
{
	return this.m_bodyB.GetPosition(out);
}

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {number} inv_dt 
 * @param {box2d.b2Vec2} out
 */
box2d.b2MotorJoint.prototype.GetReactionForce = function (inv_dt, out)
{
//	return inv_dt * m_linearImpulse;
	return box2d.b2Mul_S_V2(inv_dt, this.m_linearImpulse, out);
}

/** 
 * @export 
 * @return {number} 
 * @param {number} inv_dt 
 */
box2d.b2MotorJoint.prototype.GetReactionTorque = function (inv_dt)
{
	return inv_dt * this.m_angularImpulse;
}

/**
 * Set the position correction factor in the range [0,1]. 
 * @return {void} 
 * @param {number} factor 
 */
box2d.b2MotorJoint.prototype.SetCorrectionFactor = function (factor)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(box2d.b2IsValid(factor) && 0.0 <= factor && factor <= 1.0) };
	this._correctionFactor = factor;
}

/**
 * Get the position correction factor in the range [0,1]. 
 * @return {number} 
 */
box2d.b2MotorJoint.prototype.GetCorrectionFactor = function ()
{
	return this.m_correctionFactor;
}

/** 
 * Set/get the target linear offset, in frame A, in meters. 
 * @export 
 * @return {void} 
 * @param {box2d.b2Vec2} linearOffset
 */
box2d.b2MotorJoint.prototype.SetLinearOffset = function (linearOffset)
{
	if (linearOffset.x != this.m_linearOffset.x || linearOffset.y != this.m_linearOffset.y)
	{
		this.m_bodyA.SetAwake(true);
		this.m_bodyB.SetAwake(true);
		this.m_linearOffset.Copy(linearOffset);
	}
}
/** 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out 
 */
box2d.b2MotorJoint.prototype.GetLinearOffset = function (out)
{
	return out.Copy(this.m_linearOffset);
}

/** 
 * Set/get the target angular offset, in radians. 
 * @export 
 * @return {void} 
 * @param {number} angularOffset
 */
box2d.b2MotorJoint.prototype.SetAngularOffset = function (angularOffset)
{
	if (angularOffset !== this.m_angularOffset)
	{
		this.m_bodyA.SetAwake(true);
		this.m_bodyB.SetAwake(true);
		this.m_angularOffset = angularOffset;
	}
}
/** 
 * @export 
 * @return {number}
 */
box2d.b2MotorJoint.prototype.GetAngularOffset = function ()
{
	return this.m_angularOffset;
}

/** 
 * Set the maximum friction force in N. 
 * @export 
 * @return {void} 
 * @param {number} force
 */
box2d.b2MotorJoint.prototype.SetMaxForce = function (force)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(box2d.b2IsValid(force) && force >= 0); }
	this.m_maxForce = force;
}

/** 
 * Get the maximum friction force in N. 
 * @export 
 * @return {number}
 */
box2d.b2MotorJoint.prototype.GetMaxForce = function ()
{
	return this.m_maxForce;
}

/** 
 * Set the maximum friction torque in N*m. 
 * @export 
 * @return {void} 
 * @param {number} torque
 */
box2d.b2MotorJoint.prototype.SetMaxTorque = function (torque)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(box2d.b2IsValid(torque) && torque >= 0); }
	this.m_maxTorque = torque;
}

/** 
 * Get the maximum friction torque in N*m. 
 * @export 
 * @return {number}
 */
box2d.b2MotorJoint.prototype.GetMaxTorque = function ()
{
	return this.m_maxTorque;
}

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2SolverData} data
 */
box2d.b2MotorJoint.prototype.InitVelocityConstraints = function (data)
{
	this.m_indexA = this.m_bodyA.m_islandIndex;
	this.m_indexB = this.m_bodyB.m_islandIndex;
	this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
	this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
	this.m_invMassA = this.m_bodyA.m_invMass;
	this.m_invMassB = this.m_bodyB.m_invMass;
	this.m_invIA = this.m_bodyA.m_invI;
	this.m_invIB = this.m_bodyB.m_invI;

	/*box2d.b2Vec2&*/ var cA = data.positions[this.m_indexA].c;
	/*float32*/ var aA = data.positions[this.m_indexA].a;
	/*box2d.b2Vec2&*/ var vA = data.velocities[this.m_indexA].v;
	/*float32*/ var wA = data.velocities[this.m_indexA].w;

	/*box2d.b2Vec2&*/ var cB = data.positions[this.m_indexB].c;
	/*float32*/ var aB = data.positions[this.m_indexB].a;
	/*box2d.b2Vec2&*/ var vB = data.velocities[this.m_indexB].v;
	/*float32*/ var wB = data.velocities[this.m_indexB].w;

	/*box2d.b2Rot*/ var qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);

	// Compute the effective mass matrix.
//	this.m_rA = b2Mul(qA, -this.m_localCenterA);
	var rA = box2d.b2Mul_R_V2(qA, box2d.b2Vec2.s_t0.Copy(this.m_localCenterA).SelfNeg(), this.m_rA);
//	this.m_rB = b2Mul(qB, -this.m_localCenterB); 
	var rB = box2d.b2Mul_R_V2(qB, box2d.b2Vec2.s_t0.Copy(this.m_localCenterB).SelfNeg(), this.m_rB);

	// J = [-I -r1_skew I r2_skew]
	//     [ 0       -1 0       1]
	// r_skew = [-ry; rx]

	// Matlab
	// K = [ mA+r1y^2*iA+mB+r2y^2*iB,  -r1y*iA*r1x-r2y*iB*r2x,          -r1y*iA-r2y*iB]
	//     [  -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB,           r1x*iA+r2x*iB]
	//     [          -r1y*iA-r2y*iB,           r1x*iA+r2x*iB,                   iA+iB]

	/*float32*/ var mA = this.m_invMassA, mB = this.m_invMassB;
	/*float32*/ var iA = this.m_invIA, iB = this.m_invIB;
	 
	/*b2Mat22*/ var K = this.m_K;
	K.ex.x = mA + mB + iA * rA.y * rA.y + iB * rB.y * rB.y;
	K.ex.y = -iA * rA.x * rA.y - iB * rB.x * rB.y;
	K.ey.x = K.ex.y;
	K.ey.y = mA + mB + iA * rA.x * rA.x + iB * rB.x * rB.x;

//	this.m_linearMass = K.GetInverse(); 
	K.GetInverse(this.m_linearMass);

	this.m_angularMass = iA + iB;
	if (this.m_angularMass > 0)
	{
		this.m_angularMass = 1 / this.m_angularMass;
	}

//	this.m_linearError = cB + rB - cA - rA - b2Mul(qA, this.m_linearOffset);
	box2d.b2Sub_V2_V2(
		box2d.b2Sub_V2_V2(
			box2d.b2Add_V2_V2(cB, rB, box2d.b2Vec2.s_t0), 
			box2d.b2Add_V2_V2(cA, rA, box2d.b2Vec2.s_t1), 
			box2d.b2Vec2.s_t2),
		box2d.b2Mul_R_V2(qA, this.m_linearOffset, box2d.b2Vec2.s_t3), 
		this.m_linearError);
	this.m_angularError = aB - aA - this.m_angularOffset; 

	if (data.step.warmStarting)
	{
		// Scale impulses to support a variable time step.
//		this.m_linearImpulse *= data.step.dtRatio;
		this.m_linearImpulse.SelfMul(data.step.dtRatio);
		this.m_angularImpulse *= data.step.dtRatio;

//		b2Vec2 P(this.m_linearImpulse.x, this.m_linearImpulse.y);
		var P = this.m_linearImpulse;
//		vA -= mA * P;
		vA.SelfMulSub(mA, P);
		wA -= iA * (box2d.b2Cross_V2_V2(rA, P) + this.m_angularImpulse);
//		vB += mB * P;
		vB.SelfMulAdd(mB, P);
		wB += iB * (box2d.b2Cross_V2_V2(rB, P) + this.m_angularImpulse);
	}
	else
	{
		this.m_linearImpulse.SetZero();
		this.m_angularImpulse = 0;
	}

//	data.velocities[this.m_indexA].v = vA; // vA is a reference
	data.velocities[this.m_indexA].w = wA;
//	data.velocities[this.m_indexB].v = vB; // vB is a reference
	data.velocities[this.m_indexB].w = wB;
}

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2SolverData} data
 */
box2d.b2MotorJoint.prototype.SolveVelocityConstraints = function (data)
{
	/*box2d.b2Vec2&*/ var vA = data.velocities[this.m_indexA].v;
	/*float32*/ var wA = data.velocities[this.m_indexA].w;
	/*box2d.b2Vec2&*/ var vB = data.velocities[this.m_indexB].v;
	/*float32*/ var wB = data.velocities[this.m_indexB].w;

	/*float32*/ var mA = this.m_invMassA, mB = this.m_invMassB;
	/*float32*/ var iA = this.m_invIA, iB = this.m_invIB;

	/*float32*/ var h = data.step.dt;
	/*float32*/ var inv_h = data.step.inv_dt;

	// Solve angular friction
	{
		/*float32*/ var Cdot = wB - wA + inv_h * this.m_correctionFactor * this.m_angularError;
		/*float32*/ var impulse = -this.m_angularMass * Cdot;

		/*float32*/ var oldImpulse = this.m_angularImpulse;
		/*float32*/ var maxImpulse = h * this.m_maxTorque;
		this.m_angularImpulse = box2d.b2Clamp(this.m_angularImpulse + impulse, -maxImpulse, maxImpulse);
		impulse = this.m_angularImpulse - oldImpulse;

		wA -= iA * impulse;
		wB += iB * impulse;
	}

	// Solve linear friction
	{
		var rA = this.m_rA;
		var rB = this.m_rB;

//		b2Vec2 Cdot = vB + b2CrossSV(wB, rB) - vA - b2CrossSV(wA, rA) + inv_h * this.m_correctionFactor * this.m_linearError;
		var Cdot = 
			box2d.b2Add_V2_V2(
				box2d.b2Sub_V2_V2(
					box2d.b2Add_V2_V2(vB, box2d.b2Cross_S_V2(wB, rB, box2d.b2Vec2.s_t0), box2d.b2Vec2.s_t0), 
					box2d.b2Add_V2_V2(vA, box2d.b2Cross_S_V2(wA, rA, box2d.b2Vec2.s_t1), box2d.b2Vec2.s_t1), box2d.b2Vec2.s_t2), 
				box2d.b2Mul_S_V2(inv_h * this.m_correctionFactor, this.m_linearError, box2d.b2Vec2.s_t3), 
				box2d.b2MotorJoint.prototype.SolveVelocityConstraints.s_Cdot);

//		b2Vec2 impulse = -b2Mul(this.m_linearMass, Cdot);
		var impulse = box2d.b2Mul_M22_V2(this.m_linearMass, Cdot, box2d.b2MotorJoint.prototype.SolveVelocityConstraints.s_impulse).SelfNeg();
//		b2Vec2 oldImpulse = this.m_linearImpulse;
		var oldImpulse = box2d.b2MotorJoint.prototype.SolveVelocityConstraints.s_oldImpulse.Copy(this.m_linearImpulse);
//		this.m_linearImpulse += impulse;
		this.m_linearImpulse.SelfAdd(impulse);

		/*float32*/ var maxImpulse = h * this.m_maxForce;

		if (this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse)
		{
			this.m_linearImpulse.Normalize();
//			this.m_linearImpulse *= maxImpulse;
			this.m_linearImpulse.SelfMul(maxImpulse);
		}

//		impulse = this.m_linearImpulse - oldImpulse;
		box2d.b2Sub_V2_V2(this.m_linearImpulse, oldImpulse, impulse);

//		vA -= mA * impulse;
		vA.SelfMulSub(mA, impulse);
//		wA -= iA * b2CrossVV(rA, impulse);
		wA -= iA * box2d.b2Cross_V2_V2(rA, impulse);

//		vB += mB * impulse;
		vB.SelfMulAdd(mB, impulse);
//		wB += iB * b2CrossVV(rB, impulse);
		wB += iB * box2d.b2Cross_V2_V2(rB, impulse);
	}

//	data.velocities[this.m_indexA].v = vA; // vA is a reference
	data.velocities[this.m_indexA].w = wA;
//	data.velocities[this.m_indexB].v = vB; // vB is a reference
	data.velocities[this.m_indexB].w = wB;
}
box2d.b2MotorJoint.prototype.SolveVelocityConstraints.s_Cdot = new box2d.b2Vec2();
box2d.b2MotorJoint.prototype.SolveVelocityConstraints.s_impulse = new box2d.b2Vec2();
box2d.b2MotorJoint.prototype.SolveVelocityConstraints.s_oldImpulse = new box2d.b2Vec2();

/** 
 * @export 
 * @return {boolean} 
 * @param {box2d.b2SolverData} data 
 */
box2d.b2MotorJoint.prototype.SolvePositionConstraints = function (data)
{
	return true;
}

/** 
 * Dump to b2Log 
 * @export 
 * @return {void}
 */
box2d.b2MotorJoint.prototype.Dump = function ()
{
	if (box2d.DEBUG)
	{
		var indexA = this.m_bodyA.m_islandIndex;
		var indexB = this.m_bodyB.m_islandIndex;

		box2d.b2Log("  /*box2d.b2MotorJointDef*/ var jd = new box2d.b2MotorJointDef();\n");

		box2d.b2Log("  jd.bodyA = bodies[%d];\n", indexA);
		box2d.b2Log("  jd.bodyB = bodies[%d];\n", indexB);
		box2d.b2Log("  jd.collideConnected = %s;\n", (this.m_collideConnected)?('true'):('false'));

		box2d.b2Log("  jd.linearOffset.Set(%.15f, %.15f);\n", this.m_linearOffset.x, this.m_linearOffset.y);
		box2d.b2Log("  jd.angularOffset = %.15f;\n", this.m_angularOffset);
		box2d.b2Log("  jd.maxForce = %.15f;\n", this.m_maxForce);
		box2d.b2Log("  jd.maxTorque = %.15f;\n", this.m_maxTorque);
		box2d.b2Log("  jd.correctionFactor = %.15f;\n", this.m_correctionFactor);
		box2d.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
	}
}

