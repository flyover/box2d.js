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

goog.provide('box2d.Testbed.SensorTest');

goog.require('box2d.Testbed.Test');

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.SensorTest = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  this.m_bodies = new Array(box2d.Testbed.SensorTest.e_count);
  this.m_touching = new Array(box2d.Testbed.SensorTest.e_count);
  for (var i = 0; i < box2d.Testbed.SensorTest.e_count; ++i) {
    this.m_touching[i] = new Array(1);
  }

  var bd = new box2d.b2BodyDef();
  var ground = this.m_world.CreateBody(bd);

  {
    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
    ground.CreateFixture(shape, 0.0);
  }

  /*
  {
    var sd = new box2d.b2FixtureDef();
    sd.SetAsBox(10.0, 2.0, new box2d.b2Vec2(0.0, 20.0), 0.0);
    sd.isSensor = true;
    this.m_sensor = ground.CreateFixture(sd);
  }
  */
  {
    var shape = new box2d.b2CircleShape();
    shape.m_radius = 5.0;
    shape.m_p.Set(0.0, 10.0);

    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.isSensor = true;
    this.m_sensor = ground.CreateFixture(fd);
  }

  {
    var shape = new box2d.b2CircleShape();
    shape.m_radius = 1.0;

    for (var i = 0; i < box2d.Testbed.SensorTest.e_count; ++i) {
      //var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(-10.0 + 3.0 * i, 20.0);
      bd.userData = this.m_touching[i];

      this.m_touching[i][0] = false;
      this.m_bodies[i] = this.m_world.CreateBody(bd);

      this.m_bodies[i].CreateFixture(shape, 1.0);
    }
  }
}

goog.inherits(box2d.Testbed.SensorTest, box2d.Testbed.Test);

/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.SensorTest.e_count = 7;

/**
 * @export
 * @type {box2d.b2Fixture}
 */
box2d.Testbed.SensorTest.prototype.m_sensor = null;
/**
 * @export
 * @type {Array.<box2d.b2Body>}
 */
box2d.Testbed.SensorTest.prototype.m_bodies = null;
/**
 * @export
 * @type {Array.<Array.<boolean>>}
 */
box2d.Testbed.SensorTest.prototype.m_touching = null;

/**
 * Implement contact listener.
 * @export
 * @return {void}
 * @param {box2d.b2Contact} contact
 */
box2d.Testbed.SensorTest.prototype.BeginContact = function(contact) {
  var fixtureA = contact.GetFixtureA();
  var fixtureB = contact.GetFixtureB();

  if (fixtureA === this.m_sensor) {
    var userData = fixtureB.GetBody().GetUserData();
    if (userData) {
      var touching = userData;
      touching[0] = true;
    }
  }

  if (fixtureB === this.m_sensor) {
    var userData = fixtureA.GetBody().GetUserData();
    if (userData) {
      var touching = userData;
      touching[0] = true;
    }
  }
}

/**
 * Implement contact listener.
 * @export
 * @return {void}
 * @param {box2d.b2Contact} contact
 */
box2d.Testbed.SensorTest.prototype.EndContact = function(contact) {
  var fixtureA = contact.GetFixtureA();
  var fixtureB = contact.GetFixtureB();

  if (fixtureA === this.m_sensor) {
    var userData = fixtureB.GetBody().GetUserData();
    if (userData) {
      var touching = userData;
      touching[0] = false;
    }
  }

  if (fixtureB === this.m_sensor) {
    var userData = fixtureA.GetBody().GetUserData();
    if (userData) {
      var touching = userData;
      touching[0] = false;
    }
  }
}

/**
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.SensorTest.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);

  // Traverse the contact results. Apply a force on shapes
  // that overlap the sensor.
  for (var i = 0; i < box2d.Testbed.SensorTest.e_count; ++i) {
    if (!this.m_touching[i][0]) {
      continue;
    }

    var body = this.m_bodies[i];
    var ground = this.m_sensor.GetBody();

    var circle = this.m_sensor.GetShape();
    var center = ground.GetWorldPoint(circle.m_p, new box2d.b2Vec2());

    var position = body.GetPosition();

    var d = box2d.b2Sub_V2_V2(center, position, new box2d.b2Vec2());
    if (d.LengthSquared() < box2d.b2_epsilon_sq) {
      continue;
    }

    d.Normalize();
    var F = box2d.b2Mul_S_V2(100.0, d, new box2d.b2Vec2());
    body.ApplyForce(F, position);
  }
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.SensorTest.Create = function(canvas, settings) {
  return new box2d.Testbed.SensorTest(canvas, settings);
}
