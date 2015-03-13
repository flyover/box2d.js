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

goog.provide('box2d.b2ShapeDistance');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Math');

/** 
 * A distance proxy is used by the GJK algorithm. 
 * It encapsulates any shape.
 * @export 
 * @constructor
 */
box2d.b2DistanceProxy = function ()
{
	this.m_buffer = box2d.b2Vec2.MakeArray(2);
};

/**
 * @export 
 * @type {Array.<box2d.b2Vec2>}
 */
box2d.b2DistanceProxy.prototype.m_buffer = null;
/**
 * @export 
 * @type {Array.<box2d.b2Vec2>}
 */
box2d.b2DistanceProxy.prototype.m_vertices = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2DistanceProxy.prototype.m_count = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2DistanceProxy.prototype.m_radius = 0;

/**
 * @export 
 * @return {box2d.b2DistanceProxy} 
 */
box2d.b2DistanceProxy.prototype.Reset = function ()
{
	this.m_vertices = null;
	this.m_count = 0;
	this.m_radius = 0;
	return this;
}

/** 
 * Initialize the proxy using the given shape. The shape must 
 * remain in scope while the proxy is in use. 
 * @export 
 * @return {void} 
 * @param {box2d.b2Shape} shape 
 * @param {number} index
 */
box2d.b2DistanceProxy.prototype.SetShape = function (shape, index)
{
	shape.SetupDistanceProxy(this, index);
}

/** 
 * Get the supporting vertex index in the given direction. 
 * @export 
 * @return {number} 
 * @param {box2d.b2Vec2} d 
 */
box2d.b2DistanceProxy.prototype.GetSupport = function (d)
{
	/** @type {number} */ var bestIndex = 0;
	/** @type {number} */ var bestValue = box2d.b2Dot_V2_V2(this.m_vertices[0], d);
	for (var i = 1; i < this.m_count; ++i)
	{
		/** @type {number} */ var value = box2d.b2Dot_V2_V2(this.m_vertices[i], d);
		if (value > bestValue)
		{
			bestIndex = i;
			bestValue = value;
		}
	}

	return bestIndex;
}

/** 
 * Get the supporting vertex in the given direction. 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} d 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2DistanceProxy.prototype.GetSupportVertex = function (d, out)
{
	/** @type {number} */ var bestIndex = 0;
	/** @type {number} */ var bestValue = box2d.b2Dot_V2_V2(this.m_vertices[0], d);
	for (var i = 1; i < this.m_count; ++i)
	{
		/** @type {number} */ var value = box2d.b2Dot_V2_V2(this.m_vertices[i], d);
		if (value > bestValue)
		{
			bestIndex = i;
			bestValue = value;
		}
	}

	return out.Copy(this.m_vertices[bestIndex]);
}

/** 
 * Get the vertex count. 
 * @export 
 * @return {number}
 */
box2d.b2DistanceProxy.prototype.GetVertexCount = function ()
{
	return this.m_count;
}

/** 
 * Get a vertex by index. Used by box2d.b2Distance. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {number} index 
 */
box2d.b2DistanceProxy.prototype.GetVertex = function (index)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(0 <= index && index < this.m_count); }
	return this.m_vertices[index];
}

/** 
 * Used to warm start box2d.b2Distance. 
 * Set count to zero on first call.
 * @export 
 * @constructor
 */
box2d.b2SimplexCache = function ()
{
	this.indexA = box2d.b2MakeNumberArray(3);
	this.indexB = box2d.b2MakeNumberArray(3);
};

/**
 * @export 
 * @type {number}
 */
box2d.b2SimplexCache.prototype.metric = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2SimplexCache.prototype.count = 0;
/**
 * @export 
 * @type {Array.<number>}
 */
box2d.b2SimplexCache.prototype.indexA = null;
/**
 * @export 
 * @type {Array.<number>}
 */
box2d.b2SimplexCache.prototype.indexB = null;

/**
 * @export 
 * @return {box2d.b2SimplexCache} 
 */
box2d.b2SimplexCache.prototype.Reset = function ()
{
	this.metric = 0;
	this.count = 0;
	return this;
}

