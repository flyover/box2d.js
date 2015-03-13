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

goog.provide('box2d.b2ContactManager');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Math');
goog.require('box2d.b2Collision');
goog.require('box2d.b2BroadPhase');
goog.require('box2d.b2ContactFactory');

/** 
 * Delegate of box2d.b2World. 
 * @constructor
 */
box2d.b2ContactManager = function ()
{
	this.m_broadPhase = new box2d.b2BroadPhase();

	this.m_contactFactory = new box2d.b2ContactFactory(this.m_allocator);
}

/**
 * @export 
 * @type {box2d.b2BroadPhase}
 */
box2d.b2ContactManager.prototype.m_broadPhase = null;
/**
 * @export 
 * @type {box2d.b2Contact} 
 */
box2d.b2ContactManager.prototype.m_contactList = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactManager.prototype.m_contactCount = 0;
/**
 * @export 
 * @type {box2d.b2ContactFilter}
 */
box2d.b2ContactManager.prototype.m_contactFilter = box2d.b2ContactFilter.b2_defaultFilter;
/**
 * @export 
 * @type {box2d.b2ContactListener}
 */
box2d.b2ContactManager.prototype.m_contactListener = box2d.b2ContactListener.b2_defaultListener;
/**
 * @export 
 * @type {*}
 */
box2d.b2ContactManager.prototype.m_allocator = null; 

/**
 * @export 
 * @type {box2d.b2ContactFactory}
 */
box2d.b2ContactManager.prototype.m_contactFactory = null;

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2Contact} c
 */
box2d.b2ContactManager.prototype.Destroy = function (c)
{
	var fixtureA = c.GetFixtureA();
	var fixtureB = c.GetFixtureB();
	var bodyA = fixtureA.GetBody();
	var bodyB = fixtureB.GetBody();

	if (this.m_contactListener && c.IsTouching())
	{
		this.m_contactListener.EndContact(c);
	}

	// Remove from the world.
	if (c.m_prev)
	{
		c.m_prev.m_next = c.m_next;
	}

	if (c.m_next)
	{
		c.m_next.m_prev = c.m_prev;
	}

	if (c === this.m_contactList)
	{
		this.m_contactList = c.m_next;
	}

	// Remove from body 1
	if (c.m_nodeA.prev)
	{
		c.m_nodeA.prev.next = c.m_nodeA.next;
	}

	if (c.m_nodeA.next)
	{
		c.m_nodeA.next.prev = c.m_nodeA.prev;
	}

	if (c.m_nodeA === bodyA.m_contactList)
	{
		bodyA.m_contactList = c.m_nodeA.next;
	}

	// Remove from body 2
	if (c.m_nodeB.prev)
	{
		c.m_nodeB.prev.next = c.m_nodeB.next;
	}

	if (c.m_nodeB.next)
	{
		c.m_nodeB.next.prev = c.m_nodeB.prev;
	}

	if (c.m_nodeB === bodyB.m_contactList)
	{
		bodyB.m_contactList = c.m_nodeB.next;
	}

	// Call the factory.
	this.m_contactFactory.Destroy(c);
	--this.m_contactCount;
}

/** 
 * This is the top level collision call for the time step. Here 
 * all the narrow phase collision is processed for the world 
 * contact list. 
 * @export 
 * @return {void}
 */
box2d.b2ContactManager.prototype.Collide = function ()
{
	// Update awake contacts.
	var c = this.m_contactList;
	while (c)
	{
		var fixtureA = c.GetFixtureA();
		var fixtureB = c.GetFixtureB();
		var indexA = c.GetChildIndexA();
		var indexB = c.GetChildIndexB();
		var bodyA = fixtureA.GetBody();
		var bodyB = fixtureB.GetBody();

		// Is this contact flagged for filtering?
		if (c.m_flag_filterFlag)
		{
			// Should these bodies collide?
			if (!bodyB.ShouldCollide(bodyA))
			{
				var cNuke = c;
				c = cNuke.m_next;
				this.Destroy(cNuke);
				continue;
			}

			// Check user filtering.
			if (this.m_contactFilter && !this.m_contactFilter.ShouldCollide(fixtureA, fixtureB))
			{
				cNuke = c;
				c = cNuke.m_next;
				this.Destroy(cNuke);
				continue;
			}

			// Clear the filtering flag.
			c.m_flag_filterFlag = false;
		}

		var activeA = bodyA.IsAwake() && bodyA.m_type !== box2d.b2BodyType.b2_staticBody;
		var activeB = bodyB.IsAwake() && bodyB.m_type !== box2d.b2BodyType.b2_staticBody;

		// At least one body must be awake and it must be dynamic or kinematic.
		if (!activeA && !activeB)
		{
			c = c.m_next;
			continue;
		}

		var proxyA = fixtureA.m_proxies[indexA].proxy;
		var proxyB = fixtureB.m_proxies[indexB].proxy;
		var overlap = this.m_broadPhase.TestOverlap(proxyA, proxyB);

		// Here we destroy contacts that cease to overlap in the broad-phase.
		if (!overlap)
		{
			cNuke = c;
			c = cNuke.m_next;
			this.Destroy(cNuke);
			continue;
		}

		// The contact persists.
		c.Update(this.m_contactListener);
		c = c.m_next;
	}
}

