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

goog.provide('box2d.b2ContactSolver');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Math');
goog.require('box2d.b2Collision');
goog.require('box2d.b2CircleContact');
goog.require('box2d.b2PolygonAndCircleContact');
goog.require('box2d.b2PolygonContact');
goog.require('box2d.b2EdgeAndCircleContact');
goog.require('box2d.b2EdgeAndPolygonContact');
goog.require('box2d.b2ChainAndCircleContact');
goog.require('box2d.b2ChainAndPolygonContact');

/**
 * @type {boolean}
 */
box2d.g_blockSolve = true;

/**
 * @export 
 * @constructor
 */
box2d.b2VelocityConstraintPoint = function ()
{
	this.rA = new box2d.b2Vec2();
	this.rB = new box2d.b2Vec2();
};

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2VelocityConstraintPoint.prototype.rA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2VelocityConstraintPoint.prototype.rB = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2VelocityConstraintPoint.prototype.normalImpulse = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2VelocityConstraintPoint.prototype.tangentImpulse = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2VelocityConstraintPoint.prototype.normalMass = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2VelocityConstraintPoint.prototype.tangentMass = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2VelocityConstraintPoint.prototype.velocityBias = 0;

/**
 * @export 
 * @return {Array.<box2d.b2VelocityConstraintPoint>}
 * @param {number} length 
 */
box2d.b2VelocityConstraintPoint.MakeArray = function (length)
{
	return box2d.b2MakeArray(length, function (i) { return new box2d.b2VelocityConstraintPoint(); });
}

/**
 * @export 
 * @constructor
 */
box2d.b2ContactVelocityConstraint = function ()
{
	this.points = box2d.b2VelocityConstraintPoint.MakeArray(box2d.b2_maxManifoldPoints);
	this.normal = new box2d.b2Vec2();
	this.tangent = new box2d.b2Vec2();
	this.normalMass = new box2d.b2Mat22();
	this.K = new box2d.b2Mat22();
}

/**
 * @export 
 * @type {Array.<box2d.b2VelocityConstraintPoint>}
 */
box2d.b2ContactVelocityConstraint.prototype.points = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2ContactVelocityConstraint.prototype.normal = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2ContactVelocityConstraint.prototype.tangent = null; // compute from normal
/**
 * @export 
 * @type {box2d.b2Mat22}
 */
box2d.b2ContactVelocityConstraint.prototype.normalMass = null;
/**
 * @export 
 * @type {box2d.b2Mat22}
 */
box2d.b2ContactVelocityConstraint.prototype.K = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactVelocityConstraint.prototype.indexA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactVelocityConstraint.prototype.indexB = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactVelocityConstraint.prototype.invMassA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactVelocityConstraint.prototype.invMassB = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactVelocityConstraint.prototype.invIA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactVelocityConstraint.prototype.invIB = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactVelocityConstraint.prototype.friction = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactVelocityConstraint.prototype.restitution = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactVelocityConstraint.prototype.tangentSpeed = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactVelocityConstraint.prototype.pointCount = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactVelocityConstraint.prototype.contactIndex = 0;

/**
 * @export 
 * @return {Array.<box2d.b2ContactVelocityConstraint>}
 * @param {number} length 
 */
box2d.b2ContactVelocityConstraint.MakeArray = function (length)
{
	return box2d.b2MakeArray(length, function (i) { return new box2d.b2ContactVelocityConstraint(); } );
}

/**
 * @export 
 * @constructor
 */
box2d.b2ContactPositionConstraint = function ()
{
	this.localPoints = box2d.b2Vec2.MakeArray(box2d.b2_maxManifoldPoints);
	this.localNormal = new box2d.b2Vec2();
	this.localPoint = new box2d.b2Vec2();
	this.localCenterA = new box2d.b2Vec2();
	this.localCenterB = new box2d.b2Vec2();
};

/**
 * @export 
 * @type {Array.<box2d.b2Vec2>}
 */
box2d.b2ContactPositionConstraint.prototype.localPoints = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2ContactPositionConstraint.prototype.localNormal = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2ContactPositionConstraint.prototype.localPoint = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactPositionConstraint.prototype.indexA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactPositionConstraint.prototype.indexB = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactPositionConstraint.prototype.invMassA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactPositionConstraint.prototype.invMassB = 0;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2ContactPositionConstraint.prototype.localCenterA = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2ContactPositionConstraint.prototype.localCenterB = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactPositionConstraint.prototype.invIA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactPositionConstraint.prototype.invIB = 0;
/**
 * @export 
 * @type {box2d.b2ManifoldType}
 */
box2d.b2ContactPositionConstraint.prototype.type = box2d.b2ManifoldType.e_unknown;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactPositionConstraint.prototype.radiusA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactPositionConstraint.prototype.radiusB = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactPositionConstraint.prototype.pointCount = 0;

/**
 * @export 
 * @return {Array.<box2d.b2ContactPositionConstraint>}
 * @param {number} length 
 */
box2d.b2ContactPositionConstraint.MakeArray = function (length)
{
	return box2d.b2MakeArray(length, function (i) { return new box2d.b2ContactPositionConstraint(); } );
}

/**
 * @export 
 * @constructor
 */
box2d.b2ContactSolverDef = function ()
{
	this.step = new box2d.b2TimeStep();
};

/**
 * @export 
 * @type {box2d.b2TimeStep}
 */
box2d.b2ContactSolverDef.prototype.step = null;
/**
 * @export 
 * @type {Array.<box2d.b2Contact>}
 */
box2d.b2ContactSolverDef.prototype.contacts = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactSolverDef.prototype.count = 0;
/**
 * @export 
 * @type {Array.<box2d.b2Position>}
 */
box2d.b2ContactSolverDef.prototype.positions = null;
/**
 * @export 
 * @type {Array.<box2d.b2Velocity>}
 */
box2d.b2ContactSolverDef.prototype.velocities = null;
/**
 * @export 
 * @type {*}
 */
box2d.b2ContactSolverDef.prototype.allocator = null;

/**
 * @export 
 * @constructor
 */
box2d.b2ContactSolver = function ()
{
	this.m_step = new box2d.b2TimeStep();
	this.m_positionConstraints = box2d.b2ContactPositionConstraint.MakeArray(1024); // TODO: b2Settings
	this.m_velocityConstraints = box2d.b2ContactVelocityConstraint.MakeArray(1024); // TODO: b2Settings
}

/**
 * @export 
 * @type {box2d.b2TimeStep}
 */
box2d.b2ContactSolver.prototype.m_step = null;
/**
 * @export 
 * @type {Array.<box2d.b2Position>}
 */
box2d.b2ContactSolver.prototype.m_positions = null;
/**
 * @export 
 * @type {Array.<box2d.b2Velocity>}
 */
box2d.b2ContactSolver.prototype.m_velocities = null;
/**
 * @export 
 * @type {*}
 */
box2d.b2ContactSolver.prototype.m_allocator = null;
/**
 * @export 
 * @type {Array.<box2d.b2ContactPositionConstraint>}
 */
box2d.b2ContactSolver.prototype.m_positionConstraints = null;
/**
 * @export 
 * @type {Array.<box2d.b2ContactVelocityConstraint>}
 */
box2d.b2ContactSolver.prototype.m_velocityConstraints = null;
/**
 * @export 
 * @type {Array.<box2d.b2Contact>}
 */
box2d.b2ContactSolver.prototype.m_contacts = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactSolver.prototype.m_count = 0;

/** 
 * @export 
 * @return {box2d.b2ContactSolver} 
 * @param {box2d.b2ContactSolverDef} def 
 */
