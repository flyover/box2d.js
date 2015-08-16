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

goog.provide('box2d.Testbed.Test');
goog.provide('box2d.Testbed.DestructionListener');

goog.require('box2d');
goog.require('box2d.Testbed.DebugDraw');

//#if B2_ENABLE_PARTICLE
goog.require('box2d.Testbed.ParticleParameter');
//#endif

/** 
 * @export 
 * @define {number}
 */
box2d.Testbed.DRAW_STRING_NEW_LINE = 25;

/** 
 * Random floating point number in range [lo, hi] 
 * @return {number}
 * @param {number=} lo 
 * @param {number=} hi 
 */
box2d.Testbed.RandomFloat = function (lo, hi)
{
	lo = (typeof(lo) === 'number')?(lo):(-1);
	hi = (typeof(hi) === 'number')?(hi):(1);
	var r = Math.random();
	r = (hi - lo) * r + lo;
	return r;
}

/** 
 * Test settings. Some can be controlled in the GUI. 
 * @export 
 * @constructor
 */
box2d.Testbed.Settings = function ()
{
	this.viewCenter = new box2d.b2Vec2(0, 20);
	this.viewRotation = new box2d.b2Rot(box2d.b2DegToRad(0));

//#if B2_ENABLE_PARTICLE
	// Particle iterations are needed for numerical stability in particle
	// simulations with small particles and relatively high gravity.
	// b2CalculateParticleIterations helps to determine the number.
	this.particleIterations = box2d.b2CalculateParticleIterations(10, 0.04, 1 / this.hz);
//#endif
}

/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.Settings.prototype.canvasScale = 10;
/**
 * @export
 * @type {number} 
 */
box2d.Testbed.Settings.prototype.viewZoom = 1;
/**
 * @export
 * @type {box2d.b2Vec2} 
 */
box2d.Testbed.Settings.prototype.viewCenter = null;
/**
 * @export 
 * @type {box2d.b2Rot} 
 */
box2d.Testbed.Settings.prototype.viewRotation = null;
/**
 * @export
 * @type {number} 
 */
box2d.Testbed.Settings.prototype.hz = 60;
/**
 * @export
 * @type {number} 
 */
box2d.Testbed.Settings.prototype.velocityIterations = 8;
/**
 * @export
 * @type {number} 
 */
box2d.Testbed.Settings.prototype.positionIterations = 3;
//#if B2_ENABLE_PARTICLE
/**
 * @export
 * @type {number} 
 */
box2d.Testbed.Settings.prototype.particleIterations = 1;
//#endif
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.drawShapes = true;
//#if B2_ENABLE_PARTICLE
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.drawParticles = true;
//#endif
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.drawJoints = true;
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.drawAABBs = false;
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.drawContactPoints = false;
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.drawContactNormals = false;
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.drawContactImpulse = false;
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.drawFrictionImpulse = false;
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.drawCOMs = false;
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.drawControllers = true;
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.drawStats = false;
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.drawProfile = false;
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.enableWarmStarting = true;
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.enableContinuous = true;
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.enableSubStepping = false;
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.enableSleep = true;
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.pause = false;
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.singleStep = false;
//#if B2_ENABLE_PARTICLE
/**
 * @export
 * @type {boolean} 
 */
box2d.Testbed.Settings.prototype.strictContacts = false;
//#endif

/**
 * @export 
 * @constructor
 * @param {string} name
 * @param {function(HTMLCanvasElement, box2d.Testbed.Settings): 
 *  	  box2d.Testbed.Test} createFcn
 */
box2d.Testbed.TestEntry = function (name, createFcn)
{
	this.name = name;
	this.createFcn = createFcn;
}

/**
 * @export 
 * @type {string} 
 */
box2d.Testbed.TestEntry.prototype.name = "unknown";
/**
 * @export 
 * @type {function(HTMLCanvasElement, box2d.Testbed.Settings): 
 *  	 box2d.Testbed.Test} createFcn
 */
box2d.Testbed.TestEntry.prototype.createFcn = function (canvas, settings) {};

/** 
 * This is called when a joint in the world is implicitly 
 * destroyed because an attached body is destroyed. This gives 
 * us a chance to nullify the mouse joint. 
 * @export 
 * @constructor
 * @extends box2d.b2DestructionListener
 * @param {box2d.Testbed.Test} test 
 */
box2d.Testbed.DestructionListener = function (test)
{
	box2d.b2DestructionListener.call(this); // base class constructor

	this.test = test;
}

goog.inherits(box2d.Testbed.DestructionListener, box2d.b2DestructionListener);

/**
 * @export 
 * @type {box2d.Testbed.Test} 
 */
box2d.Testbed.DestructionListener.prototype.test = null;

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2Joint} joint
 */
box2d.Testbed.DestructionListener.prototype.SayGoodbyeJoint = function (joint)
{
	if (this.test.m_mouseJoint === joint)
	{
		this.test.m_mouseJoint = null;
	}
	else
	{
		this.test.JointDestroyed(joint);
	}
}

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2Fixture} fixture 
 */
