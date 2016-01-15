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

goog.provide('box2d.Testbed.Chain');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Chain = function(canvas, settings) {
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
    shape.SetAsBox(0.6, 0.125);

    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 20.0;
    fd.friction = 0.2;

    var jd = new box2d.b2RevoluteJointDef();
    jd.collideConnected = false;

    var y = 25.0;
    var prevBody = ground;
    for (var i = 0; i < box2d.Testbed.Chain.e_count; ++i) {
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(0.5 + i, y);
      var body = this.m_world.CreateBody(bd);
      body.CreateFixture(fd);

      var anchor = new box2d.b2Vec2(i, y);
      jd.Initialize(prevBody, body, anchor);
      this.m_world.CreateJoint(jd);

      prevBody = body;
    }
  }
}

goog.inherits(box2d.Testbed.Chain, box2d.Testbed.Test);

/**
 * @export 
 * @const 
 * @type {number} 
 */
box2d.Testbed.Chain.e_count = 30;

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Chain.Create = function(canvas, settings) {
  return new box2d.Testbed.Chain(canvas, settings);
}
