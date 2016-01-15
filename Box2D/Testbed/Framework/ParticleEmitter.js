/*
 * Copyright (c) 2014 Google, Inc.
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

goog.provide('box2d.Testbed.RadialEmitter');

goog.require('box2d.b2Particle');
goog.require('box2d.b2ParticleGroup');
goog.require('box2d.b2ParticleSystem');

/**
 * Callback used to notify the user of created particles.
 * @export
 * @constructor
 */
box2d.Testbed.EmittedParticleCallback = function() {}

/**
 * Called for each created particle.
 * @return {void}
 * @param {box2d.b2ParticleSystem} system
 * @param {number} particleIndex
 */
box2d.Testbed.EmittedParticleCallback.prototype.ParticleCreated = function(system, particleIndex) {}

/**
 * Emit particles from a circular region.
 * @export
 * @constructor
 */
box2d.Testbed.RadialEmitter = function() {
  this._ctor_();
}

/**
 * Pointer to global world
 * @type {box2d.b2ParticleSystem}
 */
box2d.Testbed.RadialEmitter.prototype.m_particleSystem = null;
/**
 * Called for each created particle.
 * @type {box2d.Testbed.EmittedParticleCallback}
 */
box2d.Testbed.RadialEmitter.prototype.m_callback = null;
/**
 * Center of particle emitter
 * @type {box2d.b2Vec2}
 */
box2d.Testbed.RadialEmitter.prototype.m_origin;
/**
 * Launch direction.
 * @type {box2d.b2Vec2}
 */
box2d.Testbed.RadialEmitter.prototype.m_startingVelocity;
/**
 * Speed particles are emitted
 * @type {number}
 */
box2d.Testbed.RadialEmitter.prototype.m_speed = 0.0;
/**
 * Half width / height of particle emitter
 * @type {box2d.b2Vec2}
 */
box2d.Testbed.RadialEmitter.prototype.m_halfSize = null;
/**
 * Particles per second
 * @type {number}
 */
box2d.Testbed.RadialEmitter.prototype.m_emitRate = 1.0;
/**
 * Initial color of particle emitted.
 * @type {box2d.b2ParticleColor}
 */
box2d.Testbed.RadialEmitter.prototype.m_color;
/**
 * Number particles to emit on the next frame
 * @type {number}
 */
box2d.Testbed.RadialEmitter.prototype.m_emitRemainder = 0.0;
/**
 * Flags for created particles, see b2ParticleFlag.
 * @type {number}
 */
box2d.Testbed.RadialEmitter.prototype.m_flags = box2d.b2ParticleFlag.b2_waterParticle;
/**
 * Group to put newly created particles in.
 * @type {box2d.b2ParticleGroup}
 */
box2d.Testbed.RadialEmitter.prototype.m_group = null;

/**
 * Calculate a random number 0.0..1.0.
 * @return {number}
 */
box2d.Testbed.RadialEmitter.Random = function() {
  return Math.random();
}

/**
 * Initialize a particle emitter.
 * @return {void}
 */
box2d.Testbed.RadialEmitter.prototype._ctor_ = function() {
  this.m_origin = new box2d.b2Vec2();
  this.m_startingVelocity = new box2d.b2Vec2();
  this.m_halfSize = new box2d.b2Vec2();
  this.m_color = new box2d.b2ParticleColor();
}

/**
 * @return {void}
 */
box2d.Testbed.RadialEmitter.prototype._dtor_ = function() {
  this.SetGroup(null);
}

/**
 * Set the center of the emitter.
 * @return {void}
 * @param {box2d.b2Vec2} origin
 */
box2d.Testbed.RadialEmitter.prototype.SetPosition = function(origin) {
  this.m_origin.Copy(origin);
}

/**
 * Get the center of the emitter.
 * @return box2d.b2Vec2}
 */
box2d.Testbed.RadialEmitter.prototype.GetPosition = function(out) {
  return out.Copy(this.m_origin);
}

/**
 * Set the size of the circle which emits particles.
 * @return {void}
 * @param {box2d.b2Vec2} size
 */
box2d.Testbed.RadialEmitter.prototype.SetSize = function(size) {
  this.m_halfSize.Copy(size).SelfMul(0.5);
}

/**
 * Get the size of the circle which emits particles.
 * @return box2d.b2Vec2}
 */
box2d.Testbed.RadialEmitter.prototype.GetSize = function(out) {
  return out.Copy(this.m_halfSize).SelfMul(2.0);
}

/**
 * Set the starting velocity of emitted particles.
 * @return {void}
 * @param {box2d.b2Vec2} velocity
 */
box2d.Testbed.RadialEmitter.prototype.SetVelocity = function(velocity) {
  this.m_startingVelocity.Copy(velocity);
}

/**
 * Get the starting velocity.
 * @return box2d.b2Vec2}
 */
box2d.Testbed.RadialEmitter.prototype.GetVelocity = function(out) {
  return out.Copy(this.m_startingVelocity);
}

/**
 * Set the speed of particles along the direction from the
 * center of the emitter.
 * @return {void}
 * @param {number} speed
 */
box2d.Testbed.RadialEmitter.prototype.SetSpeed = function(speed) {
  this.m_speed = speed;
}

/**
 * Get the speed of particles along the direction from the
 * center of the emitter.
 * @return {number}
 */
box2d.Testbed.RadialEmitter.prototype.GetSpeed = function() {
  return this.m_speed;
}

/**
 * Set the flags for created particles.
 * @return {void}
 * @param {number} flags
 */
box2d.Testbed.RadialEmitter.prototype.SetParticleFlags = function(flags) {
  this.m_flags = flags;
}

