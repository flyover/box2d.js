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

goog.provide('box2d.b2Collision');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Math');
goog.require('box2d.b2ShapeDistance');

/**
 * Structures and functions used for computing contact points, 
 * distance queries, and TOI queries. 
 */

/** 
 * @export 
 * @enum
 */
box2d.b2ContactFeatureType = 
{
	e_vertex	: 0,
	e_face		: 1
};
goog.exportProperty(box2d.b2ContactFeatureType, 'e_vertex', box2d.b2ContactFeatureType.e_vertex);
goog.exportProperty(box2d.b2ContactFeatureType, 'e_face'  , box2d.b2ContactFeatureType.e_face  );

/** 
 * The features that intersect to form the contact point 
 * This must be 4 bytes or less.
 * @export 
 * @constructor 
 */
box2d.b2ContactFeature = function ()
{
};

/**
 * @export 
 * @type {number}
 */
box2d.b2ContactFeature.prototype._key = 0;
/**
 * @export 
 * @type {boolean}
 */
box2d.b2ContactFeature.prototype._key_invalid = false;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactFeature.prototype._indexA = 0; ///< Feature index on shapeA   
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactFeature.prototype._indexB = 0; ///< Feature index on shapeB   
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactFeature.prototype._typeA = 0; ///< The feature type on shapeA
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactFeature.prototype._typeB = 0; ///< The feature type on shapeB

Object.defineProperty(
	box2d.b2ContactFeature.prototype, 'key',
	{
		enumerable: false,
		configurable: true,
		/** @this {box2d.b2ContactFeature} */
		get: function ()
		{
			if (this._key_invalid)
			{
				this._key_invalid = false;
				this._key = this._indexA | (this._indexB << 8) | (this._typeA << 16) | (this._typeB << 24);
			}
			return this._key;
		},
		/** @this {box2d.b2ContactFeature} */
		set: function (value)
		{
			this._key = value;
			this._indexA = this._key & 0xff;
			this._indexB = (this._key >> 8) & 0xff;
			this._typeA = (this._key >> 16) & 0xff;
			this._typeB = (this._key >> 24) & 0xff;
		}
	}
);

Object.defineProperty(
	box2d.b2ContactFeature.prototype, 'indexA',
	{
		enumerable: false,
		configurable: true,
		/** @this {box2d.b2ContactFeature} */
		get: function ()
		{
			return this._indexA;
		},
		/** @this {box2d.b2ContactFeature} */
		set: function (value)
		{
			this._indexA = value;
			this._key_invalid = true;
		}
	}
);

Object.defineProperty(
	box2d.b2ContactFeature.prototype, 'indexB',
	{
		enumerable: false,
		configurable: true,
		/** @this {box2d.b2ContactFeature} */
		get: function ()
		{
			return this._indexB;
		},
		/** @this {box2d.b2ContactFeature} */
		set: function (value)
		{
			this._indexB = value;
			this._key_invalid = true;
		}
	}
);

Object.defineProperty(
	box2d.b2ContactFeature.prototype, 'typeA',
	{
		enumerable: false,
		configurable: true,
		/** @this {box2d.b2ContactFeature} */
		get: function ()
		{
			return this._typeA;
		},
		/** @this {box2d.b2ContactFeature} */
		set: function (value)
		{
			this._typeA = value;
			this._key_invalid = true;
		}
	}
);

Object.defineProperty(
	box2d.b2ContactFeature.prototype, 'typeB',
	{
		enumerable: false,
		configurable: true,
		/** @this {box2d.b2ContactFeature} */
		get: function ()
		{
			return this._typeB;
		},
		/** @this {box2d.b2ContactFeature} */
		set: function (value)
		{
			this._typeB = value;
			this._key_invalid = true;
		}
	}
);

/** 
 * Contact ids to facilitate warm starting. 
 * @export 
 * @constructor 
 */
box2d.b2ContactID = function ()
{
	this.cf = new box2d.b2ContactFeature();
}

/**
 * @export 
 * @type {box2d.b2ContactFeature}
 */
box2d.b2ContactID.prototype.cf = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2ContactID.prototype.key = 0; ///< Used to quickly compare contact ids.
Object.defineProperty(
	box2d.b2ContactID.prototype, 'key',
	{
		enumerable: false,
		configurable: true,
		/** @this {box2d.b2ContactID} */
		get: function ()
		{
			return this.cf.key;
		},
		/** @this {box2d.b2ContactID} */
		set: function (value)
		{
			this.cf.key = value;
		}
	}
);

