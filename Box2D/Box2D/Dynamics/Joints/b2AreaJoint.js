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

goog.provide('box2d.b2AreaJoint');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Joint');
goog.require('box2d.b2Math');

/** 
 * Definition for a {@link box2d.b2AreaJoint}, which connects a 
 * group a bodies together so they maintain a constant area 
 * within them. 
 * @export 
 * @constructor 
 * @extends {box2d.b2JointDef} 
 */
box2d.b2AreaJointDef = function ()
{
	box2d.b2JointDef.call(this, box2d.b2JointType.e_areaJoint); // base class constructor

	this.bodies = new Array();
}

goog.inherits(box2d.b2AreaJointDef, box2d.b2JointDef);

/**
 * @export 
 * @type {box2d.b2World}
 */
box2d.b2AreaJointDef.prototype.world = null;

/**
 * @export 
 * @type {Array.<box2d.b2Body>}
 */
box2d.b2AreaJointDef.prototype.bodies = null;

/** 
 * The mass-spring-damper frequency in Hertz. A value of 0 
 * disables softness. 
 * @export 
 * @type {number}
 */
box2d.b2AreaJointDef.prototype.frequencyHz = 0;

/** 
 * The damping ratio. 0 = no damping, 1 = critical damping. 
 * @export 
 * @type {number}
 */
box2d.b2AreaJointDef.prototype.dampingRatio = 0;

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2Body} body
 */
box2d.b2AreaJointDef.prototype.AddBody = function (body)
{
	this.bodies.push(body);

	if (this.bodies.length === 1)
	{
		this.bodyA = body;
	}
	else if (this.bodies.length === 2)
	{
		this.bodyB = body;
	}
}

/** 
 * A distance joint constrains two points on two bodies to 
 * remain at a fixed distance from each other. You can view this 
 * as a massless, rigid rod. 
 * @export 
 * @constructor 
 * @extends {box2d.b2Joint} 
 * @param {box2d.b2AreaJointDef} def 
 */
box2d.b2AreaJoint = function (def)
{
	box2d.b2Joint.call(this, def); // base class constructor

	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(def.bodies.length >= 3, "You cannot create an area joint with less than three bodies."); }

	this.m_bodies = def.bodies;
	this.m_frequencyHz = def.frequencyHz;
	this.m_dampingRatio = def.dampingRatio;

	this.m_targetLengths = box2d.b2MakeNumberArray(def.bodies.length);
	this.m_normals = box2d.b2Vec2.MakeArray(def.bodies.length);
	this.m_joints = new Array(def.bodies.length);
	this.m_deltas = box2d.b2Vec2.MakeArray(def.bodies.length);
	this.m_delta = new box2d.b2Vec2();

	var djd = new box2d.b2DistanceJointDef();
	djd.frequencyHz = def.frequencyHz;
	djd.dampingRatio = def.dampingRatio;

	this.m_targetArea = 0;

	for (var i = 0, ict = this.m_bodies.length; i < ict; ++i)
	{
		var body = this.m_bodies[i];
		var next = this.m_bodies[(i+1)%ict];

		var body_c = body.GetWorldCenter();
		var next_c = next.GetWorldCenter();

		this.m_targetLengths[i] = box2d.b2Distance(body_c, next_c);

		this.m_targetArea += box2d.b2Cross_V2_V2(body_c, next_c);

		djd.Initialize(body, next, body_c, next_c);
		this.m_joints[i] = def.world.CreateJoint(djd);
	}

	this.m_targetArea *= 0.5;
}

goog.inherits(box2d.b2AreaJoint, box2d.b2Joint);

/**
 * @export 
 * @type {Array.<box2d.b2Body>}
 */
box2d.b2AreaJoint.prototype.m_bodies = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2AreaJoint.prototype.m_frequencyHz = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2AreaJoint.prototype.m_dampingRatio = 0;

// Solver shared
/**
 * @export 
 * @type {number}
 */
box2d.b2AreaJoint.prototype.m_impulse = 0;

// Solver temp
box2d.b2AreaJoint.prototype.m_targetLengths = null;
box2d.b2AreaJoint.prototype.m_targetArea = 0;
box2d.b2AreaJoint.prototype.m_normals = null;
box2d.b2AreaJoint.prototype.m_joints = null;
box2d.b2AreaJoint.prototype.m_deltas = null;
box2d.b2AreaJoint.prototype.m_delta = null;

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2AreaJoint.prototype.GetAnchorA = function (out)
{
	return out.SetZero();
}

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2AreaJoint.prototype.GetAnchorB = function (out)
{
	return out.SetZero();
}

/** 
 * Get the reaction force given the inverse time step. 
 * Unit is N.
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {number} inv_dt 
 * @param {box2d.b2Vec2} out
 */
box2d.b2AreaJoint.prototype.GetReactionForce = function (inv_dt, out)
{
	return out.SetZero();
}

/** 
 * Get the reaction torque given the inverse time step. 
 * Unit is N*m. This is always zero for a distance joint.
 * @export 
 * @return {number} 
 * @param {number} inv_dt 
 */
box2d.b2AreaJoint.prototype.GetReactionTorque = function (inv_dt)
{
	return 0;
}

/** 
 * Set/get frequency in Hz. 
 * @export 
 * @return {void} 
 * @param {number} hz
 */
box2d.b2AreaJoint.prototype.SetFrequency = function (hz)
{
	this.m_frequencyHz = hz;

	for (var i = 0, ict = this.m_joints.length; i < ict; ++i)
	{
		this.m_joints[i].SetFrequency(hz);
	}
}

