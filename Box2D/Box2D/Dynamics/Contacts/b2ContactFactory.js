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

goog.provide('box2d.b2ContactFactory');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Contact');

/**
 * @export
 * @constructor
 */
box2d.b2ContactRegister = function ()
{
};

box2d.b2ContactRegister.prototype.createFcn = null;
box2d.b2ContactRegister.prototype.destroyFcn = null;
box2d.b2ContactRegister.prototype.primary = false;

/**
 * @export
 * @constructor
 * @param allocator
 */
box2d.b2ContactFactory = function (allocator)
{
	this.m_allocator = allocator;
	this.InitializeRegisters();
}

box2d.b2ContactFactory.prototype.m_allocator = null;

/**
 * @export
 * @return {void}
 * @param createFcn
 * @param destroyFcn
 * @param {box2d.b2ShapeType} type1
 * @param {box2d.b2ShapeType} type2
 */
box2d.b2ContactFactory.prototype.AddType = function (createFcn, destroyFcn, type1, type2)
{
	var pool = box2d.b2MakeArray(256, function (i) { return createFcn(); } ); // TODO: b2Settings

	var poolCreateFcn = function (allocator)
	{
		if (pool.length > 0)
		{
			return pool.pop();
		}

		return createFcn(allocator);
	}

	var poolDestroyFcn = function (contact, allocator)
	{
		pool.push(contact);
	}

	this.m_registers[type1][type2].pool = pool;
	this.m_registers[type1][type2].createFcn = poolCreateFcn;
	this.m_registers[type1][type2].destroyFcn = poolDestroyFcn;
	this.m_registers[type1][type2].primary = true;

	if (type1 !== type2)
	{
		this.m_registers[type2][type1].pool = pool;
		this.m_registers[type2][type1].createFcn = poolCreateFcn;
		this.m_registers[type2][type1].destroyFcn = poolDestroyFcn;
		this.m_registers[type2][type1].primary = false;
	}

	/*
	this.m_registers[type1][type2].createFcn = createFcn;
	this.m_registers[type1][type2].destroyFcn = destroyFcn;
	this.m_registers[type1][type2].primary = true;

	if (type1 !== type2)
	{
		this.m_registers[type2][type1].createFcn = createFcn;
		this.m_registers[type2][type1].destroyFcn = destroyFcn;
		this.m_registers[type2][type1].primary = false;
	}
	*/
}

/**
 * @export
 * @return {void}
 */
box2d.b2ContactFactory.prototype.InitializeRegisters = function ()
{
	this.m_registers = new Array(box2d.b2ShapeType.e_shapeTypeCount);

	for (var i = 0; i < box2d.b2ShapeType.e_shapeTypeCount; i++)
	{
		this.m_registers[i] = new Array(box2d.b2ShapeType.e_shapeTypeCount);

		for (var j = 0; j < box2d.b2ShapeType.e_shapeTypeCount; j++)
		{
			this.m_registers[i][j] = new box2d.b2ContactRegister();
		}
	}

	this.AddType(box2d.b2CircleContact.Create, box2d.b2CircleContact.Destroy, box2d.b2ShapeType.e_circleShape, box2d.b2ShapeType.e_circleShape);
	this.AddType(box2d.b2PolygonAndCircleContact.Create, box2d.b2PolygonAndCircleContact.Destroy, box2d.b2ShapeType.e_polygonShape, box2d.b2ShapeType.e_circleShape);
	this.AddType(box2d.b2PolygonContact.Create, box2d.b2PolygonContact.Destroy, box2d.b2ShapeType.e_polygonShape, box2d.b2ShapeType.e_polygonShape);
	this.AddType(box2d.b2EdgeAndCircleContact.Create, box2d.b2EdgeAndCircleContact.Destroy, box2d.b2ShapeType.e_edgeShape, box2d.b2ShapeType.e_circleShape);
	this.AddType(box2d.b2EdgeAndPolygonContact.Create, box2d.b2EdgeAndPolygonContact.Destroy, box2d.b2ShapeType.e_edgeShape, box2d.b2ShapeType.e_polygonShape);
	this.AddType(box2d.b2ChainAndCircleContact.Create, box2d.b2ChainAndCircleContact.Destroy, box2d.b2ShapeType.e_chainShape, box2d.b2ShapeType.e_circleShape);
	this.AddType(box2d.b2ChainAndPolygonContact.Create, box2d.b2ChainAndPolygonContact.Destroy, box2d.b2ShapeType.e_chainShape, box2d.b2ShapeType.e_polygonShape);
}

/**
 * @export
 * @return {box2d.b2Contact}
 * @param {box2d.b2Fixture} fixtureA
 * @param {number} indexA
 * @param {box2d.b2Fixture} fixtureB
 * @param {number} indexB
 */
box2d.b2ContactFactory.prototype.Create = function (fixtureA, indexA, fixtureB, indexB)
{
	var type1 = fixtureA.GetType();
	var type2 = fixtureB.GetType();

	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(0 <= type1 && type1 < box2d.b2ShapeType.e_shapeTypeCount); }
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(0 <= type2 && type2 < box2d.b2ShapeType.e_shapeTypeCount); }

	var reg = this.m_registers[type1][type2];

	var createFcn = reg.createFcn;
	if (createFcn !== null)
	{
		if (reg.primary)
		{
			var c = createFcn(this.m_allocator);
			c.Reset(fixtureA, indexA, fixtureB, indexB);
			return c;
		}
		else
		{
			var c = createFcn(this.m_allocator);
			c.Reset(fixtureB, indexB, fixtureA, indexA);
			return c;
		}
	}
	else
	{
		return null;
	}
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2Contact} contact
 */
box2d.b2ContactFactory.prototype.Destroy = function (contact)
{
	var fixtureA = contact.m_fixtureA;
	var fixtureB = contact.m_fixtureB;

	if (contact.m_manifold.pointCount > 0 &&
		!fixtureA.IsSensor() &&
		!fixtureB.IsSensor())
	{
		fixtureA.GetBody().SetAwake(true);
		fixtureB.GetBody().SetAwake(true);
	}

	var typeA = fixtureA.GetType();
	var typeB = fixtureB.GetType();

	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(0 <= typeA && typeB < box2d.b2ShapeType.e_shapeTypeCount); }
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(0 <= typeA && typeB < box2d.b2ShapeType.e_shapeTypeCount); }

	var reg = this.m_registers[typeA][typeB];

	var destroyFcn = reg.destroyFcn;
	destroyFcn(contact, this.m_allocator);
}

