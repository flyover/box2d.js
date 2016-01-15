/*
 * Copyright (c) 2013 Google, Inc.
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

//#if B2_ENABLE_PARTICLE

goog.provide('box2d.b2ParticleSystem');

goog.require('box2d.b2Particle');
goog.require('box2d.b2ParticleGroup');
goog.require('box2d.b2TimeStep');

/**
 * @return {void}
 * @param {Array.<?>} array
 * @param {number} a
 * @param {number} b
 */
box2d.std_iter_swap = function(array, a, b) {
  var tmp = array[a];
  array[a] = array[b];
  array[b] = tmp;
}

/**
 * @return {Array.<?>}
 * @param {Array.<?>} array
 * @param {number=} first
 * @param {number=} len
 * @param {function(?,?):boolean=} cmp
 */
box2d.std_sort = function(array, first, len, cmp) {
  if (typeof(first) !== 'number') first = 0;
  if (typeof(len) !== 'number') len = array.length - first;
  if (typeof(cmp) !== 'function') cmp = function(a, b) {
    return a < b;
  };

  var left = first,
    stack = [],
    pos = 0;

  for (;;) { /* outer loop */
    for (; left + 1 < len; len++) { /* sort left to len-1 */
      var pivot = array[left + Math.floor(Math.random() * (len - left))]; /* pick random pivot */
      stack[pos++] = len; /* sort right part later */
      for (var right = left - 1;;) { /* inner loop: partitioning */
        while (cmp(array[++right], pivot)) {} /* look for greater element */
        while (cmp(pivot, array[--len])) {} /* look for smaller element */
        if (right >= len)
          break; /* partition point found? */
        box2d.std_iter_swap(array, right, len); /* the only swap */
      } /* partitioned, continue left part */
    }
    if (pos === 0)
      break; /* stack empty? */
    left = len; /* left to right is sorted */
    len = stack[--pos]; /* get next range to sort */
  }

  return array;
};

/**
 * @return {Array.<?>}
 * @param {Array.<?>} array
 * @param {number=} first
 * @param {number=} len
 * @param {function(?,?):boolean=} cmp
 */
box2d.std_stable_sort = function(array, first, len, cmp) {
  return box2d.std_sort(array, first, len, cmp);
};

/**
 * @return {number}
 * @param {Array.<?>} array
 * @param {function(?):boolean} predicate
 * @param {number=} length
 */
box2d.std_remove_if = function(array, predicate, length) {
  if (typeof(length) !== 'number') length = array.length;

  var l = 0;

  for (var c = 0; c < length; ++c) {
    // if we can be collapsed, keep l where it is.
    if (predicate(array[c]))
      continue;

    // this node can't be collapsed; push it back as far as we can.
    if (c === l) {
      ++l;
      continue; // quick exit if we're already in the right spot
    }

    // array[l++] = array[c];
    box2d.std_iter_swap(array, l++, c);
  }

  return l;
};

/**
 * @return {number}
 * @param {Array.<?>} array
 * @param {number} first
 * @param {number} last
 * @param {?} val
 * @param {function(?,?):boolean=} cmp
 */
box2d.std_lower_bound = function(array, first, last, val, cmp) {
  if (typeof(cmp) !== 'function') cmp = function(a, b) {
    return a < b;
  };

  var count = last - first;
  while (count > 0) {
    var step = Math.floor(count / 2);
    var it = first + step;

    if (cmp(array[it], val)) {
      first = ++it;
      count -= step + 1;
    } else
      count = step;
  }
  return first;
};

/**
 * @return {number}
 * @param {Array.<?>} array
 * @param {number} first
 * @param {number} last
 * @param {?} val
 * @param {function(?,?):boolean=} cmp
 */
box2d.std_upper_bound = function(array, first, last, val, cmp) {
  if (typeof(cmp) !== 'function') cmp = function(a, b) {
    return a < b;
  };

  var count = last - first;
  while (count > 0) {
    var step = Math.floor(count / 2);
    var it = first + step;

    if (!cmp(val, array[it])) {
      first = ++it;
      count -= step + 1;
    } else
      count = step;
  }
  return first;
};

/**
 * @return {void}
 * @param {Array.<?>} array
 * @param {number} first
 * @param {number} n_first
 * @param {number} last
 */
box2d.std_rotate = function(array, first, n_first, last) {
  var next = n_first;
  while (first !== next) {
    box2d.std_iter_swap(array, first++, next++);
    if (next === last)
      next = n_first;
    else if (first === n_first)
      n_first = next;
  }
}

/**
 * @return {number}
 * @param {Array.<?>} array
 * @param {number} first
 * @param {number} last
 * @param {function(?,?):boolean} cmp
 */
box2d.std_unique = function(array, first, last, cmp) {
  if (first === last) {
    return last;
  }
  var result = first;
  while (++first !== last) {
    if (!cmp(array[result], array[first])) {
      //array[++result] = array[first];
      box2d.std_iter_swap(array, ++result, first);
    }
  }
  return ++result;
}

/**
 * @constructor
 * @template T
 * @param {function():T} allocator
 */
box2d.b2GrowableBuffer = function(allocator) {
  this.data = [];
  this.count = 0;
  this.capacity = 0;
  this.allocator = allocator;
}

/**
 * @type {Array.<T>}
 */
box2d.b2GrowableBuffer.prototype.data = null;

/**
 * @type {number}
 */
box2d.b2GrowableBuffer.prototype.count = 0;

/**
 * @type {number}
 */
box2d.b2GrowableBuffer.prototype.capacity = 0;

/**
 * @type {function():?}
 */
box2d.b2GrowableBuffer.prototype.allocator = function() {
  return null;
};

/**
 * @return {number}
 */
box2d.b2GrowableBuffer.prototype.Append = function() {
  if (this.count >= this.capacity) {
    this.Grow();
  }
  return this.count++;
}

/**
 * @return {void}
 * @param {number} newCapacity
 */
box2d.b2GrowableBuffer.prototype.Reserve = function(newCapacity) {
  if (this.capacity >= newCapacity)
    return;

  box2d.b2Assert(this.capacity === this.data.length);
  for (var i = this.capacity; i < newCapacity; ++i) {
    this.data[i] = this.allocator();
  }
  this.capacity = newCapacity;
}

/**
 * @return {void}
 */
box2d.b2GrowableBuffer.prototype.Grow = function() {
  // Double the capacity.
  var newCapacity = this.capacity ? 2 * this.capacity : box2d.b2_minParticleSystemBufferCapacity;
  box2d.b2Assert(newCapacity > this.capacity);
  this.Reserve(newCapacity);
}

/**
 * @return {void}
 */
box2d.b2GrowableBuffer.prototype.Free = function() {
  if (this.data.length === 0) {
    return;
  }

  this.data = [];
  this.capacity = 0;
  this.count = 0;
}

/**
 * @return {void}
 * @param {number} newEnd
 */
box2d.b2GrowableBuffer.prototype.Shorten = function(newEnd) {
  box2d.b2Assert(false);
}

/**
 * @return {Array.<T>}
 */
box2d.b2GrowableBuffer.prototype.Data = function() {
  return this.data;
}

/**
 * @return {number}
 */
box2d.b2GrowableBuffer.prototype.GetCount = function() {
  return this.count;
}

/**
 * @return {void}
 * @param {number} newCount
 */
box2d.b2GrowableBuffer.prototype.SetCount = function(newCount) {
  box2d.b2Assert(0 <= newCount && newCount <= this.capacity);
  this.count = newCount;
}

/**
 * @return {number}
 */
box2d.b2GrowableBuffer.prototype.GetCapacity = function() {
  return this.capacity;
}

/**
 * @return {void}
 * @param {function(T):boolean} pred
 */
box2d.b2GrowableBuffer.prototype.RemoveIf = function(pred) {
  var count = 0;
  for (var i = 0; i < this.count; ++i) {
    if (!pred(this.data[i])) {
      count++;
    }
  }

  this.count = box2d.std_remove_if(this.data, pred, this.count);

  box2d.b2Assert(count === this.count);
}

/**
 * @return {void}
 * @param {function(T,T):boolean} pred
 */
box2d.b2GrowableBuffer.prototype.Unique = function(pred) {
  this.count = box2d.std_unique(this.data, 0, this.count, pred);
}

/**
 * @constructor
 * @extends {box2d.b2QueryCallback}
 * @param {box2d.b2ParticleSystem} system
 */
box2d.b2FixtureParticleQueryCallback = function(system) {
  this.m_system = system;
}

goog.inherits(box2d.b2FixtureParticleQueryCallback, box2d.b2QueryCallback);

/**
 * @type {box2d.b2ParticleSystem}
 */
box2d.b2FixtureParticleQueryCallback.prototype.m_system = null;

box2d.b2FixtureParticleQueryCallback.prototype.ShouldQueryParticleSystem = function(system) {
  // Skip reporting particles.
  return false;
}

/**
 * @export
 * @return {boolean}
 * @param {box2d.b2Fixture} fixture
 */
box2d.b2FixtureParticleQueryCallback.prototype.ReportFixture = function(fixture) {
  if (fixture.IsSensor()) {
    return true;
  }
  var shape = fixture.GetShape();
  var childCount = shape.GetChildCount();
  for (var childIndex = 0; childIndex < childCount; childIndex++) {
    var aabb = fixture.GetAABB(childIndex);
    var enumerator = this.m_system.GetInsideBoundsEnumerator(aabb);
    var index;
    while ((index = enumerator.GetNext()) >= 0) {
      this.ReportFixtureAndParticle(fixture, childIndex, index);
    }
  }
  return true;
}

/**
 * @export
 * @return {boolean}
 * @param {box2d.b2ParticleSystem} system
 * @param {number} index
 */
box2d.b2FixtureParticleQueryCallback.prototype.ReportParticle = function(system, index) {
  return false;
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2Fixture} fixture
 * @param {number} childIndex
 * @param {number} index
 */
box2d.b2FixtureParticleQueryCallback.prototype.ReportFixtureAndParticle = function(fixture, childIndex, index) {
  box2d.b2Assert(false); // pure virtual
}

/**
 * @export
 * @constructor
 */
box2d.b2ParticleContact = function() {
  this.normal = new box2d.b2Vec2();
}

/**
 * @typedef {number}
 */
box2d.b2ParticleIndex;

/**
 * Indices of the respective particles making contact.
 *
 * @export
 * @type {box2d.b2ParticleIndex}
 */
box2d.b2ParticleContact.prototype.indexA = 0;

/**
 * Indices of the respective particles making contact.
 *
 * @export
 * @type {box2d.b2ParticleIndex}
 */
box2d.b2ParticleContact.prototype.indexB = 0;

/**
 * Weight of the contact. A value between 0.0f and 1.0f.
 * 0.0f ==> particles are just barely touching
 * 1.0f ==> particles are perfectly on top of each other
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleContact.prototype.weight = 0.0;

/**
 * The normalized direction from A to B.
 *
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2ParticleContact.prototype.normal = null;

/**
 * The logical sum of the particle behaviors that have been set.
 * See the b2ParticleFlag enum.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleContact.prototype.flags = 0;

/**
 * @export
 * @return {void}
 * @param {number} a
 * @param {number} b
 */
box2d.b2ParticleContact.prototype.SetIndices = function(a, b) {
  box2d.b2Assert(a <= box2d.b2_maxParticleIndex && b <= box2d.b2_maxParticleIndex);
  this.indexA = a;
  this.indexB = b;
}

/**
 * @export
 * @return {void}
 * @param {number} w
 */
box2d.b2ParticleContact.prototype.SetWeight = function(w) {
  this.weight = w;
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2Vec2} n
 */
box2d.b2ParticleContact.prototype.SetNormal = function(n) {
  this.normal.Copy(n);
}

/**
 * @export
 * @return {void}
 * @param {number} f
 */
box2d.b2ParticleContact.prototype.SetFlags = function(f) {
  this.flags = f;
}

/**
 * @export
 * @return {number}
 */
box2d.b2ParticleContact.prototype.GetIndexA = function() {
  return this.indexA;
}

/**
 * @export
 * @return {number}
 */
box2d.b2ParticleContact.prototype.GetIndexB = function() {
  return this.indexB;
}

/**
 * @export
 * @return {number}
 */
box2d.b2ParticleContact.prototype.GetWeight = function() {
  return this.weight;
}

/**
 * @export
 * @return {box2d.b2Vec2}
 */
box2d.b2ParticleContact.prototype.GetNormal = function() {
  return this.normal;
}

/**
 * @export
 * @return {number}
 */
box2d.b2ParticleContact.prototype.GetFlags = function() {
  return this.flags;
}

/**
 * @export
 * @return {boolean}
 * @param {box2d.b2ParticleContact} rhs
 */
box2d.b2ParticleContact.prototype.IsEqual = function(rhs) {
  return this.indexA === rhs.indexA && this.indexB === rhs.indexB && this.flags === rhs.flags && this.weight === rhs.weight && this.normal.x === rhs.normal.x && this.normal.y === rhs.normal.y;
}

/**
 * @export
 * @return {boolean}
 * @param {box2d.b2ParticleContact} rhs
 */
box2d.b2ParticleContact.prototype.IsNotEqual = function(rhs) {
  return !this.IsEqual(rhs);
}

/**
 * @export
 * @return {boolean}
 * @param {box2d.b2ParticleContact} rhs
 */
box2d.b2ParticleContact.prototype.ApproximatelyEqual = function(rhs) {
  var MAX_WEIGHT_DIFF = 0.01; // Weight 0 ~ 1, so about 1%
  var MAX_NORMAL_DIFF_SQ = 0.01 * 0.01; // Normal length = 1, so 1%
  return this.indexA === rhs.indexA && this.indexB === rhs.indexB && this.flags === rhs.flags && box2d.b2Abs(this.weight - rhs.weight) < MAX_WEIGHT_DIFF && box2d.b2DistanceSquared(this.normal, rhs.normal) < MAX_NORMAL_DIFF_SQ;
}

/**
 * @export
 * @constructor
 */
box2d.b2ParticleBodyContact = function() {
  this.normal = new box2d.b2Vec2();
}

/**
 * Index of the particle making contact.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleBodyContact.prototype.index = 0;

/**
 * The body making contact.
 *
 * @export
 * @type {box2d.b2Body}
 */
box2d.b2ParticleBodyContact.prototype.body = null;

/**
 * The specific fixture making contact
 *
 * @export
 * @type {box2d.b2Fixture}
 */
box2d.b2ParticleBodyContact.prototype.fixture = null;

/**
 * Weight of the contact. A value between 0.0f and 1.0f.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleBodyContact.prototype.weight = 0.0;

/**
 * The normalized direction from the particle to the body.
 *
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2ParticleBodyContact.prototype.normal = null;

/**
 * The effective mass used in calculating force.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleBodyContact.prototype.mass = 0.0;

/**
 * Connection between two particles
 *
 * @export
 * @constructor
 */
box2d.b2ParticlePair = function() {}

/**
 * Indices of the respective particles making pair.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticlePair.prototype.indexA = 0;

/**
 * @export
 * @type {number}
 */
box2d.b2ParticlePair.prototype.indexB = 0;

/**
 * The logical sum of the particle flags. See the b2ParticleFlag
 * enum.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticlePair.prototype.flags = 0;

/**
 * The strength of cohesion among the particles.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticlePair.prototype.strength = 0.0;

/**
 * The initial distance of the particles.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticlePair.prototype.distance = 0.0;

/**
 * Connection between three particles
 *
 * @export
 * @constructor
 */
box2d.b2ParticleTriad = function() {
  this.pa = new box2d.b2Vec2(0.0, 0.0);
  this.pb = new box2d.b2Vec2(0.0, 0.0);
  this.pc = new box2d.b2Vec2(0.0, 0.0);
}

/**
 * Indices of the respective particles making triad.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleTriad.prototype.indexA = 0;

/**
 * @export
 * @type {number}
 */
box2d.b2ParticleTriad.prototype.indexB = 0;

/**
 * @export
 * @type {number}
 */
box2d.b2ParticleTriad.prototype.indexC = 0;

/**
 * The logical sum of the particle flags. See the b2ParticleFlag
 * enum.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleTriad.prototype.flags = 0;

/**
 * The strength of cohesion among the particles.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleTriad.prototype.strength = 0.0;

/**
 * Values used for calculation.
 *
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2ParticleTriad.prototype.pa = null;

/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2ParticleTriad.prototype.pb = null;

/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2ParticleTriad.prototype.pc = null;

/**
 * @export
 * @type {number}
 */
box2d.b2ParticleTriad.prototype.ka = 0.0;

/**
 * @export
 * @type {number}
 */
box2d.b2ParticleTriad.prototype.kb = 0.0;

/**
 * @export
 * @type {number}
 */
box2d.b2ParticleTriad.prototype.kc = 0.0;

/**
 * @export
 * @type {number}
 */
box2d.b2ParticleTriad.prototype.s = 0.0;

/**
 * @export
 * @constructor
 */
box2d.b2ParticleSystemDef = function() {
  ///  this.strictContactCheck = false;
  ///  this.density = 1.0;
  ///  this.gravityScale = 1.0;
  ///  this.radius = 1.0;
  ///  this.maxCount = 0;

  // Initialize physical coefficients to the maximum values that
  // maintain numerical stability.
  ///  this.pressureStrength = 0.05;
  ///  this.dampingStrength = 1.0;
  ///  this.elasticStrength = 0.25;
  ///  this.springStrength = 0.25;
  ///  this.viscousStrength = 0.25;
  ///  this.surfaceTensionPressureStrength = 0.2;
  ///  this.surfaceTensionNormalStrength = 0.2;
  ///  this.repulsiveStrength = 1.0;
  ///  this.powderStrength = 0.5;
  ///  this.ejectionStrength = 0.5;
  ///  this.staticPressureStrength = 0.2;
  ///  this.staticPressureRelaxation = 0.2;
  ///  this.staticPressureIterations = 8;
  ///  this.colorMixingStrength = 0.5;
  ///  this.destroyByAge = true;
  ///  this.lifetimeGranularity = 1.0 / 60.0;
}

/**
 * Enable strict Particle/Body contact check.
 * See SetStrictContactCheck for details.
 *
 * @export
 * @type {boolean}
 */
box2d.b2ParticleSystemDef.prototype.strictContactCheck = false;

/**
 * Set the particle density.
 * See SetDensity for details.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.density = 1.0;

/**
 * Change the particle gravity scale. Adjusts the effect of the
 * global gravity vector on particles. Default value is 1.0f.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.gravityScale = 1.0;

/**
 * Particles behave as circles with this radius. In Box2D units.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.radius = 1.0;

/**
 * Set the maximum number of particles.
 * By default, there is no maximum. The particle buffers can
 * continue to grow while b2World's block allocator still has
 * memory.
 * See SetMaxParticleCount for details.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.maxCount = 0;

/**
 * Increases pressure in response to compression
 * Smaller values allow more compression
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.pressureStrength = 0.005;

/**
 * Reduces velocity along the collision normal
 * Smaller value reduces less
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.dampingStrength = 1.0;

/**
 * Restores shape of elastic particle groups
 * Larger values increase elastic particle velocity
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.elasticStrength = 0.25;

/**
 * Restores length of spring particle groups
 * Larger values increase spring particle velocity
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.springStrength = 0.25;

/**
 * Reduces relative velocity of viscous particles
 * Larger values slow down viscous particles more
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.viscousStrength = 0.25;

/**
 * Produces pressure on tensile particles
 * 0~0.2. Larger values increase the amount of surface tension.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.surfaceTensionPressureStrength = 0.2;

/**
 * Smoothes outline of tensile particles
 * 0~0.2. Larger values result in rounder, smoother,
 * water-drop-like clusters of particles.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.surfaceTensionNormalStrength = 0.2;

/**
 * Produces additional pressure on repulsive particles
 * Larger values repulse more
 * Negative values mean attraction. The range where particles
 * behave stably is about -0.2 to 2.0.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.repulsiveStrength = 1.0;

/**
 * Produces repulsion between powder particles
 * Larger values repulse more
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.powderStrength = 0.5;

/**
 * Pushes particles out of solid particle group
 * Larger values repulse more
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.ejectionStrength = 0.5;

/**
 * Produces static pressure
 * Larger values increase the pressure on neighboring partilces
 * For a description of static pressure, see
 * http://en.wikipedia.org/wiki/Static_pressure#Static_pressure_in_fluid_dynamics
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.staticPressureStrength = 0.2;

/**
 * Reduces instability in static pressure calculation
 * Larger values make stabilize static pressure with fewer
 * iterations
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.staticPressureRelaxation = 0.2;

/**
 * Computes static pressure more precisely
 * See SetStaticPressureIterations for details
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.staticPressureIterations = 8;

/**
 * Determines how fast colors are mixed
 * 1.0f ==> mixed immediately
 * 0.5f ==> mixed half way each simulation step (see
 * b2World::Step())
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.colorMixingStrength = 0.5;

/**
 * Whether to destroy particles by age when no more particles
 * can be created.  See #b2ParticleSystem::SetDestructionByAge()
 * for more information.
 *
 * @export
 * @type {boolean}
 */
box2d.b2ParticleSystemDef.prototype.destroyByAge = true;

/**
 * Granularity of particle lifetimes in seconds.  By default
 * this is set to (1.0f / 60.0f) seconds.  b2ParticleSystem uses
 * a 32-bit signed value to track particle lifetimes so the
 * maximum lifetime of a particle is (2^32 - 1) / (1.0f /
 * lifetimeGranularity) seconds. With the value set to 1/60 the
 * maximum lifetime or age of a particle is 2.27 years.
 *
 * @export
 * @type {number}
 */
box2d.b2ParticleSystemDef.prototype.lifetimeGranularity = 1.0 / 60.0;

/**
 * @return {box2d.b2ParticleSystemDef}
 * @param {box2d.b2ParticleSystemDef} def
 */
box2d.b2ParticleSystemDef.prototype.Copy = function(def) {
  this.strictContactCheck = def.strictContactCheck;
  this.density = def.density;
  this.gravityScale = def.gravityScale;
  this.radius = def.radius;
  this.maxCount = def.maxCount;
  this.pressureStrength = def.pressureStrength;
  this.dampingStrength = def.dampingStrength;
  this.elasticStrength = def.elasticStrength;
  this.springStrength = def.springStrength;
  this.viscousStrength = def.viscousStrength;
  this.surfaceTensionPressureStrength = def.surfaceTensionPressureStrength;
  this.surfaceTensionNormalStrength = def.surfaceTensionNormalStrength;
  this.repulsiveStrength = def.repulsiveStrength;
  this.powderStrength = def.powderStrength;
  this.ejectionStrength = def.ejectionStrength;
  this.staticPressureStrength = def.staticPressureStrength;
  this.staticPressureRelaxation = def.staticPressureRelaxation;
  this.staticPressureIterations = def.staticPressureIterations;
  this.colorMixingStrength = def.colorMixingStrength;
  this.destroyByAge = def.destroyByAge;
  this.lifetimeGranularity = def.lifetimeGranularity;
  return this;
}

/**
 * @return {box2d.b2ParticleSystemDef}
 */
box2d.b2ParticleSystemDef.prototype.Clone = function() {
  return new box2d.b2ParticleSystemDef().Copy(this);
}

/**
 * @export
 * @constructor
 * @param {box2d.b2ParticleSystemDef} def
 * @param {box2d.b2World} world
 */
box2d.b2ParticleSystem = function(def, world) {
  this._ctor_(def, world);
}

/**
 * @type {boolean}
 */
box2d.b2ParticleSystem.prototype.m_paused = false;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.prototype.m_timestamp = 0;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.prototype.m_allParticleFlags = 0;

/**
 * @type {boolean}
 */
box2d.b2ParticleSystem.prototype.m_needsUpdateAllParticleFlags = false;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.prototype.m_allGroupFlags = 0;

/**
 * @type {boolean}
 */
box2d.b2ParticleSystem.prototype.m_needsUpdateAllGroupFlags = false;

/**
 * @type {boolean}
 */
box2d.b2ParticleSystem.prototype.m_hasForce = false;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.prototype.m_iterationIndex = 0;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.prototype.m_inverseDensity = 0.0;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.prototype.m_particleDiameter = 0.0;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.prototype.m_inverseDiameter = 0.0;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.prototype.m_squaredDiameter = 0.0;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.prototype.m_count = 0;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.prototype.m_internalAllocatedCapacity = 0;

/**
 * Allocator for b2ParticleHandle instances.
 * b2SlabAllocator<b2ParticleHandle> m_handleAllocator;
 * @type {*}
 */
box2d.b2ParticleSystem.prototype.m_handleAllocator = null;

/**
 * Maps particle indicies to handles.
 * @type
 *     {box2d.b2ParticleSystem.UserOverridableBuffer<box2d.b2ParticleHandle>}
 */
box2d.b2ParticleSystem.prototype.m_handleIndexBuffer = null;

/**
 * @type {box2d.b2ParticleSystem.UserOverridableBuffer<number>}
 */
box2d.b2ParticleSystem.prototype.m_flagsBuffer = null;

/**
 * @type
 *     {box2d.b2ParticleSystem.UserOverridableBuffer<box2d.b2Vec2>}
 */
box2d.b2ParticleSystem.prototype.m_positionBuffer = null;

/**
 * @type
 *     {box2d.b2ParticleSystem.UserOverridableBuffer<box2d.b2Vec2>}
 */
box2d.b2ParticleSystem.prototype.m_velocityBuffer = null;

/**
 * @type {Array.<box2d.b2Vec2>}
 */
box2d.b2ParticleSystem.prototype.m_forceBuffer = null;

/**
 * this.m_weightBuffer is populated in ComputeWeight and used in
 * ComputeDepth(), SolveStaticPressure() and SolvePressure().
 *
 * @type {Array.<number>}
 */
box2d.b2ParticleSystem.prototype.m_weightBuffer = null;

/**
 * When any particles have the flag b2_staticPressureParticle,
 * this.m_staticPressureBuffer is first allocated and used in
 * SolveStaticPressure() and SolvePressure().  It will be
 * reallocated on subsequent CreateParticle() calls.
 *
 * @type {Array.<number>}
 */
box2d.b2ParticleSystem.prototype.m_staticPressureBuffer = null;

/**
 * this.m_accumulationBuffer is used in many functions as a temporary
 * buffer for scalar values.
 *
 * @type {Array.<number>}
 */
box2d.b2ParticleSystem.prototype.m_accumulationBuffer = null;

/**
 * When any particles have the flag b2_tensileParticle,
 * this.m_accumulation2Buffer is first allocated and used in
 * SolveTensile() as a temporary buffer for vector values.  It
 * will be reallocated on subsequent CreateParticle() calls.
 *
 * @type {Array.<box2d.b2Vec2>}
 */
box2d.b2ParticleSystem.prototype.m_accumulation2Buffer = null;

/**
 * When any particle groups have the flag b2_solidParticleGroup,
 * this.m_depthBuffer is first allocated and populated in
 * ComputeDepth() and used in SolveSolid(). It will be
 * reallocated on subsequent CreateParticle() calls.
 *
 * @type {Array.<number>}
 */
box2d.b2ParticleSystem.prototype.m_depthBuffer = null;

/**
 * @type
 *     {box2d.b2ParticleSystem.UserOverridableBuffer<box2d.b2ParticleColor>}
 */
box2d.b2ParticleSystem.prototype.m_colorBuffer = null;

/**
 * @type {Array.<box2d.b2ParticleGroup>}
 */
box2d.b2ParticleSystem.prototype.m_groupBuffer = null;

/**
 * @type {box2d.b2ParticleSystem.UserOverridableBuffer<*>}
 */
box2d.b2ParticleSystem.prototype.m_userDataBuffer = null;

/**
 * Stuck particle detection parameters and record keeping
 *
 * @type {number}
 */
box2d.b2ParticleSystem.prototype.m_stuckThreshold = 0;

/**
 * @type {box2d.b2ParticleSystem.UserOverridableBuffer<number>}
 */
box2d.b2ParticleSystem.prototype.m_lastBodyContactStepBuffer = null;

/**
 * @type {box2d.b2ParticleSystem.UserOverridableBuffer<number>}
 */
box2d.b2ParticleSystem.prototype.m_bodyContactCountBuffer = null;

/**
 * @type {box2d.b2ParticleSystem.UserOverridableBuffer<number>}
 */
box2d.b2ParticleSystem.prototype.m_consecutiveContactStepsBuffer = null;

/**
 * @type {box2d.b2GrowableBuffer<number>}
 */
box2d.b2ParticleSystem.prototype.m_stuckParticleBuffer = null;

/**
 * @type {box2d.b2GrowableBuffer<box2d.b2ParticleSystem.Proxy>}
 */
box2d.b2ParticleSystem.prototype.m_proxyBuffer = null;

/**
 * @type {box2d.b2GrowableBuffer<box2d.b2ParticleContact>}
 */
box2d.b2ParticleSystem.prototype.m_contactBuffer = null;

/**
 * @type {box2d.b2GrowableBuffer<box2d.b2ParticleBodyContact>}
 */
box2d.b2ParticleSystem.prototype.m_bodyContactBuffer = null;

/**
 * @type {box2d.b2GrowableBuffer<box2d.b2ParticlePair>}
 */
box2d.b2ParticleSystem.prototype.m_pairBuffer = null;

/**
 * @type {box2d.b2GrowableBuffer<box2d.b2ParticleTriad>}
 */
box2d.b2ParticleSystem.prototype.m_triadBuffer = null;

/**
 * Time each particle should be destroyed relative to the last
 * time this.m_timeElapsed was initialized.  Each unit of time
 * corresponds to b2ParticleSystemDef::lifetimeGranularity
 * seconds.
 *
 * @type {box2d.b2ParticleSystem.UserOverridableBuffer<number>}
 */
box2d.b2ParticleSystem.prototype.m_expirationTimeBuffer = null;

/**
 * List of particle indices sorted by expiration time.
 *
 * @type {box2d.b2ParticleSystem.UserOverridableBuffer<number>}
 */
box2d.b2ParticleSystem.prototype.m_indexByExpirationTimeBuffer = null;

/**
 * Time elapsed in 32:32 fixed point.  Each non-fractional unit
 * of time corresponds to
 * b2ParticleSystemDef::lifetimeGranularity seconds.
 *
 * @type {number}
 */
box2d.b2ParticleSystem.prototype.m_timeElapsed = 0;

/**
 * Whether the expiration time buffer has been modified and
 * needs to be resorted.
 *
 * @type {boolean}
 */
box2d.b2ParticleSystem.prototype.m_expirationTimeBufferRequiresSorting = false;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.prototype.m_groupCount = 0;

/**
 * @type {box2d.b2ParticleGroup}
 */
box2d.b2ParticleSystem.prototype.m_groupList = null;

/**
 * @type {box2d.b2ParticleSystemDef}
 */
box2d.b2ParticleSystem.prototype.m_def = null;

/**
 * @type {box2d.b2World}
 */
box2d.b2ParticleSystem.prototype.m_world = null;

/**
 * @type {box2d.b2ParticleSystem}
 */
box2d.b2ParticleSystem.prototype.m_prev = null;

/**
 * @type {box2d.b2ParticleSystem}
 */
box2d.b2ParticleSystem.prototype.m_next = null;

/**
 * @const
 * @type {number}
 */
box2d.b2ParticleSystem.xTruncBits = 12;

/**
 * @const
 * @type {number}
 */
box2d.b2ParticleSystem.yTruncBits = 12;

/**
 * @const
 * @type {number}
 */
box2d.b2ParticleSystem.tagBits = 8 * 4; // 8u * sizeof(uint32);

/**
 * @const
 * @type {number}
 */
box2d.b2ParticleSystem.yOffset = 1 << (box2d.b2ParticleSystem.yTruncBits - 1);

/**
 * @const
 * @type {number}
 */
box2d.b2ParticleSystem.yShift = box2d.b2ParticleSystem.tagBits - box2d.b2ParticleSystem.yTruncBits;

/**
 * @const
 * @type {number}
 */
box2d.b2ParticleSystem.xShift = box2d.b2ParticleSystem.tagBits - box2d.b2ParticleSystem.yTruncBits - box2d.b2ParticleSystem.xTruncBits;

/**
 * @const
 * @type {number}
 */
box2d.b2ParticleSystem.xScale = 1 << box2d.b2ParticleSystem.xShift;

/**
 * @const
 * @type {number}
 */
box2d.b2ParticleSystem.xOffset = box2d.b2ParticleSystem.xScale * (1 << (box2d.b2ParticleSystem.xTruncBits - 1));

/**
 * @const
 * @type {number}
 */
box2d.b2ParticleSystem.yMask = ((1 << box2d.b2ParticleSystem.yTruncBits) - 1) << box2d.b2ParticleSystem.yShift;

/**
 * @const
 * @type {number}
 */