/** 
 * Input for box2d.b2Distance. 
 * You have to option to use the shape radii in the computation. 
 * @export 
 * @constructor
 */
box2d.b2DistanceInput = function ()
{
	this.proxyA = new box2d.b2DistanceProxy();
	this.proxyB = new box2d.b2DistanceProxy();
	this.transformA = new box2d.b2Transform();
	this.transformB = new box2d.b2Transform();
};

/**
 * @export 
 * @type {box2d.b2DistanceProxy}
 */
box2d.b2DistanceInput.prototype.proxyA = null;
/**
 * @export 
 * @type {box2d.b2DistanceProxy}
 */
box2d.b2DistanceInput.prototype.proxyB = null;
/**
 * @export 
 * @type {box2d.b2Transform}
 */
box2d.b2DistanceInput.prototype.transformA = null;
/**
 * @export 
 * @type {box2d.b2Transform}
 */
box2d.b2DistanceInput.prototype.transformB = null;
/**
 * @export 
 * @type {boolean}
 */
box2d.b2DistanceInput.prototype.useRadii = false;

/**
 * @export 
 * @return {box2d.b2DistanceInput} 
 */
box2d.b2DistanceInput.prototype.Reset = function ()
{
	this.proxyA.Reset();
	this.proxyB.Reset();
	this.transformA.SetIdentity();
	this.transformB.SetIdentity();
	this.useRadii = false;
	return this;
}

/** 
 * Output for box2d.b2Distance. 
 * @export 
 * @constructor 
 */
box2d.b2DistanceOutput = function ()
{
	this.pointA = new box2d.b2Vec2();
	this.pointB = new box2d.b2Vec2();
};

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2DistanceOutput.prototype.pointA = null;	///< closest point on shapeA
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2DistanceOutput.prototype.pointB = null;	///< closest point on shapeB
/**
 * @export 
 * @type {number}
 */
box2d.b2DistanceOutput.prototype.distance = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2DistanceOutput.prototype.iterations = 0; ///< number of GJK iterations used

/**
 * @export 
 * @return {box2d.b2DistanceOutput} 
 */
box2d.b2DistanceOutput.prototype.Reset = function ()
{
	this.pointA.SetZero();
	this.pointB.SetZero();
	this.distance = 0;
	this.iterations = 0;
	return this;
}

/**
 * GJK using Voronoi regions (Christer Ericson) and Barycentric 
 * coordinates. 
 */

/**
 * @export 
 * @type {number}
 */
box2d.b2_gjkCalls = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2_gjkIters = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2_gjkMaxIters = 0;

/**
 * @export 
 * @constructor
 */
box2d.b2SimplexVertex = function ()
{
	this.wA = new box2d.b2Vec2();
	this.wB = new box2d.b2Vec2();
	this.w = new box2d.b2Vec2();
};

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2SimplexVertex.prototype.wA = null; // support point in proxyA
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2SimplexVertex.prototype.wB = null; // support point in proxyB
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2SimplexVertex.prototype.w = null; // wB - wA
/**
 * @export 
 * @type {number}
 */
box2d.b2SimplexVertex.prototype.a = 0; // barycentric coordinate for closest point
/**
 * @export 
 * @type {number}
 */
box2d.b2SimplexVertex.prototype.indexA = 0; // wA index
/**
 * @export 
 * @type {number}
 */
box2d.b2SimplexVertex.prototype.indexB = 0; // wB index

/**
 * @export 
 * @return {box2d.b2SimplexVertex} 
 * @param {box2d.b2SimplexVertex} other 
 */
box2d.b2SimplexVertex.prototype.Copy = function (other)
{
	this.wA.Copy(other.wA);		// support point in proxyA
	this.wB.Copy(other.wB);     // support point in proxyB
	this.w.Copy(other.w);       // wB - wA
	this.a = other.a;           // barycentric coordinate for closest point
	this.indexA = other.indexA; // wA index
	this.indexB = other.indexB; // wB index
	return this;
}

/**
 * @export 
 * @constructor
 */
