/*
* Copyright (c) 2014 Google, Inc.
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

goog.provide('box2d.Testbed.Faucet');

goog.require('box2d.Testbed.Test');
goog.require('box2d.Testbed.RadialEmitter');

/** 
 * Faucet test creates a container from boxes and continually 
 * spawning particles with finite lifetimes that pour into the 
 * box. 
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Faucet = function (canvas, settings)
{
	box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

	this.m_emitter = new box2d.Testbed.RadialEmitter();
	this.m_lifetimeRandomizer = new box2d.Testbed.Faucet.ParticleLifetimeRandomizer(box2d.Testbed.Faucet.k_particleLifetimeMin, box2d.Testbed.Faucet.k_particleLifetimeMax)

	// Configure particle system parameters.
	this.m_particleSystem.SetRadius(0.035);
	this.m_particleSystem.SetMaxParticleCount(box2d.Testbed.Faucet.k_maxParticleCount);
	this.m_particleSystem.SetDestructionByAge(true);

	var ground = null;
	{
		var bd = new box2d.b2BodyDef();
		ground = this.m_world.CreateBody(bd);
	}

	// Create the container / trough style sink.
	{
		var shape = new box2d.b2PolygonShape();
		var height = box2d.Testbed.Faucet.k_containerHeight + box2d.Testbed.Faucet.k_containerThickness;
		shape.SetAsBox(box2d.Testbed.Faucet.k_containerWidth - box2d.Testbed.Faucet.k_containerThickness,
					   box2d.Testbed.Faucet.k_containerThickness, new box2d.b2Vec2(0.0, 0.0), 0.0);
		ground.CreateFixture(shape, 0.0);
		shape.SetAsBox(box2d.Testbed.Faucet.k_containerThickness, height,
					   new box2d.b2Vec2(-box2d.Testbed.Faucet.k_containerWidth, box2d.Testbed.Faucet.k_containerHeight), 0.0);
		ground.CreateFixture(shape, 0.0);
		shape.SetAsBox(box2d.Testbed.Faucet.k_containerThickness, height,
					   new box2d.b2Vec2(box2d.Testbed.Faucet.k_containerWidth, box2d.Testbed.Faucet.k_containerHeight), 0.0);
		ground.CreateFixture(shape, 0.0);
	}

	// Create ground under the container to catch overflow.
	{
		var shape = new box2d.b2PolygonShape();
		shape.SetAsBox(box2d.Testbed.Faucet.k_containerWidth * 5.0, box2d.Testbed.Faucet.k_containerThickness,
					   new box2d.b2Vec2(0.0, box2d.Testbed.Faucet.k_containerThickness * -2.0), 0.0);
		ground.CreateFixture(shape, 0.0);
	}

	// Create the faucet spout.
	{
		var shape = new box2d.b2PolygonShape();
		var particleDiameter =
			this.m_particleSystem.GetRadius() * 2.0;
		var faucetLength = box2d.Testbed.Faucet.k_faucetLength * particleDiameter;
		// Dimensions of the faucet in world units.
		var length = faucetLength * box2d.Testbed.Faucet.k_spoutLength;
		var width = box2d.Testbed.Faucet.k_containerWidth * box2d.Testbed.Faucet.k_faucetWidth *
			box2d.Testbed.Faucet.k_spoutWidth;
		// Height from the bottom of the container.
		var height = (box2d.Testbed.Faucet.k_containerHeight * box2d.Testbed.Faucet.k_faucetHeight) +
			(length * 0.5);

		shape.SetAsBox(particleDiameter, length,
					   new box2d.b2Vec2(-width, height), 0.0);
		ground.CreateFixture(shape, 0.0);
		shape.SetAsBox(particleDiameter, length,
					   new box2d.b2Vec2(width, height), 0.0);
		ground.CreateFixture(shape, 0.0);
		shape.SetAsBox(width - particleDiameter, particleDiameter,
					   new box2d.b2Vec2(0.0, height + length -
							  particleDiameter), 0.0);
		ground.CreateFixture(shape, 0.0);
	}

	// Initialize the particle emitter.
	{
		var faucetLength = this.m_particleSystem.GetRadius() * 2.0 * box2d.Testbed.Faucet.k_faucetLength;
		this.m_emitter.SetParticleSystem(this.m_particleSystem);
		this.m_emitter.SetCallback(this.m_lifetimeRandomizer);
		this.m_emitter.SetPosition(new box2d.b2Vec2(
			box2d.Testbed.Faucet.k_containerWidth * box2d.Testbed.Faucet.k_faucetWidth,
			box2d.Testbed.Faucet.k_containerHeight * box2d.Testbed.Faucet.k_faucetHeight + (faucetLength * 0.5)));
		this.m_emitter.SetVelocity(new box2d.b2Vec2(0.0, 0.0));
		this.m_emitter.SetSize(new box2d.b2Vec2(0.0, faucetLength));
		this.m_emitter.SetColor(new box2d.b2ParticleColor(255, 255, 255, 255));
		this.m_emitter.SetEmitRate(120.0);
		this.m_emitter.SetParticleFlags(box2d.Testbed.TestMain.GetParticleParameterValue());
	}

	// Don't restart the test when changing particle types.
	box2d.Testbed.TestMain.SetRestartOnParticleParameterChange(false);
	// Limit the set of particle types.
	box2d.Testbed.TestMain.SetParticleParameters(box2d.Testbed.Faucet.k_paramDef, box2d.Testbed.Faucet.k_paramDefCount);
}

goog.inherits(box2d.Testbed.Faucet, box2d.Testbed.Test);

/** 
 * Used to cycle through particle colors. 
 * @type {number}
 */