box2d.Testbed.DestructionListener.prototype.SayGoodbyeFixture = function (fixture)
{
}

//#if B2_ENABLE_PARTICLE

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2ParticleGroup} group 
 */
box2d.Testbed.DestructionListener.prototype.SayGoodbyeParticleGroup = function (group)
{
	this.test.ParticleGroupDestroyed(group);
}

//#endif

/**
 * @export 
 * @constructor
 */
box2d.Testbed.ContactPoint = function ()
{
	this.normal = new box2d.b2Vec2();
	this.position = new box2d.b2Vec2();
};

/**
 * @export 
 * @type {box2d.b2Fixture} 
 */
box2d.Testbed.ContactPoint.prototype.fixtureA = null;
/**
 * @export 
 * @type {box2d.b2Fixture} 
 */
box2d.Testbed.ContactPoint.prototype.fixtureB = null;
/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.Testbed.ContactPoint.prototype.normal = new box2d.b2Vec2();
/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.Testbed.ContactPoint.prototype.position = new box2d.b2Vec2();
/**
 * @export 
 * @type {box2d.b2PointState} 
 */
box2d.Testbed.ContactPoint.prototype.state = box2d.b2PointState.b2_nullState;
/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.ContactPoint.prototype.normalImpulse = 0;
/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.ContactPoint.prototype.tangentImpulse = 0;
/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.ContactPoint.prototype.separation = 0;

/**
 * @export 
 * @constructor
 * @extends {box2d.b2ContactListener} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Test = function (canvas, settings)
{
	box2d.b2ContactListener.call(this); // base class constructor

//#if B2_ENABLE_PARTICLE
	var particleSystemDef = new box2d.b2ParticleSystemDef();
//#endif
	var gravity = new box2d.b2Vec2(0, -10);
	this.m_world = new box2d.b2World(gravity);
//#if B2_ENABLE_PARTICLE
	this.m_particleSystem = this.m_world.CreateParticleSystem(particleSystemDef);
//#endif
	this.m_bomb = null;
	this.m_textLine = 30;
	this.m_mouseJoint = null;
	this.m_points = new Array(box2d.Testbed.Test.k_maxContactPoints);
	for (var i = 0; i < box2d.Testbed.Test.k_maxContactPoints; ++i)
	{
		this.m_points[i] = new box2d.Testbed.ContactPoint();
	}
	this.m_pointCount = 0;

	this.m_destructionListener = new box2d.Testbed.DestructionListener(this);
	this.m_world.SetDestructionListener(this.m_destructionListener);
	this.m_world.SetContactListener(this);
	this.m_debugDraw = new box2d.Testbed.DebugDraw(canvas, settings);
	this.m_world.SetDebugDraw(this.m_debugDraw);

//#if B2_ENABLE_PARTICLE
	this.m_particleSystem.SetGravityScale(0.4);
	this.m_particleSystem.SetDensity(1.2);
//#endif

	this.m_bombSpawnPoint = new box2d.b2Vec2();
	this.m_bombSpawning = false;
	this.m_mouseWorld = new box2d.b2Vec2();
//#if B2_ENABLE_PARTICLE
	this.m_mouseTracing = false;
	this.m_mouseTracerPosition = new box2d.b2Vec2();
	this.m_mouseTracerVelocity = new box2d.b2Vec2();
//#endif

	this.m_stepCount = 0;

	this.m_maxProfile = new box2d.b2Profile();
	this.m_totalProfile = new box2d.b2Profile();

	var bodyDef = new box2d.b2BodyDef();
	this.m_groundBody = this.m_world.CreateBody(bodyDef);
}

goog.inherits(box2d.Testbed.Test, box2d.b2ContactListener);

/**
 * @export 
 * @const 
 * @type {number} 
 */
box2d.Testbed.Test.k_maxContactPoints = 2048;

/**
 * @export 
 * @type {box2d.b2World} 
 */
box2d.Testbed.Test.prototype.m_world = null;
//#if B2_ENABLE_PARTICLE
/**
 * @export 
 * @type {box2d.b2ParticleSystem} 
 */
box2d.Testbed.Test.prototype.m_particleSystem = null;
//#endif
/**
 * @export 
 * @type {box2d.b2Body} 
 */
box2d.Testbed.Test.prototype.m_bomb = null;
/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.Test.prototype.m_textLine = 30;
/**
 * @export 
 * @type {box2d.b2Joint} 
 */
box2d.Testbed.Test.prototype.m_mouseJoint = null;
/**
 * @export 
 * @type {Array.<box2d.Testbed.ContactPoint>} 
 */
box2d.Testbed.Test.prototype.m_points = null;
/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.Test.prototype.m_pointCount = 0;
/**
 * @export 
 * @type {box2d.Testbed.DestructionListener} 
 */
box2d.Testbed.Test.prototype.m_destructionListener = null;
/**
 * @export 
 * @type {box2d.Testbed.DebugDraw} 
 */
box2d.Testbed.Test.prototype.m_debugDraw = null;
/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.Testbed.Test.prototype.m_bombSpawnPoint = null;
/**
 * @export 
 * @type {boolean} 
 */
