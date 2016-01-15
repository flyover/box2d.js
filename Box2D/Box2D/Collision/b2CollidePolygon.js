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

goog.provide('box2d.b2CollidePolygon');

goog.require('box2d.b2Collision');

/**
 * Find the max separation between poly1 and poly2 using edge
 * normals from poly1.
 * @export
 * @return {number}
 * @param {Array.<number>} edgeIndex
 * @param {box2d.b2PolygonShape} poly1
 * @param {box2d.b2Transform} xf1
 * @param {box2d.b2PolygonShape} poly2
 * @param {box2d.b2Transform} xf2
 */
box2d.b2FindMaxSeparation = function(edgeIndex, poly1, xf1, poly2, xf2) {
  var /*int32*/ count1 = poly1.m_count;
  var /*int32*/ count2 = poly2.m_count;
  var /*const b2Vec2**/ n1s = poly1.m_normals;
  var /*const b2Vec2**/ v1s = poly1.m_vertices;
  var /*const b2Vec2**/ v2s = poly2.m_vertices;
  var /*b2Transform*/ xf = box2d.b2MulT_X_X(xf2, xf1, box2d.b2FindMaxSeparation.s_xf);

  var /*int32*/ bestIndex = 0;
  var /*float32*/ maxSeparation = -box2d.b2_maxFloat;
  for (var /*int32*/ i = 0; i < count1; ++i) {
    // Get poly1 normal in frame2.
    var /*b2Vec2*/ n = box2d.b2Mul_R_V2(xf.q, n1s[i], box2d.b2FindMaxSeparation.s_n);
    var /*b2Vec2*/ v1 = box2d.b2Mul_X_V2(xf, v1s[i], box2d.b2FindMaxSeparation.s_v1);

    // Find deepest point for normal i.
    var /*float32*/ si = box2d.b2_maxFloat;
    for (var /*int32*/ j = 0; j < count2; ++j) {
      var /*float32*/ sij = box2d.b2Dot_V2_V2(n, box2d.b2Sub_V2_V2(v2s[j], v1, box2d.b2Vec2.s_t0)); // b2Dot(n, v2s[j] - v1);
      if (sij < si) {
        si = sij;
      }
    }

    if (si > maxSeparation) {
      maxSeparation = si;
      bestIndex = i;
    }
  }

  edgeIndex[0] = bestIndex; // *edgeIndex = bestIndex;
  return maxSeparation;
}
box2d.b2FindMaxSeparation.s_xf = new box2d.b2Transform();
box2d.b2FindMaxSeparation.s_n = new box2d.b2Vec2();
box2d.b2FindMaxSeparation.s_v1 = new box2d.b2Vec2();

/**
 * @export
 * @return {void}
 * @param {Array.<box2d.b2ClipVertex>} c
 * @param {box2d.b2PolygonShape} poly1
 * @param {box2d.b2Transform} xf1
 * @param {number} edge1
 * @param {box2d.b2PolygonShape} poly2
 * @param {box2d.b2Transform} xf2
 */
