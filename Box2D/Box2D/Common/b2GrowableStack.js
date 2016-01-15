/*
 * Copyright (c) 2010 Erin Catto http://www.box2d.org
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

goog.provide('box2d.b2GrowableStack');

goog.require('box2d.b2Settings');

/**
 * This is a growable LIFO stack with an initial capacity of N.
 * If the stack size exceeds the initial capacity, the heap is
 * used to increase the size of the stack.
 * @export
 * @constructor
 * @param {number} N
 */
box2d.b2GrowableStack = function(N) {
  this.m_stack = new Array(N);
}

/**
 * @export
 * @type {Array.<*>}
 */
box2d.b2GrowableStack.prototype.m_stack = null;
/**
 * @export
 * @type {number}
 */
box2d.b2GrowableStack.prototype.m_count = 0;

/**
 * @export
 * @return {box2d.b2GrowableStack}
 */
box2d.b2GrowableStack.prototype.Reset = function() {
  this.m_count = 0;
  return this;
}

/**
 * @export
 * @return {void}
 * @param {*} element
 */
box2d.b2GrowableStack.prototype.Push = function(element) {
  this.m_stack[this.m_count] = element;
  ++this.m_count;
}

/**
 * @export
 * @return {*}
 */
box2d.b2GrowableStack.prototype.Pop = function() {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(this.m_count > 0);
  }
  --this.m_count;
  var element = this.m_stack[this.m_count];
  this.m_stack[this.m_count] = null;
  return element;
}

/**
 * @export
 * @return {number}
 */
box2d.b2GrowableStack.prototype.GetCount = function() {
  return this.m_count;
}
