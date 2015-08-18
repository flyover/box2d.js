/*
* Copyright (c) 2013 Google, Inc.
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

//#if B2_ENABLE_PARTICLE

goog.provide('box2d.b2ParticleGroup');
goog.provide('box2d.b2ParticleGroupDef');

goog.require('box2d.b2Particle');

/** 
 * The particle group type.  Can be combined with the | 
 * operator. 
 *  
 * @export 
 * @enum {number}
 */
box2d.b2ParticleGroupFlag = 
{
	/// Prevents overlapping or leaking.
	b2_solidParticleGroup : 1 << 0,
	/// Keeps its shape.
	b2_rigidParticleGroup : 1 << 1,
	/// Won't be destroyed if it gets empty.
	b2_particleGroupCanBeEmpty : 1 << 2,
	/// Will be destroyed on next simulation step.
	b2_particleGroupWillBeDestroyed : 1 << 3,
	/// Updates depth data on next simulation step.
	b2_particleGroupNeedsUpdateDepth : 1 << 4
};

goog.exportProperty(box2d.b2ParticleGroupFlag, 'b2_solidParticleGroup'           , box2d.b2ParticleGroupFlag.b2_solidParticleGroup           );
goog.exportProperty(box2d.b2ParticleGroupFlag, 'b2_rigidParticleGroup'           , box2d.b2ParticleGroupFlag.b2_rigidParticleGroup           );
goog.exportProperty(box2d.b2ParticleGroupFlag, 'b2_particleGroupCanBeEmpty'      , box2d.b2ParticleGroupFlag.b2_particleGroupCanBeEmpty      );
goog.exportProperty(box2d.b2ParticleGroupFlag, 'b2_particleGroupWillBeDestroyed' , box2d.b2ParticleGroupFlag.b2_particleGroupWillBeDestroyed );
goog.exportProperty(box2d.b2ParticleGroupFlag, 'b2_particleGroupNeedsUpdateDepth', box2d.b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth);

/** 
 * @const 
 * @type {number}
 */
box2d.b2ParticleGroupFlag.b2_particleGroupInternalMask = box2d.b2ParticleGroupFlag.b2_particleGroupWillBeDestroyed | box2d.b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth;

/** 
 * A particle group definition holds all the data needed to 
 * construct a particle group.  You can safely re-use these 
 * definitions. 
 *  
 * @export 
 * @constructor 
 */
box2d.b2ParticleGroupDef = function ()
{
	this.position = box2d.b2Vec2_zero.Clone();
	this.linearVelocity = box2d.b2Vec2_zero.Clone();
	this.color = box2d.b2ParticleColor_zero.Clone();
}

/** 
 * The particle-behavior flags (See #b2ParticleFlag). 
 *  
 * @export 
 * @type {number}
 */
box2d.b2ParticleGroupDef.prototype.flags = 0;

/** 
 * The group-construction flags (See #b2ParticleGroupFlag). 
 *  
 * @export 
 * @type {number}
 */
box2d.b2ParticleGroupDef.prototype.groupFlags = 0;

/** 
 * The world position of the group. 
 * Moves the group's shape a distance equal to the value of position. 
 *  
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.b2ParticleGroupDef.prototype.position = null;

/** 
 * The world angle of the group in radians. 
 * Rotates the shape by an angle equal to the value of angle. 
 *  
 * @export 
 * @type {number} 
 */
box2d.b2ParticleGroupDef.prototype.angle = 0.0;

/** 
 * The linear velocity of the group's origin in world co-ordinates. 
 *  
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.b2ParticleGroupDef.prototype.linearVelocity = null;

/** 
 * The angular velocity of the group. 
 *  
 * @export 
 * @type {number} 
 */
box2d.b2ParticleGroupDef.prototype.angularVelocity = 0.0;

/** 
 * The color of all particles in the group. 
 *  
 * @export 
 * @type {box2d.b2ParticleColor} 
 */
box2d.b2ParticleGroupDef.prototype.color = null;

/** 
 * The strength of cohesion among the particles in a group with 
 * flag b2_elasticParticle or b2_springParticle. 
 *  
 * @export 
 * @type {number} 
 */
box2d.b2ParticleGroupDef.prototype.strength = 1.0;

/** 
 * The shape where particles will be added. 
 *  
 * @export 
 * @type {box2d.b2Shape}
 */
box2d.b2ParticleGroupDef.prototype.shape = null;

/** 
 * A array of shapes where particles will be added. 
 *  
 * @export 
 * @type {Array.<box2d.b2Shape>}
 */
box2d.b2ParticleGroupDef.prototype.shapes = null;