box2d.b2Simplex = function ()
{
	this.m_v1 = new box2d.b2SimplexVertex();
	this.m_v2 = new box2d.b2SimplexVertex();
	this.m_v3 = new box2d.b2SimplexVertex();
	this.m_vertices = new Array(3);
	this.m_vertices[0] = this.m_v1;
	this.m_vertices[1] = this.m_v2;
	this.m_vertices[2] = this.m_v3;
}

/**
 * @export 
 * @type {box2d.b2SimplexVertex}
 */
box2d.b2Simplex.prototype.m_v1 = null;
/**
 * @export 
 * @type {box2d.b2SimplexVertex}
 */
box2d.b2Simplex.prototype.m_v2 = null;
/**
 * @export 
 * @type {box2d.b2SimplexVertex}
 */
box2d.b2Simplex.prototype.m_v3 = null;
/**
 * @export 
 * @type {Array.<box2d.b2SimplexVertex>}
 */
box2d.b2Simplex.prototype.m_vertices = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2Simplex.prototype.m_count = 0;

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2SimplexCache} cache 
 * @param {box2d.b2DistanceProxy} proxyA 
 * @param {box2d.b2Transform} transformA 
 * @param {box2d.b2DistanceProxy} proxyB 
 * @param {box2d.b2Transform} transformB 
 */
box2d.b2Simplex.prototype.ReadCache = function (cache, proxyA, transformA, proxyB, transformB)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(0 <= cache.count && cache.count <= 3); }

	// Copy data from cache.
	this.m_count = cache.count;
	/** @type Array.<box2d.b2SimplexVertex> */ var vertices = this.m_vertices;
	for (var i = 0; i < this.m_count; ++i)
	{
		/** @type {box2d.b2SimplexVertex} */ var v = vertices[i];
		v.indexA = cache.indexA[i];
		v.indexB = cache.indexB[i];
		/** @type {box2d.b2Vec2} */ var wALocal = proxyA.GetVertex(v.indexA);
		/** @type {box2d.b2Vec2} */ var wBLocal = proxyB.GetVertex(v.indexB);
		box2d.b2Mul_X_V2(transformA, wALocal, v.wA);
		box2d.b2Mul_X_V2(transformB, wBLocal, v.wB);
		box2d.b2Sub_V2_V2(v.wB, v.wA, v.w);
		v.a = 0;
	}

	// Compute the new simplex metric, if it is substantially different than
	// old metric then flush the simplex.
	if (this.m_count > 1)
	{
		/** @type {number} */ var metric1 = cache.metric;
		/** @type {number} */ var metric2 = this.GetMetric();
		if (metric2 < 0.5 * metric1 || 2 * metric1 < metric2 || metric2 < box2d.b2_epsilon)
		{
			// Reset the simplex.
			this.m_count = 0;
		}
	}

	// If the cache is empty or invalid ...
	if (this.m_count === 0)
	{
		/** type {box2d.b2SimplexVertex} */ var v = vertices[0];
		v.indexA = 0;
		v.indexB = 0;
		/** type {box2d.b2Vec2} */ var wALocal = proxyA.GetVertex(0);
		/** type {box2d.b2Vec2} */ var wBLocal = proxyB.GetVertex(0);
		box2d.b2Mul_X_V2(transformA, wALocal, v.wA);
		box2d.b2Mul_X_V2(transformB, wBLocal, v.wB);
		box2d.b2Sub_V2_V2(v.wB, v.wA, v.w);
		v.a = 1;
		this.m_count = 1;
	}
}

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2SimplexCache} cache 
 */
box2d.b2Simplex.prototype.WriteCache = function (cache)
{
	cache.metric = this.GetMetric();
	cache.count = this.m_count;
	/** @type {Array.<box2d.b2SimplexVertex>} */ var vertices = this.m_vertices;
	for (var i = 0; i < this.m_count; ++i)
	{
		cache.indexA[i] = vertices[i].indexA;
		cache.indexB[i] = vertices[i].indexB;
	}
}

