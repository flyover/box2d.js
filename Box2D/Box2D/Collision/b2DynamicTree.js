/*
 * Copyright (c) 2009 Erin Catto http://www.box2d.org
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

goog.provide('box2d.b2DynamicTree')

goog.require('box2d.b2Settings');
goog.require('box2d.b2Collision');
goog.require('box2d.b2GrowableStack');

/** 
 * A node in the dynamic tree. The client does not interact with 
 * this directly. 
 * @export 
 * @constructor 
 * @param {number=} id 
 */
box2d.b2TreeNode = function(id) {
  this.m_id = id || 0;

  this.aabb = new box2d.b2AABB();
};

/**
 * @export 
 * @type {number}
 */
box2d.b2TreeNode.prototype.m_id = 0;

/** 
 * Enlarged AABB 
 * @export 
 * @type {box2d.b2AABB}
 */
box2d.b2TreeNode.prototype.aabb = null;

/**
 * @export 
 * @type {*}
 */
box2d.b2TreeNode.prototype.userData = null;

/**
 * @export 
 * @type {box2d.b2TreeNode}
 */
box2d.b2TreeNode.prototype.parent = null; // or box2d.b2TreeNode.prototype.next

/**
 * @export 
 * @type {box2d.b2TreeNode}
 */
box2d.b2TreeNode.prototype.child1 = null;
/**
 * @export 
 * @type {box2d.b2TreeNode}
 */
box2d.b2TreeNode.prototype.child2 = null;

/** 
 * leaf = 0, free node = -1 
 * @export 
 * @type {number}
 */
box2d.b2TreeNode.prototype.height = 0;

/**
 * @export 
 * @return {boolean} 
 */
box2d.b2TreeNode.prototype.IsLeaf = function() {
  return this.child1 === null;
}

/** 
 * A dynamic tree arranges data in a binary tree to accelerate
 * queries such as volume queries and ray casts. Leafs are proxies
 * with an AABB. In the tree we expand the proxy AABB by b2_fatAABBFactor
 * so that the proxy AABB is bigger than the client object. This allows the client
 * object to move by small amounts without triggering a tree update.
 *
 * Nodes are pooled and relocatable, so we use node indices rather than pointers.
 * @export 
 * @constructor
 */
box2d.b2DynamicTree = function() {}

/**
 * @export 
 * @type {box2d.b2TreeNode}
 */
box2d.b2DynamicTree.prototype.m_root = null;

//b2TreeNode* box2d.b2DynamicTree.prototype.m_nodes;
//int32 box2d.b2DynamicTree.prototype.m_nodeCount;
//int32 box2d.b2DynamicTree.prototype.m_nodeCapacity;

/**
 * @export 
 * @type {box2d.b2TreeNode}
 */
box2d.b2DynamicTree.prototype.m_freeList = null;

/** 
 * This is used to incrementally traverse the tree for 
 * re-balancing. 
 * @export 
 * @type {number}
 */
box2d.b2DynamicTree.prototype.m_path = 0;

/**
 * @export 
 * @type {number}
 */
box2d.b2DynamicTree.prototype.m_insertionCount = 0;

box2d.b2DynamicTree.s_stack = new box2d.b2GrowableStack(256);
box2d.b2DynamicTree.s_r = new box2d.b2Vec2();
box2d.b2DynamicTree.s_v = new box2d.b2Vec2();
box2d.b2DynamicTree.s_abs_v = new box2d.b2Vec2();
box2d.b2DynamicTree.s_segmentAABB = new box2d.b2AABB();
box2d.b2DynamicTree.s_subInput = new box2d.b2RayCastInput();
box2d.b2DynamicTree.s_combinedAABB = new box2d.b2AABB();
box2d.b2DynamicTree.s_aabb = new box2d.b2AABB();

/** 
 * Get proxy user data. 
 * @export 
 * @return {*} the proxy user data or 0 if the id is invalid.
 * @param {box2d.b2TreeNode} proxy
 */
box2d.b2DynamicTree.prototype.GetUserData = function(proxy) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(proxy !== null);
  }
  return proxy.userData;
}

/** 
 * Get the fat AABB for a proxy. 
 * @export 
 * @return {box2d.b2AABB} 
 * @param {box2d.b2TreeNode} proxy 
 */