/** 
 * The number of shapes. 
 *  
 * @export 
 * @type {number} 
 */
box2d.b2ParticleGroupDef.prototype.shapeCount = 0;

/** 
 * The interval of particles in the shape. 
 * If it is 0, b2_particleStride * particleDiameter is used 
 * instead. 
 *  
 * @export 
 * @type {number} 
 */
box2d.b2ParticleGroupDef.prototype.stride = 0.0;

/** 
 * The number of particles in addition to ones added in the 
 * shape. 
 *  
 * @export 
 * @type {number} 
 */
box2d.b2ParticleGroupDef.prototype.particleCount = 0;

/** 
 * The initial positions of the particleCount particles. 
 *  
 * @export 
 * @type {Array.<box2d.b2Vec2>} 
 */
box2d.b2ParticleGroupDef.prototype.positionData = null;

/** 
 * Lifetime of the particle group in seconds.  A value <= 0.0f 
 * indicates a particle group with infinite lifetime. 
 *  
 * @export 
 * @type {number} 
 */
box2d.b2ParticleGroupDef.prototype.lifetime = 0.0;

/** 
 * Use this to store application-specific group data. 
 *  
 * @export 
 * @type {*} 
 */
box2d.b2ParticleGroupDef.prototype.userData = null;

/** 
 * An existing particle group to which the particles will be 
 * added. 
 *  
 * @export 
 * @type {box2d.b2ParticleGroup} 
 */
box2d.b2ParticleGroupDef.prototype.group = null;

/** 
 * A group of particles. b2ParticleSystem::CreateParticleGroup 
 * creates these. 
 *  
 * @export 
 * @constructor 
 */
box2d.b2ParticleGroup = function ()
{
	this.m_center = new box2d.b2Vec2();
	this.m_linearVelocity = new box2d.b2Vec2();
	this.m_transform = new box2d.b2Transform();
	this.m_transform.SetIdentity();
}

/**
 * @type {box2d.b2ParticleSystem}
 */
box2d.b2ParticleGroup.prototype.m_system = null;

/**
 * @type {number}
 */
box2d.b2ParticleGroup.prototype.m_firstIndex = 0;

/**
 * @type {number}
 */
box2d.b2ParticleGroup.prototype.m_lastIndex = 0;

/**
 * @type {number}
 */
box2d.b2ParticleGroup.prototype.m_groupFlags = 0;

/**
 * @type {number}
 */
box2d.b2ParticleGroup.prototype.m_strength = 1.0;

/**
 * @type {box2d.b2ParticleGroup}
 */
box2d.b2ParticleGroup.prototype.m_prev = null;

/**
 * @type {box2d.b2ParticleGroup}
 */
box2d.b2ParticleGroup.prototype.m_next = null;

/**
 * @type {number}
 */
box2d.b2ParticleGroup.prototype.m_timestamp = -1;

/**
 * @type {number}
 */
box2d.b2ParticleGroup.prototype.m_mass = 0.0;

/**
 * @type {number}
 */
box2d.b2ParticleGroup.prototype.m_inertia = 0.0;

/**
 * @type {box2d.b2Vec2}
 */
box2d.b2ParticleGroup.prototype.m_center = null;

/**
 * @type {box2d.b2Vec2}
 */
box2d.b2ParticleGroup.prototype.m_linearVelocity = null;

/**
 * @type {number}
 */
box2d.b2ParticleGroup.prototype.m_angularVelocity = 0.0;

/**
 * @type {box2d.b2Transform}
 */
box2d.b2ParticleGroup.prototype.m_transform = null;

/**
 * @type {*}
 */
box2d.b2ParticleGroup.prototype.m_userData = null;

/** 
 * Get the next particle group from the list in b2_World. 
 *  
 * @export 
 * @return {box2d.b2ParticleGroup}
 */
box2d.b2ParticleGroup.prototype.GetNext = function ()
{
	return this.m_next;
}

/** 
 * Get the particle system that holds this particle group. 
 *  
 * @export 
 * @return {box2d.b2ParticleSystem} 
 */
box2d.b2ParticleGroup.prototype.GetParticleSystem = function ()
{
	return this.m_system;
}

/** 
 * Get the number of particles. 
 *  
 * @export 
 * @return {number} 
 */
box2d.b2ParticleGroup.prototype.GetParticleCount = function ()
{
	return this.m_lastIndex - this.m_firstIndex;
}

/** 
 * Get the offset of this group in the global particle buffer 
 *  
 * @export 
 * @return {number} 
 */
