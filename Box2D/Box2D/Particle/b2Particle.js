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
goog.provide('box2d.b2ParticleColor');
goog.provide('box2d.b2ParticleDef');

/**
 * The particle type. Can be combined with the | operator.
 *
 * @export
 * @enum {number}
 */
box2d.b2ParticleFlag = {
  /// Water particle.
  b2_waterParticle: 0,
  /// Removed after next simulation step.
  b2_zombieParticle: 1 << 1,
  /// Zero velocity.
  b2_wallParticle: 1 << 2,
  /// With restitution from stretching.
  b2_springParticle: 1 << 3,
  /// With restitution from deformation.
  b2_elasticParticle: 1 << 4,
  /// With viscosity.
  b2_viscousParticle: 1 << 5,
  /// Without isotropic pressure.
  b2_powderParticle: 1 << 6,
  /// With surface tension.
  b2_tensileParticle: 1 << 7,
  /// Mix color between contacting particles.
  b2_colorMixingParticle: 1 << 8,
  /// Call b2DestructionListener on destruction.
  b2_destructionListenerParticle: 1 << 9,
  /// Prevents other particles from leaking.
  b2_barrierParticle: 1 << 10,
  /// Less compressibility.
  b2_staticPressureParticle: 1 << 11,
  /// Makes pairs or triads with other particles.
  b2_reactiveParticle: 1 << 12,
  /// With high repulsive force.
  b2_repulsiveParticle: 1 << 13,
  /// Call b2ContactListener when this particle is about to interact with
  /// a rigid body or stops interacting with a rigid body.
  /// This results in an expensive operation compared to using
  /// b2_fixtureContactFilterParticle to detect collisions between
  /// particles.
  b2_fixtureContactListenerParticle: 1 << 14,
  /// Call b2ContactListener when this particle is about to interact with
  /// another particle or stops interacting with another particle.
  /// This results in an expensive operation compared to using
  /// b2_particleContactFilterParticle to detect collisions between
  /// particles.
  b2_particleContactListenerParticle: 1 << 15,
  /// Call b2ContactFilter when this particle interacts with rigid bodies.
  b2_fixtureContactFilterParticle: 1 << 16,
  /// Call b2ContactFilter when this particle interacts with other
  /// particles.
  b2_particleContactFilterParticle: 1 << 17
};

goog.exportProperty(box2d.b2ParticleFlag, 'b2_waterParticle', box2d.b2ParticleFlag.b2_waterParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_zombieParticle', box2d.b2ParticleFlag.b2_zombieParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_wallParticle', box2d.b2ParticleFlag.b2_wallParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_springParticle', box2d.b2ParticleFlag.b2_springParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_elasticParticle', box2d.b2ParticleFlag.b2_elasticParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_viscousParticle', box2d.b2ParticleFlag.b2_viscousParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_powderParticle', box2d.b2ParticleFlag.b2_powderParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_tensileParticle', box2d.b2ParticleFlag.b2_tensileParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_colorMixingParticle', box2d.b2ParticleFlag.b2_colorMixingParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_destructionListenerParticle', box2d.b2ParticleFlag.b2_destructionListenerParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_barrierParticle', box2d.b2ParticleFlag.b2_barrierParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_staticPressureParticle', box2d.b2ParticleFlag.b2_staticPressureParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_reactiveParticle', box2d.b2ParticleFlag.b2_reactiveParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_repulsiveParticle', box2d.b2ParticleFlag.b2_repulsiveParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_fixtureContactListenerParticle', box2d.b2ParticleFlag.b2_fixtureContactListenerParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_particleContactListenerParticle', box2d.b2ParticleFlag.b2_particleContactListenerParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_fixtureContactFilterParticle', box2d.b2ParticleFlag.b2_fixtureContactFilterParticle);
goog.exportProperty(box2d.b2ParticleFlag, 'b2_particleContactFilterParticle', box2d.b2ParticleFlag.b2_particleContactFilterParticle);