box2d.b2ParticleSystem.xMask = ~box2d.b2ParticleSystem.yMask;

/**
 * @return {number}
 * @param {number} x
 * @param {number} y
 */
box2d.b2ParticleSystem.computeTag = function(x, y) {
  ///  return ((uint32)(y + yOffset) << yShift) + (uint32)(xScale * x + xOffset);
  return ((((y + box2d.b2ParticleSystem.yOffset) >>> 0) << box2d.b2ParticleSystem.yShift) + ((box2d.b2ParticleSystem.xScale * x + box2d.b2ParticleSystem.xOffset) >>> 0)) >>> 0;
}

/**
 * @return {number}
 * @param {number} x
 * @param {number} y
 */
box2d.b2ParticleSystem.computeRelativeTag = function(tag, x, y) {
  ///  return tag + (y << yShift) + (x << xShift);
  return (tag + (y << box2d.b2ParticleSystem.yShift) + (x << box2d.b2ParticleSystem.xShift)) >>> 0;
}

/**
 * @constructor
 */
box2d.b2ParticleSystem.FixedSetAllocator = function() {}

/**
 * @return {void}
 * @param {number} itemIndex
 */
box2d.b2ParticleSystem.FixedSetAllocator.prototype.Invalidate = function(itemIndex) {}

/**
 * @constructor
 * @param {box2d.b2Fixture} fixture
 * @param {number} particle
 */
box2d.b2ParticleSystem.FixtureParticle = function(fixture, particle) {
  this.first = fixture;
  this.second = particle;
}

/**
 * @type {box2d.b2Fixture}
 */
box2d.b2ParticleSystem.FixtureParticle.prototype.first = null;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.FixtureParticle.prototype.second = box2d.b2_invalidParticleIndex;

/**
 * @constructor
 * @extends {box2d.b2ParticleSystem.FixedSetAllocator}
 */
box2d.b2ParticleSystem.FixtureParticleSet = function() {}

goog.inherits(box2d.b2ParticleSystem.FixtureParticleSet, box2d.b2ParticleSystem.FixedSetAllocator);

/**
 * @return {void}
 * @param {box2d.b2GrowableBuffer<box2d.b2ParticleBodyContact>}
 *      bodyContactBuffer
 * @param {box2d.b2ParticleSystem.UserOverridableBuffer<number>}
 *      flagsBuffer
 */
box2d.b2ParticleSystem.FixtureParticleSet.prototype.Initialize = function(bodyContactBuffer, flagsBuffer) {}

/**
 * @return {number}
 * @param {box2d.b2ParticleSystem.FixtureParticle} pair
 */
box2d.b2ParticleSystem.FixtureParticleSet.prototype.Find = function(pair) {}

/**
 * @constructor
 * @param {number} particleA
 * @param {number} particleB
 */
box2d.b2ParticleSystem.ParticlePair = function(particleA, particleB) {}

/**
 * @type {number}
 */
box2d.b2ParticleSystem.ParticlePair.prototype.first = box2d.b2_invalidParticleIndex;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.ParticlePair.prototype.second = box2d.b2_invalidParticleIndex;

/**
 * @constructor
 * @extends {box2d.b2ParticleSystem.FixedSetAllocator}
 */
box2d.b2ParticleSystem.b2ParticlePairSet = function() {}

goog.inherits(box2d.b2ParticleSystem.b2ParticlePairSet, box2d.b2ParticleSystem.FixedSetAllocator);

/**
 * @return {void}
 * @param {box2d.b2GrowableBuffer<box2d.b2ParticleContact>}
 *      contactBuffer
 * @param {box2d.b2ParticleSystem.UserOverridableBuffer<number>}
 *      flagsBuffer
 */
box2d.b2ParticleSystem.b2ParticlePairSet.prototype.Initialize = function(contactBuffer, flagsBuffer) {}

/**
 * @return {number}
 * @param {box2d.b2ParticleSystem.ParticlePair} pair
 */
box2d.b2ParticleSystem.b2ParticlePairSet.prototype.Find = function(pair) {}

/**
 * Class for filtering pairs or triads.
 *
 * @constructor
 */
box2d.b2ParticleSystem.ConnectionFilter = function() {}

/**
 * Is the particle necessary for connection?
 * A pair or a triad should contain at least one 'necessary'
 * particle.
 *
 * @return {boolean}
 * @param {number} index
 */
box2d.b2ParticleSystem.ConnectionFilter.prototype.IsNecessary = function(index) {
  return true;
}

/**
 * An additional condition for creating a pair.
 *
 * @return {boolean}
 * @param {number} a
 * @param {number} b
 */
box2d.b2ParticleSystem.ConnectionFilter.prototype.ShouldCreatePair = function(a, b) {
  return true;
}

/**
 * An additional condition for creating a triad.
 *
 * @return {boolean}
 * @param {number} a
 * @param {number} b
 * @param {number} c
 */
box2d.b2ParticleSystem.ConnectionFilter.prototype.ShouldCreateTriad = function(a, b, c) {
  return true;
}

/**
 * b2ParticleSystem::b2ParticleSystem(const b2ParticleSystemDef*
 * def, b2World* world);
 *
 * @return {void}
 * @param {box2d.b2ParticleSystemDef} def
 * @param {box2d.b2World} world
 */
box2d.b2ParticleSystem.prototype._ctor_ = function(def, world) {
  this.m_handleIndexBuffer = new box2d.b2ParticleSystem.UserOverridableBuffer();
  this.m_flagsBuffer = new box2d.b2ParticleSystem.UserOverridableBuffer();
  this.m_positionBuffer = new box2d.b2ParticleSystem.UserOverridableBuffer();
  this.m_velocityBuffer = new box2d.b2ParticleSystem.UserOverridableBuffer();
  this.m_forceBuffer = [];
  this.m_weightBuffer = [];
  this.m_staticPressureBuffer = [];
  this.m_accumulationBuffer = [];
  this.m_accumulation2Buffer = [];
  this.m_depthBuffer = [];
  this.m_colorBuffer = new box2d.b2ParticleSystem.UserOverridableBuffer();
  this.m_groupBuffer = [];
  this.m_userDataBuffer = new box2d.b2ParticleSystem.UserOverridableBuffer();
  this.m_lastBodyContactStepBuffer = new box2d.b2ParticleSystem.UserOverridableBuffer();
  this.m_bodyContactCountBuffer = new box2d.b2ParticleSystem.UserOverridableBuffer();
  this.m_consecutiveContactStepsBuffer = new box2d.b2ParticleSystem.UserOverridableBuffer();
  this.m_stuckParticleBuffer = new box2d.b2GrowableBuffer(function() {
    return 0;
  });
  this.m_proxyBuffer = new box2d.b2GrowableBuffer(function() {
    return new box2d.b2ParticleSystem.Proxy();
  });
  this.m_contactBuffer = new box2d.b2GrowableBuffer(function() {
    return new box2d.b2ParticleContact();
  });
  this.m_bodyContactBuffer = new box2d.b2GrowableBuffer(function() {
    return new box2d.b2ParticleBodyContact();
  });
  this.m_pairBuffer = new box2d.b2GrowableBuffer(function() {
    return new box2d.b2ParticlePair();
  });
  this.m_triadBuffer = new box2d.b2GrowableBuffer(function() {
    return new box2d.b2ParticleTriad();
  });
  this.m_expirationTimeBuffer = new box2d.b2ParticleSystem.UserOverridableBuffer();
  this.m_indexByExpirationTimeBuffer = new box2d.b2ParticleSystem.UserOverridableBuffer();
  this.m_def = new box2d.b2ParticleSystemDef();

  box2d.b2Assert(def !== null);
  ///  this.m_paused = false;
  ///  this.m_timestamp = 0;
  ///  this.m_allParticleFlags = 0;
  ///  this.m_needsUpdateAllParticleFlags = false;
  ///  this.m_allGroupFlags = 0;
  ///  this.m_needsUpdateAllGroupFlags = false;
  ///  this.m_hasForce = false;
  ///  this.m_iterationIndex = 0;

  this.SetStrictContactCheck(def.strictContactCheck);
  this.SetDensity(def.density);
  this.SetGravityScale(def.gravityScale);
  this.SetRadius(def.radius);
  this.SetMaxParticleCount(def.maxCount);

  ///  this.m_count = 0;
  ///  this.m_internalAllocatedCapacity = 0;
  ///  this.m_forceBuffer = null;
  ///  this.m_weightBuffer = null;
  ///  this.m_staticPressureBuffer = null;
  ///  this.m_accumulationBuffer = null;
  ///  this.m_accumulation2Buffer = null;
  ///  this.m_depthBuffer = null;
  ///  this.m_groupBuffer = null;

  ///  this.m_groupCount = 0;
  ///  this.m_groupList = null;

  box2d.b2Assert(def.lifetimeGranularity > 0.0);
  this.m_def = def.Clone();

  this.m_world = world;

  ///  this.m_stuckThreshold = 0;

  ///  this.m_timeElapsed = 0;
  ///  this.m_expirationTimeBufferRequiresSorting = false;

  this.SetDestructionByAge(this.m_def.destroyByAge);
}

/**
 * b2ParticleSystem::~b2ParticleSystem();
 *
 * @return {void}
 */
box2d.b2ParticleSystem.prototype._dtor_ = function() {
  while (this.m_groupList) {
    this.DestroyParticleGroup(this.m_groupList);
  }

  this.FreeUserOverridableBuffer(this.m_handleIndexBuffer);
  this.FreeUserOverridableBuffer(this.m_flagsBuffer);
  this.FreeUserOverridableBuffer(this.m_lastBodyContactStepBuffer);
  this.FreeUserOverridableBuffer(this.m_bodyContactCountBuffer);
  this.FreeUserOverridableBuffer(this.m_consecutiveContactStepsBuffer);
  this.FreeUserOverridableBuffer(this.m_positionBuffer);
  this.FreeUserOverridableBuffer(this.m_velocityBuffer);
  this.FreeUserOverridableBuffer(this.m_colorBuffer);
  this.FreeUserOverridableBuffer(this.m_userDataBuffer);
  this.FreeUserOverridableBuffer(this.m_expirationTimeBuffer);
  this.FreeUserOverridableBuffer(this.m_indexByExpirationTimeBuffer);
  this.FreeBuffer(this.m_forceBuffer, this.m_internalAllocatedCapacity);
  this.FreeBuffer(this.m_weightBuffer, this.m_internalAllocatedCapacity);
  this.FreeBuffer(this.m_staticPressureBuffer, this.m_internalAllocatedCapacity);
  this.FreeBuffer(this.m_accumulationBuffer, this.m_internalAllocatedCapacity);
  this.FreeBuffer(this.m_accumulation2Buffer, this.m_internalAllocatedCapacity);
  this.FreeBuffer(this.m_depthBuffer, this.m_internalAllocatedCapacity);
  this.FreeBuffer(this.m_groupBuffer, this.m_internalAllocatedCapacity);
}

/**
 * @return {void}
 */
box2d.b2ParticleSystem.prototype.Drop = function() {
  this._dtor_();
}

/**
 * Create a particle whose properties have been defined.
 *
 * No reference to the definition is retained.
 *
 * A simulation step must occur before it's possible to interact
 * with a newly created particle.  For example,
 * DestroyParticleInShape() will not destroy a particle until
 * b2World::Step() has been called.
 *
 * warning: This function is locked during callbacks.
 *
 * @export
 * @return {number} the index of the particle.
 * @param {box2d.b2ParticleDef} def
 */
box2d.b2ParticleSystem.prototype.CreateParticle = function(def) {
  box2d.b2Assert(this.m_world.IsLocked() === false);
  if (this.m_world.IsLocked()) {
    return 0;
  }

  if (this.m_count >= this.m_internalAllocatedCapacity) {
    // Double the particle capacity.
    var capacity = this.m_count ? 2 * this.m_count : box2d.b2_minParticleSystemBufferCapacity;
    this.ReallocateInternalAllocatedBuffers(capacity);
  }
  if (this.m_count >= this.m_internalAllocatedCapacity) {
    // If the oldest particle should be destroyed...
    if (this.m_def.destroyByAge) {
      this.DestroyOldestParticle(0, false);
      // Need to destroy this particle *now* so that it's possible to
      // create a new particle.
      this.SolveZombie();
    } else {
      return box2d.b2_invalidParticleIndex;
    }
  }
  var index = this.m_count++;
  this.m_flagsBuffer.data[index] = 0;
  if (this.m_lastBodyContactStepBuffer.data) {
    this.m_lastBodyContactStepBuffer.data[index] = 0;
  }
  if (this.m_bodyContactCountBuffer.data) {
    this.m_bodyContactCountBuffer.data[index] = 0;
  }
  if (this.m_consecutiveContactStepsBuffer.data) {
    this.m_consecutiveContactStepsBuffer.data[index] = 0;
  }
  this.m_positionBuffer.data[index] = (this.m_positionBuffer.data[index] || new box2d.b2Vec2()).Copy(def.position);
  this.m_velocityBuffer.data[index] = (this.m_velocityBuffer.data[index] || new box2d.b2Vec2()).Copy(def.velocity);
  this.m_weightBuffer[index] = 0;
  this.m_forceBuffer[index] = (this.m_forceBuffer[index] || new box2d.b2Vec2()).SetZero();
  if (this.m_staticPressureBuffer) {
    this.m_staticPressureBuffer[index] = 0;
  }
  if (this.m_depthBuffer) {
    this.m_depthBuffer[index] = 0;
  }
  if (this.m_colorBuffer.data || !def.color.IsZero()) {
    this.m_colorBuffer.data = this.RequestBuffer(this.m_colorBuffer.data);
    this.m_colorBuffer.data[index] = (this.m_colorBuffer.data[index] || new box2d.b2ParticleColor()).Copy(def.color);
  }
  if (this.m_userDataBuffer.data || def.userData) {
    this.m_userDataBuffer.data = this.RequestBuffer(this.m_userDataBuffer.data);
    this.m_userDataBuffer.data[index] = def.userData;
  }
  if (this.m_handleIndexBuffer.data) {
    this.m_handleIndexBuffer.data[index] = null;
  }
  ///  Proxy& proxy = m_proxyBuffer.Append();
  var proxy = this.m_proxyBuffer.data[this.m_proxyBuffer.Append()];

  // If particle lifetimes are enabled or the lifetime is set in the particle
  // definition, initialize the lifetime.
  var finiteLifetime = def.lifetime > 0.0;
  if (this.m_expirationTimeBuffer.data || finiteLifetime) {
    this.SetParticleLifetime(index, finiteLifetime ? def.lifetime :
      this.ExpirationTimeToLifetime(-this.GetQuantizedTimeElapsed()));
    // Add a reference to the newly added particle to the end of the
    // queue.
    this.m_indexByExpirationTimeBuffer.data[index] = index;
  }

  proxy.index = index;
  var group = def.group;
  this.m_groupBuffer[index] = group;
  if (group) {
    if (group.m_firstIndex < group.m_lastIndex) {
      // Move particles in the group just before the new particle.
      this.RotateBuffer(group.m_firstIndex, group.m_lastIndex, index);
      box2d.b2Assert(group.m_lastIndex === index);
      // Update the index range of the group to contain the new particle.
      group.m_lastIndex = index + 1;
    } else {
      // If the group is empty, reset the index range to contain only the
      // new particle.
      group.m_firstIndex = index;
      group.m_lastIndex = index + 1;
    }
  }
  this.SetParticleFlags(index, def.flags);
  return index;
}

/**
 * Retrieve a handle to the particle at the specified index.
 *
 * Please see #b2ParticleHandle for why you might want a handle.
 *
 * @export
 * @return {box2d.b2ParticleHandle}
 * @param {number} index
 */
box2d.b2ParticleSystem.prototype.GetParticleHandleFromIndex = function(index) {
  box2d.b2Assert(index >= 0 && index < this.GetParticleCount() && index !== box2d.b2_invalidParticleIndex);
  this.m_handleIndexBuffer.data = this.RequestBuffer(this.m_handleIndexBuffer.data);
  var handle = this.m_handleIndexBuffer.data[index];
  if (handle) {
    return handle;
  }
  // Create a handle.
  //handle = m_handleAllocator.Allocate();
  handle = new box2d.b2ParticleHandle();
  box2d.b2Assert(handle !== null);
  handle.SetIndex(index);
  this.m_handleIndexBuffer.data[index] = handle;
  return handle;
}

/**
 * Destroy a particle.
 *
 * The particle is removed after the next simulation step (see
 * b2World::Step()).
 *
 * @export
 * @return {void}
 * @param {number} index Index of the particle to destroy.
 * @param {boolean=} callDestructionListener Whether to call the
 *      destruction listener just before the particle is
 *      destroyed.
 */
box2d.b2ParticleSystem.prototype.DestroyParticle = function(index, callDestructionListener) {
  var flags = box2d.b2ParticleFlag.b2_zombieParticle;
  if (callDestructionListener) {
    flags |= box2d.b2ParticleFlag.b2_destructionListenerParticle;
  }
  this.SetParticleFlags(index, this.m_flagsBuffer.data[index] | flags);
}

/**
 * Destroy the Nth oldest particle in the system.
 *
 * The particle is removed after the next b2World::Step().
 *
 * @return {void}
 * @param {number} index Index of the Nth oldest particle to
 *      destroy, 0 will destroy the oldest particle in the
 *      system, 1 will destroy the next oldest particle etc.
 * @param {boolean=} callDestructionListener Whether to call the
 *      destruction listener just before the particle is
 *      destroyed.
 */
box2d.b2ParticleSystem.prototype.DestroyOldestParticle = function(index, callDestructionListener) {
  var particleCount = this.GetParticleCount();
  box2d.b2Assert(index >= 0 && index < particleCount);
  // Make sure particle lifetime tracking is enabled.
  box2d.b2Assert(this.m_indexByExpirationTimeBuffer.data !== null);
  // Destroy the oldest particle (preferring to destroy finite
  // lifetime particles first) to free a slot in the buffer.
  var oldestFiniteLifetimeParticle =
    this.m_indexByExpirationTimeBuffer.data[particleCount - (index + 1)];
  var oldestInfiniteLifetimeParticle =
    this.m_indexByExpirationTimeBuffer.data[index];
  this.DestroyParticle(
    this.m_expirationTimeBuffer.data[oldestFiniteLifetimeParticle] > 0.0 ?
    oldestFiniteLifetimeParticle : oldestInfiniteLifetimeParticle,
    callDestructionListener);
}

/**
 * @constructor
 * @extends {box2d.b2QueryCallback}
 * @param {box2d.b2ParticleSystem} system
 */
box2d.b2ParticleSystem.DestroyParticlesInShapeCallback = function(system, shape, xf, callDestructionListener) {
  this.m_system = system;
  this.m_shape = shape;
  this.m_xf = xf;
  this.m_callDestructionListener = callDestructionListener;
  this.m_destroyed = 0;
}

goog.inherits(box2d.b2ParticleSystem.DestroyParticlesInShapeCallback, box2d.b2QueryCallback);

/**
 * @type {box2d.b2ParticleSystem}
 */
box2d.b2ParticleSystem.DestroyParticlesInShapeCallback.prototype.m_system = null;

/**
 * @type {box2d.b2Shape}
 */
box2d.b2ParticleSystem.DestroyParticlesInShapeCallback.prototype.m_shape = null;

/**
 * @type {box2d.b2Transform}
 */
box2d.b2ParticleSystem.DestroyParticlesInShapeCallback.prototype.m_xf = null;

/**
 * @type {boolean}
 */
box2d.b2ParticleSystem.DestroyParticlesInShapeCallback.prototype.m_callDestructionListener = false;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.DestroyParticlesInShapeCallback.prototype.m_destroyed = 0;

/**
 * @return {boolean}
 * @param {box2d.b2Fixture} fixture
 */
box2d.b2ParticleSystem.DestroyParticlesInShapeCallback.prototype.ReportFixture = function(fixture) {
  return false;
}

/**
 * @return {boolean}
 * @param {box2d.b2ParticleSystem} particleSystem
 * @param {number} index
 */
box2d.b2ParticleSystem.DestroyParticlesInShapeCallback.prototype.ReportParticle = function(particleSystem, index) {
  if (particleSystem !== this.m_system)
    return false;

  box2d.b2Assert(index >= 0 && index < this.m_system.m_count);
  if (this.m_shape.TestPoint(this.m_xf, this.m_system.m_positionBuffer.data[index])) {
    this.m_system.DestroyParticle(index, this.m_callDestructionListener);
    this.m_destroyed++;
  }
  return true;
}

/**
 * @return {number}
 */
box2d.b2ParticleSystem.DestroyParticlesInShapeCallback.prototype.Destroyed = function() {
  return this.m_destroyed;
}

/**
 * Destroy particles inside a shape.
 *
 * warning: This function is locked during callbacks.
 *
 * In addition, this function immediately destroys particles in
 * the shape in constrast to DestroyParticle() which defers the
 * destruction until the next simulation step.
 *
 * @export
 * @return {number} Number of particles destroyed.
 * @param {box2d.b2Shape} shape Shape which encloses particles
 *      that should be destroyed.
 * @param {box2d.b2Transform} xf Transform applied to the shape.
 * @param {boolean=} callDestructionListener Whether to call the
 *      world b2DestructionListener for each particle
 *      destroyed.
 */
box2d.b2ParticleSystem.prototype.DestroyParticlesInShape = function(shape, xf, callDestructionListener) {
  var s_aabb = box2d.b2ParticleSystem.prototype.DestroyParticlesInShape.s_aabb;
  box2d.b2Assert(this.m_world.IsLocked() === false);
  if (this.m_world.IsLocked()) {
    return 0;
  }

  var callback = new box2d.b2ParticleSystem.DestroyParticlesInShapeCallback(this, shape, xf, callDestructionListener);

  var aabb = s_aabb;
  shape.ComputeAABB(aabb, xf, 0);
  this.m_world.QueryAABB(callback, aabb);
  return callback.Destroyed();
}
box2d.b2ParticleSystem.prototype.DestroyParticlesInShape.s_aabb = new box2d.b2AABB();

/**
 * Create a particle group whose properties have been defined.
 *
 * No reference to the definition is retained.
 *
 * warning: This function is locked during callbacks.
 *
 * @export
 * @return {box2d.b2ParticleGroup}
 * @param {box2d.b2ParticleGroupDef} groupDef
 */
box2d.b2ParticleSystem.prototype.CreateParticleGroup = function(groupDef) {
  var s_transform = box2d.b2ParticleSystem.prototype.CreateParticleGroup.s_transform;

  box2d.b2Assert(this.m_world.IsLocked() === false);
  if (this.m_world.IsLocked()) {
    return null;
  }

  var transform = s_transform;
  transform.Set(groupDef.position, groupDef.angle);
  var firstIndex = this.m_count;
  if (groupDef.shape) {
    this.CreateParticlesWithShapeForGroup(groupDef.shape, groupDef, transform);
  }
  if (groupDef.shapes) {
    this.CreateParticlesWithShapesForGroup(groupDef.shapes, groupDef.shapeCount, groupDef, transform);
  }
  if (groupDef.particleCount) {
    box2d.b2Assert(groupDef.positionData !== null);
    for (var i = 0; i < groupDef.particleCount; i++) {
      var p = groupDef.positionData[i];
      this.CreateParticleForGroup(groupDef, transform, p);
    }
  }
  var lastIndex = this.m_count;

  var group = new box2d.b2ParticleGroup();
  group.m_system = this;
  group.m_firstIndex = firstIndex;
  group.m_lastIndex = lastIndex;
  group.m_strength = groupDef.strength;
  group.m_userData = groupDef.userData;
  group.m_transform.Copy(transform);
  group.m_prev = null;
  group.m_next = this.m_groupList;
  if (this.m_groupList) {
    this.m_groupList.m_prev = group;
  }
  this.m_groupList = group;
  ++this.m_groupCount;
  for (var i = firstIndex; i < lastIndex; i++) {
    this.m_groupBuffer[i] = group;
  }
  this.SetGroupFlags(group, groupDef.groupFlags);

  // Create pairs and triads between particles in the group.
  var filter = new box2d.b2ParticleSystem.ConnectionFilter();
  this.UpdateContacts(true);
  this.UpdatePairsAndTriads(firstIndex, lastIndex, filter);

  if (groupDef.group) {
    this.JoinParticleGroups(groupDef.group, group);
    group = groupDef.group;
  }

  return group;
}
box2d.b2ParticleSystem.prototype.CreateParticleGroup.s_transform = new box2d.b2Transform();

/**
 * @constructor
 * @extends {box2d.b2ParticleSystem.ConnectionFilter}
 * @param {number} threshold
 */
box2d.b2ParticleSystem.JoinParticleGroupsFilter = function(threshold) {
  this.m_threshold = threshold;
}

goog.inherits(box2d.b2ParticleSystem.JoinParticleGroupsFilter, box2d.b2ParticleSystem.ConnectionFilter);

/**
 * @type {number}
 */
box2d.b2ParticleSystem.JoinParticleGroupsFilter.prototype.m_threshold = 0;

/**
 * An additional condition for creating a pair.
 *
 * @return {boolean}
 * @param {number} a
 * @param {number} b
 */
box2d.b2ParticleSystem.JoinParticleGroupsFilter.prototype.ShouldCreatePair = function(a, b) {
  return (a < this.m_threshold && this.m_threshold <= b) ||
    (b < this.m_threshold && this.m_threshold <= a);
}

/**
 * An additional condition for creating a triad.
 *
 * @return {boolean}
 * @param {number} a
 * @param {number} b
 * @param {number} c
 */
box2d.b2ParticleSystem.JoinParticleGroupsFilter.prototype.ShouldCreateTriad = function(a, b, c) {
  return (a < this.m_threshold || b < this.m_threshold || c < this.m_threshold) &&
    (this.m_threshold <= a || this.m_threshold <= b || this.m_threshold <= c);
}

/**
 * Join two particle groups.
 *
 * warning: This function is locked during callbacks.
 *
 * @export
 * @return {void}
 * @param {box2d.b2ParticleGroup} groupA the first group.
 *      Expands to encompass the second group.
 * @param {box2d.b2ParticleGroup} groupB the second group. It is
 *      destroyed.
 */
box2d.b2ParticleSystem.prototype.JoinParticleGroups = function(groupA, groupB) {
  box2d.b2Assert(this.m_world.IsLocked() === false);
  if (this.m_world.IsLocked()) {
    return;
  }

  box2d.b2Assert(groupA !== groupB);
  this.RotateBuffer(groupB.m_firstIndex, groupB.m_lastIndex, this.m_count);
  box2d.b2Assert(groupB.m_lastIndex === this.m_count);
  this.RotateBuffer(groupA.m_firstIndex, groupA.m_lastIndex, groupB.m_firstIndex);
  box2d.b2Assert(groupA.m_lastIndex === groupB.m_firstIndex);

  // Create pairs and triads connecting groupA and groupB.
  var filter = new box2d.b2ParticleSystem.JoinParticleGroupsFilter(groupB.m_firstIndex);
  this.UpdateContacts(true);
  this.UpdatePairsAndTriads(groupA.m_firstIndex, groupB.m_lastIndex, filter);

  for (var i = groupB.m_firstIndex; i < groupB.m_lastIndex; i++) {
    this.m_groupBuffer[i] = groupA;
  }
  var groupFlags = groupA.m_groupFlags | groupB.m_groupFlags;
  this.SetGroupFlags(groupA, groupFlags);
  groupA.m_lastIndex = groupB.m_lastIndex;
  groupB.m_firstIndex = groupB.m_lastIndex;
  this.DestroyParticleGroup(groupB);
}

/**
 * Split particle group into multiple disconnected groups.
 *
 * warning: This function is locked during callbacks.
 *
 * @export
 * @return {void}
 * @param {box2d.b2ParticleGroup} group the group to be split.
 */
box2d.b2ParticleSystem.prototype.SplitParticleGroup = function(group) {
  this.UpdateContacts(true);
  var particleCount = group.GetParticleCount();
  // We create several linked lists. Each list represents a set of connected particles.
  ///  ParticleListNode* nodeBuffer = (ParticleListNode*) m_world.m_stackAllocator.Allocate(sizeof(ParticleListNode) * particleCount);
  var nodeBuffer = box2d.b2MakeArray(particleCount, function(index) {
    return new box2d.b2ParticleSystem.ParticleListNode();
  });
  box2d.b2ParticleSystem.InitializeParticleLists(group, nodeBuffer);
  this.MergeParticleListsInContact(group, nodeBuffer);
  var survivingList = box2d.b2ParticleSystem.FindLongestParticleList(group, nodeBuffer);
  this.MergeZombieParticleListNodes(group, nodeBuffer, survivingList);
  this.CreateParticleGroupsFromParticleList(group, nodeBuffer, survivingList);
  this.UpdatePairsAndTriadsWithParticleList(group, nodeBuffer);
  ///  this.m_world.m_stackAllocator.Free(nodeBuffer);
}

/**
 * Get the world particle group list. With the returned group,
 * use b2ParticleGroup::GetNext to get the next group in the
 * world list.
 *
 * A null group indicates the end of the list.
 *
 * @export
 * @return {box2d.b2ParticleGroup} the head of the world
 *       particle group list.
 */
box2d.b2ParticleSystem.prototype.GetParticleGroupList = function() {
  return this.m_groupList;
}

/**
 * Get the number of particle groups.
 *
 * @export
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetParticleGroupCount = function() {
  return this.m_groupCount;
}

/**
 * Get the number of particles.
 *
 * @export
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetParticleCount = function() {
  return this.m_count;
}

/**
 * Get the maximum number of particles.
 *
 * @export
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetMaxParticleCount = function() {
  return this.m_def.maxCount;
}

/**
 * Set the maximum number of particles.
 *
 * A value of 0 means there is no maximum. The particle buffers
 * can continue to grow while b2World's block allocator still
 * has memory.
 *
 * Note: If you try to CreateParticle() with more than this
 * count, b2_invalidParticleIndex is returned unless
 * SetDestructionByAge() is used to enable the destruction of
 * the oldest particles in the system.
 *
 * @export
 * @return {void}
 * @param {number} count
 */
box2d.b2ParticleSystem.prototype.SetMaxParticleCount = function(count) {
  box2d.b2Assert(this.m_count <= count);
  this.m_def.maxCount = count;
}

/**
 * Get all existing particle flags.
 *
 * @export
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetAllParticleFlags = function() {
  return this.m_allParticleFlags;
}

/**
 * Get all existing particle group flags.
 *
 * @export
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetAllGroupFlags = function() {
  return this.m_allGroupFlags;
}

/**
 * Pause or unpause the particle system. When paused,
 * b2World::Step() skips over this particle system. All
 * b2ParticleSystem function calls still work.
 *
 * @export
 * @return {void}
 * @param {boolean} paused paused is true to pause, false to
 *      un-pause.
 */
box2d.b2ParticleSystem.prototype.SetPaused = function(paused) {
  this.m_paused = paused;
}

/**
 * Initially, true, then, the last value passed into
 * SetPaused().
 *
 * @export
 * @return {boolean} true if the particle system is being
 *       updated in b2World::Step().
 */
box2d.b2ParticleSystem.prototype.GetPaused = function() {
  return this.m_paused;
}

/**
 * Change the particle density.
 *
 * Particle density affects the mass of the particles, which in
 * turn affects how the particles interact with b2Bodies. Note
 * that the density does not affect how the particles interact
 * with each other.
 *
 * @export
 * @return {void}
 * @param {number} density
 */
box2d.b2ParticleSystem.prototype.SetDensity = function(density) {
  this.m_def.density = density;
  this.m_inverseDensity = 1 / this.m_def.density;
}

/**
 * Get the particle density.
 *
 * @export
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetDensity = function() {
  return this.m_def.density;
}

/**
 * Change the particle gravity scale. Adjusts the effect of the
 * global gravity vector on particles.
 *
 * @export
 * @return {void}
 * @param {number} gravityScale
 */
box2d.b2ParticleSystem.prototype.SetGravityScale = function(gravityScale) {
  this.m_def.gravityScale = gravityScale;
}


/**
 * Get the particle gravity scale.
 *
 * @export
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetGravityScale = function() {
  return this.m_def.gravityScale;
}

/**
 * Damping is used to reduce the velocity of particles. The
 * damping parameter can be larger than 1.0f but the damping
 * effect becomes sensitive to the time step when the damping
 * parameter is large.
 *
 * @export
 * @return {void}
 * @param {number} damping
 */
box2d.b2ParticleSystem.prototype.SetDamping = function(damping) {
  this.m_def.dampingStrength = damping;
}

