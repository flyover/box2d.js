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

goog.provide('box2d.b2Fixture');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Collision');
goog.require('box2d.b2Shape');

/** 
 * This holds contact filtering data. 
 * @export 
 * @constructor 
 */
box2d.b2Filter = function() {};

/** 
 * The collision category bits. Normally you would just set one 
 * bit. 
 * @export 
 * @type {number}
 */
box2d.b2Filter.prototype.categoryBits = 0x0001;

/** 
 * The collision mask bits. This states the categories that this 
 * shape would accept for collision. 
 * @export 
 * @type {number}
 */
box2d.b2Filter.prototype.maskBits = 0xFFFF;

/** 
 * Collision groups allow a certain group of objects to never 
 * collide (negative) or always collide (positive). Zero means 
 * no collision group. Non-zero group filtering always wins 
 * against the mask bits. 
 * @export 
 * @type {number}
 */
box2d.b2Filter.prototype.groupIndex = 0;

/** 
 * @export 
 * @return {box2d.b2Filter}
 */
box2d.b2Filter.prototype.Clone = function() {
  return new box2d.b2Filter().Copy(this);
}

/** 
 * @export 
 * @return {box2d.b2Filter} 
 * @param {box2d.b2Filter} other 
 */
box2d.b2Filter.prototype.Copy = function(other) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(this !== other);
  }
  this.categoryBits = other.categoryBits;
  this.maskBits = other.maskBits;
  this.groupIndex = other.groupIndex;
  return this;
}

/** 
 * A fixture definition is used to create a fixture. This class 
 * defines an abstract fixture definition. You can reuse fixture 
 * definitions safely. 
 * @export 
 * @constructor 
 */
box2d.b2FixtureDef = function() {
  this.filter = new box2d.b2Filter();
}

/** 
 * The shape, this must be set. The shape will be cloned, so you 
 * can create the shape on the stack. 
 * @export 
 * @type {box2d.b2Shape}
 */
box2d.b2FixtureDef.prototype.shape = null;

/** 
 * Use this to store application specific fixture data. 
 * @export 
 * @type {*}
 */
box2d.b2FixtureDef.prototype.userData = null;

/** 
 * The friction coefficient, usually in the range [0,1]. 
 * @export 
 * @type {number}
 */
box2d.b2FixtureDef.prototype.friction = 0.2;

/** 
 * The restitution (elasticity) usually in the range [0,1]. 
 * @export 
 * @type {number}
 */
box2d.b2FixtureDef.prototype.restitution = 0;

/** 
 * The density, usually in kg/m^2. 
 * @export 
 * @type {number}
 */
box2d.b2FixtureDef.prototype.density = 0;

/** 
 * A sensor shape collects contact information but never 
 * generates a collision response. 
 * @export 
 * @type {boolean}
 */
box2d.b2FixtureDef.prototype.isSensor = false;

/** 
 * Contact filtering data. 
 * @export 
 * @type {box2d.b2Filter}
 */
box2d.b2FixtureDef.prototype.filter = null;

/** 
 * This proxy is used internally to connect fixtures to the 
 * broad-phase. 
 * @export 
 * @constructor
 */
box2d.b2FixtureProxy = function() {
  this.aabb = new box2d.b2AABB();
};

/**
 * @export 
 * @type {box2d.b2AABB}
 */
box2d.b2FixtureProxy.prototype.aabb = null;
/**
 * @export 
 * @type {box2d.b2Fixture}
 */
box2d.b2FixtureProxy.prototype.fixture = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2FixtureProxy.prototype.childIndex = 0;
/**
 * @export 
 * @type {box2d.b2TreeNode}
 */
box2d.b2FixtureProxy.prototype.proxy = null;

/** 
 * @export 
 * @return {Array.<box2d.b2FixtureProxy>} 
 * @param {number} length 
 */
box2d.b2FixtureProxy.MakeArray = function(length) {
  return box2d.b2MakeArray(length, function(i) {
    return new box2d.b2FixtureProxy();
  });
}

/** 
 * A fixture is used to attach a shape to a body for collision 
 * detection. A fixture inherits its transform from its parent. 
 * Fixtures hold additional non-geometric data such as friction, 
 * collision filters, etc. 
 * Fixtures are created via box2d.b2Body::CreateFixture. 
 * warning you cannot reuse fixtures.
 * @export 
 * @constructor 
 */
box2d.b2Fixture = function() {
  //	this.m_proxies = new Array();
  this.m_proxyCount = 0;

  this.m_filter = new box2d.b2Filter();
}

/**
 * @export 
 * @type {number}
 */
box2d.b2Fixture.prototype.m_density = 0;

/**
 * @export 
 * @type {box2d.b2Fixture}
 */
box2d.b2Fixture.prototype.m_next = null;
/**
 * @export 
 * @type {box2d.b2Body}
 */