/**
 * @export 
 * @return {box2d.b2ContactID}
 * @param {box2d.b2ContactID} o
 */
box2d.b2ContactID.prototype.Copy = function (o)
{
	this.key = o.key;
	return this;
}

/**
 * @export 
 * @return {box2d.b2ContactID}
 */
box2d.b2ContactID.prototype.Clone = function ()
{
	return new box2d.b2ContactID().Copy(this);
}

/**
 * A manifold point is a contact point belonging to a contact
 * manifold. It holds details related to the geometry and dynamics
 * of the contact points.
 * The local point usage depends on the manifold type:
 * -e_circles: the local center of circleB
 * -e_faceA: the local center of cirlceB or the clip point of polygonB
 * -e_faceB: the clip point of polygonA
 * This structure is stored across time steps, so we keep it small.
 * Note: the impulses are used for internal caching and may not
 * provide reliable contact forces, especially for high speed collisions.
 * @export 
 * @constructor
 */
box2d.b2ManifoldPoint = function ()
{
	this.localPoint = new box2d.b2Vec2();
	this.id = new box2d.b2ContactID();
}

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2ManifoldPoint.prototype.localPoint = null; ///< usage depends on manifold type
/**
 * @export 
 * @type {number}
 */
box2d.b2ManifoldPoint.prototype.normalImpulse = 0; ///< the non-penetration impulse
/**
 * @export 
 * @type {number}
 */
box2d.b2ManifoldPoint.prototype.tangentImpulse = 0; ///< the friction impulse
/**
 * @export 
 * @type {box2d.b2ContactID}
 */
box2d.b2ManifoldPoint.prototype.id = null; ///< uniquely identifies a contact point between two shapes

/**
 * @export 
 * @return {Array.<box2d.b2ManifoldPoint>}
 * @param {number} length 
 */
box2d.b2ManifoldPoint.MakeArray = function (length)
{
	return box2d.b2MakeArray(length, function (i) { return new box2d.b2ManifoldPoint(); } );
}

/**
 * @export 
 * @return {void} 
 */
box2d.b2ManifoldPoint.prototype.Reset = function ()
{
	this.localPoint.SetZero();
	this.normalImpulse = 0;
	this.tangentImpulse = 0;
	this.id.key = 0;
}

/**
 * @export 
 * @return {box2d.b2ManifoldPoint}
 * @param {box2d.b2ManifoldPoint} o 
 */
box2d.b2ManifoldPoint.prototype.Copy = function (o)
{
	this.localPoint.Copy(o.localPoint);
	this.normalImpulse = o.normalImpulse;
	this.tangentImpulse = o.tangentImpulse;
	this.id.Copy(o.id);
	return this;
}

/** 
 * @export 
 * @enum
 */
box2d.b2ManifoldType = 
{
	e_unknown	: -1,
	e_circles	: 0,
	e_faceA		: 1,
	e_faceB		: 2
};
goog.exportProperty(box2d.b2ManifoldType, 'e_unknown', box2d.b2ManifoldType.e_unknown);
goog.exportProperty(box2d.b2ManifoldType, 'e_circles', box2d.b2ManifoldType.e_circles);
goog.exportProperty(box2d.b2ManifoldType, 'e_faceA'  , box2d.b2ManifoldType.e_faceA  );
goog.exportProperty(box2d.b2ManifoldType, 'e_faceB'  , box2d.b2ManifoldType.e_faceB  );

/** 
 * A manifold for two touching convex shapes.
 * Box2D supports multiple types of contact:
 * - clip point versus plane with radius
 * - point versus point with radius (circles)
 * The local point usage depends on the manifold type:
 * -e_circles: the local center of circleA
 * -e_faceA: the center of faceA
 * -e_faceB: the center of faceB
 * Similarly the local normal usage:
 * -e_circles: not used
 * -e_faceA: the normal on polygonA
 * -e_faceB: the normal on polygonB
 * We store contacts in this way so that position correction can
 * account for movement, which is critical for continuous physics.
 * All contact scenarios must be expressed in one of these types.
 * This structure is stored across time steps, so we keep it small.
 * @export 
 * @constructor
 */
box2d.b2Manifold = function ()
{
	this.points = box2d.b2ManifoldPoint.MakeArray(box2d.b2_maxManifoldPoints);
	this.localNormal = new box2d.b2Vec2();
	this.localPoint = new box2d.b2Vec2();
	this.type = box2d.b2ManifoldType.e_unknown;
	this.pointCount = 0;
}