/**
 * Get damping for particles
 *
 * @export
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetDamping = function() {
  return this.m_def.dampingStrength;
}

/**
 * Change the number of iterations when calculating the static
 * pressure of particles. By default, 8 iterations. You can
 * reduce the number of iterations down to 1 in some situations,
 * but this may cause instabilities when many particles come
 * together. If you see particles popping away from each other
 * like popcorn, you may have to increase the number of
 * iterations.
 *
 * For a description of static pressure, see
 * http://en.wikipedia.org/wiki/Static_pressure#Static_pressure_in_fluid_dynamics
 *
 * @export
 * @return {void}
 * @param {number} iterations
 */
box2d.b2ParticleSystem.prototype.SetStaticPressureIterations = function(iterations) {
  this.m_def.staticPressureIterations = iterations;
}

/**
 * Get the number of iterations for static pressure of
 * particles.
 *
 * @export
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetStaticPressureIterations = function() {
  return this.m_def.staticPressureIterations;
}

/**
 * Change the particle radius.
 *
 * You should set this only once, on world start.
 * If you change the radius during execution, existing particles
 * may explode, shrink, or behave unexpectedly.
 *
 * @export
 * @return {void}
 * @param {number} radius
 */
box2d.b2ParticleSystem.prototype.SetRadius = function(radius) {
  this.m_particleDiameter = 2 * radius;
  this.m_squaredDiameter = this.m_particleDiameter * this.m_particleDiameter;
  this.m_inverseDiameter = 1 / this.m_particleDiameter;
}

/**
 * Get the particle radius.
 *
 * @export
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetRadius = function() {
  return this.m_particleDiameter / 2;
}

/**
 * Get the position of each particle
 *
 * Array is length GetParticleCount()
 *
 * @export
 * @return {Array.<box2d.b2Vec2>} the pointer to the head of the
 *       particle positions array.
 */
box2d.b2ParticleSystem.prototype.GetPositionBuffer = function() {
  return this.m_positionBuffer.data;
}

/**
 * Get the velocity of each particle
 *
 * Array is length GetParticleCount()
 *
 * @export
 * @return {Array.<box2d.b2Vec2>} the pointer to the head of the
 *       particle velocities array.
 */
box2d.b2ParticleSystem.prototype.GetVelocityBuffer = function() {
  return this.m_velocityBuffer.data;
}

/**
 * Get the color of each particle
 *
 * Array is length GetParticleCount()
 *
 * @export
 * @return {Array.<box2d.b2ParticleColor>} the pointer to the
 *       head of the particle colors array.
 */
box2d.b2ParticleSystem.prototype.GetColorBuffer = function() {
  this.m_colorBuffer.data = this.RequestBuffer(this.m_colorBuffer.data);
  return this.m_colorBuffer.data;
}

/**
 * Get the particle-group of each particle.
 *
 * Array is length GetParticleCount()
 *
 * @export
 * @return {Array.<box2d.b2ParticleGroup>} the pointer to the
 *       head of the particle group array.
 */
box2d.b2ParticleSystem.prototype.GetGroupBuffer = function() {
  return this.m_groupBuffer;
}

/**
 * Get the weight of each particle
 *
 * Array is length GetParticleCount()
 *
 * @export
 * @return {Array.<number>} the pointer to the head of the
 *       particle positions array.
 */
box2d.b2ParticleSystem.prototype.GetWeightBuffer = function() {
  return this.m_weightBuffer;
}

/**
 * Get the user-specified data of each particle.
 *
 * Array is length GetParticleCount()
 *
 * @export
 * @return {Array.<*>} the pointer to the head of the particle
 *       user-data array.
 */
box2d.b2ParticleSystem.prototype.GetUserDataBuffer = function() {
  this.m_userDataBuffer.data = this.RequestBuffer(this.m_userDataBuffer.data);
  return this.m_userDataBuffer.data;
}

/**
 * Get the flags for each particle. See the b2ParticleFlag enum.
 *
 * Array is length GetParticleCount()
 *
 * @export
 * @return {Array.<number>} the pointer to the head of the
 *       particle-flags array.
 */
box2d.b2ParticleSystem.prototype.GetFlagsBuffer = function() {
  return this.m_flagsBuffer.data;
}

/**
 * Set flags for a particle. See the b2ParticleFlag enum.
 *
 * @export
 * @return {void}
 * @param {number} index
 * @param {number} newFlags
 */
box2d.b2ParticleSystem.prototype.SetParticleFlags = function(index, newFlags) {
  var oldFlags = this.m_flagsBuffer.data[index];
  if (oldFlags & ~newFlags) {
    // If any flags might be removed
    this.m_needsUpdateAllParticleFlags = true;
  }
  if (~this.m_allParticleFlags & newFlags) {
    // If any flags were added
    if (newFlags & box2d.b2ParticleFlag.b2_tensileParticle) {
      this.m_accumulation2Buffer = this.RequestBuffer(this.m_accumulation2Buffer);
    }
    if (newFlags & box2d.b2ParticleFlag.b2_colorMixingParticle) {
      this.m_colorBuffer.data = this.RequestBuffer(this.m_colorBuffer.data);
    }
    this.m_allParticleFlags |= newFlags;
  }
  this.m_flagsBuffer.data[index] = newFlags;
}

/**
 * Get flags for a particle. See the b2ParticleFlag enum.
 *
 * @export
 * @return {number}
 * @param {number} index
 */
box2d.b2ParticleSystem.prototype.GetParticleFlags = function(index) {
  return this.m_flagsBuffer.data[index];
}

/**
 * Set an external buffer for particle data.
 *
 * Normally, the b2World's block allocator is used for particle
 * data. However, sometimes you may have an OpenGL or Java
 * buffer for particle data. To avoid data duplication, you may
 * supply this external buffer.
 *
 * Note that, when b2World's block allocator is used, the
 * particle data buffers can grow as required. However, when
 * external buffers are used, the maximum number of particles is
 * clamped to the size of the smallest external buffer.
 *
 * @export
 * @return {void}
 * @param {*} buffer a pointer to a block of memory.
 * @param {number} capacity the number of values in the block.
 */
box2d.b2ParticleSystem.prototype.SetFlagsBuffer = function(buffer, capacity) {
  this.SetUserOverridableBuffer(this.m_flagsBuffer, buffer, capacity);
}

/**
 * @export
 * @return {void}
 * @param {*} buffer
 * @param {number} capacity
 */
box2d.b2ParticleSystem.prototype.SetPositionBuffer = function(buffer, capacity) {
  this.SetUserOverridableBuffer(this.m_positionBuffer, buffer, capacity);
}

/**
 * @export
 * @return {void}
 * @param {*} buffer
 * @param {number} capacity
 */
box2d.b2ParticleSystem.prototype.SetVelocityBuffer = function(buffer, capacity) {
  this.SetUserOverridableBuffer(this.m_velocityBuffer, buffer, capacity);
}

/**
 * @export
 * @return {void}
 * @param {*} buffer
 * @param {number} capacity
 */
box2d.b2ParticleSystem.prototype.SetColorBuffer = function(buffer, capacity) {
  this.SetUserOverridableBuffer(this.m_colorBuffer, buffer, capacity);
}

/**
 * @export
 * @return {void}
 * @param {*} buffer
 * @param {number} capacity
 */
box2d.b2ParticleSystem.prototype.SetUserDataBuffer = function(buffer, capacity) {
  this.SetUserOverridableBuffer(this.m_userDataBuffer, buffer, capacity);
}

/**
 * Get contacts between particles
 * Contact data can be used for many reasons, for example to
 * trigger rendering or audio effects.
 *
 * @export
 * @return {Array.<box2d.b2ParticleContact>}
 */
box2d.b2ParticleSystem.prototype.GetContacts = function() {
  return this.m_contactBuffer.data;
}

/**
 * @export
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetContactCount = function() {
  return this.m_contactBuffer.count;
}

/**
 * Get contacts between particles and bodies
 *
 * Contact data can be used for many reasons, for example to
 * trigger rendering or audio effects.
 *
 * @export
 * @return {Array.<box2d.b2ParticleBodyContact>}
 */
box2d.b2ParticleSystem.prototype.GetBodyContacts = function() {
  return this.m_bodyContactBuffer.data;
}

/**
 * @export
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetBodyContactCount = function() {
  return this.m_bodyContactBuffer.count;
}

/**
 * Get array of particle pairs. The particles in a pair:
 *   (1) are contacting,
 *   (2) are in the same particle group,
 *   (3) are part of a rigid particle group, or are spring, elastic,
 *       or wall particles.
 *   (4) have at least one particle that is a spring or barrier
 *       particle (i.e. one of the types in k_pairFlags),
 *   (5) have at least one particle that returns true for
 *       ConnectionFilter::IsNecessary,
 *   (6) are not zombie particles.
 *
 * Essentially, this is an array of spring or barrier particles
 * that are interacting. The array is sorted by b2ParticlePair's
 * indexA, and then indexB. There are no duplicate entries.
 *
 * @export
 * @return {Array.<box2d.b2ParticlePair>}
 */
box2d.b2ParticleSystem.prototype.GetPairs = function() {
  return this.m_pairBuffer.data;
}

/**
 * @export
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetPairCount = function() {
  return this.m_pairBuffer.count;
}

/**
 * Get array of particle triads. The particles in a triad:
 *   (1) are in the same particle group,
 *   (2) are in a Voronoi triangle together,
 *   (3) are within b2_maxTriadDistance particle diameters of each
 *       other,
 *   (4) return true for ConnectionFilter::ShouldCreateTriad
 *   (5) have at least one particle of type elastic (i.e. one of the
 *       types in k_triadFlags),
 *   (6) are part of a rigid particle group, or are spring, elastic,
 *       or wall particles.
 *   (7) are not zombie particles.
 *
 * Essentially, this is an array of elastic particles that are
 * interacting. The array is sorted by b2ParticleTriad's indexA,
 * then indexB, then indexC. There are no duplicate entries.
 *
 * @export
 * @return {Array.<box2d.b2ParticleTriad>}
 */
box2d.b2ParticleSystem.prototype.GetTriads = function() {
  return this.m_triadBuffer.data;
}

/**
 * @export
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetTriadCount = function() {
  return this.m_triadBuffer.count;
}

/**
 * Set an optional threshold for the maximum number of
 * consecutive particle iterations that a particle may contact
 * multiple bodies before it is considered a candidate for being
 * "stuck". Setting to zero or less disables.
 *
 * @return {void}
 * @param {number} steps
 */
box2d.b2ParticleSystem.prototype.SetStuckThreshold = function(steps) {
  this.m_stuckThreshold = steps;

  if (steps > 0) {
    this.m_lastBodyContactStepBuffer.data = this.RequestBuffer(this.m_lastBodyContactStepBuffer.data);
    this.m_bodyContactCountBuffer.data = this.RequestBuffer(this.m_bodyContactCountBuffer.data);
    this.m_consecutiveContactStepsBuffer.data = this.RequestBuffer(this.m_consecutiveContactStepsBuffer.data);
  }
}

/**
 * Get potentially stuck particles from the last step; the user
 * must decide if they are stuck or not, and if so, delete or
 * move them
 *
 * @export
 * @return {Array.<number>}
 */
box2d.b2ParticleSystem.prototype.GetStuckCandidates = function() {
  ///  return m_stuckParticleBuffer.Data();
  return this.m_stuckParticleBuffer.Data();
}

/**
 * Get the number of stuck particle candidates from the last
 * step.
 *
 * @export
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetStuckCandidateCount = function() {
  ///  return m_stuckParticleBuffer.GetCount();
  return this.m_stuckParticleBuffer.GetCount();
}

/**
 * Compute the kinetic energy that can be lost by damping force
 *
 * @export
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.ComputeCollisionEnergy = function() {
  var s_v = box2d.b2ParticleSystem.prototype.ComputeCollisionEnergy.s_v;
  var vel_data = this.m_velocityBuffer.data;
  var sum_v2 = 0;
  for (var k = 0; k < this.m_contactBuffer.count; k++) {
    var contact = this.m_contactBuffer.data[k];
    var a = contact.indexA;
    var b = contact.indexB;
    var n = contact.normal;
    ///  b2Vec2 v = m_velocityBuffer.data[b] - m_velocityBuffer.data[a];
    var v = box2d.b2Sub_V2_V2(vel_data[b], vel_data[a], s_v);
    var vn = box2d.b2Dot_V2_V2(v, n);
    if (vn < 0) {
      sum_v2 += vn * vn;
    }
  }
  return 0.5 * this.GetParticleMass() * sum_v2;
}
box2d.b2ParticleSystem.prototype.ComputeCollisionEnergy.s_v = new box2d.b2Vec2();

/**
 * Set strict Particle/Body contact check.
 *
 * This is an option that will help ensure correct behavior if
 * there are corners in the world model where Particle/Body
 * contact is ambiguous. This option scales at n*log(n) of the
 * number of Particle/Body contacts, so it is best to only
 * enable if it is necessary for your geometry. Enable if you
 * see strange particle behavior around b2Body intersections.
 *
 * @export
 * @return {void}
 * @param {boolean} enabled
 */
box2d.b2ParticleSystem.prototype.SetStrictContactCheck = function(enabled) {
  this.m_def.strictContactCheck = enabled;
}

/**
 * Get the status of the strict contact check.
 *
 * @export
 * @return {boolean}
 */
box2d.b2ParticleSystem.prototype.GetStrictContactCheck = function() {
  return this.m_def.strictContactCheck;
}

/**
 * Set the lifetime (in seconds) of a particle relative to the
 * current time.  A lifetime of less than or equal to 0.0f
 * results in the particle living forever until it's manually
 * destroyed by the application.
 *
 * @export
 * @return {void}
 * @param {number} index
 * @param {number} lifetime
 */
box2d.b2ParticleSystem.prototype.SetParticleLifetime = function(index, lifetime) {
  box2d.b2Assert(this.ValidateParticleIndex(index));
  var initializeExpirationTimes = this.m_indexByExpirationTimeBuffer.data === null;
  this.m_expirationTimeBuffer.data = this.RequestBuffer(this.m_expirationTimeBuffer.data);
  this.m_indexByExpirationTimeBuffer.data = this.RequestBuffer(this.m_indexByExpirationTimeBuffer.data);

  // Initialize the inverse mapping buffer.
  if (initializeExpirationTimes) {
    var particleCount = this.GetParticleCount();
    for (var i = 0; i < particleCount; ++i) {
      this.m_indexByExpirationTimeBuffer.data[i] = i;
    }
  }
  ///  const int32 quantizedLifetime = (int32)(lifetime / m_def.lifetimeGranularity);
  var quantizedLifetime = lifetime / this.m_def.lifetimeGranularity;
  // Use a negative lifetime so that it's possible to track which
  // of the infinite lifetime particles are older.
  var newExpirationTime = quantizedLifetime > 0.0 ? this.GetQuantizedTimeElapsed() + quantizedLifetime : quantizedLifetime;
  if (newExpirationTime !== this.m_expirationTimeBuffer.data[index]) {
    this.m_expirationTimeBuffer.data[index] = newExpirationTime;
    this.m_expirationTimeBufferRequiresSorting = true;
  }
}

/**
 * Get the lifetime (in seconds) of a particle relative to the
 * current time.  A value > 0.0f is returned if the particle is
 * scheduled to be destroyed in the future, values <= 0.0f
 * indicate the particle has an infinite lifetime.
 *
 * @export
 * @return {number}
 * @param {number} index
 */
box2d.b2ParticleSystem.prototype.GetParticleLifetime = function(index) {
  box2d.b2Assert(this.ValidateParticleIndex(index));
  return this.ExpirationTimeToLifetime(this.GetExpirationTimeBuffer()[index]);
}

/**
 * Enable / disable destruction of particles in CreateParticle()
 * when no more particles can be created due to a prior call to
 * SetMaxParticleCount().  When this is enabled, the oldest
 * particle is destroyed in CreateParticle() favoring the
 * destruction of particles with a finite lifetime over
 * particles with infinite lifetimes. This feature is enabled by
 * default when particle lifetimes are tracked.  Explicitly
 * enabling this feature using this function enables particle
 * lifetime tracking.
 *
 * @export
 * @return {void}
 * @param {boolean} enable
 */
box2d.b2ParticleSystem.prototype.SetDestructionByAge = function(enable) {
  if (enable) {
    this.GetExpirationTimeBuffer();
  }
  this.m_def.destroyByAge = enable;
}

/**
 * Get whether the oldest particle will be destroyed in
 * CreateParticle() when the maximum number of particles are
 * present in the system.
 *
 * @export
 * @return {boolean}
 */
box2d.b2ParticleSystem.prototype.GetDestructionByAge = function() {
  return this.m_def.destroyByAge;
}

/**
 * Get the array of particle expiration times indexed by
 * particle index.
 *
 * GetParticleCount() items are in the returned array.
 *
 * @export
 * @return {Array.<number>}
 */
box2d.b2ParticleSystem.prototype.GetExpirationTimeBuffer = function() {
  this.m_expirationTimeBuffer.data = this.RequestBuffer(this.m_expirationTimeBuffer.data);
  return this.m_expirationTimeBuffer.data;
}

/**
 * Convert a expiration time value in returned by
 * GetExpirationTimeBuffer() to a time in seconds relative to
 * the current simulation time.
 *
 * @export
 * @return {number}
 * @param {number} expirationTime
 */
box2d.b2ParticleSystem.prototype.ExpirationTimeToLifetime = function(expirationTime) {
  return (expirationTime > 0 ?
    expirationTime - this.GetQuantizedTimeElapsed() :
    expirationTime) * this.m_def.lifetimeGranularity;
}

/**
 * Get the array of particle indices ordered by reverse
 * lifetime. The oldest particle indexes are at the end of the
 * array with the newest at the start.  Particles with infinite
 * lifetimes (i.e expiration times less than or equal to 0) are
 * placed at the start of the array.
 * ExpirationTimeToLifetime(GetExpirationTimeBuffer()[index]) is
 * equivalent to GetParticleLifetime(index).
 *
 * GetParticleCount() items are in the returned array.
 *
 * @export
 * @return {Array.<number>}
 */
box2d.b2ParticleSystem.prototype.GetIndexByExpirationTimeBuffer = function() {
  // If particles are present, initialize / reinitialize the lifetime buffer.
  if (this.GetParticleCount()) {
    this.SetParticleLifetime(0, this.GetParticleLifetime(0));
  } else {
    this.m_indexByExpirationTimeBuffer.data = this.RequestBuffer(this.m_indexByExpirationTimeBuffer.data);
  }
  return this.m_indexByExpirationTimeBuffer.data;
}

/**
 * Apply an impulse to one particle. This immediately modifies
 * the velocity. Similar to b2Body::ApplyLinearImpulse.
 *
 * @export
 * @return {void}
 * @param {number} index the particle that will be modified.
 * @param {box2d.b2Vec2} impulse impulse the world impulse
 *      vector, usually in N-seconds or kg-m/s.
 */
box2d.b2ParticleSystem.prototype.ParticleApplyLinearImpulse = function(index, impulse) {
  this.ApplyLinearImpulse(index, index + 1, impulse);
}

/**
 * Apply an impulse to all particles between 'firstIndex' and
 * 'lastIndex'. This immediately modifies the velocity. Note
 * that the impulse is applied to the total mass of all
 * particles. So, calling ParticleApplyLinearImpulse(0, impulse)
 * and ParticleApplyLinearImpulse(1, impulse) will impart twice
 * as much velocity as calling just ApplyLinearImpulse(0, 1,
 * impulse).
 *
 * @export
 * @return {void}
 * @param {number} firstIndex the first particle to be modified.
 * @param {number} lastIndex the last particle to be modified.
 * @param {box2d.b2Vec2} impulse the world impulse vector,
 *      usually in N-seconds or kg-m/s.
 */
box2d.b2ParticleSystem.prototype.ApplyLinearImpulse = function(firstIndex, lastIndex, impulse) {
  var vel_data = this.m_velocityBuffer.data;
  var numParticles = (lastIndex - firstIndex);
  var totalMass = numParticles * this.GetParticleMass();
  ///  const b2Vec2 velocityDelta = impulse / totalMass;
  var velocityDelta = impulse.Clone().SelfMul(1 / totalMass);
  for (var i = firstIndex; i < lastIndex; i++) {
    ///  m_velocityBuffer.data[i] += velocityDelta;
    vel_data[i].SelfAdd(velocityDelta);
  }
}

/**
 * @return {boolean}
 * @param {box2d.b2Vec2} force
 */
box2d.b2ParticleSystem.IsSignificantForce = function(force) {
  return force.x !== 0 || force.y !== 0;
}

/**
 * Apply a force to the center of a particle.
 *
 * @export
 * @return {void}
 * @param {number} index the particle that will be modified.
 * @param {box2d.b2Vec2} force the world force vector, usually
 *      in Newtons (N).
 */
box2d.b2ParticleSystem.prototype.ParticleApplyForce = function(index, force) {
  if (box2d.b2ParticleSystem.IsSignificantForce(force) &&
    this.ForceCanBeApplied(this.m_flagsBuffer.data[index])) {
    this.PrepareForceBuffer();
    ///  m_forceBuffer[index] += force;
    this.m_forceBuffer[index].SelfAdd(force);
  }
}

/**
 * Distribute a force across several particles. The particles
 * must not be wall particles. Note that the force is
 * distributed across all the particles, so calling this
 * function for indices 0..N is not the same as calling
 * ParticleApplyForce(i, force) for i in 0..N.
 *
 * @export
 * @return {void}
 * @param {number} firstIndex the first particle to be modified.
 * @param {number} lastIndex the last particle to be modified.
 * @param {box2d.b2Vec2} force the world force vector, usually
 *      in Newtons (N).
 */
box2d.b2ParticleSystem.prototype.ApplyForce = function(firstIndex, lastIndex, force) {
  // Ensure we're not trying to apply force to particles that can't move,
  // such as wall particles.
  //#if B2_ASSERT_ENABLED
  var flags = 0;
  for (var i = firstIndex; i < lastIndex; i++) {
    flags |= this.m_flagsBuffer.data[i];
  }
  box2d.b2Assert(this.ForceCanBeApplied(flags));
  //#endif

  // Early out if force does nothing (optimization).
  ///  const b2Vec2 distributedForce = force / (float32)(lastIndex - firstIndex);
  var distributedForce = force.Clone().SelfMul(1 / (lastIndex - firstIndex));
  if (box2d.b2ParticleSystem.IsSignificantForce(distributedForce)) {
    this.PrepareForceBuffer();

    // Distribute the force over all the particles.
    for (var i = firstIndex; i < lastIndex; i++) {
      ///  m_forceBuffer[i] += distributedForce;
      this.m_forceBuffer[i].SelfAdd(distributedForce);
    }
  }
}

/**
 * Get the next particle-system in the world's particle-system
 * list.
 *
 * @export
 * @return {box2d.b2ParticleSystem}
 */
box2d.b2ParticleSystem.prototype.GetNext = function() {
  return this.m_next;
}

/**
 * Query the particle system for all particles that potentially
 * overlap the provided AABB.
 * b2QueryCallback::ShouldQueryParticleSystem is ignored.
 *
 * @export
 * @return {void}
 * @param {box2d.b2QueryCallback} callback a user implemented
 *      callback class.
 * @param {box2d.b2AABB} aabb the query box.
 */
box2d.b2ParticleSystem.prototype.QueryAABB = function(callback, aabb) {
  if (this.m_proxyBuffer.count === 0) {
    return;
  }
  var beginProxy = 0;
  var endProxy = this.m_proxyBuffer.count;
  var firstProxy = box2d.std_lower_bound(this.m_proxyBuffer.data, beginProxy, endProxy,
    box2d.b2ParticleSystem.computeTag(
      this.m_inverseDiameter * aabb.lowerBound.x,
      this.m_inverseDiameter * aabb.lowerBound.y),
    box2d.b2ParticleSystem.Proxy.CompareProxyTag);
  var lastProxy = box2d.std_upper_bound(this.m_proxyBuffer.data, firstProxy, endProxy,
    box2d.b2ParticleSystem.computeTag(
      this.m_inverseDiameter * aabb.upperBound.x,
      this.m_inverseDiameter * aabb.upperBound.y),
    box2d.b2ParticleSystem.Proxy.CompareTagProxy);
  var pos_data = this.m_positionBuffer.data;
  for (var k = firstProxy; k < lastProxy; ++k) {
    var proxy = this.m_proxyBuffer.data[k];
    var i = proxy.index;
    var p = pos_data[i];
    if (aabb.lowerBound.x < p.x && p.x < aabb.upperBound.x &&
      aabb.lowerBound.y < p.y && p.y < aabb.upperBound.y) {
      if (!callback.ReportParticle(this, i)) {
        break;
      }
    }
  }
}

/**
 * Query the particle system for all particles that potentially
 * overlap the provided shape's AABB. Calls QueryAABB
 * internally. b2QueryCallback::ShouldQueryParticleSystem is
 * ignored.
 *
 * @export
 * @return {void}
 * @param {box2d.b2QueryCallback} callback a user implemented
 *      callback class.
 * @param {box2d.b2Shape} shape the query shape
 * @param {box2d.b2Transform} xf the transform of the AABB
 * @param {number=} childIndex
 */
box2d.b2ParticleSystem.prototype.QueryShapeAABB = function(callback, shape, xf, childIndex) {
  var s_aabb = box2d.b2ParticleSystem.prototype.QueryShapeAABB.s_aabb;
  childIndex = childIndex || 0;
  var aabb = s_aabb;
  shape.ComputeAABB(aabb, xf, childIndex);
  this.QueryAABB(callback, aabb);
}
box2d.b2ParticleSystem.prototype.QueryShapeAABB.s_aabb = new box2d.b2AABB();

/**
 * @export
 * @return {void}
 * @param {box2d.b2QueryCallback} callback
 * @param {box2d.b2Vec2} point
 * @param {number=} slop
 */
box2d.b2ParticleSystem.prototype.QueryPointAABB = function(callback, point, slop) {
  var s_aabb = box2d.b2ParticleSystem.prototype.QueryPointAABB.s_aabb;
  slop = (typeof(slop) === 'number') ? (slop) : (box2d.b2_linearSlop);
  var aabb = s_aabb;
  aabb.lowerBound.Set(point.x - slop, point.y - slop);
  aabb.upperBound.Set(point.x + slop, point.y + slop);
  this.QueryAABB(callback, aabb);
}
box2d.b2ParticleSystem.prototype.QueryPointAABB.s_aabb = new box2d.b2AABB();

/**
 * Ray-cast the particle system for all particles in the path of
 * the ray. Your callback controls whether you get the closest
 * point, any point, or n-points. The ray-cast ignores particles
 * that contain the starting point.
 * b2RayCastCallback::ShouldQueryParticleSystem is ignored.
 *
 * @export
 * @return {void}
 * @param {box2d.b2RayCastCallback} callback a user implemented
 *      callback class.
 * @param {box2d.b2Vec2} point1 the ray starting point
 * @param {box2d.b2Vec2} point2 the ray ending point
 */
box2d.b2ParticleSystem.prototype.RayCast = function(callback, point1, point2) {
  var s_aabb = box2d.b2ParticleSystem.prototype.RayCast.s_aabb;
  var s_p = box2d.b2ParticleSystem.prototype.RayCast.s_p;
  var s_v = box2d.b2ParticleSystem.prototype.RayCast.s_v;
  var s_n = box2d.b2ParticleSystem.prototype.RayCast.s_n;
  var s_point = box2d.b2ParticleSystem.prototype.RayCast.s_point;
  if (this.m_proxyBuffer.count === 0) {
    return;
  }
  var pos_data = this.m_positionBuffer.data;
  var aabb = s_aabb;
  box2d.b2Min_V2_V2(point1, point2, aabb.lowerBound);
  box2d.b2Max_V2_V2(point1, point2, aabb.upperBound);
  var fraction = 1;
  // solving the following equation:
  // ((1-t)*point1+t*point2-position)^2=diameter^2
  // where t is a potential fraction
  ///  b2Vec2 v = point2 - point1;
  var v = box2d.b2Sub_V2_V2(point2, point1, s_v);
  var v2 = box2d.b2Dot_V2_V2(v, v);
  var enumerator = this.GetInsideBoundsEnumerator(aabb);

  var i;
  while ((i = enumerator.GetNext()) >= 0) {
    ///  b2Vec2 p = point1 - m_positionBuffer.data[i];
    var p = box2d.b2Sub_V2_V2(point1, pos_data[i], s_p);
    var pv = box2d.b2Dot_V2_V2(p, v);
    var p2 = box2d.b2Dot_V2_V2(p, p);
    var determinant = pv * pv - v2 * (p2 - this.m_squaredDiameter);
    if (determinant >= 0) {
      var sqrtDeterminant = box2d.b2Sqrt(determinant);
      // find a solution between 0 and fraction
      var t = (-pv - sqrtDeterminant) / v2;
      if (t > fraction) {
        continue;
      }
      if (t < 0) {
        t = (-pv + sqrtDeterminant) / v2;
        if (t < 0 || t > fraction) {
          continue;
        }
      }
      ///  b2Vec2 n = p + t * v;
      var n = box2d.b2AddMul_V2_S_V2(p, t, v, s_n);
      n.Normalize();
      ///  float32 f = callback.ReportParticle(this, i, point1 + t * v, n, t);
      var f = callback.ReportParticle(this, i, box2d.b2AddMul_V2_S_V2(point1, t, v, s_point), n, t);
      fraction = box2d.b2Min(fraction, f);
      if (fraction <= 0) {
        break;
      }
    }
  }
}
box2d.b2ParticleSystem.prototype.RayCast.s_aabb = new box2d.b2AABB();
box2d.b2ParticleSystem.prototype.RayCast.s_p = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.RayCast.s_v = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.RayCast.s_n = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.RayCast.s_point = new box2d.b2Vec2();

/**
 * Compute the axis-aligned bounding box for all particles
 * contained within this particle system.
 *
 * @export
 * @return {void}
 * @param {box2d.b2AABB} aabb Returns the axis-aligned bounding
 *      box of the system.
 */
box2d.b2ParticleSystem.prototype.ComputeAABB = function(aabb) {
  var particleCount = this.GetParticleCount();
  box2d.b2Assert(aabb !== null);
  aabb.lowerBound.x = +box2d.b2_maxFloat;
  aabb.lowerBound.y = +box2d.b2_maxFloat;
  aabb.upperBound.x = -box2d.b2_maxFloat;
  aabb.upperBound.y = -box2d.b2_maxFloat;

  var pos_data = this.m_positionBuffer.data;
  for (var i = 0; i < particleCount; i++) {
    var p = pos_data[i];
    box2d.b2Min_V2_V2(aabb.lowerBound, p, aabb.lowerBound);
    box2d.b2Max_V2_V2(aabb.upperBound, p, aabb.upperBound);
  }
  aabb.lowerBound.x -= this.m_particleDiameter;
  aabb.lowerBound.y -= this.m_particleDiameter;
  aabb.upperBound.x += this.m_particleDiameter;
  aabb.upperBound.y += this.m_particleDiameter;
}

/**
 * @constructor
 * @template T
 */
box2d.b2ParticleSystem.UserOverridableBuffer = function() {};

/**
 * @type {Array.<T>}
 */
box2d.b2ParticleSystem.UserOverridableBuffer.prototype.data = null;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.UserOverridableBuffer.prototype.userSuppliedCapacity = 0;

/**
 * @constructor
 */
box2d.b2ParticleSystem.Proxy = function() {}

/**
 * @type {number}
 */
box2d.b2ParticleSystem.Proxy.prototype.index = box2d.b2_invalidParticleIndex;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.Proxy.prototype.tag = 0;

/**
 * @return {boolean}
 * @param {box2d.b2ParticleSystem.Proxy} a
 * @param {box2d.b2ParticleSystem.Proxy} b
 */
box2d.b2ParticleSystem.Proxy.CompareProxyProxy = function(a, b) {
  return a.tag < b.tag;
}

/**
 * @return {boolean}
 * @param {number} a
 * @param {box2d.b2ParticleSystem.Proxy} b
 */
box2d.b2ParticleSystem.Proxy.CompareTagProxy = function(a, b) {
  return a < b.tag;
}

/**
 * @return {boolean}
 * @param {box2d.b2ParticleSystem.Proxy} a
 * @param {number} b
 */
box2d.b2ParticleSystem.Proxy.CompareProxyTag = function(a, b) {
  return a.tag < b;
}

/**
 * InsideBoundsEnumerator enumerates all particles inside the
 * given bounds.
 *
 * Construct an enumerator with bounds of tags and a range of
 * proxies.
 *
 * @constructor
 * @param {box2d.b2ParticleSystem} system
 * @param {number} lower
 * @param {number} upper
 * @param {number} first
 * @param {number} last
 */
