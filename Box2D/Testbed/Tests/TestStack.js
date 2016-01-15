/*
 * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
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

goog.provide('box2d.Testbed.TestStack');

goog.require('box2d.Testbed.Test');
goog.require('goog.events.KeyCodes');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.TestStack = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  {
    var bd = new box2d.b2BodyDef();
    var ground = this.m_world.CreateBody(bd);

    var vertices = [];
    vertices[0] = new box2d.b2Vec2(-30.0, 0.0);
    vertices[1] = new box2d.b2Vec2(30.0, 0.0);
    vertices[2] = new box2d.b2Vec2(30.0, 40.0);
    vertices[3] = new box2d.b2Vec2(-30.0, 40.0);
    var shape = new box2d.b2ChainShape();
    shape.CreateLoop(vertices);
    ground.CreateFixture(shape, 0.0);
  }

  // Add bodies
  var bd = new box2d.b2BodyDef();
  var fd = new box2d.b2FixtureDef();
  bd.type = box2d.b2BodyType.b2_dynamicBody;
  //bd.isBullet = true;
  fd.shape = new box2d.b2PolygonShape();
  fd.density = 1.0;
  fd.friction = 0.5;
  fd.restitution = 0.1;
  fd.shape.SetAsBox(1.0, 1.0);
  // Create 3 stacks
  for (var i = 0; i < 10; ++i) {
    bd.position.Set((0.0 + Math.random() * 0.2 - 0.1), (30.0 - i * 2.5));
    this.m_world.CreateBody(bd).CreateFixture(fd);
  }
  for (var i = 0; i < 10; ++i) {
    bd.position.Set((10.0 + Math.random() * 0.2 - 0.1), (30.0 - i * 2.5));
    this.m_world.CreateBody(bd).CreateFixture(fd);
  }
  for (var i = 0; i < 10; ++i) {
    bd.position.Set((20.0 + Math.random() * 0.2 - 0.1), (30.0 - i * 2.5));
    this.m_world.CreateBody(bd).CreateFixture(fd);
  }
  // Create ramp
  bd.type = box2d.b2BodyType.b2_staticBody;
  bd.position.Set(0.0, 0.0);
  var vxs = [
    new box2d.b2Vec2(-30.0, 0.0),
    new box2d.b2Vec2(-10.0, 0.0),
    new box2d.b2Vec2(-30.0, 10.0)
  ];
  fd.shape.Set(vxs, vxs.length);
  fd.density = 0;
  this.m_world.CreateBody(bd).CreateFixture(fd);

  // Create ball
  bd.type = box2d.b2BodyType.b2_dynamicBody;
  bd.position.Set(-25.0, 20.0);
  fd.shape = new box2d.b2CircleShape(4.0);
  fd.density = 2;
  fd.restitution = 0.2;
  fd.friction = 0.5;
  this.m_world.CreateBody(bd).CreateFixture(fd);
}

goog.inherits(box2d.Testbed.TestStack, box2d.Testbed.Test);

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.TestStack.Create = function(canvas, settings) {
  return new box2d.Testbed.TestStack(canvas, settings);
}
