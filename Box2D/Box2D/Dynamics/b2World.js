/*
* Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
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

goog.provide('box2d.b2World');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Draw');
goog.require('box2d.b2ContactManager');
goog.require('box2d.b2ContactSolver');
goog.require('box2d.b2Island');
goog.require('box2d.b2Body');
goog.require('box2d.b2Math');
goog.require('box2d.b2Collision');
goog.require('box2d.b2TimeStep');
goog.require('box2d.b2WorldCallbacks');
goog.require('box2d.b2JointFactory');

/**
 * The world class manages all physics entities, dynamic 
 * simulation, and asynchronous queries. The world also contains 
 * efficient memory management facilities. 
 */

/** 
 * Construct a world object. 
 * @export 
 * @constructor
 * @param {box2d.b2Vec2} gravity the world gravity vector.
 */
box2d.b2World = function (gravity)
{
	this.m_flag_clearForces = true;

	this.m_contactManager = new box2d.b2ContactManager();

	this.m_gravity = gravity.Clone();
	this.m_out_gravity = new box2d.b2Vec2();
	this.m_allowSleep = true;

	this.m_destructionListener = null;
	this.m_debugDraw = null;

	this.m_warmStarting = true;
	this.m_continuousPhysics = true;
	this.m_subStepping = false;

	this.m_stepComplete = true;

	this.m_profile = new box2d.b2Profile();

	this.m_island = new box2d.b2Island();

	this.s_stack = new Array();
}

//b2BlockAllocator m_blockAllocator;
//b2StackAllocator m_stackAllocator;

/**
 * @export 
 * @type {boolean}
 */
box2d.b2World.prototype.m_flag_newFixture = false;
/**
 * @export 
 * @type {boolean}
 */
box2d.b2World.prototype.m_flag_locked = false;
/**
 * @export 
 * @type {boolean}
 */
box2d.b2World.prototype.m_flag_clearForces = false;

/**
 * @export 
 * @type {box2d.b2ContactManager}
 */
box2d.b2World.prototype.m_contactManager = null;

/**
 * @export 
 * @type {box2d.b2Body}
 */
box2d.b2World.prototype.m_bodyList = null;
/**
 * @export 
 * @type {box2d.b2Joint}
 */
box2d.b2World.prototype.m_jointList = null;

//#if B2_ENABLE_PARTICLE

/**
 * @export 
 * @type {box2d.b2ParticleSystem}
 */
box2d.b2World.prototype.m_particleSystemList = null;

//#endif

/**
 * @export 
 * @type {number}
 */
box2d.b2World.prototype.m_bodyCount = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2World.prototype.m_jointCount = 0;

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2World.prototype.m_gravity = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2World.prototype.m_out_gravity = null;
/**
 * @export 
 * @type {boolean}
 */
box2d.b2World.prototype.m_allowSleep = true;

/**
 * @export 
 * @type {box2d.b2DestructionListener}
 */
box2d.b2World.prototype.m_destructionListener = null;
/**
 * @export 
 * @type {box2d.b2Draw}
 */
box2d.b2World.prototype.m_debugDraw = null;

/** 
 * This is used to compute the time step ratio to support a 
 * variable time step. 
 * @export 
 * @type {number}
 */
box2d.b2World.prototype.m_inv_dt0 = 0;

/** 
 * These are for debugging the solver. 
 * @export 
 * @type {boolean}
 */
box2d.b2World.prototype.m_warmStarting = true;
/**
 * @export 
 * @type {boolean}
 */
box2d.b2World.prototype.m_continuousPhysics = true;
/**
 * @export 
 * @type {boolean}
 */
box2d.b2World.prototype.m_subStepping = false;

/**
 * @export 
 * @type {boolean}
 */
box2d.b2World.prototype.m_stepComplete = true;

/**
 * @export 
 * @type {box2d.b2Profile}
 */
box2d.b2World.prototype.m_profile = null;

/**
 * @export 
 * @type {box2d.b2Island}
 */
box2d.b2World.prototype.m_island = null;

/**
 * @export 
 * @type {Array.<?box2d.b2Body>}
 */
box2d.b2World.prototype.s_stack = null;

//#if B2_ENABLE_CONTROLLER

/** 
 * @see box2d.b2Controller list 
 * @export 
 * @type {box2d.b2Controller}
 */
box2d.b2World.prototype.m_controllerList = null;

/**
 * @export 
 * @type {number}
 */
box2d.b2World.prototype.m_controllerCount = 0;

//#endif

/** 
 * Enable/disable sleep. 
 * @export 
 * @return {void} 
 * @param {boolean} flag 
 */
box2d.b2World.prototype.SetAllowSleeping = function (flag)
{
	if (flag === this.m_allowSleep)
	{
		return;
	}

	this.m_allowSleep = flag;
	if (!this.m_allowSleep)
	{
		for (/** @type {box2d.b2Body} */ var b = this.m_bodyList; b; b = b.m_next)
		{
			b.SetAwake(true);
		}
	}
}

/** 
 * @export 
 * @return {boolean}
 */
box2d.b2World.prototype.GetAllowSleeping = function ()
{
	return this.m_allowSleep;
}

/** 
 * Enable/disable warm starting. For testing. 
 * @export 
 * @return {void} 
 * @param {boolean} flag
 */
box2d.b2World.prototype.SetWarmStarting = function (flag)
{
	this.m_warmStarting = flag;
}

/** 
 * @export 
 * @return {boolean}
 */
box2d.b2World.prototype.GetWarmStarting = function ()
{
	return this.m_warmStarting;
}

/** 
 * Enable/disable continuous physics. For testing. 
 * @export 
 * @return {void} 
 * @param {boolean} flag
 */
box2d.b2World.prototype.SetContinuousPhysics = function (flag)
{
	this.m_continuousPhysics = flag;
}

/** 
 * @export 
 * @return {boolean}
 */
box2d.b2World.prototype.GetContinuousPhysics = function ()
{
	return this.m_continuousPhysics;
}

/** 
 * Enable/disable single stepped continuous physics. For 
 * testing. 
 * @export 
 * @return {void} 
 * @param {boolean} flag
 */
box2d.b2World.prototype.SetSubStepping = function (flag)
{
	this.m_subStepping = flag;
}

/** 
 * @export 
 * @return {boolean}
 */
box2d.b2World.prototype.GetSubStepping = function ()
{
	return this.m_subStepping;
}

/** 
 * Get the world body list. With the returned body, use 
 * b2Body::GetNext to get the next body in the world list. A 
 * NULL body indicates the end of the list. 
 * @export 
 * @return {box2d.b2Body} the head of the world body list.
 */
box2d.b2World.prototype.GetBodyList = function ()
{
	return this.m_bodyList;
}

/** 
 * Get the world joint list. With the returned joint, use 
 * b2Joint::GetNext to get the next joint in the world list. A 
 * NULL joint indicates the end of the list. 
 * @export 
 * @return {box2d.b2Joint} the head of the world joint list.
 */
box2d.b2World.prototype.GetJointList = function ()
{
	return this.m_jointList;
}

//#if B2_ENABLE_PARTICLE

/**
 * @export 
 * @return {box2d.b2ParticleSystem} 
 */
box2d.b2World.prototype.GetParticleSystemList = function ()
{
	return this.m_particleSystemList;
}

//#endif

/** 
 * Get the world contact list. With the returned contact, use 
 * box2d.b2Contact::GetNext to get the next contact in the world 
 * list. A NULL contact indicates the end of the list. 
 * warning contacts are created and destroyed in the middle of a 
 * time step. 
 * Use box2d.b2ContactListener to avoid missing contacts.
 * @export 
 * @return {box2d.b2Contact} the head of the world contact list.
 */
box2d.b2World.prototype.GetContactList = function ()
{
	return this.m_contactManager.m_contactList;
}

/** 
 * Get the number of bodies. 
 * @export 
 * @return {number} 
 */
box2d.b2World.prototype.GetBodyCount = function ()
{
	return this.m_bodyCount;
}

/** 
 * Get the number of joints. 
 * @export 
 * @return {number} 
 */
box2d.b2World.prototype.GetJointCount = function ()
{
	return this.m_jointCount;
}

/** 
 * Get the number of contacts (each may have 0 or more contact 
 * points). 
 * @export 
 * @return {number} 
 */
box2d.b2World.prototype.GetContactCount = function ()
{
	return this.m_contactManager.m_contactCount;
}

/** 
 * Change the global gravity vector. 
 * @export 
 * @return {void} 
 * @param {box2d.b2Vec2} gravity
 * @param {boolean=} wake also wake up the bodies 
 */
box2d.b2World.prototype.SetGravity = function (gravity, wake)
{
	wake = wake || true;

	if ((this.m_gravity.x !== gravity.x) || (this.m_gravity.y !== gravity.y))
	{
		this.m_gravity.Copy(gravity);

		if (wake)
		{
			for (/** @type {box2d.b2Body} */ var b = this.m_bodyList; b; b = b.m_next)
			{
				b.SetAwake(true);
			}
		}
	}
}