box2d.b2ParticleSystem.InsideBoundsEnumerator = function(system, lower, upper, first, last) {
  this.m_system = system;
  this.m_xLower = (lower & box2d.b2ParticleSystem.xMask) >>> 0;
  this.m_xUpper = (upper & box2d.b2ParticleSystem.xMask) >>> 0;
  this.m_yLower = (lower & box2d.b2ParticleSystem.yMask) >>> 0;
  this.m_yUpper = (upper & box2d.b2ParticleSystem.yMask) >>> 0;
  this.m_first = first;
  this.m_last = last;
  box2d.b2Assert(this.m_first <= this.m_last);
}

/**
 * Get index of the next particle. Returns
 * b2_invalidParticleIndex if there are no more particles.
 *
 * @return {number}
 */
box2d.b2ParticleSystem.InsideBoundsEnumerator.prototype.GetNext = function() {
  while (this.m_first < this.m_last) {
    var xTag = (this.m_system.m_proxyBuffer.data[this.m_first].tag & box2d.b2ParticleSystem.xMask) >>> 0;
    //#if B2_ASSERT_ENABLED
    var yTag = (this.m_system.m_proxyBuffer.data[this.m_first].tag & box2d.b2ParticleSystem.yMask) >>> 0;
    box2d.b2Assert(yTag >= this.m_yLower);
    box2d.b2Assert(yTag <= this.m_yUpper);
    //#endif
    if (xTag >= this.m_xLower && xTag <= this.m_xUpper) {
      return (this.m_system.m_proxyBuffer.data[this.m_first++]).index;
    }
    this.m_first++;
  }
  return box2d.b2_invalidParticleIndex;
}

/**
 * Node of linked lists of connected particles
 *
 * @constructor
 */
box2d.b2ParticleSystem.ParticleListNode = function() {}

/**
 * The head of the list.
 *
 * @type {box2d.b2ParticleSystem.ParticleListNode}
 */
box2d.b2ParticleSystem.ParticleListNode.prototype.list = null;

/**
 * The next node in the list.
 *
 * @type {box2d.b2ParticleSystem.ParticleListNode}
 */
box2d.b2ParticleSystem.ParticleListNode.prototype.next = null;

/**
 * Number of entries in the list. Valid only for the node at the
 * head of the list.
 *
 * @type {number}
 */
box2d.b2ParticleSystem.ParticleListNode.prototype.count = 0;

/**
 * Particle index.
 *
 * @type {number}
 */
box2d.b2ParticleSystem.ParticleListNode.prototype.index = 0;

/**
 * All particle types that require creating pairs
 *
 * @type {number}
 */
box2d.b2ParticleSystem.k_pairFlags = box2d.b2ParticleFlag.b2_springParticle;

/**
 * All particle types that require creating triads
 *
 * @type {number}
 */
box2d.b2ParticleSystem.k_triadFlags = box2d.b2ParticleFlag.b2_elasticParticle;

/**
 * All particle types that do not produce dynamic pressure
 *
 * @type {number}
 */
box2d.b2ParticleSystem.k_noPressureFlags = box2d.b2ParticleFlag.b2_powderParticle | box2d.b2ParticleFlag.b2_tensileParticle;

/**
 * All particle types that apply extra damping force with bodies
 *
 * @type {number}
 */
box2d.b2ParticleSystem.k_extraDampingFlags = box2d.b2ParticleFlag.b2_staticPressureParticle;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.k_barrierWallFlags = box2d.b2ParticleFlag.b2_barrierParticle | box2d.b2ParticleFlag.b2_wallParticle;

/**
 * @return {void}
 * @param {Array.<*>} b
 * @param {number} capacity
 */
box2d.b2ParticleSystem.prototype.FreeBuffer = function(b, capacity) {
  if (b === null) {
    return;
  }

  b.length = 0;
}

/**
 * @return {void}
 * @param {box2d.b2ParticleSystem.UserOverridableBuffer} b
 */
box2d.b2ParticleSystem.prototype.FreeUserOverridableBuffer = function(b) {
  if (b.userSuppliedCapacity == 0) {
    this.FreeBuffer(b.data, this.m_internalAllocatedCapacity);
  }
}

/**
 * Reallocate a buffer
 *
 * @return {Array.<*>}
 * @param {Array.<*>} oldBuffer
 * @param {number} oldCapacity
 * @param {number} newCapacity
 */
box2d.b2ParticleSystem.prototype.ReallocateBuffer3 = function(oldBuffer, oldCapacity, newCapacity) {
  box2d.b2Assert(newCapacity > oldCapacity);
  var newBuffer = (oldBuffer) ? oldBuffer.slice() : [];
  newBuffer.length = newCapacity;
  return newBuffer;
}

/**
 * Reallocate a buffer
 *
 * @return {Array.<*>}
 * @param {Array.<*>} buffer
 * @param {number} userSuppliedCapacity
 * @param {number} oldCapacity
 * @param {number} newCapacity
 * @param {boolean} deferred
 */
box2d.b2ParticleSystem.prototype.ReallocateBuffer5 = function(buffer, userSuppliedCapacity, oldCapacity, newCapacity, deferred) {
  box2d.b2Assert(newCapacity > oldCapacity);
  // A 'deferred' buffer is reallocated only if it is not NULL.
  // If 'userSuppliedCapacity' is not zero, buffer is user supplied and must
  // be kept.
  box2d.b2Assert(!userSuppliedCapacity || newCapacity <= userSuppliedCapacity);
  if ((!deferred || buffer) && !userSuppliedCapacity) {
    buffer = this.ReallocateBuffer3(buffer, oldCapacity, newCapacity);
  }
  return buffer;
}

/**
 * Reallocate a buffer
 *
 * @return {Array.<*>}
 * @param {box2d.b2ParticleSystem.UserOverridableBuffer} buffer
 * @param {number} oldCapacity
 * @param {number} newCapacity
 * @param {boolean} deferred
 */
box2d.b2ParticleSystem.prototype.ReallocateBuffer4 = function(buffer, oldCapacity, newCapacity, deferred) {
  box2d.b2Assert(newCapacity > oldCapacity);
  return this.ReallocateBuffer5(buffer.data, buffer.userSuppliedCapacity, oldCapacity, newCapacity, deferred);
}

/**
 * @return {Array.<?>}
 * @param {Array.<?>} buffer
 */
box2d.b2ParticleSystem.prototype.RequestBuffer = function(buffer) {
  if (!buffer) {
    if (this.m_internalAllocatedCapacity === 0) {
      this.ReallocateInternalAllocatedBuffers(box2d.b2_minParticleSystemBufferCapacity);
    }

    buffer = [];
    buffer.length = this.m_internalAllocatedCapacity;
  }
  return buffer;
}

/**
 * Reallocate the handle / index map and schedule the allocation
 * of a new pool for handle allocation.
 *
 * @return {void}
 * @param {number} newCapacity
 */
box2d.b2ParticleSystem.prototype.ReallocateHandleBuffers = function(newCapacity) {
  box2d.b2Assert(newCapacity > this.m_internalAllocatedCapacity);
  // Reallocate a new handle / index map buffer, copying old handle pointers
  // is fine since they're kept around.
  this.m_handleIndexBuffer.data = this.ReallocateBuffer4(this.m_handleIndexBuffer, this.m_internalAllocatedCapacity, newCapacity, true);
  // Set the size of the next handle allocation.
  ///  this.m_handleAllocator.SetItemsPerSlab(newCapacity - this.m_internalAllocatedCapacity);
}

/**
 * @return {void}
 * @param {number} capacity
 */
box2d.b2ParticleSystem.prototype.ReallocateInternalAllocatedBuffers = function(capacity) {
  function LimitCapacity(capacity, maxCount) {
    return maxCount && capacity > maxCount ? maxCount : capacity;
  }

  // Don't increase capacity beyond the smallest user-supplied buffer size.
  capacity = LimitCapacity(capacity, this.m_def.maxCount);
  capacity = LimitCapacity(capacity, this.m_flagsBuffer.userSuppliedCapacity);
  capacity = LimitCapacity(capacity, this.m_positionBuffer.userSuppliedCapacity);
  capacity = LimitCapacity(capacity, this.m_velocityBuffer.userSuppliedCapacity);
  capacity = LimitCapacity(capacity, this.m_colorBuffer.userSuppliedCapacity);
  capacity = LimitCapacity(capacity, this.m_userDataBuffer.userSuppliedCapacity);
  if (this.m_internalAllocatedCapacity < capacity) {
    this.ReallocateHandleBuffers(capacity);
    this.m_flagsBuffer.data = this.ReallocateBuffer4(this.m_flagsBuffer, this.m_internalAllocatedCapacity, capacity, false);

    // Conditionally defer these as they are optional if the feature is
    // not enabled.
    var stuck = this.m_stuckThreshold > 0;
    this.m_lastBodyContactStepBuffer.data = this.ReallocateBuffer4(this.m_lastBodyContactStepBuffer, this.m_internalAllocatedCapacity, capacity, stuck);
    this.m_bodyContactCountBuffer.data = this.ReallocateBuffer4(this.m_bodyContactCountBuffer, this.m_internalAllocatedCapacity, capacity, stuck);
    this.m_consecutiveContactStepsBuffer.data = this.ReallocateBuffer4(this.m_consecutiveContactStepsBuffer, this.m_internalAllocatedCapacity, capacity, stuck);
    this.m_positionBuffer.data = this.ReallocateBuffer4(this.m_positionBuffer, this.m_internalAllocatedCapacity, capacity, false);
    this.m_velocityBuffer.data = this.ReallocateBuffer4(this.m_velocityBuffer, this.m_internalAllocatedCapacity, capacity, false);
    this.m_forceBuffer = this.ReallocateBuffer5(this.m_forceBuffer, 0, this.m_internalAllocatedCapacity, capacity, false);
    this.m_weightBuffer = this.ReallocateBuffer5(this.m_weightBuffer, 0, this.m_internalAllocatedCapacity, capacity, false);
    this.m_staticPressureBuffer = this.ReallocateBuffer5(this.m_staticPressureBuffer, 0, this.m_internalAllocatedCapacity, capacity, true);
    this.m_accumulationBuffer = this.ReallocateBuffer5(this.m_accumulationBuffer, 0, this.m_internalAllocatedCapacity, capacity, false);
    this.m_accumulation2Buffer = this.ReallocateBuffer5(this.m_accumulation2Buffer, 0, this.m_internalAllocatedCapacity, capacity, true);
    this.m_depthBuffer = this.ReallocateBuffer5(this.m_depthBuffer, 0, this.m_internalAllocatedCapacity, capacity, true);
    this.m_colorBuffer.data = this.ReallocateBuffer4(this.m_colorBuffer, this.m_internalAllocatedCapacity, capacity, true);
    this.m_groupBuffer = this.ReallocateBuffer5(this.m_groupBuffer, 0, this.m_internalAllocatedCapacity, capacity, false);
    this.m_userDataBuffer.data = this.ReallocateBuffer4(this.m_userDataBuffer, this.m_internalAllocatedCapacity, capacity, true);
    this.m_expirationTimeBuffer.data = this.ReallocateBuffer4(this.m_expirationTimeBuffer, this.m_internalAllocatedCapacity, capacity, true);
    this.m_indexByExpirationTimeBuffer.data = this.ReallocateBuffer4(this.m_indexByExpirationTimeBuffer, this.m_internalAllocatedCapacity, capacity, false);
    this.m_internalAllocatedCapacity = capacity;
  }
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2ParticleGroupDef} groupDef
 * @param {box2d.b2Transform} xf
 * @param {box2d.b2Vec2} p
 */
box2d.b2ParticleSystem.prototype.CreateParticleForGroup = function(groupDef, xf, p) {
  var particleDef = new box2d.b2ParticleDef();
  particleDef.flags = groupDef.flags;
  ///  particleDef.position = b2Mul(xf, p);
  box2d.b2Mul_X_V2(xf, p, particleDef.position);
  ///  particleDef.velocity =
  ///    groupDef.linearVelocity +
  ///    b2Cross(groupDef.angularVelocity,
  ///        particleDef.position - groupDef.position);
  box2d.b2Add_V2_V2(
    groupDef.linearVelocity,
    box2d.b2Cross_S_V2(
      groupDef.angularVelocity,
      box2d.b2Sub_V2_V2(
        particleDef.position,
        groupDef.position,
        box2d.b2Vec2.s_t0
      ),
      box2d.b2Vec2.s_t0
    ),
    particleDef.velocity
  );
  particleDef.color.Copy(groupDef.color);
  particleDef.lifetime = groupDef.lifetime;
  particleDef.userData = groupDef.userData;
  this.CreateParticle(particleDef);
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2Shape} shape
 * @param {box2d.b2ParticleGroupDef} groupDef
 * @param {box2d.b2Transform} xf
 */
box2d.b2ParticleSystem.prototype.CreateParticlesStrokeShapeForGroup = function(shape, groupDef, xf) {
  var s_edge = box2d.b2ParticleSystem.prototype.CreateParticlesStrokeShapeForGroup.s_edge;
  var s_d = box2d.b2ParticleSystem.prototype.CreateParticlesStrokeShapeForGroup.s_d;
  var s_p = box2d.b2ParticleSystem.prototype.CreateParticlesStrokeShapeForGroup.s_p;
  var stride = groupDef.stride;
  if (stride === 0) {
    stride = this.GetParticleStride();
  }
  var positionOnEdge = 0;
  var childCount = shape.GetChildCount();
  for (var childIndex = 0; childIndex < childCount; childIndex++) {
    /** @type {box2d.b2EdgeShape} */
    var edge = null;
    if (shape.GetType() === box2d.b2ShapeType.e_edgeShape) {
      edge = /** @type {box2d.b2EdgeShape} */ (shape);
    } else {
      box2d.b2Assert(shape.GetType() === box2d.b2ShapeType.e_chainShape);
      edge = s_edge;
      shape.GetChildEdge(edge, childIndex);
    }
    var d = box2d.b2Sub_V2_V2(edge.m_vertex2, edge.m_vertex1, s_d);
    var edgeLength = d.Length();

    while (positionOnEdge < edgeLength) {
      ///  b2Vec2 p = edge.m_vertex1 + positionOnEdge / edgeLength * d;
      var p = box2d.b2AddMul_V2_S_V2(edge.m_vertex1, positionOnEdge / edgeLength, d, s_p);
      this.CreateParticleForGroup(groupDef, xf, p);
      positionOnEdge += stride;
    }
    positionOnEdge -= edgeLength;
  }
}
box2d.b2ParticleSystem.prototype.CreateParticlesStrokeShapeForGroup.s_edge = new box2d.b2EdgeShape();
box2d.b2ParticleSystem.prototype.CreateParticlesStrokeShapeForGroup.s_d = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.CreateParticlesStrokeShapeForGroup.s_p = new box2d.b2Vec2();

/**
 * @export
 * @return {void}
 * @param {box2d.b2Shape} shape
 * @param {box2d.b2ParticleGroupDef} groupDef
 * @param {box2d.b2Transform} xf
 */
box2d.b2ParticleSystem.prototype.CreateParticlesFillShapeForGroup = function(shape, groupDef, xf) {
  var s_aabb = box2d.b2ParticleSystem.prototype.CreateParticlesFillShapeForGroup.s_aabb;
  var s_p = box2d.b2ParticleSystem.prototype.CreateParticlesFillShapeForGroup.s_p;
  var stride = groupDef.stride;
  if (stride === 0) {
    stride = this.GetParticleStride();
  }
  ///  b2Transform identity;
  /// identity.SetIdentity();
  var identity = box2d.b2Transform.IDENTITY;
  var aabb = s_aabb;
  box2d.b2Assert(shape.GetChildCount() === 1);
  shape.ComputeAABB(aabb, identity, 0);
  for (var y = Math.floor(aabb.lowerBound.y / stride) * stride; y < aabb.upperBound.y; y += stride) {
    for (var x = Math.floor(aabb.lowerBound.x / stride) * stride; x < aabb.upperBound.x; x += stride) {
      var p = s_p.Set(x, y);
      if (shape.TestPoint(identity, p)) {
        this.CreateParticleForGroup(groupDef, xf, p);
      }
    }
  }
}
box2d.b2ParticleSystem.prototype.CreateParticlesFillShapeForGroup.s_aabb = new box2d.b2AABB();
box2d.b2ParticleSystem.prototype.CreateParticlesFillShapeForGroup.s_p = new box2d.b2Vec2();

/**
 * @export
 * @return {void}
 * @param {box2d.b2Shape} shape
 * @param {box2d.b2ParticleGroupDef} groupDef
 * @param {box2d.b2Transform} xf
 */
box2d.b2ParticleSystem.prototype.CreateParticlesWithShapeForGroup = function(shape, groupDef, xf) {
  switch (shape.GetType()) {
    case box2d.b2ShapeType.e_edgeShape:
    case box2d.b2ShapeType.e_chainShape:
      this.CreateParticlesStrokeShapeForGroup(shape, groupDef, xf);
      break;
    case box2d.b2ShapeType.e_polygonShape:
    case box2d.b2ShapeType.e_circleShape:
      this.CreateParticlesFillShapeForGroup(shape, groupDef, xf);
      break;
    default:
      box2d.b2Assert(false);
      break;
  }
}

/**
 * @constructor
 * @extends {box2d.b2Shape}
 */
box2d.b2ParticleSystem.CompositeShape = function(shapes, shapeCount) {
  this.m_shapes = shapes;
  this.m_shapeCount = shapeCount;
}

goog.inherits(box2d.b2ParticleSystem.CompositeShape, box2d.b2Shape);

/**
 * @type {Array.<box2d.b2Shape>}
 */
box2d.b2ParticleSystem.CompositeShape.prototype.m_shapes = null;

/**
 * @type {number}
 */
box2d.b2ParticleSystem.CompositeShape.prototype.m_shapeCount = 0;

/**
 * @return {box2d.b2Shape}
 */
box2d.b2ParticleSystem.CompositeShape.prototype.Clone = function() {
  box2d.b2Assert(false);
  return null;
}

/**
 * @return {number}
 */
box2d.b2ParticleSystem.CompositeShape.prototype.GetChildCount = function() {
  return 1;
}

/**
 * @see box2d.b2Shape::TestPoint
 * @export
 * @return {boolean}
 * @param {box2d.b2Transform} xf
 * @param {box2d.b2Vec2} p
 */
box2d.b2ParticleSystem.CompositeShape.prototype.TestPoint = function(xf, p) {
  for (var i = 0; i < this.m_shapeCount; i++) {
    if (this.m_shapes[i].TestPoint(xf, p)) {
      return true;
    }
  }
  return false;
}

/**
 * @see b2Shape::ComputeDistance
 * @export
 * @return {number}
 * @param {box2d.b2Transform} xf
 * @param {box2d.b2Vec2} p
 * @param {box2d.b2Vec2} normal
 * @param {number} childIndex
 */
box2d.b2ParticleSystem.CompositeShape.prototype.ComputeDistance = function(xf, p, normal, childIndex) {
  box2d.b2Assert(false);
  return 0;
}

/**
 * Implement box2d.b2Shape.
 * @export
 * @return {boolean}
 * @param {box2d.b2RayCastOutput} output
 * @param {box2d.b2RayCastInput} input
 * @param {box2d.b2Transform} xf
 * @param {number} childIndex
 */
box2d.b2ParticleSystem.CompositeShape.prototype.RayCast = function(output, input, xf, childIndex) {
  box2d.b2Assert(false);
  return false;
}

/**
 * @see box2d.b2Shape::ComputeAABB
 * @export
 * @return {void}
 * @param {box2d.b2AABB} aabb
 * @param {box2d.b2Transform} xf
 * @param {number} childIndex
 */
box2d.b2ParticleSystem.CompositeShape.prototype.ComputeAABB = function(aabb, xf, childIndex) {
  var s_subaabb = new box2d.b2AABB();
  aabb.lowerBound.x = +box2d.b2_maxFloat;
  aabb.lowerBound.y = +box2d.b2_maxFloat;
  aabb.upperBound.x = -box2d.b2_maxFloat;
  aabb.upperBound.y = -box2d.b2_maxFloat;
  box2d.b2Assert(childIndex === 0);
  for (var i = 0; i < this.m_shapeCount; i++) {
    var childCount = this.m_shapes[i].GetChildCount();
    for (var j = 0; j < childCount; j++) {
      var subaabb = s_subaabb;
      this.m_shapes[i].ComputeAABB(subaabb, xf, j);
      aabb.Combine1(subaabb);
    }
  }
}

/**
 * @see box2d.b2Shape::ComputeMass
 * @export
 * @return {void}
 * @param {box2d.b2MassData} massData
 * @param {number} density
 */
box2d.b2ParticleSystem.CompositeShape.prototype.ComputeMass = function(massData, density) {
  box2d.b2Assert(false);
}

/**
 * @export
 * @return {void}
 * @param {Array.<box2d.b2Shape>} shapes
 * @param {number} shapeCount
 * @param {box2d.b2ParticleGroupDef} groupDef
 * @param {box2d.b2Transform} xf
 */
box2d.b2ParticleSystem.prototype.CreateParticlesWithShapesForGroup = function(shapes, shapeCount, groupDef, xf) {
  var compositeShape = new box2d.b2ParticleSystem.CompositeShape(shapes, shapeCount);
  this.CreateParticlesFillShapeForGroup(compositeShape, groupDef, xf);
}

/**
 * @export
 * @return {number}
 * @param {number} oldIndex
 * @param {box2d.b2ParticleGroup} group
 */
box2d.b2ParticleSystem.prototype.CloneParticle = function(oldIndex, group) {
  var def = new box2d.b2ParticleDef();
  def.flags = this.m_flagsBuffer.data[oldIndex];
  def.position.Copy(this.m_positionBuffer.data[oldIndex]);
  def.velocity.Copy(this.m_velocityBuffer.data[oldIndex]);
  if (this.m_colorBuffer.data) {
    def.color.Copy(this.m_colorBuffer.data[oldIndex]);
  }
  if (this.m_userDataBuffer.data) {
    def.userData = this.m_userDataBuffer.data[oldIndex];
  }
  def.group = group;
  var newIndex = this.CreateParticle(def);
  if (this.m_handleIndexBuffer.data) {
    var handle = this.m_handleIndexBuffer.data[oldIndex];
    if (handle) handle.SetIndex(newIndex);
    this.m_handleIndexBuffer.data[newIndex] = handle;
    this.m_handleIndexBuffer.data[oldIndex] = null;
  }
  if (this.m_lastBodyContactStepBuffer.data) {
    this.m_lastBodyContactStepBuffer.data[newIndex] =
      this.m_lastBodyContactStepBuffer.data[oldIndex];
  }
  if (this.m_bodyContactCountBuffer.data) {
    this.m_bodyContactCountBuffer.data[newIndex] =
      this.m_bodyContactCountBuffer.data[oldIndex];
  }
  if (this.m_consecutiveContactStepsBuffer.data) {
    this.m_consecutiveContactStepsBuffer.data[newIndex] =
      this.m_consecutiveContactStepsBuffer.data[oldIndex];
  }
  if (this.m_hasForce) {
    this.m_forceBuffer[newIndex].Copy(this.m_forceBuffer[oldIndex]);
  }
  if (this.m_staticPressureBuffer) {
    this.m_staticPressureBuffer[newIndex] = this.m_staticPressureBuffer[oldIndex];
  }
  if (this.m_depthBuffer) {
    this.m_depthBuffer[newIndex] = this.m_depthBuffer[oldIndex];
  }
  if (this.m_expirationTimeBuffer.data) {
    this.m_expirationTimeBuffer.data[newIndex] =
      this.m_expirationTimeBuffer.data[oldIndex];
  }
  return newIndex;
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2ParticleGroup} group
 * @param {boolean=} callDestructionListener
 */
box2d.b2ParticleSystem.prototype.DestroyParticlesInGroup = function(group, callDestructionListener) {
  for (var i = group.m_firstIndex; i < group.m_lastIndex; i++) {
    this.DestroyParticle(i, callDestructionListener);
  }
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2ParticleGroup} group
 */
box2d.b2ParticleSystem.prototype.DestroyParticleGroup = function(group) {
  box2d.b2Assert(this.m_groupCount > 0);
  box2d.b2Assert(group !== null);

  if (this.m_world.m_destructionListener) {
    this.m_world.m_destructionListener.SayGoodbyeParticleGroup(group);
  }

  this.SetGroupFlags(group, 0);
  for (var i = group.m_firstIndex; i < group.m_lastIndex; i++) {
    this.m_groupBuffer[i] = null;
  }

  if (group.m_prev) {
    group.m_prev.m_next = group.m_next;
  }
  if (group.m_next) {
    group.m_next.m_prev = group.m_prev;
  }
  if (group === this.m_groupList) {
    this.m_groupList = group.m_next;
  }

  --this.m_groupCount;
}

/**
 * @return {boolean}
 * @param {number} flags
 * @param {box2d.b2ParticleGroup} group
 */
box2d.b2ParticleSystem.ParticleCanBeConnected = function(flags, group) {
  return ((flags & (box2d.b2ParticleFlag.b2_wallParticle | box2d.b2ParticleFlag.b2_springParticle | box2d.b2ParticleFlag.b2_elasticParticle)) !== 0) ||
    ((group !== null) && ((group.GetGroupFlags() & box2d.b2ParticleGroupFlag.b2_rigidParticleGroup) !== 0));
}

/**
 * @return {void}
 * @param {number} firstIndex
 * @param {number} lastIndex
 * @param {box2d.b2ParticleSystem.ConnectionFilter} filter
 */
box2d.b2ParticleSystem.prototype.UpdatePairsAndTriads = function(firstIndex, lastIndex, filter) {
  var s_dab = box2d.b2ParticleSystem.prototype.UpdatePairsAndTriads.s_dab;
  var s_dbc = box2d.b2ParticleSystem.prototype.UpdatePairsAndTriads.s_dbc;
  var s_dca = box2d.b2ParticleSystem.prototype.UpdatePairsAndTriads.s_dca;
  var pos_data = this.m_positionBuffer.data;
  // Create pairs or triads.
  // All particles in each pair/triad should satisfy the following:
  // * firstIndex <= index < lastIndex
  // * don't have b2_zombieParticle
  // * ParticleCanBeConnected returns true
  // * ShouldCreatePair/ShouldCreateTriad returns true
  // Any particles in each pair/triad should satisfy the following:
  // * filter.IsNeeded returns true
  // * have one of k_pairFlags/k_triadsFlags
  box2d.b2Assert(firstIndex <= lastIndex);
  var particleFlags = 0;
  for (var i = firstIndex; i < lastIndex; i++) {
    particleFlags |= this.m_flagsBuffer.data[i];
  }
  if (particleFlags & box2d.b2ParticleSystem.k_pairFlags) {
    for (var k = 0; k < this.m_contactBuffer.count; k++) {
      var contact = this.m_contactBuffer.data[k];
      var a = contact.indexA;
      var b = contact.indexB;
      var af = this.m_flagsBuffer.data[a];
      var bf = this.m_flagsBuffer.data[b];
      var groupA = this.m_groupBuffer[a];
      var groupB = this.m_groupBuffer[b];
      if (a >= firstIndex && a < lastIndex &&
        b >= firstIndex && b < lastIndex &&
        !((af | bf) & box2d.b2ParticleFlag.b2_zombieParticle) &&
        ((af | bf) & box2d.b2ParticleSystem.k_pairFlags) &&
        (filter.IsNecessary(a) || filter.IsNecessary(b)) &&
        box2d.b2ParticleSystem.ParticleCanBeConnected(af, groupA) &&
        box2d.b2ParticleSystem.ParticleCanBeConnected(bf, groupB) &&
        filter.ShouldCreatePair(a, b)) {
        ///  b2ParticlePair& pair = m_pairBuffer.Append();
        var pair = this.m_pairBuffer.data[this.m_pairBuffer.Append()];
        pair.indexA = a;
        pair.indexB = b;
        pair.flags = contact.flags;
        pair.strength = box2d.b2Min(
          groupA ? groupA.m_strength : 1,
          groupB ? groupB.m_strength : 1);
        pair.distance = box2d.b2Distance(pos_data[a], pos_data[b]);
      }
      ///  std::stable_sort(m_pairBuffer.Begin(), m_pairBuffer.End(), ComparePairIndices);
      box2d.std_stable_sort(this.m_pairBuffer.data, 0, this.m_pairBuffer.count, box2d.b2ParticleSystem.ComparePairIndices);
      ///  m_pairBuffer.Unique(MatchPairIndices);
      this.m_pairBuffer.Unique(box2d.b2ParticleSystem.MatchPairIndices);
    }
  }
  if (particleFlags & box2d.b2ParticleSystem.k_triadFlags) {
    var diagram = new box2d.b2VoronoiDiagram(lastIndex - firstIndex);
    var necessary_count = 0;
    for (var i = firstIndex; i < lastIndex; i++) {
      var flags = this.m_flagsBuffer.data[i];
      var group = this.m_groupBuffer[i];
      if (!(flags & box2d.b2ParticleFlag.b2_zombieParticle) &&
        box2d.b2ParticleSystem.ParticleCanBeConnected(flags, group)) {
        if (filter.IsNecessary(i)) {
          ++necessary_count;
        }
        diagram.AddGenerator(pos_data[i], i, filter.IsNecessary(i));
      }
    }
    if (necessary_count === 0) {
      //debugger;
      for (var i = firstIndex; i < lastIndex; i++) {
        filter.IsNecessary(i);
      }
    }
    var stride = this.GetParticleStride();
    diagram.Generate(stride / 2, stride * 2);
    var system = this;
    var callback = function UpdateTriadsCallback(a, b, c) {
      var af = system.m_flagsBuffer.data[a];
      var bf = system.m_flagsBuffer.data[b];
      var cf = system.m_flagsBuffer.data[c];
      if (((af | bf | cf) & box2d.b2ParticleSystem.k_triadFlags) &&
        filter.ShouldCreateTriad(a, b, c)) {
        var pa = pos_data[a];
        var pb = pos_data[b];
        var pc = pos_data[c];
        var dab = box2d.b2Sub_V2_V2(pa, pb, s_dab);
        var dbc = box2d.b2Sub_V2_V2(pb, pc, s_dbc);
        var dca = box2d.b2Sub_V2_V2(pc, pa, s_dca);
        var maxDistanceSquared = box2d.b2_maxTriadDistanceSquared * system.m_squaredDiameter;
        if (box2d.b2Dot_V2_V2(dab, dab) > maxDistanceSquared ||
          box2d.b2Dot_V2_V2(dbc, dbc) > maxDistanceSquared ||
          box2d.b2Dot_V2_V2(dca, dca) > maxDistanceSquared) {
          return;
        }
        var groupA = system.m_groupBuffer[a];
        var groupB = system.m_groupBuffer[b];
        var groupC = system.m_groupBuffer[c];
        ///b2ParticleTriad& triad = m_system.m_triadBuffer.Append();
        var triad = system.m_triadBuffer.data[system.m_triadBuffer.Append()];
        triad.indexA = a;
        triad.indexB = b;
        triad.indexC = c;
        triad.flags = af | bf | cf;
        triad.strength = box2d.b2Min(box2d.b2Min(
            groupA ? groupA.m_strength : 1,
            groupB ? groupB.m_strength : 1),
          groupC ? groupC.m_strength : 1);
        ///  var midPoint = box2d.b2Mul_S_V2(1.0 / 3.0, box2d.b2Add_V2_V2(pa, box2d.b2Add_V2_V2(pb, pc, new box2d.b2Vec2()), new box2d.b2Vec2()), new box2d.b2Vec2());
        var midPoint_x = (pa.x + pb.x + pc.x) / 3.0;
        var midPoint_y = (pa.y + pb.y + pc.y) / 3.0;
        ///  triad.pa = box2d.b2Sub_V2_V2(pa, midPoint, new box2d.b2Vec2());
        triad.pa.x = pa.x - midPoint_x;
        triad.pa.y = pa.y - midPoint_y;
        ///  triad.pb = box2d.b2Sub_V2_V2(pb, midPoint, new box2d.b2Vec2());
        triad.pb.x = pb.x - midPoint_x;
        triad.pb.y = pb.y - midPoint_y;
        ///  triad.pc = box2d.b2Sub_V2_V2(pc, midPoint, new box2d.b2Vec2());
        triad.pc.x = pc.x - midPoint_x;
        triad.pc.y = pc.y - midPoint_y;
        triad.ka = -box2d.b2Dot_V2_V2(dca, dab);
        triad.kb = -box2d.b2Dot_V2_V2(dab, dbc);
        triad.kc = -box2d.b2Dot_V2_V2(dbc, dca);
        triad.s = box2d.b2Cross_V2_V2(pa, pb) + box2d.b2Cross_V2_V2(pb, pc) + box2d.b2Cross_V2_V2(pc, pa);
      }
    };
    diagram.GetNodes(callback);
    ///  std::stable_sort(m_triadBuffer.Begin(), m_triadBuffer.End(), CompareTriadIndices);
    box2d.std_stable_sort(this.m_triadBuffer.data, 0, this.m_triadBuffer.count, box2d.b2ParticleSystem.CompareTriadIndices);
    ///  m_triadBuffer.Unique(MatchTriadIndices);
    this.m_triadBuffer.Unique(box2d.b2ParticleSystem.MatchTriadIndices);
  }
}
box2d.b2ParticleSystem.prototype.UpdatePairsAndTriads.s_dab = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.UpdatePairsAndTriads.s_dbc = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.UpdatePairsAndTriads.s_dca = new box2d.b2Vec2();