box2d.b2DynamicTree.prototype.GetFatAABB = function(proxy) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(proxy !== null);
  }
  return proxy.aabb;
}

/** 
 * Query an AABB for overlapping proxies. The callback class is 
 * called for each proxy that overlaps the supplied AABB. 
 * @export 
 * @return {void} 
 * @param {function(box2d.b2TreeNode):boolean} callback
 * @param {box2d.b2AABB} aabb 
 */
box2d.b2DynamicTree.prototype.Query = function(callback, aabb) {
  if (this.m_root === null) return;

  /** @type {box2d.b2GrowableStack} */
  var stack = box2d.b2DynamicTree.s_stack.Reset();
  stack.Push(this.m_root);

  while (stack.GetCount() > 0) {
    /** @type {box2d.b2TreeNode} */
    var node = /** @type {box2d.b2TreeNode} */ (stack.Pop());
    if (node === null) {
      continue;
    }

    if (node.aabb.TestOverlap(aabb)) {
      if (node.IsLeaf()) {
        /** @type {boolean} */
        var proceed = callback(node);
        if (!proceed) {
          return;
        }
      } else {
        stack.Push(node.child1);
        stack.Push(node.child2);
      }
    }
  }
}

/**
 * Ray-cast against the proxies in the tree. This relies on the callback
 * to perform a exact ray-cast in the case were the proxy contains a shape.
 * The callback also performs the any collision filtering. This has performance
 * roughly equal to k * log(n), where k is the number of collisions and n is the
 * number of proxies in the tree.
 * @export 
 * @return {void} 
 * @param 
 *  	  {function(box2d.b2RayCastInput,box2d.b2TreeNode):number}
 *  	  callback a callback class that is called for each
 *  	  proxy that is hit by the ray.
 * @param {box2d.b2RayCastInput} input the ray-cast input data. 
 *  	  The ray extends from p1 to p1 + maxFraction * (p2 -
 *  	  p1).
 */
box2d.b2DynamicTree.prototype.RayCast = function(callback, input) {
  if (this.m_root === null) return;

  /** @type {box2d.b2Vec2} */
  var p1 = input.p1;
  /** @type {box2d.b2Vec2} */
  var p2 = input.p2;
  /** @type {box2d.b2Vec2} */
  var r = box2d.b2Sub_V2_V2(p2, p1, box2d.b2DynamicTree.s_r);
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(r.LengthSquared() > 0);
  }
  r.Normalize();

  // v is perpendicular to the segment.
  /** @type {box2d.b2Vec2} */
  var v = box2d.b2Cross_S_V2(1.0, r, box2d.b2DynamicTree.s_v);
  /** @type {box2d.b2Vec2} */
  var abs_v = box2d.b2Abs_V2(v, box2d.b2DynamicTree.s_abs_v);

  // Separating axis for segment (Gino, p80).
  // |dot(v, p1 - c)| > dot(|v|, h)

  /** @type {number} */
  var maxFraction = input.maxFraction;

  // Build a bounding box for the segment.
  /** @type {box2d.b2AABB} */
  var segmentAABB = box2d.b2DynamicTree.s_segmentAABB;
  /** @type {number} */
  var t_x = p1.x + maxFraction * (p2.x - p1.x);
  /** @type {number} */
  var t_y = p1.y + maxFraction * (p2.y - p1.y);
  segmentAABB.lowerBound.x = box2d.b2Min(p1.x, t_x);
  segmentAABB.lowerBound.y = box2d.b2Min(p1.y, t_y);
  segmentAABB.upperBound.x = box2d.b2Max(p1.x, t_x);
  segmentAABB.upperBound.y = box2d.b2Max(p1.y, t_y);

  /** @type {box2d.b2GrowableStack} */
  var stack = box2d.b2DynamicTree.s_stack.Reset();
  stack.Push(this.m_root);

  while (stack.GetCount() > 0) {
    /** @type {box2d.b2TreeNode} */
    var node = /** @type {box2d.b2TreeNode} */ (stack.Pop());
    if (node === null) {
      continue;
    }

    if (!box2d.b2TestOverlap_AABB(node.aabb, segmentAABB)) {
      continue;
    }

    // Separating axis for segment (Gino, p80).
    // |dot(v, p1 - c)| > dot(|v|, h)
    /** @type {box2d.b2Vec2} */
    var c = node.aabb.GetCenter();
    /** @type {box2d.b2Vec2} */
    var h = node.aabb.GetExtents();
    /** @type {number} */
    var separation = box2d.b2Abs(box2d.b2Dot_V2_V2(v, box2d.b2Sub_V2_V2(p1, c, box2d.b2Vec2.s_t0))) - box2d.b2Dot_V2_V2(abs_v, h);
    if (separation > 0) {
      continue;
    }

    if (node.IsLeaf()) {
      /** @type {box2d.b2RayCastInput} */
      var subInput = box2d.b2DynamicTree.s_subInput;
      subInput.p1.Copy(input.p1);
      subInput.p2.Copy(input.p2);
      subInput.maxFraction = maxFraction;

      /** @type {number} */
      var value = callback(subInput, node);

      if (value === 0) {
        // The client has terminated the ray cast.
        return;
      }

      if (value > 0) {
        // Update segment bounding box.
        maxFraction = value;
        t_x = p1.x + maxFraction * (p2.x - p1.x);
        t_y = p1.y + maxFraction * (p2.y - p1.y);
        segmentAABB.lowerBound.x = box2d.b2Min(p1.x, t_x);
        segmentAABB.lowerBound.y = box2d.b2Min(p1.y, t_y);
        segmentAABB.upperBound.x = box2d.b2Max(p1.x, t_x);
        segmentAABB.upperBound.y = box2d.b2Max(p1.y, t_y);
      }
    } else {
      stack.Push(node.child1);
      stack.Push(node.child2);
    }
  }
}