/** 
 * Get the global gravity vector. 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2=} out 
 */
box2d.b2World.prototype.GetGravity = function (out)
{
	out = out || this.m_out_gravity;
	return out.Copy(this.m_gravity);
}

/** 
 * Is the world locked (in the middle of a time step). 
 * @export 
 * @return {boolean}
 */
box2d.b2World.prototype.IsLocked = function ()
{
	return this.m_flag_locked;
}

/** 
 * Set flag to control automatic clearing of forces after each 
 * time step. 
 * @export 
 * @return {void} 
 * @param {boolean} flag
 */
box2d.b2World.prototype.SetAutoClearForces = function (flag)
{
	this.m_flag_clearForces = flag;
}

/** 
 * Get the flag that controls automatic clearing of forces after 
 * each time step. 
 * @export 
 * @return {boolean}
 */
box2d.b2World.prototype.GetAutoClearForces = function ()
{
	return this.m_flag_clearForces;
}

/** 
 * Get the contact manager for testing. 
 * @export 
 * @return {box2d.b2ContactManager}
 */
box2d.b2World.prototype.GetContactManager = function ()
{
	return this.m_contactManager;
}

/** 
 * Get the current profile. 
 * @export 
 * @return {box2d.b2Profile} 
 */
box2d.b2World.prototype.GetProfile = function ()
{
	return this.m_profile;
}

/** 
 * Register a destruction listener. The listener is owned by you 
 * and must remain in scope. 
 * @export 
 * @return {void} 
 * @param {box2d.b2DestructionListener} listener
 */
box2d.b2World.prototype.SetDestructionListener = function (listener)
{
	this.m_destructionListener = listener;
}

/** 
 * Register a contact filter to provide specific control over 
 * collision. Otherwise the default filter is used 
 * (b2_defaultFilter). The listener is owned by you and must 
 * remain in scope. 
 * @export 
 * @return {void} 
 * @param {box2d.b2ContactFilter} filter
 */
box2d.b2World.prototype.SetContactFilter = function (filter)
{
	this.m_contactManager.m_contactFilter = filter;
}

/** 
 * Register a contact event listener. The listener is owned by 
 * you and must remain in scope. 
 * @export 
 * @return {void} 
 * @param {box2d.b2ContactListener} listener
 */
box2d.b2World.prototype.SetContactListener = function (listener)
{
	this.m_contactManager.m_contactListener = listener;
}

/** 
 * Register a routine for debug drawing. The debug draw 
 * functions are called inside with b2World::DrawDebugData 
 * method. The debug draw object is owned by you and must remain 
 * in scope. 
 * @export 
 * @return {void} 
 * @param {box2d.b2Draw} debugDraw
 */
box2d.b2World.prototype.SetDebugDraw = function (debugDraw)
{
	this.m_debugDraw = debugDraw;
}

/** 
 * Create a rigid body given a definition. No reference to the 
 * definition is retained. 
 * warning This function is locked during callbacks.
 * @export 
 * @return {box2d.b2Body}
 * @param {box2d.b2BodyDef} def
 */
box2d.b2World.prototype.CreateBody = function (def)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(!this.IsLocked()); }
	if (this.IsLocked())
	{
		return null;
	}

	/** @type {box2d.b2Body} */ var b = new box2d.b2Body(def, this);

	// Add to world doubly linked list.
	b.m_prev = null;
	b.m_next = this.m_bodyList;
	if (this.m_bodyList)
	{
		this.m_bodyList.m_prev = b;
	}
	this.m_bodyList = b;
	++this.m_bodyCount;

	return b;
}

/** 
 * Destroy a rigid body given a definition. No reference to the 
 * definition is retained. This function is locked during 
 * callbacks. 
 * warning This automatically deletes all associated shapes and 
 * joints. 
 * warning This function is locked during callbacks. 
 * @export 
 * @return {void} 
 * @param {box2d.b2Body} b
 */
box2d.b2World.prototype.DestroyBody = function (b)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(this.m_bodyCount > 0); }
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(!this.IsLocked()); }
	if (this.IsLocked())
	{
		return;
	}

	// Delete the attached joints.
	/** @type {box2d.b2JointEdge} */ var je = b.m_jointList;
	while (je)
	{
		/** @type {box2d.b2JointEdge} */ var je0 = je;
		je = je.next;

		if (this.m_destructionListener)
		{
			this.m_destructionListener.SayGoodbyeJoint(je0.joint);
		}

		this.DestroyJoint(je0.joint);

		b.m_jointList = je;
	}
	b.m_jointList = null;

//#if B2_ENABLE_CONTROLLER

	/// @see box2d.b2Controller list
	/** @type {box2d.b2ControllerEdge} */ var coe = b.m_controllerList;
	while (coe)
	{
		/** @type {box2d.b2ControllerEdge} */ var coe0 = coe;
		coe = coe.nextController;
		coe0.controller.RemoveBody(b);
	}

//#endif

	// Delete the attached contacts.
	/** @type {box2d.b2ContactEdge} */ var ce = b.m_contactList;
	while (ce)
	{
		/** @type {box2d.b2ContactEdge} */ var ce0 = ce;
		ce = ce.next;
		this.m_contactManager.Destroy(ce0.contact);
	}
	b.m_contactList = null;

	// Delete the attached fixtures. This destroys broad-phase proxies.
	/** @type {box2d.b2Fixture} */ var f = b.m_fixtureList;
	while (f)
	{
		/** @type {box2d.b2Fixture} */ var f0 = f;
		f = f.m_next;

		if (this.m_destructionListener)
		{
			this.m_destructionListener.SayGoodbyeFixture(f0);
		}

		f0.DestroyProxies(this.m_contactManager.m_broadPhase);
		f0.Destroy();


		b.m_fixtureList = f;
		b.m_fixtureCount -= 1;
	}
	b.m_fixtureList = null;
	b.m_fixtureCount = 0;

	// Remove world body list.
	if (b.m_prev)
	{
		b.m_prev.m_next = b.m_next;
	}

	if (b.m_next)
	{
		b.m_next.m_prev = b.m_prev;
	}

	if (b === this.m_bodyList)
	{
		this.m_bodyList = b.m_next;
	}

	--this.m_bodyCount;
}

/** 
 * Create a joint to constrain bodies together. No reference to 
 * the definition is retained. This may cause the connected 
 * bodies to cease colliding. 
 * warning This function is locked during callbacks.
 * @export 
 * @return {box2d.b2Joint}
 * @param {box2d.b2JointDef} def 
 */
box2d.b2World.prototype.CreateJoint = function (def)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(!this.IsLocked()); }
	if (this.IsLocked())
	{
		return null;
	}

	/** @type {box2d.b2Joint} */ var j = box2d.b2JointFactory.Create(def, null);

	// Connect to the world list.
	j.m_prev = null;
	j.m_next = this.m_jointList;
	if (this.m_jointList)
	{
		this.m_jointList.m_prev = j;
	}
	this.m_jointList = j;
	++this.m_jointCount;

	// Connect to the bodies' doubly linked lists.
	j.m_edgeA.joint = j;
	j.m_edgeA.other = j.m_bodyB;
	j.m_edgeA.prev = null;
	j.m_edgeA.next = j.m_bodyA.m_jointList;
	if (j.m_bodyA.m_jointList) j.m_bodyA.m_jointList.prev = j.m_edgeA;
	j.m_bodyA.m_jointList = j.m_edgeA;

	j.m_edgeB.joint = j;
	j.m_edgeB.other = j.m_bodyA;
	j.m_edgeB.prev = null;
	j.m_edgeB.next = j.m_bodyB.m_jointList;
	if (j.m_bodyB.m_jointList) j.m_bodyB.m_jointList.prev = j.m_edgeB;
	j.m_bodyB.m_jointList = j.m_edgeB;

	/** @type {box2d.b2Body} */ var bodyA = def.bodyA;
	/** @type {box2d.b2Body} */ var bodyB = def.bodyB;

	// If the joint prevents collisions, then flag any contacts for filtering.
	if (!def.collideConnected)
	{
		/** @type {box2d.b2ContactEdge} */ var edge = bodyB.GetContactList();
		while (edge)
		{
			if (edge.other === bodyA)
			{
				// Flag the contact for filtering at the next time step (where either
				// body is awake).
				edge.contact.FlagForFiltering();
			}

			edge = edge.next;
		}
	}

	// Note: creating a joint doesn't wake the bodies.

	return j;
}

/** 
 * Destroy a joint. This may cause the connected bodies to begin 
 * colliding. 
 * warning This function is locked during callbacks.
 * @export 
 * @return {void} 
 * @param {box2d.b2Joint} j
 */
