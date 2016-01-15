/*
 * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
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

goog.provide('box2d.Testbed.Cantilever');

goog.require('box2d.Testbed.Test');

// It is difficult to make a cantilever made of links completely rigid with weld joints.
// You will have to use a high number of iterations to make them stiff.
// So why not go ahead and use soft weld joints? They behave like a revolute
// joint with a rotational spring.
/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Cantilever = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  var ground = null; {
    var bd = new box2d.b2BodyDef();
    ground = this.m_world.CreateBody(bd);

    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
    ground.CreateFixture(shape, 0.0);
  }

  {
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.5, 0.125);

    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 20.0;

    var jd = new box2d.b2WeldJointDef();

    var prevBody = ground;
    for (var i = 0; i < box2d.Testbed.Cantilever.e_count; ++i) {
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(-14.5 + 1.0 * i, 5.0);
      var body = this.m_world.CreateBody(bd);
      body.CreateFixture(fd);

      var anchor = new box2d.b2Vec2(-15.0 + 1.0 * i, 5.0);
      jd.Initialize(prevBody, body, anchor);
      this.m_world.CreateJoint(jd);

      prevBody = body;
    }
  }

  {
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(1.0, 0.125);

    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 20.0;

    var jd = new box2d.b2WeldJointDef();
    jd.frequencyHz = 5.0;
    jd.dampingRatio = 0.7;

    var prevBody = ground;
    for (var i = 0; i < 3; ++i) {
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(-14.0 + 2.0 * i, 15.0);
      var body = this.m_world.CreateBody(bd);
      body.CreateFixture(fd);

      var anchor = new box2d.b2Vec2(-15.0 + 2.0 * i, 15.0);
      jd.Initialize(prevBody, body, anchor);
      this.m_world.CreateJoint(jd);

      prevBody = body;
    }
  }

  {
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.5, 0.125);

    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 20.0;

    var jd = new box2d.b2WeldJointDef();

    var prevBody = ground;
    for (var i = 0; i < box2d.Testbed.Cantilever.e_count; ++i) {
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(-4.5 + 1.0 * i, 15.0);
      var body = this.m_world.CreateBody(bd);
      body.CreateFixture(fd);

      if (i > 0) {
        var anchor = new box2d.b2Vec2(-5.0 + 1.0 * i, 15.0);
        jd.Initialize(prevBody, body, anchor);
        this.m_world.CreateJoint(jd);
      }

      prevBody = body;
    }
  }

  {
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.5, 0.125);

    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 20.0;

    var jd = new box2d.b2WeldJointDef();
    jd.frequencyHz = 8.0;
    jd.dampingRatio = 0.7;

    var prevBody = ground;
    for (var i = 0; i < box2d.Testbed.Cantilever.e_count; ++i) {
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(5.5 + 1.0 * i, 10.0);
      var body = this.m_world.CreateBody(bd);
      body.CreateFixture(fd);

      if (i > 0) {
        var anchor = new box2d.b2Vec2(5.0 + 1.0 * i, 10.0);
        jd.Initialize(prevBody, body, anchor);
        this.m_world.CreateJoint(jd);
      }

      prevBody = body;
    }
  }

  for (var i = 0; i < 2; ++i) {
    var vertices = new Array();
    vertices[0] = new box2d.b2Vec2(-0.5, 0.0);
    vertices[1] = new box2d.b2Vec2(0.5, 0.0);
    vertices[2] = new box2d.b2Vec2(0.0, 1.5);

    var shape = new box2d.b2PolygonShape();
    shape.Set(vertices);

    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 1.0;

    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(-8.0 + 8.0 * i, 12.0);
    var body = this.m_world.CreateBody(bd);
    body.CreateFixture(fd);
  }

  for (var i = 0; i < 2; ++i) {
    var shape = new box2d.b2CircleShape();
    shape.m_radius = 0.5;

    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 1.0;

    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(-6.0 + 6.0 * i, 10.0);
    var body = this.m_world.CreateBody(bd);
    body.CreateFixture(fd);
  }
}

goog.inherits(box2d.Testbed.Cantilever, box2d.Testbed.Test);

/**
 * @export 
 * @const 
 * @type {number} 
 */
box2d.Testbed.Cantilever.e_count = 8;

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Cantilever.Create = function(canvas, settings) {
  return new box2d.Testbed.Cantilever(canvas, settings);
}