/**
 * @constructor
 * @extends {box2d.b2ParticleSystem.ConnectionFilter}
 */
box2d.b2ParticleSystem.ReactiveFilter = function(flagsBuffer) {
  this.m_flagsBuffer = flagsBuffer;
}

goog.inherits(box2d.b2ParticleSystem.ReactiveFilter, box2d.b2ParticleSystem.ConnectionFilter);

/**
 * @type {box2d.b2ParticleSystem.UserOverridableBuffer<number>}
 */
box2d.b2ParticleSystem.ReactiveFilter.prototype.m_flagsBuffer = null;

/**
 * @return {boolean}
 * @param {number} index
 */
box2d.b2ParticleSystem.ReactiveFilter.prototype.IsNecessary = function(index) {
  return (this.m_flagsBuffer[index] & box2d.b2ParticleFlag.b2_reactiveParticle) !== 0;
}

/**
 * @return {void}
 */
box2d.b2ParticleSystem.prototype.UpdatePairsAndTriadsWithReactiveParticles = function() {
  var filter = new box2d.b2ParticleSystem.ReactiveFilter(this.m_flagsBuffer);
  this.UpdatePairsAndTriads(0, this.m_count, filter);

  for (var i = 0; i < this.m_count; i++) {
    this.m_flagsBuffer.data[i] &= ~box2d.b2ParticleFlag.b2_reactiveParticle;
  }
  this.m_allParticleFlags &= ~box2d.b2ParticleFlag.b2_reactiveParticle;
}

/**
 * @return {boolean}
 * @param {box2d.b2ParticlePair} a
 * @param {box2d.b2ParticlePair} b
 */
box2d.b2ParticleSystem.ComparePairIndices = function(a, b) {
  var diffA = a.indexA - b.indexA;
  if (diffA !== 0) return diffA < 0;
  return a.indexB < b.indexB;
}

/**
 * @return {boolean}
 * @param {box2d.b2ParticlePair} a
 * @param {box2d.b2ParticlePair} b
 */
box2d.b2ParticleSystem.MatchPairIndices = function(a, b) {
  return a.indexA === b.indexA && a.indexB === b.indexB;
}

/**
 * @return {boolean}
 * @param {box2d.b2ParticleTriad} a
 * @param {box2d.b2ParticleTriad} b
 */
box2d.b2ParticleSystem.CompareTriadIndices = function(a, b) {
  var diffA = a.indexA - b.indexA;
  if (diffA !== 0) return diffA < 0;
  var diffB = a.indexB - b.indexB;
  if (diffB !== 0) return diffB < 0;
  return a.indexC < b.indexC;
}

/**
 * @return {boolean}
 * @param {box2d.b2ParticleTriad} a
 * @param {box2d.b2ParticleTriad} b
 */
box2d.b2ParticleSystem.MatchTriadIndices = function(a, b) {
  return a.indexA === b.indexA && a.indexB === b.indexB && a.indexC === b.indexC;
}

/**
 * @return {void}
 * @param {box2d.b2ParticleGroup} group
 * @param {Array.<box2d.b2ParticleSystem.ParticleListNode>}
 *      nodeBuffer
 */
box2d.b2ParticleSystem.InitializeParticleLists = function(group, nodeBuffer) {
  var bufferIndex = group.GetBufferIndex();
  var particleCount = group.GetParticleCount();
  for (var i = 0; i < particleCount; i++) {
    /*ParticleListNode**/
    var node = nodeBuffer[i];
    node.list = node;
    node.next = null;
    node.count = 1;
    node.index = i + bufferIndex;
  }
}

/**
 * @return {void}
 * @param {box2d.b2ParticleGroup} group
 * @param {Array.<box2d.b2ParticleSystem.ParticleListNode>}
 *      nodeBuffer
 */
box2d.b2ParticleSystem.prototype.MergeParticleListsInContact = function(group, nodeBuffer) {
  var bufferIndex = group.GetBufferIndex();
  for (var k = 0; k < this.m_contactBuffer.count; k++) {
    /*const b2ParticleContact&*/
    var contact = this.m_contactBuffer.data[k];
    var a = contact.indexA;
    var b = contact.indexB;
    if (!group.ContainsParticle(a) || !group.ContainsParticle(b)) {
      continue;
    }
    /*ParticleListNode**/
    var listA = nodeBuffer[a - bufferIndex].list;
    /*ParticleListNode**/
    var listB = nodeBuffer[b - bufferIndex].list;
    if (listA === listB) {
      continue;
    }
    // To minimize the cost of insertion, make sure listA is longer than
    // listB.
    if (listA.count < listB.count) {
      var _tmp = listA;
      listA = listB;
      listB = _tmp; //b2Swap(listA, listB);
    }
    box2d.b2Assert(listA.count >= listB.count);
    box2d.b2ParticleSystem.MergeParticleLists(listA, listB);
  }
}

/**
 * @return {void}
 * @param {box2d.b2ParticleSystem.ParticleListNode} listA
 * @param {box2d.b2ParticleSystem.ParticleListNode} listB
 */
box2d.b2ParticleSystem.MergeParticleLists = function(listA, listB) {
  // Insert listB between index 0 and 1 of listA
  // Example:
  //     listA => a1 => a2 => a3 => null
  //     listB => b1 => b2 => null
  // to
  //     listA => listB => b1 => b2 => a1 => a2 => a3 => null
  box2d.b2Assert(listA !== listB);
  for ( /*ParticleListNode**/ var b = listB;;) {
    b.list = listA;
    /*ParticleListNode**/
    var nextB = b.next;
    if (nextB) {
      b = nextB;
    } else {
      b.next = listA.next;
      break;
    }
  }
  listA.next = listB;
  listA.count += listB.count;
  listB.count = 0;
}

/**
 * @return {box2d.b2ParticleSystem.ParticleListNode}
 * @param {box2d.b2ParticleGroup} group
 * @param {Array.<box2d.b2ParticleSystem.ParticleListNode>}
 *      nodeBuffer
 */
box2d.b2ParticleSystem.FindLongestParticleList = function(group, nodeBuffer) {
  var particleCount = group.GetParticleCount();
  /*ParticleListNode**/
  var result = nodeBuffer[0];
  for (var i = 0; i < particleCount; i++) {
    /*ParticleListNode**/
    var node = nodeBuffer[i];
    if (result.count < node.count) {
      result = node;
    }
  }
  return result;
}

/**
 * @return {void}
 * @param {box2d.b2ParticleGroup} group
 * @param {Array.<box2d.b2ParticleSystem.ParticleListNode>}
 *      nodeBuffer
 * @param {box2d.b2ParticleSystem.ParticleListNode}
 *      survivingList
 */
box2d.b2ParticleSystem.prototype.MergeZombieParticleListNodes = function(group, nodeBuffer, survivingList) {
  var particleCount = group.GetParticleCount();
  for (var i = 0; i < particleCount; i++) {
    /*ParticleListNode**/
    var node = nodeBuffer[i];
    if (node !== survivingList &&
      (this.m_flagsBuffer.data[node.index] & box2d.b2ParticleFlag.b2_zombieParticle)) {
      box2d.b2ParticleSystem.MergeParticleListAndNode(survivingList, node);
    }
  }
}

/**
 * @return {void}
 * @param {box2d.b2ParticleSystem.ParticleListNode} list
 * @param {box2d.b2ParticleSystem.ParticleListNode} node
 */
box2d.b2ParticleSystem.MergeParticleListAndNode = function(list, node) {
  // Insert node between index 0 and 1 of list
  // Example:
  //     list => a1 => a2 => a3 => null
  //     node => null
  // to
  //     list => node => a1 => a2 => a3 => null
  box2d.b2Assert(node !== list);
  box2d.b2Assert(node.list === node);
  box2d.b2Assert(node.count === 1);
  node.list = list;
  node.next = list.next;
  list.next = node;
  list.count++;
  node.count = 0;
}

/**
 * @return {void}
 * @param {box2d.b2ParticleGroup} group
 * @param {Array.<box2d.b2ParticleSystem.ParticleListNode>}
 *      nodeBuffer
 * @param {box2d.b2ParticleSystem.ParticleListNode}
 *      survivingList
 */
box2d.b2ParticleSystem.prototype.CreateParticleGroupsFromParticleList = function(group, nodeBuffer, survivingList) {
  var particleCount = group.GetParticleCount();
  var def = new box2d.b2ParticleGroupDef();
  def.groupFlags = group.GetGroupFlags();
  def.userData = group.GetUserData();
  for (var i = 0; i < particleCount; i++) {
    /*ParticleListNode**/
    var list = nodeBuffer[i];
    if (!list.count || list === survivingList) {
      continue;
    }
    box2d.b2Assert(list.list === list);
    /*b2ParticleGroup**/
    var newGroup = this.CreateParticleGroup(def);
    for ( /*ParticleListNode**/ var node = list; node; node = node.next) {
      var oldIndex = node.index;
      var flags = this.m_flagsBuffer.data[oldIndex];
      box2d.b2Assert(!(flags & box2d.b2ParticleFlag.b2_zombieParticle));
      var newIndex = this.CloneParticle(oldIndex, newGroup);
      this.m_flagsBuffer.data[oldIndex] |= box2d.b2ParticleFlag.b2_zombieParticle;
      node.index = newIndex;
    }
  }
}

/**
 * @return {void}
 * @param {box2d.b2ParticleGroup} group
 * @param {Array.<box2d.b2ParticleSystem.ParticleListNode>}
 *      nodeBuffer
 */
box2d.b2ParticleSystem.prototype.UpdatePairsAndTriadsWithParticleList = function(group, nodeBuffer) {
  var bufferIndex = group.GetBufferIndex();
  // Update indices in pairs and triads. If an index belongs to the group,
  // replace it with the corresponding value in nodeBuffer.
  // Note that nodeBuffer is allocated only for the group and the index should
  // be shifted by bufferIndex.
  for (var k = 0; k < this.m_pairBuffer.count; k++) {
    var pair = this.m_pairBuffer.data[k];
    var a = pair.indexA;
    var b = pair.indexB;
    if (group.ContainsParticle(a)) {
      pair.indexA = nodeBuffer[a - bufferIndex].index;
    }
    if (group.ContainsParticle(b)) {
      pair.indexB = nodeBuffer[b - bufferIndex].index;
    }
  }
  for (var k = 0; k < this.m_triadBuffer.count; k++) {
    var triad = this.m_triadBuffer.data[k];
    var a = triad.indexA;
    var b = triad.indexB;
    var c = triad.indexC;
    if (group.ContainsParticle(a)) {
      triad.indexA = nodeBuffer[a - bufferIndex].index;
    }
    if (group.ContainsParticle(b)) {
      triad.indexB = nodeBuffer[b - bufferIndex].index;
    }
    if (group.ContainsParticle(c)) {
      triad.indexC = nodeBuffer[c - bufferIndex].index;
    }
  }
}

/**
 * @return {void}
 */
box2d.b2ParticleSystem.prototype.ComputeDepth = function() {
  ///  b2ParticleContact* contactGroups = (b2ParticleContact*) this.m_world.m_stackAllocator.Allocate(sizeof(b2ParticleContact) * this.m_contactBuffer.GetCount());
  var contactGroups = []; // TODO: static
  var contactGroupsCount = 0;
  for (var k = 0; k < this.m_contactBuffer.count; k++) {
    var contact = this.m_contactBuffer.data[k];
    var a = contact.indexA;
    var b = contact.indexB;
    var groupA = this.m_groupBuffer[a];
    var groupB = this.m_groupBuffer[b];
    if (groupA && groupA === groupB &&
      (groupA.m_groupFlags & box2d.b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth)) {
      contactGroups[contactGroupsCount++] = contact;
    }
  }
  ///  b2ParticleGroup** groupsToUpdate = (b2ParticleGroup**) this.m_world.m_stackAllocator.Allocate(sizeof(b2ParticleGroup*) * this.m_groupCount);
  var groupsToUpdate = []; // TODO: static
  var groupsToUpdateCount = 0;
  for (var group = this.m_groupList; group; group = group.GetNext()) {
    if (group.m_groupFlags & box2d.b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth) {
      groupsToUpdate[groupsToUpdateCount++] = group;
      this.SetGroupFlags(group,
        group.m_groupFlags &
        ~box2d.b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth);
      for (var i = group.m_firstIndex; i < group.m_lastIndex; i++) {
        this.m_accumulationBuffer[i] = 0;
      }
    }
  }
  // Compute sum of weight of contacts except between different groups.
  for (var k = 0; k < contactGroupsCount; k++) {
    var contact = contactGroups[k];
    var a = contact.indexA;
    var b = contact.indexB;
    var w = contact.weight;
    this.m_accumulationBuffer[a] += w;
    this.m_accumulationBuffer[b] += w;
  }

  box2d.b2Assert(this.m_depthBuffer !== null);
  for (var i = 0; i < groupsToUpdateCount; i++) {
    var group = groupsToUpdate[i];
    for (var i = group.m_firstIndex; i < group.m_lastIndex; i++) {
      var w = this.m_accumulationBuffer[i];
      this.m_depthBuffer[i] = w < 0.8 ? 0 : box2d.b2_maxFloat;
    }
  }
  // The number of iterations is equal to particle number from the deepest
  // particle to the nearest surface particle, and in general it is smaller
  // than sqrt of total particle number.
  ///  int32 iterationCount = (int32)b2Sqrt((float)m_count);
  var iterationCount = box2d.b2Sqrt(this.m_count) >> 0;
  for (var t = 0; t < iterationCount; t++) {
    var updated = false;
    for (var k = 0; k < contactGroupsCount; k++) {
      var contact = contactGroups[k];
      var a = contact.indexA;
      var b = contact.indexB;
      var r = 1 - contact.weight;
      ///  float32& ap0 = m_depthBuffer[a];
      var ap0 = this.m_depthBuffer[a];
      ///  float32& bp0 = m_depthBuffer[b];
      var bp0 = this.m_depthBuffer[b];
      var ap1 = bp0 + r;
      var bp1 = ap0 + r;
      if (ap0 > ap1) {
        ///  ap0 = ap1;
        this.m_depthBuffer[a] = ap1;
        updated = true;
      }
      if (bp0 > bp1) {
        ///  bp0 = bp1;
        this.m_depthBuffer[b] = bp1;
        updated = true;
      }
    }
    if (!updated) {
      break;
    }
  }
  for (var i = 0; i < groupsToUpdateCount; i++) {
    var group = groupsToUpdate[i];
    for (var i = group.m_firstIndex; i < group.m_lastIndex; i++) {
      if (this.m_depthBuffer[i] < box2d.b2_maxFloat) {
        this.m_depthBuffer[i] *= this.m_particleDiameter;
      } else {
        this.m_depthBuffer[i] = 0;
      }
    }
  }
  ///  this.m_world.m_stackAllocator.Free(groupsToUpdate);
  ///  this.m_world.m_stackAllocator.Free(contactGroups);
}

/**
 * @return {box2d.b2ParticleSystem.InsideBoundsEnumerator}
 * @param {box2d.b2AABB} aabb
 */
box2d.b2ParticleSystem.prototype.GetInsideBoundsEnumerator = function(aabb) {
  var lowerTag = box2d.b2ParticleSystem.computeTag(this.m_inverseDiameter * aabb.lowerBound.x - 1,
    this.m_inverseDiameter * aabb.lowerBound.y - 1);
  var upperTag = box2d.b2ParticleSystem.computeTag(this.m_inverseDiameter * aabb.upperBound.x + 1,
    this.m_inverseDiameter * aabb.upperBound.y + 1);
  ///  const Proxy* beginProxy = m_proxyBuffer.Begin();
  var beginProxy = 0;
  ///  const Proxy* endProxy = m_proxyBuffer.End();
  var endProxy = this.m_proxyBuffer.count;
  ///  const Proxy* firstProxy = std::lower_bound(beginProxy, endProxy, lowerTag);
  var firstProxy = box2d.std_lower_bound(this.m_proxyBuffer.data, beginProxy, endProxy, lowerTag, box2d.b2ParticleSystem.Proxy.CompareProxyTag);
  ///  const Proxy* lastProxy = std::upper_bound(firstProxy, endProxy, upperTag);
  var lastProxy = box2d.std_upper_bound(this.m_proxyBuffer.data, beginProxy, endProxy, upperTag, box2d.b2ParticleSystem.Proxy.CompareTagProxy);

  box2d.b2Assert(beginProxy <= firstProxy);
  box2d.b2Assert(firstProxy <= lastProxy);
  box2d.b2Assert(lastProxy <= endProxy);

  return new box2d.b2ParticleSystem.InsideBoundsEnumerator(this, lowerTag, upperTag, firstProxy, lastProxy);
}

/**
 * @return {void}
 */
box2d.b2ParticleSystem.prototype.UpdateAllParticleFlags = function() {
  this.m_allParticleFlags = 0;
  for (var i = 0; i < this.m_count; i++) {
    this.m_allParticleFlags |= this.m_flagsBuffer.data[i];
  }
  this.m_needsUpdateAllParticleFlags = false;
}

/**
 * @return {void}
 */
box2d.b2ParticleSystem.prototype.UpdateAllGroupFlags = function() {
  this.m_allGroupFlags = 0;
  for (var group = this.m_groupList; group; group = group.GetNext()) {
    this.m_allGroupFlags |= group.m_groupFlags;
  }
  this.m_needsUpdateAllGroupFlags = false;
}

/**
 * @return {void}
 * @param {number} a
 * @param {number} b
 * @param {box2d.b2GrowableBuffer<box2d.b2ParticleContact>}
 *      contacts
 */
box2d.b2ParticleSystem.prototype.AddContact = function(a, b, contacts) {
  var s_d = box2d.b2ParticleSystem.prototype.AddContact.s_d;
  var pos_data = this.m_positionBuffer.data;
  box2d.b2Assert(contacts === this.m_contactBuffer);
  ///  b2Vec2 d = m_positionBuffer.data[b] - m_positionBuffer.data[a];
  var d = box2d.b2Sub_V2_V2(pos_data[b], pos_data[a], s_d);
  var distBtParticlesSq = box2d.b2Dot_V2_V2(d, d);
  if (distBtParticlesSq < this.m_squaredDiameter) {
    var invD = box2d.b2InvSqrt(distBtParticlesSq);
    if (!isFinite(invD)) {
      invD = 1.98177537e+019;
    }
    ///  b2ParticleContact& contact = contacts.Append();
    var contact = this.m_contactBuffer.data[this.m_contactBuffer.Append()];
    contact.indexA = a;
    contact.indexB = b;
    contact.flags = this.m_flagsBuffer.data[a] | this.m_flagsBuffer.data[b];
    contact.weight = 1 - distBtParticlesSq * invD * this.m_inverseDiameter;
    ///  contact.SetNormal(invD * d);
    box2d.b2Mul_S_V2(invD, d, contact.normal);
  }
}
box2d.b2ParticleSystem.prototype.AddContact.s_d = new box2d.b2Vec2();

/**
 * @return {void}
 * @param {box2d.b2GrowableBuffer<box2d.b2ParticleContact>}
 *      contacts
 */
box2d.b2ParticleSystem.prototype.FindContacts_Reference = function(contacts) {
  box2d.b2Assert(contacts === this.m_contactBuffer);
  var beginProxy = 0;
  var endProxy = this.m_proxyBuffer.count;

  this.m_contactBuffer.count = 0;
  for (var a = beginProxy, c = beginProxy; a < endProxy; a++) {
    var rightTag = box2d.b2ParticleSystem.computeRelativeTag(this.m_proxyBuffer.data[a].tag, 1, 0);
    for (var b = a + 1; b < endProxy; b++) {
      if (rightTag < this.m_proxyBuffer.data[b].tag) break;
      this.AddContact(this.m_proxyBuffer.data[a].index, this.m_proxyBuffer.data[b].index, this.m_contactBuffer);
    }
    var bottomLeftTag = box2d.b2ParticleSystem.computeRelativeTag(this.m_proxyBuffer.data[a].tag, -1, 1);
    for (; c < endProxy; c++) {
      if (bottomLeftTag <= this.m_proxyBuffer.data[c].tag) break;
    }
    var bottomRightTag = box2d.b2ParticleSystem.computeRelativeTag(this.m_proxyBuffer.data[a].tag, 1, 1);
    for (var b = c; b < endProxy; b++) {
      if (bottomRightTag < this.m_proxyBuffer.data[b].tag) break;
      this.AddContact(this.m_proxyBuffer.data[a].index, this.m_proxyBuffer.data[b].index, this.m_contactBuffer);
    }
  }
}

///  void ReorderForFindContact(FindContactInput* reordered, int alignedCount) const;
///  void GatherChecksOneParticle(const uint32 bound, const int startIndex, const int particleIndex, int* nextUncheckedIndex, b2GrowableBuffer<FindContactCheck>& checks) const;
///  void GatherChecks(b2GrowableBuffer<FindContactCheck>& checks) const;
///  void FindContacts_Simd(b2GrowableBuffer<b2ParticleContact>& contacts) const;

/**
 * @return {void}
 * @param {box2d.b2GrowableBuffer<box2d.b2ParticleContact>}
 *      contacts
 */
box2d.b2ParticleSystem.prototype.FindContacts = function(contacts) {
  this.FindContacts_Reference(contacts);
}

///  static void UpdateProxyTags(const uint32* const tags, b2GrowableBuffer<Proxy>& proxies);
///  static bool ProxyBufferHasIndex(int32 index, const Proxy* const a, int count);
///  static int NumProxiesWithSameTag(const Proxy* const a, const Proxy* const b, int count);
///  static bool AreProxyBuffersTheSame(const b2GrowableBuffer<Proxy>& a, const b2GrowableBuffer<Proxy>& b);

/**
 * @return {void}
 * @param {box2d.b2GrowableBuffer<box2d.b2ParticleSystem.Proxy>}
 *      proxies
 */
box2d.b2ParticleSystem.prototype.UpdateProxies_Reference = function(proxies) {
  box2d.b2Assert(proxies === this.m_proxyBuffer);
  var pos_data = this.m_positionBuffer.data;
  var inv_diam = this.m_inverseDiameter;
  for (var k = 0; k < this.m_proxyBuffer.count; ++k) {
    var proxy = this.m_proxyBuffer.data[k];
    var i = proxy.index;
    var p = pos_data[i];
    proxy.tag = box2d.b2ParticleSystem.computeTag(inv_diam * p.x, inv_diam * p.y);
  }
}

///  void UpdateProxies_Simd(b2GrowableBuffer<Proxy>& proxies) const;

/**
 * @return {void}
 * @param {box2d.b2GrowableBuffer<box2d.b2ParticleSystem.Proxy>}
 *      proxies
 */
box2d.b2ParticleSystem.prototype.UpdateProxies = function(proxies) {
  this.UpdateProxies_Reference(proxies);
}

/**
 * @return {void}
 * @param {box2d.b2GrowableBuffer<box2d.b2ParticleSystem.Proxy>}
 *      proxies
 */
box2d.b2ParticleSystem.prototype.SortProxies = function(proxies) {
  box2d.b2Assert(proxies === this.m_proxyBuffer);

  ///  std::sort(proxies.Begin(), proxies.End());
  box2d.std_sort(this.m_proxyBuffer.data, 0, this.m_proxyBuffer.count, box2d.b2ParticleSystem.Proxy.CompareProxyProxy);
}

/**
 * @return {void}
 * @param {box2d.b2GrowableBuffer<box2d.b2ParticleContact>}
 *      contacts
 */
box2d.b2ParticleSystem.prototype.FilterContacts = function(contacts) {
  // Optionally filter the contact.
  var contactFilter = this.GetParticleContactFilter();
  if (contactFilter === null)
    return;

  /// contacts.RemoveIf(b2ParticleContactRemovePredicate(this, contactFilter));
  box2d.b2Assert(contacts === this.m_contactBuffer);
  var system = this;
  var predicate = function(contact) {
    return (contact.flags & box2d.b2ParticleFlag.b2_particleContactFilterParticle) && !contactFilter.ShouldCollideParticleParticle(system, contact.indexA, contact.indexB);
  }
  this.m_contactBuffer.RemoveIf(predicate);
}

/**
 * @return {void}
 * @param {box2d.b2ParticleSystem.b2ParticlePairSet}
 *      particlePairs
 */
box2d.b2ParticleSystem.prototype.NotifyContactListenerPreContact = function(particlePairs) {
  var contactListener = this.GetParticleContactListener();
  if (contactListener === null)
    return;

  ///  particlePairs.Initialize(m_contactBuffer.Begin(), m_contactBuffer.GetCount(), GetFlagsBuffer());
  particlePairs.Initialize(this.m_contactBuffer, this.m_flagsBuffer);

  throw new Error(); // TODO: notify
}

/**
 * @return {void}
 * @param {box2d.b2ParticleSystem.b2ParticlePairSet}
 *      particlePairs
 */
box2d.b2ParticleSystem.prototype.NotifyContactListenerPostContact = function(particlePairs) {
  var contactListener = this.GetParticleContactListener();
  if (contactListener === null)
    return;

  // Loop through all new contacts, reporting any new ones, and
  // "invalidating" the ones that still exist.
  ///  const b2ParticleContact* const endContact = m_contactBuffer.End();
  ///  for (b2ParticleContact* contact = m_contactBuffer.Begin(); contact < endContact; ++contact)
  for (var k = 0; k < this.m_contactBuffer.count; ++k) {
    var contact = this.m_contactBuffer.data[k];
    ///  ParticlePair pair;
    ///  pair.first = contact.GetIndexA();
    ///  pair.second = contact.GetIndexB();
    ///  const int32 itemIndex = particlePairs.Find(pair);
    var itemIndex = -1; // TODO
    if (itemIndex >= 0) {
      // Already touching, ignore this contact.
      particlePairs.Invalidate(itemIndex);
    } else {
      // Just started touching, inform the listener.
      contactListener.BeginContactParticleParticle(this, contact);
    }
  }

  // Report particles that are no longer touching.
  // That is, any pairs that were not invalidated above.
  ///  const int32 pairCount = particlePairs.GetCount();
  ///  const ParticlePair* const pairs = particlePairs.GetBuffer();
  ///  const int8* const valid = particlePairs.GetValidBuffer();
  ///  for (int32 i = 0; i < pairCount; ++i)
  ///  {
  ///    if (valid[i])
  ///    {
  ///      contactListener.EndContactParticleParticle(this, pairs[i].first, pairs[i].second);
  ///    }
  ///  }

  throw new Error(); // TODO: notify
}

/**
 * @return {boolean}
 * @param {box2d.b2ParticleContact} contact
 */
box2d.b2ParticleSystem.b2ParticleContactIsZombie = function(contact) {
  return (contact.flags & box2d.b2ParticleFlag.b2_zombieParticle) === box2d.b2ParticleFlag.b2_zombieParticle;
}

/**
 * @return {void}
 * @param {boolean} exceptZombie
 */
box2d.b2ParticleSystem.prototype.UpdateContacts = function(exceptZombie) {
  this.UpdateProxies(this.m_proxyBuffer);
  this.SortProxies(this.m_proxyBuffer);

  ///  b2ParticlePairSet particlePairs(&this.m_world.m_stackAllocator);
  var particlePairs = new box2d.b2ParticleSystem.b2ParticlePairSet(); // TODO: static
  this.NotifyContactListenerPreContact(particlePairs);

  this.FindContacts(this.m_contactBuffer);
  this.FilterContacts(this.m_contactBuffer);

  this.NotifyContactListenerPostContact(particlePairs);

  if (exceptZombie) {
    this.m_contactBuffer.RemoveIf(box2d.b2ParticleSystem.b2ParticleContactIsZombie);
  }
}

/**
 * @return {void}
 * @param {box2d.b2ParticleSystem.FixtureParticleSet} fixtureSet
 */
box2d.b2ParticleSystem.prototype.NotifyBodyContactListenerPreContact = function(fixtureSet) {
  var contactListener = this.GetFixtureContactListener();
  if (contactListener === null)
    return;

  ///  fixtureSet.Initialize(m_bodyContactBuffer.Begin(), m_bodyContactBuffer.GetCount(), GetFlagsBuffer());
  fixtureSet.Initialize(this.m_bodyContactBuffer, this.m_flagsBuffer);

  throw new Error(); // TODO: notify
}

/**
 * @return {void}
 * @param {box2d.b2ParticleSystem.FixtureParticleSet} fixtureSet
 */
box2d.b2ParticleSystem.prototype.NotifyBodyContactListenerPostContact = function(fixtureSet) {
  var contactListener = this.GetFixtureContactListener();
  if (contactListener === null)
    return;

  // Loop through all new contacts, reporting any new ones, and
  // "invalidating" the ones that still exist.
  ///  for (b2ParticleBodyContact* contact = m_bodyContactBuffer.Begin(); contact !== m_bodyContactBuffer.End(); ++contact)
  for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
    var contact = this.m_bodyContactBuffer.data[k];
    box2d.b2Assert(contact !== null);
    ///  FixtureParticle fixtureParticleToFind;
    ///  fixtureParticleToFind.first = contact.fixture;
    ///  fixtureParticleToFind.second = contact.index;
    ///  const int32 index = fixtureSet.Find(fixtureParticleToFind);
    var index = -1; // TODO
    if (index >= 0) {
      // Already touching remove this from the set.
      fixtureSet.Invalidate(index);
    } else {
      // Just started touching, report it!
      contactListener.BeginContactFixtureParticle(this, contact);
    }
  }

  // If the contact listener is enabled, report all fixtures that are no
  // longer in contact with particles.
  ///  const FixtureParticle* const fixtureParticles = fixtureSet.GetBuffer();
  ///  const int8* const fixtureParticlesValid = fixtureSet.GetValidBuffer();
  ///  const int32 fixtureParticleCount = fixtureSet.GetCount();
  ///  for (int32 i = 0; i < fixtureParticleCount; ++i)
  ///  {
  ///    if (fixtureParticlesValid[i])
  ///    {
  ///      const FixtureParticle* const fixtureParticle = &fixtureParticles[i];
  ///      contactListener.EndContactFixtureParticle(fixtureParticle.first, this, fixtureParticle.second);
  ///    }
  ///  }

  throw new Error(); // TODO: notify
}

/**
 * @constructor
 * @extends {box2d.b2FixtureParticleQueryCallback}
 * @param {box2d.b2ParticleSystem} system
 * @param {box2d.b2ContactFilter} contactFilter
 */
box2d.b2ParticleSystem.UpdateBodyContactsCallback = function(system, contactFilter) {
  box2d.b2FixtureParticleQueryCallback.call(this, system); // base class constructor
  this.m_contactFilter = contactFilter;
}

goog.inherits(box2d.b2ParticleSystem.UpdateBodyContactsCallback, box2d.b2FixtureParticleQueryCallback);

/**
 * @export
 * @return {boolean}
 * @param {box2d.b2Fixture} fixture
 * @param {box2d.b2ParticleSystem} particleSystem
 * @param {number} particleIndex
 */
box2d.b2ParticleSystem.UpdateBodyContactsCallback.prototype.ShouldCollideFixtureParticle = function(fixture, particleSystem, particleIndex) {
  // Call the contact filter if it's set, to determine whether to
  // filter this contact.  Returns true if contact calculations should
  // be performed, false otherwise.
  if (this.m_contactFilter) {
    var flags = this.m_system.GetFlagsBuffer();
    if (flags[particleIndex] & box2d.b2ParticleFlag.b2_fixtureContactFilterParticle) {
      return this.m_contactFilter.ShouldCollideFixtureParticle(fixture, this.m_system, particleIndex);
    }
  }
  return true;
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2Fixture} fixture
 * @param {number} childIndex
 * @param {number} a
 */