box2d.b2World.prototype.DestroyJoint = function (j)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(!this.IsLocked()); }
	if (this.IsLocked())
	{
		return;
	}

	/** @type {boolean} */ var collideConnected = j.m_collideConnected;

	// Remove from the doubly linked list.
	if (j.m_prev)
	{
		j.m_prev.m_next = j.m_next;
	}

	if (j.m_next)
	{
		j.m_next.m_prev = j.m_prev;
	}

	if (j === this.m_jointList)
	{
		this.m_jointList = j.m_next;
	}

	// Disconnect from island graph.
	/** @type {box2d.b2Body} */ var bodyA = j.m_bodyA;
	/** @type {box2d.b2Body} */ var bodyB = j.m_bodyB;

	// Wake up connected bodies.
	bodyA.SetAwake(true);
	bodyB.SetAwake(true);

	// Remove from body 1.
	if (j.m_edgeA.prev)
	{
		j.m_edgeA.prev.next = j.m_edgeA.next;
	}

	if (j.m_edgeA.next)
	{
		j.m_edgeA.next.prev = j.m_edgeA.prev;
	}

	if (j.m_edgeA === bodyA.m_jointList)
	{
		bodyA.m_jointList = j.m_edgeA.next;
	}

	j.m_edgeA.prev = null;
	j.m_edgeA.next = null;

	// Remove from body 2
	if (j.m_edgeB.prev)
	{
		j.m_edgeB.prev.next = j.m_edgeB.next;
	}

	if (j.m_edgeB.next)
	{
		j.m_edgeB.next.prev = j.m_edgeB.prev;
	}

	if (j.m_edgeB === bodyB.m_jointList)
	{
		bodyB.m_jointList = j.m_edgeB.next;
	}

	j.m_edgeB.prev = null;
	j.m_edgeB.next = null;

	box2d.b2JointFactory.Destroy(j, null);

	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(this.m_jointCount > 0); }
	--this.m_jointCount;

	// If the joint prevents collisions, then flag any contacts for filtering.
	if (!collideConnected)
	{
		/** @type {box2d.b2ContactEdge} */ var edge = bodyB.GetContactList();
		while (edge)
		{
			if (edge.other === bodyA)
			{
				// Flag the contact for filtering at the next time step (where either
				// body is awake).
				edge.contact.FlagForFiltering();
			}

			edge = edge.next;
		}
	}
}

//#if B2_ENABLE_PARTICLE

/**
 * @export 
 * @return {box2d.b2ParticleSystem} 
 * @param {box2d.b2ParticleSystemDef} def 
 */
box2d.b2World.prototype.CreateParticleSystem = function (def)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(!this.IsLocked()); }
	if (this.IsLocked())
	{
		return null;
	}

	var p = new box2d.b2ParticleSystem(def, this);

	// Add to world doubly linked list.
	p.m_prev = null;
	p.m_next = this.m_particleSystemList;
	if (this.m_particleSystemList)
	{
		this.m_particleSystemList.m_prev = p;
	}
	this.m_particleSystemList = p;

	return p;
}

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2ParticleSystem} p 
 */
box2d.b2World.prototype.DestroyParticleSystem = function (p)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(!this.IsLocked()); }
	if (this.IsLocked())
	{
		return;
	}

	// Remove world particleSystem list.
	if (p.m_prev)
	{
		p.m_prev.m_next = p.m_next;
	}

	if (p.m_next)
	{
		p.m_next.m_prev = p.m_prev;
	}

	if (p === this.m_particleSystemList)
	{
		this.m_particleSystemList = p.m_next;
	}
}

//#endif

/** 
 * Find islands, integrate and solve constraints, solve position 
 * constraints 
 * @export 
 * @return {void} 
 * @param {box2d.b2TimeStep} step
 */
box2d.b2World.prototype.Solve = function (step)
{
//#if B2_ENABLE_PARTICLE
	// update previous transforms
	for (/** @type {box2d.b2Body} */ var b = this.m_bodyList; b; b = b.m_next)
	{
		b.m_xf0.Copy(b.m_xf);
	}
//#endif

//#if B2_ENABLE_CONTROLLER
	/// @see box2d.b2Controller list
	for (/** @type {box2d.b2Controller} */ var controller = this.m_controllerList; controller; controller = controller.m_next)
	{
		controller.Step(step);
	}
//#endif

	this.m_profile.solveInit = 0;
	this.m_profile.solveVelocity = 0;
	this.m_profile.solvePosition = 0;

	// Size the island for the worst case.
	/** @type {box2d.b2Island} */ var island = this.m_island;
	island.Initialize(this.m_bodyCount,
					  this.m_contactManager.m_contactCount,
					  this.m_jointCount,
					  null, // this.m_stackAllocator, 
					  this.m_contactManager.m_contactListener);

	// Clear all the island flags.
	for (/* type {box2d.b2Body} */ var b = this.m_bodyList; b; b = b.m_next)
	{
		b.m_flag_islandFlag = false;
	}
	for (/** @type {box2d.b2Contact} */ var c = this.m_contactManager.m_contactList; c; c = c.m_next)
	{
		c.m_flag_islandFlag = false;
	}
	for (/** @type {box2d.b2Joint} */ var j = this.m_jointList; j; j = j.m_next)
	{
		j.m_islandFlag = false;
	}

	// Build and simulate all awake islands.
	/** @type {number} */ var stackSize = this.m_bodyCount;
	/** @type {Array.<?box2d.b2Body>} */ var stack = this.s_stack;
	for (/** @type {box2d.b2Body} */ var seed = this.m_bodyList; seed; seed = seed.m_next)
	{
		if (seed.m_flag_islandFlag)
		{
			continue;
		}

		if (!seed.IsAwake() || !seed.IsActive())
		{
			continue;
		}

		// The seed can be dynamic or kinematic.
		if (seed.GetType() === box2d.b2BodyType.b2_staticBody)
		{
			continue;
		}

		// Reset island and stack.
		island.Clear();
		/** @type {number} */ var stackCount = 0;
		stack[stackCount++] = seed;
		seed.m_flag_islandFlag = true;

		// Perform a depth first search (DFS) on the constraint graph.
		while (stackCount > 0)
		{
			// Grab the next body off the stack and add it to the island.
			/* type {box2d.b2Body} */ var b = stack[--stackCount];
			if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(b.IsActive()); }
			island.AddBody(b);

			// Make sure the body is awake.
			b.SetAwake(true);

			// To keep islands as small as possible, we don't
			// propagate islands across static bodies.
			if (b.GetType() === box2d.b2BodyType.b2_staticBody)
			{
				continue;
			}

			// Search all contacts connected to this body.
			for (/** @type {box2d.b2ContactEdge} */ var ce = b.m_contactList; ce; ce = ce.next)
			{
				/** @type {box2d.b2Contact} */ var contact = ce.contact;

				// Has this contact already been added to an island?
				if (contact.m_flag_islandFlag)
				{
					continue;
				}

				// Is this contact solid and touching?
				if (!contact.IsEnabled() ||
					!contact.IsTouching())
				{
					continue;
				}

				// Skip sensors.
				/** @type {boolean} */ var sensorA = contact.m_fixtureA.m_isSensor;
				/** @type {boolean} */ var sensorB = contact.m_fixtureB.m_isSensor;
				if (sensorA || sensorB)
				{
					continue;
				}

				island.AddContact(contact);
				contact.m_flag_islandFlag = true;

				/** @type {box2d.b2Body} */ var other = ce.other;

				// Was the other body already added to this island?
				if (other.m_flag_islandFlag)
				{
					continue;
				}

				if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(stackCount < stackSize); }
				stack[stackCount++] = other;
				other.m_flag_islandFlag = true;
			}

			// Search all joints connect to this body.
			for (/** @type {box2d.b2JointEdge} */ var je = b.m_jointList; je; je = je.next)
			{
				if (je.joint.m_islandFlag)
				{
					continue;
				}

				/* type {box2d.b2Body} */ var other = je.other;

				// Don't simulate joints connected to inactive bodies.
				if (!other.IsActive())
				{
					continue;
				}

				island.AddJoint(je.joint);
				je.joint.m_islandFlag = true;

				if (other.m_flag_islandFlag)
				{
					continue;
				}

				if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(stackCount < stackSize); }
				stack[stackCount++] = other;
				other.m_flag_islandFlag = true;
			}
		}

		/** @type {box2d.b2Profile} */ var profile = new box2d.b2Profile();
		island.Solve(profile, step, this.m_gravity, this.m_allowSleep);
		this.m_profile.solveInit += profile.solveInit;
		this.m_profile.solveVelocity += profile.solveVelocity;
		this.m_profile.solvePosition += profile.solvePosition;

		// Post solve cleanup.
		for (/** @type {number} */ var i = 0; i < island.m_bodyCount; ++i)
		{
			// Allow static bodies to participate in other islands.
			/* type {box2d.b2Body} */ var b = island.m_bodies[i];
			if (b.GetType() === box2d.b2BodyType.b2_staticBody)
			{
				b.m_flag_islandFlag = false;
			}
		}
	}

	for (/* type {number} */ var i = 0; i < stack.length; ++i)
	{
		if (!stack[i]) break;
		stack[i] = null;
	}

	{
		/** @type {box2d.b2Timer} */ var timer = new box2d.b2Timer();

		// Synchronize fixtures, check for out of range bodies.
		for (/* type {box2d.b2Body} */ var b = this.m_bodyList; b; b = b.m_next)
		{
			// If a body was not in an island then it did not move.
			if (!b.m_flag_islandFlag)
			{
				continue;
			}
	
			if (b.GetType() === box2d.b2BodyType.b2_staticBody)
			{
				continue;
			}
	
			// Update fixtures (for broad-phase).
			b.SynchronizeFixtures();
		}
	
		// Look for new contacts.
		this.m_contactManager.FindNewContacts();
		this.m_profile.broadphase = timer.GetMilliseconds();
	}
}

