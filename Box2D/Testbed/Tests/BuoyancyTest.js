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

//#if B2_ENABLE_CONTROLLER

goog.provide('box2d.Testbed.BuoyancyTest');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.BuoyancyTest = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  this.m_bodies = new Array();

  var bc = new box2d.b2BuoyancyController();
  this.m_controller = bc;

  bc.normal.Set(0.0, 1.0);
  bc.offset = 20.0;
  bc.density = 2.0;
  bc.linearDrag = 5.0;
  bc.angularDrag = 2.0;

  var ground = this.m_world.CreateBody(new box2d.b2BodyDef());

  {
    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
    ground.CreateFixture(shape, 0.0);
    shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(-40.0, 25.0));
    ground.CreateFixture(shape, 0.0);
    shape.SetAsEdge(new box2d.b2Vec2(40.0, 0.0), new box2d.b2Vec2(40.0, 25.0));
    ground.CreateFixture(shape, 0.0);
  }

  // Spawn in a bunch of crap
  {
    for (var i = 0; i < 5; i++) {
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      //bd.isBullet = true;
      bd.position.Set(Math.random() * 40.0 - 20.0, Math.random() * 15.0 + 5.0);
      bd.angle = Math.random() * Math.PI;
      var body = this.m_world.CreateBody(bd);

      var fd = new box2d.b2FixtureDef();
      fd.density = 1.0;
      // Override the default friction.
      fd.friction = 0.3;
      fd.restitution = 0.1;
      fd.shape = new box2d.b2PolygonShape();
      fd.shape.SetAsBox(Math.random() * 0.5 + 1.0, Math.random() * 0.5 + 1.0);
      body.CreateFixture(fd);

      this.m_bodies.push(body);
    }
  }

  {
    for (var i = 0; i < 5; i++) {
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      //bd.isBullet = true;
      bd.position.Set(Math.random() * 40.0 - 20.0, Math.random() * 15.0 + 5.0);
      bd.angle = Math.random() * Math.PI;
      var body = this.m_world.CreateBody(bd);

      var fd = new box2d.b2FixtureDef();
      fd.density = 1.0;
      // Override the default friction.
      fd.friction = 0.3;
      fd.restitution = 0.1;
      fd.shape = new box2d.b2CircleShape(Math.random() * 0.5 + 1.0);
      body.CreateFixture(fd);

      this.m_bodies.push(body);
    }
  }

  {
    for (var i = 0; i < 15; i++) {
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      //bd.isBullet = true;
      bd.position.Set(Math.random() * 40.0 - 20.0, Math.random() * 15.0 + 5.0);
      bd.angle = Math.random() * Math.PI;
      var body = this.m_world.CreateBody(bd);

      var fd = new box2d.b2FixtureDef();
      fd.density = 1.0;
      fd.friction = 0.3;
      fd.restitution = 0.1;
      fd.shape = new box2d.b2PolygonShape();
      if (Math.random() > 0.66) {
        fd.shape.Set([
          new box2d.b2Vec2(-1.0 - Math.random() * 1.0, 1.0 + Math.random() * 1.0),
          new box2d.b2Vec2(-0.5 - Math.random() * 1.0, -1.0 - Math.random() * 1.0),
          new box2d.b2Vec2(0.5 + Math.random() * 1.0, -1.0 - Math.random() * 1.0),
          new box2d.b2Vec2(1.0 + Math.random() * 1.0, 1.0 + Math.random() * 1.0)
        ]);
      } else if (Math.random() > 0.5) {
        var array = [];
        array[0] = new box2d.b2Vec2(0.0, 1.0 + Math.random() * 1.0);
        array[2] = new box2d.b2Vec2(-0.5 - Math.random() * 1.0, -1.0 - Math.random() * 1.0);
        array[3] = new box2d.b2Vec2(0.5 + Math.random() * 1.0, -1.0 - Math.random() * 1.0);
        array[1] = new box2d.b2Vec2((array[0].x + array[2].x), (array[0].y + array[2].y));
        array[1].SelfMul(Math.random() / 2 + 0.8);
        array[4] = new box2d.b2Vec2((array[3].x + array[0].x), (array[3].y + array[0].y));
        array[4].SelfMul(Math.random() / 2 + 0.8);
        fd.shape.Set(array);
      } else {
        fd.shape.Set([
          new box2d.b2Vec2(0.0, 1.0 + Math.random() * 1.0),
          new box2d.b2Vec2(-0.5 - Math.random() * 1.0, -1.0 - Math.random() * 1.0),
          new box2d.b2Vec2(0.5 + Math.random() * 1.0, -1.0 - Math.random() * 1.0)
        ]);
      }
      body.CreateFixture(fd);

      this.m_bodies.push(body);
    }
  }

  //Add some exciting bath toys
  {
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(0.0, 40.0);
    bd.angle = 0;
    var body = this.m_world.CreateBody(bd);

    var fd = new box2d.b2FixtureDef();
    fd.density = 3.0;
    fd.shape = new box2d.b2PolygonShape();
    fd.shape.SetAsBox(4.0, 1.0);
    body.CreateFixture(fd);

    this.m_bodies.push(body);
  }

  {
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(0.0, 30.0);
    var body = this.m_world.CreateBody(bd);

    var fd = new box2d.b2FixtureDef();
    fd.density = 2.0;
    fd.shape = new box2d.b2CircleShape(0.7);
    fd.shape.m_p.Set(3.0, 0.0);
    body.CreateFixture(fd);
    fd.shape.m_p.Set(-3.0, 0.0);
    body.CreateFixture(fd);
    fd.shape.m_p.Set(0.0, 3.0);
    body.CreateFixture(fd);
    fd.shape.m_p.Set(0.0, -3.0);
    body.CreateFixture(fd);

    fd.density = 2.0;
    fd.shape = new box2d.b2PolygonShape();
    fd.shape.SetAsBox(3.0, 0.2);
    body.CreateFixture(fd);
    fd.shape.SetAsBox(0.2, 3.0);
    body.CreateFixture(fd);

    this.m_bodies.push(body);
  }

  if (box2d.DEBUG) {
    for (var body_i = 0; i < this.m_bodies.length; ++i)
      this.m_controller.AddBody(this.m_bodies[body_i]);
    for (var body_i = 0; i < this.m_bodies.length; ++i)
      this.m_controller.RemoveBody(this.m_bodies[body_i]);
  }
  for (var body_i = 0; i < this.m_bodies.length; ++i)
    this.m_controller.AddBody(this.m_bodies[body_i]);
  if (box2d.DEBUG) {
    this.m_world.AddController(this.m_controller);
    this.m_world.RemoveController(this.m_controller);
  }
  this.m_world.AddController(this.m_controller);
}

goog.inherits(box2d.Testbed.BuoyancyTest, box2d.Testbed.Test);

/**
 * @export 
 * @type {Array.<box2d.b2Body>} 
 */
box2d.Testbed.BuoyancyTest.prototype.m_bodies = null;
/**
 * @export 
 * @type {box2d.b2BuoyancyController} 
 */
box2d.Testbed.BuoyancyTest.prototype.m_controller = null;

/**
 * @export 
 * @return {void} 
 * @param {number} key 
 */
box2d.Testbed.BuoyancyTest.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.A:
      break;
  }
}

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.BuoyancyTest.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.BuoyancyTest.Create = function(canvas, settings) {
  return new box2d.Testbed.BuoyancyTest(canvas, settings);
}

//#endif