/**
 * Small color object for each particle
 * Constructor with four elements: r (red), g (green), b (blue), and a (opacity).
 * Each element can be specified 0 to 255.
 *
 * @export
 * @constructor
 * @param {number|box2d.b2Color=} a0
 * @param {number=} a1
 * @param {number=} a2
 * @param {number=} a3
 */
box2d.b2ParticleColor = function(a0, a1, a2, a3) {
  if (arguments.length === 0) {
    //this.r = this.g = this.b = this.a = 0;
  } else if (a0 instanceof box2d.b2Color) {
    this.r = 0 | (255 * a0.r);
    this.g = 0 | (255 * a0.g);
    this.b = 0 | (255 * a0.b);
    this.a = 0 | (255 * a0.a);
  } else if (arguments.length >= 3) {
    this.r = (0 | a0) || 0;
    this.g = (0 | a1) || 0;
    this.b = (0 | a2) || 0;
    this.a = (0 | a3) || 0;
  } else {
    throw new Error();
  }
}

/**
 * @export
 * @type {number}
 */
box2d.b2ParticleColor.prototype.r = 0;

/**
 * @export
 * @type {number}
 */
box2d.b2ParticleColor.prototype.g = 0;

/**
 * @export
 * @type {number}
 */
box2d.b2ParticleColor.prototype.b = 0;

/**
 * @export
 * @type {number}
 */
box2d.b2ParticleColor.prototype.a = 0;

/**
 * True when all four color elements equal 0. When true, a
 * particle color buffer isn't allocated by CreateParticle().
 *
 * @export
 * @return {boolean}
 */
box2d.b2ParticleColor.prototype.IsZero = function() {
  return (this.r === 0) && (this.g === 0) && (this.b === 0) && (this.a === 0);
}

/**
 * Used internally to convert the value of b2Color.
 *
 * @export
 * @return {box2d.b2Color}
 * @param {box2d.b2Color} out
 */
box2d.b2ParticleColor.prototype.GetColor = function(out) {
  out.r = this.r / 255.0;
  out.g = this.g / 255.0;
  out.b = this.b / 255.0;
  out.a = this.a / 255.0;
  return out;
}

/**
 * @export
 * @return {void}
 * @param {number|box2d.b2Color} a0
 * @param {number=} a1
 * @param {number=} a2
 * @param {number=} a3
 */
box2d.b2ParticleColor.prototype.Set = function(a0, a1, a2, a3) {
  if (a0 instanceof box2d.b2Color) {
    this.SetColor(a0);
  } else if (arguments.length >= 3) {
    this.SetRGBA(a0 || 0, a1 || 0, a2 || 0, a3);
  } else {
    throw new Error();
  }
}

/**
 * Sets color for current object using the four elements
 * described above.
 *
 * @export
 * @return {void}
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number=} a
 */
box2d.b2ParticleColor.prototype.SetRGBA = function(r, g, b, a) {
  a = (typeof(a) === 'number') ? (a) : (255);
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
}

/**
 * Initializes the object with the value of the b2Color.
 *
 * @export
 * @return {void}
 * @param {box2d.b2Color} color
 */
box2d.b2ParticleColor.prototype.SetColor = function(color) {
  this.r = (255 * color.r);
  this.g = (255 * color.g);
  this.b = (255 * color.b);
  this.a = (255 * color.a);
}

/**
 * Assign a b2ParticleColor to this instance.
 *
 * @export
 * @return {box2d.b2ParticleColor}
 * @param {box2d.b2ParticleColor} color
 */
box2d.b2ParticleColor.prototype.Copy = function(color) {
  this.r = color.r;
  this.g = color.g;
  this.b = color.b;
  this.a = color.a;
  return this;
}

/**
 * @return {box2d.b2ParticleColor}
 */
box2d.b2ParticleColor.prototype.Clone = function() {
  return new box2d.b2ParticleColor(this.r, this.g, this.b, this.a);
}