box2d.b2ParticleSystem.UpdateBodyContactsCallback.prototype.ReportFixtureAndParticle = function(fixture, childIndex, a) {
  var s_n = box2d.b2ParticleSystem.UpdateBodyContactsCallback.prototype.ReportFixtureAndParticle.s_n;
  var s_rp = box2d.b2ParticleSystem.UpdateBodyContactsCallback.prototype.ReportFixtureAndParticle.s_rp;
  var ap = this.m_system.m_positionBuffer.data[a];
  var n = s_n;
  var d = fixture.ComputeDistance(ap, n, childIndex);
  if (d < this.m_system.m_particleDiameter && this.ShouldCollideFixtureParticle(fixture, this.m_system, a)) {
    var b = fixture.GetBody();
    var bp = b.GetWorldCenter();
    var bm = b.GetMass();
    var bI = b.GetInertia() - bm * b.GetLocalCenter().LengthSquared();
    var invBm = bm > 0 ? 1 / bm : 0;
    var invBI = bI > 0 ? 1 / bI : 0;
    var invAm =
      this.m_system.m_flagsBuffer.data[a] &
      box2d.b2ParticleFlag.b2_wallParticle ? 0 : this.m_system.GetParticleInvMass();
    ///  b2Vec2 rp = ap - bp;
    var rp = box2d.b2Sub_V2_V2(ap, bp, s_rp);
    var rpn = box2d.b2Cross_V2_V2(rp, n);
    var invM = invAm + invBm + invBI * rpn * rpn;

    ///  b2ParticleBodyContact& contact = m_system.m_bodyContactBuffer.Append();
    var contact = this.m_system.m_bodyContactBuffer.data[this.m_system.m_bodyContactBuffer.Append()];
    contact.index = a;
    contact.body = b;
    contact.fixture = fixture;
    contact.weight = 1 - d * this.m_system.m_inverseDiameter;
    ///  contact.normal = -n;
    contact.normal.Copy(n.SelfNeg());
    contact.mass = invM > 0 ? 1 / invM : 0;
    this.m_system.DetectStuckParticle(a);
  }
}
box2d.b2ParticleSystem.UpdateBodyContactsCallback.prototype.ReportFixtureAndParticle.s_n = new box2d.b2Vec2();
box2d.b2ParticleSystem.UpdateBodyContactsCallback.prototype.ReportFixtureAndParticle.s_rp = new box2d.b2Vec2();

/**
 * @return {void}
 */
box2d.b2ParticleSystem.prototype.UpdateBodyContacts = function() {
  var s_aabb = box2d.b2ParticleSystem.prototype.UpdateBodyContacts.s_aabb;

  // If the particle contact listener is enabled, generate a set of
  // fixture / particle contacts.
  ///  FixtureParticleSet fixtureSet(&m_world.m_stackAllocator);
  var fixtureSet = new box2d.b2ParticleSystem.FixtureParticleSet(); // TODO: static
  this.NotifyBodyContactListenerPreContact(fixtureSet);

  if (this.m_stuckThreshold > 0) {
    var particleCount = this.GetParticleCount();
    for (var i = 0; i < particleCount; i++) {
      // Detect stuck particles, see comment in
      // b2ParticleSystem::DetectStuckParticle()
      this.m_bodyContactCountBuffer.data[i] = 0;
      if (this.m_timestamp > (this.m_lastBodyContactStepBuffer.data[i] + 1)) {
        this.m_consecutiveContactStepsBuffer.data[i] = 0;
      }
    }
  }
  this.m_bodyContactBuffer.SetCount(0);
  this.m_stuckParticleBuffer.SetCount(0);

  var aabb = s_aabb;
  this.ComputeAABB(aabb);

  var callback = new box2d.b2ParticleSystem.UpdateBodyContactsCallback(this, this.GetFixtureContactFilter());
  this.m_world.QueryAABB(callback, aabb);

  if (this.m_def.strictContactCheck) {
    this.RemoveSpuriousBodyContacts();
  }

  this.NotifyBodyContactListenerPostContact(fixtureSet);
}
box2d.b2ParticleSystem.prototype.UpdateBodyContacts.s_aabb = new box2d.b2AABB();

/**
 * @export
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.Solve = function(step) {
  var s_subStep = box2d.b2ParticleSystem.prototype.Solve.s_subStep;
  if (this.m_count === 0) {
    return;
  }
  // If particle lifetimes are enabled, destroy particles that are too old.
  if (this.m_expirationTimeBuffer.data) {
    this.SolveLifetimes(step);
  }
  if (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_zombieParticle) {
    this.SolveZombie();
  }
  if (this.m_needsUpdateAllParticleFlags) {
    this.UpdateAllParticleFlags();
  }
  if (this.m_needsUpdateAllGroupFlags) {
    this.UpdateAllGroupFlags();
  }
  if (this.m_paused) {
    return;
  }
  for (this.m_iterationIndex = 0; this.m_iterationIndex < step.particleIterations; this.m_iterationIndex++) {
    ++this.m_timestamp;
    var subStep = s_subStep.Copy(step);
    subStep.dt /= step.particleIterations;
    subStep.inv_dt *= step.particleIterations;
    this.UpdateContacts(false);
    this.UpdateBodyContacts();
    this.ComputeWeight();
    if (this.m_allGroupFlags & box2d.b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth) {
      this.ComputeDepth();
    }
    if (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_reactiveParticle) {
      this.UpdatePairsAndTriadsWithReactiveParticles();
    }
    if (this.m_hasForce) {
      this.SolveForce(subStep);
    }
    if (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_viscousParticle) {
      this.SolveViscous();
    }
    if (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_repulsiveParticle) {
      this.SolveRepulsive(subStep);
    }
    if (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_powderParticle) {
      this.SolvePowder(subStep);
    }
    if (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_tensileParticle) {
      this.SolveTensile(subStep);
    }
    if (this.m_allGroupFlags & box2d.b2ParticleGroupFlag.b2_solidParticleGroup) {
      this.SolveSolid(subStep);
    }
    if (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_colorMixingParticle) {
      this.SolveColorMixing();
    }
    this.SolveGravity(subStep);
    if (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_staticPressureParticle) {
      this.SolveStaticPressure(subStep);
    }
    this.SolvePressure(subStep);
    this.SolveDamping(subStep);
    if (this.m_allParticleFlags & box2d.b2ParticleSystem.k_extraDampingFlags) {
      this.SolveExtraDamping();
    }
    // SolveElastic and SolveSpring refer the current velocities for
    // numerical stability, they should be called as late as possible.
    if (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_elasticParticle) {
      this.SolveElastic(subStep);
    }
    if (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_springParticle) {
      this.SolveSpring(subStep);
    }
    this.LimitVelocity(subStep);
    if (this.m_allGroupFlags & box2d.b2ParticleGroupFlag.b2_rigidParticleGroup) {
      this.SolveRigidDamping();
    }
    if (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_barrierParticle) {
      this.SolveBarrier(subStep);
    }
    // SolveCollision, SolveRigid and SolveWall should be called after
    // other force functions because they may require particles to have
    // specific velocities.
    this.SolveCollision(subStep);
    if (this.m_allGroupFlags & box2d.b2ParticleGroupFlag.b2_rigidParticleGroup) {
      this.SolveRigid(subStep);
    }
    if (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_wallParticle) {
      this.SolveWall();
    }
    // The particle positions can be updated only at the end of substep.
    for (var i = 0; i < this.m_count; i++) {
      ///  m_positionBuffer.data[i] += subStep.dt * m_velocityBuffer.data[i];
      this.m_positionBuffer.data[i].SelfMulAdd(subStep.dt, this.m_velocityBuffer.data[i]);
    }
  }
}
box2d.b2ParticleSystem.prototype.Solve.s_subStep = new box2d.b2TimeStep();

/**
 * @constructor
 * @extends {box2d.b2FixtureParticleQueryCallback}
 * @param {box2d.b2ParticleSystem} system
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.SolveCollisionCallback = function(system, step) {
  box2d.b2FixtureParticleQueryCallback.call(this, system); // base class constructor
  this.m_step = step;
}

goog.inherits(box2d.b2ParticleSystem.SolveCollisionCallback, box2d.b2FixtureParticleQueryCallback);

/**
 * @export
 * @return {void}
 * @param {box2d.b2Fixture} fixture
 * @param {number} childIndex
 * @param {number} a
 */
box2d.b2ParticleSystem.SolveCollisionCallback.prototype.ReportFixtureAndParticle = function(fixture, childIndex, a) {
  var s_p1 = box2d.b2ParticleSystem.SolveCollisionCallback.prototype.ReportFixtureAndParticle.s_p1;
  var s_output = box2d.b2ParticleSystem.SolveCollisionCallback.prototype.ReportFixtureAndParticle.s_output;
  var s_input = box2d.b2ParticleSystem.SolveCollisionCallback.prototype.ReportFixtureAndParticle.s_input;
  var s_p = box2d.b2ParticleSystem.SolveCollisionCallback.prototype.ReportFixtureAndParticle.s_p;
  var s_v = box2d.b2ParticleSystem.SolveCollisionCallback.prototype.ReportFixtureAndParticle.s_v;
  var s_f = box2d.b2ParticleSystem.SolveCollisionCallback.prototype.ReportFixtureAndParticle.s_f;

  var body = fixture.GetBody();
  var ap = this.m_system.m_positionBuffer.data[a];
  var av = this.m_system.m_velocityBuffer.data[a];
  var output = s_output;
  var input = s_input;
  if (this.m_system.m_iterationIndex === 0) {
    // Put 'ap' in the local space of the previous frame
    ///  b2Vec2 p1 = b2MulT(body.m_xf0, ap);
    var p1 = box2d.b2MulT_X_V2(body.m_xf0, ap, s_p1);
    if (fixture.GetShape().GetType() === box2d.b2ShapeType.e_circleShape) {
      // Make relative to the center of the circle
      ///  p1 -= body.GetLocalCenter();
      p1.SelfSub(body.GetLocalCenter());
      // Re-apply rotation about the center of the circle
      ///  p1 = b2Mul(body.m_xf0.q, p1);
      box2d.b2Mul_R_V2(body.m_xf0.q, p1, p1);
      // Subtract rotation of the current frame
      ///  p1 = b2MulT(body.m_xf.q, p1);
      box2d.b2MulT_R_V2(body.m_xf.q, p1, p1);
      // Return to local space
      ///  p1 += body.GetLocalCenter();
      p1.SelfAdd(body.GetLocalCenter());
    }
    // Return to global space and apply rotation of current frame
    ///  input.p1 = b2Mul(body.m_xf, p1);
    box2d.b2Mul_X_V2(body.m_xf, p1, input.p1);
  } else {
    ///  input.p1 = ap;
    input.p1.Copy(ap);
  }
  ///  input.p2 = ap + m_step.dt * av;
  box2d.b2AddMul_V2_S_V2(ap, this.m_step.dt, av, input.p2);
  input.maxFraction = 1;
  if (fixture.RayCast(output, input, childIndex)) {
    var n = output.normal;
    ///  b2Vec2 p = (1 - output.fraction) * input.p1 + output.fraction * input.p2 + b2_linearSlop * n;
    var p = s_p;
    p.x = (1 - output.fraction) * input.p1.x + output.fraction * input.p2.x + box2d.b2_linearSlop * n.x;
    p.y = (1 - output.fraction) * input.p1.y + output.fraction * input.p2.y + box2d.b2_linearSlop * n.y;
    ///  b2Vec2 v = m_step.inv_dt * (p - ap);
    var v = s_v;
    v.x = this.m_step.inv_dt * (p.x - ap.x);
    v.y = this.m_step.inv_dt * (p.y - ap.y);
    ///  m_system.m_velocityBuffer.data[a] = v;
    this.m_system.m_velocityBuffer.data[a].Copy(v);
    ///  b2Vec2 f = m_step.inv_dt * m_system.GetParticleMass() * (av - v);
    var f = s_f;
    f.x = this.m_step.inv_dt * this.m_system.GetParticleMass() * (av.x - v.x);
    f.y = this.m_step.inv_dt * this.m_system.GetParticleMass() * (av.y - v.y);
    this.m_system.ParticleApplyForce(a, f);
  }
}
box2d.b2ParticleSystem.SolveCollisionCallback.prototype.ReportFixtureAndParticle.s_p1 = new box2d.b2Vec2();
box2d.b2ParticleSystem.SolveCollisionCallback.prototype.ReportFixtureAndParticle.s_output = new box2d.b2RayCastOutput();
box2d.b2ParticleSystem.SolveCollisionCallback.prototype.ReportFixtureAndParticle.s_input = new box2d.b2RayCastInput();
box2d.b2ParticleSystem.SolveCollisionCallback.prototype.ReportFixtureAndParticle.s_p = new box2d.b2Vec2();
box2d.b2ParticleSystem.SolveCollisionCallback.prototype.ReportFixtureAndParticle.s_v = new box2d.b2Vec2();
box2d.b2ParticleSystem.SolveCollisionCallback.prototype.ReportFixtureAndParticle.s_f = new box2d.b2Vec2();

/**
 * @export
 * @return {boolean}
 * @param {box2d.b2ParticleSystem} system
 * @param {number} index
 */
box2d.b2ParticleSystem.SolveCollisionCallback.prototype.ReportParticle = function(system, index) {
  return false;
}

/**
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.SolveCollision = function(step) {
  var s_aabb = box2d.b2ParticleSystem.prototype.SolveCollision.s_aabb;
  var pos_data = this.m_positionBuffer.data;
  var vel_data = this.m_velocityBuffer.data;

  // This function detects particles which are crossing boundary of bodies
  // and modifies velocities of them so that they will move just in front of
  // boundary. This function function also applies the reaction force to
  // bodies as precisely as the numerical stability is kept.
  var aabb = s_aabb;
  aabb.lowerBound.x = +box2d.b2_maxFloat;
  aabb.lowerBound.y = +box2d.b2_maxFloat;
  aabb.upperBound.x = -box2d.b2_maxFloat;
  aabb.upperBound.y = -box2d.b2_maxFloat;
  for (var i = 0; i < this.m_count; i++) {
    var v = vel_data[i];
    var p1 = pos_data[i];
    ///  var p2 = p1 + step.dt * v;
    var p2_x = p1.x + step.dt * v.x;
    var p2_y = p1.y + step.dt * v.y;
    ///  aabb.lowerBound = b2Min(aabb.lowerBound, b2Min(p1, p2));
    aabb.lowerBound.x = box2d.b2Min(aabb.lowerBound.x, box2d.b2Min(p1.x, p2_x));
    aabb.lowerBound.y = box2d.b2Min(aabb.lowerBound.y, box2d.b2Min(p1.y, p2_y));
    ///  aabb.upperBound = b2Max(aabb.upperBound, b2Max(p1, p2));
    aabb.upperBound.x = box2d.b2Max(aabb.upperBound.x, box2d.b2Max(p1.x, p2_x));
    aabb.upperBound.y = box2d.b2Max(aabb.upperBound.y, box2d.b2Max(p1.y, p2_y));
  }
  var callback = new box2d.b2ParticleSystem.SolveCollisionCallback(this, step);
  this.m_world.QueryAABB(callback, aabb);
}
box2d.b2ParticleSystem.prototype.SolveCollision.s_aabb = new box2d.b2AABB();

/**
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.LimitVelocity = function(step) {
  var vel_data = this.m_velocityBuffer.data;
  var criticalVelocitySquared = this.GetCriticalVelocitySquared(step);
  for (var i = 0; i < this.m_count; i++) {
    var v = vel_data[i];
    var v2 = box2d.b2Dot_V2_V2(v, v);
    if (v2 > criticalVelocitySquared) {
      ///  v *= b2Sqrt(criticalVelocitySquared / v2);
      v.SelfMul(box2d.b2Sqrt(criticalVelocitySquared / v2));
    }
  }
}

/**
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.SolveGravity = function(step) {
  var s_gravity = box2d.b2ParticleSystem.prototype.SolveGravity.s_gravity;
  var vel_data = this.m_velocityBuffer.data;
  //b2Vec2 gravity = step.dt * m_def.gravityScale * m_world.GetGravity();
  var gravity = box2d.b2Mul_S_V2(step.dt * this.m_def.gravityScale, this.m_world.GetGravity(), s_gravity);
  for (var i = 0; i < this.m_count; i++) {
    vel_data[i].SelfAdd(gravity);
  }
}
box2d.b2ParticleSystem.prototype.SolveGravity.s_gravity = new box2d.b2Vec2();

/**
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.SolveBarrier = function(step) {
  var s_aabb = box2d.b2ParticleSystem.prototype.SolveBarrier.s_aabb;
  var s_va = box2d.b2ParticleSystem.prototype.SolveBarrier.s_va;
  var s_vb = box2d.b2ParticleSystem.prototype.SolveBarrier.s_vb;
  var s_pba = box2d.b2ParticleSystem.prototype.SolveBarrier.s_pba;
  var s_vba = box2d.b2ParticleSystem.prototype.SolveBarrier.s_vba;
  var s_vc = box2d.b2ParticleSystem.prototype.SolveBarrier.s_vc;
  var s_pca = box2d.b2ParticleSystem.prototype.SolveBarrier.s_pca;
  var s_vca = box2d.b2ParticleSystem.prototype.SolveBarrier.s_vca;
  var s_qba = box2d.b2ParticleSystem.prototype.SolveBarrier.s_qba;
  var s_qca = box2d.b2ParticleSystem.prototype.SolveBarrier.s_qca;
  var s_dv = box2d.b2ParticleSystem.prototype.SolveBarrier.s_dv;
  var s_f = box2d.b2ParticleSystem.prototype.SolveBarrier.s_f;
  var pos_data = this.m_positionBuffer.data;
  var vel_data = this.m_velocityBuffer.data;
  // If a particle is passing between paired barrier particles,
  // its velocity will be decelerated to avoid passing.
  for (var i = 0; i < this.m_count; i++) {
    var flags = this.m_flagsBuffer.data[i];
    ///  if ((flags & box2d.b2ParticleSystem.k_barrierWallFlags) === box2d.b2ParticleSystem.k_barrierWallFlags)
    if ((flags & box2d.b2ParticleSystem.k_barrierWallFlags) !== 0) {
      vel_data[i].SetZero();
    }
  }
  var tmax = box2d.b2_barrierCollisionTime * step.dt;
  var mass = this.GetParticleMass();
  for (var k = 0; k < this.m_pairBuffer.count; k++) {
    var pair = this.m_pairBuffer.data[k];
    if (pair.flags & box2d.b2ParticleFlag.b2_barrierParticle) {
      var a = pair.indexA;
      var b = pair.indexB;
      var pa = pos_data[a];
      var pb = pos_data[b];
      /// b2AABB aabb;
      var aabb = s_aabb;
      ///  aabb.lowerBound = b2Min(pa, pb);
      box2d.b2Min_V2_V2(pa, pb, aabb.lowerBound);
      ///  aabb.upperBound = b2Max(pa, pb);
      box2d.b2Max_V2_V2(pa, pb, aabb.upperBound);
      var aGroup = this.m_groupBuffer[a];
      var bGroup = this.m_groupBuffer[b];
      ///  b2Vec2 va = GetLinearVelocity(aGroup, a, pa);
      var va = this.GetLinearVelocity(aGroup, a, pa, s_va);
      ///  b2Vec2 vb = GetLinearVelocity(bGroup, b, pb);
      var vb = this.GetLinearVelocity(bGroup, b, pb, s_vb);
      ///  b2Vec2 pba = pb - pa;
      var pba = box2d.b2Sub_V2_V2(pb, pa, s_pba);
      ///  b2Vec2 vba = vb - va;
      var vba = box2d.b2Sub_V2_V2(vb, va, s_vba);
      ///  InsideBoundsEnumerator enumerator = GetInsideBoundsEnumerator(aabb);
      var enumerator = this.GetInsideBoundsEnumerator(aabb);
      var c;
      while ((c = enumerator.GetNext()) >= 0) {
        var pc = pos_data[c];
        var cGroup = this.m_groupBuffer[c];
        if (aGroup !== cGroup && bGroup !== cGroup) {
          ///  b2Vec2 vc = GetLinearVelocity(cGroup, c, pc);
          var vc = this.GetLinearVelocity(cGroup, c, pc, s_vc);
          // Solve the equation below:
          //   (1-s)*(pa+t*va)+s*(pb+t*vb) = pc+t*vc
          // which expresses that the particle c will pass a line
          // connecting the particles a and b at the time of t.
          // if s is between 0 and 1, c will pass between a and b.
          ///  b2Vec2 pca = pc - pa;
          var pca = box2d.b2Sub_V2_V2(pc, pa, s_pca);
          ///  b2Vec2 vca = vc - va;
          var vca = box2d.b2Sub_V2_V2(vc, va, s_vca);
          var e2 = box2d.b2Cross_V2_V2(vba, vca);
          var e1 = box2d.b2Cross_V2_V2(pba, vca) - box2d.b2Cross_V2_V2(pca, vba);
          var e0 = box2d.b2Cross_V2_V2(pba, pca);
          var s, t;
          ///  b2Vec2 qba, qca;
          var qba = s_qba,
            qca = s_qca;
          if (e2 === 0) {
            if (e1 === 0) continue;
            t = -e0 / e1;
            if (!(t >= 0 && t < tmax)) continue;
            ///  qba = pba + t * vba;
            box2d.b2AddMul_V2_S_V2(pba, t, vba, qba);
            ///  qca = pca + t * vca;
            box2d.b2AddMul_V2_S_V2(pca, t, vca, qca);
            s = box2d.b2Dot_V2_V2(qba, qca) / box2d.b2Dot_V2_V2(qba, qba);
            if (!(s >= 0 && s <= 1)) continue;
          } else {
            var det = e1 * e1 - 4 * e0 * e2;
            if (det < 0) continue;
            var sqrtDet = box2d.b2Sqrt(det);
            var t1 = (-e1 - sqrtDet) / (2 * e2);
            var t2 = (-e1 + sqrtDet) / (2 * e2);
            ///  if (t1 > t2) b2Swap(t1, t2);
            if (t1 > t2) {
              var tmp = t1;
              t1 = t2;
              t2 = tmp;
            }
            t = t1;
            ///  qba = pba + t * vba;
            box2d.b2AddMul_V2_S_V2(pba, t, vba, qba);
            ///  qca = pca + t * vca;
            box2d.b2AddMul_V2_S_V2(pca, t, vca, qca);
            ///  s = b2Dot(qba, qca) / b2Dot(qba, qba);
            s = box2d.b2Dot_V2_V2(qba, qca) / box2d.b2Dot_V2_V2(qba, qba);
            if (!(t >= 0 && t < tmax && s >= 0 && s <= 1)) {
              t = t2;
              if (!(t >= 0 && t < tmax)) continue;
              ///  qba = pba + t * vba;
              box2d.b2AddMul_V2_S_V2(pba, t, vba, qba);
              ///  qca = pca + t * vca;
              box2d.b2AddMul_V2_S_V2(pca, t, vca, qca);
              ///  s = b2Dot(qba, qca) / b2Dot(qba, qba);
              s = box2d.b2Dot_V2_V2(qba, qca) / box2d.b2Dot_V2_V2(qba, qba);
              if (!(s >= 0 && s <= 1)) continue;
            }
          }
          // Apply a force to particle c so that it will have the
          // interpolated velocity at the collision point on line ab.
          ///  b2Vec2 dv = va + s * vba - vc;
          var dv = s_dv;
          dv.x = va.x + s * vba.x - vc.x;
          dv.y = va.y + s * vba.y - vc.y;
          ///  b2Vec2 f = GetParticleMass() * dv;
          var f = box2d.b2Mul_S_V2(mass, dv, s_f);
          if (this.IsRigidGroup(cGroup)) {
            // If c belongs to a rigid group, the force will be
            // distributed in the group.
            var mass = cGroup.GetMass();
            var inertia = cGroup.GetInertia();
            if (mass > 0) {
              ///  cGroup.m_linearVelocity += 1 / mass * f;
              cGroup.m_linearVelocity.SelfMulAdd(1 / mass, f);
            }
            if (inertia > 0) {
              ///  cGroup.m_angularVelocity += b2Cross(pc - cGroup.GetCenter(), f) / inertia;
              cGroup.m_angularVelocity += box2d.b2Cross_V2_V2(
                box2d.b2Sub_V2_V2(pc, cGroup.GetCenter(), box2d.b2Vec2.s_t0),
                f) / inertia;
            }
          } else {
            ///  m_velocityBuffer.data[c] += dv;
            vel_data[c].SelfAdd(dv);
          }
          // Apply a reversed force to particle c after particle
          // movement so that momentum will be preserved.
          ///  ParticleApplyForce(c, -step.inv_dt * f);
          this.ParticleApplyForce(c, f.SelfMul(-step.inv_dt));
        }
      }
    }
  }
}
box2d.b2ParticleSystem.prototype.SolveBarrier.s_aabb = new box2d.b2AABB();
box2d.b2ParticleSystem.prototype.SolveBarrier.s_va = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveBarrier.s_vb = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveBarrier.s_pba = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveBarrier.s_vba = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveBarrier.s_vc = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveBarrier.s_pca = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveBarrier.s_vca = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveBarrier.s_qba = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveBarrier.s_qca = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveBarrier.s_dv = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveBarrier.s_f = new box2d.b2Vec2();

/**
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.SolveStaticPressure = function(step) {
  this.m_staticPressureBuffer = this.RequestBuffer(this.m_staticPressureBuffer);
  var criticalPressure = this.GetCriticalPressure(step);
  var pressurePerWeight = this.m_def.staticPressureStrength * criticalPressure;
  var maxPressure = box2d.b2_maxParticlePressure * criticalPressure;
  var relaxation = this.m_def.staticPressureRelaxation;
  /// Compute pressure satisfying the modified Poisson equation:
  ///     Sum_for_j((p_i - p_j) * w_ij) + relaxation * p_i =
  ///     pressurePerWeight * (w_i - b2_minParticleWeight)
  /// by iterating the calculation:
  ///     p_i = (Sum_for_j(p_j * w_ij) + pressurePerWeight *
  ///           (w_i - b2_minParticleWeight)) / (w_i + relaxation)
  /// where
  ///     p_i and p_j are static pressure of particle i and j
  ///     w_ij is contact weight between particle i and j
  ///     w_i is sum of contact weight of particle i
  for (var t = 0; t < this.m_def.staticPressureIterations; t++) {
    ///  memset(m_accumulationBuffer, 0, sizeof(*m_accumulationBuffer) * m_count);
    for (var i = 0; i < this.m_count; i++) {
      this.m_accumulationBuffer[i] = 0;
    }
    for (var k = 0; k < this.m_contactBuffer.count; k++) {
      var contact = this.m_contactBuffer.data[k];
      if (contact.flags & box2d.b2ParticleFlag.b2_staticPressureParticle) {
        var a = contact.indexA;
        var b = contact.indexB;
        var w = contact.weight;
        this.m_accumulationBuffer[a] += w * this.m_staticPressureBuffer[b]; // a <- b
        this.m_accumulationBuffer[b] += w * this.m_staticPressureBuffer[a]; // b <- a
      }
    }
    for (var i = 0; i < this.m_count; i++) {
      var w = this.m_weightBuffer[i];
      if (this.m_flagsBuffer.data[i] & box2d.b2ParticleFlag.b2_staticPressureParticle) {
        var wh = this.m_accumulationBuffer[i];
        var h =
          (wh + pressurePerWeight * (w - box2d.b2_minParticleWeight)) /
          (w + relaxation);
        this.m_staticPressureBuffer[i] = box2d.b2Clamp(h, 0.0, maxPressure);
      } else {
        this.m_staticPressureBuffer[i] = 0;
      }
    }
  }
}

/**
 * @return {void}
 */
box2d.b2ParticleSystem.prototype.ComputeWeight = function() {
  // calculates the sum of contact-weights for each particle
  // that means dimensionless density
  ///  memset(m_weightBuffer, 0, sizeof(*m_weightBuffer) * m_count);
  for (var k = 0; k < this.m_count; k++) {
    this.m_weightBuffer[k] = 0;
  }
  for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
    var contact = this.m_bodyContactBuffer.data[k];
    var a = contact.index;
    var w = contact.weight;
    this.m_weightBuffer[a] += w;
  }
  for (var k = 0; k < this.m_contactBuffer.count; k++) {
    var contact = this.m_contactBuffer.data[k];
    var a = contact.indexA;
    var b = contact.indexB;
    var w = contact.weight;
    this.m_weightBuffer[a] += w;
    this.m_weightBuffer[b] += w;
  }
}

/**
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.SolvePressure = function(step) {
  var s_f = box2d.b2ParticleSystem.prototype.SolvePressure.s_f;
  var pos_data = this.m_positionBuffer.data;
  var vel_data = this.m_velocityBuffer.data;
  // calculates pressure as a linear function of density
  var criticalPressure = this.GetCriticalPressure(step);
  var pressurePerWeight = this.m_def.pressureStrength * criticalPressure;
  var maxPressure = box2d.b2_maxParticlePressure * criticalPressure;
  for (var i = 0; i < this.m_count; i++) {
    var w = this.m_weightBuffer[i];
    var h = pressurePerWeight * box2d.b2Max(0.0, w - box2d.b2_minParticleWeight);
    this.m_accumulationBuffer[i] = box2d.b2Min(h, maxPressure);
  }
  // ignores particles which have their own repulsive force
  if (this.m_allParticleFlags & box2d.b2ParticleSystem.k_noPressureFlags) {
    for (var i = 0; i < this.m_count; i++) {
      if (this.m_flagsBuffer.data[i] & box2d.b2ParticleSystem.k_noPressureFlags) {
        this.m_accumulationBuffer[i] = 0;
      }
    }
  }
  // static pressure
  if (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_staticPressureParticle) {
    box2d.b2Assert(this.m_staticPressureBuffer !== null);
    for (var i = 0; i < this.m_count; i++) {
      if (this.m_flagsBuffer.data[i] & box2d.b2ParticleFlag.b2_staticPressureParticle) {
        this.m_accumulationBuffer[i] += this.m_staticPressureBuffer[i];
      }
    }
  }
  // applies pressure between each particles in contact
  var velocityPerPressure = step.dt / (this.m_def.density * this.m_particleDiameter);
  var inv_mass = this.GetParticleInvMass();
  for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
    var contact = this.m_bodyContactBuffer.data[k];
    var a = contact.index;
    var b = contact.body;
    var w = contact.weight;
    var m = contact.mass;
    var n = contact.normal;
    var p = pos_data[a];
    var h = this.m_accumulationBuffer[a] + pressurePerWeight * w;
    ///  b2Vec2 f = velocityPerPressure * w * m * h * n;
    var f = box2d.b2Mul_S_V2(velocityPerPressure * w * m * h, n, s_f);
    ///  m_velocityBuffer.data[a] -= GetParticleInvMass() * f;
    vel_data[a].SelfMulSub(inv_mass, f);
    b.ApplyLinearImpulse(f, p, true);
  }
  for (var k = 0; k < this.m_contactBuffer.count; k++) {
    var contact = this.m_contactBuffer.data[k];
    var a = contact.indexA;
    var b = contact.indexB;
    var w = contact.weight;
    var n = contact.normal;
    var h = this.m_accumulationBuffer[a] + this.m_accumulationBuffer[b];
    ///  b2Vec2 f = velocityPerPressure * w * h * n;
    var f = box2d.b2Mul_S_V2(velocityPerPressure * w * h, n, s_f);
    ///  m_velocityBuffer.data[a] -= f;
    vel_data[a].SelfSub(f);
    ///  m_velocityBuffer.data[b] += f;
    vel_data[b].SelfAdd(f);
  }
}
box2d.b2ParticleSystem.prototype.SolvePressure.s_f = new box2d.b2Vec2();

/**
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.SolveDamping = function(step) {
  var s_v = box2d.b2ParticleSystem.prototype.SolveDamping.s_v;
  var s_f = box2d.b2ParticleSystem.prototype.SolveDamping.s_f;
  var pos_data = this.m_positionBuffer.data;
  var vel_data = this.m_velocityBuffer.data;
  // reduces normal velocity of each contact
  var linearDamping = this.m_def.dampingStrength;
  var quadraticDamping = 1 / this.GetCriticalVelocity(step);
  var inv_mass = this.GetParticleInvMass();
  for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
    var contact = this.m_bodyContactBuffer.data[k];
    var a = contact.index;
    var b = contact.body;
    var w = contact.weight;
    var m = contact.mass;
    var n = contact.normal;
    var p = pos_data[a];
    ///  b2Vec2 v = b.GetLinearVelocityFromWorldPoint(p) - m_velocityBuffer.data[a];
    var v = box2d.b2Sub_V2_V2(b.GetLinearVelocityFromWorldPoint(p, box2d.b2Vec2.s_t0), vel_data[a], s_v);
    var vn = box2d.b2Dot_V2_V2(v, n);
    if (vn < 0) {
      var damping = box2d.b2Max(linearDamping * w, box2d.b2Min(-quadraticDamping * vn, 0.5));
      ///  b2Vec2 f = damping * m * vn * n;
      var f = box2d.b2Mul_S_V2(damping * m * vn, n, s_f);
      ///  m_velocityBuffer.data[a] += GetParticleInvMass() * f;
      vel_data[a].SelfMulAdd(inv_mass, f);
      ///  b.ApplyLinearImpulse(-f, p, true);
      b.ApplyLinearImpulse(f.SelfNeg(), p, true);
    }
  }
  for (var k = 0; k < this.m_contactBuffer.count; k++) {
    var contact = this.m_contactBuffer.data[k];
    var a = contact.indexA;
    var b = contact.indexB;
    var w = contact.weight;
    var n = contact.normal;
    ///  b2Vec2 v = m_velocityBuffer.data[b] - m_velocityBuffer.data[a];
    var v = box2d.b2Sub_V2_V2(vel_data[b], vel_data[a], s_v);
    var vn = box2d.b2Dot_V2_V2(v, n);
    if (vn < 0) {
      ///  float32 damping = b2Max(linearDamping * w, b2Min(- quadraticDamping * vn, 0.5f));
      var damping = box2d.b2Max(linearDamping * w, box2d.b2Min(-quadraticDamping * vn, 0.5));
      ///  b2Vec2 f = damping * vn * n;
      var f = box2d.b2Mul_S_V2(damping * vn, n, s_f);
      ///  this.m_velocityBuffer.data[a] += f;
      vel_data[a].SelfAdd(f);
      ///  this.m_velocityBuffer.data[b] -= f;
      vel_data[b].SelfSub(f);
    }
  }
}
box2d.b2ParticleSystem.prototype.SolveDamping.s_v = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveDamping.s_f = new box2d.b2Vec2();

/**
 * @return {void}
 */