box2d.b2ContactSolver.prototype.Initialize = function (def)
{
	this.m_step.Copy(def.step);
	this.m_allocator = def.allocator;
	this.m_count = def.count;
	// TODO:
	if (this.m_positionConstraints.length < this.m_count)
	{
		var new_length = box2d.b2Max(this.m_positionConstraints.length * 2, this.m_count);

		if (box2d.DEBUG)
		{
			window.console.log("box2d.b2ContactSolver.m_positionConstraints: " + new_length);
		}

		while (this.m_positionConstraints.length < new_length)
		{
			this.m_positionConstraints[this.m_positionConstraints.length] = new box2d.b2ContactPositionConstraint();
		}
	}
	// TODO:
	if (this.m_velocityConstraints.length < this.m_count)
	{
		var new_length = box2d.b2Max(this.m_velocityConstraints.length * 2, this.m_count);

		if (box2d.DEBUG)
		{
			window.console.log("box2d.b2ContactSolver.m_velocityConstraints: " + new_length);
		}

		while (this.m_velocityConstraints.length < new_length)
		{
			this.m_velocityConstraints[this.m_velocityConstraints.length] = new box2d.b2ContactVelocityConstraint();
		}
	}
	this.m_positions = def.positions;
	this.m_velocities = def.velocities;
	this.m_contacts = def.contacts;

	/** @type {number} */ var i;
	/** @type {number} */ var ict;
	/** @type {number} */ var j;
	/** @type {number} */ var jct;

	/** @type {box2d.b2Contact} */ var contact;

	/** @type {box2d.b2Fixture} */ var fixtureA;
	/** @type {box2d.b2Fixture} */ var fixtureB;
	/** @type {box2d.b2Shape} */ var shapeA;
	/** @type {box2d.b2Shape} */ var shapeB;
	/** @type {number} */ var radiusA;
	/** @type {number} */ var radiusB;
	/** @type {box2d.b2Body} */ var bodyA;
	/** @type {box2d.b2Body} */ var bodyB;
	/** @type {box2d.b2Manifold} */ var manifold;

	/** @type {number} */ var pointCount;

	/** @type {box2d.b2ContactVelocityConstraint} */ var vc;
	/** @type {box2d.b2ContactPositionConstraint} */ var pc;

	/** @type {box2d.b2ManifoldPoint} */ var cp;
	/** @type {box2d.b2VelocityConstraintPoint} */ var vcp;

	// Initialize position independent portions of the constraints.
	for (i = 0, ict = this.m_count; i < ict; ++i)
	{
		contact = this.m_contacts[i];

		fixtureA = contact.m_fixtureA;
		fixtureB = contact.m_fixtureB;
		shapeA = fixtureA.GetShape();
		shapeB = fixtureB.GetShape();
		radiusA = shapeA.m_radius;
		radiusB = shapeB.m_radius;
		bodyA = fixtureA.GetBody();
		bodyB = fixtureB.GetBody();
		manifold = contact.GetManifold();

		pointCount = manifold.pointCount;
		if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(pointCount > 0); }

		vc = this.m_velocityConstraints[i];
		vc.friction = contact.m_friction;
		vc.restitution = contact.m_restitution;
		vc.tangentSpeed = contact.m_tangentSpeed;
		vc.indexA = bodyA.m_islandIndex;
		vc.indexB = bodyB.m_islandIndex;
		vc.invMassA = bodyA.m_invMass;
		vc.invMassB = bodyB.m_invMass;
		vc.invIA = bodyA.m_invI;
		vc.invIB = bodyB.m_invI;
		vc.contactIndex = i;
		vc.pointCount = pointCount;
		vc.K.SetZero();
		vc.normalMass.SetZero();

		pc = this.m_positionConstraints[i];
		pc.indexA = bodyA.m_islandIndex;
		pc.indexB = bodyB.m_islandIndex;
		pc.invMassA = bodyA.m_invMass;
		pc.invMassB = bodyB.m_invMass;
		pc.localCenterA.Copy(bodyA.m_sweep.localCenter);
		pc.localCenterB.Copy(bodyB.m_sweep.localCenter);
		pc.invIA = bodyA.m_invI;
		pc.invIB = bodyB.m_invI;
		pc.localNormal.Copy(manifold.localNormal);
		pc.localPoint.Copy(manifold.localPoint);
		pc.pointCount = pointCount;
		pc.radiusA = radiusA;
		pc.radiusB = radiusB;
		pc.type = manifold.type;

		for (j = 0, jct = pointCount; j < jct; ++j)
		{
			cp = manifold.points[j];
			vcp = vc.points[j];
	
			if (this.m_step.warmStarting)
			{
				vcp.normalImpulse = this.m_step.dtRatio * cp.normalImpulse;
				vcp.tangentImpulse = this.m_step.dtRatio * cp.tangentImpulse;
			}
			else
			{
				vcp.normalImpulse = 0;
				vcp.tangentImpulse = 0;
			}

			vcp.rA.SetZero();
			vcp.rB.SetZero();
			vcp.normalMass = 0;
			vcp.tangentMass = 0;
			vcp.velocityBias = 0;

			pc.localPoints[j].Copy(cp.localPoint);
		}
	}

	return this;
}

/**
 * Initialize position dependent portions of the velocity 
 * constraints. 
 * @export 
 * @return {void} 
 */
