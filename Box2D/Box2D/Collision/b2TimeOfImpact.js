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

goog.provide('box2d.b2TimeOfImpact');

goog.require('box2d.b2Settings');
goog.require('box2d.b2ShapeDistance');
goog.require('box2d.b2Math');
goog.require('box2d.b2Timer');

/**
 * @export
 * @type {number}
 */
box2d.b2_toiTime = 0.0;
/**
 * @export
 * @type {number}
 */
box2d.b2_toiMaxTime = 0.0;
/**
 * @export
 * @type {number}
 */
box2d.b2_toiCalls = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2_toiIters = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2_toiMaxIters = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2_toiRootIters = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2_toiMaxRootIters = 0;

/**
 * Input parameters for b2TimeOfImpact
 * @export
 * @constructor
 */
box2d.b2TOIInput = function() {
  this.proxyA = new box2d.b2DistanceProxy();
  this.proxyB = new box2d.b2DistanceProxy();
  this.sweepA = new box2d.b2Sweep();
  this.sweepB = new box2d.b2Sweep();
};

/**
 * @export
 * @type {box2d.b2DistanceProxy}
 */
box2d.b2TOIInput.prototype.proxyA = null;
/**
 * @export
 * @type {box2d.b2DistanceProxy}
 */
box2d.b2TOIInput.prototype.proxyB = null;
/**
 * @export
 * @type {box2d.b2Sweep}
 */
box2d.b2TOIInput.prototype.sweepA = null;
/**
 * @export
 * @type {box2d.b2Sweep}
 */
box2d.b2TOIInput.prototype.sweepB = null;
/**
 * @export
 * @type {number}
 */
box2d.b2TOIInput.prototype.tMax = 0; // defines sweep interval [0, tMax]

/**
 * @export
 * @enum
 */
box2d.b2TOIOutputState = {
  e_unknown: 0,
  e_failed: 1,
  e_overlapped: 2,
  e_touching: 3,
  e_separated: 4
};
goog.exportProperty(box2d.b2TOIOutputState, 'e_unknown', box2d.b2TOIOutputState.e_unknown);
goog.exportProperty(box2d.b2TOIOutputState, 'e_failed', box2d.b2TOIOutputState.e_failed);
goog.exportProperty(box2d.b2TOIOutputState, 'e_overlapped', box2d.b2TOIOutputState.e_overlapped);
goog.exportProperty(box2d.b2TOIOutputState, 'e_touching', box2d.b2TOIOutputState.e_touching);
goog.exportProperty(box2d.b2TOIOutputState, 'e_separated', box2d.b2TOIOutputState.e_separated);

/**
 * Output parameters for b2TimeOfImpact.
 * @export
 * @constructor
 */
box2d.b2TOIOutput = function() {};

/**
 * @export
 * @type {box2d.b2TOIOutputState}
 */
box2d.b2TOIOutput.prototype.state = box2d.b2TOIOutputState.e_unknown;
/**
 * @export
 * @type {number}
 */
box2d.b2TOIOutput.prototype.t = 0;

/**
 * @export
 * @enum
 */
box2d.b2SeparationFunctionType = {
  e_unknown: -1,
  e_points: 0,
  e_faceA: 1,
  e_faceB: 2
};
goog.exportProperty(box2d.b2SeparationFunctionType, 'e_unknown', box2d.b2SeparationFunctionType.e_unknown);
goog.exportProperty(box2d.b2SeparationFunctionType, 'e_points', box2d.b2SeparationFunctionType.e_points);
goog.exportProperty(box2d.b2SeparationFunctionType, 'e_faceA', box2d.b2SeparationFunctionType.e_faceA);
goog.exportProperty(box2d.b2SeparationFunctionType, 'e_faceB', box2d.b2SeparationFunctionType.e_faceB);

/**
 * @export
 * @constructor
 */