box2d.Testbed.Test.prototype.m_bombSpawning = false;
/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.Testbed.Test.prototype.m_mouseWorld = null;

//#if B2_ENABLE_PARTICLE

/**
 * @export 
 * @type {boolean} 
 */
box2d.Testbed.Test.prototype.m_mouseTracing = false;

/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.Testbed.Test.prototype.m_mouseTracerPosition = null;

/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.Testbed.Test.prototype.m_mouseTracerVelocity = null;

//#endif

/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.Test.prototype.m_stepCount = 0;
/**
 * @export 
 * @type {box2d.b2Profile} 
 */
box2d.Testbed.Test.prototype.m_maxProfile = null;
/**
 * @export 
 * @type {box2d.b2Profile} 
 */
box2d.Testbed.Test.prototype.m_totalProfile = null;
/**
 * @export 
 * @type {box2d.b2Body} 
 */
box2d.Testbed.Test.prototype.m_groundBody = null;

//#if B2_ENABLE_PARTICLE

/** 
 * Valid particle parameters for this test. 
 * @export 
 * @type {Array.<box2d.Testbed.ParticleParameter.Value>}
 */
box2d.Testbed.Test.prototype.m_particleParameters = null;
/** 
 * @export 
 * @type {box2d.Testbed.ParticleParameter.Definition}
 */
box2d.Testbed.Test.prototype.m_particleParameterDef = null;

//#endif

/** 
 * Let derived tests know that a joint was destroyed. 
 * @export 
 * @return {void} 
 * @param {box2d.b2Joint} joint 
 */
box2d.Testbed.Test.prototype.JointDestroyed = function (joint)
{
}

//#if B2_ENABLE_PARTICLE

/** 
 * Let derived tests know that a particle group was destroyed. 
 * @export 
 * @return {void} 
 * @param {box2d.b2ParticleGroup} group 
 */
box2d.Testbed.Test.prototype.ParticleGroupDestroyed = function (group)
{
}

//#endif

/** 
 * Callbacks for derived classes. 
 * @export 
 * @return {void} 
 * @param {box2d.b2Contact} contact 
 */
box2d.Testbed.Test.prototype.BeginContact = function (contact)
{
}

/**
 * @export
 * @return {void} 
 * @param {box2d.b2Contact} contact 
 */
box2d.Testbed.Test.prototype.EndContact = function (contact)
{
}

/**
 * @export
 * @return {void} 
 * @param {box2d.b2Contact} contact 
 * @param {box2d.b2Manifold} oldManifold 
 */
box2d.Testbed.Test.prototype.PreSolve = function (contact, oldManifold)
{
	var manifold = contact.GetManifold();

	if (manifold.pointCount === 0)
	{
		return;
	}

	var fixtureA = contact.GetFixtureA();
	var fixtureB = contact.GetFixtureB();

	var state1 = box2d.Testbed.Test.prototype.PreSolve.s_state1;
	var state2 = box2d.Testbed.Test.prototype.PreSolve.s_state2;
	box2d.b2GetPointStates(state1, state2, oldManifold, manifold);

	var worldManifold = box2d.Testbed.Test.prototype.PreSolve.s_worldManifold;
	contact.GetWorldManifold(worldManifold);

	for (var i = 0; i < manifold.pointCount && this.m_pointCount < box2d.Testbed.Test.k_maxContactPoints; ++i)
	{
		var cp = this.m_points[this.m_pointCount];
		cp.fixtureA = fixtureA;
		cp.fixtureB = fixtureB;
		cp.position.Copy(worldManifold.points[i]);
		cp.normal.Copy(worldManifold.normal);
		cp.state = state2[i];
		cp.normalImpulse = manifold.points[i].normalImpulse;
		cp.tangentImpulse = manifold.points[i].tangentImpulse;
		cp.separation = worldManifold.separations[i];
		++this.m_pointCount;
	}
}
box2d.Testbed.Test.prototype.PreSolve.s_state1 = new Array(box2d.b2_maxManifoldPoints);
box2d.Testbed.Test.prototype.PreSolve.s_state2 = new Array(box2d.b2_maxManifoldPoints);
box2d.Testbed.Test.prototype.PreSolve.s_worldManifold = new box2d.b2WorldManifold();

/**
 * @export
 * @return {void} 
 * @param {box2d.b2Contact} contact 
 * @param {box2d.b2ContactImpulse} impulse 
 */
box2d.Testbed.Test.prototype.PostSolve = function (contact, impulse)
{
}

/**
 * @export 
 * @return {void} 
 * @param {number} key 
 */
box2d.Testbed.Test.prototype.Keyboard = function (key)
{
}

/**
 * @export
 * @return {void} 
 * @param {number} key 
 */
box2d.Testbed.Test.prototype.KeyboardUp = function (key)
{
}

/**
 * @export
 * @return {void} 
 * @param {number} line 
 */
box2d.Testbed.Test.prototype.SetTextLine = function (line)
{
	this.m_textLine = line;
}

/**
 * @export
 * @return {void} 
 * @param {string} string 
 */
