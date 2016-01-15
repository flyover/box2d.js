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

goog.provide('box2d.Testbed.BlobTest');

goog.require('box2d.Testbed.Test');

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.BlobTest = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  var ground = this.m_world.CreateBody(new box2d.b2BodyDef());

  {
    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
    ground.CreateFixture(shape, 0.0);
    shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(-40.0, 25.0));
    ground.CreateFixture(shape, 0.0);
    shape.SetAsEdge(new box2d.b2Vec2(40.0, 0.0), new box2d.b2Vec2(40.0, 25.0));
    ground.CreateFixture(shape, 0.0);
  }

  {
    var ajd = new box2d.b2AreaJointDef();
    ajd.world = this.m_world;

    var cx = 0.0;
    var cy = 10.0;
    var rx = 5.0;
    var ry = 5.0;
    var nBodies = 20;
    var bodyRadius = 0.5;
    for (var i = 0; i < nBodies; ++i) {
      var angle = (i * 2.0 * Math.PI) / nBodies;
      var bd = new box2d.b2BodyDef();
      //bd.isBullet = true;
      bd.fixedRotation = true;

      var x = cx + rx * Math.cos(angle);
      var y = cy + ry * Math.sin(angle);
      bd.position.Set(x, y);
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      var body = this.m_world.CreateBody(bd);

      var fd = new box2d.b2FixtureDef();
      fd.shape = new box2d.b2CircleShape(bodyRadius);
      fd.density = 1.0;
      body.CreateFixture(fd);

      ajd.AddBody(body);
    }

    ajd.frquencyHz = 10.0;
    ajd.dampingRatio = 1.0;
    this.m_world.CreateJoint(ajd);
  }
}

goog.inherits(box2d.Testbed.BlobTest, box2d.Testbed.Test);

/**
 * @export
 * @return {void}
 * @param {number} key
 */
box2d.Testbed.BlobTest.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.A:
      break;
  }
}

/**
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.BlobTest.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.BlobTest.Create = function(canvas, settings) {
  return new box2d.Testbed.BlobTest(canvas, settings);
}
