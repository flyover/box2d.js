/*
* Copyright (c) 2013 Google, Inc.
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

//#if B2_ENABLE_PARTICLE

goog.provide('box2d.Testbed.LiquidTimer');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.LiquidTimer = function (canvas, settings)
{
	box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

	// Setup particle parameters.
	box2d.Testbed.TestMain.SetParticleParameters(box2d.Testbed.LiquidTimer.k_paramDef, box2d.Testbed.LiquidTimer.k_paramDefCount);

	{
		var bd = new box2d.b2BodyDef();
		var ground = this.m_world.CreateBody(bd);

		var shape = new box2d.b2ChainShape();
		var vertices = [
			new box2d.b2Vec2(-2, 0),
			new box2d.b2Vec2(2, 0),
			new box2d.b2Vec2(2, 4),
			new box2d.b2Vec2(-2, 4)];
		shape.CreateLoop(vertices, 4);
		ground.CreateFixture(shape, 0.0);

	}

	this.m_particleSystem.SetRadius(0.025);
	{
		var shape = new box2d.b2PolygonShape();
		shape.SetAsBox(2, 0.4, new box2d.b2Vec2(0, 3.6), 0);
		var pd = new box2d.b2ParticleGroupDef();
		pd.flags = box2d.Testbed.TestMain.GetParticleParameterValue();
		pd.shape = shape;
		var group = this.m_particleSystem.CreateParticleGroup(pd);
		if (pd.flags & box2d.b2ParticleFlag.b2_colorMixingParticle) {
			this.ColorParticleGroup(group, 0);
		}
	}

	{
		var bd = new box2d.b2BodyDef();
		var body = this.m_world.CreateBody(bd);
		var shape = new box2d.b2EdgeShape();
		shape.Set(new box2d.b2Vec2(-2, 3.2), new box2d.b2Vec2(-1.2, 3.2));
		body.CreateFixture(shape, 0.1);
	}

	{
		var bd = new box2d.b2BodyDef();
		var body = this.m_world.CreateBody(bd);
		var shape = new box2d.b2EdgeShape();
		shape.Set(new box2d.b2Vec2(-1.1, 3.2), new box2d.b2Vec2(2, 3.2));
		body.CreateFixture(shape, 0.1);
	}

	{
		var bd = new box2d.b2BodyDef();
		var body = this.m_world.CreateBody(bd);
		var shape = new box2d.b2EdgeShape();
		shape.Set(new box2d.b2Vec2(-1.2, 3.2), new box2d.b2Vec2(-1.2, 2.8));
		body.CreateFixture(shape, 0.1);
	}

	{
		var bd = new box2d.b2BodyDef();
		var body = this.m_world.CreateBody(bd);
		var shape = new box2d.b2EdgeShape();
		shape.Set(new box2d.b2Vec2(-1.1, 3.2), new box2d.b2Vec2(-1.1, 2.8));
		body.CreateFixture(shape, 0.1);
	}

	{
		var bd = new box2d.b2BodyDef();
		var body = this.m_world.CreateBody(bd);
		var shape = new box2d.b2EdgeShape();
		shape.Set(new box2d.b2Vec2(-1.6, 2.4), new box2d.b2Vec2(0.8, 2));
		body.CreateFixture(shape, 0.1);
	}

	{
		var bd = new box2d.b2BodyDef();
		var body = this.m_world.CreateBody(bd);
		var shape = new box2d.b2EdgeShape();
		shape.Set(new box2d.b2Vec2(1.6, 1.6), new box2d.b2Vec2(-0.8, 1.2));
		body.CreateFixture(shape, 0.1);
	}

	{
		var bd = new box2d.b2BodyDef();
		var body = this.m_world.CreateBody(bd);
		var shape = new box2d.b2EdgeShape();
		shape.Set(new box2d.b2Vec2(-1.2, 0.8), new box2d.b2Vec2(-1.2, 0));
		body.CreateFixture(shape, 0.1);
	}

	{
		var bd = new box2d.b2BodyDef();
		var body = this.m_world.CreateBody(bd);
		var shape = new box2d.b2EdgeShape();
		shape.Set(new box2d.b2Vec2(-0.4, 0.8), new box2d.b2Vec2(-0.4, 0));
		body.CreateFixture(shape, 0.1);
	}

	{
		var bd = new box2d.b2BodyDef();
		var body = this.m_world.CreateBody(bd);
		var shape = new box2d.b2EdgeShape();
		shape.Set(new box2d.b2Vec2(0.4, 0.8), new box2d.b2Vec2(0.4, 0));
		body.CreateFixture(shape, 0.1);
	}

	{
		var bd = new box2d.b2BodyDef();
		var body = this.m_world.CreateBody(bd);
		var shape = new box2d.b2EdgeShape();
		shape.Set(new box2d.b2Vec2(1.2, 0.8), new box2d.b2Vec2(1.2, 0));
		body.CreateFixture(shape, 0.1);
	}
}

goog.inherits(box2d.Testbed.LiquidTimer, box2d.Testbed.Test);

/** 
 * @const 
 * @type {Array.<box2d.Testbed.ParticleParameter.Value>}
 */
box2d.Testbed.LiquidTimer.k_paramValues = 
[
	new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_tensileParticle | box2d.b2ParticleFlag.b2_viscousParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "tensile + viscous")
];
/**
 * @const 
 * @type {Array.<box2d.Testbed.ParticleParameter.Definition>} 
 */
box2d.Testbed.LiquidTimer.k_paramDef = 
[
	new box2d.Testbed.ParticleParameter.Definition(box2d.Testbed.LiquidTimer.k_paramValues),
	new box2d.Testbed.ParticleParameter.Definition(box2d.Testbed.ParticleParameter.k_particleTypes)
];
/**
 * @const 
 * @type {number} 
 */
box2d.Testbed.LiquidTimer.k_paramDefCount = box2d.Testbed.LiquidTimer.k_paramDef.length;

/**
 * @export 
 * @return {number}
 */
box2d.Testbed.LiquidTimer.prototype.GetDefaultViewZoom = function ()
{
	return 0.1;
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.LiquidTimer.Create = function (canvas, settings)
{
	return new box2d.Testbed.LiquidTimer(canvas, settings);
}

//#endif