box2d.b2ContactSolver.prototype.InitializeVelocityConstraints = function ()
{
	/** @type {number} */ var i;
	/** @type {number} */ var ict;
	/** @type {number} */ var j;
	/** @type {number} */ var jct;

	/** @type {box2d.b2ContactVelocityConstraint} */ var vc;
	/** @type {box2d.b2ContactPositionConstraint} */ var pc;

	/** @type {number} */ var radiusA;
	/** @type {number} */ var radiusB;
	/** @type {box2d.b2Manifold} */ var manifold;

	/** @type {number} */ var indexA;
	/** @type {number} */ var indexB;

	/** @type {number} */ var mA;
	/** @type {number} */ var mB;
	/** @type {number} */ var iA;
	/** @type {number} */ var iB;
	/** @type {box2d.b2Vec2} */ var localCenterA;
	/** @type {box2d.b2Vec2} */ var localCenterB;

	/** @type {box2d.b2Vec2} */ var cA;
	/** @type {number} */ var aA;
	/** @type {box2d.b2Vec2} */ var vA;
	/** @type {number} */ var wA;

	/** @type {box2d.b2Vec2} */ var cB;
	/** @type {number} */ var aB;
	/** @type {box2d.b2Vec2} */ var vB;
	/** @type {number} */ var wB;

	/** @type {box2d.b2Transform} */ var xfA = box2d.b2ContactSolver.prototype.InitializeVelocityConstraints.s_xfA;
	/** @type {box2d.b2Transform} */ var xfB = box2d.b2ContactSolver.prototype.InitializeVelocityConstraints.s_xfB;

	/** @type {box2d.b2WorldManifold} */ var worldManifold = box2d.b2ContactSolver.prototype.InitializeVelocityConstraints.s_worldManifold;

	/** @type {number} */ var pointCount;

	/** @type {box2d.b2VelocityConstraintPoint} */ var vcp;

	/** @type {number} */ var rnA;
	/** @type {number} */ var rnB;

	/** @type {number} */ var kNormal;

	/** @type {box2d.b2Vec2} */ var tangent;

	/** @type {number} */ var rtA;
	/** @type {number} */ var rtB;

	/** @type {number} */ var kTangent;

	/** @type {number} */ var vRel;

	/** @type {box2d.b2VelocityConstraintPoint} */ var vcp1;
	/** @type {box2d.b2VelocityConstraintPoint} */ var vcp2;

	/** @type {number} */ var rn1A;
	/** @type {number} */ var rn1B;
	/** @type {number} */ var rn2A;
	/** @type {number} */ var rn2B;

	/** @type {number} */ var k11;
	/** @type {number} */ var k22;
	/** @type {number} */ var k12;

	/** @type {number} */ var k_maxConditionNumber = 1000;

	for (i = 0, ict = this.m_count; i < ict; ++i)
	{
		vc = this.m_velocityConstraints[i];
		pc = this.m_positionConstraints[i];

		radiusA = pc.radiusA;
		radiusB = pc.radiusB;
		manifold = this.m_contacts[vc.contactIndex].GetManifold();

		indexA = vc.indexA;
		indexB = vc.indexB;

		mA = vc.invMassA;
		mB = vc.invMassB;
		iA = vc.invIA;
		iB = vc.invIB;
		localCenterA = pc.localCenterA;
		localCenterB = pc.localCenterB;

		cA = this.m_positions[indexA].c;
		aA = this.m_positions[indexA].a;
		vA = this.m_velocities[indexA].v;
		wA = this.m_velocities[indexA].w;

		cB = this.m_positions[indexB].c;
		aB = this.m_positions[indexB].a;
		vB = this.m_velocities[indexB].v;
		wB = this.m_velocities[indexB].w;

		if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(manifold.pointCount > 0); }

		xfA.q.SetAngle(aA);
		xfB.q.SetAngle(aB);
		box2d.b2Sub_V2_V2(cA, box2d.b2Mul_R_V2(xfA.q, localCenterA, box2d.b2Vec2.s_t0), xfA.p);
		box2d.b2Sub_V2_V2(cB, box2d.b2Mul_R_V2(xfB.q, localCenterB, box2d.b2Vec2.s_t0), xfB.p);

		worldManifold.Initialize(manifold, xfA, radiusA, xfB, radiusB);

		vc.normal.Copy(worldManifold.normal);
		box2d.b2Cross_V2_S(vc.normal, 1.0, vc.tangent); // compute from normal

		pointCount = vc.pointCount;
		for (j = 0, jct = pointCount; j < jct; ++j)
		{
			vcp = vc.points[j];

//			vcp->rA = worldManifold.points[j] - cA;
			box2d.b2Sub_V2_V2(worldManifold.points[j], cA, vcp.rA);
//			vcp->rB = worldManifold.points[j] - cB;
			box2d.b2Sub_V2_V2(worldManifold.points[j], cB, vcp.rB);

			rnA = box2d.b2Cross_V2_V2(vcp.rA, vc.normal);
			rnB = box2d.b2Cross_V2_V2(vcp.rB, vc.normal);

			kNormal = mA + mB + iA * rnA * rnA + iB * rnB * rnB;

			vcp.normalMass = kNormal > 0 ? 1 / kNormal : 0;

//			b2Vec2 tangent = b2Cross(vc->normal, 1.0f);
			tangent = vc.tangent; // precomputed from normal

			rtA = box2d.b2Cross_V2_V2(vcp.rA, tangent);
			rtB = box2d.b2Cross_V2_V2(vcp.rB, tangent);

			kTangent = mA + mB + iA * rtA * rtA + iB * rtB * rtB;

			vcp.tangentMass = kTangent > 0 ? 1 / kTangent : 0;

			// Setup a velocity bias for restitution.
			vcp.velocityBias = 0;
//			float32 vRel = b2Dot(vc->normal, vB + b2Cross(wB, vcp->rB) - vA - b2Cross(wA, vcp->rA));
			vRel = box2d.b2Dot_V2_V2(
				vc.normal, 
				box2d.b2Sub_V2_V2(
					box2d.b2AddCross_V2_S_V2(vB, wB, vcp.rB, box2d.b2Vec2.s_t0),
					box2d.b2AddCross_V2_S_V2(vA, wA, vcp.rA, box2d.b2Vec2.s_t1), 
					box2d.b2Vec2.s_t0));
			if (vRel < (-box2d.b2_velocityThreshold))
			{
				vcp.velocityBias += (-vc.restitution * vRel);
			}
		}

		// If we have two points, then prepare the block solver.
		if (vc.pointCount === 2 && box2d.g_blockSolve)
		{
			vcp1 = vc.points[0];
			vcp2 = vc.points[1];

			rn1A = box2d.b2Cross_V2_V2(vcp1.rA, vc.normal);
			rn1B = box2d.b2Cross_V2_V2(vcp1.rB, vc.normal);
			rn2A = box2d.b2Cross_V2_V2(vcp2.rA, vc.normal);
			rn2B = box2d.b2Cross_V2_V2(vcp2.rB, vc.normal);

			k11 = mA + mB + iA * rn1A * rn1A + iB * rn1B * rn1B;
			k22 = mA + mB + iA * rn2A * rn2A + iB * rn2B * rn2B;
			k12 = mA + mB + iA * rn1A * rn2A + iB * rn1B * rn2B;

			// Ensure a reasonable condition number.
//			float32 k_maxConditionNumber = 1000.0f;
			if (k11 * k11 < k_maxConditionNumber * (k11 * k22 - k12 * k12))
			{
				// K is safe to invert.
				vc.K.ex.Set(k11, k12);
				vc.K.ey.Set(k12, k22);
				vc.K.GetInverse(vc.normalMass);
			}
			else
			{
				// The constraints are redundant, just use one.
				// TODO_ERIN use deepest?
				vc.pointCount = 1;
			}
		}
	}
}
box2d.b2ContactSolver.prototype.InitializeVelocityConstraints.s_xfA = new box2d.b2Transform();
box2d.b2ContactSolver.prototype.InitializeVelocityConstraints.s_xfB = new box2d.b2Transform();
box2d.b2ContactSolver.prototype.InitializeVelocityConstraints.s_worldManifold = new box2d.b2WorldManifold();

/** 
 * @export 
 * @return {void} 
 */
box2d.b2ContactSolver.prototype.WarmStart = function ()
{
	/** @type {number} */ var i;
	/** @type {number} */ var ict;
	/** @type {number} */ var j;
	/** @type {number} */ var jct;

	/** @type {box2d.b2ContactVelocityConstraint} */ var vc;

	/** @type {number} */ var indexA;
	/** @type {number} */ var indexB;
	/** @type {number} */ var mA;
	/** @type {number} */ var iA;
	/** @type {number} */ var mB;
	/** @type {number} */ var iB;
	/** @type {number} */ var pointCount;

	/** @type {box2d.b2Vec2} */ var vA;
	/** @type {number} */ var wA;
	/** @type {box2d.b2Vec2} */ var vB;
	/** @type {number} */ var wB;

	/** @type {box2d.b2Vec2} */ var normal;
	/** @type {box2d.b2Vec2} */ var tangent;

	/** @type {box2d.b2VelocityConstraintPoint} */ var vcp;
	/** @type {box2d.b2Vec2} */ var P = box2d.b2ContactSolver.prototype.WarmStart.s_P;

	// Warm start.
	for (i = 0, ict = this.m_count; i < ict; ++i)
	{
		vc = this.m_velocityConstraints[i];

		indexA = vc.indexA;
		indexB = vc.indexB;
		mA = vc.invMassA;
		iA = vc.invIA;
		mB = vc.invMassB;
		iB = vc.invIB;
		pointCount = vc.pointCount;

		vA = this.m_velocities[indexA].v;
		wA = this.m_velocities[indexA].w;
		vB = this.m_velocities[indexB].v;
		wB = this.m_velocities[indexB].w;

		normal = vc.normal;
//		b2Vec2 tangent = b2Cross(normal, 1.0f);
		tangent = vc.tangent; // precomputed from normal

		for (j = 0, jct = pointCount; j < jct; ++j)
		{
			vcp = vc.points[j];
//			b2Vec2 P = vcp->normalImpulse * normal + vcp->tangentImpulse * tangent;
			box2d.b2Add_V2_V2(
				box2d.b2Mul_S_V2(vcp.normalImpulse, normal, box2d.b2Vec2.s_t0), 
				box2d.b2Mul_S_V2(vcp.tangentImpulse, tangent, box2d.b2Vec2.s_t1), 
				P);
//			wA -= iA * b2Cross(vcp->rA, P);
			wA -= iA * box2d.b2Cross_V2_V2(vcp.rA, P);
//			vA -= mA * P;
			vA.SelfMulSub(mA, P);
//			wB += iB * b2Cross(vcp->rB, P);
			wB += iB * box2d.b2Cross_V2_V2(vcp.rB, P);
//			vB += mB * P;
			vB.SelfMulAdd(mB, P);
		}

//		this.m_velocities[indexA].v = vA;
		this.m_velocities[indexA].w = wA;
//		this.m_velocities[indexB].v = vB;
		this.m_velocities[indexB].w = wB;
	}
}
box2d.b2ContactSolver.prototype.WarmStart.s_P = new box2d.b2Vec2();

