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

goog.provide('box2d.b2VoronoiDiagram');

goog.require('box2d.b2StackQueue');
goog.require('box2d.b2Collision');

/**
 * A field representing the nearest generator from each point.
 *
 * @export
 * @constructor
 */
box2d.b2VoronoiDiagram = function(generatorCapacity) {
  this.m_generatorBuffer = box2d.b2MakeArray(generatorCapacity, function(index) {
    return new box2d.b2VoronoiDiagram.Generator();
  })
  this.m_generatorCapacity = generatorCapacity;
}

/**
 * @export
 * @type {Array.<box2d.b2VoronoiDiagram.Generator>}
 */
box2d.b2VoronoiDiagram.prototype.m_generatorBuffer = null;

/**
 * @type {number}
 */
box2d.b2VoronoiDiagram.prototype.m_generatorCapacity = 0;

/**
 * @type {number}
 */
box2d.b2VoronoiDiagram.prototype.m_generatorCount = 0;

/**
 * @type {number}
 */
box2d.b2VoronoiDiagram.prototype.m_countX = 0;

/**
 * @type {number}
 */
box2d.b2VoronoiDiagram.prototype.m_countY = 0;

/**
 * @type {Array.<box2d.b2VoronoiDiagram.Generator>}
 */
box2d.b2VoronoiDiagram.prototype.m_diagram = null;

/**
 * Callback used by GetNodes().
 *
 * Receive tags for generators associated with a node.
 *
 * @typedef {function(number,number,number):void}
 */
box2d.b2VoronoiDiagram.NodeCallback;

/**
 * @constructor
 */
box2d.b2VoronoiDiagram.Generator = function() {
  this.center = new box2d.b2Vec2();
};

/**
 * @type {box2d.b2Vec2}
 */
box2d.b2VoronoiDiagram.Generator.prototype.center = null;

/**
 * @type {number}
 */
box2d.b2VoronoiDiagram.Generator.prototype.tag = 0;

/**
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} i
 * @param {box2d.b2VoronoiDiagram.Generator} g
 */
box2d.b2VoronoiDiagram.b2VoronoiDiagramTask = function(x, y, i, g) {
  this.m_x = x;
  this.m_y = y;
  this.m_i = i;
  this.m_generator = g;
};

/**
 * @type {number}
 */
box2d.b2VoronoiDiagram.b2VoronoiDiagramTask.prototype.m_x = 0;

/**
 * @type {number}
 */
box2d.b2VoronoiDiagram.b2VoronoiDiagramTask.prototype.m_y = 0;

/**
 * @type {number}
 */
box2d.b2VoronoiDiagram.b2VoronoiDiagramTask.prototype.m_i = 0;

/**
 * @type {box2d.b2VoronoiDiagram.Generator}
 */
box2d.b2VoronoiDiagram.b2VoronoiDiagramTask.prototype.m_generator = null;

/**
 * Add a generator.
 *
 * @export
 * @return {void}
 * @param {box2d.b2Vec2} center the position of the generator.
 * @param {number} tag a tag used to identify the generator in
 *  	  callback functions.
 * @param {boolean} necessary whether to callback for nodes
 *  	  associated with the generator.
 */
box2d.b2VoronoiDiagram.prototype.AddGenerator = function(center, tag, necessary) {
  box2d.b2Assert(this.m_generatorCount < this.m_generatorCapacity);
  var g = this.m_generatorBuffer[this.m_generatorCount++];
  g.center.Copy(center);
  g.tag = tag;
  g.necessary = necessary;
}

/**
 * Generate the Voronoi diagram. It is rasterized with a given
 * interval in the same range as the necessary generators exist.
 *
 * @export
 * @return {void}
 * @param {number} radius the interval of the diagram.
 * @param {number} margin margin for which the range of the
 *  	  diagram is extended.
 */