box2d.Testbed.Faucet.prototype.m_particleColorOffset = 0.0;
/** 
 * Particle emitter. 
 * @type {box2d.Testbed.RadialEmitter}
 */
box2d.Testbed.Faucet.prototype.m_emitter;
/** 
 * Callback which sets the lifetime of emitted particles. 
 * @type {box2d.Testbed.Faucet.ParticleLifetimeRandomizer}
 */
box2d.Testbed.Faucet.prototype.m_lifetimeRandomizer;

/** 
 * Minimum lifetime of particles in seconds. 
 * @const 
 * @type {number}
 */
box2d.Testbed.Faucet.k_particleLifetimeMin = 30.0;
/** 
 * Maximum lifetime of particles in seconds. 
 * @const 
 * @type {number}
 */
box2d.Testbed.Faucet.k_particleLifetimeMax = 50.0;
/** 
 * Height of the container. 
 * @const 
 * @type {number}
 */
box2d.Testbed.Faucet.k_containerHeight = 0.2;
/** 
 * Width of the container. 
 * @const 
 * @type {number}
 */
box2d.Testbed.Faucet.k_containerWidth = 1.0;
/** 
 * Thickness of the container's walls and bottom. 
 * @const 
 * @type {number}
 */
box2d.Testbed.Faucet.k_containerThickness = 0.05;
/** 
 * Width of the faucet relative to the container width. 
 * @const 
 * @type {number}
 */
box2d.Testbed.Faucet.k_faucetWidth = 0.1;
/** 
 * Height of the faucet relative to the base as a fraction of 
 * the container height. 
 * @const 
 * @type {number}
 */
box2d.Testbed.Faucet.k_faucetHeight = 15.0;
/** 
 * Length of the faucet as a fraction of the particle diameter. 
 * @const 
 * @type {number}
 */
box2d.Testbed.Faucet.k_faucetLength = 2.0;
/** 
 * Spout height as a fraction of the faucet length.  This should 
 * be greater than 1.0f). 
 * @const 
 * @type {number}
 */
box2d.Testbed.Faucet.k_spoutLength = 2.0;
/** 
 * Spout width as a fraction of the *faucet* width.  This should 
 * be greater than 1.0). 
 * @const 
 * @type {number}
 */
box2d.Testbed.Faucet.k_spoutWidth = 1.1;
/** 
 * Maximum number of particles in the system. 
 * @const 
 * @type {number}
 */
box2d.Testbed.Faucet.k_maxParticleCount = 1000;
/** 
 * Factor that is used to increase / decrease the emit rate. 
 * This should be greater than 1.0. 
 * @const 
 * @type {number}
 */
box2d.Testbed.Faucet.k_emitRateChangeFactor = 1.05;
/** 
 * Minimum emit rate of the faucet in particles per second. 
 * @const 
 * @type {number}
 */
box2d.Testbed.Faucet.k_emitRateMin = 1.0;
/** 
 * Maximum emit rate of the faucet in particles per second. 
 * @const 
 * @type {number}
 */
box2d.Testbed.Faucet.k_emitRateMax = 240.0;

/** 
 * Selection of particle types for this test. 
 * @const 
 * @type {Array.<box2d.Testbed.ParticleParameter.Value>}
 */
box2d.Testbed.Faucet.k_paramValues = 
[
	new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_waterParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "water"),
	new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_waterParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions | box2d.Testbed.ParticleParameter.Options.OptionStrictContacts, "water (strict)"),
	new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_viscousParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "viscous"),
	new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_powderParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "powder"),
	new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_tensileParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "tensile"),
	new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_colorMixingParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "color mixing"),
	new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_staticPressureParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "static pressure")
];
/**
 * @const 
 * @type {Array.<box2d.Testbed.ParticleParameter.Definition>} 
 */
box2d.Testbed.Faucet.k_paramDef = 
[
	new box2d.Testbed.ParticleParameter.Definition(box2d.Testbed.Faucet.k_paramValues)
];
/**
 * @const 
 * @type {number} 
 */
