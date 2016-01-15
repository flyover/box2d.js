/*
 * Copyright (c) 2011 Erin Catto http://www.box2d.org
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

goog.provide('box2d.Testbed.ConveyorBelt');

goog.require('box2d.Testbed.Test');

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.ConveyorBelt = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  // Ground
  {
    var bd = new box2d.b2BodyDef();
    /*b2Body*/
    var ground = this.m_world.CreateBody(bd);

    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-20.0, 0.0), new box2d.b2Vec2(20.0, 0.0));
    ground.CreateFixture(shape, 0.0);
  }

  // Platform
  {
    var bd = new box2d.b2BodyDef();
    bd.position.Set(-5.0, 5.0);
    /*b2Body*/
    var body = this.m_world.CreateBody(bd);

    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(10.0, 0.5);

    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.friction = 0.8;
    this.m_platform = body.CreateFixture(fd);
  }

  // Boxes
  for ( /*int*/ var i = 0; i < 5; ++i) {
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(-10.0 + 2.0 * i, 7.0);
    /*b2Body*/
    var body = this.m_world.CreateBody(bd);

    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.5, 0.5);
    body.CreateFixture(shape, 20.0);
  }
}

goog.inherits(box2d.Testbed.ConveyorBelt, box2d.Testbed.Test);

/**
 * @export
 * @type {box2d.b2Fixture}
 */
box2d.Testbed.ConveyorBelt.prototype.m_platform = null;

/**
 * @export
 * @return {void}
 * @param {box2d.b2Contact} contact
 * @param {box2d.b2Manifold} oldManifold
 */
box2d.Testbed.ConveyorBelt.prototype.PreSolve = function(contact, oldManifold) {
  box2d.Testbed.Test.prototype.PreSolve.call(this, contact, oldManifold);

  /*b2Fixture*/
  var fixtureA = contact.GetFixtureA();
  /*b2Fixture*/
  var fixtureB = contact.GetFixtureB();

  if (fixtureA === this.m_platform) {
    contact.SetTangentSpeed(5.0);
  }

  if (fixtureB === this.m_platform) {
    contact.SetTangentSpeed(-5.0);
  }
}

/**
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.ConveyorBelt.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.ConveyorBelt.Create = function(canvas, settings) {
  return new box2d.Testbed.ConveyorBelt(canvas, settings);
}
