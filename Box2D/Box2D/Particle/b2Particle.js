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

goog.provide('box2d.b2Particle');
goog.provide('box2d.b2ParticleFlag');
goog.provide('box2d.b2ParticleDef');

/** 
 * The particle type. Can be combined with the | operator. 
 *  
 * @export 
 * @enum {number}
 */
box2d.b2ParticleFlag = 
{
	/// Water particle.
	b2_waterParticle : 0,
	/// Removed after next simulation step.
	b2_zombieParticle : 1 << 1,
	/// Zero velocity.
	b2_wallParticle : 1 << 2,
	/// With restitution from stretching.
	b2_springParticle : 1 << 3,
	/// With restitution from deformation.
	b2_elasticParticle : 1 << 4,
	/// With viscosity.
	b2_viscousParticle : 1 << 5,
	/// Without isotropic pressure.
	b2_powderParticle : 1 << 6,
	/// With surface tension.
	b2_tensileParticle : 1 << 7,
	/// Mix color between contacting particles.
	b2_colorMixingParticle : 1 << 8,
	/// Call b2DestructionListener on destruction.
	b2_destructionListenerParticle : 1 << 9,
	/// Prevents other particles from leaking.
	b2_barrierParticle : 1 << 10,
	/// Less compressibility.
	b2_staticPressureParticle : 1 << 11,
	/// Makes pairs or triads with other particles.
	b2_reactiveParticle : 1 << 12,
	/// With high repulsive force.
	b2_repulsiveParticle : 1 << 13,
	/// Call b2ContactListener when this particle is about to interact with
	/// a rigid body or stops interacting with a rigid body.
	/// This results in an expensive operation compared to using
	/// b2_fixtureContactFilterParticle to detect collisions between
	/// particles.
	b2_fixtureContactListenerParticle : 1 << 14,
	/// Call b2ContactListener when this particle is about to interact with
	/// another particle or stops interacting with another particle.
	/// This results in an expensive operation compared to using
	/// b2_particleContactFilterParticle to detect collisions between
	/// particles.
	b2_particleContactListenerParticle : 1 << 15,
	/// Call b2ContactFilter when this particle interacts with rigid bodies.
	b2_fixtureContactFilterParticle : 1 << 16,
	/// Call b2ContactFilter when this particle interacts with other
	/// particles.
	b2_particleContactFilterParticle : 1 << 17
};