box2d.b2FindIncidentEdge = function(c, poly1, xf1, edge1, poly2, xf2) {
  var count1 = poly1.m_count;
  var normals1 = poly1.m_normals;

  var count2 = poly2.m_count;
  var vertices2 = poly2.m_vertices;
  var normals2 = poly2.m_normals;

  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(0 <= edge1 && edge1 < count1);
  }

  // Get the normal of the reference edge in poly2's frame.
  var normal1 = box2d.b2MulT_R_V2(xf2.q, box2d.b2Mul_R_V2(xf1.q, normals1[edge1], box2d.b2Vec2.s_t0), box2d.b2FindIncidentEdge.s_normal1);

  // Find the incident edge on poly2.
  var index = 0;
  var minDot = box2d.b2_maxFloat;
  for (var i = 0; i < count2; ++i) {
    var dot = box2d.b2Dot_V2_V2(normal1, normals2[i]);
    if (dot < minDot) {
      minDot = dot;
      index = i;
    }
  }

  // Build the clip vertices for the incident edge.
  var i1 = index;
  var i2 = (i1 + 1) % count2;

  var c0 = c[0];
  box2d.b2Mul_X_V2(xf2, vertices2[i1], c0.v);
  var cf0 = c0.id.cf;
  cf0.indexA = edge1;
  cf0.indexB = i1;
  cf0.typeA = box2d.b2ContactFeatureType.e_face;
  cf0.typeB = box2d.b2ContactFeatureType.e_vertex;

  var c1 = c[1];
  box2d.b2Mul_X_V2(xf2, vertices2[i2], c1.v);
  var cf1 = c1.id.cf;
  cf1.indexA = edge1;
  cf1.indexB = i2;
  cf1.typeA = box2d.b2ContactFeatureType.e_face;
  cf1.typeB = box2d.b2ContactFeatureType.e_vertex;
}
box2d.b2FindIncidentEdge.s_normal1 = new box2d.b2Vec2();

/**
 * Find edge normal of max separation on A - return if separating axis is found
 * Find edge normal of max separation on B - return if separation axis is found
 * Choose reference edge as min(minA, minB)
 * Find incident edge
 * Clip
 * The normal points from 1 to 2
 * @export
 * @return {void}
 * @param {box2d.b2Manifold} manifold
 * @param {box2d.b2PolygonShape} polyA
 * @param {box2d.b2Transform} xfA
 * @param {box2d.b2PolygonShape} polyB
 * @param {box2d.b2Transform} xfB
 */
