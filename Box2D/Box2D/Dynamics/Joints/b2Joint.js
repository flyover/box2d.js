/*
 * Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
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

goog.provide('box2d.b2Joint');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Math');

/** 
 * @export 
 * @enum
 */
box2d.b2JointType = {
  e_unknownJoint: 0,
  e_revoluteJoint: 1,
  e_prismaticJoint: 2,
  e_distanceJoint: 3,
  e_pulleyJoint: 4,
  e_mouseJoint: 5,
  e_gearJoint: 6,
  e_wheelJoint: 7,
  e_weldJoint: 8,
  e_frictionJoint: 9,
  e_ropeJoint: 10,
  e_motorJoint: 11,
  e_areaJoint: 12
};
goog.exportProperty(box2d.b2JointType, 'e_unknownJoint', box2d.b2JointType.e_unknownJoint);
goog.exportProperty(box2d.b2JointType, 'e_revoluteJoint', box2d.b2JointType.e_revoluteJoint);
goog.exportProperty(box2d.b2JointType, 'e_prismaticJoint', box2d.b2JointType.e_prismaticJoint);
goog.exportProperty(box2d.b2JointType, 'e_distanceJoint', box2d.b2JointType.e_distanceJoint);
goog.exportProperty(box2d.b2JointType, 'e_pulleyJoint', box2d.b2JointType.e_pulleyJoint);
goog.exportProperty(box2d.b2JointType, 'e_mouseJoint', box2d.b2JointType.e_mouseJoint);
goog.exportProperty(box2d.b2JointType, 'e_gearJoint', box2d.b2JointType.e_gearJoint);
goog.exportProperty(box2d.b2JointType, 'e_wheelJoint', box2d.b2JointType.e_wheelJoint);
goog.exportProperty(box2d.b2JointType, 'e_weldJoint', box2d.b2JointType.e_weldJoint);
goog.exportProperty(box2d.b2JointType, 'e_frictionJoint', box2d.b2JointType.e_frictionJoint);
goog.exportProperty(box2d.b2JointType, 'e_ropeJoint', box2d.b2JointType.e_ropeJoint);
goog.exportProperty(box2d.b2JointType, 'e_motorJoint', box2d.b2JointType.e_motorJoint);
goog.exportProperty(box2d.b2JointType, 'e_areaJoint', box2d.b2JointType.e_areaJoint);

/** 
 * @export 
 * @enum
 */
box2d.b2LimitState = {
  e_inactiveLimit: 0,
  e_atLowerLimit: 1,
  e_atUpperLimit: 2,
  e_equalLimits: 3
};
goog.exportProperty(box2d.b2LimitState, 'e_inactiveLimit', box2d.b2LimitState.e_inactiveLimit);
goog.exportProperty(box2d.b2LimitState, 'e_atLowerLimit', box2d.b2LimitState.e_atLowerLimit);
goog.exportProperty(box2d.b2LimitState, 'e_atUpperLimit', box2d.b2LimitState.e_atUpperLimit);
goog.exportProperty(box2d.b2LimitState, 'e_equalLimits', box2d.b2LimitState.e_equalLimits);

/** 
 * @export 
 * @constructor
 */
box2d.b2Jacobian = function() {
  this.linear = new box2d.b2Vec2();
};

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2Jacobian.prototype.linear = null;
/**
 * @export 
 * @type {number}
 */
box2d.b2Jacobian.prototype.angularA = 0;
/**
 * @export 
 * @type {number}
 */
box2d.b2Jacobian.prototype.angularB = 0;

/** 
 * @export 
 * @return {box2d.b2Jacobian}
 */
box2d.b2Jacobian.prototype.SetZero = function() {
  this.linear.SetZero();
  this.angularA = 0;
  this.angularB = 0;
  return this;
}

/** 
 * @export 
 * @return {box2d.b2Jacobian}
 * @param {box2d.b2Vec2} x
 * @param {number} a1
 * @param {number} a2
 */