box2d.Testbed.Test.prototype.DrawTitle = function (string)
{
	this.m_debugDraw.DrawString(5, box2d.Testbed.DRAW_STRING_NEW_LINE, string);
	this.m_textLine = 2 * box2d.Testbed.DRAW_STRING_NEW_LINE;
}

/**
 * @constructor 
 * @extends {box2d.b2QueryCallback} 
 * @param {box2d.b2Vec2} point 
 */
box2d.Testbed.Test.QueryCallback = function (point)
{
	this.m_point = point;
}

goog.inherits(box2d.Testbed.Test.QueryCallback, box2d.b2QueryCallback);

/**
 * @type {box2d.b2Vec2}
 */
box2d.Testbed.Test.QueryCallback.prototype.m_point = null;

/**
 * @type {box2d.b2Fixture}
 */
box2d.Testbed.Test.QueryCallback.prototype.m_fixture = null;

/** 
 * @return {boolean}
 * @param {box2d.b2Fixture} fixture 
 */
box2d.Testbed.Test.QueryCallback.prototype.ReportFixture = function (fixture)
{
	var body = fixture.GetBody();
	if (body.GetType() === box2d.b2BodyType.b2_dynamicBody)
	{
		var inside = fixture.TestPoint(this.m_point);
		if (inside)
		{
			this.m_fixture = fixture;

			// We are done, terminate the query.
			return false;
		}
	}

	// Continue the query.
	return true;
}

//#if B2_ENABLE_PARTICLE

/**
 * @constructor 
 * @extends {box2d.b2QueryCallback} 
 */
box2d.Testbed.Test.QueryCallback2 = function (particleSystem, shape, velocity)
{
	this.m_particleSystem = particleSystem;
	this.m_shape = shape;
	this.m_velocity = velocity;
}

goog.inherits(box2d.Testbed.Test.QueryCallback2, box2d.b2QueryCallback);

/**
 * @type {box2d.b2ParticleSystem}
 */
box2d.Testbed.Test.QueryCallback2.prototype.m_particleSystem = null;

/**
 * @type {box2d.b2Shape}
 */
box2d.Testbed.Test.QueryCallback2.prototype.m_shape = null;

/**
 * @type {box2d.b2Vec2}
 */
box2d.Testbed.Test.QueryCallback2.prototype.m_velocity = null;

/** 
 * @return {boolean}
 * @param {box2d.b2Fixture} fixture 
 */
box2d.Testbed.Test.QueryCallback2.prototype.ReportFixture = function (fixture)
{
	return false;
}

/**
 * @return {boolean} 
 * @param {box2d.b2ParticleSystem} particleSystem 
 * @param {number} index 
 */
box2d.Testbed.Test.QueryCallback2.prototype.ReportParticle = function (particleSystem, index)
{
	if (particleSystem !== this.m_particleSystem)
		return false;

	///	b2Transform xf;
	///	xf.SetIdentity();
	var xf = box2d.b2Transform.IDENTITY;
	var p = this.m_particleSystem.GetPositionBuffer()[index];
	if (this.m_shape.TestPoint(xf, p))
	{
		var v = this.m_particleSystem.GetVelocityBuffer()[index];
		///	v = m_velocity;
		v.Copy(this.m_velocity);
	}
	return true;
}

//#endif

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2Vec2} p 
 */
box2d.Testbed.Test.prototype.MouseDown = function (p)
{
	this.m_mouseWorld.Copy(p);
//#if B2_ENABLE_PARTICLE
	this.m_mouseTracing = true;
	this.m_mouseTracerPosition.Copy(p);
	this.m_mouseTracerVelocity.SetZero();
//#endif

	if (this.m_mouseJoint !== null)
	{
		return;
	}

	// Make a small box.
	var aabb = new box2d.b2AABB();
	var d = new box2d.b2Vec2();
	d.Set(0.001, 0.001);
	box2d.b2Sub_V2_V2(p, d, aabb.lowerBound);
	box2d.b2Add_V2_V2(p, d, aabb.upperBound);

	// Query the world for overlapping shapes.
	var callback = new box2d.Testbed.Test.QueryCallback(this.m_mouseWorld);
	this.m_world.QueryAABB(callback, aabb);

	if (callback.m_fixture)
	{
		var body = callback.m_fixture.GetBody();
		var md = new box2d.b2MouseJointDef();
		md.bodyA = this.m_groundBody;
		md.bodyB = body;
		md.target.Copy(p);
		md.maxForce = 1000 * body.GetMass();
		this.m_mouseJoint = this.m_world.CreateJoint(md);
		body.SetAwake(true);
	}
}

/**
 * @export
 * @return {void} 
 * @param {box2d.b2Vec2} worldPt 
 */
box2d.Testbed.Test.prototype.SpawnBomb = function (worldPt)
{
	this.m_bombSpawnPoint.Copy(worldPt);
	this.m_bombSpawning = true;
}

/**
 * @export
 * @return {void} 
 * @param {box2d.b2Vec2} p 
 */
