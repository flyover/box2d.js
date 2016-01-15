/*
 * Copyright (c) 2006-2012 Erin Catto http://www.box2d.org
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

goog.provide('box2d.Testbed.AddPair');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.AddPair = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  this.m_world.SetGravity(new box2d.b2Vec2(0.0, 0.0)); {
    /*float32*/
    var a = 0.1;

    /*box2d.b2CircleShape*/
    var shape = new box2d.b2CircleShape();
    shape.m_p.SetZero();
    shape.m_radius = 0.1;

    /*float*/
    var minX = -6.0;
    /*float*/
    var maxX = 0.0;
    /*float*/
    var minY = 4.0;
    /*float*/
    var maxY = 6.0;

    for ( /*int32*/ var i = 0; i < 400; ++i) {
      /*box2d.b2BodyDef*/
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position = new box2d.b2Vec2(box2d.b2RandomRange(minX, maxX), box2d.b2RandomRange(minY, maxY));
      /*box2d.b2Body*/
      var body = this.m_world.CreateBody(bd);
      body.CreateFixture(shape, 0.01);
    }
  }

  {
    /*box2d.b2PolygonShape*/
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(1.5, 1.5);
    /*box2d.b2BodyDef*/
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(-40.0, 5.0);
    bd.bullet = true;
    /*box2d.b2Body*/
    var body = this.m_world.CreateBody(bd);
    body.CreateFixture(shape, 1.0);
    body.SetLinearVelocity(new box2d.b2Vec2(150.0, 0.0));
  }
}

goog.inherits(box2d.Testbed.AddPair, box2d.Testbed.Test);

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.AddPair.Create = function(canvas, settings) {
  return new box2d.Testbed.AddPair(canvas, settings);
}