box2d.b2SeparationFunction = function() {
  this.m_sweepA = new box2d.b2Sweep();
  this.m_sweepB = new box2d.b2Sweep();
  this.m_localPoint = new box2d.b2Vec2();
  this.m_axis = new box2d.b2Vec2();
};

/**
 * @export
 * @type {box2d.b2DistanceProxy}
 */
box2d.b2SeparationFunction.prototype.m_proxyA = null;
/**
 * @export
 * @type {box2d.b2DistanceProxy}
 */
box2d.b2SeparationFunction.prototype.m_proxyB = null;
/**
 * @export
 * @type {box2d.b2Sweep}
 */
box2d.b2SeparationFunction.prototype.m_sweepA = null;
/**
 * @export
 * @type {box2d.b2Sweep}
 */
box2d.b2SeparationFunction.prototype.m_sweepB = null;
/**
 * @export
 * @type {box2d.b2SeparationFunctionType}
 */
box2d.b2SeparationFunction.prototype.m_type = box2d.b2SeparationFunctionType.e_unknown;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2SeparationFunction.prototype.m_localPoint = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2SeparationFunction.prototype.m_axis = null;

/**
 * TODO_ERIN might not need to return the separation
 * @export
 * @return {number}
 * @param {box2d.b2SimplexCache} cache
 * @param {box2d.b2DistanceProxy} proxyA
 * @param {box2d.b2Sweep} sweepA
 * @param {box2d.b2DistanceProxy} proxyB
 * @param {box2d.b2Sweep} sweepB
 * @param {number} t1
 */
box2d.b2SeparationFunction.prototype.Initialize = function(cache, proxyA, sweepA, proxyB, sweepB, t1) {
  this.m_proxyA = proxyA;
  this.m_proxyB = proxyB;
  /** @type {number} */
  var count = cache.count;
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(0 < count && count < 3);
  }

  this.m_sweepA.Copy(sweepA);
  this.m_sweepB.Copy(sweepB);

  /** @type {box2d.b2Transform} */
  var xfA = box2d.b2TimeOfImpact.s_xfA;
  /** @type {box2d.b2Transform} */
  var xfB = box2d.b2TimeOfImpact.s_xfB;
  this.m_sweepA.GetTransform(xfA, t1);
  this.m_sweepB.GetTransform(xfB, t1);

  if (count === 1) {
    this.m_type = box2d.b2SeparationFunctionType.e_points;
    /** @type {box2d.b2Vec2} */
    var localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
    /** @type {box2d.b2Vec2} */
    var localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
    /** @type {box2d.b2Vec2} */
    var pointA = box2d.b2Mul_X_V2(xfA, localPointA, box2d.b2TimeOfImpact.s_pointA);
    /** @type {box2d.b2Vec2} */
    var pointB = box2d.b2Mul_X_V2(xfB, localPointB, box2d.b2TimeOfImpact.s_pointB);
    box2d.b2Sub_V2_V2(pointB, pointA, this.m_axis);
    /** @type {number} */
    var s = this.m_axis.Normalize();
    this.m_localPoint.SetZero();
    return s;
  } else if (cache.indexA[0] === cache.indexA[1]) {
    // Two points on B and one on A.
    this.m_type = box2d.b2SeparationFunctionType.e_faceB;
    /** @type {box2d.b2Vec2} */
    var localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
    /** @type {box2d.b2Vec2} */
    var localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);

    box2d.b2Cross_V2_S(box2d.b2Sub_V2_V2(localPointB2, localPointB1, box2d.b2Vec2.s_t0), 1.0, this.m_axis).SelfNormalize();
    /** @type {box2d.b2Vec2} */
    var normal = box2d.b2Mul_R_V2(xfB.q, this.m_axis, box2d.b2TimeOfImpact.s_normal);

    box2d.b2Mid_V2_V2(localPointB1, localPointB2, this.m_localPoint);
    /** type {box2d.b2Vec2} */
    var pointB = box2d.b2Mul_X_V2(xfB, this.m_localPoint, box2d.b2TimeOfImpact.s_pointB);

    /** type {box2d.b2Vec2} */
    var localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
    /** type {box2d.b2Vec2} */
    var pointA = box2d.b2Mul_X_V2(xfA, localPointA, box2d.b2TimeOfImpact.s_pointA);

    /** type {number} */
    var s = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(pointA, pointB, box2d.b2Vec2.s_t0), normal);
    if (s < 0) {
      this.m_axis.SelfNeg();
      s = -s;
    }
    return s;
  } else {
    // Two points on A and one or two points on B.
    this.m_type = box2d.b2SeparationFunctionType.e_faceA;
    /** @type {box2d.b2Vec2} */
    var localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
    /** @type {box2d.b2Vec2} */
    var localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);

    box2d.b2Cross_V2_S(box2d.b2Sub_V2_V2(localPointA2, localPointA1, box2d.b2Vec2.s_t0), 1.0, this.m_axis).SelfNormalize();
    /** type {box2d.b2Vec2} */
    var normal = box2d.b2Mul_R_V2(xfA.q, this.m_axis, box2d.b2TimeOfImpact.s_normal);

    box2d.b2Mid_V2_V2(localPointA1, localPointA2, this.m_localPoint);
    /** type {box2d.b2Vec2} */
    var pointA = box2d.b2Mul_X_V2(xfA, this.m_localPoint, box2d.b2TimeOfImpact.s_pointA);

    /** type {box2d.b2Vec2} */
    var localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
    /** type {box2d.b2Vec2} */
    var pointB = box2d.b2Mul_X_V2(xfB, localPointB, box2d.b2TimeOfImpact.s_pointB);

    /** type {number} */
    var s = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(pointB, pointA, box2d.b2Vec2.s_t0), normal);
    if (s < 0) {
      this.m_axis.SelfNeg();
      s = -s;
    }
    return s;
  }
}