/**
 * @export 
 * @return {box2d.b2TreeNode}
 */
box2d.b2DynamicTree.prototype.AllocateNode = function() {
  // Expand the node pool as needed.
  if (this.m_freeList) {
    /** @type {box2d.b2TreeNode} */
    var node = this.m_freeList;
    this.m_freeList = node.parent; // this.m_freeList = node.next;
    node.parent = null;
    node.child1 = null;
    node.child2 = null;
    node.height = 0;
    node.userData = null;
    return node;
  }

  return new box2d.b2TreeNode(box2d.b2DynamicTree.prototype.s_node_id++);
}
box2d.b2DynamicTree.prototype.s_node_id = 0;

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2TreeNode} node
 */
box2d.b2DynamicTree.prototype.FreeNode = function(node) {
  node.parent = this.m_freeList; // node.next = this.m_freeList;
  node.height = -1;
  this.m_freeList = node;
}

/** 
 * Create a proxy. Provide a tight fitting AABB and a userData 
 * pointer. 
 * @export 
 * @return {box2d.b2TreeNode}
 * @param {box2d.b2AABB} aabb 
 * @param {*} userData 
 */
box2d.b2DynamicTree.prototype.CreateProxy = function(aabb, userData) {
  /** @type {box2d.b2TreeNode} */
  var node = this.AllocateNode();

  // Fatten the aabb.
  /** @type {number} */
  var r_x = box2d.b2_aabbExtension;
  /** @type {number} */
  var r_y = box2d.b2_aabbExtension;
  node.aabb.lowerBound.x = aabb.lowerBound.x - r_x;
  node.aabb.lowerBound.y = aabb.lowerBound.y - r_y;
  node.aabb.upperBound.x = aabb.upperBound.x + r_x;
  node.aabb.upperBound.y = aabb.upperBound.y + r_y;
  node.userData = userData;
  node.height = 0;

  this.InsertLeaf(node);

  return node;
}

/** 
 * Destroy a proxy. This asserts if the id is invalid. 
 * @export 
 * @return {void} 
 * @param {box2d.b2TreeNode} proxy
 */
box2d.b2DynamicTree.prototype.DestroyProxy = function(proxy) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(proxy.IsLeaf());
  }

  this.RemoveLeaf(proxy);
  this.FreeNode(proxy);
}

