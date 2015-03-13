/*
 * Copyright (c) 2007-2009 Erin Catto http://www.box2d.org
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

goog.provide('box2d.b2CollideEdge');

goog.require('box2d.b2Collision');

/** 
 * Compute the collision manifold between an edge and a circle. 
 * Compute contact points for edge versus circle. 
 * This accounts for edge connectivity.
 * @export 
 * @return {void} 
 * @param {box2d.b2Manifold} manifold 
 * @param {box2d.b2EdgeShape} edgeA
 * @param {box2d.b2Transform} xfA
 * @param {box2d.b2CircleShape} circleB
 * @param {box2d.b2Transform} xfB 
 */
box2d.b2CollideEdgeAndCircle = function (manifold, edgeA, xfA, circleB, xfB)
{
	manifold.pointCount = 0;
	
	// Compute circle in frame of edge
	/** @type {box2d.b2Vec2} */ var Q = box2d.b2MulT_X_V2(xfA, box2d.b2Mul_X_V2(xfB, circleB.m_p, box2d.b2Vec2.s_t0), box2d.b2CollideEdgeAndCircle.s_Q);
	
	/** @type {box2d.b2Vec2} */ var A = edgeA.m_vertex1;
	/** @type {box2d.b2Vec2} */ var B = edgeA.m_vertex2;
	/** @type {box2d.b2Vec2} */ var e = box2d.b2Sub_V2_V2(B, A, box2d.b2CollideEdgeAndCircle.s_e);
	
	// Barycentric coordinates
	/** @type {number} */ var u = box2d.b2Dot_V2_V2(e, box2d.b2Sub_V2_V2(B, Q, box2d.b2Vec2.s_t0));
	/** @type {number} */ var v = box2d.b2Dot_V2_V2(e, box2d.b2Sub_V2_V2(Q, A, box2d.b2Vec2.s_t0));
	
	/** @type {number} */ var radius = edgeA.m_radius + circleB.m_radius;
	
//	/** @type {box2d.b2ContactFeature} */ var cf = new box2d.b2ContactFeature();
	/** @type {box2d.b2ContactID} */ var id = box2d.b2CollideEdgeAndCircle.s_id;
	id.cf.indexB = 0;
	id.cf.typeB = box2d.b2ContactFeatureType.e_vertex;
	
	// Region A
	if (v <= 0)
	{
		/** @type {box2d.b2Vec2} */ var P = A;
		/** @type {box2d.b2Vec2} */ var d = box2d.b2Sub_V2_V2(Q, P, box2d.b2CollideEdgeAndCircle.s_d);
		/** @type {number} */ var dd = box2d.b2Dot_V2_V2(d, d);
		if (dd > radius * radius)
		{
			return;
		}
		
		// Is there an edge connected to A?
		if (edgeA.m_hasVertex0)
		{
			/** @type {box2d.b2Vec2} */ var A1 = edgeA.m_vertex0;
			/** @type {box2d.b2Vec2} */ var B1 = A;
			/** @type {box2d.b2Vec2} */ var e1 = box2d.b2Sub_V2_V2(B1, A1, box2d.b2CollideEdgeAndCircle.s_e1);
			/** @type {number} */ var u1 = box2d.b2Dot_V2_V2(e1, box2d.b2Sub_V2_V2(B1, Q, box2d.b2Vec2.s_t0));
			
			// Is the circle in Region AB of the previous edge?
			if (u1 > 0)
			{
				return;
			}
		}
		
		id.cf.indexA = 0;
		id.cf.typeA = box2d.b2ContactFeatureType.e_vertex;
		manifold.pointCount = 1;
		manifold.type = box2d.b2ManifoldType.e_circles;
		manifold.localNormal.SetZero();
		manifold.localPoint.Copy(P);
		manifold.points[0].id.Copy(id);
//		manifold.points[0].id.key = 0;
//		manifold.points[0].id.cf = cf;
		manifold.points[0].localPoint.Copy(circleB.m_p);
		return;
	}
	
	// Region B
	if (u <= 0)
	{
		/** type {box2d.b2Vec2} */ var P = B;
		/** type {box2d.b2Vec2} */ var d = box2d.b2Sub_V2_V2(Q, P, box2d.b2CollideEdgeAndCircle.s_d);
		/** type {number} */ var dd = box2d.b2Dot_V2_V2(d, d);
		if (dd > radius * radius)
		{
			return;
		}
		
		// Is there an edge connected to B?
		if (edgeA.m_hasVertex3)
		{
			/** @type {box2d.b2Vec2} */ var B2 = edgeA.m_vertex3;
			/** @type {box2d.b2Vec2} */ var A2 = B;
			/** @type {box2d.b2Vec2} */ var e2 = box2d.b2Sub_V2_V2(B2, A2, box2d.b2CollideEdgeAndCircle.s_e2);
			/** @type {number} */ var v2 = box2d.b2Dot_V2_V2(e2, box2d.b2Sub_V2_V2(Q, A2, box2d.b2Vec2.s_t0));
			
			// Is the circle in Region AB of the next edge?
			if (v2 > 0)
			{
				return;
			}
		}
		
		id.cf.indexA = 1;
		id.cf.typeA = box2d.b2ContactFeatureType.e_vertex;
		manifold.pointCount = 1;
		manifold.type = box2d.b2ManifoldType.e_circles;
		manifold.localNormal.SetZero();
		manifold.localPoint.Copy(P);
		manifold.points[0].id.Copy(id);
//		manifold.points[0].id.key = 0;
//		manifold.points[0].id.cf = cf;
		manifold.points[0].localPoint.Copy(circleB.m_p);
		return;
	}
	
	// Region AB
	/** @type {number} */ var den = box2d.b2Dot_V2_V2(e, e);
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(den > 0); }
	/** type {box2d.b2Vec2} */ var P = box2d.b2CollideEdgeAndCircle.s_P;
	P.x = (1 / den) * (u * A.x + v * B.x);
	P.y = (1 / den) * (u * A.y + v * B.y);
	/** type {box2d.b2Vec2} */ var d = box2d.b2Sub_V2_V2(Q, P, box2d.b2CollideEdgeAndCircle.s_d);
	/** type {number} */ var dd = box2d.b2Dot_V2_V2(d, d);
	if (dd > radius * radius)
	{
		return;
	}
	
	/** @type {box2d.b2Vec2} */ var n = box2d.b2CollideEdgeAndCircle.s_n.Set(-e.y, e.x);
	if (box2d.b2Dot_V2_V2(n, box2d.b2Sub_V2_V2(Q, A, box2d.b2Vec2.s_t0)) < 0)
	{
		n.Set(-n.x, -n.y);
	}
	n.Normalize();
	
	id.cf.indexA = 0;
	id.cf.typeA = box2d.b2ContactFeatureType.e_face;
	manifold.pointCount = 1;
	manifold.type = box2d.b2ManifoldType.e_faceA;
	manifold.localNormal.Copy(n);
	manifold.localPoint.Copy(A);
	manifold.points[0].id.Copy(id);
