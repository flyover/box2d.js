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

goog.provide('box2d.b2Settings');

//goog.require('goog.asserts');
//goog.require('goog.string.format');

if (!Object.defineProperty)
{
	Object.defineProperty = function (obj, name, options)
	{
		if (Object.__defineGetter__)
		{
			if ('get' in options)
			{
				obj.__defineGetter__(name, options.get);
			}
			else if ('value' in options)
			{
				obj.__defineGetter__(name, options.value);
			}
		}

		if (Object.__defineSetter__)
		{
			if ('set' in options)
			{
				obj.__defineSetter__(name, options.set);
			}
			else if ('value' in options)
			{
				obj.__defineSetter__(name, options.value);
			}
		}
	}
}

/** 
 * @export 
 * @define {boolean}
 */
box2d.DEBUG = true;

/** 
 * @export 
 * @define {boolean}
 */
box2d.ENABLE_ASSERTS = box2d.DEBUG;

/** 
 * @export 
 * @return {void} 
 * @param {boolean} condition 
 * @param {string=} opt_message 
 * @param {...} var_args 
 */
box2d.b2Assert = function (condition, opt_message, var_args)
{
	if (box2d.DEBUG)
	{
		if (!condition)
		{
			debugger;
		}
	
		//goog.asserts.assert(condition, opt_message, var_args);
	}
}

/**
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_maxFloat = 1E+37; // FLT_MAX instead of Number.MAX_VALUE;
/**
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_epsilon = 1E-5; // FLT_EPSILON instead of Number.MIN_VALUE;
/**
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_epsilon_sq = (box2d.b2_epsilon * box2d.b2_epsilon);
/**
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_pi = Math.PI;

/**
 * Global tuning constants based on meters-kilograms-seconds 
 * (MKS) units. 
 */

// Collision

/** 
 * The maximum number of contact points between two convex 
 * shapes. Do not change this value. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_maxManifoldPoints = 2;

/** 
 * The maximum number of vertices on a convex polygon. You 
 * cannot increase this too much because b2BlockAllocator has a 
 * maximum object size. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_maxPolygonVertices = 8;

/** 
 * This is used to fatten AABBs in the dynamic tree. This allows 
 * proxies to move by a small amount without triggering a tree 
 * adjustment. 
 * This is in meters. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_aabbExtension = 0.1;

/** 
 * This is used to fatten AABBs in the dynamic tree. This is 
 * used to predict the future position based on the current 
 * displacement. 
 * This is a dimensionless multiplier. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_aabbMultiplier = 2;

/** 
 * A small length used as a collision and constraint tolerance. 
 * Usually it is chosen to be numerically significant, but 
 * visually insignificant. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_linearSlop = 0.008; //0.005;

/** 
 * A small angle used as a collision and constraint tolerance. 
 * Usually it is chosen to be numerically significant, but 
 * visually insignificant. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_angularSlop = 2 / 180 * box2d.b2_pi;

/** 
 * The radius of the polygon/edge shape skin. This should not be 
 * modified. Making this smaller means polygons will have an 
 * insufficient buffer for continuous collision. 
 * Making it larger may create artifacts for vertex collision.
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_polygonRadius = 2 * box2d.b2_linearSlop;

/** 
 * Maximum number of sub-steps per contact in continuous physics 
 * simulation. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_maxSubSteps = 8;


// Dynamics

/** 
 * Maximum number of contacts to be handled to solve a TOI 
 * impact. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_maxTOIContacts = 32;

/** 
 * A velocity threshold for elastic collisions. Any collision 
 * with a relative linear velocity below this threshold will be 
 * treated as inelastic. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_velocityThreshold = 1;

/** 
 * The maximum linear position correction used when solving 
 * constraints. This helps to prevent overshoot. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_maxLinearCorrection = 0.2;

/** 
 * The maximum angular position correction used when solving 
 * constraints. This helps to prevent overshoot. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_maxAngularCorrection = 8 / 180 * box2d.b2_pi;

/** 
 * The maximum linear velocity of a body. This limit is very 
 * large and is used to prevent numerical problems. You 
 * shouldn't need to adjust this. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_maxTranslation = 2;
/** 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_maxTranslationSquared = box2d.b2_maxTranslation * box2d.b2_maxTranslation;

/** 
 * The maximum angular velocity of a body. This limit is very 
 * large and is used to prevent numerical problems. You 
 * shouldn't need to adjust this. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_maxRotation = 0.5 * box2d.b2_pi;
/** 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_maxRotationSquared = box2d.b2_maxRotation * box2d.b2_maxRotation;

/** 
 * This scale factor controls how fast overlap is resolved. 
 * Ideally this would be 1 so that overlap is removed in one 
 * time step. However using values close to 1 often lead to 
 * overshoot. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_baumgarte = 0.2;
/** 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_toiBaumgarte = 0.75;



//#if B2_ENABLE_PARTICLE

// Particle

/** 
 * A symbolic constant that stands for particle allocation 
 * error. 
 *  
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_invalidParticleIndex = -1;

/**
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_maxParticleIndex = 0x7FFFFFFF;

/** 
 * The default distance between particles, multiplied by the 
 * particle diameter. 
 *  
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_particleStride = 0.75;

/** 
 * The minimum particle weight that produces pressure. 
 *  
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_minParticleWeight = 1.0;

/** 
 * The upper limit for particle pressure. 
 *  
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_maxParticlePressure = 0.25;

/** 
 * The upper limit for force between particles. 
 *  
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_maxParticleForce = 0.5;

/** 
 * The maximum distance between particles in a triad, multiplied 
 * by the particle diameter. 
 *  
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_maxTriadDistance = 2.0;

/**
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_maxTriadDistanceSquared = (box2d.b2_maxTriadDistance * box2d.b2_maxTriadDistance);

/** 
 * The initial size of particle data buffers. 
 *  
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_minParticleSystemBufferCapacity = 256;

/** 
 * The time into the future that collisions against barrier 
 * particles will be detected. 
 *  
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_barrierCollisionTime = 2.5;

//#endif



// Sleep

/** 
 * The time that a body must be still before it will go to 
 * sleep. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_timeToSleep = 0.5;

/** 
 * A body cannot sleep if its linear velocity is above this 
 * tolerance. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_linearSleepTolerance = 0.01;

/** 
 * A body cannot sleep if its angular velocity is above this 
 * tolerance. 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_angularSleepTolerance = 2 / 180 * box2d.b2_pi;

// Memory Allocation

/** 
 * Implement this function to use your own memory allocator. 
 * @export 
 * @return {*} 
 * @param {number} size 
 */