/** 
 * Find TOI contacts and solve them. 
 * @export 
 * @return {void} 
 * @param {box2d.b2TimeStep} step
 */
box2d.b2World.prototype.SolveTOI = function (step)
{
//	box2d.b2Island island(2 * box2d.b2_maxTOIContacts, box2d.b2_maxTOIContacts, 0, &m_stackAllocator, m_contactManager.m_contactListener);
	/** @type {box2d.b2Island} */ var island = this.m_island;
	island.Initialize(2 * box2d.b2_maxTOIContacts, box2d.b2_maxTOIContacts, 0, null, this.m_contactManager.m_contactListener);

	if (this.m_stepComplete)
	{
		for (/** @type {box2d.b2Body} */ var b = this.m_bodyList; b; b = b.m_next)
		{
			b.m_flag_islandFlag = false;
			b.m_sweep.alpha0 = 0;
		}

		for (/** @type {box2d.b2Contact} */ var c = this.m_contactManager.m_contactList; c; c = c.m_next)
		{
			// Invalidate TOI
			c.m_flag_toiFlag = c.m_flag_islandFlag = false;
			c.m_toiCount = 0;
			c.m_toi = 1;
		}
	}

	// Find TOI events and solve them.
	for (;;)
	{
		// Find the first TOI.
		/** @type {box2d.b2Contact} */ var minContact = null;
		/** @type {number} */ var minAlpha = 1;

		for (/* type {box2d.b2Contact} */ var c = this.m_contactManager.m_contactList; c; c = c.m_next)
		{
			// Is this contact disabled?
			if (!c.IsEnabled())
			{
				continue;
			}

			// Prevent excessive sub-stepping.
			if (c.m_toiCount > box2d.b2_maxSubSteps)
			{
				continue;
			}

			/** @type {number} */ var alpha = 1;
			if (c.m_flag_toiFlag)
			{
				// This contact has a valid cached TOI.
				alpha = c.m_toi;
			}
			else
			{
				/** @type {box2d.b2Fixture} */ var fA = c.GetFixtureA();
				/** @type {box2d.b2Fixture} */ var fB = c.GetFixtureB();

				// Is there a sensor?
				if (fA.IsSensor() || fB.IsSensor())
				{
					continue;
				}

				/** @type {box2d.b2Body} */ var bA = fA.GetBody();
				/** @type {box2d.b2Body} */ var bB = fB.GetBody();

				/** @type {box2d.b2BodyType} */ var typeA = bA.m_type;
				/** @type {box2d.b2BodyType} */ var typeB = bB.m_type;
				if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(typeA === box2d.b2BodyType.b2_dynamicBody || typeB === box2d.b2BodyType.b2_dynamicBody); }

				/** @type {boolean} */ var activeA = bA.IsAwake() && typeA !== box2d.b2BodyType.b2_staticBody;
				/** @type {boolean} */ var activeB = bB.IsAwake() && typeB !== box2d.b2BodyType.b2_staticBody;

				// Is at least one body active (awake and dynamic or kinematic)?
				if (!activeA && !activeB)
				{
					continue;
				}

				/** @type {boolean} */ var collideA = bA.IsBullet() || typeA !== box2d.b2BodyType.b2_dynamicBody;
				/** @type {boolean} */ var collideB = bB.IsBullet() || typeB !== box2d.b2BodyType.b2_dynamicBody;

				// Are these two non-bullet dynamic bodies?
				if (!collideA && !collideB)
				{
					continue;
				}

				// Compute the TOI for this contact.
				// Put the sweeps onto the same time interval.
				/** @type {number} */ var alpha0 = bA.m_sweep.alpha0;

				if (bA.m_sweep.alpha0 < bB.m_sweep.alpha0)
				{
					alpha0 = bB.m_sweep.alpha0;
					bA.m_sweep.Advance(alpha0);
				}
				else if (bB.m_sweep.alpha0 < bA.m_sweep.alpha0)
				{
					alpha0 = bA.m_sweep.alpha0;
					bB.m_sweep.Advance(alpha0);
				}

				if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(alpha0 < 1); }

				/** @type {number} */ var indexA = c.GetChildIndexA();
				/** @type {number} */ var indexB = c.GetChildIndexB();

				// Compute the time of impact in interval [0, minTOI]
				/** @type {box2d.b2TOIInput} */ var input = box2d.b2World.prototype.SolveTOI.s_toi_input;
				input.proxyA.SetShape(fA.GetShape(), indexA);
				input.proxyB.SetShape(fB.GetShape(), indexB);
				input.sweepA.Copy(bA.m_sweep);
				input.sweepB.Copy(bB.m_sweep);
				input.tMax = 1;

				/** @type {box2d.b2TOIOutput} */ var output = box2d.b2World.prototype.SolveTOI.s_toi_output;
				box2d.b2TimeOfImpact(output, input);

				// Beta is the fraction of the remaining portion of the .
				/** @type {number} */ var beta = output.t;
				if (output.state === box2d.b2TOIOutputState.e_touching)
				{
					alpha = box2d.b2Min(alpha0 + (1 - alpha0) * beta, 1);
				}
				else
				{
					alpha = 1;
				}

				c.m_toi = alpha;
				c.m_flag_toiFlag = true;
			}

			if (alpha < minAlpha)
			{
				// This is the minimum TOI found so far.
				minContact = c;
				minAlpha = alpha;
			}
		}

		if (minContact === null || 1 - 10 * box2d.b2_epsilon < minAlpha)
		{
			// No more TOI events. Done!
			this.m_stepComplete = true;
			break;
		}

		// Advance the bodies to the TOI.
		/* type {box2d.b2Fixture} */ var fA = minContact.GetFixtureA();
		/* type {box2d.b2Fixture} */ var fB = minContact.GetFixtureB();
		/* type {box2d.b2Body} */ var bA = fA.GetBody();
		/* type {box2d.b2Body} */ var bB = fB.GetBody();

		/** @type {box2d.b2Sweep} */ var backup1 = box2d.b2World.prototype.SolveTOI.s_backup1.Copy(bA.m_sweep);
		/** @type {box2d.b2Sweep} */ var backup2 = box2d.b2World.prototype.SolveTOI.s_backup2.Copy(bB.m_sweep);

		bA.Advance(minAlpha);
		bB.Advance(minAlpha);

		// The TOI contact likely has some new contact points.
		minContact.Update(this.m_contactManager.m_contactListener);
		minContact.m_flag_toiFlag = false;
		++minContact.m_toiCount;

		// Is the contact solid?
		if (!minContact.IsEnabled() || !minContact.IsTouching())
		{
			// Restore the sweeps.
			minContact.SetEnabled(false);
			bA.m_sweep.Copy(backup1);
			bB.m_sweep.Copy(backup2);
			bA.SynchronizeTransform();
			bB.SynchronizeTransform();
			continue;
		}

		bA.SetAwake(true);
		bB.SetAwake(true);

		// Build the island
		island.Clear();
		island.AddBody(bA);
		island.AddBody(bB);
		island.AddContact(minContact);

		bA.m_flag_islandFlag = true;
		bB.m_flag_islandFlag = true;
		minContact.m_flag_islandFlag = true;

		// Get contacts on bodyA and bodyB.
		//** @type {box2d.b2Body} */ var bodies = [bA, bB];
		for (/** @type {number} */ var i = 0; i < 2; ++i)
		{
			/** @type {box2d.b2Body} */ var body = (i === 0)?(bA):(bB);//bodies[i];
			if (body.m_type === box2d.b2BodyType.b2_dynamicBody)
			{
				for (/** @type {box2d.b2ContactEdge} */ var ce = body.m_contactList; ce; ce = ce.next)
				{
					if (island.m_bodyCount === island.m_bodyCapacity)
					{
						break;
					}

					if (island.m_contactCount === island.m_contactCapacity)
					{
						break;
					}

					/** @type {box2d.b2Contact} */ var contact = ce.contact;

					// Has this contact already been added to the island?
					if (contact.m_flag_islandFlag)
					{
						continue;
					}

					// Only add static, kinematic, or bullet bodies.
					/** @type {box2d.b2Body} */ var other = ce.other;
					if (other.m_type === box2d.b2BodyType.b2_dynamicBody &&
						!body.IsBullet() && !other.IsBullet())
					{
						continue;
					}

					// Skip sensors.
					/** @type {boolean} */ var sensorA = contact.m_fixtureA.m_isSensor;
					/** @type {boolean} */ var sensorB = contact.m_fixtureB.m_isSensor;
					if (sensorA || sensorB)
					{
						continue;
					}

					// Tentatively advance the body to the TOI.
					/** @type {box2d.b2Sweep} */ var backup = box2d.b2World.prototype.SolveTOI.s_backup.Copy(other.m_sweep);
					if (!other.m_flag_islandFlag)
					{
						other.Advance(minAlpha);
					}

					// Update the contact points
					contact.Update(this.m_contactManager.m_contactListener);

					// Was the contact disabled by the user?
					if (!contact.IsEnabled())
					{
						other.m_sweep.Copy(backup);
						other.SynchronizeTransform();
						continue;
					}

					// Are there contact points?
					if (!contact.IsTouching())
					{
						other.m_sweep.Copy(backup);
						other.SynchronizeTransform();
						continue;
					}

					// Add the contact to the island
					contact.m_flag_islandFlag = true;
					island.AddContact(contact);

					// Has the other body already been added to the island?
					if (other.m_flag_islandFlag)
					{
						continue;
					}
					
					// Add the other body to the island.
					other.m_flag_islandFlag = true;

					if (other.m_type !== box2d.b2BodyType.b2_staticBody)
					{
						other.SetAwake(true);
					}

					island.AddBody(other);
				}
			}
		}

		/** @type {box2d.b2TimeStep} */ var subStep = box2d.b2World.prototype.SolveTOI.s_subStep;
		subStep.dt = (1 - minAlpha) * step.dt;
		subStep.inv_dt = 1 / subStep.dt;
		subStep.dtRatio = 1;
		subStep.positionIterations = 20;
		subStep.velocityIterations = step.velocityIterations;
