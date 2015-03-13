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

goog.provide('box2d.b2JointFactory');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Math');
goog.require('box2d.b2Joint');

/** 
 * @export 
 * @return {box2d.b2Joint}
 * @param {box2d.b2JointDef} def 
 * @param allocator 
 */
box2d.b2JointFactory.Create = function (def, allocator)
{
	var joint = null;

	switch (def.type)
	{
	case box2d.b2JointType.e_distanceJoint:
		{
			joint = new box2d.b2DistanceJoint((def instanceof box2d.b2DistanceJointDef ? def : null));
		}
		break;

	case box2d.b2JointType.e_mouseJoint:
		{
			joint = new box2d.b2MouseJoint((def instanceof box2d.b2MouseJointDef ? def : null));
		}
		break;

	case box2d.b2JointType.e_prismaticJoint:
		{
			joint = new box2d.b2PrismaticJoint((def instanceof box2d.b2PrismaticJointDef ? def : null));
		}
		break;

	case box2d.b2JointType.e_revoluteJoint:
		{
			joint = new box2d.b2RevoluteJoint((def instanceof box2d.b2RevoluteJointDef ? def : null));
		}
		break;

	case box2d.b2JointType.e_pulleyJoint:
		{
			joint = new box2d.b2PulleyJoint((def instanceof box2d.b2PulleyJointDef ? def : null));
		}
		break;

	case box2d.b2JointType.e_gearJoint:
		{
			joint = new box2d.b2GearJoint((def instanceof box2d.b2GearJointDef ? def : null));
		}
		break;

	case box2d.b2JointType.e_wheelJoint:
		{
			joint = new box2d.b2WheelJoint((def instanceof box2d.b2WheelJointDef ? def : null));
		}
		break;

	case box2d.b2JointType.e_weldJoint:
		{
			joint = new box2d.b2WeldJoint((def instanceof box2d.b2WeldJointDef ? def : null));
		}
		break;

	case box2d.b2JointType.e_frictionJoint:
		{
			joint = new box2d.b2FrictionJoint((def instanceof box2d.b2FrictionJointDef ? def : null));
		}
		break;

	case box2d.b2JointType.e_ropeJoint:
		{
			joint = new box2d.b2RopeJoint((def instanceof box2d.b2RopeJointDef ? def : null));
		}
		break;

	case box2d.b2JointType.e_motorJoint:
		{
			joint = new box2d.b2MotorJoint((def instanceof box2d.b2MotorJointDef ? def : null));
		}
		break;

	case box2d.b2JointType.e_areaJoint:
		{
			joint = new box2d.b2AreaJoint((def instanceof box2d.b2AreaJointDef ? def : null));
		}
		break;

	default:
		if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(false); }
		break;
	}

	return joint;
}

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2Joint} joint 
 * @param allocator 
 */
box2d.b2JointFactory.Destroy = function (joint, allocator)
{
}