/**
 * @export 
 * @return {void} 
 */
box2d.b2ContactSolver.prototype.SolveVelocityConstraints = function ()
{
	/** @type {number} */ var i;
	/** @type {number} */ var ict;
	/** @type {number} */ var j;
	/** @type {number} */ var jct;

	/** @type {box2d.b2ContactVelocityConstraint} */ var vc;
	/** @type {number} */ var indexA;
	/** @type {number} */ var indexB;
	/** @type {number} */ var mA;
	/** @type {number} */ var iA;
	/** @type {number} */ var mB;
	/** @type {number} */ var iB;
	/** @type {number} */ var pointCount;
	/** @type {box2d.b2Vec2} */ var vA;
	/** @type {number} */ var wA;
	/** @type {box2d.b2Vec2} */ var vB;
	/** @type {number} */ var wB;
	/** @type {box2d.b2Vec2} */ var normal;
	/** @type {box2d.b2Vec2} */ var tangent;
	/** @type {number} */ var friction;

	/** @type {box2d.b2VelocityConstraintPoint} */ var vcp;

	/** @type {box2d.b2Vec2} */ var dv = box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_dv;
	/** @type {box2d.b2Vec2} */ var dv1 = box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_dv1;
	/** @type {box2d.b2Vec2} */ var dv2 = box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_dv2;

	/** @type {number} */ var vt;
	/** @type {number} */ var vn;
	/** @type {number} */ var lambda;

	/** @type {number} */ var maxFriction;
	/** @type {number} */ var newImpulse;

	/** @type {box2d.b2Vec2} */ var P = box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_P;

	/** @type {box2d.b2VelocityConstraintPoint} */ var cp1;
	/** @type {box2d.b2VelocityConstraintPoint} */ var cp2;

	/** @type {box2d.b2Vec2} */ var a = box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_a;
	/** @type {box2d.b2Vec2} */ var b = box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_b;
	/** @type {number} */ var vn1;
	/** @type {number} */ var vn2;

	/** @type {box2d.b2Vec2} */ var x = box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_x;
	/** @type {box2d.b2Vec2} */ var d = box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_d;
	/** @type {box2d.b2Vec2} */ var P1 = box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_P1;
	/** @type {box2d.b2Vec2} */ var P2 = box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_P2;
	/** @type {box2d.b2Vec2} */ var P1P2 = box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_P1P2;

	for (i = 0, ict = this.m_count; i < ict; ++i)
	{
		vc = this.m_velocityConstraints[i];

		indexA = vc.indexA;
		indexB = vc.indexB;
		mA = vc.invMassA;
		iA = vc.invIA;
		mB = vc.invMassB;
		iB = vc.invIB;
		pointCount = vc.pointCount;

		vA = this.m_velocities[indexA].v;
		wA = this.m_velocities[indexA].w;
		vB = this.m_velocities[indexB].v;
		wB = this.m_velocities[indexB].w;

//		b2Vec2 normal = vc->normal;
		normal = vc.normal;
//		b2Vec2 tangent = b2Cross(normal, 1.0f);
		tangent = vc.tangent; // precomputed from normal
		friction = vc.friction;

		if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(pointCount === 1 || pointCount === 2); }

		// Solve tangent constraints first because non-penetration is more important
		// than friction.
		for (j = 0, jct = pointCount; j < jct; ++j)
		{
			vcp = vc.points[j];

			// Relative velocity at contact
//			b2Vec2 dv = vB + b2Cross(wB, vcp->rB) - vA - b2Cross(wA, vcp->rA);
			box2d.b2Sub_V2_V2(
				box2d.b2AddCross_V2_S_V2(vB, wB, vcp.rB, box2d.b2Vec2.s_t0), 
				box2d.b2AddCross_V2_S_V2(vA, wA, vcp.rA, box2d.b2Vec2.s_t1), 
				dv);

			// Compute tangent force
//			float32 vt = b2Dot(dv, tangent) - vc->tangentSpeed;
			vt = box2d.b2Dot_V2_V2(dv, tangent) - vc.tangentSpeed;
			lambda = vcp.tangentMass * (-vt);

			// box2d.b2Clamp the accumulated force
			maxFriction = friction * vcp.normalImpulse;
			newImpulse = box2d.b2Clamp(vcp.tangentImpulse + lambda, (-maxFriction), maxFriction);
			lambda = newImpulse - vcp.tangentImpulse;
			vcp.tangentImpulse = newImpulse;

			// Apply contact impulse
//			b2Vec2 P = lambda * tangent;
			box2d.b2Mul_S_V2(lambda, tangent, P);

//			vA -= mA * P;
			vA.SelfMulSub(mA, P);
//			wA -= iA * b2Cross(vcp->rA, P);
			wA -= iA * box2d.b2Cross_V2_V2(vcp.rA, P);

//			vB += mB * P;
			vB.SelfMulAdd(mB, P);
//			wB += iB * b2Cross(vcp->rB, P);
			wB += iB * box2d.b2Cross_V2_V2(vcp.rB, P);
		}

		// Solve normal constraints
		if (vc.pointCount === 1 || !box2d.g_blockSolve)
		{
			for (var ii = 0; ii < pointCount; ++ii)
			{
				vcp = vc.points[ii];

				// Relative velocity at contact
//				b2Vec2 dv = vB + b2Cross(wB, vcp->rB) - vA - b2Cross(wA, vcp->rA);
				box2d.b2Sub_V2_V2(
					box2d.b2AddCross_V2_S_V2(vB, wB, vcp.rB, box2d.b2Vec2.s_t0), 
					box2d.b2AddCross_V2_S_V2(vA, wA, vcp.rA, box2d.b2Vec2.s_t1), 
					dv);

				// Compute normal impulse
//				float32 vn = b2Dot(dv, normal);
				vn = box2d.b2Dot_V2_V2(dv, normal);
				lambda = (-vcp.normalMass * (vn - vcp.velocityBias));

				// box2d.b2Clamp the accumulated impulse
//				float32 newImpulse = box2d.b2Max(vcp->normalImpulse + lambda, 0.0f);
				newImpulse = box2d.b2Max(vcp.normalImpulse + lambda, 0);
				lambda = newImpulse - vcp.normalImpulse;
				vcp.normalImpulse = newImpulse;

				// Apply contact impulse
//				b2Vec2 P = lambda * normal;
				box2d.b2Mul_S_V2(lambda, normal, P);
//				vA -= mA * P;
				vA.SelfMulSub(mA, P);
//				wA -= iA * b2Cross(vcp->rA, P);
				wA -= iA * box2d.b2Cross_V2_V2(vcp.rA, P);

//				vB += mB * P;
				vB.SelfMulAdd(mB, P);
//				wB += iB * b2Cross(vcp->rB, P);
				wB += iB * box2d.b2Cross_V2_V2(vcp.rB, P);
			}
		}
		else
		{
			// Block solver developed in collaboration with Dirk Gregorius (back in 01/07 on Box2D_Lite).
			// Build the mini LCP for this contact patch
			//
			// vn = A * x + b, vn >= 0, , vn >= 0, x >= 0 and vn_i * x_i = 0 with i = 1..2
			//
			// A = J * W * JT and J = ( -n, -r1 x n, n, r2 x n )
			// b = vn0 - velocityBias
			//
			// The system is solved using the "Total enumeration method" (s. Murty). The complementary constraint vn_i * x_i
			// implies that we must have in any solution either vn_i = 0 or x_i = 0. So for the 2D contact problem the cases
			// vn1 = 0 and vn2 = 0, x1 = 0 and x2 = 0, x1 = 0 and vn2 = 0, x2 = 0 and vn1 = 0 need to be tested. The first valid
			// solution that satisfies the problem is chosen.
			// 
			// In order to account of the accumulated impulse 'a' (because of the iterative nature of the solver which only requires
			// that the accumulated impulse is clamped and not the incremental impulse) we change the impulse variable (x_i).
			//
			// Substitute:
			// 
			// x = a + d
			// 
			// a := old total impulse
			// x := new total impulse
			// d := incremental impulse 
			//
			// For the current iteration we extend the formula for the incremental impulse
			// to compute the new total impulse:
			//
			// vn = A * d + b
			//    = A * (x - a) + b
			//    = A * x + b - A * a
			//    = A * x + b'
			// b' = b - A * a;

			cp1 = vc.points[0];
			cp2 = vc.points[1];

//			b2Vec2 a(cp1->normalImpulse, cp2->normalImpulse);
			a.Set(cp1.normalImpulse, cp2.normalImpulse);
			if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(a.x >= 0 && a.y >= 0); }

			// Relative velocity at contact
//			b2Vec2 dv1 = vB + b2Cross(wB, cp1->rB) - vA - b2Cross(wA, cp1->rA);
			box2d.b2Sub_V2_V2(
				box2d.b2AddCross_V2_S_V2(vB, wB, cp1.rB, box2d.b2Vec2.s_t0), 
				box2d.b2AddCross_V2_S_V2(vA, wA, cp1.rA, box2d.b2Vec2.s_t1), 
				dv1);
//			b2Vec2 dv2 = vB + b2Cross(wB, cp2->rB) - vA - b2Cross(wA, cp2->rA);
			box2d.b2Sub_V2_V2(
				box2d.b2AddCross_V2_S_V2(vB, wB, cp2.rB, box2d.b2Vec2.s_t0), 
				box2d.b2AddCross_V2_S_V2(vA, wA, cp2.rA, box2d.b2Vec2.s_t1), 
				dv2);

			// Compute normal velocity
//			float32 vn1 = b2Dot(dv1, normal);
			vn1 = box2d.b2Dot_V2_V2(dv1, normal);
//			float32 vn2 = b2Dot(dv2, normal);
			vn2 = box2d.b2Dot_V2_V2(dv2, normal);

//			b2Vec2 b;
			b.x = vn1 - cp1.velocityBias;
			b.y = vn2 - cp2.velocityBias;

			// Compute b'
//			b -= b2Mul(vc->K, a);
			b.SelfSub(box2d.b2Mul_M22_V2(vc.K, a, box2d.b2Vec2.s_t0));

/*
#if B2_DEBUG_SOLVER === 1
			var k_errorTol = 0.001;
#endif
*/

			for (;;)
			{
				//
				// Case 1: vn = 0
				//
				// 0 = A * x + b'
				//
				// Solve for x:
				//
				// x = - inv(A) * b'
				//
//				b2Vec2 x = - b2Mul(vc->normalMass, b);
				box2d.b2Mul_M22_V2(vc.normalMass, b, x).SelfNeg();

				if (x.x >= 0 && x.y >= 0)
				{
					// Get the incremental impulse
//					b2Vec2 d = x - a;
					box2d.b2Sub_V2_V2(x, a, d);

					// Apply incremental impulse
//					b2Vec2 P1 = d.x * normal;
					box2d.b2Mul_S_V2(d.x, normal, P1);
//					b2Vec2 P2 = d.y * normal;
					box2d.b2Mul_S_V2(d.y, normal, P2);
					box2d.b2Add_V2_V2(P1, P2, P1P2);
//					vA -= mA * (P1 + P2);
					vA.SelfMulSub(mA, P1P2);
//					wA -= iA * (b2Cross(cp1->rA, P1) + b2Cross(cp2->rA, P2));
					wA -= iA * (box2d.b2Cross_V2_V2(cp1.rA, P1) + box2d.b2Cross_V2_V2(cp2.rA, P2));

//					vB += mB * (P1 + P2);
					vB.SelfMulAdd(mB, P1P2);
//					wB += iB * (b2Cross(cp1->rB, P1) + b2Cross(cp2->rB, P2));
					wB += iB * (box2d.b2Cross_V2_V2(cp1.rB, P1) + box2d.b2Cross_V2_V2(cp2.rB, P2));

					// Accumulate
					cp1.normalImpulse = x.x;
					cp2.normalImpulse = x.y;

/*
#if B2_DEBUG_SOLVER === 1
					// Postconditions
					dv1 = vB + b2Cross(wB, cp1->rB) - vA - b2Cross(wA, cp1->rA);
					dv2 = vB + b2Cross(wB, cp2->rB) - vA - b2Cross(wA, cp2->rA);

					// Compute normal velocity
					vn1 = b2Dot(dv1, normal);
					vn2 = b2Dot(dv2, normal);

					if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(box2d.b2Abs(vn1 - cp1->velocityBias) < k_errorTol); }
					if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(box2d.b2Abs(vn2 - cp2->velocityBias) < k_errorTol); }
#endif
*/
					break;
				}

				//
				// Case 2: vn1 = 0 and x2 = 0
				//
				//   0 = a11 * x1 + a12 * 0 + b1' 
				// vn2 = a21 * x1 + a22 * 0 + b2'
				//
				x.x = (-cp1.normalMass * b.x);
				x.y = 0;
				vn1 = 0;
				vn2 = vc.K.ex.y * x.x + b.y;

				if (x.x >= 0 && vn2 >= 0)
				{
					// Get the incremental impulse
//					b2Vec2 d = x - a;
					box2d.b2Sub_V2_V2(x, a, d);

					// Apply incremental impulse
//					b2Vec2 P1 = d.x * normal;
					box2d.b2Mul_S_V2(d.x, normal, P1);
//					b2Vec2 P2 = d.y * normal;
					box2d.b2Mul_S_V2(d.y, normal, P2);
					box2d.b2Add_V2_V2(P1, P2, P1P2);
//					vA -= mA * (P1 + P2);
					vA.SelfMulSub(mA, P1P2);
//					wA -= iA * (b2Cross(cp1->rA, P1) + b2Cross(cp2->rA, P2));
					wA -= iA * (box2d.b2Cross_V2_V2(cp1.rA, P1) + box2d.b2Cross_V2_V2(cp2.rA, P2));

//					vB += mB * (P1 + P2);
					vB.SelfMulAdd(mB, P1P2);
//					wB += iB * (b2Cross(cp1->rB, P1) + b2Cross(cp2->rB, P2));
					wB += iB * (box2d.b2Cross_V2_V2(cp1.rB, P1) + box2d.b2Cross_V2_V2(cp2.rB, P2));

					// Accumulate
					cp1.normalImpulse = x.x;
					cp2.normalImpulse = x.y;

/*
#if B2_DEBUG_SOLVER === 1
					// Postconditions
					dv1 = vB + b2Cross(wB, cp1->rB) - vA - b2Cross(wA, cp1->rA);

					// Compute normal velocity
					vn1 = b2Dot(dv1, normal);

					if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(box2d.b2Abs(vn1 - cp1->velocityBias) < k_errorTol); }
#endif
*/
					break;
				}


				//
				// Case 3: vn2 = 0 and x1 = 0
				//
				// vn1 = a11 * 0 + a12 * x2 + b1' 
				//   0 = a21 * 0 + a22 * x2 + b2'
				//
				x.x = 0;
				x.y = (-cp2.normalMass * b.y);
				vn1 = vc.K.ey.x * x.y + b.x;
				vn2 = 0;

				if (x.y >= 0 && vn1 >= 0)
				{
					// Resubstitute for the incremental impulse
//					b2Vec2 d = x - a;
					box2d.b2Sub_V2_V2(x, a, d);

					// Apply incremental impulse
//					b2Vec2 P1 = d.x * normal;
					box2d.b2Mul_S_V2(d.x, normal, P1);
//					b2Vec2 P2 = d.y * normal;
					box2d.b2Mul_S_V2(d.y, normal, P2);
					box2d.b2Add_V2_V2(P1, P2, P1P2);
//					vA -= mA * (P1 + P2);
					vA.SelfMulSub(mA, P1P2);
//					wA -= iA * (b2Cross(cp1->rA, P1) + b2Cross(cp2->rA, P2));
					wA -= iA * (box2d.b2Cross_V2_V2(cp1.rA, P1) + box2d.b2Cross_V2_V2(cp2.rA, P2));

//					vB += mB * (P1 + P2);
					vB.SelfMulAdd(mB, P1P2);
//					wB += iB * (b2Cross(cp1->rB, P1) + b2Cross(cp2->rB, P2));
					wB += iB * (box2d.b2Cross_V2_V2(cp1.rB, P1) + box2d.b2Cross_V2_V2(cp2.rB, P2));

					// Accumulate
					cp1.normalImpulse = x.x;
					cp2.normalImpulse = x.y;

/*
#if B2_DEBUG_SOLVER === 1
					// Postconditions
					dv2 = vB + b2Cross(wB, cp2->rB) - vA - b2Cross(wA, cp2->rA);

					// Compute normal velocity
					vn2 = b2Dot(dv2, normal);

					if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(box2d.b2Abs(vn2 - cp2->velocityBias) < k_errorTol); }
#endif
*/
					break;
				}

				//
				// Case 4: x1 = 0 and x2 = 0
				// 
				// vn1 = b1
				// vn2 = b2;
				x.x = 0;
				x.y = 0;
				vn1 = b.x;
				vn2 = b.y;

				if (vn1 >= 0 && vn2 >= 0)
				{
					// Resubstitute for the incremental impulse
//					b2Vec2 d = x - a;
					box2d.b2Sub_V2_V2(x, a, d);

					// Apply incremental impulse
//					b2Vec2 P1 = d.x * normal;
					box2d.b2Mul_S_V2(d.x, normal, P1);
//					b2Vec2 P2 = d.y * normal;
					box2d.b2Mul_S_V2(d.y, normal, P2);
					box2d.b2Add_V2_V2(P1, P2, P1P2);
//					vA -= mA * (P1 + P2);
					vA.SelfMulSub(mA, P1P2);
//					wA -= iA * (b2Cross(cp1->rA, P1) + b2Cross(cp2->rA, P2));
					wA -= iA * (box2d.b2Cross_V2_V2(cp1.rA, P1) + box2d.b2Cross_V2_V2(cp2.rA, P2));

//					vB += mB * (P1 + P2);
					vB.SelfMulAdd(mB, P1P2);
//					wB += iB * (b2Cross(cp1->rB, P1) + b2Cross(cp2->rB, P2));
					wB += iB * (box2d.b2Cross_V2_V2(cp1.rB, P1) + box2d.b2Cross_V2_V2(cp2.rB, P2));

					// Accumulate
					cp1.normalImpulse = x.x;
					cp2.normalImpulse = x.y;

					break;
				}

				// No solution, give up. This is hit sometimes, but it doesn't seem to matter.
				break;
			}
		}