/**
 * Multiplies r, g, b, a members by s where s is a value between 0.0 and 1.0.
 *
 * @export
 * @return {box2d.b2ParticleColor}
 * @param {number} s
 */
box2d.b2ParticleColor.prototype.SelfMul_0_1 = function(s) {
  this.r *= s;
  this.g *= s;
  this.b *= s;
  this.a *= s;
  return this;
}

/**
 * Scales r, g, b, a members by s where s is a value between 0
 * and 255.
 *
 * @export
 * @return {box2d.b2ParticleColor}
 * @param {number} s
 */
box2d.b2ParticleColor.prototype.SelfMul_0_255 = function(s) {
  // 1..256 to maintain the complete dynamic range.
  var scale = s + 1;
  this.r = (this.r * scale) >> box2d.b2ParticleColor.k_bitsPerComponent;
  this.g = (this.g * scale) >> box2d.b2ParticleColor.k_bitsPerComponent;
  this.b = (this.b * scale) >> box2d.b2ParticleColor.k_bitsPerComponent;
  this.a = (this.a * scale) >> box2d.b2ParticleColor.k_bitsPerComponent;
  return this;
}

/**
 * Scales r, g, b, a members by s returning the modified
 * b2ParticleColor.
 *
 * @export
 * @return {box2d.b2ParticleColor}
 * @param {number} s
 * @param {box2d.b2ParticleColor} out
 */
box2d.b2ParticleColor.prototype.Mul_0_1 = function(s, out) {
  return out.Copy(this).SelfMul_0_1(s);
}

/**
 * Scales r, g, b, a members by s returning the modified
 * b2ParticleColor.
 *
 * @export
 * @return {box2d.b2ParticleColor}
 * @param {number} s
 * @param {box2d.b2ParticleColor} out
 */
box2d.b2ParticleColor.prototype.Mul_0_255 = function(s, out) {
  return out.Copy(this).SelfMul_0_255(s);
}

/**
 * Add two colors.  This is a non-saturating addition so values
 * overflows will wrap.
 *
 * @export
 * @return {box2d.b2ParticleColor}
 * @param {box2d.b2ParticleColor} color
 */
box2d.b2ParticleColor.prototype.SelfAdd = function(color) {
  this.r += color.r;
  this.g += color.g;
  this.b += color.b;
  this.a += color.a;
  return this;
}

/**
 * Add two colors.  This is a non-saturating addition so values
 * overflows will wrap.
 *
 * @export
 * @return {box2d.b2ParticleColor}
 * @param {box2d.b2ParticleColor} color
 * @param {box2d.b2ParticleColor} out
 */
box2d.b2ParticleColor.prototype.Add = function(color, out) {
  out.r = this.r + color.r;
  out.g = this.g + color.g;
  out.b = this.b + color.b;
  out.a = this.a + color.a;
  return out;
}

/**
 * Subtract a color from this color.  This is a subtraction
 * without saturation so underflows will wrap.
 *
 * @export
 * @return {box2d.b2ParticleColor}
 * @param {box2d.b2ParticleColor} color
 */
box2d.b2ParticleColor.prototype.SelfSub = function(color) {
  this.r -= color.r;
  this.g -= color.g;
  this.b -= color.b;
  this.a -= color.a;
  return this;
}

/**
 * Subtract a color from this color returning the result.  This
 * is a subtraction without saturation so underflows will wrap.
 *
 * @export
 * @return {box2d.b2ParticleColor}
 * @param {box2d.b2ParticleColor} color
 * @param {box2d.b2ParticleColor} out
 */
box2d.b2ParticleColor.prototype.Sub = function(color, out) {
  out.r = this.r - color.r;
  out.g = this.g - color.g;
  out.b = this.b - color.b;
  out.a = this.a - color.a;
  return out;
}

/**
 * Compare this color with the specified color.
 *
 * @export
 * @return {boolean}
 * @param {box2d.b2ParticleColor} color
 */
box2d.b2ParticleColor.prototype.IsEqual = function(color) {
  return (this.r === color.r) && (this.g === color.g) && (this.b === color.b) && (this.a === color.a);
}