/**
 * @export 
 * @type {Array.<box2d.b2ManifoldPoint>}
 */
box2d.b2Manifold.prototype.points = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2Manifold.prototype.localNormal = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2Manifold.prototype.localPoint = null;
/**
 * @export 
 * @type {box2d.b2ManifoldType}
 */
box2d.b2Manifold.prototype.type = box2d.b2ManifoldType.e_unknown;
/**
 * @export 
 * @type {number}
 */
box2d.b2Manifold.prototype.pointCount = 0;

/** 
 * @export 
 * @return {void} 
 */
box2d.b2Manifold.prototype.Reset = function ()
{
	for (var i = 0, ict = box2d.b2_maxManifoldPoints; i < ict; ++i)
	{
		//if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(this.points[i] instanceof box2d.b2ManifoldPoint); }
		this.points[i].Reset();
	}
	this.localNormal.SetZero();
	this.localPoint.SetZero();
	this.type = box2d.b2ManifoldType.e_unknown;
	this.pointCount = 0;
}

/** 
 * @export 
 * @return {box2d.b2Manifold} 
 * @param {box2d.b2Manifold} o 
 */
box2d.b2Manifold.prototype.Copy = function (o)
{
	this.pointCount = o.pointCount;
	for (var i = 0, ict = box2d.b2_maxManifoldPoints; i < ict; ++i)
	{
		//if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(this.points[i] instanceof box2d.b2ManifoldPoint); }
		this.points[i].Copy(o.points[i]);
	}
	this.localNormal.Copy(o.localNormal);
	this.localPoint.Copy(o.localPoint);
	this.type = o.type;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Manifold}
 */
box2d.b2Manifold.prototype.Clone = function ()
{
	return new box2d.b2Manifold().Copy(this);
}

/** 
 * This is used to compute the current state of a contact 
 * manifold. 
 * @export 
 * @constructor
 */
box2d.b2WorldManifold = function ()
{
	this.normal = new box2d.b2Vec2();
	this.points = box2d.b2Vec2.MakeArray(box2d.b2_maxManifoldPoints);
	this.separations = box2d.b2MakeNumberArray(box2d.b2_maxManifoldPoints);
}

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2WorldManifold.prototype.normal = null; ///< world vector pointing from A to B
/**
 * @export 
 * @type {Array.<box2d.b2Vec2>}
 */
box2d.b2WorldManifold.prototype.points = null; ///< world contact point (point of intersection)
/**
 * @export 
 * @type {Array.<number>}
 */
box2d.b2WorldManifold.prototype.separations = null; ///< a negative value indicates overlap, in meters

/** 
 * Evaluate the manifold with supplied transforms. This assumes 
 * modest motion from the original state. This does not change 
 * the point count, impulses, etc. The radii must come from the 
 * shapes that generated the manifold. 
 * @export 
 * @param {box2d.b2Manifold} manifold
 * @param {box2d.b2Transform} xfA
 * @param {number} radiusA
 * @param {box2d.b2Transform} xfB
 * @param {number} radiusB 
 * @return {void} 
 */