box2d.Testbed.Faucet.k_paramDefCount = box2d.Testbed.Faucet.k_paramDef.length;

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Faucet.prototype.Step = function (settings)
{
	var dt = 1.0 / settings.hz;
	box2d.Testbed.Test.prototype.Step.call(this, settings);
	this.m_particleColorOffset += dt;
	// Keep m_particleColorOffset in the range 0.0f..k_ParticleColorsCount.
	if (this.m_particleColorOffset >= box2d.Testbed.Test.k_ParticleColorsCount)
	{
		this.m_particleColorOffset -= box2d.Testbed.Test.k_ParticleColorsCount;
	}

	// Propagate the currently selected particle flags.
	this.m_emitter.SetParticleFlags(box2d.Testbed.TestMain.GetParticleParameterValue());

	// If this is a color mixing particle, add some color.
	///	b2ParticleColor color(255, 255, 255, 255);
	if (this.m_emitter.GetParticleFlags() & box2d.b2ParticleFlag.b2_colorMixingParticle)
	{
		// Each second, select a different color.
		this.m_emitter.SetColor(box2d.Testbed.Test.k_ParticleColors[Math.floor(this.m_particleColorOffset) % box2d.Testbed.Test.k_ParticleColorsCount]);
	}
	else
	{
		this.m_emitter.SetColor(new box2d.b2ParticleColor(255, 255, 255, 255));
	}

	// Create the particles.
	this.m_emitter.Step(dt);

	var k_keys = [
		"Keys: (w) water, (q) powder",
		"      (t) tensile, (v) viscous",
		"      (c) color mixing, (s) static pressure",
		"      (+) increase flow, (-) decrease flow",
	];
	for (var i = 0; i < k_keys.length; ++i)
	{
		this.m_debugDraw.DrawString(5, this.m_textLine, k_keys[i]);
		this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
	}
}

/**
 * @export 
 * @return {void} 
 * @param {number} key 
 */
box2d.Testbed.Faucet.prototype.Keyboard = function (key)
{
	var parameter = 0;
	switch (key)
	{
	case goog.events.KeyCodes.W:
		parameter = box2d.b2ParticleFlag.b2_waterParticle;
		break;
	case goog.events.KeyCodes.Q:
		parameter = box2d.b2ParticleFlag.b2_powderParticle;
		break;
	case goog.events.KeyCodes.T:
		parameter = box2d.b2ParticleFlag.b2_tensileParticle;
		break;
	case goog.events.KeyCodes.V:
		parameter = box2d.b2ParticleFlag.b2_viscousParticle;
		break;
	case goog.events.KeyCodes.C:
		parameter = box2d.b2ParticleFlag.b2_colorMixingParticle;
		break;
	case goog.events.KeyCodes.S:
		parameter = box2d.b2ParticleFlag.b2_staticPressureParticle;
		break;
	case goog.events.KeyCodes.EQUALS:
		//if (this.m_shift)
		{
			var emitRate = this.m_emitter.GetEmitRate();
			emitRate *= box2d.Testbed.Faucet.k_emitRateChangeFactor;
			emitRate = box2d.b2Max(emitRate, box2d.Testbed.Faucet.k_emitRateMin);
			this.m_emitter.SetEmitRate(emitRate);
		}
		break;
	case goog.events.KeyCodes.DASH:
		//if (!this.shift)
		{
			var emitRate = this.m_emitter.GetEmitRate();
			emitRate *= 1.0 / box2d.Testbed.Faucet.k_emitRateChangeFactor;
			emitRate = box2d.b2Min(emitRate, box2d.Testbed.Faucet.k_emitRateMax);
			this.m_emitter.SetEmitRate(emitRate);
		}
		break;
	default:
		// Nothing.
		return;
	}
	box2d.Testbed.TestMain.SetParticleParameterValue(parameter);
}

/**
 * @export 
 * @return {number} 
 */
box2d.Testbed.Faucet.prototype.GetDefaultViewZoom = function ()
{
	return 0.1;
}

/**
 * @constructor 
 * @extends {box2d.Testbed.EmittedParticleCallback} 
 * @param {number} minLifetime 
 * @param {number} maxLifetime 
 */
box2d.Testbed.Faucet.ParticleLifetimeRandomizer = function (minLifetime, maxLifetime)
{
	this.m_minLifetime = minLifetime;
	this.m_maxLifetime = maxLifetime;
}

goog.inherits(box2d.Testbed.Faucet.ParticleLifetimeRandomizer, box2d.Testbed.EmittedParticleCallback);

/**
 * @type {number}
 */
box2d.Testbed.Faucet.ParticleLifetimeRandomizer.prototype.m_minLifetime = 0.0;

/**
 * @type {number}
 */
box2d.Testbed.Faucet.ParticleLifetimeRandomizer.prototype.m_maxLifetime = 0.0;

/** 
 * Called for each created particle. 
 * @return {void} 
 * @param {box2d.b2ParticleSystem} system 
 * @param {number} particleIndex 
 */
box2d.Testbed.Faucet.ParticleLifetimeRandomizer.prototype.ParticleCreated = function (system, particleIndex)
{
	system.SetParticleLifetime(particleIndex, Math.random() * (this.m_maxLifetime - this.m_minLifetime) + this.m_minLifetime);
}

/** 
 * Create the faucet test. 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Faucet.Create = function (canvas, settings)
{
	return new box2d.Testbed.Faucet(canvas, settings);
}

//#endif