//	manifold.points[0].id.key = 0;
//	manifold.points[0].id.cf = cf;
	manifold.points[0].localPoint.Copy(circleB.m_p);
}
box2d.b2CollideEdgeAndCircle.s_Q = new box2d.b2Vec2();
box2d.b2CollideEdgeAndCircle.s_e = new box2d.b2Vec2();
box2d.b2CollideEdgeAndCircle.s_d = new box2d.b2Vec2();
box2d.b2CollideEdgeAndCircle.s_e1 = new box2d.b2Vec2();
box2d.b2CollideEdgeAndCircle.s_e2 = new box2d.b2Vec2();
box2d.b2CollideEdgeAndCircle.s_P = new box2d.b2Vec2();
box2d.b2CollideEdgeAndCircle.s_n = new box2d.b2Vec2();
box2d.b2CollideEdgeAndCircle.s_id = new box2d.b2ContactID();

/** 
 * @export 
 * @enum
 */
box2d.b2EPAxisType = 
{
	e_unknown	: 0, 
	e_edgeA		: 1, 
	e_edgeB		: 2
};
goog.exportProperty(box2d.b2EPAxisType, 'e_unknown', box2d.b2EPAxisType.e_unknown);
goog.exportProperty(box2d.b2EPAxisType, 'e_edgeA'  , box2d.b2EPAxisType.e_edgeA  );
goog.exportProperty(box2d.b2EPAxisType, 'e_edgeB'  , box2d.b2EPAxisType.e_edgeB  );
	
/** 
 * This structure is used to keep track of the best separating 
 * axis. 
 * @export 
 * @constructor
 */
box2d.b2EPAxis = function ()
{
};

/**
 * @export 
 * @type {box2d.b2EPAxisType}
 */
box2d.b2EPAxis.prototype.type = box2d.b2EPAxisType.e_unknown;
/**
 * @export 
 * @type {number}
 */
box2d.b2EPAxis.prototype.index = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2EPAxis.prototype.separation = 0;