box2d.Testbed.Test.prototype.CompleteBombSpawn = function (p)
{
	if (!this.m_bombSpawning)
	{
		return;
	}

	var multiplier = 30;
	var vel = box2d.b2Sub_V2_V2(this.m_bombSpawnPoint, p, new box2d.b2Vec2());
	vel.SelfMul(multiplier);
	this.LaunchBombAt(this.m_bombSpawnPoint, vel);
	this.m_bombSpawning = false;
}

/**
 * @export
 * @return {void} 
 * @param {box2d.b2Vec2} p 
 */
box2d.Testbed.Test.prototype.ShiftMouseDown = function (p)
{
	this.m_mouseWorld.Copy(p);

	if (this.m_mouseJoint !== null)
	{
		return;
	}

	this.SpawnBomb(p);
}

/**
 * @export
 * @return {void} 
 * @param {box2d.b2Vec2} p 
 */
box2d.Testbed.Test.prototype.MouseUp = function (p)
{
//#if B2_ENABLE_PARTICLE
	this.m_mouseTracing = false;
//#endif

	if (this.m_mouseJoint)
	{
		this.m_world.DestroyJoint(this.m_mouseJoint);
		this.m_mouseJoint = null;
	}

	if (this.m_bombSpawning)
	{
		this.CompleteBombSpawn(p);
	}
}

/**
 * @export
 * @return {void} 
 * @param {box2d.b2Vec2} p 
 */
box2d.Testbed.Test.prototype.MouseMove = function (p)
{
	this.m_mouseWorld.Copy(p);

	if (this.m_mouseJoint)
	{
		this.m_mouseJoint.SetTarget(p);
	}
}

/**
 * @export
 * @return {void} 
 */
box2d.Testbed.Test.prototype.LaunchBomb = function ()
{
	var p = new box2d.b2Vec2(box2d.b2RandomRange(-15, 15), 30);
	var v = box2d.b2Mul_S_V2(-5, p, new box2d.b2Vec2());
	this.LaunchBombAt(p, v);
}

/**
 * @export
 * @return {void} 
 * @param {box2d.b2Vec2} position 
 * @param {box2d.b2Vec2} velocity 
 */