box2d.b2CollidePolygons = function(manifold, polyA, xfA, polyB, xfB) {
  manifold.pointCount = 0;
  var totalRadius = polyA.m_radius + polyB.m_radius;

  var edgeA = box2d.b2CollidePolygons.s_edgeA;
  edgeA[0] = 0;
  var separationA = box2d.b2FindMaxSeparation(edgeA, polyA, xfA, polyB, xfB);
  if (separationA > totalRadius)
    return;

  var edgeB = box2d.b2CollidePolygons.s_edgeB;
  edgeB[0] = 0;
  var separationB = box2d.b2FindMaxSeparation(edgeB, polyB, xfB, polyA, xfA);
  if (separationB > totalRadius)
    return;

  var poly1; // reference polygon
  var poly2; // incident polygon
  var xf1, xf2;
  var edge1 = 0; // reference edge
  var flip = 0;
  var k_relativeTol = 0.98;
  var k_absoluteTol = 0.001;

  if (separationB > k_relativeTol * separationA + k_absoluteTol) {
    poly1 = polyB;
    poly2 = polyA;
    xf1 = xfB;
    xf2 = xfA;
    edge1 = edgeB[0];
    manifold.type = box2d.b2ManifoldType.e_faceB;
    flip = 1;
  } else {
    poly1 = polyA;
    poly2 = polyB;
    xf1 = xfA;
    xf2 = xfB;
    edge1 = edgeA[0];
    manifold.type = box2d.b2ManifoldType.e_faceA;
    flip = 0;
  }

  var incidentEdge = box2d.b2CollidePolygons.s_incidentEdge;
  box2d.b2FindIncidentEdge(incidentEdge, poly1, xf1, edge1, poly2, xf2);

  var count1 = poly1.m_count;
  var vertices1 = poly1.m_vertices;

  var iv1 = edge1;
  var iv2 = (edge1 + 1) % count1;

  var local_v11 = vertices1[iv1];
  var local_v12 = vertices1[iv2];

  var localTangent = box2d.b2Sub_V2_V2(local_v12, local_v11, box2d.b2CollidePolygons.s_localTangent);
  localTangent.Normalize();

  var localNormal = box2d.b2Cross_V2_S(localTangent, 1.0, box2d.b2CollidePolygons.s_localNormal);
  var planePoint = box2d.b2Mid_V2_V2(local_v11, local_v12, box2d.b2CollidePolygons.s_planePoint);

  var tangent = box2d.b2Mul_R_V2(xf1.q, localTangent, box2d.b2CollidePolygons.s_tangent);
  var normal = box2d.b2Cross_V2_S(tangent, 1.0, box2d.b2CollidePolygons.s_normal);

  var v11 = box2d.b2Mul_X_V2(xf1, local_v11, box2d.b2CollidePolygons.s_v11);
  var v12 = box2d.b2Mul_X_V2(xf1, local_v12, box2d.b2CollidePolygons.s_v12);

  // Face offset.
  var frontOffset = box2d.b2Dot_V2_V2(normal, v11);

  // Side offsets, extended by polytope skin thickness.
  var sideOffset1 = -box2d.b2Dot_V2_V2(tangent, v11) + totalRadius;
  var sideOffset2 = box2d.b2Dot_V2_V2(tangent, v12) + totalRadius;

  // Clip incident edge against extruded edge1 side edges.
  var clipPoints1 = box2d.b2CollidePolygons.s_clipPoints1;
  var clipPoints2 = box2d.b2CollidePolygons.s_clipPoints2;
  var np;

  // Clip to box side 1
  var ntangent = box2d.b2CollidePolygons.s_ntangent.Copy(tangent).SelfNeg();
  np = box2d.b2ClipSegmentToLine(clipPoints1, incidentEdge, ntangent, sideOffset1, iv1);

  if (np < 2)
    return;

  // Clip to negative box side 1
  np = box2d.b2ClipSegmentToLine(clipPoints2, clipPoints1, tangent, sideOffset2, iv2);

  if (np < 2) {
    return;
  }

  // Now clipPoints2 contains the clipped points.
  manifold.localNormal.Copy(localNormal);
  manifold.localPoint.Copy(planePoint);

  var pointCount = 0;
  for (var i = 0; i < box2d.b2_maxManifoldPoints; ++i) {
    var cv = clipPoints2[i];
    var separation = box2d.b2Dot_V2_V2(normal, cv.v) - frontOffset;

    if (separation <= totalRadius) {
      var cp = manifold.points[pointCount];
      box2d.b2MulT_X_V2(xf2, cv.v, cp.localPoint);
      cp.id.Copy(cv.id);
      if (flip) {
        // Swap features
        /** @type {box2d.b2ContactFeature} */
        var cf = cp.id.cf;
        cp.id.cf.indexA = cf.indexB;
        cp.id.cf.indexB = cf.indexA;
        cp.id.cf.typeA = cf.typeB;
        cp.id.cf.typeB = cf.typeA;
      }
      ++pointCount;
    }
  }

  manifold.pointCount = pointCount;
}
box2d.b2CollidePolygons.s_incidentEdge = box2d.b2ClipVertex.MakeArray(2);
box2d.b2CollidePolygons.s_clipPoints1 = box2d.b2ClipVertex.MakeArray(2);
box2d.b2CollidePolygons.s_clipPoints2 = box2d.b2ClipVertex.MakeArray(2);
box2d.b2CollidePolygons.s_edgeA = box2d.b2MakeNumberArray(1);
box2d.b2CollidePolygons.s_edgeB = box2d.b2MakeNumberArray(1);
box2d.b2CollidePolygons.s_localTangent = new box2d.b2Vec2();
box2d.b2CollidePolygons.s_localNormal = new box2d.b2Vec2();
box2d.b2CollidePolygons.s_planePoint = new box2d.b2Vec2();
box2d.b2CollidePolygons.s_normal = new box2d.b2Vec2();
box2d.b2CollidePolygons.s_tangent = new box2d.b2Vec2();
box2d.b2CollidePolygons.s_ntangent = new box2d.b2Vec2();
box2d.b2CollidePolygons.s_v11 = new box2d.b2Vec2();
box2d.b2CollidePolygons.s_v12 = new box2d.b2Vec2();
