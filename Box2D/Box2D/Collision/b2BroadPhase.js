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

goog.provide('box2d.b2BroadPhase')

goog.require('box2d.b2Settings');
goog.require('box2d.b2DynamicTree')

/**
 * @export
 * @constructor
 */
box2d.b2Pair = function() {};

/**
 * @export
 * @type {box2d.b2TreeNode}
 */
box2d.b2Pair.prototype.proxyA = null;
/**
 * @export
 * @type {box2d.b2TreeNode}
 */
box2d.b2Pair.prototype.proxyB = null;

/**
 * The broad-phase is used for computing pairs and performing
 * volume queries and ray casts. This broad-phase does not
 * persist pairs. Instead, this reports potentially new pairs.
 * It is up to the client to consume the new pairs and to track
 * subsequent overlap.
 * @export
 * @constructor
 */
box2d.b2BroadPhase = function() {
  this.m_tree = new box2d.b2DynamicTree();
  this.m_moveBuffer = new Array();
  this.m_pairBuffer = new Array();
};

/**
 * @export
 * @type {box2d.b2DynamicTree}
 */
box2d.b2BroadPhase.prototype.m_tree = null;

/**
 * @export
 * @type {number}
 */
box2d.b2BroadPhase.prototype.m_proxyCount = 0;

//box2d.b2BroadPhase.prototype.m_moveCapacity = 16;
/**
 * @export
 * @type {number}
 */
box2d.b2BroadPhase.prototype.m_moveCount = 0;
/**
 * @export
 * @type {Array.<box2d.b2TreeNode>}
 */
box2d.b2BroadPhase.prototype.m_moveBuffer = null;

//box2d.b2BroadPhase.prototype.m_pairCapacity = 16;
/**
 * @export
 * @type {number}
 */
box2d.b2BroadPhase.prototype.m_pairCount = 0;
/**
 * @export
 * @type {Array.<box2d.b2Pair>}
 */
box2d.b2BroadPhase.prototype.m_pairBuffer = null;

//box2d.b2BroadPhase.prototype.m_queryProxyId = 0;

/**
 * Create a proxy with an initial AABB. Pairs are not reported
 * until UpdatePairs is called.
 * @export
 * @return {box2d.b2TreeNode}
 * @param {box2d.b2AABB} aabb
 * @param {*} userData
 */
box2d.b2BroadPhase.prototype.CreateProxy = function(aabb, userData) {
  var proxy = this.m_tree.CreateProxy(aabb, userData);
  ++this.m_proxyCount;
  this.BufferMove(proxy);
  return proxy;
}

/**
 * Destroy a proxy. It is up to the client to remove any pairs.
 * @export
 * @return {void}
 * @param {box2d.b2TreeNode} proxy
 */
box2d.b2BroadPhase.prototype.DestroyProxy = function(proxy) {
  this.UnBufferMove(proxy);
  --this.m_proxyCount;
  this.m_tree.DestroyProxy(proxy);
}

/**
 * Call MoveProxy as many times as you like, then when you are
 * done call UpdatePairs to finalized the proxy pairs (for your
 * time step).
 * @export
 * @return {void}
 * @param {box2d.b2TreeNode} proxy
 * @param {box2d.b2AABB} aabb
 * @param {box2d.b2Vec2} displacement
 */
box2d.b2BroadPhase.prototype.MoveProxy = function(proxy, aabb, displacement) {
  var buffer = this.m_tree.MoveProxy(proxy, aabb, displacement);
  if (buffer) {
    this.BufferMove(proxy);
  }
}

/**
 * Call to trigger a re-processing of it's pairs on the next
 * call to UpdatePairs.
 * @export
 * @return {void}
 * @param {box2d.b2TreeNode} proxy
 */
box2d.b2BroadPhase.prototype.TouchProxy = function(proxy) {
  this.BufferMove(proxy);
}

/**
 * Get the fat AABB for a proxy.
 * @export
 * @return {box2d.b2AABB}
 * @param {box2d.b2TreeNode} proxy
 */
box2d.b2BroadPhase.prototype.GetFatAABB = function(proxy) {
  return this.m_tree.GetFatAABB(proxy);
}

/**
 * Get user data from a proxy. Returns NULL if the id is
 * invalid.
 * @export
 * @return {*}
 * @param {box2d.b2TreeNode} proxy
 */
box2d.b2BroadPhase.prototype.GetUserData = function(proxy) {
  return this.m_tree.GetUserData(proxy);
}

/**
 * Test overlap of fat AABBs.
 * @export
 * @return {boolean}
 * @param {box2d.b2TreeNode} proxyA
 * @param {box2d.b2TreeNode} proxyB
 */
box2d.b2BroadPhase.prototype.TestOverlap = function(proxyA, proxyB) {
  var aabbA = this.m_tree.GetFatAABB(proxyA);
  var aabbB = this.m_tree.GetFatAABB(proxyB);
  return box2d.b2TestOverlap_AABB(aabbA, aabbB);
}

/**
 * Get the number of proxies.
 * @export
 * @return {number}
 */
box2d.b2BroadPhase.prototype.GetProxyCount = function() {
  return this.m_proxyCount;
}

/**
 * Get the height of the embedded tree.
 * @export
 * @return {number}
 */
box2d.b2BroadPhase.prototype.GetTreeHeight = function() {
  return this.m_tree.GetHeight();
}

/**
 * Get the balance of the embedded tree.
 * @export
 * @return {number}
 */
box2d.b2BroadPhase.prototype.GetTreeBalance = function() {
  return this.m_tree.GetMaxBalance();
}