/** 
 * Move a proxy with a swepted AABB. If the proxy has moved 
 * outside of its fattened AABB, then the proxy is removed from 
 * the tree and re-inserted. Otherwise the function returns 
 * immediately. 
 * @export 
 * @return {boolean} true if the proxy was re-inserted.
 * @param {box2d.b2TreeNode} proxy
 * @param {box2d.b2AABB} aabb 
 * @param {box2d.b2Vec2} displacement 
 */
box2d.b2DynamicTree.prototype.MoveProxy = function(proxy, aabb, displacement) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(proxy.IsLeaf());
  }

  if (proxy.aabb.Contains(aabb)) {
    return false;
  }

  this.RemoveLeaf(proxy);

  // Extend AABB.
  // Predict AABB displacement.
  /** @type {number} */
  var r_x = box2d.b2_aabbExtension + box2d.b2_aabbMultiplier * (displacement.x > 0 ? displacement.x : (-displacement.x));
  /** @type {number} */
  var r_y = box2d.b2_aabbExtension + box2d.b2_aabbMultiplier * (displacement.y > 0 ? displacement.y : (-displacement.y));
  proxy.aabb.lowerBound.x = aabb.lowerBound.x - r_x;
  proxy.aabb.lowerBound.y = aabb.lowerBound.y - r_y;
  proxy.aabb.upperBound.x = aabb.upperBound.x + r_x;
  proxy.aabb.upperBound.y = aabb.upperBound.y + r_y;

  this.InsertLeaf(proxy);
  return true;
}

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2TreeNode} leaf
 */
box2d.b2DynamicTree.prototype.InsertLeaf = function(leaf) {
  ++this.m_insertionCount;

  if (this.m_root === null) {
    this.m_root = leaf;
    this.m_root.parent = null;
    return;
  }

  // Find the best sibling for this node
  /** @type {box2d.b2AABB} */
  var leafAABB = leaf.aabb;
  /** @type {box2d.b2Vec2} */
  var center = leafAABB.GetCenter();
  /** @type {box2d.b2TreeNode} */
  var index = this.m_root;
  /** @type {box2d.b2TreeNode} */
  var child1;
  /** @type {box2d.b2TreeNode} */
  var child2;
  while (!index.IsLeaf()) {
    child1 = index.child1;
    child2 = index.child2;

    /** @type {number} */
    var area = index.aabb.GetPerimeter();

    /** @type {box2d.b2AABB} */
    var combinedAABB = box2d.b2DynamicTree.s_combinedAABB;
    combinedAABB.Combine2(index.aabb, leafAABB);
    /** @type {number} */
    var combinedArea = combinedAABB.GetPerimeter();

    // Cost of creating a new parent for this node and the new leaf
    /** @type {number} */
    var cost = 2 * combinedArea;

    // Minimum cost of pushing the leaf further down the tree
    /** @type {number} */
    var inheritanceCost = 2 * (combinedArea - area);

    // Cost of descending into child1
    /** @type {number} */
    var cost1;
    /** @type {box2d.b2AABB} */
    var aabb = box2d.b2DynamicTree.s_aabb;
    /** @type {number} */
    var oldArea;
    /** @type {number} */
    var newArea;
    if (child1.IsLeaf()) {
      aabb.Combine2(leafAABB, child1.aabb);
      cost1 = aabb.GetPerimeter() + inheritanceCost;
    } else {
      aabb.Combine2(leafAABB, child1.aabb);
      oldArea = child1.aabb.GetPerimeter();
      newArea = aabb.GetPerimeter();
      cost1 = (newArea - oldArea) + inheritanceCost;
    }

    // Cost of descending into child2
    /** @type {number} */
    var cost2;
    if (child2.IsLeaf()) {
      aabb.Combine2(leafAABB, child2.aabb);
      cost2 = aabb.GetPerimeter() + inheritanceCost;
    } else {
      aabb.Combine2(leafAABB, child2.aabb);
      oldArea = child2.aabb.GetPerimeter();
      newArea = aabb.GetPerimeter();
      cost2 = newArea - oldArea + inheritanceCost;
    }

    // Descend according to the minimum cost.
    if (cost < cost1 && cost < cost2) {
      break;
    }

    // Descend
    if (cost1 < cost2) {
      index = child1;
    } else {
      index = child2;
    }
  }

  /** @type {box2d.b2TreeNode} */
  var sibling = index;

  // Create a parent for the siblings.
  /** @type {box2d.b2TreeNode} */
  var oldParent = sibling.parent;
  /** @type {box2d.b2TreeNode} */
  var newParent = this.AllocateNode();
  newParent.parent = oldParent;
  newParent.userData = null;
  newParent.aabb.Combine2(leafAABB, sibling.aabb);
  newParent.height = sibling.height + 1;

  if (oldParent) {
    // The sibling was not the root.
    if (oldParent.child1 === sibling) {
      oldParent.child1 = newParent;
    } else {
      oldParent.child2 = newParent;
    }

    newParent.child1 = sibling;
    newParent.child2 = leaf;
    sibling.parent = newParent;
    leaf.parent = newParent;
  } else {
    // The sibling was the root.
    newParent.child1 = sibling;
    newParent.child2 = leaf;
    sibling.parent = newParent;
    leaf.parent = newParent;
    this.m_root = newParent;
  }

  // Walk back up the tree fixing heights and AABBs
  index = leaf.parent;
  while (index !== null) {
    index = this.Balance(index);

    child1 = index.child1;
    child2 = index.child2;

    if (box2d.ENABLE_ASSERTS) {
      box2d.b2Assert(child1 !== null);
    }
    if (box2d.ENABLE_ASSERTS) {
      box2d.b2Assert(child2 !== null);
    }

    index.height = 1 + box2d.b2Max(child1.height, child2.height);
    index.aabb.Combine2(child1.aabb, child2.aabb);

    index = index.parent;
  }

  //this.Validate();
}

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2TreeNode} leaf
 */