box2d.b2WorldManifold.prototype.Initialize = function (manifold, xfA, radiusA, xfB, radiusB)
{
	if (manifold.pointCount === 0)
	{
		return;
	}

	switch (manifold.type)
	{
	case box2d.b2ManifoldType.e_circles:
		{
			this.normal.Set(1, 0);
			var pointA = box2d.b2Mul_X_V2(xfA, manifold.localPoint, box2d.b2WorldManifold.prototype.Initialize.s_pointA);
			var pointB = box2d.b2Mul_X_V2(xfB, manifold.points[0].localPoint, box2d.b2WorldManifold.prototype.Initialize.s_pointB);
			if (box2d.b2DistanceSquared(pointA, pointB) > box2d.b2_epsilon_sq)
			{
				box2d.b2Sub_V2_V2(pointB, pointA, this.normal).SelfNormalize();
			}

			var cA = box2d.b2AddMul_V2_S_V2(pointA, radiusA, this.normal, box2d.b2WorldManifold.prototype.Initialize.s_cA);
			var cB = box2d.b2SubMul_V2_S_V2(pointB, radiusB, this.normal, box2d.b2WorldManifold.prototype.Initialize.s_cB);
			box2d.b2Mid_V2_V2(cA, cB, this.points[0]);
			this.separations[0] = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(cB, cA, box2d.b2Vec2.s_t0), this.normal); // b2Dot(cB - cA, normal);
		}
		break;

	case box2d.b2ManifoldType.e_faceA:
		{
			box2d.b2Mul_R_V2(xfA.q, manifold.localNormal, this.normal);
			var planePoint = box2d.b2Mul_X_V2(xfA, manifold.localPoint, box2d.b2WorldManifold.prototype.Initialize.s_planePoint);

			for (var i = 0, ict = manifold.pointCount; i < ict; ++i)
			{
				var clipPoint = box2d.b2Mul_X_V2(xfB, manifold.points[i].localPoint, box2d.b2WorldManifold.prototype.Initialize.s_clipPoint);
				var s = radiusA - box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(clipPoint, planePoint, box2d.b2Vec2.s_t0), this.normal);
				var cA = box2d.b2AddMul_V2_S_V2(clipPoint, s, this.normal, box2d.b2WorldManifold.prototype.Initialize.s_cA);
				var cB = box2d.b2SubMul_V2_S_V2(clipPoint, radiusB, this.normal, box2d.b2WorldManifold.prototype.Initialize.s_cB);
				box2d.b2Mid_V2_V2(cA, cB, this.points[i]);
				this.separations[i] = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(cB, cA, box2d.b2Vec2.s_t0), this.normal); // b2Dot(cB - cA, normal);
			}
		}
		break;

	case box2d.b2ManifoldType.e_faceB:
		{
			box2d.b2Mul_R_V2(xfB.q, manifold.localNormal, this.normal);
			var planePoint = box2d.b2Mul_X_V2(xfB, manifold.localPoint, box2d.b2WorldManifold.prototype.Initialize.s_planePoint);

			for (var i = 0, ict = manifold.pointCount; i < ict; ++i)
			{
				var clipPoint = box2d.b2Mul_X_V2(xfA, manifold.points[i].localPoint, box2d.b2WorldManifold.prototype.Initialize.s_clipPoint);
				var s = radiusB - box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(clipPoint, planePoint, box2d.b2Vec2.s_t0), this.normal);
				var cB = box2d.b2AddMul_V2_S_V2(clipPoint, s, this.normal, box2d.b2WorldManifold.prototype.Initialize.s_cB);
				var cA = box2d.b2SubMul_V2_S_V2(clipPoint, radiusA, this.normal, box2d.b2WorldManifold.prototype.Initialize.s_cA);
				box2d.b2Mid_V2_V2(cA, cB, this.points[i]);
				this.separations[i] = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(cA, cB, box2d.b2Vec2.s_t0), this.normal); // b2Dot(cA - cB, normal);
			}

			// Ensure normal points from A to B.
			this.normal.SelfNeg();
		}
		break;
	}
}
box2d.b2WorldManifold.prototype.Initialize.s_pointA = new box2d.b2Vec2();
box2d.b2WorldManifold.prototype.Initialize.s_pointB = new box2d.b2Vec2();
box2d.b2WorldManifold.prototype.Initialize.s_cA = new box2d.b2Vec2();
box2d.b2WorldManifold.prototype.Initialize.s_cB = new box2d.b2Vec2();
box2d.b2WorldManifold.prototype.Initialize.s_planePoint = new box2d.b2Vec2();
box2d.b2WorldManifold.prototype.Initialize.s_clipPoint = new box2d.b2Vec2();

/** 
 * This is used for determining the state of contact points. 
 * @export 
 * @enum
 */
box2d.b2PointState = 
{
	b2_nullState	: 0, ///< point does not exist
	b2_addState		: 1, ///< point was added in the update
	b2_persistState	: 2, ///< point persisted across the update
	b2_removeState	: 3  ///< point was removed in the update
};
goog.exportProperty(box2d.b2PointState, 'b2_nullState   ', box2d.b2PointState.b2_nullState   );
goog.exportProperty(box2d.b2PointState, 'b2_addState    ', box2d.b2PointState.b2_addState    );
goog.exportProperty(box2d.b2PointState, 'b2_persistState', box2d.b2PointState.b2_persistState);
goog.exportProperty(box2d.b2PointState, 'b2_removeState ', box2d.b2PointState.b2_removeState );

/** 
 * Compute the point states given two manifolds. The states 
 * pertain to the transition from manifold1 to manifold2. So 
 * state1 is either persist or remove while state2 is either add 
 * or persist. 
 * @export 
 * @return {void}
 * @param {Array.<box2d.b2PointState>} state1 
 * @param {Array.<box2d.b2PointState>} state2 
 * @param {box2d.b2Manifold} manifold1 
 * @param {box2d.b2Manifold} manifold2 
 */