/**
 * @export
 * @return {number}
 * @param {Array.<number>} indexA
 * @param {Array.<number>} indexB
 * @param {number} t
 */
box2d.b2SeparationFunction.prototype.FindMinSeparation = function(indexA, indexB, t) {
  /** @type {box2d.b2Transform} */
  var xfA = box2d.b2TimeOfImpact.s_xfA;
  /** @type {box2d.b2Transform} */
  var xfB = box2d.b2TimeOfImpact.s_xfB;
  this.m_sweepA.GetTransform(xfA, t);
  this.m_sweepB.GetTransform(xfB, t);

  switch (this.m_type) {
    case box2d.b2SeparationFunctionType.e_points:
      {
        /** @type {box2d.b2Vec2} */
        var axisA = box2d.b2MulT_R_V2(xfA.q, this.m_axis, box2d.b2TimeOfImpact.s_axisA);
        /** @type {box2d.b2Vec2} */
        var axisB = box2d.b2MulT_R_V2(xfB.q, box2d.b2Vec2.s_t0.Copy(this.m_axis).SelfNeg(), box2d.b2TimeOfImpact.s_axisB);

        indexA[0] = this.m_proxyA.GetSupport(axisA);
        indexB[0] = this.m_proxyB.GetSupport(axisB);

        /** @type {box2d.b2Vec2} */
        var localPointA = this.m_proxyA.GetVertex(indexA[0]);
        /** @type {box2d.b2Vec2} */
        var localPointB = this.m_proxyB.GetVertex(indexB[0]);

        /** @type {box2d.b2Vec2} */
        var pointA = box2d.b2Mul_X_V2(xfA, localPointA, box2d.b2TimeOfImpact.s_pointA);
        /** @type {box2d.b2Vec2} */
        var pointB = box2d.b2Mul_X_V2(xfB, localPointB, box2d.b2TimeOfImpact.s_pointB);

        /** @type {number} */
        var separation = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(pointB, pointA, box2d.b2Vec2.s_t0), this.m_axis)
        return separation;
      }

    case box2d.b2SeparationFunctionType.e_faceA:
      {
        /** @type {box2d.b2Vec2} */
        var normal = box2d.b2Mul_R_V2(xfA.q, this.m_axis, box2d.b2TimeOfImpact.s_normal);
        /** type {box2d.b2Vec2} */
        var pointA = box2d.b2Mul_X_V2(xfA, this.m_localPoint, box2d.b2TimeOfImpact.s_pointA);

        /** type {box2d.b2Vec2} */
        var axisB = box2d.b2MulT_R_V2(xfB.q, box2d.b2Vec2.s_t0.Copy(normal).SelfNeg(), box2d.b2TimeOfImpact.s_axisB);

        indexA[0] = -1;
        indexB[0] = this.m_proxyB.GetSupport(axisB);

        /** type {box2d.b2Vec2} */
        var localPointB = this.m_proxyB.GetVertex(indexB[0]);
        /** type {box2d.b2Vec2} */
        var pointB = box2d.b2Mul_X_V2(xfB, localPointB, box2d.b2TimeOfImpact.s_pointB);

        /** type {number} */
        var separation = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(pointB, pointA, box2d.b2Vec2.s_t0), normal)
        return separation;
      }

    case box2d.b2SeparationFunctionType.e_faceB:
      {
        /** type {box2d.b2Vec2} */
        var normal = box2d.b2Mul_R_V2(xfB.q, this.m_axis, box2d.b2TimeOfImpact.s_normal);
        /** type {box2d.b2Vec2} */
        var pointB = box2d.b2Mul_X_V2(xfB, this.m_localPoint, box2d.b2TimeOfImpact.s_pointB);

        /** type {box2d.b2Vec2} */
        var axisA = box2d.b2MulT_R_V2(xfA.q, box2d.b2Vec2.s_t0.Copy(normal).SelfNeg(), box2d.b2TimeOfImpact.s_axisA);

        indexB[0] = -1;
        indexA[0] = this.m_proxyA.GetSupport(axisA);

        /** type {box2d.b2Vec2} */
        var localPointA = this.m_proxyA.GetVertex(indexA[0]);
        /** type {box2d.b2Vec2} */
        var pointA = box2d.b2Mul_X_V2(xfA, localPointA, box2d.b2TimeOfImpact.s_pointA);

        /** type {number} */
        var separation = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(pointA, pointB, box2d.b2Vec2.s_t0), normal)
        return separation;
      }

    default:
      if (box2d.ENABLE_ASSERTS) {
        box2d.b2Assert(false);
      }
      indexA[0] = -1;
      indexB[0] = -1;
      return 0;
  }
}

