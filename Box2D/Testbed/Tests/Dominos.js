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

goog.provide('box2d.Testbed.Dominos');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Dominos = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  var b1 = null; {
    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));

    var bd = new box2d.b2BodyDef();
    b1 = this.m_world.CreateBody(bd);
    b1.CreateFixture(shape, 0.0);
  }

  {
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(6.0, 0.25);

    var bd = new box2d.b2BodyDef();
    bd.position.Set(-1.5, 10.0);
    var ground = this.m_world.CreateBody(bd);
    ground.CreateFixture(shape, 0.0);
  }

  {
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.1, 1.0);

    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 20.0;
    fd.friction = 0.1;

    for (var i = 0; i < 10; ++i) {
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(-6.0 + 1.0 * i, 11.25);
      var body = this.m_world.CreateBody(bd);
      body.CreateFixture(fd);
    }
  }

  {
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(7.0, 0.25, box2d.b2Vec2_zero, 0.3);

    var bd = new box2d.b2BodyDef();
    bd.position.Set(1.0, 6.0);
    var ground = this.m_world.CreateBody(bd);
    ground.CreateFixture(shape, 0.0);
  }

  var b2 = null; {
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.25, 1.5);

    var bd = new box2d.b2BodyDef();
    bd.position.Set(-7.0, 4.0);
    b2 = this.m_world.CreateBody(bd);
    b2.CreateFixture(shape, 0.0);
  }

  var b3 = null; {
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(6.0, 0.125);

    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(-0.9, 1.0);
    bd.angle = -0.15;

    b3 = this.m_world.CreateBody(bd);
    b3.CreateFixture(shape, 10.0);
  }

  var jd = new box2d.b2RevoluteJointDef();
  var anchor = new box2d.b2Vec2();

  anchor.Set(-2.0, 1.0);
  jd.Initialize(b1, b3, anchor);
  jd.collideConnected = true;
  this.m_world.CreateJoint(jd);

  var b4 = null; {
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.25, 0.25);

    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(-10.0, 15.0);
    b4 = this.m_world.CreateBody(bd);
    b4.CreateFixture(shape, 10.0);
  }

  anchor.Set(-7.0, 15.0);
  jd.Initialize(b2, b4, anchor);
  this.m_world.CreateJoint(jd);

  var b5 = null; {
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(6.5, 3.0);
    b5 = this.m_world.CreateBody(bd);

    var shape = new box2d.b2PolygonShape();
    var fd = new box2d.b2FixtureDef();

    fd.shape = shape;
    fd.density = 10.0;
    fd.friction = 0.1;

    shape.SetAsBox(1.0, 0.1, new box2d.b2Vec2(0.0, -0.9), 0.0);
    b5.CreateFixture(fd);

    shape.SetAsBox(0.1, 1.0, new box2d.b2Vec2(-0.9, 0.0), 0.0);
    b5.CreateFixture(fd);

    shape.SetAsBox(0.1, 1.0, new box2d.b2Vec2(0.9, 0.0), 0.0);
    b5.CreateFixture(fd);
  }

  anchor.Set(6.0, 2.0);
  jd.Initialize(b1, b5, anchor);
  this.m_world.CreateJoint(jd);

  var b6 = null; {
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(1.0, 0.1);

    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(6.5, 4.1);
    b6 = this.m_world.CreateBody(bd);
    b6.CreateFixture(shape, 30.0);
  }

  anchor.Set(7.5, 4.0);
  jd.Initialize(b5, b6, anchor);
  this.m_world.CreateJoint(jd);

  var b7 = null; {
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.1, 1.0);

    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(7.4, 1.0);

    b7 = this.m_world.CreateBody(bd);
    b7.CreateFixture(shape, 10.0);
  }

  var djd = new box2d.b2DistanceJointDef();
  djd.bodyA = b3;
  djd.bodyB = b7;
  djd.localAnchorA.Set(6.0, 0.0);
  djd.localAnchorB.Set(0.0, -1.0);
  var d = box2d.b2Sub_V2_V2(djd.bodyB.GetWorldPoint(djd.localAnchorB, new box2d.b2Vec2()), djd.bodyA.GetWorldPoint(djd.localAnchorA, new box2d.b2Vec2()), new box2d.b2Vec2());
  djd.length = d.Length();
  this.m_world.CreateJoint(djd);

  {
    var radius = 0.2;

    var shape = new box2d.b2CircleShape();
    shape.m_radius = radius;

    for (var i = 0; i < 4; ++i) {
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(5.9 + 2.0 * radius * i, 2.4);
      var body = this.m_world.CreateBody(bd);
      body.CreateFixture(shape, 10.0);
    }
  }
}

goog.inherits(box2d.Testbed.Dominos, box2d.Testbed.Test);

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Dominos.Create = function(canvas, settings) {
  return new box2d.Testbed.Dominos(canvas, settings);
}