/**
 * Get the flags for created particles.
 * @return {number}
 */
box2d.Testbed.RadialEmitter.prototype.GetParticleFlags = function() {
  return this.m_flags;
}

/**
 * Set the color of particles.
 * @return {void}
 * @param {box2d.b2ParticleColor} color
 */
box2d.Testbed.RadialEmitter.prototype.SetColor = function(color) {
  this.m_color.Copy(color);
}

/**
 * Get the color of particles emitter.
 * @return {box2d.b2ParticleColor}
 */
box2d.Testbed.RadialEmitter.prototype.GetColor = function(out) {
  return out.Copy(this.m_color);
}

/**
 * Set the emit rate in particles per second.
 * @return {void}
 * @param {number} emitRate
 */
box2d.Testbed.RadialEmitter.prototype.SetEmitRate = function(emitRate) {
  this.m_emitRate = emitRate;
}

/**
 * Get the current emit rate.
 * @return {number}
 */
box2d.Testbed.RadialEmitter.prototype.GetEmitRate = function() {
  return this.m_emitRate;
}

/**
 * Set the particle system this emitter is adding particles to.
 * @return {void}
 * @param {box2d.b2ParticleSystem} particleSystem
 */
box2d.Testbed.RadialEmitter.prototype.SetParticleSystem = function(particleSystem) {
  this.m_particleSystem = particleSystem;
}

/**
 * Get the particle system this emitter is adding particle to.
 * @return {box2d.b2ParticleSystem}
 */
box2d.Testbed.RadialEmitter.prototype.GetParticleSystem = function() {
  return this.m_particleSystem;
}

/**
 * Set the callback that is called on the creation of each
 * particle.
 * @return {void}
 * @param {box2d.Testbed.EmittedParticleCallback} callback
 */
box2d.Testbed.RadialEmitter.prototype.SetCallback = function(callback) {
  this.m_callback = callback;
}

/**
 * Get the callback that is called on the creation of each
 * particle.
 * @return {box2d.Testbed.EmittedParticleCallback}
 */
box2d.Testbed.RadialEmitter.prototype.GetCallback = function() {
  return this.m_callback;
}

/**
 * This class sets the group flags to b2_particleGroupCanBeEmpty
 * so that it isn't destroyed and clears the
 * b2_particleGroupCanBeEmpty on the group when the emitter no
 * longer references it so that the group can potentially be
 * cleaned up.
 * @return {void}
 * @param {box2d.b2ParticleGroup} group
 */
box2d.Testbed.RadialEmitter.prototype.SetGroup = function(group) {
  if (this.m_group) {
    this.m_group.SetGroupFlags(this.m_group.GetGroupFlags() & ~box2d.b2ParticleGroupFlag.b2_particleGroupCanBeEmpty);
  }
  this.m_group = group;
  if (this.m_group) {
    this.m_group.SetGroupFlags(this.m_group.GetGroupFlags() | box2d.b2ParticleGroupFlag.b2_particleGroupCanBeEmpty);
  }
}

/**
 * Get the group particles should be created within.
 * @return {box2d.b2ParticleGroup}
 */
box2d.Testbed.RadialEmitter.prototype.GetGroup = function() {
  return this.m_group;
}

/**
 * dt is seconds that have passed, particleIndices is an
 * optional pointer to an array which tracks which particles
 * have been created and particleIndicesCount is the size of the
 * particleIndices array. This function returns the number of
 * particles created during this simulation step.
 * @return {number}
 * @param {number} dt
 * @param {Array.<number>=} particleIndices
 * @param {number=} particleIndicesCount
 */
box2d.Testbed.RadialEmitter.prototype.Step = function(dt, particleIndices, particleIndicesCount) {
  box2d.b2Assert(this.m_particleSystem !== null);
  var numberOfParticlesCreated = 0;
  // How many (fractional) particles should we have emitted this frame?
  this.m_emitRemainder += this.m_emitRate * dt;

  var pd = new box2d.b2ParticleDef();
  pd.color.Copy(this.m_color);
  pd.flags = this.m_flags;
  pd.group = this.m_group;

  // Keep emitting particles on this frame until we only have a
  // fractional particle left.
  while (this.m_emitRemainder > 1.0) {
    this.m_emitRemainder -= 1.0;

    // Randomly pick a position within the emitter's radius.
    var angle = box2d.Testbed.RadialEmitter.Random() * 2.0 * box2d.b2_pi;
    // Distance from the center of the circle.
    var distance = box2d.Testbed.RadialEmitter.Random();
    var positionOnUnitCircle = new box2d.b2Vec2(Math.sin(angle), Math.cos(angle));

    // Initial position.
    pd.position.Set(
      this.m_origin.x + positionOnUnitCircle.x * distance * this.m_halfSize.x,
      this.m_origin.y + positionOnUnitCircle.y * distance * this.m_halfSize.y);
    // Send it flying
    pd.velocity.Copy(this.m_startingVelocity);
    if (this.m_speed !== 0.0) {
      ///	pd.velocity += positionOnUnitCircle * m_speed;
      pd.velocity.SelfMulAdd(this.m_speed, positionOnUnitCircle);
    }

    var particleIndex = this.m_particleSystem.CreateParticle(pd);
    if (this.m_callback) {
      this.m_callback.ParticleCreated(this.m_particleSystem, particleIndex);
    }
    if ((particleIndices !== null) && (numberOfParticlesCreated < particleIndicesCount)) {
      particleIndices[numberOfParticlesCreated] = particleIndex;
    }
    ++numberOfParticlesCreated;
  }
  return numberOfParticlesCreated;
}

//#endif