/**
 * @export
 * @return {number}
 * @param {number} indexA
 * @param {number} indexB
 * @param {number} t
 */
box2d.b2SeparationFunction.prototype.Evaluate = function(indexA, indexB, t) {
  /** @type {box2d.b2Transform} */
  var xfA = box2d.b2TimeOfImpact.s_xfA;
  /** @type {box2d.b2Transform} */
  var xfB = box2d.b2TimeOfImpact.s_xfB;
  this.m_sweepA.GetTransform(xfA, t);
  this.m_sweepB.GetTransform(xfB, t);

  switch (this.m_type) {
    case box2d.b2SeparationFunctionType.e_points:
      {
        /** @type {box2d.b2Vec2} */
        var localPointA = this.m_proxyA.GetVertex(indexA);
        /** @type {box2d.b2Vec2} */
        var localPointB = this.m_proxyB.GetVertex(indexB);

        /** @type {box2d.b2Vec2} */
        var pointA = box2d.b2Mul_X_V2(xfA, localPointA, box2d.b2TimeOfImpact.s_pointA);
        /** @type {box2d.b2Vec2} */
        var pointB = box2d.b2Mul_X_V2(xfB, localPointB, box2d.b2TimeOfImpact.s_pointB);
        /** @type {number} */
        var separation = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(pointB, pointA, box2d.b2Vec2.s_t0), this.m_axis)

        return separation;
      }

    case box2d.b2SeparationFunctionType.e_faceA:
      {
        /** @type {box2d.b2Vec2} */
        var normal = box2d.b2Mul_R_V2(xfA.q, this.m_axis, box2d.b2TimeOfImpact.s_normal);
        /** type {box2d.b2Vec2} */
        var pointA = box2d.b2Mul_X_V2(xfA, this.m_localPoint, box2d.b2TimeOfImpact.s_pointA);

        /** type {box2d.b2Vec2} */
        var localPointB = this.m_proxyB.GetVertex(indexB);
        /** type {box2d.b2Vec2} */
        var pointB = box2d.b2Mul_X_V2(xfB, localPointB, box2d.b2TimeOfImpact.s_pointB);

        /** type {number} */
        var separation = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(pointB, pointA, box2d.b2Vec2.s_t0), normal)
        return separation;
      }

    case box2d.b2SeparationFunctionType.e_faceB:
      {
        /** type {box2d.b2Vec2} */
        var normal = box2d.b2Mul_R_V2(xfB.q, this.m_axis, box2d.b2TimeOfImpact.s_normal);
        /** type {box2d.b2Vec2} */
        var pointB = box2d.b2Mul_X_V2(xfB, this.m_localPoint, box2d.b2TimeOfImpact.s_pointB);

        /** type {box2d.b2Vec2} */
        var localPointA = this.m_proxyA.GetVertex(indexA);
        /** type {box2d.b2Vec2} */
        var pointA = box2d.b2Mul_X_V2(xfA, localPointA, box2d.b2TimeOfImpact.s_pointA);

        /** type {number} */
        var separation = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(pointA, pointB, box2d.b2Vec2.s_t0), normal)
        return separation;
      }

    default:
      if (box2d.ENABLE_ASSERTS) {
        box2d.b2Assert(false);
      }
      return 0;
  }
}