box2d.b2Fixture.prototype.m_body = null;

/**
 * @export 
 * @type {box2d.b2Shape}
 */
box2d.b2Fixture.prototype.m_shape = null;

/**
 * @export 
 * @type {number}
 */
box2d.b2Fixture.prototype.m_friction = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2Fixture.prototype.m_restitution = 0;

/**
 * @export 
 * @type {Array.<box2d.b2FixtureProxy>}
 */
box2d.b2Fixture.prototype.m_proxies = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2Fixture.prototype.m_proxyCount = 0;

/**
 * @export 
 * @type {box2d.b2Filter}
 */
box2d.b2Fixture.prototype.m_filter = null;

/**
 * @export 
 * @type {boolean}
 */
box2d.b2Fixture.prototype.m_isSensor = false;

/**
 * @export 
 * @type {*}
 */
box2d.b2Fixture.prototype.m_userData = null;

/** 
 * Get the type of the child shape. You can use this to down 
 * cast to the concrete shape. 
 * @export 
 * @return {box2d.b2ShapeType} the shape type.
 */
box2d.b2Fixture.prototype.GetType = function() {
  return this.m_shape.GetType();
}

/** 
 * Get the child shape. You can modify the child shape, however 
 * you should not change the number of vertices because this 
 * will crash some collision caching mechanisms. 
 * Manipulating the shape may lead to non-physical behavior.
 * @export 
 * @return {box2d.b2Shape}
 */
box2d.b2Fixture.prototype.GetShape = function() {
  return this.m_shape;
}

/** 
 * Is this fixture a sensor (non-solid)? 
 * @export 
 * @return {boolean} true if the shape is a sensor.
 */
box2d.b2Fixture.prototype.IsSensor = function() {
  return this.m_isSensor;
}

/** 
 * Get the contact filtering data. 
 * @export 
 * @return {box2d.b2Filter} 
 * @param {box2d.b2Filter=} out
 */
box2d.b2Fixture.prototype.GetFilterData = function(out) {
  //return this.m_filter;
  out = out || new box2d.b2Filter();
  return out.Copy(this.m_filter);
}

/** 
 * Get the user data that was assigned in the fixture 
 * definition. Use this to store your application specific data.
 * @export 
 * @return {*} 
 */
box2d.b2Fixture.prototype.GetUserData = function() {
  return this.m_userData;
}

/** 
 * Set the user data. Use this to store your application 
 * specific data. 
 * @export 
 * @param {*} data 
 */
box2d.b2Fixture.prototype.SetUserData = function(data) {
  this.m_userData = data;
}

/** 
 * Get the parent body of this fixture. This is NULL if the 
 * fixture is not attached. 
 * @export 
 * @return {box2d.b2Body} the parent body.
 */
box2d.b2Fixture.prototype.GetBody = function() {
  return this.m_body;
}

/** 
 * Get the next fixture in the parent body's fixture list. 
 * @export 
 * @return {box2d.b2Fixture} the next shape.
 */
box2d.b2Fixture.prototype.GetNext = function() {
  return this.m_next;
}

/** 
 * Set the density of this fixture. This will _not_ 
 * automatically adjust the mass of the body. You must call 
 * box2d.b2Body::ResetMassData to update the body's mass. 
 * @export 
 * @return {void} 
 * @param {number} density 
 */
box2d.b2Fixture.prototype.SetDensity = function(density) {
  this.m_density = density;
}

/** 
 * Get the density of this fixture. 
 * @export 
 * @return {number} 
 */
box2d.b2Fixture.prototype.GetDensity = function() {
  return this.m_density;
}

/** 
 * Get the coefficient of friction. 
 * @export 
 * @return {number} 
 */
box2d.b2Fixture.prototype.GetFriction = function() {
  return this.m_friction;
}

/** 
 * Set the coefficient of friction. This will _not_ change the 
 * friction of existing contacts. 
 * @export 
 * @return {void} 
 * @param {number} friction 
 */
box2d.b2Fixture.prototype.SetFriction = function(friction) {
  this.m_friction = friction;
}

/** 
 * Get the coefficient of restitution. 
 * @export 
 * @return {number} 
 */
box2d.b2Fixture.prototype.GetRestitution = function() {
  return this.m_restitution;
}

/** 
 * Set the coefficient of restitution. This will _not_ change 
 * the restitution of existing contacts. 
 * @export 
 * @return {void} 
 * @param {number} restitution 
 */
box2d.b2Fixture.prototype.SetRestitution = function(restitution) {
  this.m_restitution = restitution;
}

/** 
 * Test a point for containment in this fixture. 
 * @export 
 * @return {boolean} 
 * @param {box2d.b2Vec2} p a point in world coordinates.
 */
