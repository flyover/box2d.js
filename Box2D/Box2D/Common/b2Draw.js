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

goog.provide('box2d.b2Draw');

goog.require('box2d.b2Settings');

/** 
 * Color for debug drawing. Each value has the range [0,1]. 
 * @export
 * @constructor
 * @param {number} rr
 * @param {number} gg
 * @param {number} bb
 * @param {number=} aa
 */
box2d.b2Color = function (rr, gg, bb, aa)
{
	this.r = rr;
	this.g = gg;
	this.b = bb;
	this.a = (typeof(aa) === 'number')?(aa):(1.0);
}

/**
 * @export 
 * @type {number}
 */
box2d.b2Color.prototype.r = 0.5;
/**
 * @export 
 * @type {number}
 */
box2d.b2Color.prototype.g = 0.5;
/**
 * @export 
 * @type {number}
 */
box2d.b2Color.prototype.b = 0.5;
/**
 * @export 
 * @type {number}
 */
box2d.b2Color.prototype.a = 1.0;

/**
 * @export
 * @return {box2d.b2Color}
 * @param {number} rr
 * @param {number} gg
 * @param {number} bb
 */
box2d.b2Color.prototype.SetRGB = function (rr, gg, bb)
{
	this.r = rr;
	this.g = gg;
	this.b = bb;
	return this;
}

/**
 * @export
 * @return {string}
 * @param {number=} alpha
 */
box2d.b2Color.prototype.MakeStyleString = function (alpha)
{
	var r = Math.round(Math.max(0, Math.min(255, this.r * 255)));
	var g = Math.round(Math.max(0, Math.min(255, this.g * 255)));
	var b = Math.round(Math.max(0, Math.min(255, this.b * 255)));
	var a = (typeof(alpha) === 'undefined')?(this.a):(Math.max(0, Math.min(1, alpha)));
	return box2d.b2Color.MakeStyleString(r, g, b, a);
}

/**
 * @export
 * @return {string}
 */
box2d.b2Color.MakeStyleString = function (r, g, b, a)
{
	if (a < 1)
	{
		return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
	}
	else
	{
		return 'rgb(' + r + ',' + g + ',' + b + ')';
	}
}

/**
 * @export 
 * @const 
 * @type {box2d.b2Color}
 */
box2d.b2Color.RED = new box2d.b2Color(1,0,0);
/**
 * @export 
 * @const 
 * @type {box2d.b2Color}
 */
box2d.b2Color.GREEN	= new box2d.b2Color(0,1,0);
/**
 * @export 
 * @const 
 * @type {box2d.b2Color}
 */
box2d.b2Color.BLUE = new box2d.b2Color(0,0,1);

/** 
 * @export 
 * @enum
 */
box2d.b2DrawFlags = 
{
	e_none				: 0,
	e_shapeBit			: 0x0001, ///< draw shapes
	e_jointBit			: 0x0002, ///< draw joint connections
	e_aabbBit			: 0x0004, ///< draw axis aligned bounding boxes
	e_pairBit			: 0x0008, ///< draw broad-phase pairs
	e_centerOfMassBit	: 0x0010, ///< draw center of mass frame
//#if B2_ENABLE_CONTROLLER
	e_controllerBit		: 0x0020, /// @see box2d.b2Controller list
//#endif
//#if B2_ENABLE_PARTICLE
	e_particleBit		: 0x0040, ///< draw particles
//#endif
	e_all				: 0xffff
};
goog.exportProperty(box2d.b2DrawFlags, 'e_none'           , box2d.b2DrawFlags.e_none           );
goog.exportProperty(box2d.b2DrawFlags, 'e_shapeBit'       , box2d.b2DrawFlags.e_shapeBit       );
goog.exportProperty(box2d.b2DrawFlags, 'e_jointBit'       , box2d.b2DrawFlags.e_jointBit       );
goog.exportProperty(box2d.b2DrawFlags, 'e_aabbBit'        , box2d.b2DrawFlags.e_aabbBit        );
goog.exportProperty(box2d.b2DrawFlags, 'e_pairBit'        , box2d.b2DrawFlags.e_pairBit        );
goog.exportProperty(box2d.b2DrawFlags, 'e_centerOfMassBit', box2d.b2DrawFlags.e_centerOfMassBit);
//#if B2_ENABLE_CONTROLLER
goog.exportProperty(box2d.b2DrawFlags, 'e_controllerBit'  , box2d.b2DrawFlags.e_controllerBit  );
//#endif
//#if B2_ENABLE_PARTICLE
goog.exportProperty(box2d.b2DrawFlags, 'e_particleBit'    , box2d.b2DrawFlags.e_particleBit    );
//#endif
goog.exportProperty(box2d.b2DrawFlags, 'e_all'            , box2d.b2DrawFlags.e_all            );

