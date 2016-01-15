/*
 * Copyright (c) 2008-2009 Erin Catto http://www.box2d.org
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

goog.provide('box2d.Testbed.OneSidedPlatform');

goog.require('box2d.Testbed.Test');

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.OneSidedPlatform = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  // Ground
  {
    var bd = new box2d.b2BodyDef();
    var ground = this.m_world.CreateBody(bd);

    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
    ground.CreateFixture(shape, 0.0);
  }

  // Platform
  {
    var bd = new box2d.b2BodyDef();
    bd.position.Set(0.0, 10.0);
    var body = this.m_world.CreateBody(bd);

    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(3.0, 0.5);
    this.m_platform = body.CreateFixture(shape, 0.0);

    this.m_bottom = 10.0 - 0.5;
    this.m_top = 10.0 + 0.5;
  }

  // Actor
  {
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(0.0, 12.0);
    var body = this.m_world.CreateBody(bd);

    this.m_radius = 0.5;
    var shape = new box2d.b2CircleShape();
    shape.m_radius = this.m_radius;
    this.m_character = body.CreateFixture(shape, 20.0);

    body.SetLinearVelocity(new box2d.b2Vec2(0.0, -50.0));

    this.m_state = box2d.Testbed.OneSidedPlatform.e_unknown;
  }
}

goog.inherits(box2d.Testbed.OneSidedPlatform, box2d.Testbed.Test);

/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.OneSidedPlatform.e_unknown = 0;
/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.OneSidedPlatform.e_above = 1;
/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.OneSidedPlatform.e_below = 2;

/**
 * @export
 * @type {number}
 */
box2d.Testbed.OneSidedPlatform.prototype.m_radius = 0.0;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.OneSidedPlatform.prototype.m_top = 0.0;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.OneSidedPlatform.prototype.m_bottom = 0.0;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.OneSidedPlatform.prototype.m_state = box2d.Testbed.OneSidedPlatform.e_unknown;
/**
 * @export
 * @type {box2d.b2Fixture}
 */
box2d.Testbed.OneSidedPlatform.prototype.m_platform = null;
/**
 * @export
 * @type {box2d.b2Fixture}
 */
box2d.Testbed.OneSidedPlatform.prototype.m_character = null;

/**
 * @export
 * @return {void}
 * @param {box2d.b2Contact} contact
 * @param {box2d.b2Manifold} oldManifold
 */
box2d.Testbed.OneSidedPlatform.prototype.PreSolve = function(contact, oldManifold) {
  box2d.Testbed.Test.prototype.PreSolve.call(this, contact, oldManifold);

  var fixtureA = contact.GetFixtureA();
  var fixtureB = contact.GetFixtureB();

  if (fixtureA !== this.m_platform && fixtureA !== this.m_character) {
    return;
  }

  if (fixtureB !== this.m_platform && fixtureB !== this.m_character) {
    return;
  }

  var position = this.m_character.GetBody().GetPosition();

  if (position.y < this.m_top + this.m_radius - 3.0 * box2d.b2_linearSlop) {
    contact.SetEnabled(false);
  }
}

/**
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.OneSidedPlatform.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);
  this.m_debugDraw.DrawString(5, this.m_textLine, "Press: (c) create a shape, (d) destroy a shape.");
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;

  var v = this.m_character.GetBody().GetLinearVelocity();
  this.m_debugDraw.DrawString(5, this.m_textLine, "Character Linear Velocity: %f", v.y);
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.OneSidedPlatform.Create = function(canvas, settings) {
  return new box2d.Testbed.OneSidedPlatform(canvas, settings);
}