box2d.b2GetPointStates = function (state1, state2, manifold1, manifold2)
{
	// Detect persists and removes.
	for (var i = 0, ict = manifold1.pointCount; i < ict; ++i)
	{
		var id = manifold1.points[i].id;
		var key = id.key;

		state1[i] = box2d.b2PointState.b2_removeState;

		for (var j = 0, jct = manifold2.pointCount; j < jct; ++j)
		{
			if (manifold2.points[j].id.key === key)
			{
				state1[i] = box2d.b2PointState.b2_persistState;
				break;
			}
		}
	}
	for (var ict = box2d.b2_maxManifoldPoints; i < ict; ++i)
	{
		state1[i] = box2d.b2PointState.b2_nullState;
	}

	// Detect persists and adds.
	for (var i = 0, ict = manifold2.pointCount; i < ict; ++i)
	{
		var id = manifold2.points[i].id;
		var key = id.key;

		state2[i] = box2d.b2PointState.b2_addState;

		for (var j = 0, jct = manifold1.pointCount; j < jct; ++j)
		{
			if (manifold1.points[j].id.key === key)
			{
				state2[i] = box2d.b2PointState.b2_persistState;
				break;
			}
		}
	}
	for (var ict = box2d.b2_maxManifoldPoints; i < ict; ++i)
	{
		state2[i] = box2d.b2PointState.b2_nullState;
	}
}

/** 
 * Used for computing contact manifolds. 
 * @export 
 * @constructor
 */
box2d.b2ClipVertex = function ()
{
	this.v = new box2d.b2Vec2();
	this.id = new box2d.b2ContactID();
};

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2ClipVertex.prototype.v = null;
/**
 * @export 
 * @type {box2d.b2ContactID}
 */
box2d.b2ClipVertex.prototype.id = null;

/**
 * @export 
 * @return {Array.<box2d.b2ClipVertex>} 
 * @param {number=} length 
 */
box2d.b2ClipVertex.MakeArray = function (length)
{
	return box2d.b2MakeArray(length, function (i) { return new box2d.b2ClipVertex(); });
}

/**
 * @export 
 * @return {box2d.b2ClipVertex}
 * @param {box2d.b2ClipVertex} other 
 */
box2d.b2ClipVertex.prototype.Copy = function (other)
{
	this.v.Copy(other.v);
	this.id.Copy(other.id);
	return this;
}

/** 
 * Ray-cast input data. The ray extends from p1 to p1 + 
 * maxFraction * (p2 - p1). 
 * @export 
 * @constructor
 */
box2d.b2RayCastInput = function ()
{
	this.p1 = new box2d.b2Vec2();
	this.p2 = new box2d.b2Vec2();
	this.maxFraction = 1;
}

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2RayCastInput.prototype.p1 = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2RayCastInput.prototype.p2 = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2RayCastInput.prototype.maxFraction = 1;

/**
 * @export 
 * @return {box2d.b2RayCastInput} 
 * @param {box2d.b2RayCastInput} o
 */
box2d.b2RayCastInput.prototype.Copy = function (o)
{
	this.p1.Copy(o.p1);
	this.p2.Copy(o.p2);
	this.maxFraction = o.maxFraction;
	return this;
}

/** 
 * Ray-cast output data. The ray hits at p1 + fraction * (p2 - 
 * p1), where p1 and p2 come from box2d.b2RayCastInput. 
 * @export 
 * @constructor
 */
box2d.b2RayCastOutput = function ()
{
	this.normal = new box2d.b2Vec2();
	this.fraction = 0;
};

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2RayCastOutput.prototype.normal = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2RayCastOutput.prototype.fraction = 0;

/**
 * @export 
 * @return {box2d.b2RayCastOutput} 
 * @param {box2d.b2RayCastOutput} o 
 */
box2d.b2RayCastOutput.prototype.Copy = function (o)
{
	this.normal.Copy(o.normal);
	this.fraction = o.fraction;
	return this;
}

/** 
 * An axis aligned bounding box. 
 * @export 
 * @constructor
 */
box2d.b2AABB = function ()
{
	this.lowerBound = new box2d.b2Vec2();
	this.upperBound = new box2d.b2Vec2();

	this.m_out_center = new box2d.b2Vec2();
	this.m_out_extent = new box2d.b2Vec2();
};

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2AABB.prototype.lowerBound = null; ///< the lower vertex
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2AABB.prototype.upperBound = null; ///< the upper vertex

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2AABB.prototype.m_out_center = null; // access using GetCenter()
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2AABB.prototype.m_out_extent = null; // access using GetExtents()