/** 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2Simplex.prototype.GetSearchDirection = function (out)
{
	switch (this.m_count)
	{
	case 1:
		return out.Copy(this.m_v1.w).SelfNeg();

	case 2:
		{
			var e12 = box2d.b2Sub_V2_V2(this.m_v2.w, this.m_v1.w, out);
			var sgn = box2d.b2Cross_V2_V2(e12, box2d.b2Vec2.s_t0.Copy(this.m_v1.w).SelfNeg());
			if (sgn > 0)
			{
				// Origin is left of e12.
				return box2d.b2Cross_S_V2(1.0, e12, out);
			}
			else
			{
				// Origin is right of e12.
				return box2d.b2Cross_V2_S(e12, 1.0, out);
			}
		}

	default:
		if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(false); }
		return out.SetZero();
	}
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out 
 */
box2d.b2Simplex.prototype.GetClosestPoint = function (out)
{
	switch (this.m_count)
	{
	case 0:
		if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(false); }
		return out.SetZero();

	case 1:
		return out.Copy(this.m_v1.w);

	case 2:
		return out.Set(
			this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x, 
			this.m_v1.a * this.m_v1.w.y + this.m_v2.a * this.m_v2.w.y);

	case 3:
		return out.SetZero();

	default:
		if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(false); }
		return out.SetZero();
	}
}

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2Vec2} pA
 * @param {box2d.b2Vec2} pB 
 */
box2d.b2Simplex.prototype.GetWitnessPoints = function (pA, pB)
{
	switch (this.m_count)
	{
	case 0:
		if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(false); }
		break;

	case 1:
		pA.Copy(this.m_v1.wA);
		pB.Copy(this.m_v1.wB);
		break;

	case 2:
		pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x;
		pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y;
		pB.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x;
		pB.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y;
		break;

	case 3:
		pB.x = pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x;
		pB.y = pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y + this.m_v3.a * this.m_v3.wA.y;
		break;

	default:
		if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(false); }
		break;
	}
}

/**
 * @export 
 * @return {number}
 */
box2d.b2Simplex.prototype.GetMetric = function ()
{
	switch (this.m_count)
	{
	case 0:
		if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(false); }
		return 0;

	case 1:
		return 0;

	case 2:
		return box2d.b2Distance(this.m_v1.w, this.m_v2.w);

	case 3:
		return box2d.b2Cross_V2_V2(box2d.b2Sub_V2_V2(this.m_v2.w, this.m_v1.w, box2d.b2Vec2.s_t0), box2d.b2Sub_V2_V2(this.m_v3.w, this.m_v1.w, box2d.b2Vec2.s_t1));

	default:
		if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(false); }
		return 0;
	}
}

/** 
 * Solve a line segment using barycentric coordinates.
 *
 * p = a1 * w1 + a2 * w2
 * a1 + a2 = 1
 *
 * The vector from the origin to the closest point on the line is
 * perpendicular to the line.
 * e12 = w2 - w1
 * dot(p, e) = 0
 * a1 * dot(w1, e) + a2 * dot(w2, e) = 0
 *
 * 2-by-2 linear system
 * [1      1     ][a1] = [1]
 * [w1.e12 w2.e12][a2] = [0]
 *
 * Define
 * d12_1 =  dot(w2, e12)
 * d12_2 = -dot(w1, e12)
 * d12 = d12_1 + d12_2
 *
 * Solution
 * a1 = d12_1 / d12
 * a2 = d12_2 / d12
 *  
 * @export 
 * @return {void} 
 */
box2d.b2Simplex.prototype.Solve2 = function ()
{
	/** @type {box2d.b2Vec2} */ var w1 = this.m_v1.w;
	/** @type {box2d.b2Vec2} */ var w2 = this.m_v2.w;
	/** @type {box2d.b2Vec2} */ var e12 = box2d.b2Sub_V2_V2(w2, w1, box2d.b2Simplex.s_e12);

	// w1 region
	/** @type {number} */ var d12_2 = (-box2d.b2Dot_V2_V2(w1, e12));
	if (d12_2 <= 0)
	{
		// a2 <= 0, so we clamp it to 0
		this.m_v1.a = 1;
		this.m_count = 1;
		return;
	}

	// w2 region
	/** @type {number} */ var d12_1 = box2d.b2Dot_V2_V2(w2, e12);
	if (d12_1 <= 0)
	{
		// a1 <= 0, so we clamp it to 0
		this.m_v2.a = 1;
		this.m_count = 1;
		this.m_v1.Copy(this.m_v2);
		return;
	}

	// Must be in e12 region.
	/** @type {number} */ var inv_d12 = 1 / (d12_1 + d12_2);
	this.m_v1.a = d12_1 * inv_d12;
	this.m_v2.a = d12_2 * inv_d12;
	this.m_count = 2;
}

