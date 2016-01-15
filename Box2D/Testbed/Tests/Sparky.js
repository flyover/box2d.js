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

goog.provide('box2d.Testbed.Sparky');

goog.require('box2d.Testbed.Test');

/**
 * @constructor 
 * @param {box2d.b2ParticleSystem} particleSystem 
 * @param {box2d.b2Vec2} origin 
 * @param {number} size 
 * @param {number} speed 
 * @param {number} lifetime 
 * @param {number} particleFlags 
 */
box2d.Testbed.ParticleVFX = function(particleSystem, origin, size, speed, lifetime, particleFlags) {
  this.m_origColor = new box2d.b2ParticleColor();

  // Create a circle to house the particles of size size
  var shape = new box2d.b2CircleShape();
  shape.m_p.Copy(origin);
  shape.m_radius = size;

  // Create particle def of random color.
  var pd = new box2d.b2ParticleGroupDef();
  pd.flags = particleFlags;
  pd.shape = shape;
  this.m_origColor.Set(
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    255);
  pd.color.Copy(this.m_origColor);
  this.m_particleSystem = particleSystem;

  // Create a circle full of particles
  this.m_pg = this.m_particleSystem.CreateParticleGroup(pd);

  this.m_initialLifetime = this.m_remainingLifetime = lifetime;
  this.m_halfLifetime = this.m_initialLifetime * 0.5;

  // Set particle initial velocity based on how far away it is from
  // origin, exploding outwards.
  var bufferIndex = this.m_pg.GetBufferIndex();
  var pos = this.m_particleSystem.GetPositionBuffer();
  var vel = this.m_particleSystem.GetVelocityBuffer();
  for (var i = bufferIndex; i < bufferIndex + this.m_pg.GetParticleCount(); i++) {
    ///	vel[i] = pos[i] - origin;
    box2d.b2Sub_V2_V2(pos[i], origin, vel[i]);
    ///	vel[i] *= speed;
    box2d.b2Mul_V2_S(vel[i], speed, vel[i]);
  }
}

/**
 * @type {number}
 */
box2d.Testbed.ParticleVFX.prototype.m_initialLifetime = 0.0;

/**
 * @type {number}
 */
box2d.Testbed.ParticleVFX.prototype.m_remainingLifetime = 0.0;

/**
 * @type {number}
 */
box2d.Testbed.ParticleVFX.prototype.m_halfLifetime = 0.0;

/**
 * @type {box2d.b2ParticleGroup}
 */
box2d.Testbed.ParticleVFX.prototype.m_pg = null;

/**
 * @type {box2d.b2ParticleSystem}
 */
box2d.Testbed.ParticleVFX.prototype.m_particleSystem = null;

/**
 * @type {box2d.b2ParticleColor}
 */
box2d.Testbed.ParticleVFX.prototype.m_origColor = null;

/**
 * @return {void}
 */
box2d.Testbed.ParticleVFX.prototype.Drop = function() {
  this.m_pg.DestroyParticles(false);
  this.m_pg = null;
}

/** 
 * Calculates the brightness of the particles. 
 * Piecewise linear function where particle is at 1.0 brightness 
 * until t = lifetime/2, then linear falloff until t = 0, scaled 
 * by m_halfLifetime. 
 *  
 * @return {number}
 */
box2d.Testbed.ParticleVFX.prototype.ColorCoeff = function() {
  if (this.m_remainingLifetime >= this.m_halfLifetime) {
    return 1.0;
  }
  return 1.0 - ((this.m_halfLifetime - this.m_remainingLifetime) / this.m_halfLifetime);
}

/**
 * @return {void} 
 * @param {number} dt 
 */