/**
 * @export 
 * @return {box2d.b2AABB} 
 */
box2d.b2AABB.prototype.Clone = function ()
{
	return new box2d.b2AABB().Copy(this);
}

/**
 * @export 
 * @return {box2d.b2AABB} 
 * @param {box2d.b2AABB} o 
 */
box2d.b2AABB.prototype.Copy = function (o)
{
	this.lowerBound.Copy(o.lowerBound);
	this.upperBound.Copy(o.upperBound);
	return this;
}

/** 
 * Verify that the bounds are sorted. 
 * @export 
 * @return {boolean}
 */
box2d.b2AABB.prototype.IsValid = function ()
{
	var d_x = this.upperBound.x - this.lowerBound.x;
	var d_y = this.upperBound.y - this.lowerBound.y;
	var valid = d_x >= 0 && d_y >= 0;
	valid = valid && this.lowerBound.IsValid() && this.upperBound.IsValid();
	return valid;
}

/** 
 * Get the center of the AABB. 
 * @export 
 * @return {box2d.b2Vec2}
 */
box2d.b2AABB.prototype.GetCenter = function ()
{
	return box2d.b2Mid_V2_V2(this.lowerBound, this.upperBound, this.m_out_center);
}

/** 
 * Get the extents of the AABB (half-widths). 
 * @export 
 * @return {box2d.b2Vec2} 
 */
box2d.b2AABB.prototype.GetExtents = function ()
{
	return box2d.b2Ext_V2_V2(this.lowerBound, this.upperBound, this.m_out_extent);
}

/** 
 * Get the perimeter length 
 * @export 
 * @return {number} 
 */
box2d.b2AABB.prototype.GetPerimeter = function ()
{
	var wx = this.upperBound.x - this.lowerBound.x;
	var wy = this.upperBound.y - this.lowerBound.y;
	return 2 * (wx + wy);
}

/** 
 * @return {box2d.b2AABB} 
 * @param {box2d.b2AABB} a0 
 * @param {box2d.b2AABB=} a1 
 */
box2d.b2AABB.prototype.Combine = function (a0, a1)
{
	switch (arguments.length)
	{
	case 1: return this.Combine1(a0);
	case 2: return this.Combine2(a0, a1 || new box2d.b2AABB());
	default: throw new Error();
	}
}

/** 
 * Combine an AABB into this one. 
 * @export 
 * @return {box2d.b2AABB} 
 * @param {box2d.b2AABB} aabb
 */
box2d.b2AABB.prototype.Combine1 = function (aabb)
{
	this.lowerBound.x = box2d.b2Min(this.lowerBound.x, aabb.lowerBound.x);
	this.lowerBound.y = box2d.b2Min(this.lowerBound.y, aabb.lowerBound.y);
	this.upperBound.x = box2d.b2Max(this.upperBound.x, aabb.upperBound.x);
	this.upperBound.y = box2d.b2Max(this.upperBound.y, aabb.upperBound.y);
	return this;
}

/** 
 * Combine two AABBs into this one. 
 * @export 
 * @return {box2d.b2AABB} 
 * @param {box2d.b2AABB} aabb1
 * @param {box2d.b2AABB} aabb2
 */
box2d.b2AABB.prototype.Combine2 = function (aabb1, aabb2)
{
	this.lowerBound.x = box2d.b2Min(aabb1.lowerBound.x, aabb2.lowerBound.x);
	this.lowerBound.y = box2d.b2Min(aabb1.lowerBound.y, aabb2.lowerBound.y);
	this.upperBound.x = box2d.b2Max(aabb1.upperBound.x, aabb2.upperBound.x);
	this.upperBound.y = box2d.b2Max(aabb1.upperBound.y, aabb2.upperBound.y);
	return this;
}

/**
 * @export 
 * @return {box2d.b2AABB}
 * @param {box2d.b2AABB} aabb1
 * @param {box2d.b2AABB} aabb2
 * @param {box2d.b2AABB} out
 */
box2d.b2AABB.Combine = function (aabb1, aabb2, out)
{
	out.Combine2(aabb1, aabb2);
	return out;
}

/** 
 * Does this aabb contain the provided AABB. 
 * @export 
 * @return {boolean} 
 * @param {box2d.b2AABB} aabb 
 */