/**
 * Possible regions:
 * - points[2]
 * - edge points[0]-points[2]
 * - edge points[1]-points[2]
 * - inside the triangle
 * @export 
 * @return {void} 
 */
box2d.b2Simplex.prototype.Solve3 = function ()
{
	/** @type {box2d.b2Vec2} */ var w1 = this.m_v1.w;
	/** @type {box2d.b2Vec2} */ var w2 = this.m_v2.w;
	/** @type {box2d.b2Vec2} */ var w3 = this.m_v3.w;

	// Edge12
	// [1      1     ][a1] = [1]
	// [w1.e12 w2.e12][a2] = [0]
	// a3 = 0
	/** @type {box2d.b2Vec2} */ var e12 = box2d.b2Sub_V2_V2(w2, w1, box2d.b2Simplex.s_e12);
	/** @type {number} */ var w1e12 = box2d.b2Dot_V2_V2(w1, e12);
	/** @type {number} */ var w2e12 = box2d.b2Dot_V2_V2(w2, e12);
	/** @type {number} */ var d12_1 = w2e12;
	/** @type {number} */ var d12_2 = (-w1e12);

	// Edge13
	// [1      1     ][a1] = [1]
	// [w1.e13 w3.e13][a3] = [0]
	// a2 = 0
	/** @type {box2d.b2Vec2} */ var e13 = box2d.b2Sub_V2_V2(w3, w1, box2d.b2Simplex.s_e13);
	/** @type {number} */ var w1e13 = box2d.b2Dot_V2_V2(w1, e13);
	/** @type {number} */ var w3e13 = box2d.b2Dot_V2_V2(w3, e13);
	/** @type {number} */ var d13_1 = w3e13;
	/** @type {number} */ var d13_2 = (-w1e13);

	// Edge23
	// [1      1     ][a2] = [1]
	// [w2.e23 w3.e23][a3] = [0]
	// a1 = 0
	/** @type {box2d.b2Vec2} */ var e23 = box2d.b2Sub_V2_V2(w3, w2, box2d.b2Simplex.s_e23);
	/** @type {number} */ var w2e23 = box2d.b2Dot_V2_V2(w2, e23);
	/** @type {number} */ var w3e23 = box2d.b2Dot_V2_V2(w3, e23);
	/** @type {number} */ var d23_1 = w3e23;
	/** @type {number} */ var d23_2 = (-w2e23);

	// Triangle123
	/** @type {number} */ var n123 = box2d.b2Cross_V2_V2(e12, e13);

	/** @type {number} */ var d123_1 = n123 * box2d.b2Cross_V2_V2(w2, w3);
	/** @type {number} */ var d123_2 = n123 * box2d.b2Cross_V2_V2(w3, w1);
	/** @type {number} */ var d123_3 = n123 * box2d.b2Cross_V2_V2(w1, w2);

	// w1 region
	if (d12_2 <= 0 && d13_2 <= 0)
	{
		this.m_v1.a = 1;
		this.m_count = 1;
		return;
	}

	// e12
	if (d12_1 > 0 && d12_2 > 0 && d123_3 <= 0)
	{
		/** @type {number} */ var inv_d12 = 1 / (d12_1 + d12_2);
		this.m_v1.a = d12_1 * inv_d12;
		this.m_v2.a = d12_2 * inv_d12;
		this.m_count = 2;
		return;
	}

	// e13
	if (d13_1 > 0 && d13_2 > 0 && d123_2 <= 0)
	{
		/** @type {number} */ var inv_d13 = 1 / (d13_1 + d13_2);
		this.m_v1.a = d13_1 * inv_d13;
		this.m_v3.a = d13_2 * inv_d13;
		this.m_count = 2;
		this.m_v2.Copy(this.m_v3);
		return;
	}

	// w2 region
	if (d12_1 <= 0 && d23_2 <= 0)
	{
		this.m_v2.a = 1;
		this.m_count = 1;
		this.m_v1.Copy(this.m_v2);
		return;
	}

	// w3 region
	if (d13_1 <= 0 && d23_1 <= 0)
	{
		this.m_v3.a = 1;
		this.m_count = 1;
		this.m_v1.Copy(this.m_v3);
		return;
	}

	// e23
	if (d23_1 > 0 && d23_2 > 0 && d123_1 <= 0)
	{
		/** @type {number} */ var inv_d23 = 1 / (d23_1 + d23_2);
		this.m_v2.a = d23_1 * inv_d23;
		this.m_v3.a = d23_2 * inv_d23;
		this.m_count = 2;
		this.m_v1.Copy(this.m_v3);
		return;
	}

	// Must be in triangle123
	/** @type {number} */ var inv_d123 = 1 / (d123_1 + d123_2 + d123_3);
	this.m_v1.a = d123_1 * inv_d123;
	this.m_v2.a = d123_2 * inv_d123;
	this.m_v3.a = d123_3 * inv_d123;
	this.m_count = 3;
}
box2d.b2Simplex.s_e12 = new box2d.b2Vec2();
box2d.b2Simplex.s_e13 = new box2d.b2Vec2();
box2d.b2Simplex.s_e23 = new box2d.b2Vec2();