box2d.b2ParticleGroup.prototype.GetBufferIndex = function ()
{
	return this.m_firstIndex;
}

/** 
 * Does this group contain the particle. 
 *  
 * @return {boolean} 
 * @param {number} index 
 */
box2d.b2ParticleGroup.prototype.ContainsParticle = function (index)
{
	return this.m_firstIndex <= index && index < this.m_lastIndex;
}

/** 
 * Get the logical sum of particle flags. 
 *  
 * @export 
 * @return {number} 
 */
box2d.b2ParticleGroup.prototype.GetAllParticleFlags = function ()
{
	var flags = 0;
	for (var i = this.m_firstIndex; i < this.m_lastIndex; i++)
	{
		flags |= this.m_system.m_flagsBuffer.data[i];
	}
	return flags;
}

/** 
 * Get the construction flags for the group. 
 *  
 * @export 
 * @return {number} 
 */
box2d.b2ParticleGroup.prototype.GetGroupFlags = function ()
{
	return this.m_groupFlags;
}

/** 
 * Set the construction flags for the group. 
 *  
 * @export 
 * @return {void} 
 * @param {number} flags 
 */
box2d.b2ParticleGroup.prototype.SetGroupFlags = function (flags)
{
	box2d.b2Assert((flags & box2d.b2ParticleGroupFlag.b2_particleGroupInternalMask) === 0);
	flags |= this.m_groupFlags & box2d.b2ParticleGroupFlag.b2_particleGroupInternalMask;
	this.m_system.SetGroupFlags(this, flags);
}   		 
/** 
 * Get the total mass of the group: the sum of all particles in 
 * it. 
 *  
 * @export 
 * @return {number} 
 */
box2d.b2ParticleGroup.prototype.GetMass = function ()
{
	this.UpdateStatistics();
	return this.m_mass;
}

/** 
 * Get the moment of inertia for the group. 
 *  
 * @export 
 * @return {number} 
 */
box2d.b2ParticleGroup.prototype.GetInertia = function ()
{
	this.UpdateStatistics();
	return this.m_inertia;
}

/** 
 * Get the center of gravity for the group. 
 *  
 * @export 
 * @return {box2d.b2Vec2} 
 */
box2d.b2ParticleGroup.prototype.GetCenter = function ()
{
	this.UpdateStatistics();
	return this.m_center;
}

/** 
 * Get the linear velocity of the group. 
 *  
 * @export 
 * @return {box2d.b2Vec2} 
 */
box2d.b2ParticleGroup.prototype.GetLinearVelocity = function ()
{
	this.UpdateStatistics();
	return this.m_linearVelocity;
}

/** 
 * Get the angular velocity of the group. 
 *  
 * @export 
 * @return {number} 
 */
box2d.b2ParticleGroup.prototype.GetAngularVelocity = function ()
{
	this.UpdateStatistics();
	return this.m_angularVelocity;
}

/** 
 * Get the position of the group's origin and rotation. 
 *  
 * Used only with groups of rigid particles. 
 *  
 * @export 
 * @return {box2d.b2Transform} 
 */
box2d.b2ParticleGroup.prototype.GetTransform = function ()
{
	return this.m_transform;
}

/** 
 * Get position of the particle group as a whole. 
 *  
 * Used only with groups of rigid particles. 
 *  
 * @export 
 * @return {box2d.b2Vec2} 
 */
box2d.b2ParticleGroup.prototype.GetPosition = function ()
{
	return this.m_transform.p;
}

/** 
 * Get the rotational angle of the particle group as a whole. 
 *  
 * Used only with groups of rigid particles. 
 *  
 * @export 
 * @return {number} 
 */
box2d.b2ParticleGroup.prototype.GetAngle = function ()
{
	return this.m_transform.q.GetAngle();
}

/** 
 * Get the world linear velocity of a world point, from the 
 * average linear and angular velocities of the particle group.
 *  
 * @export 
 * @return {box2d.b2Vec2} the world velocity of a point.
 * @param {box2d.b2Vec2} worldPoint a point in world 
 *  	  coordinates.
 * @param {box2d.b2Vec2} out 
 */
box2d.b2ParticleGroup.prototype.GetLinearVelocityFromWorldPoint = function (worldPoint, out)
{
	var s_t0 = box2d.b2ParticleGroup.prototype.GetLinearVelocityFromWorldPoint.s_t0;
	this.UpdateStatistics();
	///	return m_linearVelocity + b2Cross(m_angularVelocity, worldPoint - m_center);
	return box2d.b2AddCross_V2_S_V2(this.m_linearVelocity, this.m_angularVelocity, box2d.b2Sub_V2_V2(worldPoint, this.m_center, s_t0), out);
}
box2d.b2ParticleGroup.prototype.GetLinearVelocityFromWorldPoint.s_t0 = new box2d.b2Vec2();