//		this.m_velocities[indexA].v = vA;
		this.m_velocities[indexA].w = wA;
//		this.m_velocities[indexB].v = vB;
		this.m_velocities[indexB].w = wB;
	}
}
box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_dv = new box2d.b2Vec2();
box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_dv1 = new box2d.b2Vec2();
box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_dv2 = new box2d.b2Vec2();
box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_P = new box2d.b2Vec2();
box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_a = new box2d.b2Vec2();
box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_b = new box2d.b2Vec2();
box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_x = new box2d.b2Vec2();
box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_d = new box2d.b2Vec2();
box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_P1 = new box2d.b2Vec2();
box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_P2 = new box2d.b2Vec2();
box2d.b2ContactSolver.prototype.SolveVelocityConstraints.s_P1P2 = new box2d.b2Vec2();

/**
 * @export 
 * @return {void} 
 */
box2d.b2ContactSolver.prototype.StoreImpulses = function ()
{
	/** @type {number} */ var i;
	/** @type {number} */ var ict;
	/** @type {number} */ var j;
	/** @type {number} */ var jct;

	/** @type {box2d.b2ContactVelocityConstraint} */ var vc;
	/** @type {box2d.b2Manifold} */ var manifold;

	for (i = 0, ict = this.m_count; i < ict; ++i)
	{
		vc = this.m_velocityConstraints[i];
		manifold = this.m_contacts[vc.contactIndex].GetManifold();

		for (j = 0, jct = vc.pointCount; j < jct; ++j)
		{
			manifold.points[j].normalImpulse = vc.points[j].normalImpulse;
			manifold.points[j].tangentImpulse = vc.points[j].tangentImpulse;
		}
	}
}

