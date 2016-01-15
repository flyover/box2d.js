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

//#if B2_ENABLE_CONTROLLER

goog.provide('box2d.b2Controller');

goog.require('box2d.b2Settings');

/**
 * A controller edge is used to connect bodies and controllers
 * together in a bipartite graph.
 * @export
 * @constructor
 */
box2d.b2ControllerEdge = function() {};

/**
 * @export
 * @type {box2d.b2Controller}
 */
box2d.b2ControllerEdge.prototype.controller = null; ///< provides quick access to other end of this edge.
/**
 * @export
 * @type {box2d.b2Body}
 */
box2d.b2ControllerEdge.prototype.body = null; ///< the body
/**
 * @export
 * @type {box2d.b2ControllerEdge}
 */
box2d.b2ControllerEdge.prototype.prevBody = null; ///< the previous controller edge in the controllers's joint list
/**
 * @export
 * @type {box2d.b2ControllerEdge}
 */
box2d.b2ControllerEdge.prototype.nextBody = null; ///< the next controller edge in the controllers's joint list
/**
 * @export
 * @type {box2d.b2ControllerEdge}
 */
box2d.b2ControllerEdge.prototype.prevController = null; ///< the previous controller edge in the body's joint list
/**
 * @export
 * @type {box2d.b2ControllerEdge}
 */
box2d.b2ControllerEdge.prototype.nextController = null; ///< the next controller edge in the body's joint list

/**
 * Base class for controllers. Controllers are a convience for
 * encapsulating common per-step functionality.
 * @export
 * @constructor
 */
box2d.b2Controller = function() {};

/**
 * @export
 * @type {box2d.b2World}
 */
box2d.b2Controller.prototype.m_world = null;
/**
 * @export
 * @type {box2d.b2ControllerEdge}
 */
box2d.b2Controller.prototype.m_bodyList = null;
/**
 * @export
 * @type {number}
 */
box2d.b2Controller.prototype.m_bodyCount = 0;
/**
 * @export
 * @type {box2d.b2Controller}
 */
box2d.b2Controller.prototype.m_prev = null;
/**
 * @export
 * @type {box2d.b2Controller}
 */
box2d.b2Controller.prototype.m_next = null;

/**
 * Controllers override this to implement per-step
 * functionality.
 * @export
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2Controller.prototype.Step = function(step) {}

/**
 * Controllers override this to provide debug drawing.
 * @export
 * @return {void}
 * @param {box2d.b2Draw} debugDraw
 */
box2d.b2Controller.prototype.Draw = function(debugDraw) {}

/**
 * Get the next controller in the world's body list.
 * @export
 * @return {box2d.b2Controller}
 */
box2d.b2Controller.prototype.GetNext = function() {
  return this.m_next;
}

/**
 * Get the previous controller in the world's body list.
 * @export
 * @return {box2d.b2Controller}
 */
box2d.b2Controller.prototype.GetPrev = function() {
  return this.m_prev;
}

/**
 * Get the parent world of this body.
 * @export
 * @return {box2d.b2World}
 */
box2d.b2Controller.prototype.GetWorld = function() {
  return this.m_world;
}

/**
 * Get the attached body list
 * @export
 * @return {box2d.b2ControllerEdge}
 */
box2d.b2Controller.prototype.GetBodyList = function() {
  return this.m_bodyList;
}

/**
 * Adds a body to the controller list.
 * @export
 * @return {void}
 * @param {box2d.b2Body} body
 */
box2d.b2Controller.prototype.AddBody = function(body) {
  var edge = new box2d.b2ControllerEdge();

  edge.body = body;
  edge.controller = this;

  //Add edge to controller list
  edge.nextBody = this.m_bodyList;
  edge.prevBody = null;
  if (this.m_bodyList)
    this.m_bodyList.prevBody = edge;
  this.m_bodyList = edge;
  ++this.m_bodyCount;

  //Add edge to body list
  edge.nextController = body.m_controllerList;
  edge.prevController = null;
  if (body.m_controllerList)
    body.m_controllerList.prevController = edge;
  body.m_controllerList = edge;
  ++body.m_controllerCount;
}

/**
 * Removes a body from the controller list.
 * @export
 * @return {void}
 * @param {box2d.b2Body} body
 */
box2d.b2Controller.prototype.RemoveBody = function(body) {
  //Assert that the controller is not empty
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(this.m_bodyCount > 0);
  }

  //Find the corresponding edge
  /*b2ControllerEdge*/
  var edge = this.m_bodyList;
  while (edge && edge.body !== body)
    edge = edge.nextBody;

  //Assert that we are removing a body that is currently attached to the controller
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(edge !== null);
  }

  //Remove edge from controller list
  if (edge.prevBody)
    edge.prevBody.nextBody = edge.nextBody;
  if (edge.nextBody)
    edge.nextBody.prevBody = edge.prevBody;
  if (this.m_bodyList === edge)
    this.m_bodyList = edge.nextBody;
  --this.m_bodyCount;

  //Remove edge from body list
  if (edge.nextController)
    edge.nextController.prevController = edge.prevController;
  if (edge.prevController)
    edge.prevController.nextController = edge.nextController;
  if (body.m_controllerList === edge)
    body.m_controllerList = edge.nextController;
  --body.m_controllerCount;
}

/**
 * Removes all bodies from the controller list.
 * @export
 * @return {void}
 */
box2d.b2Controller.prototype.Clear = function() {
  while (this.m_bodyList) {
    this.RemoveBody(this.m_bodyList.body);
  }

  this.m_bodyCount = 0;
}

//#endif