/** 
 * This holds polygon B expressed in frame A. 
 * @export 
 * @constructor
 */
box2d.b2TempPolygon = function ()
{
	this.vertices = box2d.b2Vec2.MakeArray(box2d.b2_maxPolygonVertices);
	this.normals = box2d.b2Vec2.MakeArray(box2d.b2_maxPolygonVertices);
	this.count = 0;
};

/**
 * @export 
 * @type {Array.<box2d.b2Vec2>}
 */
box2d.b2TempPolygon.prototype.vertices = null;
/**
 * @export 
 * @type {Array.<box2d.b2Vec2>}
 */
box2d.b2TempPolygon.prototype.normals = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2TempPolygon.prototype.count = 0;

/** 
 * Reference face used for clipping 
 * @export 
 * @constructor
 */
box2d.b2ReferenceFace = function ()
{
	this.i1 = 0;
	this.i2 = 0;
	
	this.v1 = new box2d.b2Vec2();
	this.v2 = new box2d.b2Vec2();
	
	this.normal = new box2d.b2Vec2();
	
	this.sideNormal1 = new box2d.b2Vec2();
	this.sideOffset1 = 0;
	
	this.sideNormal2 = new box2d.b2Vec2();
	this.sideOffset2 = 0;
};

/**
 * @export 
 * @type {number}
 */
box2d.b2ReferenceFace.prototype.i1 = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2ReferenceFace.prototype.i2 = 0;

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2ReferenceFace.prototype.v1 = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2ReferenceFace.prototype.v2 = null;

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2ReferenceFace.prototype.normal = null;

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2ReferenceFace.prototype.sideNormal1 = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2ReferenceFace.prototype.sideOffset1 = 0;

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2ReferenceFace.prototype.sideNormal2 = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2ReferenceFace.prototype.sideOffset2 = 0;

/**
 * @export
 * @enum
 */
box2d.b2EPColliderVertexType = 
{
	e_isolated	: 0,
	e_concave	: 1,
	e_convex	: 2
};
goog.exportProperty(box2d.b2EPColliderVertexType, 'e_isolated', box2d.b2EPColliderVertexType.e_isolated);
goog.exportProperty(box2d.b2EPColliderVertexType, 'e_concave' , box2d.b2EPColliderVertexType.e_concave );
goog.exportProperty(box2d.b2EPColliderVertexType, 'e_convex'  , box2d.b2EPColliderVertexType.e_convex  );
	
/** 
 * This class collides and edge and a polygon, taking into 
 * account edge adjacency. 
 * @export 
 * @constructor
 */
box2d.b2EPCollider = function ()
{
	this.m_polygonB = new box2d.b2TempPolygon();
	
	this.m_xf = new box2d.b2Transform();
	this.m_centroidB = new box2d.b2Vec2();
	this.m_v0 = new box2d.b2Vec2(), this.m_v1 = new box2d.b2Vec2(), this.m_v2 = new box2d.b2Vec2(), this.m_v3 = new box2d.b2Vec2();
	this.m_normal0 = new box2d.b2Vec2(), this.m_normal1 = new box2d.b2Vec2(), this.m_normal2 = new box2d.b2Vec2();
	this.m_normal = new box2d.b2Vec2();
	this.m_type1 = box2d.b2EPColliderVertexType.e_isolated, this.m_type2 = box2d.b2EPColliderVertexType.e_isolated;
	this.m_lowerLimit = new box2d.b2Vec2(), this.m_upperLimit = new box2d.b2Vec2();
	this.m_radius = 0;
	this.m_front = false;
};

/**
 * @export 
 * @type {box2d.b2TempPolygon}
 */
box2d.b2EPCollider.prototype.m_polygonB = null;

/**
 * @export 
 * @type {box2d.b2Transform}
 */
box2d.b2EPCollider.prototype.m_xf = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2EPCollider.prototype.m_centroidB = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2EPCollider.prototype.m_v0 = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2EPCollider.prototype.m_v1 = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2EPCollider.prototype.m_v2 = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2EPCollider.prototype.m_v3 = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2EPCollider.prototype.m_normal0 = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2EPCollider.prototype.m_normal1 = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2EPCollider.prototype.m_normal2 = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2EPCollider.prototype.m_normal = null;
/**
 * @export 
 * @type {box2d.b2EPColliderVertexType}
 */
box2d.b2EPCollider.prototype.m_type1 = box2d.b2EPColliderVertexType.e_isolated;
/**
 * @export 
 * @type {box2d.b2EPColliderVertexType}
 */
