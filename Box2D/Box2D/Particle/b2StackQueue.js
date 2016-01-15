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

goog.provide('box2d.b2StackQueue');

/**
 * @constructor
 * @param {number} capacity 
 */
box2d.b2StackQueue = function(capacity) {
  this.m_buffer = box2d.b2MakeArray(capacity);
  this.m_end = capacity;
}

/**
 * @type {Array.<*>}
 */
box2d.b2StackQueue.prototype.m_buffer = null;

/**
 * @type {number}
 */
box2d.b2StackQueue.prototype.m_front = 0;

/**
 * @type {number}
 */
box2d.b2StackQueue.prototype.m_back = 0;

/**
 * @type {number}
 */
box2d.b2StackQueue.prototype.m_capacity = 0;

/**
 * @return {void} 
 * @param {*} item 
 */
box2d.b2StackQueue.prototype.Push = function(item) {
  if (this.m_back >= this.m_capacity) {
    for (var i = this.m_front; i < this.m_back; i++) {
      this.m_buffer[i - this.m_front] = this.m_buffer[i];
    }
    this.m_back -= this.m_front;
    this.m_front = 0;
    if (this.m_back >= this.m_capacity) {
      if (this.m_capacity > 0) {
        this.m_buffer.concat(box2d.b2MakeArray(this.m_capacity));
        this.m_capacity *= 2;
      } else {
        this.m_buffer.concat(box2d.b2MakeArray(1));
        this.m_capacity = 1;
      }
      ///m_buffer = (T*) m_allocator->Reallocate(m_buffer, sizeof(T) * m_capacity);
    }
  }
  this.m_buffer[this.m_back] = item;
  this.m_back++;
}

/**
 * @return {void} 
 */
box2d.b2StackQueue.prototype.Pop = function() {
  box2d.b2Assert(this.m_front < this.m_back);
  this.m_buffer[this.m_front] = null;
  this.m_front++;
}

/**
 * @return {boolean} 
 */
box2d.b2StackQueue.prototype.Empty = function() {
  box2d.b2Assert(this.m_front <= this.m_back);
  return this.m_front === this.m_back;
}

/**
 * @return {*} 
 */
box2d.b2StackQueue.prototype.Front = function() {
  return this.m_buffer[this.m_front];
}

//#endif