/**
 * @export 
 * @constructor
 */
box2d.b2PositionSolverManifold = function ()
{
	this.normal = new box2d.b2Vec2();
	this.point = new box2d.b2Vec2();
}

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PositionSolverManifold.prototype.normal = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2PositionSolverManifold.prototype.point = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2PositionSolverManifold.prototype.separation = 0;

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2ContactPositionConstraint} pc 
 * @param {box2d.b2Transform} xfA 
 * @param {box2d.b2Transform} xfB
 * @param {number} index 
 */
box2d.b2PositionSolverManifold.prototype.Initialize = function (pc, xfA, xfB, index)
{
	/** @type {box2d.b2Vec2} */ var pointA = box2d.b2PositionSolverManifold.prototype.Initialize.s_pointA;
	/** @type {box2d.b2Vec2} */ var pointB = box2d.b2PositionSolverManifold.prototype.Initialize.s_pointB;
	/** @type {box2d.b2Vec2} */ var planePoint = box2d.b2PositionSolverManifold.prototype.Initialize.s_planePoint;
	/** @type {box2d.b2Vec2} */ var clipPoint = box2d.b2PositionSolverManifold.prototype.Initialize.s_clipPoint;

	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(pc.pointCount > 0); }

	switch (pc.type)
	{
	case box2d.b2ManifoldType.e_circles:
		{
//			b2Vec2 pointA = b2Mul(xfA, pc->localPoint);
			box2d.b2Mul_X_V2(xfA, pc.localPoint, pointA);
//			b2Vec2 pointB = b2Mul(xfB, pc->localPoints[0]);
			box2d.b2Mul_X_V2(xfB, pc.localPoints[0], pointB);
//			normal = pointB - pointA;
//			normal.Normalize();
			box2d.b2Sub_V2_V2(pointB, pointA, this.normal).SelfNormalize();
//			point = 0.5f * (pointA + pointB);
			box2d.b2Mid_V2_V2(pointA, pointB, this.point);
//			separation = b2Dot(pointB - pointA, normal) - pc->radius;
			this.separation = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(pointB, pointA, box2d.b2Vec2.s_t0), this.normal) - pc.radiusA - pc.radiusB;
		}
		break;

	case box2d.b2ManifoldType.e_faceA:
		{
//			normal = b2Mul(xfA.q, pc->localNormal);
			box2d.b2Mul_R_V2(xfA.q, pc.localNormal, this.normal);
//			b2Vec2 planePoint = b2Mul(xfA, pc->localPoint);
			box2d.b2Mul_X_V2(xfA, pc.localPoint, planePoint);

//			b2Vec2 clipPoint = b2Mul(xfB, pc->localPoints[index]);
			box2d.b2Mul_X_V2(xfB, pc.localPoints[index], clipPoint);
//			separation = b2Dot(clipPoint - planePoint, normal) - pc->radius;
			this.separation = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(clipPoint, planePoint, box2d.b2Vec2.s_t0), this.normal) - pc.radiusA - pc.radiusB;