box2d.Testbed.Test.prototype.LaunchBombAt = function (position, velocity)
{
	if (this.m_bomb)
	{
		this.m_world.DestroyBody(this.m_bomb);
		this.m_bomb = null;
	}

	var bd = new box2d.b2BodyDef();
	bd.type = box2d.b2BodyType.b2_dynamicBody;
	bd.position.Copy(position);
	bd.bullet = true;
	this.m_bomb = this.m_world.CreateBody(bd);
	this.m_bomb.SetLinearVelocity(velocity);

	var circle = new box2d.b2CircleShape();
	circle.m_radius = 0.3;

	var fd = new box2d.b2FixtureDef();
	fd.shape = circle;
	fd.density = 20;
	fd.restitution = 0;

//	box2d.b2Vec2 minV = position - box2d.b2Vec2(0.3f,0.3f);
//	box2d.b2Vec2 maxV = position + box2d.b2Vec2(0.3f,0.3f);

//	box2d.b2AABB aabb;
//	aabb.lowerBound = minV;
//	aabb.upperBound = maxV;

	this.m_bomb.CreateFixture(fd);
}

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Test.prototype.Step = function (settings)
{
	var timeStep = settings.hz > 0 ? 1 / settings.hz : 0;

	if (settings.pause)
	{
		if (settings.singleStep)
		{
			settings.singleStep = false;
		}
		else
		{
			timeStep = 0;
		}

		this.m_debugDraw.DrawString(5, this.m_textLine, "****PAUSED****");
		this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
	}

	var flags = box2d.b2DrawFlags.e_none;
	if (settings.drawShapes)      { flags |= box2d.b2DrawFlags.e_shapeBit;        }
//#if B2_ENABLE_PARTICLE
	if (settings.drawParticles)   { flags |= box2d.b2DrawFlags.e_particleBit;     }
//#endif
	if (settings.drawJoints)      { flags |= box2d.b2DrawFlags.e_jointBit;        }
	if (settings.drawAABBs )      { flags |= box2d.b2DrawFlags.e_aabbBit;         }
	if (settings.drawCOMs  )      { flags |= box2d.b2DrawFlags.e_centerOfMassBit; }
	if (settings.drawControllers) { flags |= box2d.b2DrawFlags.e_controllerBit;   }
	this.m_debugDraw.SetFlags(flags);

	this.m_world.SetAllowSleeping(settings.enableSleep);
	this.m_world.SetWarmStarting(settings.enableWarmStarting);
	this.m_world.SetContinuousPhysics(settings.enableContinuous);
	this.m_world.SetSubStepping(settings.enableSubStepping);
//#if B2_ENABLE_PARTICLE
	this.m_particleSystem.SetStrictContactCheck(settings.strictContacts);
//#endif

	this.m_pointCount = 0;

//#if B2_ENABLE_PARTICLE
	this.m_world.Step(timeStep, settings.velocityIterations, settings.positionIterations, settings.particleIterations);
// #else
//	this.m_world.Step(timeStep, settings.velocityIterations, settings.positionIterations);
//#endif

	this.m_world.DrawDebugData();

	if (timeStep > 0)
	{
		++this.m_stepCount;
	}

	if (settings.drawStats)
	{
		var bodyCount = this.m_world.GetBodyCount();
		var contactCount = this.m_world.GetContactCount();
		var jointCount = this.m_world.GetJointCount();
		this.m_debugDraw.DrawString(5, this.m_textLine, "bodies/contacts/joints = %d/%d/%d", bodyCount, contactCount, jointCount);
		this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;

//#if B2_ENABLE_PARTICLE
		var particleCount = this.m_particleSystem.GetParticleCount();
		var groupCount = this.m_particleSystem.GetParticleGroupCount();
		var pairCount = this.m_particleSystem.GetPairCount();
		var triadCount = this.m_particleSystem.GetTriadCount();
		this.m_debugDraw.DrawString(5, this.m_textLine, "particles/groups/pairs/triads = %d/%d/%d/%d", particleCount, groupCount, pairCount, triadCount);
		this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
//#endif

		var proxyCount = this.m_world.GetProxyCount();
		var height = this.m_world.GetTreeHeight();
		var balance = this.m_world.GetTreeBalance();
		var quality = this.m_world.GetTreeQuality();
		this.m_debugDraw.DrawString(5, this.m_textLine, "proxies/height/balance/quality = %d/%d/%d/%4.2f", proxyCount, height, balance, quality);
		this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
	}

	// Track maximum profile times
	{
		var p = this.m_world.GetProfile();
		this.m_maxProfile.step = box2d.b2Max(this.m_maxProfile.step, p.step);
		this.m_maxProfile.collide = box2d.b2Max(this.m_maxProfile.collide, p.collide);
		this.m_maxProfile.solve = box2d.b2Max(this.m_maxProfile.solve, p.solve);
		this.m_maxProfile.solveInit = box2d.b2Max(this.m_maxProfile.solveInit, p.solveInit);
		this.m_maxProfile.solveVelocity = box2d.b2Max(this.m_maxProfile.solveVelocity, p.solveVelocity);
		this.m_maxProfile.solvePosition = box2d.b2Max(this.m_maxProfile.solvePosition, p.solvePosition);
		this.m_maxProfile.solveTOI = box2d.b2Max(this.m_maxProfile.solveTOI, p.solveTOI);
		this.m_maxProfile.broadphase = box2d.b2Max(this.m_maxProfile.broadphase, p.broadphase);

		this.m_totalProfile.step += p.step;
		this.m_totalProfile.collide += p.collide;
		this.m_totalProfile.solve += p.solve;
		this.m_totalProfile.solveInit += p.solveInit;
		this.m_totalProfile.solveVelocity += p.solveVelocity;
		this.m_totalProfile.solvePosition += p.solvePosition;
		this.m_totalProfile.solveTOI += p.solveTOI;
		this.m_totalProfile.broadphase += p.broadphase;
	}

	if (settings.drawProfile)
	{
		var p = this.m_world.GetProfile();

		var aveProfile = new box2d.b2Profile();
		if (this.m_stepCount > 0)
		{
			var scale = 1 / this.m_stepCount;
			aveProfile.step = scale * this.m_totalProfile.step;
			aveProfile.collide = scale * this.m_totalProfile.collide;
			aveProfile.solve = scale * this.m_totalProfile.solve;
			aveProfile.solveInit = scale * this.m_totalProfile.solveInit;
			aveProfile.solveVelocity = scale * this.m_totalProfile.solveVelocity;
			aveProfile.solvePosition = scale * this.m_totalProfile.solvePosition;
			aveProfile.solveTOI = scale * this.m_totalProfile.solveTOI;
			aveProfile.broadphase = scale * this.m_totalProfile.broadphase;
		}

		this.m_debugDraw.DrawString(5, this.m_textLine, "step [ave] (max) = %5.2f [%6.2f] (%6.2f)", p.step, aveProfile.step, this.m_maxProfile.step);
		this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
		this.m_debugDraw.DrawString(5, this.m_textLine, "collide [ave] (max) = %5.2f [%6.2f] (%6.2f)", p.collide, aveProfile.collide, this.m_maxProfile.collide);
		this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
		this.m_debugDraw.DrawString(5, this.m_textLine, "solve [ave] (max) = %5.2f [%6.2f] (%6.2f)", p.solve, aveProfile.solve, this.m_maxProfile.solve);
		this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
		this.m_debugDraw.DrawString(5, this.m_textLine, "solve init [ave] (max) = %5.2f [%6.2f] (%6.2f)", p.solveInit, aveProfile.solveInit, this.m_maxProfile.solveInit);
		this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
		this.m_debugDraw.DrawString(5, this.m_textLine, "solve velocity [ave] (max) = %5.2f [%6.2f] (%6.2f)", p.solveVelocity, aveProfile.solveVelocity, this.m_maxProfile.solveVelocity);
		this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
		this.m_debugDraw.DrawString(5, this.m_textLine, "solve position [ave] (max) = %5.2f [%6.2f] (%6.2f)", p.solvePosition, aveProfile.solvePosition, this.m_maxProfile.solvePosition);
		this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
		this.m_debugDraw.DrawString(5, this.m_textLine, "solveTOI [ave] (max) = %5.2f [%6.2f] (%6.2f)", p.solveTOI, aveProfile.solveTOI, this.m_maxProfile.solveTOI);
		this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
		this.m_debugDraw.DrawString(5, this.m_textLine, "broad-phase [ave] (max) = %5.2f [%6.2f] (%6.2f)", p.broadphase, aveProfile.broadphase, this.m_maxProfile.broadphase);
		this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
	}

//#if B2_ENABLE_PARTICLE

	if (this.m_mouseTracing && !this.m_mouseJoint)
	{
		var delay = 0.1;
		///	b2Vec2 acceleration = 2 / delay * (1 / delay * (m_mouseWorld - m_mouseTracerPosition) - m_mouseTracerVelocity);
		var acceleration = new box2d.b2Vec2();
		acceleration.x = 2 / delay * (1 / delay * (this.m_mouseWorld.x - this.m_mouseTracerPosition.x) - this.m_mouseTracerVelocity.x);
		acceleration.y = 2 / delay * (1 / delay * (this.m_mouseWorld.y - this.m_mouseTracerPosition.y) - this.m_mouseTracerVelocity.y);
		///	m_mouseTracerVelocity += timeStep * acceleration;
		this.m_mouseTracerVelocity.SelfMulAdd(timeStep, acceleration);
		///	m_mouseTracerPosition += timeStep * m_mouseTracerVelocity;
		this.m_mouseTracerPosition.SelfMulAdd(timeStep, this.m_mouseTracerVelocity);
		var shape = new box2d.b2CircleShape();
		shape.m_p.Copy(this.m_mouseTracerPosition);
		shape.m_radius = 2 * this.GetDefaultViewZoom();
		///	QueryCallback2 callback(m_particleSystem, &shape, m_mouseTracerVelocity);
		var callback = new box2d.Testbed.Test.QueryCallback2(this.m_particleSystem, shape, this.m_mouseTracerVelocity);
		var aabb = new box2d.b2AABB();
		var xf = new box2d.b2Transform();
		xf.SetIdentity();
		shape.ComputeAABB(aabb, xf, 0);
		this.m_world.QueryAABB(callback, aabb);
	}

//#endif

	if (this.m_mouseJoint)
	{
		var p1 = this.m_mouseJoint.GetAnchorB(new box2d.b2Vec2());
		var p2 = this.m_mouseJoint.GetTarget(new box2d.b2Vec2());

		var c = new box2d.b2Color(0, 1, 0);
		this.m_debugDraw.DrawPoint(p1, 4, c);
		this.m_debugDraw.DrawPoint(p2, 4, c);

		c.SetRGB(0.8, 0.8, 0.8);
		this.m_debugDraw.DrawSegment(p1, p2, c);
	}

	if (this.m_bombSpawning)
	{
		var c = new box2d.b2Color(0, 0, 1);
		this.m_debugDraw.DrawPoint(this.m_bombSpawnPoint, 4, c);

		c.SetRGB(0.8, 0.8, 0.8);
		this.m_debugDraw.DrawSegment(this.m_mouseWorld, this.m_bombSpawnPoint, c);
	}

	if (settings.drawContactPoints)
	{
		var k_impulseScale = 0.1;
		var k_axisScale = 0.3;

		for (var i = 0; i < this.m_pointCount; ++i)
		{
			var point = this.m_points[i];

			if (point.state === box2d.b2PointState.b2_addState)
			{
				// Add
				this.m_debugDraw.DrawPoint(point.position, 10, new box2d.b2Color(0.3, 0.95, 0.3));
			}
			else if (point.state === box2d.b2PointState.b2_persistState)
			{
				// Persist
				this.m_debugDraw.DrawPoint(point.position, 5, new box2d.b2Color(0.3, 0.3, 0.95));
			}

			if (settings.drawContactNormals)
			{
				var p1 = point.position;
				var p2 = box2d.b2Add_V2_V2(p1, box2d.b2Mul_S_V2(k_axisScale, point.normal, box2d.b2Vec2.s_t0), new box2d.b2Vec2());
				this.m_debugDraw.DrawSegment(p1, p2, new box2d.b2Color(0.9, 0.9, 0.9));
			}
			else if (settings.drawContactImpulse)
			{
				var p1 = point.position;
				var p2 = box2d.b2AddMul_V2_S_V2(p1, k_impulseScale * point.normalImpulse, point.normal, new box2d.b2Vec2());
				this.m_debugDraw.DrawSegment(p1, p2, new box2d.b2Color(0.9, 0.9, 0.3));
			}

			if (settings.drawFrictionImpulse)
			{
				var tangent = box2d.b2Cross_V2_S(point.normal, 1.0, new box2d.b2Vec2());
				var p1 = point.position;
				var p2 = box2d.b2AddMul_V2_S_V2(p1, k_impulseScale * point.tangentImpulse, tangent, new box2d.b2Vec2());
				this.m_debugDraw.DrawSegment(p1, p2, new box2d.b2Color(0.9, 0.9, 0.3));
			}
		}
	}
}

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2Vec2} newOrigin
 */