box2d.b2DynamicTree.prototype.RemoveLeaf = function(leaf) {
  if (leaf === this.m_root) {
    this.m_root = null;
    return;
  }

  /** @type {box2d.b2TreeNode} */
  var parent = leaf.parent;
  /** @type {box2d.b2TreeNode} */
  var grandParent = parent.parent;
  /** @type {box2d.b2TreeNode} */
  var sibling;
  if (parent.child1 === leaf) {
    sibling = parent.child2;
  } else {
    sibling = parent.child1;
  }

  if (grandParent) {
    // Destroy parent and connect sibling to grandParent.
    if (grandParent.child1 === parent) {
      grandParent.child1 = sibling;
    } else {
      grandParent.child2 = sibling;
    }
    sibling.parent = grandParent;
    this.FreeNode(parent);

    // Adjust ancestor bounds.
    /** @type {box2d.b2TreeNode} */
    var index = grandParent;
    while (index) {
      index = this.Balance(index);

      /** @type {box2d.b2TreeNode} */
      var child1 = index.child1;
      /** @type {box2d.b2TreeNode} */
      var child2 = index.child2;

      index.aabb.Combine2(child1.aabb, child2.aabb);
      index.height = 1 + box2d.b2Max(child1.height, child2.height);

      index = index.parent;
    }
  } else {
    this.m_root = sibling;
    sibling.parent = null;
    this.FreeNode(parent);
  }

  //this.Validate();
}

/**
 * Perform a left or right rotation if node A is imbalanced.
 * Returns the new root index.
 * @export 
 * @param {box2d.b2TreeNode} A 
 * @return {box2d.b2TreeNode} 
 */