/** 
 * @export 
 * @return {number}
 */
box2d.b2AreaJoint.prototype.GetFrequency = function ()
{
	return this.m_frequencyHz;
}

/** 
 * Set/get damping ratio. 
 * @export 
 * @return {void} 
 * @param {number} ratio
 */
box2d.b2AreaJoint.prototype.SetDampingRatio = function (ratio)
{
	this.m_dampingRatio = ratio;

	for (var i = 0, ict = this.m_joints.length; i < ict; ++i)
	{
		this.m_joints[i].SetDampingRatio(ratio);
	}
}

/** 
 * @export 
 * @return {number}
 */
box2d.b2AreaJoint.prototype.GetDampingRatio = function ()
{
	return this.m_dampingRatio;
}

/** 
 * Dump joint to dmLog 
 * @export 
 * @return {void}
 */
box2d.b2AreaJoint.prototype.Dump = function ()
{
	if (box2d.DEBUG)
	{
		box2d.b2Log("Area joint dumping is not supported.\n");
	}
}

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2SolverData} data
 */
box2d.b2AreaJoint.prototype.InitVelocityConstraints = function (data)
{
	for (var i = 0, ict = this.m_bodies.length; i < ict; ++i)
	{
		var prev = this.m_bodies[(i+ict-1)%ict];
		var next = this.m_bodies[(i+1)%ict];
		var prev_c = data.positions[prev.m_islandIndex].c;
		var next_c = data.positions[next.m_islandIndex].c;
		var delta = this.m_deltas[i];

		box2d.b2Sub_V2_V2(next_c, prev_c, delta);
	}

	if (data.step.warmStarting)
	{
		this.m_impulse *= data.step.dtRatio;

		for (var i = 0, ict = this.m_bodies.length; i < ict; ++i)
		{
			var body = this.m_bodies[i];
			var body_v = data.velocities[body.m_islandIndex].v;
			var delta = this.m_deltas[i];

			body_v.x += body.m_invMass *  delta.y * 0.5 * this.m_impulse;
			body_v.y += body.m_invMass * -delta.x * 0.5 * this.m_impulse;
		}
	}
	else
	{
		this.m_impulse = 0;
	}
}

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2SolverData} data
 */
box2d.b2AreaJoint.prototype.SolveVelocityConstraints = function (data)
{
	var dotMassSum = 0;
	var crossMassSum = 0;

	for (var i = 0, ict = this.m_bodies.length; i < ict; ++i)
	{
		var body = this.m_bodies[i];
		var body_v = data.velocities[body.m_islandIndex].v;
		var delta = this.m_deltas[i];

		dotMassSum += delta.LengthSquared() / body.GetMass();
		crossMassSum += box2d.b2Cross_V2_V2(body_v, delta);
	}

	var lambda = -2 * crossMassSum / dotMassSum;
	//lambda = box2d.b2Clamp(lambda, -box2d.b2_maxLinearCorrection, box2d.b2_maxLinearCorrection);

	this.m_impulse += lambda;

	for (var i = 0, ict = this.m_bodies.length; i < ict; ++i)
	{
		var body = this.m_bodies[i];
		var body_v = data.velocities[body.m_islandIndex].v;
		var delta = this.m_deltas[i];

		body_v.x += body.m_invMass *  delta.y * 0.5 * lambda;
		body_v.y += body.m_invMass * -delta.x * 0.5 * lambda;
	}
}

/** 
 * @export 
 * @return {boolean} 
 * @param {box2d.b2SolverData} data 
 */
box2d.b2AreaJoint.prototype.SolvePositionConstraints = function (data)
{
	var perimeter = 0;
	var area = 0;

	for (var i = 0, ict = this.m_bodies.length; i < ict; ++i)
	{
		var body = this.m_bodies[i];
		var next = this.m_bodies[(i+1)%ict];
		var body_c = data.positions[body.m_islandIndex].c;
		var next_c = data.positions[next.m_islandIndex].c;

		var delta = box2d.b2Sub_V2_V2(next_c, body_c, this.m_delta);

		var dist = delta.Length();
		if (dist < box2d.b2_epsilon)
		{
			dist = 1;
		}

		this.m_normals[i].x =  delta.y / dist;
		this.m_normals[i].y = -delta.x / dist;

		perimeter += dist;

		area += box2d.b2Cross_V2_V2(body_c, next_c);
	}

	area *= 0.5;

	var deltaArea = this.m_targetArea - area;
	var toExtrude = 0.5 * deltaArea / perimeter;
	var done = true;

	for (var i = 0, ict = this.m_bodies.length; i < ict; ++i)
	{
		var body = this.m_bodies[i];
		var body_c = data.positions[body.m_islandIndex].c;
		var next_i = (i+1)%ict;

		var delta = box2d.b2Add_V2_V2(this.m_normals[i], this.m_normals[next_i], this.m_delta);
		delta.SelfMul(toExtrude);

		var norm_sq = delta.LengthSquared();
		if (norm_sq > box2d.b2Sq(box2d.b2_maxLinearCorrection))
		{
			delta.SelfMul(box2d.b2_maxLinearCorrection / box2d.b2Sqrt(norm_sq));
		}
		if (norm_sq > box2d.b2Sq(box2d.b2_linearSlop))
		{
			done = false;
		}

		body_c.x += delta.x;
		body_c.y += delta.y;
	}

	return done;
}