/**
 * Compute the upper bound on time before two shapes penetrate.
 * Time is represented as a fraction between [0,tMax]. This uses
 * a swept separating axis and may miss some intermediate,
 * non-tunneling collision. If you change the time interval, you
 * should call this function again.
 * Note: use box2d.b2ShapeDistance to compute the contact point and
 * normal at the time of impact.
 * @export
 * @return {void}
 * @param {box2d.b2TOIOutput} output
 * @param {box2d.b2TOIInput} input
 */
box2d.b2TimeOfImpact = function(output, input) {
  var timer = box2d.b2TimeOfImpact.s_timer.Reset();

  ++box2d.b2_toiCalls;

  output.state = box2d.b2TOIOutputState.e_unknown;
  output.t = input.tMax;

  /** @type {box2d.b2DistanceProxy} */
  var proxyA = input.proxyA;
  /** @type {box2d.b2DistanceProxy} */
  var proxyB = input.proxyB;

  /** @type {box2d.b2Sweep} */
  var sweepA = box2d.b2TimeOfImpact.s_sweepA.Copy(input.sweepA);
  /** @type {box2d.b2Sweep} */
  var sweepB = box2d.b2TimeOfImpact.s_sweepB.Copy(input.sweepB);

  // Large rotations can make the root finder fail, so we normalize the
  // sweep angles.
  sweepA.Normalize();
  sweepB.Normalize();

  /** @type {number} */
  var tMax = input.tMax;

  /** @type {number} */
  var totalRadius = proxyA.m_radius + proxyB.m_radius;
  /** @type {number} */
  var target = box2d.b2Max(box2d.b2_linearSlop, totalRadius - 3 * box2d.b2_linearSlop);
  /** @type {number} */
  var tolerance = 0.25 * box2d.b2_linearSlop;
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(target > tolerance);
  }

  /** @type {number} */
  var t1 = 0;
  /** @type {number} */
  var k_maxIterations = 20; // TODO_ERIN b2Settings
  /** @type {number} */
  var iter = 0;

  // Prepare input for distance query.
  /** @type {box2d.b2SimplexCache} */
  var cache = box2d.b2TimeOfImpact.s_cache;
  cache.count = 0;
  /** @type {box2d.b2DistanceInput} */
  var distanceInput = box2d.b2TimeOfImpact.s_distanceInput;
  distanceInput.proxyA = input.proxyA;
  distanceInput.proxyB = input.proxyB;
  distanceInput.useRadii = false;

  // The outer loop progressively attempts to compute new separating axes.
  // This loop terminates when an axis is repeated (no progress is made).
  for (;;) {
    /** @type {box2d.b2Transform} */
    var xfA = box2d.b2TimeOfImpact.s_xfA;
    /** @type {box2d.b2Transform} */
    var xfB = box2d.b2TimeOfImpact.s_xfB;
    sweepA.GetTransform(xfA, t1);
    sweepB.GetTransform(xfB, t1);

    // Get the distance between shapes. We can also use the results
    // to get a separating axis.
    distanceInput.transformA.Copy(xfA);
    distanceInput.transformB.Copy(xfB);
    /** @type {box2d.b2DistanceOutput} */
    var distanceOutput = box2d.b2TimeOfImpact.s_distanceOutput;
    box2d.b2ShapeDistance(distanceOutput, cache, distanceInput);

    // If the shapes are overlapped, we give up on continuous collision.
    if (distanceOutput.distance <= 0) {
      // Failure!
      output.state = box2d.b2TOIOutputState.e_overlapped;
      output.t = 0;
      break;
    }

    if (distanceOutput.distance < target + tolerance) {
      // Victory!
      output.state = box2d.b2TOIOutputState.e_touching;
      output.t = t1;
      break;
    }

    // Initialize the separating axis.
    /** @type {box2d.b2SeparationFunction} */
    var fcn = box2d.b2TimeOfImpact.s_fcn;
    fcn.Initialize(cache, proxyA, sweepA, proxyB, sweepB, t1);
    /*
    #if 0
    		// Dump the curve seen by the root finder
    		{
    			const int32 N = 100;
    			float32 dx = 1.0f / N;
    			float32 xs[N+1];
    			float32 fs[N+1];

    			float32 x = 0.0f;

    			for (int32 i = 0; i <= N; ++i)
    			{
    				sweepA.GetTransform(&xfA, x);
    				sweepB.GetTransform(&xfB, x);
    				float32 f = fcn.Evaluate(xfA, xfB) - target;

    				printf("%g %g\n", x, f);

    				xs[i] = x;
    				fs[i] = f;

    				x += dx;
    			}
    		}
    #endif
    */

    // Compute the TOI on the separating axis. We do this by successively
    // resolving the deepest point. This loop is bounded by the number of vertices.
    /** @type {boolean} */
    var done = false;
    /** @type {number} */
    var t2 = tMax;
    /** @type {number} */
    var pushBackIter = 0;
    for (;;) {
      // Find the deepest point at t2. Store the witness point indices.
      /** @type Array.<number>} */
      var indexA = box2d.b2TimeOfImpact.s_indexA;
      /** @type Array.<number>} */
      var indexB = box2d.b2TimeOfImpact.s_indexB;
      /** @type {number} */
      var s2 = fcn.FindMinSeparation(indexA, indexB, t2);

      // Is the final configuration separated?
      if (s2 > (target + tolerance)) {
        // Victory!
        output.state = box2d.b2TOIOutputState.e_separated;
        output.t = tMax;
        done = true;
        break;
      }

      // Has the separation reached tolerance?
      if (s2 > (target - tolerance)) {
        // Advance the sweeps
        t1 = t2;
        break;
      }

      // Compute the initial separation of the witness points.
      /** @type {number} */
      var s1 = fcn.Evaluate(indexA[0], indexB[0], t1);

      // Check for initial overlap. This might happen if the root finder
      // runs out of iterations.
      if (s1 < (target - tolerance)) {
        output.state = box2d.b2TOIOutputState.e_failed;
        output.t = t1;
        done = true;
        break;
      }

      // Check for touching
      if (s1 <= (target + tolerance)) {
        // Victory! t1 should hold the TOI (could be 0.0).
        output.state = box2d.b2TOIOutputState.e_touching;
        output.t = t1;
        done = true;
        break;
      }

      // Compute 1D root of: f(x) - target = 0
      /** @type {number} */
      var rootIterCount = 0;
      /** @type {number} */
      var a1 = t1;
      /** @type {number} */
      var a2 = t2;
      for (;;) {
        // Use a mix of the secant rule and bisection.
        /** @type {number} */
        var t = 0;
        if (rootIterCount & 1) {
          // Secant rule to improve convergence.
          t = a1 + (target - s1) * (a2 - a1) / (s2 - s1);
        } else {
          // Bisection to guarantee progress.
          t = 0.5 * (a1 + a2);
        }

        ++rootIterCount;
        ++box2d.b2_toiRootIters;

        /** @type {number} */
        var s = fcn.Evaluate(indexA[0], indexB[0], t);

        if (box2d.b2Abs(s - target) < tolerance) {
          // t2 holds a tentative value for t1
          t2 = t;
          break;
        }

        // Ensure we continue to bracket the root.
        if (s > target) {
          a1 = t;
          s1 = s;
        } else {
          a2 = t;
          s2 = s;
        }

        if (rootIterCount === 50) {
          break;
        }
      }

      box2d.b2_toiMaxRootIters = box2d.b2Max(box2d.b2_toiMaxRootIters, rootIterCount);

      ++pushBackIter;

      if (pushBackIter === box2d.b2_maxPolygonVertices) {
        break;
      }
    }

    ++iter;
    ++box2d.b2_toiIters;

    if (done) {
      break;
    }

    if (iter === k_maxIterations) {
      // Root finder got stuck. Semi-victory.
      output.state = box2d.b2TOIOutputState.e_failed;
      output.t = t1;
      break;
    }
  }

  box2d.b2_toiMaxIters = box2d.b2Max(box2d.b2_toiMaxIters, iter);

  var time = timer.GetMilliseconds();
  box2d.b2_toiMaxTime = box2d.b2Max(box2d.b2_toiMaxTime, time);
  box2d.b2_toiTime += time;
}
box2d.b2TimeOfImpact.s_timer = new box2d.b2Timer();
box2d.b2TimeOfImpact.s_cache = new box2d.b2SimplexCache();
box2d.b2TimeOfImpact.s_distanceInput = new box2d.b2DistanceInput();
box2d.b2TimeOfImpact.s_distanceOutput = new box2d.b2DistanceOutput();
box2d.b2TimeOfImpact.s_xfA = new box2d.b2Transform();
box2d.b2TimeOfImpact.s_xfB = new box2d.b2Transform();
box2d.b2TimeOfImpact.s_indexA = box2d.b2MakeNumberArray(1);
box2d.b2TimeOfImpact.s_indexB = box2d.b2MakeNumberArray(1);
box2d.b2TimeOfImpact.s_fcn = new box2d.b2SeparationFunction();
box2d.b2TimeOfImpact.s_sweepA = new box2d.b2Sweep();
box2d.b2TimeOfImpact.s_sweepB = new box2d.b2Sweep();
box2d.b2TimeOfImpact.s_pointA = new box2d.b2Vec2();
box2d.b2TimeOfImpact.s_pointB = new box2d.b2Vec2();
box2d.b2TimeOfImpact.s_normal = new box2d.b2Vec2();
box2d.b2TimeOfImpact.s_axisA = new box2d.b2Vec2();
box2d.b2TimeOfImpact.s_axisB = new box2d.b2Vec2();