box2d.b2DynamicTree.prototype.Balance = function(A) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(A !== null);
  }

  if (A.IsLeaf() || A.height < 2) {
    return A;
  }

  /** @type {box2d.b2TreeNode} */
  var B = A.child1;
  /** @type {box2d.b2TreeNode} */
  var C = A.child2;

  /** @type {number} */
  var balance = C.height - B.height;

  // Rotate C up
  if (balance > 1) {
    /** @type {box2d.b2TreeNode} */
    var F = C.child1;
    /** @type {box2d.b2TreeNode} */
    var G = C.child2;

    // Swap A and C
    C.child1 = A;
    C.parent = A.parent;
    A.parent = C;

    // A's old parent should point to C
    if (C.parent !== null) {
      if (C.parent.child1 === A) {
        C.parent.child1 = C;
      } else {
        if (box2d.ENABLE_ASSERTS) {
          box2d.b2Assert(C.parent.child2 === A);
        }
        C.parent.child2 = C;
      }
    } else {
      this.m_root = C;
    }

    // Rotate
    if (F.height > G.height) {
      C.child2 = F;
      A.child2 = G;
      G.parent = A;
      A.aabb.Combine2(B.aabb, G.aabb);
      C.aabb.Combine2(A.aabb, F.aabb);

      A.height = 1 + box2d.b2Max(B.height, G.height);
      C.height = 1 + box2d.b2Max(A.height, F.height);
    } else {
      C.child2 = G;
      A.child2 = F;
      F.parent = A;
      A.aabb.Combine2(B.aabb, F.aabb);
      C.aabb.Combine2(A.aabb, G.aabb);

      A.height = 1 + box2d.b2Max(B.height, F.height);
      C.height = 1 + box2d.b2Max(A.height, G.height);
    }

    return C;
  }

  // Rotate B up
  if (balance < -1) {
    /** @type {box2d.b2TreeNode} */
    var D = B.child1;
    /** @type {box2d.b2TreeNode} */
    var E = B.child2;

    // Swap A and B
    B.child1 = A;
    B.parent = A.parent;
    A.parent = B;

    // A's old parent should point to B
    if (B.parent !== null) {
      if (B.parent.child1 === A) {
        B.parent.child1 = B;
      } else {
        if (box2d.ENABLE_ASSERTS) {
          box2d.b2Assert(B.parent.child2 === A);
        }
        B.parent.child2 = B;
      }
    } else {
      this.m_root = B;
    }

    // Rotate
    if (D.height > E.height) {
      B.child2 = D;
      A.child1 = E;
      E.parent = A;
      A.aabb.Combine2(C.aabb, E.aabb);
      B.aabb.Combine2(A.aabb, D.aabb);

      A.height = 1 + box2d.b2Max(C.height, E.height);
      B.height = 1 + box2d.b2Max(A.height, D.height);
    } else {
      B.child2 = E;
      A.child1 = D;
      D.parent = A;
      A.aabb.Combine2(C.aabb, D.aabb);
      B.aabb.Combine2(A.aabb, E.aabb);

      A.height = 1 + box2d.b2Max(C.height, D.height);
      B.height = 1 + box2d.b2Max(A.height, E.height);
    }

    return B;
  }

  return A;
}

/** 
 * Compute the height of the binary tree in O(N) time. Should 
 * not be called often. 
 * @export 
 * @return {number} 
 */
box2d.b2DynamicTree.prototype.GetHeight = function() {
  if (this.m_root === null) {
    return 0;
  }

  return this.m_root.height;
}

/** 
 * Get the ratio of the sum of the node areas to the root area. 
 * @export 
 * @return {number} 
 */
box2d.b2DynamicTree.prototype.GetAreaRatio = function() {
  if (this.m_root === null) {
    return 0;
  }

  /** @type {box2d.b2TreeNode} */
  var root = this.m_root;
  /** @type {number} */
  var rootArea = root.aabb.GetPerimeter();

  var GetAreaNode = function(node) {
      if (node === null) {
        return 0;
      }

      if (node.IsLeaf()) {
        return 0;
      }

      /** @type {number} */
      var area = node.aabb.GetPerimeter();
      area += GetAreaNode(node.child1);
      area += GetAreaNode(node.child2);
      return area;
    }
    /** @type {number} */
  var totalArea = GetAreaNode(this.m_root);

  /*
  float32 totalArea = 0.0;
  for (int32 i = 0; i < m_nodeCapacity; ++i)
  {
  	const b2TreeNode* node = m_nodes + i;
  	if (node.height < 0)
  	{
  		// Free node in pool
  		continue;
  	}

  	totalArea += node.aabb.GetPerimeter();
  }
  */

  return totalArea / rootArea;
}

/** 
 * Compute the height of a sub-tree. 
 * @export 
 * @return {number} 
 * @param {box2d.b2TreeNode} node 
 */
box2d.b2DynamicTree.prototype.ComputeHeightNode = function(node) {
  if (node.IsLeaf()) {
    return 0;
  }

  /** @type {number} */
  var height1 = this.ComputeHeightNode(node.child1);
  /** @type {number} */
  var height2 = this.ComputeHeightNode(node.child2);
  return 1 + box2d.b2Max(height1, height2);
}