/**
 * Mix mixColor with this color using strength to control how
 * much of mixColor is mixed with this color and vice versa.
 * The range of strength is 0..128 where 0 results in no color
 * mixing and 128 results in an equal mix of both colors.
 * strength 0..128 is analogous to an alpha channel value
 * between 0.0f..0.5f.
 *
 * @export
 * @return {void}
 * @param {box2d.b2ParticleColor} mixColor
 * @param {number} strength
 */
box2d.b2ParticleColor.prototype.Mix = function(mixColor, strength) {
  box2d.b2ParticleColor.MixColors(this, mixColor, strength);
}

/**
 * Mix colorA with colorB using strength to control how much of
 * colorA is mixed with colorB and vice versa.  The range of
 * strength is 0..128 where 0 results in no color mixing and 128
 * results in an equal mix of both colors.  strength 0..128 is
 * analogous to an alpha channel value between 0.0f..0.5f.
 *
 * @export
 * @return {void}
 * @param {box2d.b2ParticleColor} colorA
 * @param {box2d.b2ParticleColor} colorB
 * @param {number} strength
 */
box2d.b2ParticleColor.MixColors = function(colorA, colorB, strength) {
  var dr = (strength * (colorB.r - colorA.r)) >> box2d.b2ParticleColor.k_bitsPerComponent;
  var dg = (strength * (colorB.g - colorA.g)) >> box2d.b2ParticleColor.k_bitsPerComponent;
  var db = (strength * (colorB.b - colorA.b)) >> box2d.b2ParticleColor.k_bitsPerComponent;
  var da = (strength * (colorB.a - colorA.a)) >> box2d.b2ParticleColor.k_bitsPerComponent;
  colorA.r += dr;
  colorA.g += dg;
  colorA.b += db;
  colorA.a += da;
  colorB.r -= dr;
  colorB.g -= dg;
  colorB.b -= db;
  colorB.a -= da;
}

/**
 * @type {number}
 */
box2d.B2PARTICLECOLOR_BITS_PER_COMPONENT = (1 << 3);

/**
 * @type {number}
 */
box2d.B2PARTICLECOLOR_MAX_VALUE = ((1 << box2d.B2PARTICLECOLOR_BITS_PER_COMPONENT) - 1);

/**
 * Maximum value of a b2ParticleColor component.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleColor.k_maxValue = +box2d.B2PARTICLECOLOR_MAX_VALUE;

/**
 * 1.0 / k_maxValue.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleColor.k_inverseMaxValue = 1.0 / +box2d.B2PARTICLECOLOR_MAX_VALUE;

/**
 * Number of bits used to store each b2ParticleColor component.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleColor.k_bitsPerComponent = box2d.B2PARTICLECOLOR_BITS_PER_COMPONENT;

/**
 * @const
 * @type {box2d.b2ParticleColor}
 */
box2d.b2ParticleColor_zero = new box2d.b2ParticleColor();

/**
 * A particle definition holds all the data needed to construct
 * a particle.
 * You can safely re-use these definitions.
 *
 * @export
 * @constructor
 */
box2d.b2ParticleDef = function() {
  this.position = box2d.b2Vec2_zero.Clone();
  this.velocity = box2d.b2Vec2_zero.Clone();
  this.color = box2d.b2ParticleColor_zero.Clone();
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
 * @type {box2d.b2ParticleColor}
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
box2d.b2CalculateParticleIterations = function(gravity, radius, timeStep) {
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
box2d.b2ParticleHandle = function() {}

/**
 * @type {number}
 */
box2d.b2ParticleHandle.prototype.m_index = box2d.b2_invalidParticleIndex;

/**
 * @export
 * @return {number}
 */
box2d.b2ParticleHandle.prototype.GetIndex = function() {
  return this.m_index;
}

/**
 * @return {void}
 * @param {number} index
 */
box2d.b2ParticleHandle.prototype.SetIndex = function(index) {
  this.m_index = index;
}

//#endif
