/*
 * Copyright (c) 2007-2009 Erin Catto http://www.box2d.org
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

goog.provide('box2d.Testbed.RopeJoint');

goog.require('box2d.Testbed.Test');

/**
 * This test shows how a rope joint can be used to stabilize a
 * chain of bodies with a heavy payload. Notice that the rope
 * joint just prevents excessive stretching and has no other
 * effect.
 * By disabling the rope joint you can see that the Box2D solver
 * has trouble supporting heavy bodies with light bodies. Try
 * playing around with the densities, time step, and iterations
 * to see how they affect stability. This test also shows how to
 * use contact filtering. Filtering is configured so that the
 * payload does not collide with the chain.
 */

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.RopeJoint = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  this.m_ropeDef = new box2d.b2RopeJointDef();

  /*box2d.b2Body*/
  var ground = null; {
    /*box2d.b2BodyDef*/
    var bd = new box2d.b2BodyDef();
    ground = this.m_world.CreateBody(bd);

    /*box2d.b2EdgeShape*/
    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
    ground.CreateFixture(shape, 0.0);
  }

  {
    /*box2d.b2PolygonShape*/
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.5, 0.125);

    /*box2d.b2FixtureDef*/
    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 20.0;
    fd.friction = 0.2;
    fd.filter.categoryBits = 0x0001;
    fd.filter.maskBits = 0xFFFF & ~0x0002;

    /*box2d.b2RevoluteJointDef*/
    var jd = new box2d.b2RevoluteJointDef();
    jd.collideConnected = false;

    /*const int32*/
    var N = 10;
    /*const float32*/
    var y = 15.0;
    this.m_ropeDef.localAnchorA.Set(0.0, y);

    /*box2d.b2Body*/
    var prevBody = ground;
    for ( /*int32*/ var i = 0; i < N; ++i) {
      /*box2d.b2BodyDef*/
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(0.5 + 1.0 * i, y);
      if (i === N - 1) {
        shape.SetAsBox(1.5, 1.5);
        fd.density = 100.0;
        fd.filter.categoryBits = 0x0002;
        bd.position.Set(1.0 * i, y);
        bd.angularDamping = 0.4;
      }

      /*box2d.b2Body*/
      var body = this.m_world.CreateBody(bd);

      body.CreateFixture(fd);

      /*box2d.b2Vec2*/
      var anchor = new box2d.b2Vec2(i, y);
      jd.Initialize(prevBody, body, anchor);
      this.m_world.CreateJoint(jd);

      prevBody = body;
    }

    this.m_ropeDef.localAnchorB.SetZero();

    /*float32*/
    var extraLength = 0.01;
    this.m_ropeDef.maxLength = N - 1.0 + extraLength;
    this.m_ropeDef.bodyB = prevBody;
  }

  {
    this.m_ropeDef.bodyA = ground;
    this.m_rope = this.m_world.CreateJoint(this.m_ropeDef);
  }
}

goog.inherits(box2d.Testbed.RopeJoint, box2d.Testbed.Test);

/**
 * @export
 * @type {box2d.b2RopeJointDef}
 */
box2d.Testbed.RopeJoint.prototype.m_ropeDef = null;
/**
 * @export
 * @type {box2d.b2Joint}
 */
box2d.Testbed.RopeJoint.prototype.m_rope = null;

/**
 * @export
 * @return {void}
 * @param {number} key
 */
box2d.Testbed.RopeJoint.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.J:
      if (this.m_rope) {
        this.m_world.DestroyJoint(this.m_rope);
        this.m_rope = null;
      } else {
        this.m_rope = this.m_world.CreateJoint(this.m_ropeDef);
      }
      break;
  }
}

/**
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.RopeJoint.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);
  this.m_debugDraw.DrawString(5, this.m_textLine, "Press (j) to toggle the rope joint.");
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
  if (this.m_rope) {
    this.m_debugDraw.DrawString(5, this.m_textLine, "Rope ON");
  } else {
    this.m_debugDraw.DrawString(5, this.m_textLine, "Rope OFF");
  }
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.RopeJoint.Create = function(canvas, settings) {
  return new box2d.Testbed.RopeJoint(canvas, settings);
}
