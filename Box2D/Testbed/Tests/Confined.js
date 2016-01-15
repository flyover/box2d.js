/*
 * Copyright (c) 2009 Erin Catto http://www.box2d.org
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

goog.provide('box2d.Testbed.Confined');

goog.require('box2d.Testbed.Test');

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Confined = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  {
    var bd = new box2d.b2BodyDef();
    var ground = this.m_world.CreateBody(bd);

    var shape = new box2d.b2EdgeShape();

    // Floor
    shape.SetAsEdge(new box2d.b2Vec2(-10.0, 0.0), new box2d.b2Vec2(10.0, 0.0));
    ground.CreateFixture(shape, 0.0);

    // Left wall
    shape.SetAsEdge(new box2d.b2Vec2(-10.0, 0.0), new box2d.b2Vec2(-10.0, 20.0));
    ground.CreateFixture(shape, 0.0);

    // Right wall
    shape.SetAsEdge(new box2d.b2Vec2(10.0, 0.0), new box2d.b2Vec2(10.0, 20.0));
    ground.CreateFixture(shape, 0.0);

    // Roof
    shape.SetAsEdge(new box2d.b2Vec2(-10.0, 20.0), new box2d.b2Vec2(10.0, 20.0));
    ground.CreateFixture(shape, 0.0);
  }

  var radius = 0.5;
  var shape = new box2d.b2CircleShape();
  shape.m_p.SetZero();
  shape.m_radius = radius;

  var fd = new box2d.b2FixtureDef();
  fd.shape = shape;
  fd.density = 1.0;
  fd.friction = 0.1;

  for (var j = 0; j < box2d.Testbed.Confined.e_columnCount; ++j) {
    for (var i = 0; i < box2d.Testbed.Confined.e_rowCount; ++i) {
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(-10.0 + (2.1 * j + 1.0 + 0.01 * i) * radius, (2.0 * i + 1.0) * radius);
      var body = this.m_world.CreateBody(bd);

      body.CreateFixture(fd);
    }
  }

  this.m_world.SetGravity(new box2d.b2Vec2(0.0, 0.0));
}

goog.inherits(box2d.Testbed.Confined, box2d.Testbed.Test);

/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.Confined.e_columnCount = 0;
/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.Confined.e_rowCount = 0;

/**
 * @export
 * @return {void}
 */
box2d.Testbed.Confined.prototype.CreateCircle = function() {
  var radius = 2.0;
  var shape = new box2d.b2CircleShape();
  shape.m_p.SetZero();
  shape.m_radius = radius;

  var fd = new box2d.b2FixtureDef();
  fd.shape = shape;
  fd.density = 1.0;
  fd.friction = 0.0;

  var p = new box2d.b2Vec2(box2d.b2Random(), 3.0 + box2d.b2Random());
  var bd = new box2d.b2BodyDef();
  bd.type = box2d.b2BodyType.b2_dynamicBody;
  bd.position.Copy(p);
  //bd.allowSleep = false;
  var body = this.m_world.CreateBody(bd);

  body.CreateFixture(fd);
}

/**
 * @export
 * @return {void}
 * @param {number} key
 */
box2d.Testbed.Confined.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.C:
      this.CreateCircle();
      break;
  }
}

/**
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Confined.prototype.Step = function(settings) {
  var sleeping = true;
  for (var b = this.m_world.GetBodyList(); b; b = b.m_next) {
    if (b.GetType() !== box2d.b2BodyType.b2_dynamicBody) {
      continue;
    }

    if (b.IsAwake()) {
      sleeping = false;
    }
  }

  if (this.m_stepCount === 180) {
    this.m_stepCount += 0;
  }

  //if (sleeping)
  //{
  //  CreateCircle();
  //}

  box2d.Testbed.Test.prototype.Step.call(this, settings);

  for (var b = this.m_world.GetBodyList(); b; b = b.m_next) {
    if (b.GetType() !== box2d.b2BodyType.b2_dynamicBody) {
      continue;
    }

    var p = b.GetPosition();
    if (p.x <= -10.0 || 10.0 <= p.x || p.y <= 0.0 || 20.0 <= p.y) {
      p.x += 0.0;
    }
  }

  this.m_debugDraw.DrawString(5, this.m_textLine, "Press 'c' to create a circle.");
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Confined.Create = function(canvas, settings) {
  return new box2d.Testbed.Confined(canvas, settings);
}
