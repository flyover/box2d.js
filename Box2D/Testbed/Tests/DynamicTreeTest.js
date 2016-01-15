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

goog.provide('box2d.Testbed.DynamicTreeTest');

goog.require('box2d.Testbed.Test');

/**
 * @export
 * @constructor
 */
box2d.Testbed.Actor = function() {
  this.aabb = new box2d.b2AABB();
};

/**
 * @export
 * @type {box2d.b2AABB}
 */
box2d.Testbed.Actor.prototype.aabb = null;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.Actor.prototype.fraction = 0.0;
/**
 * @export
 * @type {boolean}
 */
box2d.Testbed.Actor.prototype.overlap = false;
/**
 * @export
 * @type {box2d.b2TreeNode}
 */
box2d.Testbed.Actor.prototype.proxyId = null;

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.DynamicTreeTest = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  this.m_tree = new box2d.b2DynamicTree();
  this.m_queryAABB = new box2d.b2AABB();
  this.m_rayCastInput = new box2d.b2RayCastInput();
  this.m_rayCastOutput = new box2d.b2RayCastOutput();
  this.m_actors = new Array(box2d.Testbed.DynamicTreeTest.e_actorCount);
  for (var i = 0; i < box2d.Testbed.DynamicTreeTest.e_actorCount; ++i) {
    this.m_actors[i] = new box2d.Testbed.Actor();
  }

  this.m_worldExtent = 15.0;
  this.m_proxyExtent = 0.5;

  //srand(888);

  for (var i = 0; i < box2d.Testbed.DynamicTreeTest.e_actorCount; ++i) {
    var actor = this.m_actors[i];
    this.GetRandomAABB(actor.aabb);
    actor.proxyId = this.m_tree.CreateProxy(actor.aabb, actor);
  }

  this.m_stepCount = 0;

  var h = this.m_worldExtent;
  this.m_queryAABB.lowerBound.Set(-3.0, -4.0 + h);
  this.m_queryAABB.upperBound.Set(5.0, 6.0 + h);

  this.m_rayCastInput.p1.Set(-5.0, 5.0 + h);
  this.m_rayCastInput.p2.Set(7.0, -4.0 + h);
  //this.m_rayCastInput.p1.Set(0.0, 2.0 + h);
  //this.m_rayCastInput.p2.Set(0.0, -2.0 + h);
  this.m_rayCastInput.maxFraction = 1.0;

  this.m_automated = false;
}

goog.inherits(box2d.Testbed.DynamicTreeTest, box2d.Testbed.Test);

/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.DynamicTreeTest.e_actorCount = 128;

/**
 * @export
 * @type {number}
 */
box2d.Testbed.DynamicTreeTest.prototype.m_worldExtent = 0.0;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.DynamicTreeTest.prototype.m_proxyExtent = 0.0;
/**
 * @export
 * @type {box2d.b2DynamicTree}
 */
box2d.Testbed.DynamicTreeTest.prototype.m_tree = null;
/**
 * @export
 * @type {box2d.b2AABB}
 */
box2d.Testbed.DynamicTreeTest.prototype.m_queryAABB = null;
/**
 * @export
 * @type {box2d.b2RayCastInput}
 */
box2d.Testbed.DynamicTreeTest.prototype.m_rayCastInput = null;
/**
 * @export
 * @type {box2d.b2RayCastOutput}
 */
box2d.Testbed.DynamicTreeTest.prototype.m_rayCastOutput = null;
/**
 * @export
 * @type {box2d.Testbed.Actor}
 */
box2d.Testbed.DynamicTreeTest.prototype.m_actor = null;
/**
 * @export
 * @type {Array.<box2d.Testbed.Actor>}
 */
box2d.Testbed.DynamicTreeTest.prototype.m_actors = null;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.DynamicTreeTest.prototype.m_stepCount = 0;
/**
 * @export
 * @type {boolean}
 */
box2d.Testbed.DynamicTreeTest.prototype.m_automated = false;