box2d.b2ParticleSystem.prototype.SolveRigidDamping = function() {
  var s_t0 = box2d.b2ParticleSystem.prototype.SolveRigidDamping.s_t0;
  var s_t1 = box2d.b2ParticleSystem.prototype.SolveRigidDamping.s_t1;
  var s_p = box2d.b2ParticleSystem.prototype.SolveRigidDamping.s_p;
  var s_v = box2d.b2ParticleSystem.prototype.SolveRigidDamping.s_v;
  var invMassA = [0.0],
    invInertiaA = [0.0],
    tangentDistanceA = [0.0]; // TODO: static
  var invMassB = [0.0],
    invInertiaB = [0.0],
    tangentDistanceB = [0.0]; // TODO: static
  // Apply impulse to rigid particle groups colliding with other objects
  // to reduce relative velocity at the colliding point.
  var pos_data = this.m_positionBuffer.data;
  var damping = this.m_def.dampingStrength;
  for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
    var contact = this.m_bodyContactBuffer.data[k];
    var a = contact.index;
    var aGroup = this.m_groupBuffer[a];
    if (this.IsRigidGroup(aGroup)) {
      var b = contact.body;
      var n = contact.normal;
      var w = contact.weight;
      var p = pos_data[a];
      ///  b2Vec2 v = b.GetLinearVelocityFromWorldPoint(p) - aGroup.GetLinearVelocityFromWorldPoint(p);
      var v = box2d.b2Sub_V2_V2(b.GetLinearVelocityFromWorldPoint(p, s_t0), aGroup.GetLinearVelocityFromWorldPoint(p, s_t1), s_v);
      var vn = box2d.b2Dot_V2_V2(v, n);
      if (vn < 0)
      // The group's average velocity at particle position 'p' is pushing
      // the particle into the body.
      {
        ///  this.InitDampingParameterWithRigidGroupOrParticle(&invMassA, &invInertiaA, &tangentDistanceA, true, aGroup, a, p, n);
        this.InitDampingParameterWithRigidGroupOrParticle(invMassA, invInertiaA, tangentDistanceA, true, aGroup, a, p, n);
        // Calculate b.m_I from public functions of b2Body.
        ///  this.InitDampingParameter(&invMassB, &invInertiaB, &tangentDistanceB, b.GetMass(), b.GetInertia() - b.GetMass() * b.GetLocalCenter().LengthSquared(), b.GetWorldCenter(), p, n);
        this.InitDampingParameter(invMassB, invInertiaB, tangentDistanceB, b.GetMass(), b.GetInertia() - b.GetMass() * b.GetLocalCenter().LengthSquared(), b.GetWorldCenter(), p, n);
        ///  float32 f = damping * b2Min(w, 1.0) * this.ComputeDampingImpulse(invMassA, invInertiaA, tangentDistanceA, invMassB, invInertiaB, tangentDistanceB, vn);
        var f = damping * box2d.b2Min(w, 1.0) * this.ComputeDampingImpulse(invMassA[0], invInertiaA[0], tangentDistanceA[0], invMassB[0], invInertiaB[0], tangentDistanceB[0], vn);
        ///  this.ApplyDamping(invMassA, invInertiaA, tangentDistanceA, true, aGroup, a, f, n);
        this.ApplyDamping(invMassA[0], invInertiaA[0], tangentDistanceA[0], true, aGroup, a, f, n);
        ///  b.ApplyLinearImpulse(-f * n, p, true);
        b.ApplyLinearImpulse(box2d.b2Mul_S_V2(-f, n, box2d.b2Vec2.s_t0), p, true);
      }
    }
  }
  for (var k = 0; k < this.m_contactBuffer.count; k++) {
    var contact = this.m_contactBuffer.data[k];
    var a = contact.indexA;
    var b = contact.indexB;
    var n = contact.normal;
    var w = contact.weight;
    var aGroup = this.m_groupBuffer[a];
    var bGroup = this.m_groupBuffer[b];
    var aRigid = this.IsRigidGroup(aGroup);
    var bRigid = this.IsRigidGroup(bGroup);
    if (aGroup !== bGroup && (aRigid || bRigid)) {
      ///  b2Vec2 p = 0.5f * (this.m_positionBuffer.data[a] + this.m_positionBuffer.data[b]);
      var p = box2d.b2Mid_V2_V2(pos_data[a], pos_data[b], s_p);
      ///  b2Vec2 v = GetLinearVelocity(bGroup, b, p) - GetLinearVelocity(aGroup, a, p);
      var v = box2d.b2Sub_V2_V2(this.GetLinearVelocity(bGroup, b, p, s_t0), this.GetLinearVelocity(aGroup, a, p, s_t1), s_v);
      var vn = box2d.b2Dot_V2_V2(v, n);
      if (vn < 0) {
        ///  this.InitDampingParameterWithRigidGroupOrParticle(&invMassA, &invInertiaA, &tangentDistanceA, aRigid, aGroup, a, p, n);
        this.InitDampingParameterWithRigidGroupOrParticle(invMassA, invInertiaA, tangentDistanceA, aRigid, aGroup, a, p, n);
        ///  this.InitDampingParameterWithRigidGroupOrParticle(&invMassB, &invInertiaB, &tangentDistanceB, bRigid, bGroup, b, p, n);
        this.InitDampingParameterWithRigidGroupOrParticle(invMassB, invInertiaB, tangentDistanceB, bRigid, bGroup, b, p, n);
        ///  float32 f = damping * w * this.ComputeDampingImpulse(invMassA, invInertiaA, tangentDistanceA, invMassB, invInertiaB, tangentDistanceB, vn);
        var f = damping * w * this.ComputeDampingImpulse(invMassA[0], invInertiaA[0], tangentDistanceA[0], invMassB[0], invInertiaB[0], tangentDistanceB[0], vn);
        ///  this.ApplyDamping(invMassA, invInertiaA, tangentDistanceA, aRigid, aGroup, a, f, n);
        this.ApplyDamping(invMassA[0], invInertiaA[0], tangentDistanceA[0], aRigid, aGroup, a, f, n);
        ///  this.ApplyDamping(invMassB, invInertiaB, tangentDistanceB, bRigid, bGroup, b, -f, n);
        this.ApplyDamping(invMassB[0], invInertiaB[0], tangentDistanceB[0], bRigid, bGroup, b, -f, n);
      }
    }
  }
}
box2d.b2ParticleSystem.prototype.SolveRigidDamping.s_t0 = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveRigidDamping.s_t1 = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveRigidDamping.s_p = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveRigidDamping.s_v = new box2d.b2Vec2();

/**
 * @return {void}
 */
box2d.b2ParticleSystem.prototype.SolveExtraDamping = function() {
  var s_v = box2d.b2ParticleSystem.prototype.SolveExtraDamping.s_v;
  var s_f = box2d.b2ParticleSystem.prototype.SolveExtraDamping.s_f;
  var vel_data = this.m_velocityBuffer.data;
  // Applies additional damping force between bodies and particles which can
  // produce strong repulsive force. Applying damping force multiple times
  // is effective in suppressing vibration.
  var pos_data = this.m_positionBuffer.data;
  var inv_mass = this.GetParticleInvMass();
  for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
    var contact = this.m_bodyContactBuffer.data[k];
    var a = contact.index;
    if (this.m_flagsBuffer.data[a] & box2d.b2ParticleSystem.k_extraDampingFlags) {
      var b = contact.body;
      var m = contact.mass;
      var n = contact.normal;
      var p = pos_data[a];
      ///  b2Vec2 v = b.GetLinearVelocityFromWorldPoint(p) - m_velocityBuffer.data[a];
      var v = box2d.b2Sub_V2_V2(b.GetLinearVelocityFromWorldPoint(p, box2d.b2Vec2.s_t0), vel_data[a], s_v);
      ///  float32 vn = b2Dot(v, n);
      var vn = box2d.b2Dot_V2_V2(v, n);
      if (vn < 0) {
        ///  b2Vec2 f = 0.5f * m * vn * n;
        var f = box2d.b2Mul_S_V2(0.5 * m * vn, n, s_f);
        ///  m_velocityBuffer.data[a] += GetParticleInvMass() * f;
        vel_data[a].SelfMulAdd(inv_mass, f);
        ///  b.ApplyLinearImpulse(-f, p, true);
        b.ApplyLinearImpulse(f.SelfNeg(), p, true);
      }
    }
  }
}
box2d.b2ParticleSystem.prototype.SolveExtraDamping.s_v = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveExtraDamping.s_f = new box2d.b2Vec2();

/**
 * @return {void}
 */
box2d.b2ParticleSystem.prototype.SolveWall = function() {
  var vel_data = this.m_velocityBuffer.data;
  for (var i = 0; i < this.m_count; i++) {
    if (this.m_flagsBuffer.data[i] & box2d.b2ParticleFlag.b2_wallParticle) {
      vel_data[i].SetZero();
    }
  }
}

/**
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.SolveRigid = function(step) {
  var s_position = box2d.b2ParticleSystem.prototype.SolveRigid.s_position;
  var s_rotation = box2d.b2ParticleSystem.prototype.SolveRigid.s_rotation;
  var s_transform = box2d.b2ParticleSystem.prototype.SolveRigid.s_transform;
  var s_velocityTransform = box2d.b2ParticleSystem.prototype.SolveRigid.s_velocityTransform;
  var pos_data = this.m_positionBuffer.data;
  var vel_data = this.m_velocityBuffer.data;
  for (var group = this.m_groupList; group; group = group.GetNext()) {
    if (group.m_groupFlags & box2d.b2ParticleGroupFlag.b2_rigidParticleGroup) {
      group.UpdateStatistics();
      ///  b2Rot rotation(step.dt * group.m_angularVelocity);
      var rotation = s_rotation;
      rotation.SetAngle(step.dt * group.m_angularVelocity);
      ///  b2Transform transform(group.m_center + step.dt * group.m_linearVelocity - b2Mul(rotation, group.m_center), rotation);
      var position = box2d.b2Add_V2_V2(
        group.m_center,
        box2d.b2Sub_V2_V2(
          box2d.b2Mul_S_V2(step.dt, group.m_linearVelocity, box2d.b2Vec2.s_t0),
          box2d.b2Mul_R_V2(rotation, group.m_center, box2d.b2Vec2.s_t1),
          box2d.b2Vec2.s_t0),
        s_position);
      var transform = s_transform;
      transform.SetPositionRotation(position, rotation);
      ///  group.m_transform = b2Mul(transform, group.m_transform);
      box2d.b2Mul_X_X(transform, group.m_transform, group.m_transform);
      var velocityTransform = s_velocityTransform;
      velocityTransform.p.x = step.inv_dt * transform.p.x;
      velocityTransform.p.y = step.inv_dt * transform.p.y;
      velocityTransform.q.s = step.inv_dt * transform.q.s;
      velocityTransform.q.c = step.inv_dt * (transform.q.c - 1);
      for (var i = group.m_firstIndex; i < group.m_lastIndex; i++) {
        ///  m_velocityBuffer.data[i] = b2Mul(velocityTransform, m_positionBuffer.data[i]);
        box2d.b2Mul_X_V2(velocityTransform, pos_data[i], vel_data[i]);
      }
    }
  }
}
box2d.b2ParticleSystem.prototype.SolveRigid.s_position = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveRigid.s_rotation = new box2d.b2Rot();
box2d.b2ParticleSystem.prototype.SolveRigid.s_transform = new box2d.b2Transform();
box2d.b2ParticleSystem.prototype.SolveRigid.s_velocityTransform = new box2d.b2Transform();

/**
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.SolveElastic = function(step) {
  var s_pa = box2d.b2ParticleSystem.prototype.SolveElastic.s_pa;
  var s_pb = box2d.b2ParticleSystem.prototype.SolveElastic.s_pb;
  var s_pc = box2d.b2ParticleSystem.prototype.SolveElastic.s_pc;
  var s_r = box2d.b2ParticleSystem.prototype.SolveElastic.s_r;
  var s_t0 = box2d.b2ParticleSystem.prototype.SolveElastic.s_t0;
  var pos_data = this.m_positionBuffer.data;
  var vel_data = this.m_velocityBuffer.data;
  var elasticStrength = step.inv_dt * this.m_def.elasticStrength;
  for (var k = 0; k < this.m_triadBuffer.count; k++) {
    var triad = this.m_triadBuffer.data[k];
    if (triad.flags & box2d.b2ParticleFlag.b2_elasticParticle) {
      var a = triad.indexA;
      var b = triad.indexB;
      var c = triad.indexC;
      var oa = triad.pa;
      var ob = triad.pb;
      var oc = triad.pc;
      ///  b2Vec2 pa = m_positionBuffer.data[a];
      var pa = s_pa.Copy(pos_data[a]);
      ///  b2Vec2 pb = m_positionBuffer.data[b];
      var pb = s_pb.Copy(pos_data[b]);
      ///  b2Vec2 pc = m_positionBuffer.data[c];
      var pc = s_pc.Copy(pos_data[c]);
      var va = vel_data[a];
      var vb = vel_data[b];
      var vc = vel_data[c];
      ///  pa += step.dt * va;
      pa.SelfMulAdd(step.dt, va);
      ///  pb += step.dt * vb;
      pb.SelfMulAdd(step.dt, vb);
      ///  pc += step.dt * vc;
      pc.SelfMulAdd(step.dt, vc);
      ///  b2Vec2 midPoint = (float32) 1 / 3 * (pa + pb + pc);
      var midPoint_x = (pa.x + pb.x + pc.x) / 3.0;
      var midPoint_y = (pa.y + pb.y + pc.y) / 3.0;
      ///  pa -= midPoint;
      pa.x -= midPoint_x;
      pa.y -= midPoint_y;
      ///  pb -= midPoint;
      pb.x -= midPoint_x;
      pb.y -= midPoint_y;
      ///  pc -= midPoint;
      pc.x -= midPoint_x;
      pc.y -= midPoint_y;
      ///  b2Rot r;
      var r = s_r;
      r.s = box2d.b2Cross_V2_V2(oa, pa) + box2d.b2Cross_V2_V2(ob, pb) + box2d.b2Cross_V2_V2(oc, pc);
      r.c = box2d.b2Dot_V2_V2(oa, pa) + box2d.b2Dot_V2_V2(ob, pb) + box2d.b2Dot_V2_V2(oc, pc);
      var r2 = r.s * r.s + r.c * r.c;
      var invR = box2d.b2InvSqrt(r2);
      if (!isFinite(invR)) {
        invR = 1.98177537e+019;
      }
      r.s *= invR;
      r.c *= invR;
      r.angle = Math.atan2(r.s, r.c);
      var strength = elasticStrength * triad.strength;
      ///  va += strength * (b2Mul(r, oa) - pa);
      box2d.b2Mul_R_V2(r, oa, s_t0);
      box2d.b2Sub_V2_V2(s_t0, pa, s_t0);
      box2d.b2Mul_S_V2(strength, s_t0, s_t0);
      va.SelfAdd(s_t0);
      ///  vb += strength * (b2Mul(r, ob) - pb);
      box2d.b2Mul_R_V2(r, ob, s_t0);
      box2d.b2Sub_V2_V2(s_t0, pb, s_t0);
      box2d.b2Mul_S_V2(strength, s_t0, s_t0);
      vb.SelfAdd(s_t0);
      ///  vc += strength * (b2Mul(r, oc) - pc);
      box2d.b2Mul_R_V2(r, oc, s_t0);
      box2d.b2Sub_V2_V2(s_t0, pc, s_t0);
      box2d.b2Mul_S_V2(strength, s_t0, s_t0);
      vc.SelfAdd(s_t0);
    }
  }
}
box2d.b2ParticleSystem.prototype.SolveElastic.s_pa = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveElastic.s_pb = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveElastic.s_pc = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveElastic.s_r = new box2d.b2Rot();
box2d.b2ParticleSystem.prototype.SolveElastic.s_t0 = new box2d.b2Vec2();

/**
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.SolveSpring = function(step) {
  var s_pa = box2d.b2ParticleSystem.prototype.SolveSpring.s_pa;
  var s_pb = box2d.b2ParticleSystem.prototype.SolveSpring.s_pb;
  var s_d = box2d.b2ParticleSystem.prototype.SolveSpring.s_d;
  var s_f = box2d.b2ParticleSystem.prototype.SolveSpring.s_f;
  var pos_data = this.m_positionBuffer.data;
  var vel_data = this.m_velocityBuffer.data;
  var springStrength = step.inv_dt * this.m_def.springStrength;
  for (var k = 0; k < this.m_pairBuffer.count; k++) {
    var pair = this.m_pairBuffer.data[k];
    if (pair.flags & box2d.b2ParticleFlag.b2_springParticle) {
      ///  int32 a = pair.indexA;
      var a = pair.indexA;
      ///  int32 b = pair.indexB;
      var b = pair.indexB;
      ///  b2Vec2 pa = m_positionBuffer.data[a];
      var pa = s_pa.Copy(pos_data[a]);
      ///  b2Vec2 pb = m_positionBuffer.data[b];
      var pb = s_pb.Copy(pos_data[b]);
      ///  b2Vec2& va = m_velocityBuffer.data[a];
      var va = vel_data[a];
      ///  b2Vec2& vb = m_velocityBuffer.data[b];
      var vb = vel_data[b];
      ///  pa += step.dt * va;
      pa.SelfMulAdd(step.dt, va);
      ///  pb += step.dt * vb;
      pb.SelfMulAdd(step.dt, vb);
      ///  b2Vec2 d = pb - pa;
      var d = box2d.b2Sub_V2_V2(pb, pa, s_d);
      ///  float32 r0 = pair.distance;
      var r0 = pair.distance;
      ///  float32 r1 = d.Length();
      var r1 = d.Length();
      ///  float32 strength = springStrength * pair.strength;
      var strength = springStrength * pair.strength;
      ///  b2Vec2 f = strength * (r0 - r1) / r1 * d;
      var f = box2d.b2Mul_S_V2(strength * (r0 - r1) / r1, d, s_f);
      ///  va -= f;
      va.SelfSub(f);
      ///  vb += f;
      vb.SelfAdd(f);
    }
  }
}
box2d.b2ParticleSystem.prototype.SolveSpring.s_pa = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveSpring.s_pb = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveSpring.s_d = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveSpring.s_f = new box2d.b2Vec2();

/**
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.SolveTensile = function(step) {
  var s_weightedNormal = box2d.b2ParticleSystem.prototype.SolveTensile.s_weightedNormal;
  var s_s = box2d.b2ParticleSystem.prototype.SolveTensile.s_s;
  var s_f = box2d.b2ParticleSystem.prototype.SolveTensile.s_f;
  var vel_data = this.m_velocityBuffer.data;
  box2d.b2Assert(this.m_accumulation2Buffer !== null);
  for (var i = 0; i < this.m_count; i++) {
    this.m_accumulation2Buffer[i] = box2d.b2Vec2_zero.Clone();
    this.m_accumulation2Buffer[i].SetZero();
  }
  for (var k = 0; k < this.m_contactBuffer.count; k++) {
    var contact = this.m_contactBuffer.data[k];
    if (contact.flags & box2d.b2ParticleFlag.b2_tensileParticle) {
      var a = contact.indexA;
      var b = contact.indexB;
      var w = contact.weight;
      var n = contact.normal;
      ///  b2Vec2 weightedNormal = (1 - w) * w * n;
      var weightedNormal = box2d.b2Mul_S_V2((1 - w) * w, n, s_weightedNormal);
      ///  m_accumulation2Buffer[a] -= weightedNormal;
      this.m_accumulation2Buffer[a].SelfSub(weightedNormal);
      ///  m_accumulation2Buffer[b] += weightedNormal;
      this.m_accumulation2Buffer[b].SelfAdd(weightedNormal);
    }
  }
  var criticalVelocity = this.GetCriticalVelocity(step);
  var pressureStrength = this.m_def.surfaceTensionPressureStrength * criticalVelocity;
  var normalStrength = this.m_def.surfaceTensionNormalStrength * criticalVelocity;
  var maxVelocityVariation = box2d.b2_maxParticleForce * criticalVelocity;
  for (var k = 0; k < this.m_contactBuffer.count; k++) {
    var contact = this.m_contactBuffer.data[k];
    if (contact.flags & box2d.b2ParticleFlag.b2_tensileParticle) {
      var a = contact.indexA;
      var b = contact.indexB;
      var w = contact.weight;
      var n = contact.normal;
      var h = this.m_weightBuffer[a] + this.m_weightBuffer[b];
      ///  b2Vec2 s = m_accumulation2Buffer[b] - m_accumulation2Buffer[a];
      var s = box2d.b2Sub_V2_V2(this.m_accumulation2Buffer[b], this.m_accumulation2Buffer[a], s_s);
      var fn = box2d.b2Min(
        pressureStrength * (h - 2) + normalStrength * box2d.b2Dot_V2_V2(s, n),
        maxVelocityVariation) * w;
      ///  b2Vec2 f = fn * n;
      var f = box2d.b2Mul_S_V2(fn, n, s_f);
      ///  m_velocityBuffer.data[a] -= f;
      vel_data[a].SelfSub(f);
      ///  m_velocityBuffer.data[b] += f;
      vel_data[b].SelfAdd(f);
    }
  }
}
box2d.b2ParticleSystem.prototype.SolveTensile.s_weightedNormal = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveTensile.s_s = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveTensile.s_f = new box2d.b2Vec2();

/**
 * @return {void}
 */
box2d.b2ParticleSystem.prototype.SolveViscous = function() {
  var s_v = box2d.b2ParticleSystem.prototype.SolveViscous.s_v;
  var s_f = box2d.b2ParticleSystem.prototype.SolveViscous.s_f;
  var pos_data = this.m_positionBuffer.data;
  var vel_data = this.m_velocityBuffer.data;
  var viscousStrength = this.m_def.viscousStrength;
  var inv_mass = this.GetParticleInvMass();
  for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
    var contact = this.m_bodyContactBuffer.data[k];
    var a = contact.index;
    if (this.m_flagsBuffer.data[a] & box2d.b2ParticleFlag.b2_viscousParticle) {
      var b = contact.body;
      var w = contact.weight;
      var m = contact.mass;
      var p = pos_data[a];
      ///  b2Vec2 v = b.GetLinearVelocityFromWorldPoint(p) - m_velocityBuffer.data[a];
      var v = box2d.b2Sub_V2_V2(b.GetLinearVelocityFromWorldPoint(p, box2d.b2Vec2.s_t0), vel_data[a], s_v);
      ///  b2Vec2 f = viscousStrength * m * w * v;
      var f = box2d.b2Mul_S_V2(viscousStrength * m * w, v, s_f);
      ///  m_velocityBuffer.data[a] += GetParticleInvMass() * f;
      vel_data[a].SelfMulAdd(inv_mass, f);
      ///  b.ApplyLinearImpulse(-f, p, true);
      b.ApplyLinearImpulse(f.SelfNeg(), p, true);
    }
  }
  for (var k = 0; k < this.m_contactBuffer.count; k++) {
    var contact = this.m_contactBuffer.data[k];
    if (contact.flags & box2d.b2ParticleFlag.b2_viscousParticle) {
      var a = contact.indexA;
      var b = contact.indexB;
      var w = contact.weight;
      ///  b2Vec2 v = m_velocityBuffer.data[b] - m_velocityBuffer.data[a];
      var v = box2d.b2Sub_V2_V2(vel_data[b], vel_data[a], s_v);
      ///  b2Vec2 f = viscousStrength * w * v;
      var f = box2d.b2Mul_S_V2(viscousStrength * w, v, s_f);
      ///  m_velocityBuffer.data[a] += f;
      vel_data[a].SelfAdd(f);
      ///  m_velocityBuffer.data[b] -= f;
      vel_data[b].SelfSub(f);
    }
  }
}
box2d.b2ParticleSystem.prototype.SolveViscous.s_v = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.SolveViscous.s_f = new box2d.b2Vec2();

/**
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.SolveRepulsive = function(step) {
  var s_f = box2d.b2ParticleSystem.prototype.SolveRepulsive.s_f;
  var vel_data = this.m_velocityBuffer.data;
  var repulsiveStrength = this.m_def.repulsiveStrength * this.GetCriticalVelocity(step);
  for (var k = 0; k < this.m_contactBuffer.count; k++) {
    var contact = this.m_contactBuffer.data[k];
    if (contact.flags & box2d.b2ParticleFlag.b2_repulsiveParticle) {
      var a = contact.indexA;
      var b = contact.indexB;
      if (this.m_groupBuffer[a] !== this.m_groupBuffer[b]) {
        var w = contact.weight;
        var n = contact.normal;
        ///  b2Vec2 f = repulsiveStrength * w * n;
        var f = box2d.b2Mul_S_V2(repulsiveStrength * w, n, s_f);
        ///  m_velocityBuffer.data[a] -= f;
        vel_data[a].SelfSub(f);
        ///  m_velocityBuffer.data[b] += f;
        vel_data[b].SelfAdd(f);
      }
    }
  }
}
box2d.b2ParticleSystem.prototype.SolveRepulsive.s_f = new box2d.b2Vec2();

/**
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.SolvePowder = function(step) {
  var s_f = box2d.b2ParticleSystem.prototype.SolvePowder.s_f;
  var pos_data = this.m_positionBuffer.data;
  var vel_data = this.m_velocityBuffer.data;
  var powderStrength = this.m_def.powderStrength * this.GetCriticalVelocity(step);
  var minWeight = 1.0 - box2d.b2_particleStride;
  var inv_mass = this.GetParticleInvMass();
  for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
    var contact = this.m_bodyContactBuffer.data[k];
    var a = contact.index;
    if (this.m_flagsBuffer.data[a] & box2d.b2ParticleFlag.b2_powderParticle) {
      var w = contact.weight;
      if (w > minWeight) {
        var b = contact.body;
        var m = contact.mass;
        var p = pos_data[a];
        var n = contact.normal;
        var f = box2d.b2Mul_S_V2(powderStrength * m * (w - minWeight), n, s_f);
        vel_data[a].SelfMulSub(inv_mass, f);
        b.ApplyLinearImpulse(f, p, true);
      }
    }
  }
  for (var k = 0; k < this.m_contactBuffer.count; k++) {
    var contact = this.m_contactBuffer.data[k];
    if (contact.flags & box2d.b2ParticleFlag.b2_powderParticle) {
      var w = contact.weight;
      if (w > minWeight) {
        var a = contact.indexA;
        var b = contact.indexB;
        var n = contact.normal;
        var f = box2d.b2Mul_S_V2(powderStrength * (w - minWeight), n, s_f);
        vel_data[a].SelfSub(f);
        vel_data[b].SelfAdd(f);
      }
    }
  }
}
box2d.b2ParticleSystem.prototype.SolvePowder.s_f = new box2d.b2Vec2();

/**
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.SolveSolid = function(step) {
  var s_f = box2d.b2ParticleSystem.prototype.SolveSolid.s_f;
  var vel_data = this.m_velocityBuffer.data;
  // applies extra repulsive force from solid particle groups
  this.m_depthBuffer = this.RequestBuffer(this.m_depthBuffer);
  var ejectionStrength = step.inv_dt * this.m_def.ejectionStrength;
  for (var k = 0; k < this.m_contactBuffer.count; k++) {
    var contact = this.m_contactBuffer.data[k];
    var a = contact.indexA;
    var b = contact.indexB;
    if (this.m_groupBuffer[a] !== this.m_groupBuffer[b]) {
      var w = contact.weight;
      var n = contact.normal;
      var h = this.m_depthBuffer[a] + this.m_depthBuffer[b];
      var f = box2d.b2Mul_S_V2(ejectionStrength * h * w, n, s_f);
      vel_data[a].SelfSub(f);
      vel_data[b].SelfAdd(f);
    }
  }
}
box2d.b2ParticleSystem.prototype.SolveSolid.s_f = new box2d.b2Vec2();

/**
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.SolveForce = function(step) {
  var vel_data = this.m_velocityBuffer.data;
  var velocityPerForce = step.dt * this.GetParticleInvMass();
  for (var i = 0; i < this.m_count; i++) {
    ///  m_velocityBuffer.data[i] += velocityPerForce * m_forceBuffer[i];
    vel_data[i].SelfMulAdd(velocityPerForce, this.m_forceBuffer[i]);
  }
  this.m_hasForce = false;
}

/**
 * @return {void}
 */
box2d.b2ParticleSystem.prototype.SolveColorMixing = function() {
  // mixes color between contacting particles
  box2d.b2Assert(this.m_colorBuffer.data !== null);
  var colorMixing128 = Math.floor(128 * this.m_def.colorMixingStrength);
  if (colorMixing128) {
    for (var k = 0; k < this.m_contactBuffer.count; k++) {
      var contact = this.m_contactBuffer.data[k];
      var a = contact.indexA;
      var b = contact.indexB;
      if (this.m_flagsBuffer.data[a] & this.m_flagsBuffer.data[b] &
        box2d.b2ParticleFlag.b2_colorMixingParticle) {
        var colorA = this.m_colorBuffer.data[a];
        var colorB = this.m_colorBuffer.data[b];
        // Use the static method to ensure certain compilers inline
        // this correctly.
        box2d.b2ParticleColor.MixColors(colorA, colorB, colorMixing128);
      }
    }
  }
}

/**
 * @return {void}
 */