/** 
 * Get the user data pointer that was provided in the group 
 * definition. 
 *  
 * @export 
 * @return {*} 
 */
box2d.b2ParticleGroup.prototype.GetUserData = function ()
{
	return this.m_userData;
}

/** 
 * Set the user data. Use this to store your application 
 * specific data. 
 *  
 * @export 
 * @return {void} 
 * @param {*} data 
 */
box2d.b2ParticleGroup.prototype.SetUserData = function (data)
{
	this.m_userData = data;
}

/** 
 * Call b2ParticleSystem::ApplyForce for every particle in the 
 * group. 
 *  
 * @export 
 * @return {void} 
 * @param {box2d.b2Vec2} force 
 */
box2d.b2ParticleGroup.prototype.ApplyForce = function (force)
{
	this.m_system.ApplyForce(this.m_firstIndex, this.m_lastIndex, force);
}

/** 
 * Call b2ParticleSystem::ApplyLinearImpulse for every particle 
 * in the group. 
 *  
 * @export 
 * @return {void} 
 * @param {box2d.b2Vec2} impulse 
 */
box2d.b2ParticleGroup.prototype.ApplyLinearImpulse = function (impulse)
{
	this.m_system.ApplyLinearImpulse(this.m_firstIndex, this.m_lastIndex, impulse);
}

/** 
 * Destroy all the particles in this group. 
 *  
 * warning: This function is locked during callbacks. 
 *  
 * @export 
 * @return {void} 
 * @param {boolean=} callDestructionListener Whether to call the 
 *  	  world b2DestructionListener for each particle is
 *  	  destroyed.
 */
box2d.b2ParticleGroup.prototype.DestroyParticles = function (callDestructionListener)
{
	box2d.b2Assert(this.m_system.m_world.IsLocked() === false);
	if (this.m_system.m_world.IsLocked())
	{
		return;
	}

	for (var i = this.m_firstIndex; i < this.m_lastIndex; i++) {
		this.m_system.DestroyParticle(i, callDestructionListener);
	}
}

/**
 * @export 
 * @return {void} 
 */
box2d.b2ParticleGroup.prototype.UpdateStatistics = function ()
{
	var p = new box2d.b2Vec2();
	var v = new box2d.b2Vec2();
	if (this.m_timestamp != this.m_system.m_timestamp)
	{
		var m = this.m_system.GetParticleMass();
		///	this.m_mass = 0;
		this.m_mass = m * (this.m_lastIndex - this.m_firstIndex);
		this.m_center.SetZero();
		this.m_linearVelocity.SetZero();
		for (var i = this.m_firstIndex; i < this.m_lastIndex; i++)
		{
			///	this.m_mass += m;
			///	this.m_center += m * this.m_system.m_positionBuffer.data[i];
			this.m_center.SelfMulAdd(m, this.m_system.m_positionBuffer.data[i]);
			///	this.m_linearVelocity += m * this.m_system.m_velocityBuffer.data[i];
			this.m_linearVelocity.SelfMulAdd(m, this.m_system.m_velocityBuffer.data[i]);
		}
		if (this.m_mass > 0)
		{
			var inv_mass = 1 / this.m_mass;
			///this.m_center *= 1 / this.m_mass;
			this.m_center.SelfMul(inv_mass);
			///this.m_linearVelocity *= 1 / this.m_mass;
			this.m_linearVelocity.SelfMul(inv_mass);
		}
		this.m_inertia = 0;
		this.m_angularVelocity = 0;
		for (var i = this.m_firstIndex; i < this.m_lastIndex; i++)
		{
			///b2Vec2 p = this.m_system.m_positionBuffer.data[i] - this.m_center;
			box2d.b2Sub_V2_V2(this.m_system.m_positionBuffer.data[i], this.m_center, p);
			///b2Vec2 v = this.m_system.m_velocityBuffer.data[i] - this.m_linearVelocity;
			box2d.b2Sub_V2_V2(this.m_system.m_velocityBuffer.data[i], this.m_linearVelocity, v);
			this.m_inertia += m * box2d.b2Dot_V2_V2(p, p);
			this.m_angularVelocity += m * box2d.b2Cross_V2_V2(p, v);
		}
		if (this.m_inertia > 0)
		{
			this.m_angularVelocity *= 1 / this.m_inertia;
		}
		this.m_timestamp = this.m_system.m_timestamp;
	}
}

//#endif