box2d.b2Fixture.prototype.TestPoint = function(p) {
  return this.m_shape.TestPoint(this.m_body.GetTransform(), p);
}

//#if B2_ENABLE_PARTICLE

/** 
 * Compute the distance from this fixture. 
 * @export 
 * @return {number} 
 * @param {box2d.b2Vec2} p a point in world coordinates.
 * @param {box2d.b2Vec2} normal 
 * @param {number} childIndex 
 */
box2d.b2Fixture.prototype.ComputeDistance = function(p, normal, childIndex) {
  return this.m_shape.ComputeDistance(this.m_body.GetTransform(), p, normal, childIndex);
}

//#endif

/** 
 * Cast a ray against this shape. 
 * @export 
 * @return {boolean} 
 * @param {box2d.b2RayCastOutput} output ray-cast results.
 * @param {box2d.b2RayCastInput} input the ray-cast input parameters.
 * @param {number} childIndex 
 */
box2d.b2Fixture.prototype.RayCast = function(output, input, childIndex) {
  return this.m_shape.RayCast(output, input, this.m_body.GetTransform(), childIndex);
}

/** 
 * Get the mass data for this fixture. The mass data is based on 
 * the density and the shape. The rotational inertia is about 
 * the shape's origin. This operation may be expensive. 
 * @export 
 * @return {box2d.b2MassData} 
 * @param {box2d.b2MassData=} massData 
 */
box2d.b2Fixture.prototype.GetMassData = function(massData) {
  massData = massData || new box2d.b2MassData();

  this.m_shape.ComputeMass(massData, this.m_density);

  return massData;
}

/** 
 * Get the fixture's AABB. This AABB may be enlarge and/or 
 * stale. If you need a more accurate AABB, compute it using the 
 * shape and the body transform. 
 * @export 
 * @return {box2d.b2AABB} 
 * @param {number} childIndex 
 */
box2d.b2Fixture.prototype.GetAABB = function(childIndex) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(0 <= childIndex && childIndex < this.m_proxyCount);
  }
  return this.m_proxies[childIndex].aabb;
}

/** 
 * We need separation create/destroy functions from the 
 * constructor/destructor because the destructor cannot access 
 * the allocator (no destructor arguments allowed by C++). 
 * @export 
 * @return {void} 
 * @param {box2d.b2Body} body 
 * @param {box2d.b2FixtureDef} def
 */
box2d.b2Fixture.prototype.Create = function(body, def) {
  this.m_userData = def.userData;
  this.m_friction = def.friction;
  this.m_restitution = def.restitution;

  this.m_body = body;
  this.m_next = null;

  this.m_filter.Copy(def.filter);

  this.m_isSensor = def.isSensor;

  this.m_shape = def.shape.Clone();

  // Reserve proxy space
  //	var childCount = m_shape->GetChildCount();
  //	m_proxies = (box2d.b2FixtureProxy*)allocator->Allocate(childCount * sizeof(box2d.b2FixtureProxy));
  //	for (int32 i = 0; i < childCount; ++i)
  //	{
  //		m_proxies[i].fixture = NULL;
  //		m_proxies[i].proxyId = box2d.b2BroadPhase::e_nullProxy;
  //	}
  this.m_proxies = box2d.b2FixtureProxy.MakeArray(this.m_shape.GetChildCount());
  this.m_proxyCount = 0;

  this.m_density = def.density;
}

/**
 * @export 
 * @return {void} 
 */
box2d.b2Fixture.prototype.Destroy = function() {
  // The proxies must be destroyed before calling this.
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(this.m_proxyCount === 0);
  }

  // Free the proxy array.
  //	int32 childCount = m_shape->GetChildCount();
  //	allocator->Free(m_proxies, childCount * sizeof(box2d.b2FixtureProxy));
  //	m_proxies = NULL;

  this.m_shape = null;
}

/** 
 * These support body activation/deactivation. 
 * @export 
 * @return {void} 
 * @param {box2d.b2BroadPhase} broadPhase 
 * @param {box2d.b2Transform} xf 
 */
box2d.b2Fixture.prototype.CreateProxies = function(broadPhase, xf) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(this.m_proxyCount === 0);
  }

  // Create proxies in the broad-phase.
  this.m_proxyCount = this.m_shape.GetChildCount();

  for (var i = 0; i < this.m_proxyCount; ++i) {
    var proxy = this.m_proxies[i];
    this.m_shape.ComputeAABB(proxy.aabb, xf, i);
    proxy.proxy = broadPhase.CreateProxy(proxy.aabb, proxy);
    proxy.fixture = this;
    proxy.childIndex = i;
  }
}

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2BroadPhase} broadPhase 
 */