//#if B2_ENABLE_PARTICLE
		subStep.particleIterations = step.particleIterations;
//#endif
		subStep.warmStarting = false;
		island.SolveTOI(subStep, bA.m_islandIndex, bB.m_islandIndex);

		// Reset island flags and synchronize broad-phase proxies.
		for (/* type {number} */ var i = 0; i < island.m_bodyCount; ++i)
		{
			/* type {box2d.b2Body} */ var body = island.m_bodies[i];
			body.m_flag_islandFlag = false;

			if (body.m_type !== box2d.b2BodyType.b2_dynamicBody)
			{
				continue;
			}

			body.SynchronizeFixtures();

			// Invalidate all contact TOIs on this displaced body.
			for (/* type {box2d.b2ContactEdge} */ var ce = body.m_contactList; ce; ce = ce.next)
			{
				ce.contact.m_flag_toiFlag = ce.contact.m_flag_islandFlag = false;
			}
		}

		// Commit fixture proxy movements to the broad-phase so that new contacts are created.
		// Also, some contacts can be destroyed.
		this.m_contactManager.FindNewContacts();

		if (this.m_subStepping)
		{
			this.m_stepComplete = false;
			break;
		}
	}
}
box2d.b2World.prototype.SolveTOI.s_subStep = new box2d.b2TimeStep();
box2d.b2World.prototype.SolveTOI.s_backup = new box2d.b2Sweep();
box2d.b2World.prototype.SolveTOI.s_backup1 = new box2d.b2Sweep();
box2d.b2World.prototype.SolveTOI.s_backup2 = new box2d.b2Sweep();
box2d.b2World.prototype.SolveTOI.s_toi_input = new box2d.b2TOIInput();
box2d.b2World.prototype.SolveTOI.s_toi_output = new box2d.b2TOIOutput();

/** 
 * Take a time step. This performs collision detection, 
 * integration, and constraint solution. 
 * @export 
 * @return {void} 
 * @param {number} dt the amount of time to simulate, this should not vary.
 * @param {number} velocityIterations for the velocity constraint solver.
 * @param {number} positionIterations for the position constraint solver.
 * @param {number=} particleIterations for the particle constraint solver.
 */
//#if B2_ENABLE_PARTICLE
box2d.b2World.prototype.Step = function (dt, velocityIterations, positionIterations, particleIterations)
//#else
//box2d.b2World.prototype.Step = function (dt, velocityIterations, positionIterations)
//#endif
{
//#if B2_ENABLE_PARTICLE
	particleIterations = particleIterations || this.CalculateReasonableParticleIterations(dt);
//#endif

	/** @type {box2d.b2Timer} */ var stepTimer = new box2d.b2Timer();

	// If new fixtures were added, we need to find the new contacts.
	if (this.m_flag_newFixture)
	{
		this.m_contactManager.FindNewContacts();
		this.m_flag_newFixture = false;
	}

	this.m_flag_locked = true;

	/** @type {box2d.b2TimeStep} */ var step = box2d.b2World.prototype.Step.s_step;
	step.dt = dt;
	step.velocityIterations = velocityIterations;
	step.positionIterations = positionIterations;
//#if B2_ENABLE_PARTICLE
	step.particleIterations = particleIterations;
//#endif
	if (dt > 0)
	{
		step.inv_dt = 1 / dt;
	}
	else
	{
		step.inv_dt = 0;
	}

	step.dtRatio = this.m_inv_dt0 * dt;

	step.warmStarting = this.m_warmStarting;

	// Update contacts. This is where some contacts are destroyed.
	{
		/** @type {box2d.b2Timer} */ var timer = new box2d.b2Timer();
		this.m_contactManager.Collide();
		this.m_profile.collide = timer.GetMilliseconds();
	}

	// Integrate velocities, solve velocity constraints, and integrate positions.
	if (this.m_stepComplete && step.dt > 0)
	{
		/* type {box2d.b2Timer} */ var timer = new box2d.b2Timer();
//#if B2_ENABLE_PARTICLE
		for (/** @type {box2d.b2ParticleSystem} */ var p = this.m_particleSystemList; p; p = p.m_next)
		{
			p.Solve(step); // Particle Simulation
		}
//#endif
		this.Solve(step);
		this.m_profile.solve = timer.GetMilliseconds();
	}

	// Handle TOI events.
	if (this.m_continuousPhysics && step.dt > 0)
	{
		/* type {box2d.b2Timer} */ var timer = new box2d.b2Timer();
		this.SolveTOI(step);
		this.m_profile.solveTOI = timer.GetMilliseconds();
	}

	if (step.dt > 0)
	{
		this.m_inv_dt0 = step.inv_dt;
	}

	if (this.m_flag_clearForces)
	{
		this.ClearForces();
	}

	this.m_flag_locked = false;

	this.m_profile.step = stepTimer.GetMilliseconds();
}
box2d.b2World.prototype.Step.s_step = new box2d.b2TimeStep();

/**
 * Manually clear the force buffer on all bodies. By default, 
 * forces are cleared automatically after each call to Step. The 
 * default behavior is modified by calling SetAutoClearForces. 
 * The purpose of this function is to support sub-stepping. 
 * Sub-stepping is often used to maintain a fixed sized time 
 * step under a variable frame-rate. 
 * When you perform sub-stepping you will disable auto clearing 
 * of forces and instead call ClearForces after all sub-steps 
 * are complete in one pass of your game loop. 
 * @see SetAutoClearForces
 * @export 
 * @return {void} 
 */
box2d.b2World.prototype.ClearForces = function ()
{
	for (/** @type {box2d.b2Body} */ var body = this.m_bodyList; body; body = body.m_next)
	{
		body.m_force.SetZero();
		body.m_torque = 0;
	}
}

/** 
 * Query the world for all fixtures that potentially overlap the 
 * provided AABB. 
 * @export 
 * @return {void} 
 * @param 
 *  	  {box2d.b2QueryCallback|function(box2d.b2Fixture):boolean}
 *  	  callback a user implemented callback class.
 * @param {box2d.b2AABB} aabb the query box.
 */
box2d.b2World.prototype.QueryAABB = function (callback, aabb)
{
	/** @type {box2d.b2BroadPhase} */ var broadPhase = this.m_contactManager.m_broadPhase;

	/**
	 * @return {boolean} 
	 * @param {box2d.b2TreeNode} proxy 
	 */
	var WorldQueryAABBWrapper = function (proxy)
	{
		/* type {box2d.b2FixtureProxy} */ var fixture_proxy = broadPhase.GetUserData(proxy);
		if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(fixture_proxy instanceof box2d.b2FixtureProxy); }
		/** @type {box2d.b2Fixture} */ var fixture = fixture_proxy.fixture;
		if (callback instanceof box2d.b2QueryCallback)
		{
			return callback.ReportFixture(fixture);
		}
		else //if (typeof(callback) === 'function')
		{
			return callback(fixture);
		}
	};

	broadPhase.Query(WorldQueryAABBWrapper, aabb);
//#if B2_ENABLE_PARTICLE
	if (callback instanceof box2d.b2QueryCallback)
	{
		for (/** @type {box2d.b2ParticleSystem} */ var p = this.m_particleSystemList; p; p = p.m_next)
		{
			if (callback.ShouldQueryParticleSystem(p))
			{
				p.QueryAABB(callback, aabb);
			}
		}
	}
//#endif
}

/** 
 * @export 
 * @return {void} 
 * @param 
 *  	  {box2d.b2QueryCallback|function(box2d.b2Fixture):boolean}
 *  	  callback
 * @param {box2d.b2Shape} shape
 * @param {box2d.b2Transform} transform
 * @param {number=} childIndex 
 */
