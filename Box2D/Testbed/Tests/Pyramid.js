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

goog.provide('box2d.Testbed.Pyramid');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Pyramid = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  {
    var bd = new box2d.b2BodyDef();
    var ground = this.m_world.CreateBody(bd);

    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
    ground.CreateFixture(shape, 0.0);
  }

  {
    var a = 0.5;
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(a, a);

    var x = new box2d.b2Vec2(-7.0, 0.75);
    var y = new box2d.b2Vec2(0.0, 0.0);
    var deltaX = new box2d.b2Vec2(0.5625, 1.25);
    var deltaY = new box2d.b2Vec2(1.125, 0.0);

    for (var i = 0; i < box2d.Testbed.Pyramid.e_count; ++i) {
      y.Copy(x);

      for (var j = i; j < box2d.Testbed.Pyramid.e_count; ++j) {
        var bd = new box2d.b2BodyDef();
        bd.type = box2d.b2BodyType.b2_dynamicBody;
        bd.position.Copy(y);
        var body = this.m_world.CreateBody(bd);
        body.CreateFixture(shape, 5.0);

        y.SelfAdd(deltaY);
      }

      x.SelfAdd(deltaX);
    }
  }
}

goog.inherits(box2d.Testbed.Pyramid, box2d.Testbed.Test);

/**
 * @export 
 * @const 
 * @type {number} 
 */
box2d.Testbed.Pyramid.e_count = 20;

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Pyramid.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);

  //box2d.b2DynamicTree* tree = &m_world.m_contactManager.m_broadPhase.m_tree;

  //if (m_stepCount === 400)
  //{
  //	tree.RebuildBottomUp();
  //}
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Pyramid.Create = function(canvas, settings) {
  return new box2d.Testbed.Pyramid(canvas, settings);
}
