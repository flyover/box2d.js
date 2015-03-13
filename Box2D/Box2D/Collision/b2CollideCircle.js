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

goog.provide('box2d.b2CollideCircle');

goog.require('box2d.b2Collision');

/** 
 * Compute the collision manifold between two circles. 
 * @export 
 * @return {void} 
 * @param {box2d.b2Manifold} manifold 
 * @param {box2d.b2CircleShape} circleA 
 * @param {box2d.b2Transform} xfA 
 * @param {box2d.b2CircleShape} circleB 
 * @param {box2d.b2Transform} xfB 
 */
box2d.b2CollideCircles = function (manifold, circleA, xfA, circleB, xfB)
{
	manifold.pointCount = 0;

	var pA = box2d.b2Mul_X_V2(xfA, circleA.m_p, box2d.b2CollideCircles.s_pA);
	var pB = box2d.b2Mul_X_V2(xfB, circleB.m_p, box2d.b2CollideCircles.s_pB);

	var distSqr = box2d.b2DistanceSquared(pA, pB);
	var radius = circleA.m_radius + circleB.m_radius;
	if (distSqr > radius * radius)
	{
		return;
	}

	manifold.type = box2d.b2ManifoldType.e_circles;
	manifold.localPoint.Copy(circleA.m_p);
	manifold.localNormal.SetZero();
	manifold.pointCount = 1;

	manifold.points[0].localPoint.Copy(circleB.m_p);
	manifold.points[0].id.key = 0;
}
box2d.b2CollideCircles.s_pA = new box2d.b2Vec2();
box2d.b2CollideCircles.s_pB = new box2d.b2Vec2();

/** 
 * Compute the collision manifold between a polygon and a 
 * circle. 
 * @export 
 * @return {void} 
 * @param {box2d.b2Manifold} manifold
 * @param {box2d.b2PolygonShape} polygonA
 * @param {box2d.b2Transform} xfA
 * @param {box2d.b2CircleShape} circleB
 * @param {box2d.b2Transform} xfB
 */
box2d.b2CollidePolygonAndCircle = function (manifold, polygonA, xfA, circleB, xfB)
{
	manifold.pointCount = 0;

	// Compute circle position in the frame of the polygon.
	var c = box2d.b2Mul_X_V2(xfB, circleB.m_p, box2d.b2CollidePolygonAndCircle.s_c);
	var cLocal = box2d.b2MulT_X_V2(xfA, c, box2d.b2CollidePolygonAndCircle.s_cLocal);

	// Find the min separating edge.
	var normalIndex = 0;
	var separation = (-box2d.b2_maxFloat);
	var radius = polygonA.m_radius + circleB.m_radius;
	var vertexCount = polygonA.m_count;
	var vertices = polygonA.m_vertices;
	var normals = polygonA.m_normals;

	for (var i = 0; i < vertexCount; ++i)
	{
		var s = box2d.b2Dot_V2_V2(normals[i], box2d.b2Sub_V2_V2(cLocal, vertices[i], box2d.b2Vec2.s_t0));

		if (s > radius)
		{
			// Early out.
			return;
		}

		if (s > separation)
		{
			separation = s;
			normalIndex = i;
		}
	}

	// Vertices that subtend the incident face.
	var vertIndex1 = normalIndex;
	var vertIndex2 = (vertIndex1 + 1) % vertexCount;
	var v1 = vertices[vertIndex1];
	var v2 = vertices[vertIndex2];

	// If the center is inside the polygon ...
	if (separation < box2d.b2_epsilon)
	{
		manifold.pointCount = 1;
		manifold.type = box2d.b2ManifoldType.e_faceA;
		manifold.localNormal.Copy(normals[normalIndex]);
		box2d.b2Mid_V2_V2(v1, v2, manifold.localPoint);
		manifold.points[0].localPoint.Copy(circleB.m_p);
		manifold.points[0].id.key = 0;
		return;
	}

	// Compute barycentric coordinates
	var u1 = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(cLocal, v1, box2d.b2Vec2.s_t0), box2d.b2Sub_V2_V2(v2, v1, box2d.b2Vec2.s_t1));
	var u2 = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(cLocal, v2, box2d.b2Vec2.s_t0), box2d.b2Sub_V2_V2(v1, v2, box2d.b2Vec2.s_t1));
	if (u1 <= 0)
	{
		if (box2d.b2DistanceSquared(cLocal, v1) > radius * radius)
		{
			return;
		}

		manifold.pointCount = 1;
		manifold.type = box2d.b2ManifoldType.e_faceA;
		box2d.b2Sub_V2_V2(cLocal, v1, manifold.localNormal).SelfNormalize();
		manifold.localPoint.Copy(v1);
		manifold.points[0].localPoint.Copy(circleB.m_p);
		manifold.points[0].id.key = 0;
	}
	else if (u2 <= 0)
	{
		if (box2d.b2DistanceSquared(cLocal, v2) > radius * radius)
		{
			return;
		}

		manifold.pointCount = 1;
		manifold.type = box2d.b2ManifoldType.e_faceA;
		box2d.b2Sub_V2_V2(cLocal, v2, manifold.localNormal).SelfNormalize();
		manifold.localPoint.Copy(v2);
		manifold.points[0].localPoint.Copy(circleB.m_p);
		manifold.points[0].id.key = 0;
	}
	else
	{
		var faceCenter = box2d.b2Mid_V2_V2(v1, v2, box2d.b2CollidePolygonAndCircle.s_faceCenter);
		separation = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(cLocal, faceCenter, box2d.b2Vec2.s_t1), normals[vertIndex1]);
		if (separation > radius)
		{
			return;
		}

		manifold.pointCount = 1;
		manifold.type = box2d.b2ManifoldType.e_faceA;
		manifold.localNormal.Copy(normals[vertIndex1]).SelfNormalize();
		manifold.localPoint.Copy(faceCenter);
		manifold.points[0].localPoint.Copy(circleB.m_p);
		manifold.points[0].id.key = 0;
	}
}
box2d.b2CollidePolygonAndCircle.s_c = new box2d.b2Vec2();
box2d.b2CollidePolygonAndCircle.s_cLocal = new box2d.b2Vec2();
box2d.b2CollidePolygonAndCircle.s_faceCenter = new box2d.b2Vec2();