box2d.b2Jacobian.prototype.Set = function(x, a1, a2) {
  this.linear.Copy(x);
  this.angularA = a1;
  this.angularB = a2;
  return this;
}

/** 
 * A joint edge is used to connect bodies and joints together in 
 * a joint graph where each body is a node and each joint is an 
 * edge. A joint edge belongs to a doubly linked list maintained 
 * in each attached body. Each joint has two joint nodes, one 
 * for each attached body. 
 * @export 
 * @constructor
 */
box2d.b2JointEdge = function() {};

/**
 * @export 
 * @type {box2d.b2Body}
 */
box2d.b2JointEdge.prototype.other = null; ///< provides quick access to the other body attached.
/**
 * @export 
 * @type {box2d.b2Joint}
 */
box2d.b2JointEdge.prototype.joint = null; ///< the joint
/**
 * @export 
 * @type {box2d.b2JointEdge}
 */
box2d.b2JointEdge.prototype.prev = null; ///< the previous joint edge in the body's joint list
/**
 * @export 
 * @type {box2d.b2JointEdge}
 */
box2d.b2JointEdge.prototype.next = null; ///< the next joint edge in the body's joint list

/** 
 * Joint definitions are used to construct joints. 
 * @export 
 * @constructor 
 * @param {box2d.b2JointType} type 
 */
box2d.b2JointDef = function(type) {
  this.type = type;
}

/** 
 * The joint type is set automatically for concrete joint types.
 * @export 
 * @type {box2d.b2JointType}
 */
box2d.b2JointDef.prototype.type = box2d.b2JointType.e_unknownJoint;

/** 
 * Use this to attach application specific data to your joints. 
 * @export 
 * @type {*}
 */
box2d.b2JointDef.prototype.userData = null;

/** 
 * The first attached body. 
 * @export 
 * @type {box2d.b2Body}
 */
box2d.b2JointDef.prototype.bodyA = null;

/** 
 * The second attached body. 
 * @export 
 * @type {box2d.b2Body}
 */
box2d.b2JointDef.prototype.bodyB = null;

/** 
 * Set this flag to true if the attached bodies should collide. 
 * @export 
 * @type {boolean}
 */
box2d.b2JointDef.prototype.collideConnected = false;

/** 
 * The base joint class. Joints are used to constraint two 
 * bodies together in various fashions. Some joints also feature 
 * limits and motors. 
 * @export 
 * @constructor 
 */
box2d.b2Joint = function(def) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(def.bodyA !== def.bodyB);
  }

  this.m_type = def.type;
  this.m_edgeA = new box2d.b2JointEdge();
  this.m_edgeB = new box2d.b2JointEdge();
  this.m_bodyA = def.bodyA;
  this.m_bodyB = def.bodyB;

  this.m_collideConnected = def.collideConnected;

  this.m_userData = def.userData;
}

/**
 * @export 
 * @type {box2d.b2JointType}
 */
box2d.b2Joint.prototype.m_type = box2d.b2JointType.e_unknownJoint;
/**
 * @export 
 * @type {box2d.b2Joint}
 */
box2d.b2Joint.prototype.m_prev = null;
/**
 * @export 
 * @type {box2d.b2Joint}
 */
box2d.b2Joint.prototype.m_next = null;
/**
 * @export 
 * @type {box2d.b2JointEdge}
 */
box2d.b2Joint.prototype.m_edgeA = null;
/**
 * @export 
 * @type {box2d.b2JointEdge}
 */
box2d.b2Joint.prototype.m_edgeB = null;
/**
 * @export 
 * @type {box2d.b2Body}
 */
box2d.b2Joint.prototype.m_bodyA = null;
/**
 * @export 
 * @type {box2d.b2Body}
 */
box2d.b2Joint.prototype.m_bodyB = null;

/**
 * @export 
 * @type {number}
 */
box2d.b2Joint.prototype.m_index = 0;

/**
 * @export 
 * @type {boolean}
 */
