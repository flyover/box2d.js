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

goog.provide('box2d.Testbed.MultipleParticleSystems');

goog.require('box2d.Testbed.Test');
goog.require('box2d.Testbed.RadialEmitter');

/**
 * The "Multiple Systems" test uses two particle emitters to
 * push a rigid body in opposing directions showing that
 * particles from each system can interact with the same body
 * and at the same time not interact with each other.
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.MultipleParticleSystems = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  this.m_emitters = [
    new box2d.Testbed.RadialEmitter(),
    new box2d.Testbed.RadialEmitter()
  ];

  // Configure the default particle system's parameters.
  this.m_particleSystem.SetRadius(0.05);
  this.m_particleSystem.SetMaxParticleCount(box2d.Testbed.MultipleParticleSystems.k_maxParticleCount);
  this.m_particleSystem.SetDestructionByAge(true);

  // Create a secondary particle system.
  var particleSystemDef = new box2d.b2ParticleSystemDef();
  particleSystemDef.radius = this.m_particleSystem.GetRadius();
  particleSystemDef.destroyByAge = true;
  this.m_particleSystem2 = this.m_world.CreateParticleSystem(particleSystemDef);
  this.m_particleSystem2.SetMaxParticleCount(box2d.Testbed.MultipleParticleSystems.k_maxParticleCount);

  // Don't restart the test when changing particle types.
  box2d.Testbed.TestMain.SetRestartOnParticleParameterChange(false);

  // Create the ground.
  {
    var bd = new box2d.b2BodyDef();
    var ground = this.m_world.CreateBody(bd);
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(5.0, 0.1);
    ground.CreateFixture(shape, 0.0);
  }

  // Create a dynamic body to push around.
  {
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    var body = this.m_world.CreateBody(bd);
    var shape = new box2d.b2PolygonShape();
    var center = new box2d.b2Vec2(0.0, 1.2);
    shape.SetAsBox(box2d.Testbed.MultipleParticleSystems.k_dynamicBoxSize.x, box2d.Testbed.MultipleParticleSystems.k_dynamicBoxSize.y, center, 0.0);
    body.CreateFixture(shape, 0.0);
    ///	b2MassData massData = { box2d.Testbed.MultipleParticleSystems.k_boxMass, center, 0.0 };
    var massData = new box2d.b2MassData();
    massData.mass = box2d.Testbed.MultipleParticleSystems.k_boxMass;
    massData.center.Copy(center);
    massData.I = 0.0;
    body.SetMassData(massData);
  }

  // Initialize the emitters.
  for (var i = 0; i < this.m_emitters.length; ++i) {
    var mirrorAlongY = i & 1 ? -1.0 : 1.0;
    var emitter = this.m_emitters[i];
    emitter.SetPosition(
      new box2d.b2Vec2(box2d.Testbed.MultipleParticleSystems.k_emitterPosition.x * mirrorAlongY,
        box2d.Testbed.MultipleParticleSystems.k_emitterPosition.y));
    emitter.SetSize(box2d.Testbed.MultipleParticleSystems.k_emitterSize);
    emitter.SetVelocity(
      new box2d.b2Vec2(box2d.Testbed.MultipleParticleSystems.k_emitterVelocity.x * mirrorAlongY,
        box2d.Testbed.MultipleParticleSystems.k_emitterVelocity.y));
    emitter.SetEmitRate(box2d.Testbed.MultipleParticleSystems.k_emitRate);
    emitter.SetColor(i & 1 ? box2d.Testbed.MultipleParticleSystems.k_rightEmitterColor : box2d.Testbed.MultipleParticleSystems.k_leftEmitterColor);
    emitter.SetParticleSystem(i & 1 ? this.m_particleSystem2 : this.m_particleSystem);
  }
}

goog.inherits(box2d.Testbed.MultipleParticleSystems, box2d.Testbed.Test);

/**
 * @type {box2d.b2ParticleSystem}
 */
box2d.Testbed.MultipleParticleSystems.prototype.m_particleSystem2 = null;
/**
 * @type {Array.<box2d.Testbed.RadialEmitter>}
 */
box2d.Testbed.MultipleParticleSystems.prototype.m_emitters = null;

/**
 * Maximum number of particles per system.
 * @const
 * @type {number}
 */
box2d.Testbed.MultipleParticleSystems.k_maxParticleCount = 500;
/**
 * Size of the box which is pushed around by particles.
 * @const
 * @type {box2d.b2Vec2}
 */
box2d.Testbed.MultipleParticleSystems.k_dynamicBoxSize = new box2d.b2Vec2(0.5, 0.5);
/**
 * Mass of the box.
 * @const
 * @type {number}
 */
box2d.Testbed.MultipleParticleSystems.k_boxMass = 1.0;
/**
 * Emit rate of the emitters in particles per second.
 * @const
 * @type {number}
 */
box2d.Testbed.MultipleParticleSystems.k_emitRate = 100.0;
/**
 * Location of the left emitter (the position of the right one
 * is mirrored along the y-axis).
 * @const
 * @type {box2d.b2Vec2}
 */
box2d.Testbed.MultipleParticleSystems.k_emitterPosition = new box2d.b2Vec2(-5.0, 4.0);
/**
 * Starting velocity of particles from the left emitter (the
 * velocity of particles from the right emitter are mirrored
 * along the y-axis).
 * @const
 * @type {box2d.b2Vec2}
 */
box2d.Testbed.MultipleParticleSystems.k_emitterVelocity = new box2d.b2Vec2(7.0, -4.0);
/**
 * Size of particle emitters.
 * @const
 * @type {box2d.b2Vec2}
 */
box2d.Testbed.MultipleParticleSystems.k_emitterSize = new box2d.b2Vec2(1.0, 1.0);
/**
 * Color of the left emitter's particles.
 * @const
 * @type {box2d.b2ParticleColor}
 */
box2d.Testbed.MultipleParticleSystems.k_leftEmitterColor = new box2d.b2ParticleColor(0x22, 0x33, 0xff, 0xff);
/**
 * Color of the right emitter's particles.
 * @const
 * @type {box2d.b2ParticleColor}
 */
box2d.Testbed.MultipleParticleSystems.k_rightEmitterColor = new box2d.b2ParticleColor(0xff, 0x22, 0x11, 0xff);

/**
 * Run a simulation step.
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.MultipleParticleSystems.prototype.Step = function(settings) {
  var dt = 1.0 / settings.hz;
  box2d.Testbed.Test.prototype.Step.call(this, settings);
  for (var i = 0; i < this.m_emitters.length; ++i) {
    this.m_emitters[i].Step(dt);
  }
}

/**
 * @export
 * @return {number}
 */
box2d.Testbed.MultipleParticleSystems.prototype.GetDefaultViewZoom = function() {
  return 0.2;
}

/**
 * Create the multiple particle systems test.
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.MultipleParticleSystems.Create = function(canvas, settings) {
  return new box2d.Testbed.MultipleParticleSystems(canvas, settings);
}

//#endif