/** 
 * Compute the closest points between two shapes. Supports any combination of:
 * box2d.b2CircleShape, box2d.b2PolygonShape, box2d.b2EdgeShape. The simplex cache is input/output.
 * On the first call set box2d.b2SimplexCache.count to zero.
 * @export 
 * @param {box2d.b2DistanceOutput} output 
 * @param {box2d.b2SimplexCache} cache 
 * @param {box2d.b2DistanceInput} input 
 * @return {void} 
 */
box2d.b2ShapeDistance = function (output, cache, input)
{
	++box2d.b2_gjkCalls;

	var proxyA = input.proxyA;
	var proxyB = input.proxyB;

	var transformA = input.transformA;
	var transformB = input.transformB;

	// Initialize the simplex.
	/** @type {box2d.b2Simplex} */ var simplex = box2d.b2Distance.s_simplex;
	simplex.ReadCache(cache, proxyA, transformA, proxyB, transformB);

	// Get simplex vertices as an array.
	/** @type {Array.<box2d.b2SimplexVertex>} */ var vertices = simplex.m_vertices;
	/** @type {number} */ var k_maxIters = 20;

	// These store the vertices of the last simplex so that we
	// can check for duplicates and prevent cycling.
	/** @type {Array.<number>} */ var saveA = box2d.b2Distance.s_saveA;
	/** @type {Array.<number>} */ var saveB = box2d.b2Distance.s_saveB;
	/** @type {number} */ var saveCount = 0;

	/** @type {number} */ var distanceSqr1 = box2d.b2_maxFloat;
	/** @type {number} */ var distanceSqr2 = distanceSqr1;

	// Main iteration loop.
	var iter = 0;
	while (iter < k_maxIters)
	{
		// Copy simplex so we can identify duplicates.
		saveCount = simplex.m_count;
		for (var i = 0; i < saveCount; ++i)
		{
			saveA[i] = vertices[i].indexA;
			saveB[i] = vertices[i].indexB;
		}

		switch (simplex.m_count)
		{
		case 1:
			break;

		case 2:
			simplex.Solve2();
			break;

		case 3:
			simplex.Solve3();
			break;

		default:
			if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(false); }
		}

		// If we have 3 points, then the origin is in the corresponding triangle.
		if (simplex.m_count === 3)
		{
			break;
		}

		// Compute closest point.
		/** @type {box2d.b2Vec2} */ var p = simplex.GetClosestPoint(box2d.b2Distance.s_p);
		distanceSqr2 = p.LengthSquared();

		// Ensure progress
		/*
		TODO: to fix compile warning
		if (distanceSqr2 > distanceSqr1)
		{
			//break;
		}
		*/
		distanceSqr1 = distanceSqr2;

		// Get search direction.
		/** @type {box2d.b2Vec2} */ var d = simplex.GetSearchDirection(box2d.b2Distance.s_d);

		// Ensure the search direction is numerically fit.
		if (d.LengthSquared() < box2d.b2_epsilon_sq)
		{
			// The origin is probably contained by a line segment
			// or triangle. Thus the shapes are overlapped.

			// We can't return zero here even though there may be overlap.
			// In case the simplex is a point, segment, or triangle it is difficult
			// to determine if the origin is contained in the CSO or very close to it.
			break;
		}

		// Compute a tentative new simplex vertex using support points.
		/** @type {box2d.b2SimplexVertex} */ var vertex = vertices[simplex.m_count];
		vertex.indexA = proxyA.GetSupport(box2d.b2MulT_R_V2(transformA.q, box2d.b2Vec2.s_t0.Copy(d).SelfNeg(), box2d.b2Distance.s_supportA));
		box2d.b2Mul_X_V2(transformA, proxyA.GetVertex(vertex.indexA), vertex.wA);
		vertex.indexB = proxyB.GetSupport(box2d.b2MulT_R_V2(transformB.q, d, box2d.b2Distance.s_supportB));
		box2d.b2Mul_X_V2(transformB, proxyB.GetVertex(vertex.indexB), vertex.wB);
		box2d.b2Sub_V2_V2(vertex.wB, vertex.wA, vertex.w);

		// Iteration count is equated to the number of support point calls.
		++iter;
		++box2d.b2_gjkIters;

		// Check for duplicate support points. This is the main termination criteria.
		/** @type {boolean} */ var duplicate = false;
		for (var i = 0; i < saveCount; ++i)
		{
			if (vertex.indexA === saveA[i] && vertex.indexB === saveB[i])
			{
				duplicate = true;
				break;
			}
		}

		// If we found a duplicate support point we must exit to avoid cycling.
		if (duplicate)
		{
			break;
		}

		// New vertex is ok and needed.
		++simplex.m_count;
	}

	box2d.b2_gjkMaxIters = box2d.b2Max(box2d.b2_gjkMaxIters, iter);

	// Prepare output.
	simplex.GetWitnessPoints(output.pointA, output.pointB);
	output.distance = box2d.b2Distance(output.pointA, output.pointB);
	output.iterations = iter;

	// Cache the simplex.
	simplex.WriteCache(cache);

	// Apply radii if requested.
	if (input.useRadii)
	{
		/** @type {number} */ var rA = proxyA.m_radius;
		/** @type {number} */ var rB = proxyB.m_radius;

		if (output.distance > (rA + rB) && output.distance > box2d.b2_epsilon)
		{
			// Shapes are still no overlapped.
			// Move the witness points to the outer surface.
			output.distance -= rA + rB;
			/** @type {box2d.b2Vec2} */ var normal = box2d.b2Sub_V2_V2(output.pointB, output.pointA, box2d.b2Distance.s_normal);
			normal.Normalize();
			output.pointA.SelfMulAdd(rA, normal);
			output.pointB.SelfMulSub(rB, normal);
		}
		else
		{
			// Shapes are overlapped when radii are considered.
			// Move the witness points to the middle.
			/** type {box2d.b2Vec2} */ var p = box2d.b2Mid_V2_V2(output.pointA, output.pointB, box2d.b2Distance.s_p);
			output.pointA.Copy(p);
			output.pointB.Copy(p);
			output.distance = 0;
		}
	}
}
box2d.b2Distance.s_simplex = new box2d.b2Simplex();
box2d.b2Distance.s_saveA = box2d.b2MakeNumberArray(3);
box2d.b2Distance.s_saveB = box2d.b2MakeNumberArray(3);
box2d.b2Distance.s_p = new box2d.b2Vec2();
box2d.b2Distance.s_d = new box2d.b2Vec2();
box2d.b2Distance.s_normal = new box2d.b2Vec2();
box2d.b2Distance.s_supportA = new box2d.b2Vec2();
box2d.b2Distance.s_supportB = new box2d.b2Vec2();

