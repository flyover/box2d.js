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

goog.provide('box2d.Testbed.TestCCD');

goog.require('box2d.Testbed.Test');
goog.require('goog.events.KeyCodes');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.TestCCD = function (canvas, settings)
{
	box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

	{
		var bd = new box2d.b2BodyDef();
		var ground = this.m_world.CreateBody(bd);

		var vertices = [];
		vertices[0] = new box2d.b2Vec2(-30.0, 0.0);
		vertices[1] = new box2d.b2Vec2( 30.0, 0.0);
		vertices[2] = new box2d.b2Vec2( 30.0, 40.0);
		vertices[3] = new box2d.b2Vec2(-30.0, 40.0);
		var shape = new box2d.b2ChainShape();
		shape.CreateLoop(vertices);
		ground.CreateFixture(shape, 0.0);
	}

	// Always on, even if default is off
	this.m_world.SetContinuousPhysics(true);

	var bd;
	var body;
	var fd = new box2d.b2FixtureDef();
	// These values are used for all the parts of the 'basket'
	fd.density = 4.0; 
	fd.restitution = 1.4;

	// Create 'basket'
	{
		bd = new box2d.b2BodyDef();
		bd.type = box2d.b2BodyType.b2_dynamicBody;
		bd.bullet = true;
		bd.position.Set( 15.0, 5.0 );
		body = this.m_world.CreateBody(bd);

		var sd_bottom = new box2d.b2PolygonShape();
		sd_bottom.SetAsBox( 4.5, 0.45 );
		fd.shape = sd_bottom;
		body.CreateFixture(fd);

		var sd_left = new box2d.b2PolygonShape();
		sd_left.SetAsBox(0.45, 8.1, new box2d.b2Vec2(-4.35, 7.05), 0.2);
		fd.shape = sd_left;
		body.CreateFixture(fd);

		var sd_right = new box2d.b2PolygonShape();
		sd_right.SetAsBox(0.45, 8.1, new box2d.b2Vec2(4.35, 7.05), -0.2);
		fd.shape = sd_right;
		body.CreateFixture(fd);
	}

	// add some small circles for effect
	for (var i = 0; i < 5; i++)
	{
		var cd = new box2d.b2CircleShape((Math.random() * 1.0 + 0.5));
		fd.shape = cd;
		fd.friction = 0.3;
		fd.density = 1.0;
		fd.restitution = 1.1;
		bd = new box2d.b2BodyDef();
		bd.type = box2d.b2BodyType.b2_dynamicBody;
		bd.bullet = true;
		bd.position.Set( (Math.random() * 30.0 - 25.0), (Math.random() * 32.0 + 2.0) );
		body = this.m_world.CreateBody(bd);
		body.CreateFixture(fd);
	}
}

goog.inherits(box2d.Testbed.TestCCD, box2d.Testbed.Test);

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.TestCCD.Create = function (canvas, settings)
{
	return new box2d.Testbed.TestCCD(canvas, settings);
}