box2d.b2EPCollider.prototype.m_type2 = box2d.b2EPColliderVertexType.e_isolated;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2EPCollider.prototype.m_lowerLimit = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2EPCollider.prototype.m_upperLimit = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2EPCollider.prototype.m_radius = 0;
/**
 * @export 
 * @type {boolean}
 */
box2d.b2EPCollider.prototype.m_front = false;

/** 
 * Algorithm:
 * 1. Classify v1 and v2
 * 2. Classify polygon centroid as front or back
 * 3. Flip normal if necessary
 * 4. Initialize normal range to [-pi, pi] about face normal
 * 5. Adjust normal range according to adjacent edges
 * 6. Visit each separating axes, only accept axes within the range
 * 7. Return if _any_ axis indicates separation
 * 8. Clip
 * @export 
 * @return {void} 
 * @param {box2d.b2Manifold} manifold 
 * @param {box2d.b2EdgeShape} edgeA 
 * @param {box2d.b2Transform} xfA 
 * @param {box2d.b2PolygonShape} polygonB 
 * @param {box2d.b2Transform} xfB 
 */
box2d.b2EPCollider.prototype.Collide = function (manifold, edgeA, xfA, polygonB, xfB)
{
	box2d.b2MulT_X_X(xfA, xfB, this.m_xf);
	
	box2d.b2Mul_X_V2(this.m_xf, polygonB.m_centroid, this.m_centroidB);
	
	this.m_v0.Copy(edgeA.m_vertex0);
	this.m_v1.Copy(edgeA.m_vertex1);
	this.m_v2.Copy(edgeA.m_vertex2);
	this.m_v3.Copy(edgeA.m_vertex3);
	
	/** @type {boolean} */ var hasVertex0 = edgeA.m_hasVertex0;
	/** @type {boolean} */ var hasVertex3 = edgeA.m_hasVertex3;
	
	/** @type {box2d.b2Vec2} */ var edge1 = box2d.b2Sub_V2_V2(this.m_v2, this.m_v1, box2d.b2EPCollider.s_edge1);
	edge1.Normalize();
	this.m_normal1.Set(edge1.y, -edge1.x);
	/** @type {number} */ var offset1 = box2d.b2Dot_V2_V2(this.m_normal1, box2d.b2Sub_V2_V2(this.m_centroidB, this.m_v1, box2d.b2Vec2.s_t0));
	/** @type {number} */ var offset0 = 0;
	/** @type {number} */ var offset2 = 0;
	/** @type {boolean} */ var convex1 = false;
	/** @type {boolean} */ var convex2 = false;
	
	// Is there a preceding edge?
	if (hasVertex0)
	{
		/** @type {box2d.b2Vec2} */ var edge0 = box2d.b2Sub_V2_V2(this.m_v1, this.m_v0, box2d.b2EPCollider.s_edge0);
		edge0.Normalize();
		this.m_normal0.Set(edge0.y, -edge0.x);
		convex1 = box2d.b2Cross_V2_V2(edge0, edge1) >= 0;
		offset0 = box2d.b2Dot_V2_V2(this.m_normal0, box2d.b2Sub_V2_V2(this.m_centroidB, this.m_v0, box2d.b2Vec2.s_t0));
	}
	
	// Is there a following edge?
	if (hasVertex3)
	{
		/** @type {box2d.b2Vec2} */ var edge2 = box2d.b2Sub_V2_V2(this.m_v3, this.m_v2, box2d.b2EPCollider.s_edge2);
		edge2.Normalize();
		this.m_normal2.Set(edge2.y, -edge2.x);
		convex2 = box2d.b2Cross_V2_V2(edge1, edge2) > 0;
		offset2 = box2d.b2Dot_V2_V2(this.m_normal2, box2d.b2Sub_V2_V2(this.m_centroidB, this.m_v2, box2d.b2Vec2.s_t0));
	}
	
	// Determine front or back collision. Determine collision normal limits.
	if (hasVertex0 && hasVertex3)
	{
		if (convex1 && convex2)
		{
			this.m_front = offset0 >= 0 || offset1 >= 0 || offset2 >= 0;
			if (this.m_front)
			{
				this.m_normal.Copy(this.m_normal1);
				this.m_lowerLimit.Copy(this.m_normal0);
				this.m_upperLimit.Copy(this.m_normal2);
			}
			else
			{
				this.m_normal.Copy(this.m_normal1).SelfNeg();
				this.m_lowerLimit.Copy(this.m_normal1).SelfNeg();
				this.m_upperLimit.Copy(this.m_normal1).SelfNeg();
			}
		}
		else if (convex1)
		{
			this.m_front = offset0 >= 0 || (offset1 >= 0 && offset2 >= 0);
			if (this.m_front)
			{
				this.m_normal.Copy(this.m_normal1);
				this.m_lowerLimit.Copy(this.m_normal0);
				this.m_upperLimit.Copy(this.m_normal1);
			}
			else
			{
				this.m_normal.Copy(this.m_normal1).SelfNeg();
				this.m_lowerLimit.Copy(this.m_normal2).SelfNeg();
				this.m_upperLimit.Copy(this.m_normal1).SelfNeg();
			}
		}
		else if (convex2)
		{
			this.m_front = offset2 >= 0 || (offset0 >= 0 && offset1 >= 0);
			if (this.m_front)
			{
				this.m_normal.Copy(this.m_normal1);
				this.m_lowerLimit.Copy(this.m_normal1);
				this.m_upperLimit.Copy(this.m_normal2);
			}
			else
			{
				this.m_normal.Copy(this.m_normal1).SelfNeg();
				this.m_lowerLimit.Copy(this.m_normal1).SelfNeg();
				this.m_upperLimit.Copy(this.m_normal0).SelfNeg();
			}
		}
		else
		{
			this.m_front = offset0 >= 0 && offset1 >= 0 && offset2 >= 0;
			if (this.m_front)
			{
				this.m_normal.Copy(this.m_normal1);
				this.m_lowerLimit.Copy(this.m_normal1);
				this.m_upperLimit.Copy(this.m_normal1);
			}
			else
			{
				this.m_normal.Copy(this.m_normal1).SelfNeg();
				this.m_lowerLimit.Copy(this.m_normal2).SelfNeg();
				this.m_upperLimit.Copy(this.m_normal0).SelfNeg();
			}
		}
	}
	else if (hasVertex0)
	{
		if (convex1)
		{
			this.m_front = offset0 >= 0 || offset1 >= 0;
			if (this.m_front)
			{
				this.m_normal.Copy(this.m_normal1);
				this.m_lowerLimit.Copy(this.m_normal0);
				this.m_upperLimit.Copy(this.m_normal1).SelfNeg();
			}
			else
			{
				this.m_normal.Copy(this.m_normal1).SelfNeg();
				this.m_lowerLimit.Copy(this.m_normal1);
				this.m_upperLimit.Copy(this.m_normal1).SelfNeg();
			}
		}
		else
		{
			this.m_front = offset0 >= 0 && offset1 >= 0;
			if (this.m_front)
			{
				this.m_normal.Copy(this.m_normal1);
				this.m_lowerLimit.Copy(this.m_normal1);
				this.m_upperLimit.Copy(this.m_normal1).SelfNeg();
			}
			else
			{
				this.m_normal.Copy(this.m_normal1).SelfNeg();
				this.m_lowerLimit.Copy(this.m_normal1);
				this.m_upperLimit.Copy(this.m_normal0).SelfNeg();
			}
		}
	}
	else if (hasVertex3)
	{
		if (convex2)
		{
			this.m_front = offset1 >= 0 || offset2 >= 0;
			if (this.m_front)
			{
				this.m_normal.Copy(this.m_normal1);
				this.m_lowerLimit.Copy(this.m_normal1).SelfNeg();
				this.m_upperLimit.Copy(this.m_normal2);
			}
			else
			{
				this.m_normal.Copy(this.m_normal1).SelfNeg();
				this.m_lowerLimit.Copy(this.m_normal1).SelfNeg();
				this.m_upperLimit.Copy(this.m_normal1);
			}
		}
		else
		{
			this.m_front = offset1 >= 0 && offset2 >= 0;
			if (this.m_front)
			{
				this.m_normal.Copy(this.m_normal1);
				this.m_lowerLimit.Copy(this.m_normal1).SelfNeg();
				this.m_upperLimit.Copy(this.m_normal1);
			}
			else
			{
				this.m_normal.Copy(this.m_normal1).SelfNeg();
				this.m_lowerLimit.Copy(this.m_normal2).SelfNeg();
				this.m_upperLimit.Copy(this.m_normal1);
			}
		}		
	}
	else
	{
		this.m_front = offset1 >= 0;
		if (this.m_front)
		{
			this.m_normal.Copy(this.m_normal1);
			this.m_lowerLimit.Copy(this.m_normal1).SelfNeg();
			this.m_upperLimit.Copy(this.m_normal1).SelfNeg();
		}
		else
		{
			this.m_normal.Copy(this.m_normal1).SelfNeg();
			this.m_lowerLimit.Copy(this.m_normal1);
			this.m_upperLimit.Copy(this.m_normal1);
		}
	}
	
	// Get polygonB in frameA
	this.m_polygonB.count = polygonB.m_count;
	for (var i = 0, ict = polygonB.m_count; i < ict; ++i)
	{
		box2d.b2Mul_X_V2(this.m_xf, polygonB.m_vertices[i], this.m_polygonB.vertices[i]);
		box2d.b2Mul_R_V2(this.m_xf.q, polygonB.m_normals[i], this.m_polygonB.normals[i]);
	}
	
	this.m_radius = 2 * box2d.b2_polygonRadius;
	
	manifold.pointCount = 0;
	
	/** @type {box2d.b2EPAxis} */ var edgeAxis = this.ComputeEdgeSeparation(box2d.b2EPCollider.s_edgeAxis);
	
	// If no valid normal can be found than this edge should not collide.
	if (edgeAxis.type === box2d.b2EPAxisType.e_unknown)
	{
		return;
	}
	
	if (edgeAxis.separation > this.m_radius)
	{
		return;
	}
	
	/** @type {box2d.b2EPAxis} */ var polygonAxis = this.ComputePolygonSeparation(box2d.b2EPCollider.s_polygonAxis);
	if (polygonAxis.type !== box2d.b2EPAxisType.e_unknown && polygonAxis.separation > this.m_radius)
	{
		return;
	}
	
	// Use hysteresis for jitter reduction.
	/** @type {number} */ var k_relativeTol = 0.98;
	/** @type {number} */ var k_absoluteTol = 0.001;
	
	/** @type {box2d.b2EPAxis} */ var primaryAxis;
	if (polygonAxis.type === box2d.b2EPAxisType.e_unknown)
	{
		primaryAxis = edgeAxis;
	}
	else if (polygonAxis.separation > k_relativeTol * edgeAxis.separation + k_absoluteTol)
	{
		primaryAxis = polygonAxis;
	}
	else
	{
		primaryAxis = edgeAxis;
	}
	
	/** @type {Array.<box2d.b2ClipVertex>} */ var ie = box2d.b2EPCollider.s_ie;
	/** @type {box2d.b2ReferenceFace} */ var rf = box2d.b2EPCollider.s_rf;
	if (primaryAxis.type === box2d.b2EPAxisType.e_edgeA)
	{
		manifold.type = box2d.b2ManifoldType.e_faceA;
		
		// Search for the polygon normal that is most anti-parallel to the edge normal.
		/** @type {number} */ var bestIndex = 0;
		/** @type {number} */ var bestValue = box2d.b2Dot_V2_V2(this.m_normal, this.m_polygonB.normals[0]);
		for (var i = 1, ict = this.m_polygonB.count; i < ict; ++i)
		{
			/** @type {number} */ var value = box2d.b2Dot_V2_V2(this.m_normal, this.m_polygonB.normals[i]);
			if (value < bestValue)
			{
				bestValue = value;
				bestIndex = i;
			}
		}
		
		/** @type {number} */ var i1 = bestIndex;
		/** @type {number} */ var i2 = (i1 + 1) % this.m_polygonB.count;
		
		var ie0 = ie[0];
		ie0.v.Copy(this.m_polygonB.vertices[i1]);
		ie0.id.cf.indexA = 0;
		ie0.id.cf.indexB = i1;
		ie0.id.cf.typeA = box2d.b2ContactFeatureType.e_face;
		ie0.id.cf.typeB = box2d.b2ContactFeatureType.e_vertex;
		
		var ie1 = ie[1];
		ie1.v.Copy(this.m_polygonB.vertices[i2]);
		ie1.id.cf.indexA = 0;
		ie1.id.cf.indexB = i2;
		ie1.id.cf.typeA = box2d.b2ContactFeatureType.e_face;
		ie1.id.cf.typeB = box2d.b2ContactFeatureType.e_vertex;
		
		if (this.m_front)
		{
			rf.i1 = 0;
			rf.i2 = 1;
			rf.v1.Copy(this.m_v1);
			rf.v2.Copy(this.m_v2);
			rf.normal.Copy(this.m_normal1);
		}
		else
		{
			rf.i1 = 1;
			rf.i2 = 0;
			rf.v1.Copy(this.m_v2);
			rf.v2.Copy(this.m_v1);
			rf.normal.Copy(this.m_normal1).SelfNeg();
		}		
	}
	else
	{
		manifold.type = box2d.b2ManifoldType.e_faceB;
		
		var ie0 = ie[0];
		ie0.v.Copy(this.m_v1);
		ie0.id.cf.indexA = 0;
		ie0.id.cf.indexB = primaryAxis.index;
		ie0.id.cf.typeA = box2d.b2ContactFeatureType.e_vertex;
		ie0.id.cf.typeB = box2d.b2ContactFeatureType.e_face;
		
		var ie1 = ie[1];
		ie1.v.Copy(this.m_v2);
		ie1.id.cf.indexA = 0;
		ie1.id.cf.indexB = primaryAxis.index;		
		ie1.id.cf.typeA = box2d.b2ContactFeatureType.e_vertex;
		ie1.id.cf.typeB = box2d.b2ContactFeatureType.e_face;
		
		rf.i1 = primaryAxis.index;
		rf.i2 = (rf.i1 + 1) % this.m_polygonB.count;
		rf.v1.Copy(this.m_polygonB.vertices[rf.i1]);
		rf.v2.Copy(this.m_polygonB.vertices[rf.i2]);
		rf.normal.Copy(this.m_polygonB.normals[rf.i1]);
	}
	
	rf.sideNormal1.Set(rf.normal.y, -rf.normal.x);
	rf.sideNormal2.Copy(rf.sideNormal1).SelfNeg();
	rf.sideOffset1 = box2d.b2Dot_V2_V2(rf.sideNormal1, rf.v1);
	rf.sideOffset2 = box2d.b2Dot_V2_V2(rf.sideNormal2, rf.v2);
	
	// Clip incident edge against extruded edge1 side edges.
	/** @type {Array.<box2d.b2ClipVertex>} */ var clipPoints1 = box2d.b2EPCollider.s_clipPoints1;
	/** @type {Array.<box2d.b2ClipVertex>} */ var clipPoints2 = box2d.b2EPCollider.s_clipPoints2;
	/** @type {number} */ var np = 0;
	
	// Clip to box side 1
	np = box2d.b2ClipSegmentToLine(clipPoints1, ie, rf.sideNormal1, rf.sideOffset1, rf.i1);
	
	if (np < box2d.b2_maxManifoldPoints)
	{
		return;
	}
	
	// Clip to negative box side 1
	np = box2d.b2ClipSegmentToLine(clipPoints2, clipPoints1, rf.sideNormal2, rf.sideOffset2, rf.i2);
	
	if (np < box2d.b2_maxManifoldPoints)
	{
		return;
	}
	
	// Now clipPoints2 contains the clipped points.
	if (primaryAxis.type === box2d.b2EPAxisType.e_edgeA)
	{
		manifold.localNormal.Copy(rf.normal);
		manifold.localPoint.Copy(rf.v1);
	}
	else
	{
		manifold.localNormal.Copy(polygonB.m_normals[rf.i1]);
		manifold.localPoint.Copy(polygonB.m_vertices[rf.i1]);
	}
	
	/** @type {number} */ var pointCount = 0;
	for (var i = 0, ict = box2d.b2_maxManifoldPoints; i < ict; ++i)
	{
		/** @type {number} */ var separation;
		
		separation = box2d.b2Dot_V2_V2(rf.normal, box2d.b2Sub_V2_V2(clipPoints2[i].v, rf.v1, box2d.b2Vec2.s_t0));
		
		if (separation <= this.m_radius)
		{
			/** @type {box2d.b2ManifoldPoint} */ var cp = manifold.points[pointCount];
			
			if (primaryAxis.type === box2d.b2EPAxisType.e_edgeA)
			{
				box2d.b2MulT_X_V2(this.m_xf, clipPoints2[i].v, cp.localPoint);
				cp.id = clipPoints2[i].id;
			}
			else
			{
				cp.localPoint.Copy(clipPoints2[i].v);
				cp.id.cf.typeA = clipPoints2[i].id.cf.typeB;
				cp.id.cf.typeB = clipPoints2[i].id.cf.typeA;
				cp.id.cf.indexA = clipPoints2[i].id.cf.indexB;
				cp.id.cf.indexB = clipPoints2[i].id.cf.indexA;
			}
			
			++pointCount;
		}
	}
	
	manifold.pointCount = pointCount;
}