/** 
 * Implement and register this class with a b2World to provide 
 * debug drawing of physics entities in your game. 
 * @export 
 * @constructor
 */
box2d.b2Draw = function ()
{
}

/**
 * @export 
 * @type {box2d.b2DrawFlags} 
 */
box2d.b2Draw.prototype.m_drawFlags = box2d.b2DrawFlags.e_none;

/** 
 * Set the drawing flags. 
 * @export 
 * @return {void} 
 * @param {box2d.b2DrawFlags} flags 
 */
box2d.b2Draw.prototype.SetFlags = function (flags)
{
	this.m_drawFlags = flags;
}

/** 
 * Get the drawing flags. 
 * @export 
 * @return {box2d.b2DrawFlags}
 */
box2d.b2Draw.prototype.GetFlags = function ()
{
	return this.m_drawFlags;
}

/** 
 * Append flags to the current flags. 
 * @export 
 * @return {void} 
 * @param {box2d.b2DrawFlags} flags 
 */
box2d.b2Draw.prototype.AppendFlags = function (flags)
{
	this.m_drawFlags |= flags;
}

/** 
 * Clear flags from the current flags. 
 * @export 
 * @return {void} 
 * @param {box2d.b2DrawFlags} flags 
 */
box2d.b2Draw.prototype.ClearFlags = function (flags)
{
	this.m_drawFlags &= ~flags;
}

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2Transform} xf 
 */
box2d.b2Draw.prototype.PushTransform = function (xf)
{
}

/**
 * @export 
 * @return {void} 
 * @param {box2d.b2Transform} xf 
 */
box2d.b2Draw.prototype.PopTransform = function (xf)
{
}

/** 
 * Draw a closed polygon provided in CCW order. 
 * @export 
 * @return {void} 
 * @param {Array.<box2d.b2Vec2>} vertices
 * @param {number} vertexCount
 * @param {box2d.b2Color} color 
 */
box2d.b2Draw.prototype.DrawPolygon = function (vertices, vertexCount, color)
{
}

/** 
 * Draw a solid closed polygon provided in CCW order. 
 * @export 
 * @return {void} 
 * @param {Array.<box2d.b2Vec2>} vertices
 * @param {number} vertexCount
 * @param {box2d.b2Color} color 
 */
box2d.b2Draw.prototype.DrawSolidPolygon = function (vertices, vertexCount, color)
{
}

/** 
 * Draw a circle. 
 * @export 
 * @return {void} 
 * @param {box2d.b2Vec2} center
 * @param {number} radius
 * @param {box2d.b2Color} color 
 */
box2d.b2Draw.prototype.DrawCircle = function (center, radius, color)
{
}

/** 
 * Draw a solid circle. 
 * @export 
 * @return {void} 
 * @param {box2d.b2Vec2} center
 * @param {number} radius
 * @param {box2d.b2Vec2} axis
 * @param {box2d.b2Color} color 
 */
box2d.b2Draw.prototype.DrawSolidCircle = function (center, radius, axis, color)
{
}

//#if B2_ENABLE_PARTICLE

/** 
 * Draw a particle array
 * @export 
 * @return {void} 
 * @param {Array.<box2d.b2Vec2>} centers
 * @param {number} radius
 * @param {Array.<box2d.b2ParticleColor>} colors 
 * @param {number} count
 */
box2d.b2Draw.prototype.DrawParticles = function (centers, radius, colors, count)
{
}

//#endif

/** 
 * Draw a line segment. 
 * @export 
 * @return {void} 
 * @param {box2d.b2Vec2} p1
 * @param {box2d.b2Vec2} p2
 * @param {box2d.b2Color} color 
 */
box2d.b2Draw.prototype.DrawSegment = function (p1, p2, color)
{
}

/** 
 * Draw a transform. Choose your own length scale. 
 * @export 
 * @return {void} 
 * @param {box2d.b2Transform} xf a transform.
 */
box2d.b2Draw.prototype.DrawTransform = function (xf)
{
}

