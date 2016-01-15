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

goog.provide('box2d.Testbed.VerticalStack');

goog.require('box2d.Testbed.Test');

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.VerticalStack = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  this.m_bullet = null;
  /** @type {Array.<box2d.b2Body>} */
  this.m_bodies = new Array(box2d.Testbed.VerticalStack.e_rowCount * box2d.Testbed.VerticalStack.e_columnCount);
  /** @type {Array.<number>} */
  this.m_indices = new Array(box2d.Testbed.VerticalStack.e_rowCount * box2d.Testbed.VerticalStack.e_columnCount);

  {
    var bd = new box2d.b2BodyDef();
    var ground = this.m_world.CreateBody(bd);

    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
    ground.CreateFixture(shape, 0.0);

    shape.SetAsEdge(new box2d.b2Vec2(20.0, 0.0), new box2d.b2Vec2(20.0, 20.0));
    ground.CreateFixture(shape, 0.0);
  }

  var xs = [0.0, -10.0, -5.0, 5.0, 10.0];

  for (var j = 0; j < box2d.Testbed.VerticalStack.e_columnCount; ++j) {
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.5, 0.5);

    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 1.0;
    fd.friction = 0.3;

    for (var i = 0; i < box2d.Testbed.VerticalStack.e_rowCount; ++i) {
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;

      var n = j * box2d.Testbed.VerticalStack.e_rowCount + i;
      if (box2d.ENABLE_ASSERTS) {
        box2d.b2Assert(n < box2d.Testbed.VerticalStack.e_rowCount * box2d.Testbed.VerticalStack.e_columnCount);
      }
      this.m_indices[n] = n;
      bd.userData = this.m_indices[n];

      var x = 0.0;
      //var x = box2d.b2RandomRange(-0.02, 0.02);
      //var x = i % 2 === 0 ? -0.01 : 0.01;
      bd.position.Set(xs[j] + x, 0.55 + 1.1 * i);
      var body = this.m_world.CreateBody(bd);

      this.m_bodies[n] = body;

      body.CreateFixture(fd);
    }
  }
}

goog.inherits(box2d.Testbed.VerticalStack, box2d.Testbed.Test);

/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.VerticalStack.e_columnCount = 1;
/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.VerticalStack.e_rowCount = 15;

/**
 * @export
 * @type {box2d.b2Body}
 */
box2d.Testbed.VerticalStack.prototype.m_bullet = null;
/**
 * @export
 * @type {Array.<box2d.b2Body>}
 */
box2d.Testbed.VerticalStack.prototype.m_bodies = null;
/**
 * @export
 * @type {Array.<number>}
 */
box2d.Testbed.VerticalStack.prototype.m_indices = null;

/**
 * @export
 * @return {void}
 * @param {number} key
 */
box2d.Testbed.VerticalStack.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.COMMA:
      if (this.m_bullet) {
        this.m_world.DestroyBody(this.m_bullet);
        this.m_bullet = null;
      }

      {
        var shape = new box2d.b2CircleShape();
        shape.m_radius = 0.25;

        var fd = new box2d.b2FixtureDef();
        fd.shape = shape;
        fd.density = 20.0;
        fd.restitution = 0.05;

        var bd = new box2d.b2BodyDef();
        bd.type = box2d.b2BodyType.b2_dynamicBody;
        bd.bullet = true;
        bd.position.Set(-31.0, 5.0);

        this.m_bullet = this.m_world.CreateBody(bd);
        this.m_bullet.CreateFixture(fd);

        this.m_bullet.SetLinearVelocity(new box2d.b2Vec2(400.0, 0.0));
      }
      break;
    case goog.events.KeyCodes.B:
      box2d.g_blockSolve = !box2d.g_blockSolve;
      break;
  }
}

/**
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.VerticalStack.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);
  this.m_debugDraw.DrawString(5, this.m_textLine, "Press: (,) to launch a bullet.");
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
  this.m_debugDraw.DrawString(5, this.m_textLine, "Blocksolve = %d", (box2d.g_blockSolve) ? (1) : (0));
  //if (this.m_stepCount === 300)
  //{
  //  if (this.m_bullet !== null)
  //  {
  //    this.m_world.DestroyBody(this.m_bullet);
  //    this.m_bullet = null;
  //  }

  //  {
  //    var shape = new box2d.b2CircleShape();
  //    shape.m_radius = 0.25;

  //    var fd = new box2d.b2FixtureDef();
  //    fd.shape = shape;
  //    fd.density = 20.0;
  //    fd.restitution = 0.05;

  //    var bd = new box2d.b2BodyDef();
  //    bd.type = box2d.b2BodyType.b2_dynamicBody;
  //    bd.bullet = true;
  //    bd.position.Set(-31.0, 5.0);

  //    this.m_bullet = this.m_world.CreateBody(bd);
  //    this.m_bullet.CreateFixture(fd);

  //    this.m_bullet.SetLinearVelocity(new box2d.b2Vec2(400.0, 0.0));
  //  }
  //}
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.VerticalStack.Create = function(canvas, settings) {
  return new box2d.Testbed.VerticalStack(canvas, settings);
}
