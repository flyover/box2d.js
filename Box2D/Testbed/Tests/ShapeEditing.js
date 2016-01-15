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

goog.provide('box2d.Testbed.ShapeEditing');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.ShapeEditing = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  {
    var bd = new box2d.b2BodyDef();
    var ground = this.m_world.CreateBody(bd);

    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
    ground.CreateFixture(shape, 0.0);
  }

  var bd = new box2d.b2BodyDef();
  bd.type = box2d.b2BodyType.b2_dynamicBody;
  bd.position.Set(0.0, 10.0);
  this.m_body = this.m_world.CreateBody(bd);

  var shape = new box2d.b2PolygonShape();
  shape.SetAsBox(4.0, 4.0, new box2d.b2Vec2(0.0, 0.0), 0.0);
  this.m_fixture1 = this.m_body.CreateFixture(shape, 10.0);

  this.m_fixture2 = null;

  this.m_sensor = false;
}

goog.inherits(box2d.Testbed.ShapeEditing, box2d.Testbed.Test);

/**
 * @export 
 * @type {box2d.b2Body} 
 */
box2d.Testbed.ShapeEditing.prototype.m_body = null;
/**
 * @export 
 * @type {box2d.b2Fixture} 
 */
box2d.Testbed.ShapeEditing.prototype.m_fixture1 = null;
/**
 * @export 
 * @type {box2d.b2Fixture} 
 */
box2d.Testbed.ShapeEditing.prototype.m_fixture2 = null;
/**
 * @export 
 * @type {boolean} 
 */
box2d.Testbed.ShapeEditing.prototype.m_sensor = false;

/**
 * @export 
 * @return {void} 
 * @param {number} key 
 */
box2d.Testbed.ShapeEditing.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.C:
      if (this.m_fixture2 === null) {
        var shape = new box2d.b2CircleShape();
        shape.m_radius = 3.0;
        shape.m_p.Set(0.5, -4.0);
        this.m_fixture2 = this.m_body.CreateFixture(shape, 10.0);
        this.m_body.SetAwake(true);
      }
      break;

    case goog.events.KeyCodes.D:
      if (this.m_fixture2 !== null) {
        this.m_body.DestroyFixture(this.m_fixture2);
        this.m_fixture2 = null;
        this.m_body.SetAwake(true);
      }
      break;

    case goog.events.KeyCodes.S:
      if (this.m_fixture2 !== null) {
        this.m_sensor = !this.m_sensor;
        this.m_fixture2.SetSensor(this.m_sensor);
      }
      break;
  }
}

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.ShapeEditing.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);
  this.m_debugDraw.DrawString(5, this.m_textLine, "Press: (c) create a shape, (d) destroy a shape.");
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
  this.m_debugDraw.DrawString(5, this.m_textLine, "sensor = %d", (this.m_sensor) ? (1) : (0));
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.ShapeEditing.Create = function(canvas, settings) {
  return new box2d.Testbed.ShapeEditing(canvas, settings);
}