/**
 * @export 
 * @return {number} 
 */
box2d.b2DynamicTree.prototype.ComputeHeight = function() {
  /** @type {number} */
  var height = this.ComputeHeightNode(this.m_root);
  return height;
}

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2TreeNode} index 
 */
box2d.b2DynamicTree.prototype.ValidateStructure = function(index) {
  if (index === null) {
    return;
  }

  if (index === this.m_root) {
    if (box2d.ENABLE_ASSERTS) {
      box2d.b2Assert(index.parent === null);
    }
  }

  /** @type {box2d.b2TreeNode} */
  var node = index;

  /** @type {box2d.b2TreeNode} */
  var child1 = node.child1;
  /** @type {box2d.b2TreeNode} */
  var child2 = node.child2;

  if (node.IsLeaf()) {
    if (box2d.ENABLE_ASSERTS) {
      box2d.b2Assert(child1 === null);
    }
    if (box2d.ENABLE_ASSERTS) {
      box2d.b2Assert(child2 === null);
    }
    if (box2d.ENABLE_ASSERTS) {
      box2d.b2Assert(node.height === 0);
    }
    return;
  }

  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(child1.parent === index);
  }
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(child2.parent === index);
  }

  this.ValidateStructure(child1);
  this.ValidateStructure(child2);
}

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2TreeNode} index
 */
box2d.b2DynamicTree.prototype.ValidateMetrics = function(index) {
  if (index === null) {
    return;
  }

  /** @type {box2d.b2TreeNode} */
  var node = index;

  /** @type {box2d.b2TreeNode} */
  var child1 = node.child1;
  /** @type {box2d.b2TreeNode} */
  var child2 = node.child2;

  if (node.IsLeaf()) {
    if (box2d.ENABLE_ASSERTS) {
      box2d.b2Assert(child1 === null);
    }
    if (box2d.ENABLE_ASSERTS) {
      box2d.b2Assert(child2 === null);
    }
    if (box2d.ENABLE_ASSERTS) {
      box2d.b2Assert(node.height === 0);
    }
    return;
  }

  /** @type {number} */
  var height1 = child1.height;
  /** @type {number} */
  var height2 = child2.height;
  /** @type {number} */
  var height;
  height = 1 + box2d.b2Max(height1, height2);
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(node.height === height);
  }

  /** @type {box2d.b2AABB} */
  var aabb = box2d.b2DynamicTree.s_aabb;
  aabb.Combine2(child1.aabb, child2.aabb);

  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(aabb.lowerBound === node.aabb.lowerBound);
  }
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(aabb.upperBound === node.aabb.upperBound);
  }

  this.ValidateMetrics(child1);
  this.ValidateMetrics(child2);
}

/** 
 * Validate this tree. For testing. 
 * @export 
 * @return {void} 
 */
box2d.b2DynamicTree.prototype.Validate = function() {
  this.ValidateStructure(this.m_root);
  this.ValidateMetrics(this.m_root);

  /** @type {number} */
  var freeCount = 0;
  /** @type {box2d.b2TreeNode} */
  var freeIndex = this.m_freeList;
  while (freeIndex !== null) {
    freeIndex = freeIndex.parent; //freeIndex = freeIndex.next;
    ++freeCount;
  }

  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(this.GetHeight() === this.ComputeHeight());
  }
}

/** 
 * Get the maximum balance of an node in the tree. The balance 
 * is the difference in height of the two children of a node. 
 * @export 
 * @return {number} 
 */
box2d.b2DynamicTree.prototype.GetMaxBalance = function() {
  var GetMaxBalanceNode = function(node, maxBalance) {
    if (node === null) {
      return maxBalance;
    }

    if (node.height <= 1) {
      return maxBalance;
    }

    if (box2d.ENABLE_ASSERTS) {
      box2d.b2Assert(!node.IsLeaf());
    }

    /** @type {box2d.b2TreeNode} */
    var child1 = node.child1;
    /** @type {box2d.b2TreeNode} */
    var child2 = node.child2;
    /** @type {number} */
    var balance = box2d.b2Abs(child2.height - child1.height);
    return box2d.b2Max(maxBalance, balance);
  }

  /** @type {number} */
  var maxBalance = GetMaxBalanceNode(this.m_root, 0);

  /*
  int32 maxBalance = 0;
  for (int32 i = 0; i < m_nodeCapacity; ++i)
  {
  	const b2TreeNode* node = m_nodes + i;
  	if (node.height <= 1)
  	{
  		continue;
  	}

  	b2Assert(!node.IsLeaf());

  	int32 child1 = node.child1;
  	int32 child2 = node.child2;
  	int32 balance = b2Abs(m_nodes[child2].height - m_nodes[child1].height);
  	maxBalance = b2Max(maxBalance, balance);
  }
  */

  return maxBalance;
}