//			point = clipPoint;
			this.point.Copy(clipPoint);
		}
		break;

	case box2d.b2ManifoldType.e_faceB:
		{
//			normal = b2Mul(xfB.q, pc->localNormal);
			box2d.b2Mul_R_V2(xfB.q, pc.localNormal, this.normal);
//			b2Vec2 planePoint = b2Mul(xfB, pc->localPoint);
			box2d.b2Mul_X_V2(xfB, pc.localPoint, planePoint);

//			b2Vec2 clipPoint = b2Mul(xfA, pc->localPoints[index]);
			box2d.b2Mul_X_V2(xfA, pc.localPoints[index], clipPoint);
//			separation = b2Dot(clipPoint - planePoint, normal) - pc->radius;
			this.separation = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(clipPoint, planePoint, box2d.b2Vec2.s_t0), this.normal) - pc.radiusA - pc.radiusB;
//			point = clipPoint;
			this.point.Copy(clipPoint);

			// Ensure normal points from A to B
//			normal = -normal;
			this.normal.SelfNeg();
		}
		break;
	}
}
box2d.b2PositionSolverManifold.prototype.Initialize.s_pointA = new box2d.b2Vec2();
box2d.b2PositionSolverManifold.prototype.Initialize.s_pointB = new box2d.b2Vec2();
box2d.b2PositionSolverManifold.prototype.Initialize.s_planePoint = new box2d.b2Vec2();
box2d.b2PositionSolverManifold.prototype.Initialize.s_clipPoint = new box2d.b2Vec2();

/** 
 * Sequential solver. 
 * @export 
 * @return {boolean}
 */
box2d.b2ContactSolver.prototype.SolvePositionConstraints = function ()
{
	/** @type {number} */ var i;
	/** @type {number} */ var ict;
	/** @type {number} */ var j;
	/** @type {number} */ var jct;

	/** @type {box2d.b2ContactPositionConstraint} */ var pc;

	/** @type {number} */ var indexA;
	/** @type {number} */ var indexB;
	/** @type {box2d.b2Vec2} */ var localCenterA;
	/** @type {number} */ var mA;
	/** @type {number} */ var iA;
	/** @type {box2d.b2Vec2} */ var localCenterB;
	/** @type {number} */ var mB;
	/** @type {number} */ var iB;
	/** @type {number} */ var pointCount;

	/** @type {box2d.b2Vec2} */ var cA;
	/** @type {number} */ var aA;

	/** @type {box2d.b2Vec2} */ var cB;
	/** @type {number} */ var aB;

	/** @type {box2d.b2Transform} */ var xfA = box2d.b2ContactSolver.prototype.SolvePositionConstraints.s_xfA;
	/** @type {box2d.b2Transform} */ var xfB = box2d.b2ContactSolver.prototype.SolvePositionConstraints.s_xfB;

	/** @type {box2d.b2PositionSolverManifold} */ var psm = box2d.b2ContactSolver.prototype.SolvePositionConstraints.s_psm;

	/** @type {box2d.b2Vec2} */ var normal;
	/** @type {box2d.b2Vec2} */ var point;
	/** @type {number} */ var separation;

	/** @type {box2d.b2Vec2} */ var rA = box2d.b2ContactSolver.prototype.SolvePositionConstraints.s_rA;
	/** @type {box2d.b2Vec2} */ var rB = box2d.b2ContactSolver.prototype.SolvePositionConstraints.s_rB;

	/** @type {number} */ var C;
	/** @type {number} */ var rnA;
	/** @type {number} */ var rnB;
	/** @type {number} */ var K;
	/** @type {number} */ var impulse;
	/** @type {box2d.b2Vec2} */ var P = box2d.b2ContactSolver.prototype.SolvePositionConstraints.s_P;

	/** @type {number} */ var minSeparation = 0;

	for (i = 0, ict = this.m_count; i < ict; ++i)
	{
		pc = this.m_positionConstraints[i];

		indexA = pc.indexA;
		indexB = pc.indexB;
		localCenterA = pc.localCenterA;
		mA = pc.invMassA;
		iA = pc.invIA;
		localCenterB = pc.localCenterB;
		mB = pc.invMassB;
		iB = pc.invIB;
		pointCount = pc.pointCount;

		cA = this.m_positions[indexA].c;
		aA = this.m_positions[indexA].a;

		cB = this.m_positions[indexB].c;
		aB = this.m_positions[indexB].a;

		// Solve normal constraints
		for (j = 0, jct = pointCount; j < jct; ++j)
		{
			xfA.q.SetAngle(aA);
			xfB.q.SetAngle(aB);
			box2d.b2Sub_V2_V2(cA, box2d.b2Mul_R_V2(xfA.q, localCenterA, box2d.b2Vec2.s_t0), xfA.p);
			box2d.b2Sub_V2_V2(cB, box2d.b2Mul_R_V2(xfB.q, localCenterB, box2d.b2Vec2.s_t0), xfB.p);

			psm.Initialize(pc, xfA, xfB, j);
			normal = psm.normal;

			point = psm.point;
			separation = psm.separation;

//			b2Vec2 rA = point - cA;
			box2d.b2Sub_V2_V2(point, cA, rA);
//			b2Vec2 rB = point - cB;
			box2d.b2Sub_V2_V2(point, cB, rB);

			// Track max constraint error.
			minSeparation = box2d.b2Min(minSeparation, separation);

			// Prevent large corrections and allow slop.
			C = box2d.b2Clamp(box2d.b2_baumgarte * (separation + box2d.b2_linearSlop), (-box2d.b2_maxLinearCorrection), 0);

			// Compute the effective mass.
//			float32 rnA = b2Cross(rA, normal);
			rnA = box2d.b2Cross_V2_V2(rA, normal);
//			float32 rnB = b2Cross(rB, normal);
			rnB = box2d.b2Cross_V2_V2(rB, normal);
//			float32 K = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
			K = mA + mB + iA * rnA * rnA + iB * rnB * rnB;

			// Compute normal impulse
			impulse = K > 0 ? - C / K : 0;

//			b2Vec2 P = impulse * normal;
			box2d.b2Mul_S_V2(impulse, normal, P);

//			cA -= mA * P;
			cA.SelfMulSub(mA, P);
//			aA -= iA * b2Cross(rA, P);
			aA -= iA * box2d.b2Cross_V2_V2(rA, P);

//			cB += mB * P;
			cB.SelfMulAdd(mB, P);
//			aB += iB * b2Cross(rB, P);
			aB += iB * box2d.b2Cross_V2_V2(rB, P);
		}

//		this.m_positions[indexA].c = cA;
		this.m_positions[indexA].a = aA;

//		this.m_positions[indexB].c = cB;
		this.m_positions[indexB].a = aB;
	}

	// We can't expect minSpeparation >= -box2d.b2_linearSlop because we don't
	// push the separation above -box2d.b2_linearSlop.
	return minSeparation > (-3 * box2d.b2_linearSlop);
}
box2d.b2ContactSolver.prototype.SolvePositionConstraints.s_xfA = new box2d.b2Transform();
box2d.b2ContactSolver.prototype.SolvePositionConstraints.s_xfB = new box2d.b2Transform();
box2d.b2ContactSolver.prototype.SolvePositionConstraints.s_psm = new box2d.b2PositionSolverManifold();
box2d.b2ContactSolver.prototype.SolvePositionConstraints.s_rA = new box2d.b2Vec2();
box2d.b2ContactSolver.prototype.SolvePositionConstraints.s_rB = new box2d.b2Vec2();
box2d.b2ContactSolver.prototype.SolvePositionConstraints.s_P = new box2d.b2Vec2();