box2d.Testbed.Test.prototype.ShiftOrigin = function (newOrigin)
{
	this.m_world.ShiftOrigin(newOrigin);
}

/**
 * @export 
 * @return {number}
 */
box2d.Testbed.Test.prototype.GetDefaultViewZoom = function ()
{
	return 1.0;
}

//#if B2_ENABLE_PARTICLE

/**
 * @type {Array.<box2d.b2Color>}
 */
box2d.Testbed.Test.k_ParticleColors = [
	new box2d.b2Color(0xff/255, 0x00/255, 0x00/255, 0xff/255), // red
	new box2d.b2Color(0x00/255, 0xff/255, 0x00/255, 0xff/255), // green
	new box2d.b2Color(0x00/255, 0x00/255, 0xff/255, 0xff/255), // blue
	new box2d.b2Color(0xff/255, 0x8c/255, 0x00/255, 0xff/255), // orange
	new box2d.b2Color(0x00/255, 0xce/255, 0xd1/255, 0xff/255), // turquoise
	new box2d.b2Color(0xff/255, 0x00/255, 0xff/255, 0xff/255), // magenta
	new box2d.b2Color(0xff/255, 0xd7/255, 0x00/255, 0xff/255), // gold
	new box2d.b2Color(0x00/255, 0xff/255, 0xff/255, 0xff/255), // cyan
];