box2d.b2World.prototype.QueryShape = function (callback, shape, transform, childIndex)
{
	/** @type {box2d.b2BroadPhase} */ var broadPhase = this.m_contactManager.m_broadPhase;

	/**
	 * @return {boolean} 
	 * @param {box2d.b2TreeNode} proxy 
	 */
	var WorldQueryShapeWrapper = function (proxy)
	{
		/* type {box2d.b2FixtureProxy} */ var fixture_proxy = broadPhase.GetUserData(proxy);
		if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(fixture_proxy instanceof box2d.b2FixtureProxy); }
		/** @type {box2d.b2Fixture} */ var fixture = fixture_proxy.fixture;
		if (box2d.b2TestOverlapShape(shape, 0, fixture.GetShape(), 0, transform, fixture.GetBody().GetTransform()))
		{
			if (callback instanceof box2d.b2QueryCallback)
			{
				return callback.ReportFixture(fixture);
			}
			else //if (typeof(callback) === 'function')
			{
				return callback(fixture);
			}
		}
		return true;
	};

	childIndex = childIndex || 0;
	/** @type {box2d.b2AABB} */ var aabb = box2d.b2World.prototype.QueryShape.s_aabb;
	shape.ComputeAABB(aabb, transform, childIndex);
	broadPhase.Query(WorldQueryShapeWrapper, aabb);
//#if B2_ENABLE_PARTICLE
	if (callback instanceof box2d.b2QueryCallback)
	{
		for (/** @type {box2d.b2ParticleSystem} */ var p = this.m_particleSystemList; p; p = p.m_next)
		{
			if (callback.ShouldQueryParticleSystem(p))
			{
				p.QueryAABB(callback, aabb);
			}
		}
	}
//#endif
}
box2d.b2World.prototype.QueryShape.s_aabb = new box2d.b2AABB();

/** 
 * @export 
 * @return {void} 
 * @param 
 *  	  {box2d.b2QueryCallback|function(box2d.b2Fixture):boolean}
 *  	  callback
 * @param {box2d.b2Vec2} point
 * @param {number=} slop 
 */
box2d.b2World.prototype.QueryPoint = function (callback, point, slop)
{
	/** @type {box2d.b2BroadPhase} */ var broadPhase = this.m_contactManager.m_broadPhase;

	/**
	 * @return {boolean} 
	 * @param {box2d.b2TreeNode} proxy 
	 */
	var WorldQueryWrapper = function (proxy)
	{
		/* type {box2d.b2FixtureProxy} */ var fixture_proxy = broadPhase.GetUserData(proxy);
		if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(fixture_proxy instanceof box2d.b2FixtureProxy); }
		/** @type {box2d.b2Fixture} */ var fixture = fixture_proxy.fixture;
		if (fixture.TestPoint(point))
		{
			if (callback instanceof box2d.b2QueryCallback)
			{
				return callback.ReportFixture(fixture);
			}
			else //if (typeof(callback) === 'function')
			{
				return callback(fixture);
			}
		}
		return true;
	};

	slop = (typeof(slop) === 'number')?(slop):(box2d.b2_linearSlop);
	/** @type {box2d.b2AABB} */ var aabb = box2d.b2World.prototype.QueryPoint.s_aabb;
	aabb.lowerBound.Set(point.x - slop, point.y - slop);
	aabb.upperBound.Set(point.x + slop, point.y + slop);
	broadPhase.Query(WorldQueryWrapper, aabb);
//#if B2_ENABLE_PARTICLE
	if (callback instanceof box2d.b2QueryCallback)
	{
		for (/** @type {box2d.b2ParticleSystem} */ var p = this.m_particleSystemList; p; p = p.m_next)
		{
			if (callback.ShouldQueryParticleSystem(p))
			{
				p.QueryAABB(callback, aabb);
			}
		}
	}
//#endif
}
box2d.b2World.prototype.QueryPoint.s_aabb = new box2d.b2AABB();

/** 
 * Ray-cast the world for all fixtures in the path of the ray. 
 * Your callback controls whether you get the closest point, any 
 * point, or n-points. The ray-cast ignores shapes that contain 
 * the starting point. 
 * @export 
 * @return {void} 
 * @param 
 *  	  {box2d.b2RayCastCallback|function(box2d.b2Fixture,box2d.b2Vec2,box2d.b2Vec2,number):number}
 *  	  callback a user implemented callback class.
 * @param {box2d.b2Vec2} point1 the ray starting point
 * @param {box2d.b2Vec2} point2 the ray ending point
 */
box2d.b2World.prototype.RayCast = function (callback, point1, point2)
{
	/** @type {box2d.b2BroadPhase} */ var broadPhase = this.m_contactManager.m_broadPhase;

	/**
	 * @return {number} 
	 * @param {box2d.b2RayCastInput} input 
	 * @param {box2d.b2TreeNode} proxy 
	 */
	var WorldRayCastWrapper = function (input, proxy)
	{
		/* type {box2d.b2FixtureProxy} */ var fixture_proxy = broadPhase.GetUserData(proxy);
		if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(fixture_proxy instanceof box2d.b2FixtureProxy); }
		/** @type {box2d.b2Fixture} */ var fixture = fixture_proxy.fixture;
		/** @type {number} */ var index = fixture_proxy.childIndex;
		/** @type {box2d.b2RayCastOutput} */ var output = box2d.b2World.prototype.RayCast.s_output;
		/** @type {boolean} */ var hit = fixture.RayCast(output, input, index);

		if (hit)
		{
			/** @type {number} */ var fraction = output.fraction;
			/** @type {box2d.b2Vec2} */ var point = box2d.b2World.prototype.RayCast.s_point;
			point.Set((1 - fraction) * point1.x + fraction * point2.x, (1 - fraction) * point1.y + fraction * point2.y);

			if (callback instanceof box2d.b2RayCastCallback)
			{
				return callback.ReportFixture(fixture, point, output.normal, fraction);
			}
			else //if (typeof(callback) === 'function')
			{
				return callback(fixture, point, output.normal, fraction);
			}
		}
		return input.maxFraction;
	};

	/** @type {box2d.b2RayCastInput} */ var input = box2d.b2World.prototype.RayCast.s_input;
	input.maxFraction = 1;
	input.p1.Copy(point1);
	input.p2.Copy(point2);
	broadPhase.RayCast(WorldRayCastWrapper, input);
//#if B2_ENABLE_PARTICLE
	if (callback instanceof box2d.b2RayCastCallback)
	{
		for (/** @type {box2d.b2ParticleSystem} */ var p = this.m_particleSystemList; p; p = p.m_next)
		{
			if (callback.ShouldQueryParticleSystem(p))
			{
				p.RayCast(callback, point1, point2);
			}
		}
	}
//#endif
}
box2d.b2World.prototype.RayCast.s_input = new box2d.b2RayCastInput();
box2d.b2World.prototype.RayCast.s_output = new box2d.b2RayCastOutput();
box2d.b2World.prototype.RayCast.s_point = new box2d.b2Vec2();

/** 
 * @export 
 * @return {box2d.b2Fixture} 
 * @param {box2d.b2Vec2} point1
 * @param {box2d.b2Vec2} point2 
 */
box2d.b2World.prototype.RayCastOne = function (point1, point2)
{
	/** @type {box2d.b2Fixture} */ var result = null;
	/** @type {number} */ var min_fraction = 1;

	/**
	 * @return {number} 
	 * @param {box2d.b2Fixture} fixture 
	 * @param {box2d.b2Vec2} point 
	 * @param {box2d.b2Vec2} normal 
	 * @param {number} fraction
	 */
	function WorldRayCastOneWrapper(fixture, point, normal, fraction)
	{
		if (fraction < min_fraction)
		{
			min_fraction = fraction;
			result = fixture;
		}

		return min_fraction;
	};

	this.RayCast(WorldRayCastOneWrapper, point1, point2);

	return result;
}

/** 
 * @export 
 * @return {Array.<box2d.b2Fixture>} 
 * @param {box2d.b2Vec2} point1
 * @param {box2d.b2Vec2} point2 
 * @param {Array.<box2d.b2Fixture>} out
 */
box2d.b2World.prototype.RayCastAll = function (point1, point2, out)
{
	out.length = 0;

	/**
	 * @return {number} 
	 * @param {box2d.b2Fixture} fixture 
	 * @param {box2d.b2Vec2} point 
	 * @param {box2d.b2Vec2} normal 
	 * @param {number} fraction
	 */
	function WorldRayCastAllWrapper(fixture, point, normal, fraction)
	{
		out.push(fixture);
		return 1;
	};

	this.RayCast(WorldRayCastAllWrapper, point1, point2);

	return out;
}

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2Fixture} fixture 
 * @param {box2d.b2Color} color 
 */