/**
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.DynamicTreeTest.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);

  this.m_rayActor = null;
  for (var i = 0; i < box2d.Testbed.DynamicTreeTest.e_actorCount; ++i) {
    this.m_actors[i].fraction = 1.0;
    this.m_actors[i].overlap = false;
  }

  if (this.m_automated) {
    var actionCount = box2d.b2Max(1, box2d.Testbed.DynamicTreeTest.e_actorCount >> 2);

    for (var i = 0; i < actionCount; ++i) {
      this.Action();
    }
  }

  this.Query();
  this.RayCast();

  for (var i = 0; i < box2d.Testbed.DynamicTreeTest.e_actorCount; ++i) {
    var actor = this.m_actors[i];
    if (actor.proxyId === null)
      continue;

    var c = new box2d.b2Color(0.9, 0.9, 0.9);
    if (actor === this.m_rayActor && actor.overlap) {
      c.SetRGB(0.9, 0.6, 0.6);
    } else if (actor === this.m_rayActor) {
      c.SetRGB(0.6, 0.9, 0.6);
    } else if (actor.overlap) {
      c.SetRGB(0.6, 0.6, 0.9);
    }

    this.m_debugDraw.DrawAABB(actor.aabb, c);
  }

  var c = new box2d.b2Color(0.7, 0.7, 0.7);
  this.m_debugDraw.DrawAABB(this.m_queryAABB, c);

  this.m_debugDraw.DrawSegment(this.m_rayCastInput.p1, this.m_rayCastInput.p2, c);

  var c1 = new box2d.b2Color(0.2, 0.9, 0.2);
  var c2 = new box2d.b2Color(0.9, 0.2, 0.2);
  this.m_debugDraw.DrawPoint(this.m_rayCastInput.p1, 6.0, c1);
  this.m_debugDraw.DrawPoint(this.m_rayCastInput.p2, 6.0, c2);

  if (this.m_rayActor) {
    var cr = new box2d.b2Color(0.2, 0.2, 0.9);
    //box2d.b2Vec2 p = this.m_rayCastInput.p1 + this.m_rayActor.fraction * (this.m_rayCastInput.p2 - this.m_rayCastInput.p1);
    var p = box2d.b2Add_V2_V2(this.m_rayCastInput.p1, box2d.b2Mul_S_V2(this.m_rayActor.fraction, box2d.b2Sub_V2_V2(this.m_rayCastInput.p2, this.m_rayCastInput.p1, new box2d.b2Vec2()), new box2d.b2Vec2()), new box2d.b2Vec2());
    this.m_debugDraw.DrawPoint(p, 6.0, cr);
  }

  {
    var height = this.m_tree.GetHeight();
    this.m_debugDraw.DrawString(5, this.m_textLine, "dynamic tree height = %d", height);
    this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
  }

  ++this.m_stepCount;
}

/**
 * @export
 * @return {void}
 * @param {number} key
 */
box2d.Testbed.DynamicTreeTest.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.A:
      this.m_automated = !this.m_automated;
      break;

    case goog.events.KeyCodes.C:
      this.CreateProxy();
      break;

    case goog.events.KeyCodes.D:
      this.DestroyProxy();
      break;

    case goog.events.KeyCodes.M:
      this.MoveProxy();
      break;
  }
}

//bool QueryCallback(int32 proxyId)
/*
box2d.Testbed.DynamicTreeTest.prototype.QueryCallback = function (proxyId)
{
  var actor = this.m_tree.GetUserData(proxyId);
  actor.overlap = box2d.b2TestOverlap_AABB(this.m_queryAABB, actor.aabb);
  return true;
}
*/

//float32 RayCastCallback(const box2d.b2RayCastInput& input, int32 proxyId)
/*
box2d.Testbed.DynamicTreeTest.prototype.RayCastCallback = function (input, proxyId)
{
  var actor = this.m_tree.GetUserData(proxyId);

  var output = new box2d.b2RayCastOutput();
  var hit = actor.aabb.RayCast(output, input);

  if (hit)
  {
    this.m_rayCastOutput = output;
    this.m_rayActor = actor;
    this.m_rayActor.fraction = output.fraction;
    return output.fraction;
  }

  return input.maxFraction;
}
*/

