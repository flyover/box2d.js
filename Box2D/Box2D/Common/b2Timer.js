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

goog.provide('box2d.b2Timer');

goog.require('box2d.b2Settings');

/**
 * Timer for profiling. This has platform specific code and may
 * not work on every platform.
 * @export
 * @constructor
 */
box2d.b2Timer = function() {
  this.m_start = new Date().getTime();
}

/**
 * @export
 * @type {number}
 */
box2d.b2Timer.prototype.m_start = 0;

/**
 * @export
 * @return {box2d.b2Timer}
 */
box2d.b2Timer.prototype.Reset = function() {
  this.m_start = new Date().getTime();
  return this;
}

/**
 * @export
 * @return {number}
 */
box2d.b2Timer.prototype.GetMilliseconds = function() {
  return new Date().getTime() - this.m_start;
}

/**
 * @export
 * @constructor
 */
box2d.b2Counter = function() {}

/**
 * @export
 * @type {number}
 */
box2d.b2Counter.prototype.m_count = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2Counter.prototype.m_min_count = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2Counter.prototype.m_max_count = 0;

/**
 * @export
 * @return {number}
 */
box2d.b2Counter.prototype.GetCount = function() {
  return this.m_count;
}

/**
 * @export
 * @return {number}
 */
box2d.b2Counter.prototype.GetMinCount = function() {
  return this.m_min_count;
}

/**
 * @export
 * @return {number}
 */
box2d.b2Counter.prototype.GetMaxCount = function() {
  return this.m_max_count;
}

/**
 * @export
 * @return {number}
 */
box2d.b2Counter.prototype.ResetCount = function() {
  var count = this.m_count;
  this.m_count = 0;
  return count;
}

/**
 * @export
 * @return {void}
 */
box2d.b2Counter.prototype.ResetMinCount = function() {
  this.m_min_count = 0;
}

/**
 * @export
 * @return {void}
 */
box2d.b2Counter.prototype.ResetMaxCount = function() {
  this.m_max_count = 0;
}

/**
 * @export
 * @return {void}
 */
box2d.b2Counter.prototype.Increment = function() {
  this.m_count++;

  if (this.m_max_count < this.m_count) {
    this.m_max_count = this.m_count;
  }
}

/**
 * @export
 * @return {void}
 */
box2d.b2Counter.prototype.Decrement = function() {
  this.m_count--;

  if (this.m_min_count > this.m_count) {
    this.m_min_count = this.m_count;
  }
}