box2d.b2World.prototype.DrawShape = function (fixture, color)
{
	/** @type {box2d.b2Shape} */ var shape = fixture.GetShape();

	switch (shape.m_type)
	{
	case box2d.b2ShapeType.e_circleShape:
		{
			/** @type {box2d.b2CircleShape} */ var circle = ((shape instanceof box2d.b2CircleShape ? shape : null));

			/** @type {box2d.b2Vec2} */ var center = circle.m_p;
			/** @type {number} */ var radius = circle.m_radius;
			/** @type {box2d.b2Vec2} */ var axis = box2d.b2Vec2.UNITX;

			this.m_debugDraw.DrawSolidCircle(center, radius, axis, color);
		}
		break;

	case box2d.b2ShapeType.e_edgeShape:
		{
			/** @type {box2d.b2EdgeShape} */ var edge = ((shape instanceof box2d.b2EdgeShape ? shape : null));
			/** @type {box2d.b2Vec2} */ var v1 = edge.m_vertex1;
			/** @type {box2d.b2Vec2} */ var v2 = edge.m_vertex2;
			this.m_debugDraw.DrawSegment(v1, v2, color);
		}
		break;

	case box2d.b2ShapeType.e_chainShape:
		{
			/** @type {box2d.b2ChainShape} */ var chain = ((shape instanceof box2d.b2ChainShape ? shape : null));
			/** @type {number} */ var count = chain.m_count;
			/* type {Array.<box2d.b2Vec2>} */ var vertices = chain.m_vertices;

			/* type {box2d.b2Vec2} */ var v1 = vertices[0];
			this.m_debugDraw.DrawCircle(v1, 0.05, color);
			for (/** @type {number} */ var i = 1; i < count; ++i)
			{
				/* type {box2d.b2Vec2} */ var v2 = vertices[i];
				this.m_debugDraw.DrawSegment(v1, v2, color);
				this.m_debugDraw.DrawCircle(v2, 0.05, color);
				v1 = v2;
			}
		}
		break;

	case box2d.b2ShapeType.e_polygonShape:
		{
			/** @type {box2d.b2PolygonShape} */ var poly = ((shape instanceof box2d.b2PolygonShape ? shape : null));
			/** @type {number} */ var vertexCount = poly.m_count;
			/* type {Array.<box2d.b2Vec2>} */ var vertices = poly.m_vertices;

			this.m_debugDraw.DrawSolidPolygon(vertices, vertexCount, color);
		}
		break;
	}
}

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2Joint} joint
 */
box2d.b2World.prototype.DrawJoint = function (joint)
{
	/** @type {box2d.b2Body} */ var bodyA = joint.GetBodyA();
	/** @type {box2d.b2Body} */ var bodyB = joint.GetBodyB();
	/** @type {box2d.b2Transform} */ var xf1 = bodyA.m_xf;
	/** @type {box2d.b2Transform} */ var xf2 = bodyB.m_xf;
	/** @type {box2d.b2Vec2} */ var x1 = xf1.p;
	/** @type {box2d.b2Vec2} */ var x2 = xf2.p;
	/** @type {box2d.b2Vec2} */ var p1 = joint.GetAnchorA(box2d.b2World.prototype.DrawJoint.s_p1);
	/** @type {box2d.b2Vec2} */ var p2 = joint.GetAnchorB(box2d.b2World.prototype.DrawJoint.s_p2);

	/** @type {box2d.b2Color} */ var color = box2d.b2World.prototype.DrawJoint.s_color.SetRGB(0.5, 0.8, 0.8);

	switch (joint.m_type)
	{
	case box2d.b2JointType.e_distanceJoint:
		this.m_debugDraw.DrawSegment(p1, p2, color);
		break;

	case box2d.b2JointType.e_pulleyJoint:
		{
			/** @type {box2d.b2PulleyJoint} */ var pulley = ((joint instanceof box2d.b2PulleyJoint ? joint : null));
			/** @type {box2d.b2Vec2} */ var s1 = pulley.GetGroundAnchorA(box2d.b2World.prototype.DrawJoint.s_s1);
			/** @type {box2d.b2Vec2} */ var s2 = pulley.GetGroundAnchorB(box2d.b2World.prototype.DrawJoint.s_s2);
			this.m_debugDraw.DrawSegment(s1, p1, color);
			this.m_debugDraw.DrawSegment(s2, p2, color);
			this.m_debugDraw.DrawSegment(s1, s2, color);
		}
		break;

	case box2d.b2JointType.e_mouseJoint:
		// don't draw this
		this.m_debugDraw.DrawSegment(p1, p2, color);
		break;

	default:
		this.m_debugDraw.DrawSegment(x1, p1, color);
		this.m_debugDraw.DrawSegment(p1, p2, color);
		this.m_debugDraw.DrawSegment(x2, p2, color);
	}
}
box2d.b2World.prototype.DrawJoint.s_p1 = new box2d.b2Vec2();
box2d.b2World.prototype.DrawJoint.s_p2 = new box2d.b2Vec2();
box2d.b2World.prototype.DrawJoint.s_color = new box2d.b2Color(0.5, 0.8, 0.8);
box2d.b2World.prototype.DrawJoint.s_s1 = new box2d.b2Vec2();
box2d.b2World.prototype.DrawJoint.s_s2 = new box2d.b2Vec2();

//#if B2_ENABLE_PARTICLE

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2ParticleSystem} system
 */
box2d.b2World.prototype.DrawParticleSystem = function (system)
{
	var particleCount = system.GetParticleCount();
	if (particleCount)
	{
		var radius = system.GetRadius();
		var positionBuffer = system.GetPositionBuffer();
		if (system.m_colorBuffer.data)
		{
			var colorBuffer = system.GetColorBuffer();
			this.m_debugDraw.DrawParticles(positionBuffer, radius, colorBuffer, particleCount);
		}
		else
		{
			this.m_debugDraw.DrawParticles(positionBuffer, radius, null, particleCount);
		}
	}
}

//#endif

/**
 * Call this to draw shapes and other debug draw data.
 * @export 
 * @return {void} 
 */
box2d.b2World.prototype.DrawDebugData = function ()
{
	if (this.m_debugDraw === null)
	{
		return;
	}

	/** @type {number} */ var flags = this.m_debugDraw.GetFlags();
	/** @type {box2d.b2Color} */ var color = box2d.b2World.prototype.DrawDebugData.s_color.SetRGB(0, 0, 0);

	if (flags & box2d.b2DrawFlags.e_shapeBit)
	{
		for (/** @type {box2d.b2Body} */ var b = this.m_bodyList; b; b = b.m_next)
		{
			/** @type {box2d.b2Transform} */ var xf = b.m_xf;

			this.m_debugDraw.PushTransform(xf);

			for (/** @type {box2d.b2Fixture} */ var f = b.GetFixtureList(); f; f = f.m_next)
			{
				if (!b.IsActive())
				{
					color.SetRGB(0.5, 0.5, 0.3);
					this.DrawShape(f, color);
				}
				else if (b.GetType() === box2d.b2BodyType.b2_staticBody)
				{
					color.SetRGB(0.5, 0.9, 0.5);
					this.DrawShape(f, color);
				}
				else if (b.GetType() === box2d.b2BodyType.b2_kinematicBody)
				{
					color.SetRGB(0.5, 0.5, 0.9);
					this.DrawShape(f, color);
				}
				else if (!b.IsAwake())
				{
					color.SetRGB(0.6, 0.6, 0.6);
					this.DrawShape(f, color);
				}
				else
				{
					color.SetRGB(0.9, 0.7, 0.7);
					this.DrawShape(f, color);
				}
			}

			this.m_debugDraw.PopTransform(xf);
		}
	}

//#if B2_ENABLE_PARTICLE
	if (flags & box2d.b2DrawFlags.e_particleBit)
	{
		for (/** @type {box2d.b2ParticleSystem} */ var p = this.m_particleSystemList; p; p = p.m_next)
		{
			this.DrawParticleSystem(p);
		}
	}
//#endif

	if (flags & box2d.b2DrawFlags.e_jointBit)
	{
		for (/** @type {box2d.b2Joint} */ var j = this.m_jointList; j; j = j.m_next)
		{
			this.DrawJoint(j);
		}
	}

	/*
	if (flags & box2d.b2DrawFlags.e_pairBit)
	{
		color.SetRGB(0.3, 0.9, 0.9);
		for (var contact = this.m_contactManager.m_contactList; contact; contact = contact.m_next)
		{
			var fixtureA = contact.GetFixtureA();
			var fixtureB = contact.GetFixtureB();

			var cA = fixtureA.GetAABB().GetCenter();
			var cB = fixtureB.GetAABB().GetCenter();

			this.m_debugDraw.DrawSegment(cA, cB, color);
		}
	}
	*/

	if (flags & box2d.b2DrawFlags.e_aabbBit)
	{
		color.SetRGB(0.9, 0.3, 0.9);
		/** @type {box2d.b2BroadPhase} */ var bp = this.m_contactManager.m_broadPhase;
		/** @type {Array.<box2d.b2Vec2>} */ var vs = box2d.b2World.prototype.DrawDebugData.s_vs;

		for (/* type {box2d.b2Body} */ var b = this.m_bodyList; b; b = b.m_next)
		{
			if (!b.IsActive())
			{
				continue;
			}

			for (/* type {box2d.b2Fixture} */ var f = b.GetFixtureList(); f; f = f.m_next)
			{
				for (/** @type {number} */ var i = 0; i < f.m_proxyCount; ++i)
				{
					/** @type {box2d.b2FixtureProxy} */ var proxy = f.m_proxies[i];

					/** @type {box2d.b2AABB} */ var aabb = bp.GetFatAABB(proxy.proxy);
					vs[0].Set(aabb.lowerBound.x, aabb.lowerBound.y);
					vs[1].Set(aabb.upperBound.x, aabb.lowerBound.y);
					vs[2].Set(aabb.upperBound.x, aabb.upperBound.y);
					vs[3].Set(aabb.lowerBound.x, aabb.upperBound.y);
	
					this.m_debugDraw.DrawPolygon(vs, 4, color);
				}
			}
		}
	}

	if (flags & box2d.b2DrawFlags.e_centerOfMassBit)
	{
		for (/* type {box2d.b2Body} */ var b = this.m_bodyList; b; b = b.m_next)
		{
			/* type {box2d.b2Transform} */ var xf = box2d.b2World.prototype.DrawDebugData.s_xf;
			xf.q.Copy(b.m_xf.q);
			xf.p.Copy(b.GetWorldCenter());
			this.m_debugDraw.DrawTransform(xf);
		}
	}

//#if B2_ENABLE_CONTROLLER
	/// @see box2d.b2Controller list
	if (flags & box2d.b2DrawFlags.e_controllerBit)
	{
		for (/** @type {box2d.b2Controller} */ var c = this.m_controllerList; c; c = c.m_next)
		{
			c.Draw(this.m_debugDraw);
		}
	}
//#endif
}
box2d.b2World.prototype.DrawDebugData.s_color = new box2d.b2Color(0, 0, 0);
box2d.b2World.prototype.DrawDebugData.s_vs = box2d.b2Vec2.MakeArray(4);
box2d.b2World.prototype.DrawDebugData.s_xf = new box2d.b2Transform();

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2BroadPhase} broadPhase
 */