//void GetRandomAABB(box2d.b2AABB* aabb)
/**
 * @export
 * @return {void}
 * @param {box2d.b2AABB} aabb
 */
box2d.Testbed.DynamicTreeTest.prototype.GetRandomAABB = function(aabb) {
  var w = new box2d.b2Vec2();
  w.Set(2.0 * this.m_proxyExtent, 2.0 * this.m_proxyExtent);
  //aabb.lowerBound.x = -this.m_proxyExtent;
  //aabb.lowerBound.y = -this.m_proxyExtent + this.m_worldExtent;
  aabb.lowerBound.x = box2d.b2RandomRange(-this.m_worldExtent, this.m_worldExtent);
  aabb.lowerBound.y = box2d.b2RandomRange(0.0, 2.0 * this.m_worldExtent);
  aabb.upperBound.Copy(aabb.lowerBound);
  aabb.upperBound.SelfAdd(w);
}

//void MoveAABB(box2d.b2AABB* aabb)
/**
 * @export
 * @return {void}
 * @param {box2d.b2AABB} aabb
 */
box2d.Testbed.DynamicTreeTest.prototype.MoveAABB = function(aabb) {
  var d = new box2d.b2Vec2();
  d.x = box2d.b2RandomRange(-0.5, 0.5);
  d.y = box2d.b2RandomRange(-0.5, 0.5);
  //d.x = 2.0;
  //d.y = 0.0;
  aabb.lowerBound.SelfAdd(d);
  aabb.upperBound.SelfAdd(d);

  //box2d.b2Vec2 c0 = 0.5 * (aabb.lowerBound + aabb.upperBound);
  var c0 = box2d.b2Mul_S_V2(0.5, box2d.b2Add_V2_V2(aabb.lowerBound, aabb.upperBound, box2d.b2Vec2.s_t0), new box2d.b2Vec2());
  var min = new box2d.b2Vec2(-this.m_worldExtent, 0.0);
  var max = new box2d.b2Vec2(this.m_worldExtent, 2.0 * this.m_worldExtent);
  var c = box2d.b2Clamp_V2_V2_V2(c0, min, max, new box2d.b2Vec2());

  aabb.lowerBound.SelfAdd(box2d.b2Sub_V2_V2(c, c0, new box2d.b2Vec2()));
  aabb.upperBound.SelfAdd(box2d.b2Sub_V2_V2(c, c0, new box2d.b2Vec2()));
}

//void CreateProxy()
/**
 * @export
 * @return {void}
 */
box2d.Testbed.DynamicTreeTest.prototype.CreateProxy = function() {
  for (var i = 0; i < box2d.Testbed.DynamicTreeTest.e_actorCount; ++i) {
    var j = 0 | box2d.b2RandomRange(0, box2d.Testbed.DynamicTreeTest.e_actorCount);
    var actor = this.m_actors[j];
    if (actor.proxyId === null) {
      this.GetRandomAABB(actor.aabb);
      actor.proxyId = this.m_tree.CreateProxy(actor.aabb, actor);
      return;
    }
  }
}

//void DestroyProxy()
/**
 * @export
 * @return {void}
 */
box2d.Testbed.DynamicTreeTest.prototype.DestroyProxy = function() {
  for (var i = 0; i < box2d.Testbed.DynamicTreeTest.e_actorCount; ++i) {
    var j = 0 | box2d.b2RandomRange(0, box2d.Testbed.DynamicTreeTest.e_actorCount);
    var actor = this.m_actors[j];
    if (actor.proxyId !== null) {
      this.m_tree.DestroyProxy(actor.proxyId);
      actor.proxyId = null;
      return;
    }
  }
}

//void MoveProxy()
/**
 * @export
 * @return {void}
 */
