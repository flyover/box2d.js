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

//#if B2_ENABLE_PARTICLE

goog.provide('box2d.Testbed.ParticlesSurfaceTension');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.ParticlesSurfaceTension = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  {
    var bd = new box2d.b2BodyDef();
    var ground = this.m_world.CreateBody(bd);

    {
      var shape = new box2d.b2PolygonShape();
      var vertices = [
        new box2d.b2Vec2(-4, -1),
        new box2d.b2Vec2(4, -1),
        new box2d.b2Vec2(4, 0),
        new box2d.b2Vec2(-4, 0)
      ];
      shape.Set(vertices, 4);
      ground.CreateFixture(shape, 0.0);
    }

    {
      var shape = new box2d.b2PolygonShape();
      var vertices = [
        new box2d.b2Vec2(-4, -0.1),
        new box2d.b2Vec2(-2, -0.1),
        new box2d.b2Vec2(-2, 2),
        new box2d.b2Vec2(-4, 2)
      ];
      shape.Set(vertices, 4);
      ground.CreateFixture(shape, 0.0);
    }

    {
      var shape = new box2d.b2PolygonShape();
      var vertices = [
        new box2d.b2Vec2(2, -0.1),
        new box2d.b2Vec2(4, -0.1),
        new box2d.b2Vec2(4, 2),
        new box2d.b2Vec2(2, 2)
      ];
      shape.Set(vertices, 4);
      ground.CreateFixture(shape, 0.0);
    }
  }

  this.m_particleSystem.SetRadius(0.035 * 3); // HACK: increase particle radius

  {
    var shape = new box2d.b2CircleShape();
    shape.m_p.Set(0, 2);
    shape.m_radius = 0.5;
    var pd = new box2d.b2ParticleGroupDef();
    pd.flags = box2d.b2ParticleFlag.b2_tensileParticle | box2d.b2ParticleFlag.b2_colorMixingParticle;
    pd.shape = shape;
    pd.color.Set(255, 0, 0, 255);
    this.m_particleSystem.CreateParticleGroup(pd);
  }

  {
    var shape = new box2d.b2CircleShape();
    shape.m_p.Set(-1, 2);
    shape.m_radius = 0.5;
    var pd = new box2d.b2ParticleGroupDef();
    pd.flags = box2d.b2ParticleFlag.b2_tensileParticle | box2d.b2ParticleFlag.b2_colorMixingParticle;
    pd.shape = shape;
    pd.color.Set(0, 255, 0, 255);
    this.m_particleSystem.CreateParticleGroup(pd);
  }

  {
    var shape = new box2d.b2PolygonShape();
    var vertices = [
      new box2d.b2Vec2(0, 3),
      new box2d.b2Vec2(2, 3),
      new box2d.b2Vec2(2, 3.5),
      new box2d.b2Vec2(0, 3.5)
    ];
    shape.Set(vertices, 4);
    var pd = new box2d.b2ParticleGroupDef();
    pd.flags = box2d.b2ParticleFlag.b2_tensileParticle | box2d.b2ParticleFlag.b2_colorMixingParticle;
    pd.shape = shape;
    pd.color.Set(0, 0, 255, 255);
    this.m_particleSystem.CreateParticleGroup(pd);
  }

  {
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    var body = this.m_world.CreateBody(bd);
    var shape = new box2d.b2CircleShape();
    shape.m_p.Set(0, 8);
    shape.m_radius = 0.5;
    body.CreateFixture(shape, 0.5);
  }
}

goog.inherits(box2d.Testbed.ParticlesSurfaceTension, box2d.Testbed.Test);

/**
 * @export 
 * @return {number} 
 */
box2d.Testbed.ParticlesSurfaceTension.prototype.GetDefaultViewZoom = function() {
  return 0.1;
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.ParticlesSurfaceTension.Create = function(canvas, settings) {
  return new box2d.Testbed.ParticlesSurfaceTension(canvas, settings);
}

//#endif
