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

goog.provide('box2d');

/**
\mainpage Box2D API Documentation

\section intro_sec Getting Started

For documentation please see http://box2d.org/documentation.html

For discussion please visit http://box2d.org/forum
*/

// These include files constitute the main Box2D API

goog.require('box2d.b2Settings');
goog.require('box2d.b2Draw');
goog.require('box2d.b2Timer');

goog.require('box2d.b2CircleShape');
goog.require('box2d.b2EdgeShape');
goog.require('box2d.b2ChainShape');
goog.require('box2d.b2PolygonShape');

goog.require('box2d.b2BroadPhase');
goog.require('box2d.b2ShapeDistance');
goog.require('box2d.b2DynamicTree');
goog.require('box2d.b2TimeOfImpact');

goog.require('box2d.b2Body');
goog.require('box2d.b2Fixture');
goog.require('box2d.b2WorldCallbacks');
goog.require('box2d.b2TimeStep');
goog.require('box2d.b2World');

goog.require('box2d.b2Contact');

goog.require('box2d.b2AreaJoint');
goog.require('box2d.b2DistanceJoint');
goog.require('box2d.b2FrictionJoint');
goog.require('box2d.b2GearJoint');
goog.require('box2d.b2MotorJoint');
goog.require('box2d.b2MouseJoint');
goog.require('box2d.b2PrismaticJoint');
goog.require('box2d.b2PulleyJoint');
goog.require('box2d.b2RevoluteJoint');
goog.require('box2d.b2RopeJoint');
goog.require('box2d.b2WeldJoint');
goog.require('box2d.b2WheelJoint');

//#if B2_ENABLE_ROPE
goog.require('box2d.b2Rope');
//#endif

//#if B2_ENABLE_CONTROLLER
goog.require('box2d.b2BuoyancyController');
goog.require('box2d.b2ConstantAccelController');
goog.require('box2d.b2ConstantForceController');
goog.require('box2d.b2GravityController');
goog.require('box2d.b2TensorDampingController');
//#endif

//#if B2_ENABLE_PARTICLE
goog.require('box2d.b2Particle');
goog.require('box2d.b2ParticleGroup');
goog.require('box2d.b2ParticleSystem');
goog.require('box2d.b2StackQueue');
goog.require('box2d.b2VoronoiDiagram');
//#endif