box2d.b2VoronoiDiagram.prototype.Generate = function(radius, margin) {
  box2d.b2Assert(this.m_diagram === null);
  var inverseRadius = 1 / radius;
  var lower = new box2d.b2Vec2(+box2d.b2_maxFloat, +box2d.b2_maxFloat);
  var upper = new box2d.b2Vec2(-box2d.b2_maxFloat, -box2d.b2_maxFloat);
  var necessary_count = 0;
  for (var k = 0; k < this.m_generatorCount; k++) {
    var g = this.m_generatorBuffer[k];
    if (g.necessary) {
      box2d.b2Min_V2_V2(lower, g.center, lower);
      box2d.b2Max_V2_V2(upper, g.center, upper);
      ++necessary_count;
    }
  }
  if (necessary_count === 0) {
    //debugger;
    this.m_countX = 0;
    this.m_countY = 0;
    return;
  }
  lower.x -= margin;
  lower.y -= margin;
  upper.x += margin;
  upper.y += margin;
  this.m_countX = 1 + Math.floor(inverseRadius * (upper.x - lower.x));
  this.m_countY = 1 + Math.floor(inverseRadius * (upper.y - lower.y));
  ///	m_diagram = (Generator**) m_allocator->Allocate(sizeof(Generator*) * m_countX * m_countY);
  ///	for (int32 i = 0; i < m_countX * m_countY; i++)
  ///	{
  ///		m_diagram[i] = NULL;
  ///	}
  this.m_diagram = /** @type {Array.<box2d.b2VoronoiDiagram.Generator>} */ (box2d.b2MakeArray(this.m_countX * this.m_countY));

  // (4 * m_countX * m_countY) is the queue capacity that is experimentally
  // known to be necessary and sufficient for general particle distributions.
  var queue = new box2d.b2StackQueue(4 * this.m_countX * this.m_countY);
  for (var k = 0; k < this.m_generatorCount; k++) {
    var g = this.m_generatorBuffer[k];
    ///	g.center = inverseRadius * (g.center - lower);
    g.center.SelfSub(lower).SelfMul(inverseRadius);
    var x = Math.floor(g.center.x);
    var y = Math.floor(g.center.y);
    if (x >= 0 && y >= 0 && x < this.m_countX && y < this.m_countY) {
      queue.Push(new box2d.b2VoronoiDiagram.b2VoronoiDiagramTask(x, y, x + y * this.m_countX, g));
    }
  }
  while (!queue.Empty()) {
    var task = queue.Front();
    var x = task.m_x;
    var y = task.m_y;
    var i = task.m_i;
    var g = task.m_generator;
    queue.Pop();
    if (!this.m_diagram[i]) {
      this.m_diagram[i] = g;
      if (x > 0) {
        queue.Push(new box2d.b2VoronoiDiagram.b2VoronoiDiagramTask(x - 1, y, i - 1, g));
      }
      if (y > 0) {
        queue.Push(new box2d.b2VoronoiDiagram.b2VoronoiDiagramTask(x, y - 1, i - this.m_countX, g));
      }
      if (x < this.m_countX - 1) {
        queue.Push(new box2d.b2VoronoiDiagram.b2VoronoiDiagramTask(x + 1, y, i + 1, g));
      }
      if (y < this.m_countY - 1) {
        queue.Push(new box2d.b2VoronoiDiagram.b2VoronoiDiagramTask(x, y + 1, i + this.m_countX, g));
      }
    }
  }
  for (var y = 0; y < this.m_countY; y++) {
    for (var x = 0; x < this.m_countX - 1; x++) {
      var i = x + y * this.m_countX;
      var a = this.m_diagram[i];
      var b = this.m_diagram[i + 1];
      if (a !== b) {
        queue.Push(new box2d.b2VoronoiDiagram.b2VoronoiDiagramTask(x, y, i, b));
        queue.Push(new box2d.b2VoronoiDiagram.b2VoronoiDiagramTask(x + 1, y, i + 1, a));
      }
    }
  }
  for (var y = 0; y < this.m_countY - 1; y++) {
    for (var x = 0; x < this.m_countX; x++) {
      var i = x + y * this.m_countX;
      var a = this.m_diagram[i];
      var b = this.m_diagram[i + this.m_countX];
      if (a !== b) {
        queue.Push(new box2d.b2VoronoiDiagram.b2VoronoiDiagramTask(x, y, i, b));
        queue.Push(new box2d.b2VoronoiDiagram.b2VoronoiDiagramTask(x, y + 1, i + this.m_countX, a));
      }
    }
  }
  while (!queue.Empty()) {
    var task = queue.Front();
    var x = task.m_x;
    var y = task.m_y;
    var i = task.m_i;
    var k = task.m_generator;
    queue.Pop();
    var a = this.m_diagram[i];
    var b = k;
    if (a !== b) {
      var ax = a.center.x - x;
      var ay = a.center.y - y;
      var bx = b.center.x - x;
      var by = b.center.y - y;
      var a2 = ax * ax + ay * ay;
      var b2 = bx * bx + by * by;
      if (a2 > b2) {
        this.m_diagram[i] = b;
        if (x > 0) {
          queue.Push(new box2d.b2VoronoiDiagram.b2VoronoiDiagramTask(x - 1, y, i - 1, b));
        }
        if (y > 0) {
          queue.Push(new box2d.b2VoronoiDiagram.b2VoronoiDiagramTask(x, y - 1, i - this.m_countX, b));
        }
        if (x < this.m_countX - 1) {
          queue.Push(new box2d.b2VoronoiDiagram.b2VoronoiDiagramTask(x + 1, y, i + 1, b));
        }
        if (y < this.m_countY - 1) {
          queue.Push(new box2d.b2VoronoiDiagram.b2VoronoiDiagramTask(x, y + 1, i + this.m_countX, b));
        }
      }
    }
  }
}

/**
 * Enumerate all nodes that contain at least one necessary
 * generator.
 *
 * @export
 * @return {void}
 * @param {function(number,number,number):void} callback
 */
box2d.b2VoronoiDiagram.prototype.GetNodes = function(callback) {
  for (var y = 0; y < this.m_countY - 1; y++) {
    for (var x = 0; x < this.m_countX - 1; x++) {
      var i = x + y * this.m_countX;
      var a = this.m_diagram[i];
      var b = this.m_diagram[i + 1];
      var c = this.m_diagram[i + this.m_countX];
      var d = this.m_diagram[i + 1 + this.m_countX];
      if (b !== c) {
        if (a !== b && a !== c &&
          (a.necessary || b.necessary || c.necessary)) {
          callback(a.tag, b.tag, c.tag);
        }
        if (d !== b && d !== c &&
          (a.necessary || b.necessary || c.necessary)) {
          callback(b.tag, d.tag, c.tag);
        }
      }
    }
  }
}

//#endif