box2d.b2ParticleSystem.prototype.SolveZombie = function() {
  // removes particles with zombie flag
  var newCount = 0;
  ///  int32* newIndices = (int32*) this.m_world.m_stackAllocator.Allocate(sizeof(int32) * this.m_count);
  var newIndices = []; // TODO: static
  for (var i = 0; i < this.m_count; i++) {
    newIndices[i] = box2d.b2_invalidParticleIndex;
  }
  box2d.b2Assert(newIndices.length === this.m_count);
  var allParticleFlags = 0;
  for (var i = 0; i < this.m_count; i++) {
    var flags = this.m_flagsBuffer.data[i];
    if (flags & box2d.b2ParticleFlag.b2_zombieParticle) {
      var destructionListener = this.m_world.m_destructionListener;
      if ((flags & box2d.b2ParticleFlag.b2_destructionListenerParticle) && destructionListener) {
        destructionListener.SayGoodbyeParticle(this, i);
      }
      // Destroy particle handle.
      if (this.m_handleIndexBuffer.data) {
        var handle = this.m_handleIndexBuffer.data[i];
        if (handle) {
          handle.SetIndex(box2d.b2_invalidParticleIndex);
          this.m_handleIndexBuffer.data[i] = null;
          ///  m_handleAllocator.Free(handle);
        }
      }
      newIndices[i] = box2d.b2_invalidParticleIndex;
    } else {
      newIndices[i] = newCount;
      if (i !== newCount) {
        // Update handle to reference new particle index.
        if (this.m_handleIndexBuffer.data) {
          var handle = this.m_handleIndexBuffer.data[i];
          if (handle) handle.SetIndex(newCount);
          this.m_handleIndexBuffer.data[newCount] = handle;
        }
        this.m_flagsBuffer.data[newCount] = this.m_flagsBuffer.data[i];
        if (this.m_lastBodyContactStepBuffer.data) {
          this.m_lastBodyContactStepBuffer.data[newCount] = this.m_lastBodyContactStepBuffer.data[i];
        }
        if (this.m_bodyContactCountBuffer.data) {
          this.m_bodyContactCountBuffer.data[newCount] = this.m_bodyContactCountBuffer.data[i];
        }
        if (this.m_consecutiveContactStepsBuffer.data) {
          this.m_consecutiveContactStepsBuffer.data[newCount] = this.m_consecutiveContactStepsBuffer.data[i];
        }
        this.m_positionBuffer.data[newCount].Copy(this.m_positionBuffer.data[i]);
        this.m_velocityBuffer.data[newCount].Copy(this.m_velocityBuffer.data[i]);
        this.m_groupBuffer[newCount] = this.m_groupBuffer[i];
        if (this.m_hasForce) {
          this.m_forceBuffer[newCount].Copy(this.m_forceBuffer[i]);
        }
        if (this.m_staticPressureBuffer) {
          this.m_staticPressureBuffer[newCount] = this.m_staticPressureBuffer[i];
        }
        if (this.m_depthBuffer) {
          this.m_depthBuffer[newCount] = this.m_depthBuffer[i];
        }
        if (this.m_colorBuffer.data) {
          this.m_colorBuffer.data[newCount].Copy(this.m_colorBuffer.data[i]);
        }
        if (this.m_userDataBuffer.data) {
          this.m_userDataBuffer.data[newCount] = this.m_userDataBuffer.data[i];
        }
        if (this.m_expirationTimeBuffer.data) {
          this.m_expirationTimeBuffer.data[newCount] = this.m_expirationTimeBuffer.data[i];
        }
      }
      newCount++;
      allParticleFlags |= flags;
    }
  }

  // predicate functions
  var Test = {
    ///  static bool IsProxyInvalid(const Proxy& proxy)
    IsProxyInvalid: function(proxy) {
      return proxy.index < 0;
    },
    ///  static bool IsContactInvalid(const b2ParticleContact& contact)
    IsContactInvalid: function(contact) {
      return contact.indexA < 0 || contact.indexB < 0;
    },
    ///  static bool IsBodyContactInvalid(const b2ParticleBodyContact& contact)
    IsBodyContactInvalid: function(contact) {
      return contact.index < 0;
    },
    ///  static bool IsPairInvalid(const b2ParticlePair& pair)
    IsPairInvalid: function(pair) {
      return pair.indexA < 0 || pair.indexB < 0;
    },
    ///  static bool IsTriadInvalid(const b2ParticleTriad& triad)
    IsTriadInvalid: function(triad) {
      return triad.indexA < 0 || triad.indexB < 0 || triad.indexC < 0;
    }
  };

  // update proxies
  for (var k = 0; k < this.m_proxyBuffer.count; k++) {
    var proxy = this.m_proxyBuffer.data[k];
    proxy.index = newIndices[proxy.index];
  }
  this.m_proxyBuffer.RemoveIf(Test.IsProxyInvalid);

  // update contacts
  for (var k = 0; k < this.m_contactBuffer.count; k++) {
    var contact = this.m_contactBuffer.data[k];
    contact.indexA = newIndices[contact.indexA];
    contact.indexB = newIndices[contact.indexB];
  }
  this.m_contactBuffer.RemoveIf(Test.IsContactInvalid);

  // update particle-body contacts
  for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
    var contact = this.m_bodyContactBuffer.data[k];
    contact.index = newIndices[contact.index];
  }
  this.m_bodyContactBuffer.RemoveIf(Test.IsBodyContactInvalid);

  // update pairs
  for (var k = 0; k < this.m_pairBuffer.count; k++) {
    var pair = this.m_pairBuffer.data[k];
    pair.indexA = newIndices[pair.indexA];
    pair.indexB = newIndices[pair.indexB];
  }
  this.m_pairBuffer.RemoveIf(Test.IsPairInvalid);

  // update triads
  for (var k = 0; k < this.m_triadBuffer.count; k++) {
    var triad = this.m_triadBuffer.data[k];
    triad.indexA = newIndices[triad.indexA];
    triad.indexB = newIndices[triad.indexB];
    triad.indexC = newIndices[triad.indexC];
  }
  this.m_triadBuffer.RemoveIf(Test.IsTriadInvalid);

  // Update lifetime indices.
  if (this.m_indexByExpirationTimeBuffer.data) {
    var writeOffset = 0;
    for (var readOffset = 0; readOffset < this.m_count; readOffset++) {
      var newIndex = newIndices[this.m_indexByExpirationTimeBuffer.data[readOffset]];
      if (newIndex !== box2d.b2_invalidParticleIndex) {
        this.m_indexByExpirationTimeBuffer.data[writeOffset++] = newIndex;
      }
    }
  }

  // update groups
  for (var group = this.m_groupList; group; group = group.GetNext()) {
    var firstIndex = newCount;
    var lastIndex = 0;
    var modified = false;
    for (var i = group.m_firstIndex; i < group.m_lastIndex; i++) {
      var j = newIndices[i];
      if (j >= 0) {
        firstIndex = box2d.b2Min(firstIndex, j);
        lastIndex = box2d.b2Max(lastIndex, j + 1);
      } else {
        modified = true;
      }
    }
    if (firstIndex < lastIndex) {
      group.m_firstIndex = firstIndex;
      group.m_lastIndex = lastIndex;
      if (modified) {
        if (group.m_groupFlags & box2d.b2ParticleGroupFlag.b2_solidParticleGroup) {
          this.SetGroupFlags(group, group.m_groupFlags | box2d.b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth);
        }
      }
    } else {
      group.m_firstIndex = 0;
      group.m_lastIndex = 0;
      if (!(group.m_groupFlags & box2d.b2ParticleGroupFlag.b2_particleGroupCanBeEmpty)) {
        this.SetGroupFlags(group, group.m_groupFlags | box2d.b2ParticleGroupFlag.b2_particleGroupWillBeDestroyed);
      }
    }
  }

  // update particle count
  this.m_count = newCount;
  ///  m_world.m_stackAllocator.Free(newIndices);
  this.m_allParticleFlags = allParticleFlags;
  this.m_needsUpdateAllParticleFlags = false;

  // destroy bodies with no particles
  for (var group = this.m_groupList; group;) {
    var next = group.GetNext();
    if (group.m_groupFlags & box2d.b2ParticleGroupFlag.b2_particleGroupWillBeDestroyed) {
      this.DestroyParticleGroup(group);
    }
    group = next;
  }
}

/**
 * Destroy all particles which have outlived their lifetimes set
 * by SetParticleLifetime().
 *
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.SolveLifetimes = function(step) {
  box2d.b2Assert(this.m_expirationTimeBuffer.data !== null);
  box2d.b2Assert(this.m_indexByExpirationTimeBuffer.data !== null);
  // Update the time elapsed.
  this.m_timeElapsed = this.LifetimeToExpirationTime(step.dt);
  // Get the floor (non-fractional component) of the elapsed time.
  var quantizedTimeElapsed = this.GetQuantizedTimeElapsed();

  var expirationTimes = this.m_expirationTimeBuffer.data;
  var expirationTimeIndices = this.m_indexByExpirationTimeBuffer.data;
  var particleCount = this.GetParticleCount();
  // Sort the lifetime buffer if it's required.
  if (this.m_expirationTimeBufferRequiresSorting) {
    ///  const ExpirationTimeComparator expirationTimeComparator(expirationTimes);
    ///  std::sort(expirationTimeIndices, expirationTimeIndices + particleCount, expirationTimeComparator);

    /**
     * Compare the lifetime of particleIndexA and particleIndexB
     * returning true if the lifetime of A is greater than B for
     * particles that will expire.  If either particle's lifetime is
     * infinite (<= 0.0f) this function return true if the lifetime
     * of A is lesser than B. When used with std::sort() this
     * results in an array of particle indicies sorted in reverse
     * order by particle lifetime.
     *
     * For example, the set of lifetimes
     * (1.0, 0.7, 0.3, 0.0, -1.0, 2.0)
     * would be sorted as
     * (0.0, 1.0, -2.0, 1.0, 0.7, 0.3)
     *
     * @return {boolean}
     * @param {number} particleIndexA
     * @param {number} particleIndexB
     */
    var ExpirationTimeComparator = function(particleIndexA, particleIndexB) {
      var expirationTimeA = expirationTimes[particleIndexA];
      var expirationTimeB = expirationTimes[particleIndexB];
      var infiniteExpirationTimeA = expirationTimeA <= 0.0;
      var infiniteExpirationTimeB = expirationTimeB <= 0.0;
      return infiniteExpirationTimeA === infiniteExpirationTimeB ?
        expirationTimeA > expirationTimeB : infiniteExpirationTimeA;
    }

    box2d.std_sort(expirationTimeIndices, 0, particleCount, ExpirationTimeComparator);

    this.m_expirationTimeBufferRequiresSorting = false;
  }

  // Destroy particles which have expired.
  for (var i = particleCount - 1; i >= 0; --i) {
    var particleIndex = expirationTimeIndices[i];
    var expirationTime = expirationTimes[particleIndex];
    // If no particles need to be destroyed, skip this.
    if (quantizedTimeElapsed < expirationTime || expirationTime <= 0) {
      break;
    }
    // Destroy this particle.
    this.DestroyParticle(particleIndex);
  }
}

/**
 * @return {void}
 * @param {number} start
 * @param {number} mid
 * @param {number} end
 */
box2d.b2ParticleSystem.prototype.RotateBuffer = function(start, mid, end) {
  // move the particles assigned to the given group toward the end of array
  if (start === mid || mid === end) {
    return;
  }
  box2d.b2Assert(mid >= start && mid <= end);

  function newIndices(i) {
    if (i < start) {
      return i;
    } else if (i < mid) {
      return i + end - mid;
    } else if (i < end) {
      return i + start - mid;
    } else {
      return i;
    }
  }

  ///  std::rotate(m_flagsBuffer.data + start, m_flagsBuffer.data + mid, m_flagsBuffer.data + end);
  box2d.std_rotate(this.m_flagsBuffer.data, start, mid, end);
  if (this.m_lastBodyContactStepBuffer.data) {
    ///  std::rotate(m_lastBodyContactStepBuffer.data + start, m_lastBodyContactStepBuffer.data + mid, m_lastBodyContactStepBuffer.data + end);
    box2d.std_rotate(this.m_lastBodyContactStepBuffer.data, start, mid, end);
  }
  if (this.m_bodyContactCountBuffer.data) {
    ///  std::rotate(m_bodyContactCountBuffer.data + start, m_bodyContactCountBuffer.data + mid, m_bodyContactCountBuffer.data + end);
    box2d.std_rotate(this.m_bodyContactCountBuffer.data, start, mid, end);
  }
  if (this.m_consecutiveContactStepsBuffer.data) {
    ///  std::rotate(m_consecutiveContactStepsBuffer.data + start, m_consecutiveContactStepsBuffer.data + mid, m_consecutiveContactStepsBuffer.data + end);
    box2d.std_rotate(this.m_consecutiveContactStepsBuffer.data, start, mid, end);
  }
  ///  std::rotate(m_positionBuffer.data + start, m_positionBuffer.data + mid, m_positionBuffer.data + end);
  box2d.std_rotate(this.m_positionBuffer.data, start, mid, end);
  ///  std::rotate(m_velocityBuffer.data + start, m_velocityBuffer.data + mid, m_velocityBuffer.data + end);
  box2d.std_rotate(this.m_velocityBuffer.data, start, mid, end);
  ///  std::rotate(m_groupBuffer + start, m_groupBuffer + mid, m_groupBuffer + end);
  box2d.std_rotate(this.m_groupBuffer, start, mid, end);
  if (this.m_hasForce) {
    ///  std::rotate(m_forceBuffer + start, m_forceBuffer + mid, m_forceBuffer + end);
    box2d.std_rotate(this.m_forceBuffer, start, mid, end);
  }
  if (this.m_staticPressureBuffer) {
    ///  std::rotate(m_staticPressureBuffer + start, m_staticPressureBuffer + mid, m_staticPressureBuffer + end);
    box2d.std_rotate(this.m_staticPressureBuffer, start, mid, end);
  }
  if (this.m_depthBuffer) {
    ///  std::rotate(m_depthBuffer + start, m_depthBuffer + mid, m_depthBuffer + end);
    box2d.std_rotate(this.m_depthBuffer, start, mid, end);
  }
  if (this.m_colorBuffer.data) {
    ///  std::rotate(m_colorBuffer.data + start, m_colorBuffer.data + mid, m_colorBuffer.data + end);
    box2d.std_rotate(this.m_colorBuffer.data, start, mid, end);
  }
  if (this.m_userDataBuffer.data) {
    ///  std::rotate(m_userDataBuffer.data + start, m_userDataBuffer.data + mid, m_userDataBuffer.data + end);
    box2d.std_rotate(this.m_userDataBuffer.data, start, mid, end);
  }

  // Update handle indices.
  if (this.m_handleIndexBuffer.data) {
    ///  std::rotate(m_handleIndexBuffer.data + start, m_handleIndexBuffer.data + mid, m_handleIndexBuffer.data + end);
    box2d.std_rotate(this.m_handleIndexBuffer.data, start, mid, end);
    for (var i = start; i < end; ++i) {
      var handle = this.m_handleIndexBuffer.data[i];
      if (handle) handle.SetIndex(newIndices(handle.GetIndex()));
    }
  }

  if (this.m_expirationTimeBuffer.data) {
    ///  std::rotate(m_expirationTimeBuffer.data + start, m_expirationTimeBuffer.data + mid, m_expirationTimeBuffer.data + end);
    box2d.std_rotate(this.m_expirationTimeBuffer.data, start, mid, end);
    // Update expiration time buffer indices.
    var particleCount = this.GetParticleCount();
    var indexByExpirationTime = this.m_indexByExpirationTimeBuffer.data;
    for (var i = 0; i < particleCount; ++i) {
      indexByExpirationTime[i] = newIndices(indexByExpirationTime[i]);
    }
  }

  // update proxies
  for (var k = 0; k < this.m_proxyBuffer.count; k++) {
    var proxy = this.m_proxyBuffer.data[k];
    proxy.index = newIndices(proxy.index);
  }

  // update contacts
  for (var k = 0; k < this.m_contactBuffer.count; k++) {
    var contact = this.m_contactBuffer.data[k];
    contact.indexA = newIndices(contact.indexA);
    contact.indexB = newIndices(contact.indexB);
  }

  // update particle-body contacts
  for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
    var contact = this.m_bodyContactBuffer.data[k];
    contact.index = newIndices(contact.index);
  }

  // update pairs
  for (var k = 0; k < this.m_pairBuffer.count; k++) {
    var pair = this.m_pairBuffer.data[k];
    pair.indexA = newIndices(pair.indexA);
    pair.indexB = newIndices(pair.indexB);
  }

  // update triads
  for (var k = 0; k < this.m_triadBuffer.count; k++) {
    var triad = this.m_triadBuffer.data[k];
    triad.indexA = newIndices(triad.indexA);
    triad.indexB = newIndices(triad.indexB);
    triad.indexC = newIndices(triad.indexC);
  }

  // update groups
  for (var group = this.m_groupList; group; group = group.GetNext()) {
    group.m_firstIndex = newIndices(group.m_firstIndex);
    group.m_lastIndex = newIndices(group.m_lastIndex - 1) + 1;
  }
}

/**
 * @return {number}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.GetCriticalVelocity = function(step) {
  return this.m_particleDiameter * step.inv_dt;
}

/**
 * @return {number}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.GetCriticalVelocitySquared = function(step) {
  var velocity = this.GetCriticalVelocity(step);
  return velocity * velocity;
}

/**
 * @return {number}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2ParticleSystem.prototype.GetCriticalPressure = function(step) {
  return this.m_def.density * this.GetCriticalVelocitySquared(step);
}

/**
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetParticleStride = function() {
  return box2d.b2_particleStride * this.m_particleDiameter;
}

/**
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetParticleMass = function() {
  var stride = this.GetParticleStride();
  return this.m_def.density * stride * stride;
}

/**
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetParticleInvMass = function() {
  ///  return 1.777777 * this.m_inverseDensity * this.m_inverseDiameter * this.m_inverseDiameter;
  // mass = density * stride^2, so we take the inverse of this.
  var inverseStride = this.m_inverseDiameter * (1.0 / box2d.b2_particleStride);
  return this.m_inverseDensity * inverseStride * inverseStride;
}

/**
 * Get the world's contact filter if any particles with the
 * b2_contactFilterParticle flag are present in the system.
 *
 * @return {box2d.b2ContactFilter}
 */
box2d.b2ParticleSystem.prototype.GetFixtureContactFilter = function() {
  return (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_fixtureContactFilterParticle) ?
    this.m_world.m_contactManager.m_contactFilter : null;
}

/**
 * Get the world's contact filter if any particles with the
 * b2_particleContactFilterParticle flag are present in the
 * system.
 *
 * @return {box2d.b2ContactFilter}
 */
box2d.b2ParticleSystem.prototype.GetParticleContactFilter = function() {
  return (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_particleContactFilterParticle) ?
    this.m_world.m_contactManager.m_contactFilter : null;
}

/**
 * Get the world's contact listener if any particles with the
 * b2_fixtureContactListenerParticle flag are present in the
 * system.
 *
 * @return {box2d.b2ContactListener}
 */
box2d.b2ParticleSystem.prototype.GetFixtureContactListener = function() {
  return (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_fixtureContactListenerParticle) ?
    this.m_world.m_contactManager.m_contactListener : null;
}

/**
 * Get the world's contact listener if any particles with the
 * b2_particleContactListenerParticle flag are present in the
 * system.
 *
 * @return {box2d.b2ContactListener}
 */
box2d.b2ParticleSystem.prototype.GetParticleContactListener = function() {
  return (this.m_allParticleFlags & box2d.b2ParticleFlag.b2_particleContactListenerParticle) ?
    this.m_world.m_contactManager.m_contactListener : null;
}

/**
 * @return {*}
 * @param {*} buffer
 * @param {*} newData
 * @param {number} newCapacity
 */
box2d.b2ParticleSystem.prototype.SetUserOverridableBuffer = function(buffer, newData, newCapacity) {
  box2d.b2Assert(((newData !== null) && (newCapacity > 0)) || ((newData === null) && (newCapacity === 0)));
  ///  if (!buffer.userSuppliedCapacity)
  ///  {
  ///    this.m_world.m_blockAllocator.Free(buffer.data, sizeof(T) * m_internalAllocatedCapacity);
  ///  }
  buffer.data = newData;
  buffer.userSuppliedCapacity = newCapacity;
}

/**
 * @return {void}
 * @param {box2d.b2ParticleGroup} group
 * @param {number} newFlags
 */
box2d.b2ParticleSystem.prototype.SetGroupFlags = function(group, newFlags) {
  var oldFlags = group.m_groupFlags;
  if ((oldFlags ^ newFlags) & box2d.b2ParticleGroupFlag.b2_solidParticleGroup) {
    // If the b2_solidParticleGroup flag changed schedule depth update.
    newFlags |= box2d.b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth;
  }
  if (oldFlags & ~newFlags) {
    // If any flags might be removed
    this.m_needsUpdateAllGroupFlags = true;
  }
  if (~this.m_allGroupFlags & newFlags) {
    // If any flags were added
    if (newFlags & box2d.b2ParticleGroupFlag.b2_solidParticleGroup) {
      this.m_depthBuffer = this.RequestBuffer(this.m_depthBuffer);
    }
    this.m_allGroupFlags |= newFlags;
  }
  group.m_groupFlags = newFlags;
}

/**
 * @return {void}
 */
box2d.b2ParticleSystem.prototype.RemoveSpuriousBodyContacts = function() {
  // At this point we have a list of contact candidates based on AABB
  // overlap.The AABB query that  generated this returns all collidable
  // fixtures overlapping particle bounding boxes.  This breaks down around
  // vertices where two shapes intersect, such as a "ground" surface made
  // of multiple b2PolygonShapes; it potentially applies a lot of spurious
  // impulses from normals that should not actually contribute.  See the
  // Ramp example in Testbed.
  //
  // To correct for this, we apply this algorithm:
  //   * sort contacts by particle and subsort by weight (nearest to farthest)
  //   * for each contact per particle:
  //      - project a point at the contact distance along the inverse of the
  //        contact normal
  //      - if this intersects the fixture that generated the contact, apply
  //         it, otherwise discard as impossible
  //      - repeat for up to n nearest contacts, currently we get good results
  //        from n=3.
  ///  std::sort(m_bodyContactBuffer.Begin(), m_bodyContactBuffer.End(), b2ParticleSystem::BodyContactCompare);
  box2d.std_sort(this.m_bodyContactBuffer.data, 0, this.m_bodyContactBuffer.count, box2d.b2ParticleSystem.BodyContactCompare);

  ///  int32 discarded = 0;
  ///  std::remove_if(m_bodyContactBuffer.Begin(), m_bodyContactBuffer.End(), b2ParticleBodyContactRemovePredicate(this, &discarded));
  ///
  ///  m_bodyContactBuffer.SetCount(m_bodyContactBuffer.GetCount() - discarded);

  var s_n = box2d.b2ParticleSystem.prototype.RemoveSpuriousBodyContacts.s_n;
  var s_pos = box2d.b2ParticleSystem.prototype.RemoveSpuriousBodyContacts.s_pos;
  var s_normal = box2d.b2ParticleSystem.prototype.RemoveSpuriousBodyContacts.s_normal;

  // Max number of contacts processed per particle, from nearest to farthest.
  // This must be at least 2 for correctness with concave shapes; 3 was
  // experimentally arrived at as looking reasonable.
  var k_maxContactsPerPoint = 3;
  var system = this;
  // Index of last particle processed.
  var lastIndex = -1;
  // Number of contacts processed for the current particle.
  var currentContacts = 0;
  // Output the number of discarded contacts.
  var discarded = 0;
  /**
   * @return {boolean}
   * @param {box2d.b2ParticleBodyContact} contact
   */
  var b2ParticleBodyContactRemovePredicate = function(contact) {
    // This implements the selection criteria described in
    // RemoveSpuriousBodyContacts().
    // This functor is iterating through a list of Body contacts per
    // Particle, ordered from near to far.  For up to the maximum number of
    // contacts we allow per point per step, we verify that the contact
    // normal of the Body that genenerated the contact makes physical sense
    // by projecting a point back along that normal and seeing if it
    // intersects the fixture generating the contact.

    if (contact.index !== lastIndex) {
      currentContacts = 0;
      lastIndex = contact.index;
    }

    if (currentContacts++ > k_maxContactsPerPoint) {
      ++discarded;
      return true;
    }

    // Project along inverse normal (as returned in the contact) to get the
    // point to check.
    ///  b2Vec2 n = contact.normal;
    var n = s_n.Copy(contact.normal);
    // weight is 1-(inv(diameter) * distance)
    ///  n *= system.m_particleDiameter * (1 - contact.weight);
    n.SelfMul(system.m_particleDiameter * (1 - contact.weight));
    ///  b2Vec2 pos = system.m_positionBuffer.data[contact.index] + n;
    var pos = box2d.b2Add_V2_V2(system.m_positionBuffer.data[contact.index], n, s_pos);

    // pos is now a point projected back along the contact normal to the
    // contact distance. If the surface makes sense for a contact, pos will
    // now lie on or in the fixture generating
    if (!contact.fixture.TestPoint(pos)) {
      var childCount = contact.fixture.GetShape().GetChildCount();
      for (var childIndex = 0; childIndex < childCount; childIndex++) {
        var normal = s_normal;
        var distance = contact.fixture.ComputeDistance(pos, normal, childIndex);
        if (distance < box2d.b2_linearSlop) {
          return false;
        }
      }
      ++discarded;
      return true;
    }

    return false;
  }
  this.m_bodyContactBuffer.count = box2d.std_remove_if(this.m_bodyContactBuffer.data, b2ParticleBodyContactRemovePredicate, this.m_bodyContactBuffer.count);
}
box2d.b2ParticleSystem.prototype.RemoveSpuriousBodyContacts.s_n = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.RemoveSpuriousBodyContacts.s_pos = new box2d.b2Vec2();
box2d.b2ParticleSystem.prototype.RemoveSpuriousBodyContacts.s_normal = new box2d.b2Vec2();

/**
 * @return {boolean}
 * @param {box2d.b2ParticleBodyContact} lhs
 * @param {box2d.b2ParticleBodyContact} rhs
 */
box2d.b2ParticleSystem.BodyContactCompare = function(lhs, rhs) {
  if (lhs.index === rhs.index) {
    // Subsort by weight, decreasing.
    return lhs.weight > rhs.weight;
  }
  return lhs.index < rhs.index;
}

/**
 * @return {void}
 * @param {number} particle
 */
box2d.b2ParticleSystem.prototype.DetectStuckParticle = function(particle) {
  // Detect stuck particles
  //
  // The basic algorithm is to allow the user to specify an optional
  // threshold where we detect whenever a particle is contacting
  // more than one fixture for more than threshold consecutive
  // steps. This is considered to be "stuck", and these are put
  // in a list the user can query per step, if enabled, to deal with
  // such particles.

  if (this.m_stuckThreshold <= 0) {
    return;
  }

  // Get the state variables for this particle.
  ///  int32 * const consecutiveCount = &m_consecutiveContactStepsBuffer.data[particle];
  ///  int32 * const lastStep = &m_lastBodyContactStepBuffer.data[particle];
  ///  int32 * const bodyCount = &m_bodyContactCountBuffer.data[particle];

  // This is only called when there is a body contact for this particle.
  ///  ++(*bodyCount);
  ++this.m_bodyContactCountBuffer.data[particle];

  // We want to only trigger detection once per step, the first time we
  // contact more than one fixture in a step for a given particle.
  ///  if (*bodyCount === 2)
  if (this.m_bodyContactCountBuffer.data[particle] === 2) {
    ///  ++(*consecutiveCount);
    ++this.m_consecutiveContactStepsBuffer.data[particle];
    ///  if (*consecutiveCount > m_stuckThreshold)
    if (this.m_consecutiveContactStepsBuffer.data[particle] > this.m_stuckThreshold) {
      ///  int32& newStuckParticle = m_stuckParticleBuffer.Append();
      ///  newStuckParticle = particle;
      this.m_stuckParticleBuffer.data[this.m_stuckParticleBuffer.Append()] = particle;
    }
  }
  ///  *lastStep = m_timestamp;
  this.m_lastBodyContactStepBuffer.data[particle] = this.m_timestamp;
}

/**
 * Determine whether a particle index is valid.
 *
 * @return {boolean}
 * @param {number} index
 */
box2d.b2ParticleSystem.prototype.ValidateParticleIndex = function(index) {
  return index >= 0 && index < this.GetParticleCount() &&
    index !== box2d.b2_invalidParticleIndex;
}

/**
 * Get the time elapsed in
 * b2ParticleSystemDef::lifetimeGranularity.
 *
 * @return {number}
 */
box2d.b2ParticleSystem.prototype.GetQuantizedTimeElapsed = function() {
  ///  return (int32)(m_timeElapsed >> 32);
  return Math.floor(this.m_timeElapsed / 0x100000000);
}

/**
 * Convert a lifetime in seconds to an expiration time.
 *
 * @return {number}
 * @param {number} lifetime
 */
box2d.b2ParticleSystem.prototype.LifetimeToExpirationTime = function(lifetime) {
  ///  return m_timeElapsed + (int64)((lifetime / m_def.lifetimeGranularity) * (float32)(1LL << 32));
  return this.m_timeElapsed + Math.floor(((lifetime / this.m_def.lifetimeGranularity) * 0x100000000));
}

/**
 * @return {boolean}
 * @param {number} flags
 */
box2d.b2ParticleSystem.prototype.ForceCanBeApplied = function(flags) {
  return !(flags & box2d.b2ParticleFlag.b2_wallParticle);
}

/**
 * @return {void}
 */
box2d.b2ParticleSystem.prototype.PrepareForceBuffer = function() {
  if (!this.m_hasForce) {
    ///  memset(m_forceBuffer, 0, sizeof(*m_forceBuffer) * m_count);
    for (var i = 0; i < this.m_count; i++) {
      this.m_forceBuffer[i].SetZero();
    }
    this.m_hasForce = true;
  }
}

/**
 * @return {boolean}
 * @param {box2d.b2ParticleGroup} group
 */
box2d.b2ParticleSystem.prototype.IsRigidGroup = function(group) {
  return (group !== null) && ((group.m_groupFlags & box2d.b2ParticleGroupFlag.b2_rigidParticleGroup) !== 0);
}

/**
 * @return {box2d.b2Vec2}
 * @param {box2d.b2ParticleGroup} group
 * @param {number} particleIndex
 * @param {box2d.b2Vec2} point
 * @param {box2d.b2Vec2} out
 */
box2d.b2ParticleSystem.prototype.GetLinearVelocity = function(group, particleIndex, point, out) {
  if (this.IsRigidGroup(group)) {
    return group.GetLinearVelocityFromWorldPoint(point, out);
  } else {
    ///  return m_velocityBuffer.data[particleIndex];
    return out.Copy(this.m_velocityBuffer.data[particleIndex]);
  }
}

/**
 * @return {void}
 * @param {Array.<number>} invMass
 * @param {Array.<number>} invInertia
 * @param {Array.<number>} tangentDistance
 * @param {number} mass
 * @param {number} inertia
 * @param {box2d.b2Vec2} center
 * @param {box2d.b2Vec2} point
 * @param {box2d.b2Vec2} normal
 */
box2d.b2ParticleSystem.prototype.InitDampingParameter = function(invMass, invInertia, tangentDistance, mass, inertia, center, point, normal) {
  ///  *invMass = mass > 0 ? 1 / mass : 0;
  invMass[0] = mass > 0 ? 1 / mass : 0;
  ///  *invInertia = inertia > 0 ? 1 / inertia : 0;
  invInertia[0] = inertia > 0 ? 1 / inertia : 0;
  ///  *tangentDistance = b2Cross(point - center, normal);
  tangentDistance[0] = box2d.b2Cross_V2_V2(box2d.b2Sub_V2_V2(point, center, box2d.b2Vec2.s_t0), normal);
}

/**
 * @return {void}
 * @param {Array.<number>} invMass
 * @param {Array.<number>} invInertia
 * @param {Array.<number>} tangentDistance
 * @param {boolean} isRigidGroup
 * @param {box2d.b2ParticleGroup} group
 * @param {number} particleIndex
 * @param {box2d.b2Vec2} point
 * @param {box2d.b2Vec2} normal
 */
box2d.b2ParticleSystem.prototype.InitDampingParameterWithRigidGroupOrParticle = function(invMass, invInertia, tangentDistance, isRigidGroup, group, particleIndex, point, normal) {
  if (isRigidGroup) {
    this.InitDampingParameter(invMass, invInertia, tangentDistance, group.GetMass(), group.GetInertia(), group.GetCenter(), point, normal);
  } else {
    var flags = this.m_flagsBuffer.data[particleIndex];
    this.InitDampingParameter(invMass, invInertia, tangentDistance, flags & box2d.b2ParticleFlag.b2_wallParticle ? 0 : this.GetParticleMass(), 0, point, point, normal);
  }
}

/**
 * @return {number}
 * @param {number} invMassA
 * @param {number} invInertiaA
 * @param {number} tangentDistanceA
 * @param {number} invMassB
 * @param {number} invInertiaB
 * @param {number} tangentDistanceB
 * @param {number} normalVelocity
 */
box2d.b2ParticleSystem.prototype.ComputeDampingImpulse = function(invMassA, invInertiaA, tangentDistanceA, invMassB, invInertiaB, tangentDistanceB, normalVelocity) {
  var invMass =
    invMassA + invInertiaA * tangentDistanceA * tangentDistanceA +
    invMassB + invInertiaB * tangentDistanceB * tangentDistanceB;
  return invMass > 0 ? normalVelocity / invMass : 0;
}

/**
 * @return {void}
 * @param {number} invMass
 * @param {number} invInertia
 * @param {number} tangentDistance
 * @param {boolean} isRigidGroup
 * @param {box2d.b2ParticleGroup} group
 * @param {number} particleIndex
 * @param {number} impulse
 * @param {box2d.b2Vec2} normal
 */
box2d.b2ParticleSystem.prototype.ApplyDamping = function(invMass, invInertia, tangentDistance, isRigidGroup, group, particleIndex, impulse, normal) {
  if (isRigidGroup) {
    ///  group.m_linearVelocity += impulse * invMass * normal;
    group.m_linearVelocity.SelfMulAdd(impulse * invMass, normal);
    ///  group.m_angularVelocity += impulse * tangentDistance * invInertia;
    group.m_angularVelocity += impulse * tangentDistance * invInertia;
  } else {
    ///  m_velocityBuffer.data[particleIndex] += impulse * invMass * normal;
    this.m_velocityBuffer.data[particleIndex].SelfMulAdd(impulse * invMass, normal);
  }
}

//#endif
