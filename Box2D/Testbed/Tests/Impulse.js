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

goog.provide('box2d.Testbed.Impulse');

goog.require('box2d.Testbed.Test');

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Impulse = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  this.m_useLinearImpulse = false;

  // Create the containing box.
  {
    var bd = new box2d.b2BodyDef();
    var ground = this.m_world.CreateBody(bd);

    var box = [
      new box2d.b2Vec2(box2d.Testbed.Impulse.kBoxLeft, box2d.Testbed.Impulse.kBoxBottom),
      new box2d.b2Vec2(box2d.Testbed.Impulse.kBoxRight, box2d.Testbed.Impulse.kBoxBottom),
      new box2d.b2Vec2(box2d.Testbed.Impulse.kBoxRight, box2d.Testbed.Impulse.kBoxTop),
      new box2d.b2Vec2(box2d.Testbed.Impulse.kBoxLeft, box2d.Testbed.Impulse.kBoxTop)
    ];
    var shape = new box2d.b2ChainShape();
    shape.CreateLoop(box, box.length);
    ground.CreateFixture(shape, 0.0);
  }

  this.m_particleSystem.SetRadius(0.025 * 3); // HACK: increase particle radius
  this.m_particleSystem.SetDamping(0.2);

  // Create the particles.
  {
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.8, 1.0, new box2d.b2Vec2(0.0, 1.01), 0);
    var pd = new box2d.b2ParticleGroupDef();
    pd.flags = box2d.Testbed.TestMain.GetParticleParameterValue();
    pd.shape = shape;
    var group = this.m_particleSystem.CreateParticleGroup(pd);
    if (pd.flags & box2d.b2ParticleFlag.b2_colorMixingParticle) {
      this.ColorParticleGroup(group, 0);
    }
  }
}

goog.inherits(box2d.Testbed.Impulse, box2d.Testbed.Test);

box2d.Testbed.Impulse.kBoxLeft = -2;
box2d.Testbed.Impulse.kBoxRight = 2;
box2d.Testbed.Impulse.kBoxBottom = 0;
box2d.Testbed.Impulse.kBoxTop = 4;

/**
 * @export
 * @return {void}
 * @param {box2d.b2Vec2} p
 */
box2d.Testbed.Impulse.prototype.MouseUp = function(p) {
  box2d.Testbed.Test.prototype.MouseUp.call(this, p);

  // Apply an impulse to the particles.
  var isInsideBox = box2d.Testbed.Impulse.kBoxLeft <= p.x && p.x <= box2d.Testbed.Impulse.kBoxRight &&
    box2d.Testbed.Impulse.kBoxBottom <= p.y && p.y <= box2d.Testbed.Impulse.kBoxTop;
  if (isInsideBox) {
    var kBoxCenter = new box2d.b2Vec2(0.5 * (box2d.Testbed.Impulse.kBoxLeft + box2d.Testbed.Impulse.kBoxRight),
      0.5 * (box2d.Testbed.Impulse.kBoxBottom + box2d.Testbed.Impulse.kBoxTop));
    var direction = box2d.b2Sub_V2_V2(p, kBoxCenter, new box2d.b2Vec2());
    direction.Normalize();
    this.ApplyImpulseOrForce(direction);
  }
}

/**
 * @export
 * @return {void}
 * @param {number} key
 */
box2d.Testbed.Impulse.prototype.Keyboard = function(key) {
  box2d.Testbed.Test.prototype.Keyboard.call(this, key);

  switch (key) {
    case goog.events.KeyCodes.L:
      this.m_useLinearImpulse = true;
      break;
    case goog.events.KeyCodes.F:
      this.m_useLinearImpulse = false;
      break;
  }
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2Vec2} direction
 */
box2d.Testbed.Impulse.prototype.ApplyImpulseOrForce = function(direction) {
  var particleSystem = this.m_world.GetParticleSystemList();
  var particleGroup = particleSystem.GetParticleGroupList();
  var numParticles = particleGroup.GetParticleCount();

  if (this.m_useLinearImpulse) {
    var kImpulseMagnitude = 0.005;
    ///	const b2Vec2 impulse = kImpulseMagnitude * direction * (float32)numParticles;
    var impulse = box2d.b2Mul_S_V2(kImpulseMagnitude * numParticles, direction, new box2d.b2Vec2());
    particleGroup.ApplyLinearImpulse(impulse);
  } else {
    var kForceMagnitude = 1.0;
    ///	const b2Vec2 force = kForceMagnitude * direction * (float32)numParticles;
    var force = box2d.b2Mul_S_V2(kForceMagnitude * numParticles, direction, new box2d.b2Vec2());
    particleGroup.ApplyForce(force);
  }
}

/**
 * @export
 * @return {number}
 */
box2d.Testbed.Impulse.prototype.GetDefaultViewZoom = function() {
  return 0.1;
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Impulse.Create = function(canvas, settings) {
  return new box2d.Testbed.Impulse(canvas, settings);
}

//#endif