box2d.Testbed.ParticleVFX.prototype.Step = function(dt) {
  if (this.m_remainingLifetime > 0.0) {
    this.m_remainingLifetime = Math.max(this.m_remainingLifetime - dt, 0.0);
    var coeff = this.ColorCoeff();

    var colors = this.m_particleSystem.GetColorBuffer();
    var bufferIndex = this.m_pg.GetBufferIndex();

    // Set particle colors all at once.
    for (var i = bufferIndex; i < bufferIndex + this.m_pg.GetParticleCount(); i++) {
      var c = colors[i];
      ///	c *= coeff;
      c.SelfMul_0_1(coeff);
      c.a = this.m_origColor.a;
    }
  }
}

/** 
 * Are the particles entirely black? 
 *  
 * @return {boolean}
 */
box2d.Testbed.ParticleVFX.prototype.IsDone = function() {
  return this.m_remainingLifetime <= 0.0;
}

/**
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Sparky = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  this.m_contactPoint = new box2d.b2Vec2();
  this.m_VFX = [];

  // Set up array of sparks trackers.
  this.m_VFXIndex = 0;

  for (var i = 0; i < box2d.Testbed.Sparky.c_maxVFX; i++) {
    this.m_VFX[i] = null;
  }

  this.CreateWalls();
  this.m_particleSystem.SetRadius(0.25 * 2); // HACK: increase particle radius

  // Create a list of circles that will spark.
  for (var i = 0; i < box2d.Testbed.Sparky.c_maxCircles; i++) {
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    var body = this.m_world.CreateBody(bd);
    var shape = new box2d.b2CircleShape();
    shape.m_p.Set(3.0 * box2d.Testbed.RandomFloat(),
      box2d.Testbed.Sparky.SHAPE_HEIGHT_OFFSET + box2d.Testbed.Sparky.SHAPE_OFFSET * i);
    shape.m_radius = 2;
    var f = body.CreateFixture(shape, 0.5);
    // Tag this as a sparkable body.
    f.SetUserData({
      spark: true
    });
  }

  box2d.Testbed.TestMain.SetRestartOnParticleParameterChange(false);
  box2d.Testbed.TestMain.SetParticleParameterValue(box2d.b2ParticleFlag.b2_powderParticle);
}

goog.inherits(box2d.Testbed.Sparky, box2d.Testbed.Test);

/**
 * @type {number}
 */
box2d.Testbed.Sparky.prototype.m_VFXIndex = 0;

/** 
 * Total number of bodies in the world. 
 *  
 * @const 
 * @type {number}
 */
box2d.Testbed.Sparky.c_maxCircles = 3; //6;

/** 
 * You will need to raise this if you add more bodies. 
 *  
 * @const 
 * @type {number}
 */
box2d.Testbed.Sparky.c_maxVFX = 20; //50;

/** 
 * How high to start the stack of sparky shapes. 
 *  
 * @const 
 * @type {number}
 */
box2d.Testbed.Sparky.SHAPE_HEIGHT_OFFSET = 7;

/** 
 * Starting offset between sparky shapes. 
 *  
 * @const 
 * @type {number}
 */
box2d.Testbed.Sparky.SHAPE_OFFSET = 4.5;

/**
 * @type {Array.<box2d.Testbed.ParticleVFX>}
 */
box2d.Testbed.Sparky.prototype.m_VFX = null;

/** 
 * Was there a contact this frame? 
 *  
 * @type {boolean}
 */
box2d.Testbed.Sparky.prototype.m_contact = false;

/** 
 * Where was the contact? 
 *  
 * @type {box2d.b2Vec2}
 */
box2d.Testbed.Sparky.prototype.m_contactPoint = null;

/** 
 * Handles bodies colliding. 
 *  
 * @return {void}
 * @param {box2d.b2Contact} contact 
 */
box2d.Testbed.Sparky.prototype.BeginContact = function(contact) {
  box2d.Testbed.Test.prototype.BeginContact.call(this, contact);
  // Check to see if these are two circles hitting one another.
  var userA = contact.GetFixtureA().GetUserData();
  var userB = contact.GetFixtureB().GetUserData();
  if ((userA && userA.spark) ||
    (userB && userB.spark)) {
    var worldManifold = new box2d.b2WorldManifold();
    contact.GetWorldManifold(worldManifold);

    // Note that we overwrite any contact; if there are two collisions
    // on the same frame, only the last one showers sparks.
    // Two collisions are rare, and this also guarantees we will not
    // run out of places to store ParticleVFX explosions.
    this.m_contactPoint.Copy(worldManifold.points[0]);
    this.m_contact = true;
  }
}