/**
 * @export 
 * @return {void} 
 */
box2d.b2ContactManager.prototype.FindNewContacts = function ()
{
	this.m_broadPhase.UpdatePairs(this);
}

/** 
 * Broad-phase callback. 
 * @export 
 * @return {void} 
 * @param {box2d.b2FixtureProxy} proxyUserDataA
 * @param {box2d.b2FixtureProxy} proxyUserDataB
 */
box2d.b2ContactManager.prototype.AddPair = function (proxyUserDataA, proxyUserDataB)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(proxyUserDataA instanceof box2d.b2FixtureProxy); }
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(proxyUserDataB instanceof box2d.b2FixtureProxy); }
	var proxyA = proxyUserDataA;//(proxyUserDataA instanceof box2d.b2FixtureProxy ? proxyUserDataA : null);
	var proxyB = proxyUserDataB;//(proxyUserDataB instanceof box2d.b2FixtureProxy ? proxyUserDataB : null);

	var fixtureA = proxyA.fixture;
	var fixtureB = proxyB.fixture;

	var indexA = proxyA.childIndex;
	var indexB = proxyB.childIndex;

	var bodyA = fixtureA.GetBody();
	var bodyB = fixtureB.GetBody();

	// Are the fixtures on the same body?
	if (bodyA === bodyB)
	{
		return;
	}

	// TODO_ERIN use a hash table to remove a potential bottleneck when both
	// bodies have a lot of contacts.
	// Does a contact already exist?
	var edge = bodyB.GetContactList();
	while (edge)
	{
		if (edge.other === bodyA)
		{
			var fA = edge.contact.GetFixtureA();
			var fB = edge.contact.GetFixtureB();
			var iA = edge.contact.GetChildIndexA();
			var iB = edge.contact.GetChildIndexB();

			if (fA === fixtureA && fB === fixtureB && iA === indexA && iB === indexB)
			{
				// A contact already exists.
				return;
			}

			if (fA === fixtureB && fB === fixtureA && iA === indexB && iB === indexA)
			{
				// A contact already exists.
				return;
			}
		}

		edge = edge.next;
	}

	// Does a joint override collision? Is at least one body dynamic?
	if (!bodyB.ShouldCollide(bodyA))
	{
		return;
	}

	// Check user filtering.
	if (this.m_contactFilter && !this.m_contactFilter.ShouldCollide(fixtureA, fixtureB))
	{
		return;
	}

	// Call the factory.
	var c = this.m_contactFactory.Create(fixtureA, indexA, fixtureB, indexB);
	if (c === null)
	{
		return;
	}

	// Contact creation may swap fixtures.
	fixtureA = c.GetFixtureA();
	fixtureB = c.GetFixtureB();
	//indexA = c.GetChildIndexA();
	//indexB = c.GetChildIndexB();
	bodyA = fixtureA.m_body;
	bodyB = fixtureB.m_body;

	// Insert into the world.
	c.m_prev = null;
	c.m_next = this.m_contactList;
	if (this.m_contactList !== null)
	{
		this.m_contactList.m_prev = c;
	}
	this.m_contactList = c;

	// Connect to island graph.

	// Connect to body A
	c.m_nodeA.contact = c;
	c.m_nodeA.other = bodyB;

	c.m_nodeA.prev = null;
	c.m_nodeA.next = bodyA.m_contactList;
	if (bodyA.m_contactList !== null)
	{
		bodyA.m_contactList.prev = c.m_nodeA;
	}
	bodyA.m_contactList = c.m_nodeA;

	// Connect to body B
	c.m_nodeB.contact = c;
	c.m_nodeB.other = bodyA;

	c.m_nodeB.prev = null;
	c.m_nodeB.next = bodyB.m_contactList;
	if (bodyB.m_contactList !== null)
	{
		bodyB.m_contactList.prev = c.m_nodeB;
	}
	bodyB.m_contactList = c.m_nodeB;

	// Wake up the bodies
	if (!fixtureA.IsSensor() && !fixtureB.IsSensor())
	{
		bodyA.SetAwake(true);
		bodyB.SetAwake(true);
	}

	++this.m_contactCount;
}