box2d.b2Fixture.prototype.DestroyProxies = function(broadPhase) {
  // Destroy proxies in the broad-phase.
  for (var i = 0; i < this.m_proxyCount; ++i) {
    var proxy = this.m_proxies[i];
    broadPhase.DestroyProxy(proxy.proxy);
    proxy.proxy = null;
  }

  this.m_proxyCount = 0;
}

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2BroadPhase} broadPhase 
 * @param {box2d.b2Transform} transform1
 * @param {box2d.b2Transform} transform2
 */
box2d.b2Fixture.prototype.Synchronize = function(broadPhase, transform1, transform2) {
  if (this.m_proxyCount === 0) {
    return;
  }

  for (var i = 0; i < this.m_proxyCount; ++i) {
    var proxy = this.m_proxies[i];

    // Compute an AABB that covers the swept shape (may miss some rotation effect).
    var aabb1 = box2d.b2Fixture.prototype.Synchronize.s_aabb1;
    var aabb2 = box2d.b2Fixture.prototype.Synchronize.s_aabb2;
    this.m_shape.ComputeAABB(aabb1, transform1, i);
    this.m_shape.ComputeAABB(aabb2, transform2, i);

    proxy.aabb.Combine2(aabb1, aabb2);

    var displacement = box2d.b2Sub_V2_V2(transform2.p, transform1.p, box2d.b2Fixture.prototype.Synchronize.s_displacement);

    broadPhase.MoveProxy(proxy.proxy, proxy.aabb, displacement);
  }
}
box2d.b2Fixture.prototype.Synchronize.s_aabb1 = new box2d.b2AABB();
box2d.b2Fixture.prototype.Synchronize.s_aabb2 = new box2d.b2AABB();
box2d.b2Fixture.prototype.Synchronize.s_displacement = new box2d.b2Vec2();

/** 
 * Set the contact filtering data. This will not update contacts 
 * until the next time step when either parent body is active 
 * and awake. 
 * This automatically calls Refilter. 
 * @export 
 * @return {void} 
 * @param {box2d.b2Filter} filter 
 */
box2d.b2Fixture.prototype.SetFilterData = function(filter) {
  this.m_filter.Copy(filter);

  this.Refilter();
}

/**
 * Call this if you want to establish collision that was 
 * previously disabled by box2d.b2ContactFilter::ShouldCollide. 
 * @export 
 * @return {void} 
 */
box2d.b2Fixture.prototype.Refilter = function() {
  if (this.m_body === null) {
    return;
  }

  // Flag associated contacts for filtering.
  var edge = this.m_body.GetContactList();

  while (edge) {
    var contact = edge.contact;
    var fixtureA = contact.GetFixtureA();
    var fixtureB = contact.GetFixtureB();
    if (fixtureA === this || fixtureB === this) {
      contact.FlagForFiltering();
    }

    edge = edge.next;
  }

  var world = this.m_body.GetWorld();

  if (world === null) {
    return;
  }

  // Touch each proxy so that new pairs may be created
  var broadPhase = world.m_contactManager.m_broadPhase;
  for (var i = 0; i < this.m_proxyCount; ++i) {
    broadPhase.TouchProxy(this.m_proxies[i].proxy);
  }
}

/** 
 * Set if this fixture is a sensor. 
 * @export 
 * @return {void} 
 * @param {boolean} sensor
 */
box2d.b2Fixture.prototype.SetSensor = function(sensor) {
  if (sensor !== this.m_isSensor) {
    this.m_body.SetAwake(true);
    this.m_isSensor = sensor;
  }
}

/** 
 * Dump this fixture to the log file. 
 * @export 
 * @return {void}
 * @param {number} bodyIndex 
 */
box2d.b2Fixture.prototype.Dump = function(bodyIndex) {
  if (box2d.DEBUG) {
    box2d.b2Log("    /*box2d.b2FixtureDef*/ var fd = new box2d.b2FixtureDef();\n");
    box2d.b2Log("    fd.friction = %.15f;\n", this.m_friction);
    box2d.b2Log("    fd.restitution = %.15f;\n", this.m_restitution);
    box2d.b2Log("    fd.density = %.15f;\n", this.m_density);
    box2d.b2Log("    fd.isSensor = %s;\n", (this.m_isSensor) ? ('true') : ('false'));
    box2d.b2Log("    fd.filter.categoryBits = %d;\n", this.m_filter.categoryBits);
    box2d.b2Log("    fd.filter.maskBits = %d;\n", this.m_filter.maskBits);
    box2d.b2Log("    fd.filter.groupIndex = %d;\n", this.m_filter.groupIndex);

    this.m_shape.Dump();

    box2d.b2Log("\n");
    box2d.b2Log("    fd.shape = shape;\n");
    box2d.b2Log("\n");
    box2d.b2Log("    bodies[%d].CreateFixture(fd);\n", bodyIndex);
  }
}