/**
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Sparky.prototype.Step = function(settings) {
  var particleFlags = box2d.Testbed.TestMain.GetParticleParameterValue();
  box2d.Testbed.Test.prototype.Step.call(this, settings);

  // If there was a contacts...
  if (this.m_contact) {
    // ...explode!
    this.AddVFX(this.m_contactPoint, particleFlags);
    this.m_contact = false;
  }

  // Step particle explosions.
  for (var i = 0; i < box2d.Testbed.Sparky.c_maxVFX; i++) {
    var vfx = this.m_VFX[i];
    if (vfx === null)
      continue;
    vfx.Step(1.0 / settings.hz);
    if (vfx.IsDone()) {
      /// delete vfx;
      vfx.Drop();
      this.m_VFX[i] = null;
    }
  }
}

/** 
 * Create an explosion of particles at origin=p 
 *  
 * @return {void} 
 * @param {box2d.b2Vec2} p 
 * @param {number} particleFlags 
 */
box2d.Testbed.Sparky.prototype.AddVFX = function(p, particleFlags) {
  var vfx = this.m_VFX[this.m_VFXIndex];
  if (vfx !== null) {
    /// delete vfx;
    vfx.Drop();
    this.m_VFX[this.m_VFXIndex] = null;
  }
  this.m_VFX[this.m_VFXIndex] = new box2d.Testbed.ParticleVFX(
    this.m_particleSystem, p, box2d.Testbed.RandomFloat(1.0, 2.0), box2d.Testbed.RandomFloat(10.0, 20.0),
    box2d.Testbed.RandomFloat(0.5, 1.0), particleFlags);
  if (++this.m_VFXIndex >= box2d.Testbed.Sparky.c_maxVFX) {
    this.m_VFXIndex = 0;
  }
}

/**
 * @return {void}
 */
box2d.Testbed.Sparky.prototype.CreateWalls = function() {
  // Create the walls of the world.
  {
    var bd = new box2d.b2BodyDef();
    var ground = this.m_world.CreateBody(bd);

    {
      var shape = new box2d.b2PolygonShape();
      var vertices = [
        new box2d.b2Vec2(-40, -10),
        new box2d.b2Vec2(40, -10),
        new box2d.b2Vec2(40, 0),
        new box2d.b2Vec2(-40, 0)
      ];
      shape.Set(vertices, 4);
      ground.CreateFixture(shape, 0.0);
    }

    {
      var shape = new box2d.b2PolygonShape();
      var vertices = [
        new box2d.b2Vec2(-40, 40),
        new box2d.b2Vec2(40, 40),
        new box2d.b2Vec2(40, 50),
        new box2d.b2Vec2(-40, 50)
      ];
      shape.Set(vertices, 4);
      ground.CreateFixture(shape, 0.0);
    }

    {
      var shape = new box2d.b2PolygonShape();
      var vertices = [
        new box2d.b2Vec2(-40, -1),
        new box2d.b2Vec2(-20, -1),
        new box2d.b2Vec2(-20, 40),
        new box2d.b2Vec2(-40, 40)
      ];
      shape.Set(vertices, 4);
      ground.CreateFixture(shape, 0.0);
    }

    {
      var shape = new box2d.b2PolygonShape();
      var vertices = [
        new box2d.b2Vec2(20, -1),
        new box2d.b2Vec2(40, -1),
        new box2d.b2Vec2(40, 40),
        new box2d.b2Vec2(20, 40)
      ];
      shape.Set(vertices, 4);
      ground.CreateFixture(shape, 0.0);
    }
  }
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Sparky.Create = function(canvas, settings) {
  return new box2d.Testbed.Sparky(canvas, settings);
}

//#endif