box2d.b2World.prototype.SetBroadPhase = function (broadPhase)
{
	var oldBroadPhase = this.m_contactManager.m_broadPhase;

	this.m_contactManager.m_broadPhase = broadPhase;

	for (/** @type {box2d.b2Body} */ var b = this.m_bodyList; b; b = b.m_next)
	{
		for (/** @type {box2d.b2Fixture} */ var f = b.m_fixtureList; f; f = f.m_next)
		{
			f.m_proxy = broadPhase.CreateProxy(oldBroadPhase.GetFatAABB(f.m_proxy), f);
		}
	}
}

//#if B2_ENABLE_PARTICLE

/** 
 * Recommend a value to be used in `Step` for 
 * `particleIterations`. This calculation is necessarily a 
 * simplification and should only be used as a starting point. 
 * Please see "Particle Iterations" in the Programmer's Guide 
 * for details. 
 *  
 * @export 
 * @return {number} 
 * @param {number} timeStep is the value to be passed into 
 *  	  `Step`.
 */
box2d.b2World.prototype.CalculateReasonableParticleIterations = function (timeStep)
{
	if (this.m_particleSystemList === null)
	{
		return 1;
	}

	function GetSmallestRadius(world)
	{
		var smallestRadius = box2d.b2_maxFloat;
		for (/** @type {box2d.b2ParticleSystem} */ var system = world.GetParticleSystemList();
			  system !== null;
			  system = system.m_next)
		{
			smallestRadius = box2d.b2Min(smallestRadius, system.GetRadius());
		}
		return smallestRadius;
	}

	// Use the smallest radius, since that represents the worst-case.
	return box2d.b2CalculateParticleIterations(this.m_gravity.Length(), GetSmallestRadius(this), timeStep);
}

//#endif

/** 
 * Get the number of broad-phase proxies. 
 * @export 
 * @return {number}
 */
box2d.b2World.prototype.GetProxyCount = function ()
{
	return this.m_contactManager.m_broadPhase.GetProxyCount();
}

/** 
 * Get the height of the dynamic tree. 
 * @export 
 * @return {number}
 */
box2d.b2World.prototype.GetTreeHeight = function ()
{
	return this.m_contactManager.m_broadPhase.GetTreeHeight();
}

/** 
 * Get the balance of the dynamic tree. 
 * @export 
 * @return {number}
 */
box2d.b2World.prototype.GetTreeBalance = function ()
{
	return this.m_contactManager.m_broadPhase.GetTreeBalance();
}

/** 
 * Get the quality metric of the dynamic tree. The smaller the 
 * better. The minimum is 1. 
 * @export 
 * @return {number}
 */
box2d.b2World.prototype.GetTreeQuality = function ()
{
	return this.m_contactManager.m_broadPhase.GetTreeQuality();
}

/** 
 * Shift the world origin. Useful for large worlds. 
 * The body shift formula is: position -= newOrigin
 * @export 
 * @return {void} 
 * @param {box2d.b2Vec2} newOrigin the new origin with respect to the old origin
 */
box2d.b2World.prototype.ShiftOrigin = function (newOrigin)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(!this.IsLocked()); }
	if (this.IsLocked())
	{
		return;
	}

	for (/** @type {box2d.b2Body} */ var b = this.m_bodyList; b; b = b.m_next)
	{
		b.m_xf.p.SelfSub(newOrigin);
		b.m_sweep.c0.SelfSub(newOrigin);
		b.m_sweep.c.SelfSub(newOrigin);
	}

	for (/** @type {box2d.b2Joint} */ var j = this.m_jointList; j; j = j.m_next)
	{
		j.ShiftOrigin(newOrigin);
	}

	this.m_contactManager.m_broadPhase.ShiftOrigin(newOrigin);
}

/** 
 * Dump the world into the log file. 
 * warning this should be called outside of a time step.
 * @export 
 * @return {void}
 */
box2d.b2World.prototype.Dump = function ()
{
	if (box2d.DEBUG)
	{
		if (this.m_flag_locked)
		{
			return;
		}
	
		box2d.b2Log("/** @type {box2d.b2Vec2} */ var g = new box2d.b2Vec2(%.15f, %.15f);\n", this.m_gravity.x, this.m_gravity.y);
		box2d.b2Log("this.m_world.SetGravity(g);\n");
	
		box2d.b2Log("/** @type {Array.<box2d.b2Body>} */ var bodies = new Array(%d);\n", this.m_bodyCount);
		box2d.b2Log("/** @type {Array.<box2d.b2Joint>} */ var joints = new Array(%d);\n", this.m_jointCount);
		var i = 0;
		for (/** @type {box2d.b2Body} */ var b = this.m_bodyList; b; b = b.m_next)
		{
			b.m_islandIndex = i;
			b.Dump();
			++i;
		}
	
		i = 0;
		for (/** @type {box2d.b2Joint} */ var j = this.m_jointList; j; j = j.m_next)
		{
			j.m_index = i;
			++i;
		}
	
		// First pass on joints, skip gear joints.
		for (/* type {box2d.b2Joint} */ var j = this.m_jointList; j; j = j.m_next)
		{
			if (j.m_type === box2d.b2JointType.e_gearJoint)
			{
				continue;
			}
	
			box2d.b2Log("{\n");
			j.Dump();
			box2d.b2Log("}\n");
		}
	
		// Second pass on joints, only gear joints.
		for (/* type {box2d.b2Joint} */ var j = this.m_jointList; j; j = j.m_next)
		{
			if (j.m_type !== box2d.b2JointType.e_gearJoint)
			{
				continue;
			}
	
			box2d.b2Log("{\n");
			j.Dump();
			box2d.b2Log("}\n");
		}
	}
}

//#if B2_ENABLE_CONTROLLER

/**
 * @see box2d.b2Controller list 
 * @export 
 * @return {box2d.b2Controller} 
 * @param {box2d.b2Controller} controller
 */
box2d.b2World.prototype.AddController = function (controller)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(controller.m_world === null, "Controller can only be a member of one world"); }
	controller.m_world = this;
	controller.m_next = this.m_controllerList;
	controller.m_prev = null;
	if (this.m_controllerList)
		this.m_controllerList.m_prev = controller;
	this.m_controllerList = controller;
	++this.m_controllerCount;
	return controller;
}

/**
 * @see box2d.b2Controller list
 * @export 
 * @return {void} 
 * @param {box2d.b2Controller} controller
 */
box2d.b2World.prototype.RemoveController = function (controller)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(controller.m_world === this, "Controller is not a member of this world"); }
	if (controller.m_prev)
		controller.m_prev.m_next = controller.m_next;
	if (controller.m_next)
		controller.m_next.m_prev = controller.m_prev;
	if (this.m_controllerList === controller)
		this.m_controllerList = controller.m_next;
	--this.m_controllerCount;
	controller.m_prev = null;
	controller.m_next = null;
	controller.m_world = null;
}

//#endif