box2d.b2AABB.prototype.Contains = function (aabb)
{
	var result = true;
	result = result && this.lowerBound.x <= aabb.lowerBound.x;
	result = result && this.lowerBound.y <= aabb.lowerBound.y;
	result = result && aabb.upperBound.x <= this.upperBound.x;
	result = result && aabb.upperBound.y <= this.upperBound.y;
	return result;
}

/** 
 * From Real-time Collision Detection, p179. 
 * @export 
 * @return {boolean}
 * @param {box2d.b2RayCastOutput} output
 * @param {box2d.b2RayCastInput} input
 */
box2d.b2AABB.prototype.RayCast = function (output, input)
{
	var tmin = (-box2d.b2_maxFloat);
	var tmax = box2d.b2_maxFloat;

	var p_x = input.p1.x;
	var p_y = input.p1.y;
	var d_x = input.p2.x - input.p1.x;
	var d_y = input.p2.y - input.p1.y;
	var absD_x = box2d.b2Abs(d_x);
	var absD_y = box2d.b2Abs(d_y);

	var normal = output.normal;

	if (absD_x < box2d.b2_epsilon)
	{
		// Parallel.
		if (p_x < this.lowerBound.x || this.upperBound.x < p_x)
		{
			return false;
		}
	}
	else
	{
		var inv_d = 1 / d_x;
		var t1 = (this.lowerBound.x - p_x) * inv_d;
		var t2 = (this.upperBound.x - p_x) * inv_d;

		// Sign of the normal vector.
		var s = (-1);

		if (t1 > t2)
		{
			var t3 = t1;
			t1 = t2;
			t2 = t3;
			s = 1;
		}

		// Push the min up
		if (t1 > tmin)
		{
			normal.x = s;
			normal.y = 0;
			tmin = t1;
		}

		// Pull the max down
		tmax = box2d.b2Min(tmax, t2);

		if (tmin > tmax)
		{
			return false;
		}
	}

	if (absD_y < box2d.b2_epsilon)
	{
		// Parallel.
		if (p_y < this.lowerBound.y || this.upperBound.y < p_y)
		{
			return false;
		}
	}
	else
	{
		var inv_d = 1 / d_y;
		var t1 = (this.lowerBound.y - p_y) * inv_d;
		var t2 = (this.upperBound.y - p_y) * inv_d;

		// Sign of the normal vector.
		var s = (-1);

		if (t1 > t2)
		{
			var t3 = t1;
			t1 = t2;
			t2 = t3;
			s = 1;
		}

		// Push the min up
		if (t1 > tmin)
		{
			normal.x = 0;
			normal.y = s;
			tmin = t1;
		}

		// Pull the max down
		tmax = box2d.b2Min(tmax, t2);

		if (tmin > tmax)
		{
			return false;
		}
	}

	// Does the ray start inside the box?
	// Does the ray intersect beyond the max fraction?
	if (tmin < 0 || input.maxFraction < tmin)
	{
		return false;
	}

	// Intersection.
	output.fraction = tmin;

	return true;
}

/**
 * @export 
 * @return {boolean} 
 * @param {box2d.b2AABB} other 
 */
box2d.b2AABB.prototype.TestOverlap = function (other)
{
	var d1_x = other.lowerBound.x - this.upperBound.x;
	var d1_y = other.lowerBound.y - this.upperBound.y;
	var d2_x = this.lowerBound.x - other.upperBound.x;
	var d2_y = this.lowerBound.y - other.upperBound.y;

	if (d1_x > 0 || d1_y > 0)
		return false;

	if (d2_x > 0 || d2_y > 0)
		return false;

	return true;
}

/**
 * @export 
 * @return {boolean} 
 * @param {box2d.b2AABB} a
 * @param {box2d.b2AABB} b 
 */
box2d.b2TestOverlap_AABB = function (a, b)
{
	var d1_x = b.lowerBound.x - a.upperBound.x;
	var d1_y = b.lowerBound.y - a.upperBound.y;
	var d2_x = a.lowerBound.x - b.upperBound.x;
	var d2_y = a.lowerBound.y - b.upperBound.y;

	if (d1_x > 0 || d1_y > 0)
		return false;

	if (d2_x > 0 || d2_y > 0)
		return false;

	return true;
}