box2d.b2Joint.prototype.m_islandFlag = false;
/**
 * @export 
 * @type {boolean}
 */
box2d.b2Joint.prototype.m_collideConnected = false;

/**
 * @export 
 * @type {*}
 */
box2d.b2Joint.prototype.m_userData = null;

/** 
 * Get the anchor point on bodyA in world coordinates. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2Joint.prototype.GetAnchorA = function(out) {
  return out.SetZero();
}

/** 
 * Get the anchor point on bodyB in world coordinates. 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} out
 */
box2d.b2Joint.prototype.GetAnchorB = function(out) {
  return out.SetZero();
}

/** 
 * Get the reaction force on bodyB at the joint anchor in 
 * Newtons. 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {number} inv_dt 
 * @param {box2d.b2Vec2} out
 */
box2d.b2Joint.prototype.GetReactionForce = function(inv_dt, out) {
  return out.SetZero();
}

/** 
 * Get the reaction torque on bodyB in N*m. 
 * @export 
 * @return {number} 
 * @param {number} inv_dt 
 */
box2d.b2Joint.prototype.GetReactionTorque = function(inv_dt) {
  return 0;
}

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2SolverData} data 
 */
box2d.b2Joint.prototype.InitVelocityConstraints = function(data) {}

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2SolverData} data 
 */
box2d.b2Joint.prototype.SolveVelocityConstraints = function(data) {}

/** 
 * This returns true if the position errors are within 
 * tolerance. 
 * @export 
 * @return {boolean} 
 * @param {box2d.b2SolverData} data 
 */
box2d.b2Joint.prototype.SolvePositionConstraints = function(data) {
  return false;
}

/** 
 * Get the type of the concrete joint. 
 * @export 
 * @return {box2d.b2JointType} 
 */
box2d.b2Joint.prototype.GetType = function() {
  return this.m_type;
}

/** 
 * Get the first body attached to this joint. 
 * @export 
 * @return {box2d.b2Body}
 */
box2d.b2Joint.prototype.GetBodyA = function() {
  return this.m_bodyA;
}

/** 
 * Get the second body attached to this joint. 
 * @export 
 * @return {box2d.b2Body}
 */
box2d.b2Joint.prototype.GetBodyB = function() {
  return this.m_bodyB;
}

/** 
 * Get the next joint the world joint list. 
 * @export 
 * @return {box2d.b2Joint} 
 */
box2d.b2Joint.prototype.GetNext = function() {
  return this.m_next;
}

/** 
 * Get the user data pointer. 
 * @export 
 * @return {*} 
 */
box2d.b2Joint.prototype.GetUserData = function() {
  return this.m_userData;
}

/** 
 * Set the user data pointer. 
 * @export 
 * @return {void} 
 * @param {*} data 
 */
box2d.b2Joint.prototype.SetUserData = function(data) {
  this.m_userData = data;
}

/** 
 * Get collide connected. 
 * Note: modifying the collide connect flag won't work correctly 
 * because the flag is only checked when fixture AABBs begin to 
 * overlap. 
 * @export 
 * @return {boolean}
 */
box2d.b2Joint.prototype.GetCollideConnected = function() {
  return this.m_collideConnected;
}

/** 
 * Dump this joint to the log file. 
 * @export 
 * @return {void}
 */
box2d.b2Joint.prototype.Dump = function() {
  if (box2d.DEBUG) {
    box2d.b2Log("// Dump is not supported for this joint type.\n");
  }
}

/** 
 * Short-cut function to determine if either body is inactive. 
 * @export 
 * @return {boolean} 
 */
box2d.b2Joint.prototype.IsActive = function() {
  return this.m_bodyA.IsActive() && this.m_bodyB.IsActive();
}

/** 
 * Shift the origin for any points stored in world coordinates. 
 * @export 
 * @return {void} 
 * @param {box2d.b2Vec2} newOrigin
 */
box2d.b2Joint.prototype.ShiftOrigin = function(newOrigin) {}
