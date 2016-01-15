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

goog.provide('box2d.Testbed.CompoundShapes');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.CompoundShapes = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  {
    var bd = new box2d.b2BodyDef();
    var body = this.m_world.CreateBody(bd);

    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(50.0, 0.0), new box2d.b2Vec2(-50.0, 0.0));

    body.CreateFixture(shape, 0.0);
  }

  {
    var circle1 = new box2d.b2CircleShape();
    circle1.m_radius = 0.5;
    circle1.m_p.Set(-0.5, 0.5);

    var circle2 = new box2d.b2CircleShape();
    circle2.m_radius = 0.5;
    circle2.m_p.Set(0.5, 0.5);

    for (var i = 0; i < 10; ++i) {
      var x = box2d.b2RandomRange(-0.1, 0.1);
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(x + 5.0, 1.05 + 2.5 * i);
      bd.angle = box2d.b2RandomRange(-box2d.b2_pi, box2d.b2_pi);
      var body = this.m_world.CreateBody(bd);
      body.CreateFixture(circle1, 2.0);
      body.CreateFixture(circle2, 0.0);
    }
  }

  {
    var polygon1 = new box2d.b2PolygonShape();
    polygon1.SetAsBox(0.25, 0.5);

    var polygon2 = new box2d.b2PolygonShape();
    polygon2.SetAsBox(0.25, 0.5, new box2d.b2Vec2(0.0, -0.5), 0.5 * box2d.b2_pi);

    for (var i = 0; i < 10; ++i) {
      var x = box2d.b2RandomRange(-0.1, 0.1);
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(x - 5.0, 1.05 + 2.5 * i);
      bd.angle = box2d.b2RandomRange(-box2d.b2_pi, box2d.b2_pi);
      var body = this.m_world.CreateBody(bd);
      body.CreateFixture(polygon1, 2.0);
      body.CreateFixture(polygon2, 2.0);
    }
  }

  {
    var xf1 = new box2d.b2Transform();
    xf1.q.SetAngle(0.3524 * box2d.b2_pi);
    xf1.p.Copy(box2d.b2Mul_R_V2(xf1.q, new box2d.b2Vec2(1.0, 0.0), new box2d.b2Vec2()));

    var vertices = new Array();

    var triangle1 = new box2d.b2PolygonShape();
    vertices[0] = box2d.b2Mul_X_V2(xf1, new box2d.b2Vec2(-1.0, 0.0), new box2d.b2Vec2());
    vertices[1] = box2d.b2Mul_X_V2(xf1, new box2d.b2Vec2(1.0, 0.0), new box2d.b2Vec2());
    vertices[2] = box2d.b2Mul_X_V2(xf1, new box2d.b2Vec2(0.0, 0.5), new box2d.b2Vec2());
    triangle1.Set(vertices, 3);

    var xf2 = new box2d.b2Transform();
    xf2.q.SetAngle(-0.3524 * box2d.b2_pi);
    xf2.p.Copy(box2d.b2Mul_R_V2(xf2.q, new box2d.b2Vec2(-1.0, 0.0), new box2d.b2Vec2()));

    var triangle2 = new box2d.b2PolygonShape();
    vertices[0] = box2d.b2Mul_X_V2(xf2, new box2d.b2Vec2(-1.0, 0.0), new box2d.b2Vec2());
    vertices[1] = box2d.b2Mul_X_V2(xf2, new box2d.b2Vec2(1.0, 0.0), new box2d.b2Vec2());
    vertices[2] = box2d.b2Mul_X_V2(xf2, new box2d.b2Vec2(0.0, 0.5), new box2d.b2Vec2());
    triangle2.Set(vertices, 3);

    for (var i = 0; i < 10; ++i) {
      var x = box2d.b2RandomRange(-0.1, 0.1);
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(x, 2.05 + 2.5 * i);
      bd.angle = 0;
      var body = this.m_world.CreateBody(bd);
      body.CreateFixture(triangle1, 2.0);
      body.CreateFixture(triangle2, 2.0);
    }
  }

  {
    var bottom = new box2d.b2PolygonShape();
    bottom.SetAsBox(1.5, 0.15);

    var left = new box2d.b2PolygonShape();
    left.SetAsBox(0.15, 2.7, new box2d.b2Vec2(-1.45, 2.35), 0.2);

    var right = new box2d.b2PolygonShape();
    right.SetAsBox(0.15, 2.7, new box2d.b2Vec2(1.45, 2.35), -0.2);

    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(0.0, 2.0);
    var body = this.m_world.CreateBody(bd);
    body.CreateFixture(bottom, 4.0);
    body.CreateFixture(left, 4.0);
    body.CreateFixture(right, 4.0);
  }
}

goog.inherits(box2d.Testbed.CompoundShapes, box2d.Testbed.Test);

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.CompoundShapes.Create = function(canvas, settings) {
  return new box2d.Testbed.CompoundShapes(canvas, settings);
}
