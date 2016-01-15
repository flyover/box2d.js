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

goog.provide('box2d.Testbed.CollisionFiltering');

goog.require('box2d.Testbed.Test');

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.CollisionFiltering = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  // Ground body
  {
    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));

    var sd = new box2d.b2FixtureDef();
    sd.shape = shape;
    sd.friction = 0.3;

    var bd = new box2d.b2BodyDef();
    var ground = this.m_world.CreateBody(bd);
    ground.CreateFixture(sd);
  }

  // Small triangle
  var vertices = new Array();
  vertices[0] = new box2d.b2Vec2(-1.0, 0.0);
  vertices[1] = new box2d.b2Vec2(1.0, 0.0);
  vertices[2] = new box2d.b2Vec2(0.0, 2.0);
  var polygon = new box2d.b2PolygonShape();
  polygon.Set(vertices, 3);

  var triangleShapeDef = new box2d.b2FixtureDef();
  triangleShapeDef.shape = polygon;
  triangleShapeDef.density = 1.0;

  triangleShapeDef.filter.groupIndex = box2d.Testbed.CollisionFiltering.k_smallGroup;
  triangleShapeDef.filter.categoryBits = box2d.Testbed.CollisionFiltering.k_triangleCategory;
  triangleShapeDef.filter.maskBits = box2d.Testbed.CollisionFiltering.k_triangleMask;

  var triangleBodyDef = new box2d.b2BodyDef();
  triangleBodyDef.type = box2d.b2BodyType.b2_dynamicBody;
  triangleBodyDef.position.Set(-5.0, 2.0);

  var body1 = this.m_world.CreateBody(triangleBodyDef);
  body1.CreateFixture(triangleShapeDef);

  // Large triangle (recycle definitions)
  vertices[0].SelfMul(2.0);
  vertices[1].SelfMul(2.0);
  vertices[2].SelfMul(2.0);
  polygon.Set(vertices, 3);
  triangleShapeDef.filter.groupIndex = box2d.Testbed.CollisionFiltering.k_largeGroup;
  triangleBodyDef.position.Set(-5.0, 6.0);
  triangleBodyDef.fixedRotation = true; // look at me!

  var body2 = this.m_world.CreateBody(triangleBodyDef);
  body2.CreateFixture(triangleShapeDef);

  {
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(-5.0, 10.0);
    var body = this.m_world.CreateBody(bd);

    var p = new box2d.b2PolygonShape();
    p.SetAsBox(0.5, 1.0);
    body.CreateFixture(p, 1.0);

    var jd = new box2d.b2PrismaticJointDef();
    jd.bodyA = body2;
    jd.bodyB = body;
    jd.enableLimit = true;
    jd.localAnchorA.Set(0.0, 4.0);
    jd.localAnchorB.SetZero();
    jd.localAxisA.Set(0.0, 1.0);
    jd.lowerTranslation = -1.0;
    jd.upperTranslation = 1.0;

    this.m_world.CreateJoint(jd);
  }

  // Small box
  polygon.SetAsBox(1.0, 0.5);
  var boxShapeDef = new box2d.b2FixtureDef();
  boxShapeDef.shape = polygon;
  boxShapeDef.density = 1.0;
  boxShapeDef.restitution = 0.1;

  boxShapeDef.filter.groupIndex = box2d.Testbed.CollisionFiltering.k_smallGroup;
  boxShapeDef.filter.categoryBits = box2d.Testbed.CollisionFiltering.k_boxCategory;
  boxShapeDef.filter.maskBits = box2d.Testbed.CollisionFiltering.k_boxMask;

  var boxBodyDef = new box2d.b2BodyDef();
  boxBodyDef.type = box2d.b2BodyType.b2_dynamicBody;
  boxBodyDef.position.Set(0.0, 2.0);

  var body3 = this.m_world.CreateBody(boxBodyDef);
  body3.CreateFixture(boxShapeDef);

  // Large box (recycle definitions)
  polygon.SetAsBox(2.0, 1.0);
  boxShapeDef.filter.groupIndex = box2d.Testbed.CollisionFiltering.k_largeGroup;
  boxBodyDef.position.Set(0.0, 6.0);

  var body4 = this.m_world.CreateBody(boxBodyDef);
  body4.CreateFixture(boxShapeDef);

  // Small circle
  var circle = new box2d.b2CircleShape();
  circle.m_radius = 1.0;

  var circleShapeDef = new box2d.b2FixtureDef();
  circleShapeDef.shape = circle;
  circleShapeDef.density = 1.0;

  circleShapeDef.filter.groupIndex = box2d.Testbed.CollisionFiltering.k_smallGroup;
  circleShapeDef.filter.categoryBits = box2d.Testbed.CollisionFiltering.k_circleCategory;
  circleShapeDef.filter.maskBits = box2d.Testbed.CollisionFiltering.k_circleMask;

  var circleBodyDef = new box2d.b2BodyDef();
  circleBodyDef.type = box2d.b2BodyType.b2_dynamicBody;
  circleBodyDef.position.Set(5.0, 2.0);

  var body5 = this.m_world.CreateBody(circleBodyDef);
  body5.CreateFixture(circleShapeDef);

  // Large circle
  circle.m_radius *= 2.0;
  circleShapeDef.filter.groupIndex = box2d.Testbed.CollisionFiltering.k_largeGroup;
  circleBodyDef.position.Set(5.0, 6.0);

  var body6 = this.m_world.CreateBody(circleBodyDef);
  body6.CreateFixture(circleShapeDef);
}

goog.inherits(box2d.Testbed.CollisionFiltering, box2d.Testbed.Test);

/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.CollisionFiltering.k_smallGroup = 1;
/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.CollisionFiltering.k_largeGroup = -1;

/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.CollisionFiltering.k_defaultCategory = 0x0001;
/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.CollisionFiltering.k_triangleCategory = 0x0002;
/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.CollisionFiltering.k_boxCategory = 0x0004;
/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.CollisionFiltering.k_circleCategory = 0x0008;

/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.CollisionFiltering.k_triangleMask = 0xFFFF;
/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.CollisionFiltering.k_boxMask = 0xFFFF ^ box2d.Testbed.CollisionFiltering.k_triangleCategory;
/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.CollisionFiltering.k_circleMask = 0xFFFF;

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.CollisionFiltering.Create = function(canvas, settings) {
  return new box2d.Testbed.CollisionFiltering(canvas, settings);
}