box2d.Testbed.DynamicTreeTest.prototype.MoveProxy = function() {
  for (var i = 0; i < box2d.Testbed.DynamicTreeTest.e_actorCount; ++i) {
    var j = 0 | box2d.b2RandomRange(0, box2d.Testbed.DynamicTreeTest.e_actorCount);
    var actor = this.m_actors[j];
    if (actor.proxyId === null) {
      continue;
    }

    var aabb0 = new box2d.b2AABB();
    aabb0.Copy(actor.aabb);
    this.MoveAABB(actor.aabb);
    var displacement = box2d.b2Sub_V2_V2(actor.aabb.GetCenter(), aabb0.GetCenter(), new box2d.b2Vec2());
    this.m_tree.MoveProxy(actor.proxyId, actor.aabb, displacement);
    return;
  }
}

//void Action()
/**
 * @export
 * @return {void}
 */
box2d.Testbed.DynamicTreeTest.prototype.Action = function() {
  var choice = 0 | box2d.b2RandomRange(0, 20);

  switch (choice) {
    case 0:
      this.CreateProxy();
      break;

    case 1:
      this.DestroyProxy();
      break;

    default:
      this.MoveProxy();
  }
}

//void Query()
/**
 * @export
 * @return {void}
 */
box2d.Testbed.DynamicTreeTest.prototype.Query = function() {
  var that = this;

  /**
   * @param {box2d.b2TreeNode} proxyId
   * @return {boolean}
   */
  var QueryCallback = function(proxyId) {
    var actor = that.m_tree.GetUserData(proxyId);
    actor.overlap = box2d.b2TestOverlap_AABB(that.m_queryAABB, actor.aabb);
    return true;
  }

  //this.m_tree.Query(this, this.m_queryAABB);
  this.m_tree.Query(QueryCallback, this.m_queryAABB);

  for (var i = 0; i < box2d.Testbed.DynamicTreeTest.e_actorCount; ++i) {
    if (this.m_actors[i].proxyId === null) {
      continue;
    }

    var overlap = box2d.b2TestOverlap_AABB(this.m_queryAABB, this.m_actors[i].aabb);
    if (box2d.ENABLE_ASSERTS) {
      box2d.b2Assert(overlap === this.m_actors[i].overlap);
    }
  }
}

//void RayCast()
/**
 * @export
 * @return {void}
 */
box2d.Testbed.DynamicTreeTest.prototype.RayCast = function() {
  var that = this;

  /**
   * @param {box2d.b2RayCastInput} input
   * @param {box2d.b2TreeNode} proxyId
   * @return {number}
   */
  var RayCastCallback = function(input, proxyId) {
    var actor = that.m_tree.GetUserData(proxyId);

    var output = new box2d.b2RayCastOutput();
    var hit = actor.aabb.RayCast(output, input);

    if (hit) {
      that.m_rayCastOutput = output;
      that.m_rayActor = actor;
      that.m_rayActor.fraction = output.fraction;
      return output.fraction;
    }

    return input.maxFraction;
  }

  this.m_rayActor = null;

  var input = new box2d.b2RayCastInput();
  input.Copy(this.m_rayCastInput);

  // Ray cast against the dynamic tree.
  //this.m_tree.RayCast(this, input);
  this.m_tree.RayCast(RayCastCallback, input);

  // Brute force ray cast.
  var bruteActor = null;
  var bruteOutput = new box2d.b2RayCastOutput();
  for (var i = 0; i < box2d.Testbed.DynamicTreeTest.e_actorCount; ++i) {
    if (this.m_actors[i].proxyId === null) {
      continue;
    }

    var output = new box2d.b2RayCastOutput();
    var hit = this.m_actors[i].aabb.RayCast(output, input);
    if (hit) {
      bruteActor = this.m_actors[i];
      bruteOutput = output;
      input.maxFraction = output.fraction;
    }
  }

  /*
  if (bruteActor !== null)
  {
    if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(bruteOutput.fraction === this.m_rayCastOutput.fraction); }
  }
  */
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.DynamicTreeTest.Create = function(canvas, settings) {
  return new box2d.Testbed.DynamicTreeTest(canvas, settings);
}