/** 
 * Sequential position solver for position constraints. 
 * @export 
 * @return {boolean} 
 * @param {number} toiIndexA 
 * @param {number} toiIndexB 
 */
box2d.b2ContactSolver.prototype.SolveTOIPositionConstraints = function (toiIndexA, toiIndexB)
{
	/** @type {number} */ var i;
	/** @type {number} */ var ict;
	/** @type {number} */ var j;
	/** @type {number} */ var jct;

	/** @type {box2d.b2ContactPositionConstraint} */ var pc;

	/** @type {number} */ var indexA;
	/** @type {number} */ var indexB;
	/** @type {box2d.b2Vec2} */ var localCenterA;
	/** @type {box2d.b2Vec2} */ var localCenterB;
	/** @type {number} */ var pointCount;

	/** @type {number} */ var mA;
	/** @type {number} */ var iA;

	/** @type {number} */ var mB;
	/** @type {number} */ var iB;

	/** @type {box2d.b2Vec2} */ var cA;
	/** @type {number} */ var aA;

	/** @type {box2d.b2Vec2} */ var cB;
	/** @type {number} */ var aB;

	/** @type {box2d.b2Transform} */ var xfA = box2d.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_xfA;
	/** @type {box2d.b2Transform} */ var xfB = box2d.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_xfB;

	/** @type {box2d.b2PositionSolverManifold} */ var psm = box2d.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_psm;
	/** @type {box2d.b2Vec2} */ var normal;
	/** @type {box2d.b2Vec2} */ var point;
	/** @type {number} */ var separation;
	/** @type {box2d.b2Vec2} */ var rA = box2d.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_rA;
	/** @type {box2d.b2Vec2} */ var rB = box2d.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_rB;
	/** @type {number} */ var C;
	/** @type {number} */ var rnA;
	/** @type {number} */ var rnB;
	/** @type {number} */ var K;
	/** @type {number} */ var impulse;
	/** @type {box2d.b2Vec2} */ var P = box2d.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_P;

	/** @type {number} */ var minSeparation = 0;

	for (i = 0, ict = this.m_count; i < ict; ++i)
	{
		pc = this.m_positionConstraints[i];

		indexA = pc.indexA;
		indexB = pc.indexB;
		localCenterA = pc.localCenterA;
		localCenterB = pc.localCenterB;
		pointCount = pc.pointCount;

		mA = 0;
		iA = 0;
		if (indexA === toiIndexA || indexA === toiIndexB)
		{
			mA = pc.invMassA;
			iA = pc.invIA;
		}

		mB = 0;
		iB = 0;
		if (indexB === toiIndexA || indexB === toiIndexB)
		{
			mB = pc.invMassB;
			iB = pc.invIB;
		}

		cA = this.m_positions[indexA].c;
		aA = this.m_positions[indexA].a;

		cB = this.m_positions[indexB].c;
		aB = this.m_positions[indexB].a;

		// Solve normal constraints
		for (j = 0, jct = pointCount; j < jct; ++j)
		{
			xfA.q.SetAngle(aA);
			xfB.q.SetAngle(aB);
			box2d.b2Sub_V2_V2(cA, box2d.b2Mul_R_V2(xfA.q, localCenterA, box2d.b2Vec2.s_t0), xfA.p);
			box2d.b2Sub_V2_V2(cB, box2d.b2Mul_R_V2(xfB.q, localCenterB, box2d.b2Vec2.s_t0), xfB.p);

			psm.Initialize(pc, xfA, xfB, j);
			normal = psm.normal;

			point = psm.point;
			separation = psm.separation;

//			b2Vec2 rA = point - cA;
			box2d.b2Sub_V2_V2(point, cA, rA);
//			b2Vec2 rB = point - cB;
			box2d.b2Sub_V2_V2(point, cB, rB);

			// Track max constraint error.
			minSeparation = box2d.b2Min(minSeparation, separation);

			// Prevent large corrections and allow slop.
			C = box2d.b2Clamp(box2d.b2_toiBaumgarte * (separation + box2d.b2_linearSlop), (-box2d.b2_maxLinearCorrection), 0);

			// Compute the effective mass.
//			float32 rnA = b2Cross(rA, normal);
			rnA = box2d.b2Cross_V2_V2(rA, normal);
//			float32 rnB = b2Cross(rB, normal);
			rnB = box2d.b2Cross_V2_V2(rB, normal);
//			float32 K = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
			K = mA + mB + iA * rnA * rnA + iB * rnB * rnB;

			// Compute normal impulse
			impulse = K > 0 ? - C / K : 0;

//			b2Vec2 P = impulse * normal;
			box2d.b2Mul_S_V2(impulse, normal, P);

//			cA -= mA * P;
			cA.SelfMulSub(mA, P);
//			aA -= iA * b2Cross(rA, P);
			aA -= iA * box2d.b2Cross_V2_V2(rA, P);

//			cB += mB * P;
			cB.SelfMulAdd(mB, P);
//			aB += iB * b2Cross(rB, P);
			aB += iB * box2d.b2Cross_V2_V2(rB, P);
		}

//		this.m_positions[indexA].c = cA;
		this.m_positions[indexA].a = aA;

//		this.m_positions[indexB].c = cB;
		this.m_positions[indexB].a = aB;
	}

	// We can't expect minSpeparation >= -box2d.b2_linearSlop because we don't
	// push the separation above -box2d.b2_linearSlop.
	return minSeparation >= -1.5 * box2d.b2_linearSlop;
}
box2d.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_xfA = new box2d.b2Transform();
box2d.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_xfB = new box2d.b2Transform();
box2d.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_psm = new box2d.b2PositionSolverManifold();
box2d.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_rA = new box2d.b2Vec2();
box2d.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_rB = new box2d.b2Vec2();
box2d.b2ContactSolver.prototype.SolveTOIPositionConstraints.s_P = new box2d.b2Vec2();