/** 
 * Clipping for contact manifolds. 
 * Sutherland-Hodgman clipping. 
 * @export 
 * @return {number} 
 * @param {Array.<box2d.b2ClipVertex>} vOut 
 * @param {Array.<box2d.b2ClipVertex>} vIn
 * @param {box2d.b2Vec2} normal 
 * @param {number} offset 
 * @param {number} vertexIndexA 
 */
box2d.b2ClipSegmentToLine = function (vOut, vIn, normal, offset, vertexIndexA)
{
	// Start with no output points
	var numOut = 0;

	var vIn0 = vIn[0];
	var vIn1 = vIn[1];

	// Calculate the distance of end points to the line
	var distance0 = box2d.b2Dot_V2_V2(normal, vIn0.v) - offset;
	var distance1 = box2d.b2Dot_V2_V2(normal, vIn1.v) - offset;

	// If the points are behind the plane
	if (distance0 <= 0) vOut[numOut++].Copy(vIn0);
	if (distance1 <= 0) vOut[numOut++].Copy(vIn1);

	// If the points are on different sides of the plane
	if (distance0 * distance1 < 0)
	{
		// Find intersection point of edge and plane
		var interp = distance0 / (distance0 - distance1);
		var v = vOut[numOut].v;
		v.x = vIn0.v.x + interp * (vIn1.v.x - vIn0.v.x);
		v.y = vIn0.v.y + interp * (vIn1.v.y - vIn0.v.y);

		// VertexA is hitting edgeB.
		var id = vOut[numOut].id;
		id.cf.indexA = vertexIndexA;
		id.cf.indexB = vIn0.id.cf.indexB;
		id.cf.typeA = box2d.b2ContactFeatureType.e_vertex;
		id.cf.typeB = box2d.b2ContactFeatureType.e_face;
		++numOut;
	}

	return numOut;
}

/**
 * @export 
 * @return {boolean} 
 * @param {box2d.b2Shape} shapeA 
 * @param {number} indexA 
 * @param {box2d.b2Shape} shapeB 
 * @param {number} indexB 
 * @param {box2d.b2Transform} xfA 
 * @param {box2d.b2Transform} xfB 
 */
box2d.b2TestOverlap_Shape = function (shapeA, indexA, shapeB, indexB, xfA, xfB)
{
	var input = box2d.b2TestOverlap_Shape.s_input.Reset();
	input.proxyA.SetShape(shapeA, indexA);
	input.proxyB.SetShape(shapeB, indexB);
	input.transformA.Copy(xfA);
	input.transformB.Copy(xfB);
	input.useRadii = true;

	var simplexCache = box2d.b2TestOverlap_Shape.s_simplexCache.Reset();
	simplexCache.count = 0;

	var output = box2d.b2TestOverlap_Shape.s_output.Reset();

	box2d.b2ShapeDistance(output, simplexCache, input);

	return output.distance < 10 * box2d.b2_epsilon;
}
box2d.b2TestOverlap_Shape.s_input = new box2d.b2DistanceInput();
box2d.b2TestOverlap_Shape.s_simplexCache = new box2d.b2SimplexCache();
box2d.b2TestOverlap_Shape.s_output = new box2d.b2DistanceOutput();

/**
 * @export 
 * @return {boolean} 
 * @param {box2d.b2AABB|box2d.b2Shape} AABBA_or_shapeA 
 * @param {box2d.b2AABB|number} AABBB_or_indexA 
 * @param {box2d.b2Shape=} shapeB 
 * @param {number=} indexB 
 * @param {box2d.b2Transform=} xfA 
 * @param {box2d.b2Transform=} xfB 
 */
box2d.b2TestOverlap = function (AABBA_or_shapeA, AABBB_or_indexA, shapeB, indexB, xfA, xfB)
{
	if ((AABBA_or_shapeA instanceof box2d.b2AABB) && 
		(AABBB_or_indexA instanceof box2d.b2AABB))
	{
		return box2d.b2TestOverlap_AABB(AABBA_or_shapeA, AABBB_or_indexA);
	}
	else if ((AABBA_or_shapeA instanceof box2d.b2Shape) && 
			 (typeof(AABBB_or_indexA) === 'number') && 
			 (shapeB instanceof box2d.b2Shape) && 
			 (typeof(indexB) === 'number') && 
			 (xfA instanceof box2d.b2Transform) && 
			 (xfB instanceof box2d.b2Transform))
	{
		return box2d.b2TestOverlap_Shape(AABBA_or_shapeA, AABBB_or_indexA, shapeB, indexB, xfA, xfB);
	}
	else
	{
		throw new Error();
	}
}