box2d.b2EPCollider.s_edge1 = new box2d.b2Vec2();
box2d.b2EPCollider.s_edge0 = new box2d.b2Vec2();
box2d.b2EPCollider.s_edge2 = new box2d.b2Vec2();
box2d.b2EPCollider.s_ie = box2d.b2ClipVertex.MakeArray(2);
box2d.b2EPCollider.s_rf = new box2d.b2ReferenceFace();
box2d.b2EPCollider.s_clipPoints1 = box2d.b2ClipVertex.MakeArray(2);
box2d.b2EPCollider.s_clipPoints2 = box2d.b2ClipVertex.MakeArray(2);
box2d.b2EPCollider.s_edgeAxis = new box2d.b2EPAxis();
box2d.b2EPCollider.s_polygonAxis = new box2d.b2EPAxis();

/**
 * @export 
 * @return {box2d.b2EPAxis}
 * @param {box2d.b2EPAxis} out 
 */
box2d.b2EPCollider.prototype.ComputeEdgeSeparation = function (out)
{
	/** @type {box2d.b2EPAxis} */ var axis = out;
	axis.type = box2d.b2EPAxisType.e_edgeA;
	axis.index = this.m_front ? 0 : 1;
	axis.separation = box2d.b2_maxFloat;
	
	for (var i = 0, ict = this.m_polygonB.count; i < ict; ++i)
	{
		/** @type {number} */ var s = box2d.b2Dot_V2_V2(this.m_normal, box2d.b2Sub_V2_V2(this.m_polygonB.vertices[i], this.m_v1, box2d.b2Vec2.s_t0));
		if (s < axis.separation)
		{
			axis.separation = s;
		}
	}
	
	return axis;
}