goog.exportProperty(box2d.b2ParticleFlag, 'b2_waterParticle'                  , box2d.b2ParticleFlag.b2_waterParticle                  );
goog.exportProperty(box2d.b2ParticleFlag, 'b2_zombieParticle'                 , box2d.b2ParticleFlag.b2_zombieParticle                 );
goog.exportProperty(box2d.b2ParticleFlag, 'b2_wallParticle'                   , box2d.b2ParticleFlag.b2_wallParticle                   );
goog.exportProperty(box2d.b2ParticleFlag, 'b2_springParticle'                 , box2d.b2ParticleFlag.b2_springParticle                 );
goog.exportProperty(box2d.b2ParticleFlag, 'b2_elasticParticle'                , box2d.b2ParticleFlag.b2_elasticParticle                );
goog.exportProperty(box2d.b2ParticleFlag, 'b2_viscousParticle'                , box2d.b2ParticleFlag.b2_viscousParticle                );
goog.exportProperty(box2d.b2ParticleFlag, 'b2_powderParticle'                 , box2d.b2ParticleFlag.b2_powderParticle                 );
goog.exportProperty(box2d.b2ParticleFlag, 'b2_tensileParticle'                , box2d.b2ParticleFlag.b2_tensileParticle                );
goog.exportProperty(box2d.b2ParticleFlag, 'b2_colorMixingParticle'            , box2d.b2ParticleFlag.b2_colorMixingParticle            );
goog.exportProperty(box2d.b2ParticleFlag, 'b2_destructionListenerParticle'    , box2d.b2ParticleFlag.b2_destructionListenerParticle    );
goog.exportProperty(box2d.b2ParticleFlag, 'b2_barrierParticle'                , box2d.b2ParticleFlag.b2_barrierParticle                );
goog.exportProperty(box2d.b2ParticleFlag, 'b2_staticPressureParticle'         , box2d.b2ParticleFlag.b2_staticPressureParticle         );
goog.exportProperty(box2d.b2ParticleFlag, 'b2_reactiveParticle'               , box2d.b2ParticleFlag.b2_reactiveParticle               );
goog.exportProperty(box2d.b2ParticleFlag, 'b2_repulsiveParticle'              , box2d.b2ParticleFlag.b2_repulsiveParticle              );
goog.exportProperty(box2d.b2ParticleFlag, 'b2_fixtureContactListenerParticle' , box2d.b2ParticleFlag.b2_fixtureContactListenerParticle );
goog.exportProperty(box2d.b2ParticleFlag, 'b2_particleContactListenerParticle', box2d.b2ParticleFlag.b2_particleContactListenerParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_fixtureContactFilterParticle'   , box2d.b2ParticleFlag.b2_fixtureContactFilterParticle   );
goog.exportProperty(box2d.b2ParticleFlag, 'b2_particleContactFilterParticle'  , box2d.b2ParticleFlag.b2_particleContactFilterParticle  );

/** 
 * A particle definition holds all the data needed to construct 
 * a particle. 
 * You can safely re-use these definitions. 
 *  
 * @export 
 * @constructor 
 */
box2d.b2ParticleDef = function ()
{
	this.position = box2d.b2Vec2_zero.Clone();
	this.velocity = box2d.b2Vec2_zero.Clone();
	this.color = new box2d.b2Color(0, 0, 0, 0);
}

/** 
 * \brief Specifies the type of particle (see #b2ParticleFlag). 
 *  
 * A particle may be more than one type. 
 * Multiple types are chained by logical sums, for example: 
 * pd.flags = b2_elasticParticle | b2_viscousParticle 
 *  
 * @export 
 * @type {number}
 */
box2d.b2ParticleDef.prototype.flags = 0;

/** 
 * The world position of the particle. 
 *  
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2ParticleDef.prototype.position = null;

/** 
 * The linear velocity of the particle in world co-ordinates. 
 *  
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2ParticleDef.prototype.velocity = null;

/** 
 * The color of the particle. 
 *  
 * @export 
 * @type {box2d.b2Color}
 */
box2d.b2ParticleDef.prototype.color = null;

/** 
 * Lifetime of the particle in seconds.  A value <= 0.0f 
 * indicates a particle with infinite lifetime. 
 *  
 * @export 
 * @type {number}
 */
box2d.b2ParticleDef.prototype.lifetime = 0.0;

/** 
 * Use this to store application-specific body data. 
 *  
 * @export 
 * @type {*}
 */
box2d.b2ParticleDef.prototype.userData = null;

/** 
 * An existing particle group to which the particle will be 
 * added. 
 *  
 * @export 
 * @type {box2d.b2ParticleGroup}
 */
box2d.b2ParticleDef.prototype.group = null;

/** 
 * A helper function to calculate the optimal number of 
 * iterations. 
 *  
 * @export 
 * @return {number} 
 * @param {number} gravity 
 * @param {number} radius 
 * @param {number} timeStep 
 */
box2d.b2CalculateParticleIterations = function (gravity, radius, timeStep)
{
	// In some situations you may want more particle iterations than this,
	// but to avoid excessive cycle cost, don't recommend more than this.
	var B2_MAX_RECOMMENDED_PARTICLE_ITERATIONS = 8;
	var B2_RADIUS_THRESHOLD = 0.01;
	var iterations = Math.ceil(Math.sqrt(gravity / (B2_RADIUS_THRESHOLD * radius)) * timeStep);
	return box2d.b2Clamp(iterations, 1, B2_MAX_RECOMMENDED_PARTICLE_ITERATIONS);
}

/** 
 * Handle to a particle. Particle indices are ephemeral: the 
 * same index might refer to a different particle, from 
 * frame-to-frame. If you need to keep a reference to a 
 * particular particle across frames, you should acquire a 
 * b2ParticleHandle. Use 
 * #b2ParticleSystem::GetParticleHandleFromIndex() to retrieve 
 * the b2ParticleHandle of a particle from the particle system. 
 *  
 * @export 
 * @constructor 
 */
box2d.b2ParticleHandle = function ()
{
}

/**
 * @type {number}
 */
box2d.b2ParticleHandle.prototype.m_index = box2d.b2_invalidParticleIndex;

/**
 * @export 
 * @return {number} 
 */
box2d.b2ParticleHandle.prototype.GetIndex = function () { return this.m_index; }

/**
 * @return {void} 
 * @param {number} index 
 */
box2d.b2ParticleHandle.prototype.SetIndex = function (index) { this.m_index = index; }

//#endif