box2d.b2Alloc = function (size)
{
	return null;
}

/** 
 * If you implement b2Alloc, you should also implement this 
 * function. 
 * @export  
 * @return {void} 
 * @param {*} mem 
 */
box2d.b2Free = function (mem)
{
}

/** 
 * Logging function. 
 * You can modify this to use your logging facility.
 * @export 
 * @return {void} 
 * @param {...string|number|boolean} var_args 
 */
box2d.b2Log = function (var_args)
{
	goog.global.console.log.apply(null, arguments);
}

/** 
 * Version numberinf scheme See 
 * http://en.wikipedia.org/wiki/Software_versioning 
 * @export 
 * @constructor
 * @param {number=} major 
 * @param {number=} minor 
 * @param {number=} revision 
 */
box2d.b2Version = function (major, minor, revision)
{
	this.major = major || 0;
	this.minor = minor || 0;
	this.revision = revision || 0;
};

/**
 * @export 
 * @type {number} 
 */
box2d.b2Version.prototype.major = 0; ///< significant changes
/**
 * @export 
 * @type {number} 
 */
box2d.b2Version.prototype.minor = 0; ///< incremental changes
/**
 * @export 
 * @type {number} 
 */
box2d.b2Version.prototype.revision = 0; ///< bug fixes

/**
 * @export 
 * @return {string}
 */
box2d.b2Version.prototype.toString = function ()
{
	return this.major + "." + this.minor + "." + this.revision;
}

/** 
 * Current version. 
 * @export 
 * @const 
 * @type {box2d.b2Version} 
 */
box2d.b2_version = new box2d.b2Version(2, 3, 2);
/** 
 * @export 
 * @const 
 * @type {number} 
 */
box2d.b2_changelist = 313;

/** 
 * @export 
 * @return {number} 
 * @param {string} v 
 */
box2d.b2ParseInt = function (v)
{
	return parseInt(v, 10);
}

/**
 * @export 
 * @return {number} 
 * @param {string} v 
 */
box2d.b2ParseUInt = function (v)
{
	return box2d.b2Abs(parseInt(v, 10));
}

/** 
 * @export 
 * @return {Array.<*>} 
 * @param {number=} length 
 * @param {function(number): *=} init 
 */
box2d.b2MakeArray = function (length, init)
{
	length = (typeof(length) === 'number')?(length):(0);
	var a = [];
	if (typeof(init) === 'function')
	{
		for (var i = 0; i < length; ++i)
		{
			a.push(init(i));
		}
	}
	else
	{
		for (var i = 0; i < length; ++i)
		{
			a.push(null);
		}
	}
	return a;
}

/** 
 * @export 
 * @return {Array.<number>} 
 * @param {number=} length
 */
box2d.b2MakeNumberArray = function (length)
{
	return box2d.b2MakeArray(length, function (i) { return 0; });
}

