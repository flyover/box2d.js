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

goog.provide('box2d.Testbed.ApplyForce');

goog.require('box2d.Testbed.Test');
goog.require('goog.events.KeyCodes');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.ApplyForce = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  this.m_body = null;

  this.m_world.SetGravity(new box2d.b2Vec2(0.0, 0.0));

  /*float32*/
  var k_restitution = 0.4;

  /*box2d.b2Body*/
  var ground = null; {
    /*box2d.b2BodyDef*/
    var bd = new box2d.b2BodyDef();
    bd.position.Set(0.0, 20.0);
    ground = this.m_world.CreateBody(bd);

    /*box2d.b2EdgeShape*/
    var shape = new box2d.b2EdgeShape();

    /*box2d.b2FixtureDef*/
    var sd = new box2d.b2FixtureDef();
    sd.shape = shape;
    sd.density = 0.0;
    sd.restitution = k_restitution;

    // Left vertical
    shape.SetAsEdge(new box2d.b2Vec2(-20.0, -20.0), new box2d.b2Vec2(-20.0, 20.0));
    ground.CreateFixture(sd);

    // Right vertical
    shape.SetAsEdge(new box2d.b2Vec2(20.0, -20.0), new box2d.b2Vec2(20.0, 20.0));
    ground.CreateFixture(sd);

    // Top horizontal
    shape.SetAsEdge(new box2d.b2Vec2(-20.0, 20.0), new box2d.b2Vec2(20.0, 20.0));
    ground.CreateFixture(sd);

    // Bottom horizontal
    shape.SetAsEdge(new box2d.b2Vec2(-20.0, -20.0), new box2d.b2Vec2(20.0, -20.0));
    ground.CreateFixture(sd);
  }

  {
    /*box2d.b2Transform*/
    var xf1 = new box2d.b2Transform();
    xf1.q.SetAngle(0.3524 * box2d.b2_pi);
    xf1.p.Copy(box2d.b2Mul_R_V2(xf1.q, new box2d.b2Vec2(1.0, 0.0), new box2d.b2Vec2()));

    /*box2d.b2Vec2[]*/
    var vertices = new Array();
    vertices[0] = box2d.b2Mul_X_V2(xf1, new box2d.b2Vec2(-1.0, 0.0), new box2d.b2Vec2());
    vertices[1] = box2d.b2Mul_X_V2(xf1, new box2d.b2Vec2(1.0, 0.0), new box2d.b2Vec2());
    vertices[2] = box2d.b2Mul_X_V2(xf1, new box2d.b2Vec2(0.0, 0.5), new box2d.b2Vec2());

    /*box2d.b2PolygonShape*/
    var poly1 = new box2d.b2PolygonShape();
    poly1.Set(vertices, 3);

    /*box2d.b2FixtureDef*/
    var sd1 = new box2d.b2FixtureDef();
    sd1.shape = poly1;
    sd1.density = 4.0;

    /*box2d.b2Transform*/
    var xf2 = new box2d.b2Transform();
    xf2.q.SetAngle(-0.3524 * box2d.b2_pi);
    xf2.p.Copy(box2d.b2Mul_R_V2(xf2.q, new box2d.b2Vec2(-1.0, 0.0), new box2d.b2Vec2()));

    vertices[0] = box2d.b2Mul_X_V2(xf2, new box2d.b2Vec2(-1.0, 0.0), new box2d.b2Vec2());
    vertices[1] = box2d.b2Mul_X_V2(xf2, new box2d.b2Vec2(1.0, 0.0), new box2d.b2Vec2());
    vertices[2] = box2d.b2Mul_X_V2(xf2, new box2d.b2Vec2(0.0, 0.5), new box2d.b2Vec2());

    /*box2d.b2PolygonShape*/
    var poly2 = new box2d.b2PolygonShape();
    poly2.Set(vertices, 3);

    /*box2d.b2FixtureDef*/
    var sd2 = new box2d.b2FixtureDef();
    sd2.shape = poly2;
    sd2.density = 2.0;

    /*box2d.b2BodyDef*/
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.angularDamping = 2.0;
    bd.linearDamping = 0.5;

    bd.position.Set(0.0, 2.0);
    bd.angle = box2d.b2_pi;
    bd.allowSleep = false;
    this.m_body = this.m_world.CreateBody(bd);
    this.m_body.CreateFixture(sd1);
    this.m_body.CreateFixture(sd2);
  }

  {
    /*box2d.b2PolygonShape*/
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.5, 0.5);

    /*box2d.b2FixtureDef*/
    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 1.0;
    fd.friction = 0.3;

    for ( /*int*/ var i = 0; i < 10; ++i) {
      /*box2d.b2BodyDef*/
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;

      bd.position.Set(0.0, 5.0 + 1.54 * i);
      /*box2d.b2Body*/
      var body = this.m_world.CreateBody(bd);

      body.CreateFixture(fd);

      /*float32*/
      var gravity = 10.0;
      /*float32*/
      var I = body.GetInertia();
      /*float32*/
      var mass = body.GetMass();

      // For a circle: I = 0.5 * m * r * r ==> r = sqrt(2 * I / m)
      /*float32*/
      var radius = box2d.b2Sqrt(2.0 * I / mass);

      /*box2d.b2FrictionJointDef*/
      var jd = new box2d.b2FrictionJointDef();
      jd.localAnchorA.SetZero();
      jd.localAnchorB.SetZero();
      jd.bodyA = ground;
      jd.bodyB = body;
      jd.collideConnected = true;
      jd.maxForce = mass * gravity;
      jd.maxTorque = mass * radius * gravity;

      this.m_world.CreateJoint(jd);
    }
  }
}

goog.inherits(box2d.Testbed.ApplyForce, box2d.Testbed.Test);

/**
 * @export 
 * @type {box2d.b2Body} 
 */
box2d.Testbed.ApplyForce.prototype.m_body = null;

/**
 * @export 
 * @return {void} 
 * @param {number} key 
 */
box2d.Testbed.ApplyForce.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.W:
      {
        /*box2d.b2Vec2*/
        var f = this.m_body.GetWorldVector(new box2d.b2Vec2(0.0, -200.0), new box2d.b2Vec2());
        /*box2d.b2Vec2*/
        var p = this.m_body.GetWorldPoint(new box2d.b2Vec2(0.0, 2.0), new box2d.b2Vec2());
        this.m_body.ApplyForce(f, p);
      }
      break;

    case goog.events.KeyCodes.A:
      {
        this.m_body.ApplyTorque(50.0);
      }
      break;

    case goog.events.KeyCodes.D:
      {
        this.m_body.ApplyTorque(-50.0);
      }
      break;
  }

  box2d.Testbed.Test.prototype.Keyboard.call(this, key);
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.ApplyForce.Create = function(canvas, settings) {
  return new box2d.Testbed.ApplyForce(canvas, settings);
}