/** 
 * Build an optimal tree. Very expensive. For testing. 
 * @export 
 * @return {void} 
 */
box2d.b2DynamicTree.prototype.RebuildBottomUp = function() {
  /* 
  int32* nodes = (int32*)b2Alloc(m_nodeCount * sizeof(int32));
  int32 count = 0;

  // Build array of leaves. Free the rest.
  for (int32 i = 0; i < m_nodeCapacity; ++i)
  {
  	if (m_nodes[i].height < 0)
  	{
  		// free node in pool
  		continue;
  	}

  	if (m_nodes[i].IsLeaf())
  	{
  		m_nodes[i].parent = b2_nullNode;
  		nodes[count] = i;
  		++count;
  	}
  	else
  	{
  		FreeNode(i);
  	}
  }

  while (count > 1)
  {
  	float32 minCost = b2_maxFloat;
  	int32 iMin = -1, jMin = -1;
  	for (int32 i = 0; i < count; ++i)
  	{
  		b2AABB aabbi = m_nodes[nodes[i]].aabb;

  		for (int32 j = i + 1; j < count; ++j)
  		{
  			b2AABB aabbj = m_nodes[nodes[j]].aabb;
  			b2AABB b;
  			b.Combine(aabbi, aabbj);
  			float32 cost = b.GetPerimeter();
  			if (cost < minCost)
  			{
  				iMin = i;
  				jMin = j;
  				minCost = cost;
  			}
  		}
  	}

  	int32 index1 = nodes[iMin];
  	int32 index2 = nodes[jMin];
  	b2TreeNode* child1 = m_nodes + index1;
  	b2TreeNode* child2 = m_nodes + index2;

  	int32 parentIndex = AllocateNode();
  	b2TreeNode* parent = m_nodes + parentIndex;
  	parent.child1 = index1;
  	parent.child2 = index2;
  	parent.height = 1 + b2Max(child1.height, child2.height);
  	parent.aabb.Combine(child1.aabb, child2.aabb);
  	parent.parent = b2_nullNode;

  	child1.parent = parentIndex;
  	child2.parent = parentIndex;

  	nodes[jMin] = nodes[count-1];
  	nodes[iMin] = parentIndex;
  	--count;
  }

  m_root = nodes[0];
  b2Free(nodes);
  */

  this.Validate();
}

/**
 * Shift the world origin. Useful for large worlds.
 * The shift formula is: position -= newOrigin
 * @export 
 * @param {box2d.b2Vec2} newOrigin the new origin with respect to the old origin
 * @return {void} 
 */
box2d.b2DynamicTree.prototype.ShiftOrigin = function(newOrigin) {
  var ShiftOriginNode = function(node, newOrigin) {
    if (node === null) {
      return;
    }

    if (node.height <= 1) {
      return;
    }

    if (box2d.ENABLE_ASSERTS) {
      box2d.b2Assert(!node.IsLeaf());
    }

    /** @type {box2d.b2TreeNode} */
    var child1 = node.child1;
    /** @type {box2d.b2TreeNode} */
    var child2 = node.child2;
    ShiftOriginNode(child1, newOrigin);
    ShiftOriginNode(child2, newOrigin);

    node.aabb.lowerBound.SelfSub(newOrigin);
    node.aabb.upperBound.SelfSub(newOrigin);
  }

  ShiftOriginNode(this.m_root, newOrigin);

  /*
  // Build array of leaves. Free the rest.
  for (int32 i = 0; i < m_nodeCapacity; ++i)
  {
  	m_nodes[i].aabb.lowerBound -= newOrigin;
  	m_nodes[i].aabb.upperBound -= newOrigin;
  }
  */
}