/** 
 * @export 
 * @return {box2d.b2EPAxis}
 * @param {box2d.b2EPAxis} out 
 */
box2d.b2EPCollider.prototype.ComputePolygonSeparation = function (out)
{
	/** @type {box2d.b2EPAxis} */ var axis = out;
	axis.type = box2d.b2EPAxisType.e_unknown;
	axis.index = -1;
	axis.separation = -box2d.b2_maxFloat;

	/** @type {box2d.b2Vec2} */ var perp = box2d.b2EPCollider.s_perp.Set(-this.m_normal.y, this.m_normal.x);

	for (var i = 0, ict = this.m_polygonB.count; i < ict; ++i)
	{
		/** @type {box2d.b2Vec2} */ var n = box2d.b2EPCollider.s_n.Copy(this.m_polygonB.normals[i]).SelfNeg();
		
		/** @type {number} */ var s1 = box2d.b2Dot_V2_V2(n, box2d.b2Sub_V2_V2(this.m_polygonB.vertices[i], this.m_v1, box2d.b2Vec2.s_t0));
		/** @type {number} */ var s2 = box2d.b2Dot_V2_V2(n, box2d.b2Sub_V2_V2(this.m_polygonB.vertices[i], this.m_v2, box2d.b2Vec2.s_t0));
		/** @type {number} */ var s = box2d.b2Min(s1, s2);
		
		if (s > this.m_radius)
		{
			// No collision
			axis.type = box2d.b2EPAxisType.e_edgeB;
			axis.index = i;
			axis.separation = s;
			return axis;
		}
		
		// Adjacency
		if (box2d.b2Dot_V2_V2(n, perp) >= 0)
		{
			if (box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(n, this.m_upperLimit, box2d.b2Vec2.s_t0), this.m_normal) < -box2d.b2_angularSlop)
			{
				continue;
			}
		}
		else
		{
			if (box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(n, this.m_lowerLimit, box2d.b2Vec2.s_t0), this.m_normal) < -box2d.b2_angularSlop)
			{
				continue;
			}
		}
		
		if (s > axis.separation)
		{
			axis.type = box2d.b2EPAxisType.e_edgeB;
			axis.index = i;
			axis.separation = s;
		}
	}
	
	return axis;
}
box2d.b2EPCollider.s_n = new box2d.b2Vec2();
box2d.b2EPCollider.s_perp = new box2d.b2Vec2();

/** 
 * Compute the collision manifold between an edge and a polygon.
 * @export 
 * @return {void} 
 * @param {box2d.b2Manifold} manifold 
 * @param {box2d.b2EdgeShape} edgeA
 * @param {box2d.b2Transform} xfA
 * @param {box2d.b2PolygonShape} polygonB
 * @param {box2d.b2Transform} xfB 
 */
box2d.b2CollideEdgeAndPolygon = function (manifold, edgeA, xfA, polygonB, xfB)
{
	/** @type {box2d.b2EPCollider} */ var collider = box2d.b2CollideEdgeAndPolygon.s_collider;
	collider.Collide(manifold, edgeA, xfA, polygonB, xfB);
}
box2d.b2CollideEdgeAndPolygon.s_collider = new box2d.b2EPCollider();