/**
 * @const 
 * @type {number} 
 */
box2d.Testbed.Test.k_ParticleColorsCount = box2d.Testbed.Test.k_ParticleColors.length;

/** 
 * Apply a preset range of colors to a particle group. 
 *  
 * A different color out of k_ParticleColors is applied to each 
 * particlesPerColor particles in the specified group. 
 *  
 * If particlesPerColor is 0, the particles in the group are 
 * divided into k_ParticleColorsCount equal sets of colored 
 * particles. 
 *  
 * @export 
 * @return {void} 
 * @param {box2d.b2ParticleGroup} group 
 * @param {number} particlesPerColor 
 */
box2d.Testbed.Test.prototype.ColorParticleGroup = function (group, particlesPerColor)
{
	box2d.b2Assert(group !== null);
	var colorBuffer = this.m_particleSystem.GetColorBuffer();
	var particleCount = group.GetParticleCount();
	var groupStart = group.GetBufferIndex();
	var groupEnd = particleCount + groupStart;
	var colorCount = box2d.Testbed.Test.k_ParticleColors.length;
	if (!particlesPerColor)
	{
		particlesPerColor = Math.floor(particleCount / colorCount);
		if (!particlesPerColor)
		{
			particlesPerColor = 1;
		}
	}
	for (var i = groupStart; i < groupEnd; i++)
	{
		///	colorBuffer[i].Copy(box2d.Testbed.Test.k_ParticleColors[Math.floor(i / particlesPerColor) % colorCount]);
		colorBuffer[i] = box2d.Testbed.Test.k_ParticleColors[Math.floor(i / particlesPerColor) % colorCount].Clone();
	}
}

/** 
 * Remove particle parameters matching "filterMask" from the set 
 * of particle parameters available for this test. 
 * @export 
 * @return {void} 
 * @param {number} filterMask 
 */
box2d.Testbed.Test.prototype.InitializeParticleParameters = function (filterMask)
{
	var defaultNumValues = box2d.Testbed.ParticleParameter.k_defaultDefinition[0].numValues;
	var defaultValues = box2d.Testbed.ParticleParameter.k_defaultDefinition[0].values;
	///	m_particleParameters = new ParticleParameter::Value[defaultNumValues];
	this.m_particleParameters = [];

	// Disable selection of wall and barrier particle types.
	var numValues = 0;
	for (var i = 0; i < defaultNumValues; i++)
	{
		if (defaultValues[i].value & filterMask)
		{
			continue;
		}
		///	memcpy(&m_particleParameters[numValues], &defaultValues[i], sizeof(defaultValues[0]));
		this.m_particleParameters[numValues] = defaultValues[i]; // TODO: clone?
		numValues++;
	}
	this.m_particleParameterDef = new box2d.Testbed.ParticleParameter.Definition(this.m_particleParameters, numValues);
	///	m_particleParameterDef.values = m_particleParameters;
	///	m_particleParameterDef.numValues = numValues;
	box2d.Testbed.TestMain.SetParticleParameters([ this.m_particleParameterDef ], 1);
}

/** 
 * Restore default particle parameters. 
 * @export 
 * @return void
 */
box2d.Testbed.Test.prototype.RestoreParticleParameters = function ()
{
	if (this.m_particleParameters)
	{
		box2d.Testbed.TestMain.SetParticleParameters(box2d.Testbed.ParticleParameter.k_defaultDefinition, 1);
		///	delete [] m_particleParameters;
		this.m_particleParameters = null;
	}
}

//#endif