/**
 * Get the quality metric of the embedded tree.
 * @export
 * @return {number}
 */
box2d.b2BroadPhase.prototype.GetTreeQuality = function() {
  return this.m_tree.GetAreaRatio();
}

/**
 * Shift the world origin. Useful for large worlds. The shift
 * formula is: position -= newOrigin
 * @export
 * @return {void}
 * @param {box2d.b2Vec2} newOrigin the new origin with respect to the old origin
 */
box2d.b2BroadPhase.prototype.ShiftOrigin = function(newOrigin) {
  this.m_tree.ShiftOrigin(newOrigin);
}

/**
 * Update the pairs. This results in pair callbacks. This can
 * only add pairs.
 * @export
 * @return {void}
 * @param contactManager
 */
box2d.b2BroadPhase.prototype.UpdatePairs = function(contactManager) {
  // Reset pair buffer
  this.m_pairCount = 0;

  // Perform tree queries for all moving proxies.
  for (var i = 0; i < this.m_moveCount; ++i) {
    var queryProxy = this.m_moveBuffer[i];
    if (queryProxy === null) {
      continue;
    }

    var that = this;

    // This is called from box2d.b2DynamicTree::Query when we are gathering pairs.
    // bool b2BroadPhase::QueryCallback(int32 proxyId);
    var QueryCallback = function(proxy) {
      // A proxy cannot form a pair with itself.
      if (proxy.m_id === queryProxy.m_id) {
        return true;
      }

      // Grow the pair buffer as needed.
      if (that.m_pairCount === that.m_pairBuffer.length) {
        that.m_pairBuffer[that.m_pairCount] = new box2d.b2Pair();
      }

      var pair = that.m_pairBuffer[that.m_pairCount];
      //pair.proxyA = proxy < queryProxy ? proxy : queryProxy;
      //pair.proxyB = proxy >= queryProxy ? proxy : queryProxy;
      if (proxy.m_id < queryProxy.m_id) {
        pair.proxyA = proxy;
        pair.proxyB = queryProxy;
      } else {
        pair.proxyA = queryProxy;
        pair.proxyB = proxy;
      }
      ++that.m_pairCount;

      return true;
    };

    // We have to query the tree with the fat AABB so that
    // we don't fail to create a pair that may touch later.
    var fatAABB = this.m_tree.GetFatAABB(queryProxy);

    // Query tree, create pairs and add them pair buffer.
    this.m_tree.Query(QueryCallback, fatAABB);
  }

  // Reset move buffer
  this.m_moveCount = 0;

  // Sort the pair buffer to expose duplicates.
  this.m_pairBuffer.length = this.m_pairCount;
  this.m_pairBuffer.sort(box2d.b2PairLessThan);

  // Send the pairs back to the client.
  var i = 0;
  while (i < this.m_pairCount) {
    var primaryPair = this.m_pairBuffer[i];
    var userDataA = this.m_tree.GetUserData(primaryPair.proxyA);
    var userDataB = this.m_tree.GetUserData(primaryPair.proxyB);

    contactManager.AddPair(userDataA, userDataB);
    ++i;

    // Skip any duplicate pairs.
    while (i < this.m_pairCount) {
      var pair = this.m_pairBuffer[i];
      if (pair.proxyA.m_id !== primaryPair.proxyA.m_id || pair.proxyB.m_id !== primaryPair.proxyB.m_id) {
        break;
      }
      ++i;
    }
  }

  // Try to keep the tree balanced.
  //this.m_tree.Rebalance(4);
}

/**
 * Query an AABB for overlapping proxies. The callback class is
 * called for each proxy that overlaps the supplied AABB.
 * @export
 * @return {void}
 * @param {function(box2d.b2TreeNode):boolean} callback
 * @param {box2d.b2AABB} aabb
 */
box2d.b2BroadPhase.prototype.Query = function(callback, aabb) {
  this.m_tree.Query(callback, aabb);
}

/**
 * Ray-cast against the proxies in the tree. This relies on the
 * callback to perform a exact ray-cast in the case were the
 * proxy contains a shape. The callback also performs the any
 * collision filtering. This has performance roughly equal to k
 * * log(n), where k is the number of collisions and n is the
 * number of proxies in the tree.
 * @export
 * @return {void}
 * @param
 *      {function(box2d.b2RayCastInput,box2d.b2TreeNode):number}
 *      callback a callback class that is called for each
 *      proxy that is hit by the ray.
 * @param {box2d.b2RayCastInput} input the ray-cast input data.
 *      The ray extends from p1 to p1 + maxFraction * (p2 -
 *      p1).
 */
box2d.b2BroadPhase.prototype.RayCast = function(callback, input) {
  this.m_tree.RayCast(callback, input);
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2TreeNode} proxy
 */
box2d.b2BroadPhase.prototype.BufferMove = function(proxy) {
  this.m_moveBuffer[this.m_moveCount] = proxy;
  ++this.m_moveCount;
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2TreeNode} proxy
 */
box2d.b2BroadPhase.prototype.UnBufferMove = function(proxy) {
  var i = this.m_moveBuffer.indexOf(proxy);
  this.m_moveBuffer[i] = null;
}

/**
 * This is used to sort pairs.
 * @return {number}
 * @param {box2d.b2Pair} pair1
 * @param {box2d.b2Pair} pair2
 */
box2d.b2PairLessThan = function(pair1, pair2) {
  if (pair1.proxyA.m_id === pair2.proxyA.m_id) {
    return pair1.proxyB.m_id - pair2.proxyB.m_id;
  }

  return pair1.proxyA.m_id - pair2.proxyA.m_id;
}
