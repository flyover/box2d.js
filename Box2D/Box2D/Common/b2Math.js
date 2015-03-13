/*
* Copyright (c) 2007-2009 Erin Catto http://www.box2d.org
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

goog.provide('box2d.b2Math');

goog.require('box2d.b2Settings');

/**
 * @export 
 * @type {number} 
 */
box2d.b2_pi_over_180 = box2d.b2_pi / 180.0;
/**
 * @export 
 * @type {number} 
 */
box2d.b2_180_over_pi = 180.0 / box2d.b2_pi;
/**
 * @export 
 * @type {number} 
 */
box2d.b2_two_pi = 2.0 * box2d.b2_pi;

/** 
 * @export 
 * @return {number}
 * @param {number} n
 */
box2d.b2Abs = Math.abs;

/**
 * @export 
 * @return {number}
 * @param {number} a
 * @param {number} b
 */
box2d.b2Min = Math.min;

/**
 * @export 
 * @return {number}
 * @param {number} a
 * @param {number} b
 */
box2d.b2Max = Math.max;

/**
 * @export 
 * @return {number}
 * @param {number} a
 * @param {number} lo
 * @param {number} hi
 */
box2d.b2Clamp = function (a, lo, hi)
{
	return Math.min(Math.max(a, lo), hi);
}

/**
 * @export 
 * @return {number}
 * @param {number} num
 * @param {number} min
 * @param {number} max
 */
box2d.b2Wrap = function (num, min, max)
{
	if (min < max)
	{
		if (num < min)
		{
			return max - ((min - num) % (max - min));
		}
		else
		{
			return min + ((num - min) % (max - min));
		}
	}
	else if (min === max)
	{
		return min;
	}
	else // (min > max)
	{
		return num;
	}
}

/**
 * @export 
 * @return {number}
 * @param {number} rad
 */
box2d.b2WrapAngle = function (rad)
{
	if (rad < 0)
	{
		return ((rad - box2d.b2_pi) % box2d.b2_two_pi) + box2d.b2_pi;
	}
	else
	{
		return ((rad + box2d.b2_pi) % box2d.b2_two_pi) - box2d.b2_pi;
	}
}

/**
 * @export 
 * @return {void} 
 * @param {Array.<number>} a
 * @param {Array.<number>} b
 */
box2d.b2Swap = function (a, b)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(false); }
	var tmp = a[0];
	a[0] = b[0];
	b[0] = tmp;
}

/** 
 * This function is used to ensure that a floating point number 
 * is not a NaN or infinity. 
 * @export 
 * @return {boolean}
 * @param {number} n
 */
box2d.b2IsValid = function (n)
{
	return isFinite(n);
}

/**
 * @export 
 * @return {number} 
 * @param {number} n
 */
box2d.b2Sq = function (n)
{
	return n * n;
}

/** 
 * This is a approximate yet fast inverse square-root. 
 * @export 
 * @return {number}
 * @param {number} n
 */
box2d.b2InvSqrt = function (n)
{
	return 1 / Math.sqrt(n);
}

/**
 * @export 
 * @return {number}
 * @param {number} n
 */
box2d.b2Sqrt = function (n)
{
	return Math.sqrt(n);
}

/**
 * @export 
 * @return {number}
 * @param {number} x
 * @param {number} y
 */
box2d.b2Pow = function (x, y)
{
	return Math.pow(x, y);
}

/**
 * @export 
 * @return {number}
 * @param {number} degrees
 */
box2d.b2DegToRad = function (degrees)
{
	return degrees * box2d.b2_pi_over_180;
}

/**
 * @export 
 * @return {number}
 * @param {number} radians
 */
box2d.b2RadToDeg = function (radians)
{
	return radians * box2d.b2_180_over_pi;
}

/**
 * @export 
 * @return {number}
 * @param {number} radians
 */
box2d.b2Cos = function (radians)
{
	return Math.cos(radians);
}

/**
 * @export 
 * @return {number}
 * @param {number} radians
 */
box2d.b2Sin = function (radians)
{
	return Math.sin(radians);
}

/**
 * @export 
 * @return {number}
 * @param {number} n
 */
box2d.b2Acos = function (n)
{
	return Math.acos(n);
}

/**
 * @export 
 * @return {number}
 * @param {number} n
 */
box2d.b2Asin = function (n)
{
	return Math.asin(n);
}

/**
 * @export 
 * @return {number}
 * @param {number} y
 * @param {number} x
 */
box2d.b2Atan2 = function (y, x)
{
	return Math.atan2(y, x);
}

/** 
 * Next Largest Power of 2 
 * Given a binary integer value x, the next largest power of 2 
 * can be computed by a SWAR algorithm that recursively "folds" 
 * the upper bits into the lower bits. This process yields a bit 
 * vector with the same most significant 1 as x, but all 1's 
 * below it. Adding 1 to that value yields the next largest 
 * power of 2. For a 32-bit value: 
 * @export 
 * @return {number}
 * @param {number} x
 */
box2d.b2NextPowerOfTwo = function (x)
{
	x |= (x >> 1) & 0x7FFFFFFF;
	x |= (x >> 2) & 0x3FFFFFFF;
	x |= (x >> 4) & 0x0FFFFFFF;
	x |= (x >> 8) & 0x00FFFFFF;
	x |= (x >> 16) & 0x0000FFFF;
	return x + 1;
}

/**
 * @export 
 * @return {boolean}
 * @param {number} x
 */
box2d.b2IsPowerOfTwo = function (x)
{
	return x > 0 && (x & (x - 1)) === 0;
}

/**
 * @export 
 * @return {number}
 */
box2d.b2Random = function ()
{
	return Math.random() * 2.0 - 1.0;
}

/**
 * @export 
 * @return {number}
 * @param {number} lo
 * @param {number} hi
 */
box2d.b2RandomRange = function (lo, hi)
{
	return (hi - lo) * Math.random() + lo;
}

/** 
 * A 2D column vector. 
 * @export 
 * @constructor 
 * @param {number=} x
 * @param {number=} y
 */
box2d.b2Vec2 = function (x, y)
{
	this.x = x || 0.0;
	this.y = y || 0.0;
	//this.a = new Float32Array(2);
	//this.a[0] = x || 0;
	//this.a[1] = y || 0;
}

/**
 * @export 
 * @type {number} 
 */
box2d.b2Vec2.prototype.x = 0.0;
/**
 * @export 
 * @type {number} 
 */
box2d.b2Vec2.prototype.y = 0.0;

//	/**
//	 * @type {Float32Array} 
//	 */
//	box2d.b2Vec2.prototype.a;
//	
//	box2d.b2Vec2.prototype.__defineGetter__('x', function () { return this.a[0]; });
//	box2d.b2Vec2.prototype.__defineGetter__('y', function () { return this.a[1]; });
//	box2d.b2Vec2.prototype.__defineSetter__('x', function (n) { this.a[0] = n; });
//	box2d.b2Vec2.prototype.__defineSetter__('y', function (n) { this.a[1] = n; });

/**
 * @export 
 * @const
 * @type {box2d.b2Vec2} 
 */
box2d.b2Vec2_zero = new box2d.b2Vec2();
/**
 * @export 
 * @const
 * @type {box2d.b2Vec2} 
 */
box2d.b2Vec2.ZERO = new box2d.b2Vec2();
/**
 * @export 
 * @const
 * @type {box2d.b2Vec2} 
 */
box2d.b2Vec2.UNITX = new box2d.b2Vec2(1.0, 0.0);
/**
 * @export 
 * @const
 * @type {box2d.b2Vec2} 
 */
box2d.b2Vec2.UNITY = new box2d.b2Vec2(0.0, 1.0);

/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.b2Vec2.s_t0 = new box2d.b2Vec2();
/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.b2Vec2.s_t1 = new box2d.b2Vec2();
/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.b2Vec2.s_t2 = new box2d.b2Vec2();
/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.b2Vec2.s_t3 = new box2d.b2Vec2();

/**
 * @export 
 * @return {Array.<box2d.b2Vec2>}
 * @param {number=} length
 */
box2d.b2Vec2.MakeArray = function (length)
{
	return box2d.b2MakeArray(length, function (i) { return new box2d.b2Vec2(); });
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 */
box2d.b2Vec2.prototype.Clone = function ()
{
	return new box2d.b2Vec2(this.x, this.y);
}

/** 
 * Set this vector to all zeros. 
 * @export 
 * @return {box2d.b2Vec2}
 */
box2d.b2Vec2.prototype.SetZero = function ()
{
	this.x = 0.0;
	this.y = 0.0;
	return this;
}

/** 
 * Set this vector to some specified coordinates. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {number} x
 * @param {number} y
 */
box2d.b2Vec2.prototype.Set = function (x, y)
{
	this.x = x;
	this.y = y;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} other
 */
box2d.b2Vec2.prototype.Copy = function (other)
{
	//if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(this !== other); }
	this.x = other.x;
	this.y = other.y;
	return this;
}

/** 
 * Add a vector to this vector. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} v
 */
box2d.b2Vec2.prototype.SelfAdd = function (v)
{
	this.x += v.x;
	this.y += v.y;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {number} x 
 * @param {number} y 
 */
box2d.b2Vec2.prototype.SelfAddXY = function (x, y)
{
	this.x += x;
	this.y += y;
	return this;
}

/** 
 * Subtract a vector from this vector. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} v
 */
box2d.b2Vec2.prototype.SelfSub = function (v)
{
	this.x -= v.x;
	this.y -= v.y;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {number} x 
 * @param {number} y 
 */
box2d.b2Vec2.prototype.SelfSubXY = function (x, y)
{
	this.x -= x;
	this.y -= y;
	return this;
}

/** 
 * Multiply this vector by a scalar. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {number} s
 */
box2d.b2Vec2.prototype.SelfMul = function (s)
{
	this.x *= s;
	this.y *= s;
	return this;
}

/** 
 * this += s * v 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {number} s
 * @param {box2d.b2Vec2} v
 */
box2d.b2Vec2.prototype.SelfMulAdd = function (s, v)
{
	this.x += s * v.x;
	this.y += s * v.y;
	return this;
}

/** 
 * this -= s * v 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {number} s
 * @param {box2d.b2Vec2} v
 */
box2d.b2Vec2.prototype.SelfMulSub = function (s, v)
{
	this.x -= s * v.x;
	this.y -= s * v.y;
	return this;
}

/**
 * @export 
 * @return {number}
 * @param {box2d.b2Vec2} v
 */
box2d.b2Vec2.prototype.Dot = function (v)
{
	return this.x * v.x + this.y * v.y;
}

/**
 * @export 
 * @return {number}
 * @param {box2d.b2Vec2} v
 */
box2d.b2Vec2.prototype.Cross = function (v)
{
	return this.x * v.y - this.y * v.x;
}

/** 
 * Get the length of this vector (the norm). 
 * @export 
 * @return {number}
 */
box2d.b2Vec2.prototype.Length = function ()
{
	var x = this.x, y = this.y;
	return Math.sqrt(x * x + y * y);
}

/** 
 * Get the length squared. For performance, use this instead of 
 * b2Vec2::Length (if possible). 
 * @export 
 * @return {number}
 */
box2d.b2Vec2.prototype.LengthSquared = function ()
{
	var x = this.x, y = this.y;
	return (x * x + y * y);
}

/** 
 * Convert this vector into a unit vector. Returns the length. 
 * @export 
 * @return {number}
 */
box2d.b2Vec2.prototype.Normalize = function ()
{
	var length = this.Length();
	if (length >= box2d.b2_epsilon)
	{
		var inv_length = 1.0 / length;
		this.x *= inv_length;
		this.y *= inv_length;
	}
	return length;
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 */
box2d.b2Vec2.prototype.SelfNormalize = function ()
{
	this.Normalize();
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {number} c
 * @param {number} s
 */
box2d.b2Vec2.prototype.SelfRotate = function (c, s)
{
	var x = this.x, y = this.y;
	this.x = c * x - s * y;
	this.y = s * x + c * y;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {number} radians
 */
box2d.b2Vec2.prototype.SelfRotateAngle = function (radians)
{
	return this.SelfRotate(Math.cos(radians), Math.sin(radians));
}

/** 
 * Does this vector contain finite coordinates? 
 * @export 
 * @return {boolean}
 */
box2d.b2Vec2.prototype.IsValid = function ()
{
	return isFinite(this.x) && isFinite(this.y);
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} v
 */
box2d.b2Vec2.prototype.SelfMin = function (v)
{
	this.x = Math.min(this.x, v.x);
	this.y = Math.min(this.y, v.y);
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} v
 */
box2d.b2Vec2.prototype.SelfMax = function (v)
{
	this.x = Math.max(this.x, v.x);
	this.y = Math.max(this.y, v.y);
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 */
box2d.b2Vec2.prototype.SelfAbs = function ()
{
	this.x = Math.abs(this.x);
	this.y = Math.abs(this.y);
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 */
box2d.b2Vec2.prototype.SelfNeg = function ()
{
	this.x = (-this.x);
	this.y = (-this.y);
	return this;
}

/** 
 * Get the skew vector such that dot(skew_vec, other) === 
 * cross(vec, other) 
 * @export 
 * @return {box2d.b2Vec2}
 */
box2d.b2Vec2.prototype.SelfSkew = function ()
{
	var x = this.x;
	this.x = -this.y;
	this.y = x;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} v
 * @param {box2d.b2Vec2} out
 */
box2d.b2Abs_V2 = function (v, out)
{
	out.x = Math.abs(v.x);
	out.y = Math.abs(v.y);
	return out;
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} a
 * @param {box2d.b2Vec2} b
 * @param {box2d.b2Vec2} out
 */
box2d.b2Min_V2_V2 = function (a, b, out)
{
	out.x = Math.min(a.x, b.x);
	out.y = Math.min(a.y, b.y);
	return out;
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} a
 * @param {box2d.b2Vec2} b
 * @param {box2d.b2Vec2} out
 */
box2d.b2Max_V2_V2 = function (a, b, out)
{
	out.x = Math.max(a.x, b.x);
	out.y = Math.max(a.y, b.y);
	return out;
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} v
 * @param {box2d.b2Vec2} lo
 * @param {box2d.b2Vec2} hi
 * @param {box2d.b2Vec2} out
 */
box2d.b2Clamp_V2_V2_V2 = function (v, lo, hi, out)
{
	out.x = Math.min(Math.max(v.x, lo.x), hi.x);
	out.y = Math.min(Math.max(v.y, lo.y), hi.y);
	return out;
}

/** 
 * Perform the dot product on two vectors. 
 * a.x * b.x + a.y * b.y 
 * @export 
 * @return {number}
 * @param {box2d.b2Vec2} a
 * @param {box2d.b2Vec2} b
 */
box2d.b2Dot_V2_V2 = function (a, b)
{
	return a.x * b.x + a.y * b.y;
}

/** 
 * Perform the cross product on two vectors. In 2D this produces a scalar. 
 * a.x * b.y - a.y * b.x 
 * @export 
 * @return {number}
 * @param {box2d.b2Vec2} a
 * @param {box2d.b2Vec2} b
 */
box2d.b2Cross_V2_V2 = function (a, b)
{
	return a.x * b.y - a.y * b.x;
}

/** 
 * Perform the cross product on a vector and a scalar. In 2D 
 * this produces a vector. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} v
 * @param {number} s
 * @param {box2d.b2Vec2} out
 */
box2d.b2Cross_V2_S = function (v, s, out)
{
	var v_x = v.x;
	out.x =  s * v.y;
	out.y = -s * v_x;
	return out;
}

/** 
 * Perform the cross product on a scalar and a vector. In 2D 
 * this produces a vector. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {number} s
 * @param {box2d.b2Vec2} v
 * @param {box2d.b2Vec2} out
 */
box2d.b2Cross_S_V2 = function (s, v, out)
{
	var v_x = v.x;
	out.x = -s * v.y;
	out.y =  s * v_x;
	return out;
}

/** 
 * Add two vectors component-wise. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} a
 * @param {box2d.b2Vec2} b
 * @param {box2d.b2Vec2} out
 */
box2d.b2Add_V2_V2 = function (a, b, out) { out.x = a.x + b.x; out.y = a.y + b.y; return out; }

/** 
 * Subtract two vectors component-wise. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} a
 * @param {box2d.b2Vec2} b
 * @param {box2d.b2Vec2} out
 */
box2d.b2Sub_V2_V2 = function (a, b, out) { out.x = a.x - b.x; out.y = a.y - b.y; return out; }

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} v
 * @param {number} s
 * @param {box2d.b2Vec2} out
 */
box2d.b2Add_V2_S = function (v, s, out) { out.x = v.x + s; out.y = v.y + s; return out; }

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} v
 * @param {number} s
 * @param {box2d.b2Vec2} out
 */
box2d.b2Sub_V2_S = function (v, s, out) { out.x = v.x - s; out.y = v.y - s; return out; }

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {number} s
 * @param {box2d.b2Vec2} v
 * @param {box2d.b2Vec2} out
 */
box2d.b2Mul_S_V2 = function (s, v, out) { out.x = v.x * s; out.y = v.y * s; return out; }

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} v
 * @param {number} s
 * @param {box2d.b2Vec2} out
 */
box2d.b2Mul_V2_S = function (v, s, out) { out.x = v.x * s; out.y = v.y * s; return out; }

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} v
 * @param {number} s
 * @param {box2d.b2Vec2} out
 */
box2d.b2Div_V2_S = function (v, s, out) { out.x = v.x / s; out.y = v.y / s; return out; }

/** 
 * out = a + (s * b)
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} a
 * @param {number} s
 * @param {box2d.b2Vec2} b
 * @param {box2d.b2Vec2} out
 */
box2d.b2AddMul_V2_S_V2 = function (a, s, b, out) { out.x = a.x + (s * b.x); out.y = a.y + (s * b.y); return out; }
/** 
 * out = a - (s * b)
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} a
 * @param {number} s
 * @param {box2d.b2Vec2} b
 * @param {box2d.b2Vec2} out
 */
box2d.b2SubMul_V2_S_V2 = function (a, s, b, out) { out.x = a.x - (s * b.x); out.y = a.y - (s * b.y); return out; }

/** 
 * out = a + b2Cross(s, v) 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} a
 * @param {number} s
 * @param {box2d.b2Vec2} v
 * @param {box2d.b2Vec2} out 
 */
box2d.b2AddCross_V2_S_V2 = function (a, s, v, out)
{
	var v_x = v.x;
	out.x = a.x - (s * v.y);
	out.y = a.y + (s * v_x);
	return out;
}

/** 
 * Get the center of two vectors. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} a
 * @param {box2d.b2Vec2} b
 * @param {box2d.b2Vec2} out
 */
box2d.b2Mid_V2_V2 = function (a, b, out) { out.x = (a.x + b.x) * 0.5; out.y = (a.y + b.y) * 0.5; return out; }

/** 
 * Get the extent of two vectors (half-widths). 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} a
 * @param {box2d.b2Vec2} b
 * @param {box2d.b2Vec2} out
 */
box2d.b2Ext_V2_V2 = function (a, b, out) { out.x = (b.x - a.x) * 0.5; out.y = (b.y - a.y) * 0.5; return out; }

/**
 * @export 
 * @return {number}
 * @param {box2d.b2Vec2} a
 * @param {box2d.b2Vec2} b
 */
box2d.b2Distance = function (a, b)
{
	var c_x = a.x - b.x;
	var c_y = a.y - b.y;
	return Math.sqrt(c_x * c_x + c_y * c_y);
}

/**
 * @export 
 * @return {number}
 * @param {box2d.b2Vec2} a
 * @param {box2d.b2Vec2} b
 */
box2d.b2DistanceSquared = function (a, b)
{
	var c_x = a.x - b.x;
	var c_y = a.y - b.y;
	return (c_x * c_x + c_y * c_y);
}

/** 
 * @export 
 * @constructor 
 * @param {number=} x
 * @param {number=} y
 * @param {number=} z
 */
box2d.b2Vec3 = function (x, y, z)
{
	this.x = x || 0.0;
	this.y = y || 0.0;
	this.z = z || 0.0;
	//this.a = new Float32Array(3);
	//this.a[0] = x || 0;
	//this.a[1] = y || 0;
	//this.a[2] = z || 0;
}

/**
 * @export 
 * @type {number} 
 */
box2d.b2Vec3.prototype.x = 0.0;
/**
 * @export 
 * @type {number} 
 */
box2d.b2Vec3.prototype.y = 0.0;
/**
 * @export 
 * @type {number} 
 */
box2d.b2Vec3.prototype.z = 0.0;

//	/**
//	 * @type {Float32Array} 
//	 */
//	box2d.b2Vec3.prototype.a;
//	
//	box2d.b2Vec3.prototype.__defineGetter__('x', function () { return this.a[0]; });
//	box2d.b2Vec3.prototype.__defineGetter__('y', function () { return this.a[1]; });
//	box2d.b2Vec3.prototype.__defineGetter__('z', function () { return this.a[2]; });
//	box2d.b2Vec3.prototype.__defineSetter__('x', function (n) { this.a[0] = n; });
//	box2d.b2Vec3.prototype.__defineSetter__('y', function (n) { this.a[1] = n; });
//	box2d.b2Vec3.prototype.__defineSetter__('z', function (n) { this.a[2] = n; });

/**
 * @export 
 * @const 
 * @type {box2d.b2Vec3}
 */
box2d.b2Vec3.ZERO = new box2d.b2Vec3();
/**
 * @export 
 * @type {box2d.b2Vec3}
 */
box2d.b2Vec3.s_t0 = new box2d.b2Vec3();

/**
 * @export 
 * @return {box2d.b2Vec3}
 */
box2d.b2Vec3.prototype.Clone = function ()
{
	return new box2d.b2Vec3(this.x, this.y, this.z);
}

/**
 * @export 
 * @return {box2d.b2Vec3}
 */
box2d.b2Vec3.prototype.SetZero = function ()
{
	this.x = 0.0;
	this.y = 0.0;
	this.z = 0.0;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec3}
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
box2d.b2Vec3.prototype.Set = function (x, y, z)
{
	this.x = x;
	this.y = y;
	this.z = z;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec3}
 * @param {box2d.b2Vec3} other
 */
box2d.b2Vec3.prototype.Copy = function (other)
{
	//if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(this !== other); }
	this.x = other.x;
	this.y = other.y;
	this.z = other.z;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec3}
 */
box2d.b2Vec3.prototype.SelfNeg = function ()
{
	this.x = (-this.x);
	this.y = (-this.y);
	this.z = (-this.z);
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec3}
 * @param {box2d.b2Vec3} v
 */
box2d.b2Vec3.prototype.SelfAdd = function (v)
{
	this.x += v.x;
	this.y += v.y;
	this.z += v.z;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec3}
 * @param {box2d.b2Vec2} v
 * @param {number} z
 */
box2d.b2Vec3.prototype.SelfAddV2 = function (v, z)
{
	this.x += v.x;
	this.y += v.y;
	this.z += z;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec3}
 * @param {number} x 
 * @param {number} y 
 * @param {number} z 
 */
box2d.b2Vec3.prototype.SelfAddXYZ = function (x, y, z)
{
	this.x += x;
	this.y += y;
	this.z += z;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec3}
 * @param {box2d.b2Vec3} v
 */
box2d.b2Vec3.prototype.SelfSub = function (v)
{
	this.x -= v.x;
	this.y -= v.y;
	this.z -= v.z;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec3}
 * @param {box2d.b2Vec2} v
 * @param {number} z
 */
box2d.b2Vec3.prototype.SelfSubV2 = function (v, z)
{
	this.x -= v.x;
	this.y -= v.y;
	this.z -= z;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec3}
 * @param {number} x 
 * @param {number} y 
 * @param {number} z 
 */
box2d.b2Vec3.prototype.SelfSubXYZ = function (x, y, z)
{
	this.x -= x;
	this.y -= y;
	this.z -= z;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec3}
 * @param {box2d.b2Vec3} v
 */
box2d.b2Vec3.prototype.SelfMul = function (v)
{
	this.x *= v.x;
	this.y *= v.y;
	this.z *= v.z;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec3}
 * @param {box2d.b2Vec2} v
 * @param {number} z
 */
box2d.b2Vec3.prototype.SelfMulV2 = function (v, z)
{
	this.x *= v.x;
	this.y *= v.y;
	this.z *= z;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec3}
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
box2d.b2Vec3.prototype.SelfMulXYZ = function (x, y, z)
{
	this.x *= x;
	this.y *= y;
	this.z *= z;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec3}
 * @param {number} s
 */
box2d.b2Vec3.prototype.SelfMulScalar = function (s)
{
	this.x *= s;
	this.y *= s;
	this.z *= s;
	return this;
}

/** 
 * Get the length of this vector (the norm). 
 * @export 
 * @return {number}
 */
box2d.b2Vec3.prototype.Length = function ()
{
	var x = this.x, y = this.y, z = this.z;
	return Math.sqrt(x * x + y * y + z * z);
}

/** 
 * Get the length squared. For performance, use this instead of 
 * b2Vec3::Length (if possible). 
 * @export 
 * @return {number}
 */
box2d.b2Vec3.prototype.LengthSquared = function ()
{
	var x = this.x, y = this.y, z = this.z;
	return (x * x + y * y + z * z);
}

/** 
 * Convert this vector into a unit vector. Returns the length. 
 * @export 
 * @return {number}
 */
box2d.b2Vec3.prototype.Normalize = function ()
{
	var length = this.Length();
	if (length >= box2d.b2_epsilon)
	{
		var inv_length = 1.0 / length;
		this.x *= inv_length;
		this.y *= inv_length;
		this.z *= inv_length;
	}
	return length;
}

/**
 * @export 
 * @return {box2d.b2Vec3}
 */
box2d.b2Vec3.prototype.SelfNormalize = function ()
{
	this.Normalize();
	return this;
}

/** 
 * Add two vectors component-wise.
 * @export 
 * @return {box2d.b2Vec3}
 * @param {box2d.b2Vec3} a
 * @param {box2d.b2Vec3} b
 * @param {box2d.b2Vec3} out
 */
box2d.b2Add_V3_V3 = function (a, b, out)
{
	out.x = a.x + b.x;
	out.y = a.y + b.y;
	out.z = a.z + b.z;
	return out;
}

/** 
 * Add two vectors component-wise.
 * @export 
 * @return {box2d.b2Vec3}
 * @param {box2d.b2Vec3} a
 * @param {box2d.b2Vec3} b
 * @param {box2d.b2Vec3} out
 */
box2d.b2Sub_V3_V3 = function (a, b, out)
{
	out.x = a.x + b.x;
	out.y = a.y + b.y;
	out.z = a.z + b.z;
	return out;
}

/** 
 * Perform the dot product on two vectors. 
 * @export 
 * @return {number}
 * @param {box2d.b2Vec3} a
 * @param {box2d.b2Vec3} b
 */
box2d.b2Dot_V3_V3 = function (a, b)
{
	return a.x * b.x + a.y * b.y + a.z * b.z;
}

/** 
 * Perform the cross product on two vectors. 
 * @export 
 * @return {box2d.b2Vec3}
 * @param {box2d.b2Vec3} a
 * @param {box2d.b2Vec3} b
 * @param {box2d.b2Vec3} out
 */
box2d.b2Cross_V3_V3 = function (a, b, out)
{
	var a_x = a.x, a_y = a.y, a_z = a.z;
	var b_x = b.x, b_y = b.y, b_z = b.z;
	out.x = a_y * b_z - a_z * b_y;
	out.y = a_z * b_x - a_x * b_z;
	out.z = a_x * b_y - a_y * b_x;
	return out;
}

/** 
 * @export 
 * @constructor 
 * @param {number=} x
 * @param {number=} y
 * @param {number=} z
 * @param {number=} w
 */
box2d.b2Vec4 = function (x, y, z, w)
{
	this.x = x || 0.0;
	this.y = y || 0.0;
	this.z = z || 0.0;
	this.w = w || 0.0;
	//this.a = new Float32Array(4);
	//this.a[0] = x || 0;
	//this.a[1] = y || 0;
	//this.a[2] = z || 0;
	//this.a[3] = w || 0;
}

/**
 * @export 
 * @type {number} 
 */
box2d.b2Vec4.prototype.x = 0.0;
/**
 * @export 
 * @type {number} 
 */
box2d.b2Vec4.prototype.y = 0.0;
/**
 * @export 
 * @type {number} 
 */
box2d.b2Vec4.prototype.z = 0.0;
/**
 * @export 
 * @type {number} 
 */
box2d.b2Vec4.prototype.w = 0.0;

//	/**
//	 * @type {Float32Array} 
//	 */
//	box2d.b2Vec4.prototype.a;
//	
//	box2d.b2Vec4.prototype.__defineGetter__('x', function () { return this.a[0]; });
//	box2d.b2Vec4.prototype.__defineGetter__('y', function () { return this.a[1]; });
//	box2d.b2Vec4.prototype.__defineGetter__('z', function () { return this.a[2]; });
//	box2d.b2Vec4.prototype.__defineGetter__('w', function () { return this.a[3]; });
//	box2d.b2Vec4.prototype.__defineSetter__('x', function (n) { this.a[0] = n; });
//	box2d.b2Vec4.prototype.__defineSetter__('y', function (n) { this.a[1] = n; });
//	box2d.b2Vec4.prototype.__defineSetter__('z', function (n) { this.a[2] = n; });
//	box2d.b2Vec4.prototype.__defineSetter__('w', function (n) { this.a[3] = n; });

/**
 * @export 
 * @const 
 * @type {box2d.b2Vec4}
 */
box2d.b2Vec4.ZERO = new box2d.b2Vec4(0.0, 0.0, 0.0, 0.0);
/**
 * @export 
 * @type {box2d.b2Vec4}
 */
box2d.b2Vec4.s_t0 = new box2d.b2Vec4();

/**
 * @export 
 * @return {box2d.b2Vec4}
 */
box2d.b2Vec4.prototype.Clone = function ()
{
	return new box2d.b2Vec4(this.x, this.y, this.z, this.w);
}

/**
 * @export 
 * @return {box2d.b2Vec4}
 */
box2d.b2Vec4.prototype.SetZero = function ()
{
	this.x = 0.0;
	this.y = 0.0;
	this.z = 0.0;
	this.w = 0.0;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec4}
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} w
 */
box2d.b2Vec4.prototype.Set = function (x, y, z, w)
{
	this.x = x;
	this.y = y;
	this.z = z;
	this.w = w;
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec4}
 * @param {box2d.b2Vec4} other
 */
box2d.b2Vec4.prototype.Copy = function (other)
{
	//if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(this !== other); }
	this.x = other.x;
	this.y = other.y;
	this.z = other.z;
	this.w = other.w;
	return this;
}

/** 
 * A 2-by-2 matrix. Stored in column-major order. 
 * @export 
 * @constructor 
 */
box2d.b2Mat22 = function ()
{
	this.ex = new box2d.b2Vec2(1.0, 0.0);
	this.ey = new box2d.b2Vec2(0.0, 1.0);
}

/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.b2Mat22.prototype.ex = null;
/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.b2Mat22.prototype.ey = null;

/**
 * @export 
 * @const 
 * @type {box2d.b2Mat22} 
 */
box2d.b2Mat22.IDENTITY = new box2d.b2Mat22();

/**
 * @export 
 * @return {box2d.b2Mat22}
 */
box2d.b2Mat22.prototype.Clone = function ()
{
	return new box2d.b2Mat22().Copy(this);
}

/** 
 * Initialize this matrix using an angle. This matrix becomes an 
 * orthonormal rotation matrix. 
 * @export 
 * @return {box2d.b2Mat22}
 * @param {number} radians
 */
box2d.b2Mat22.prototype.SetAngle = function (radians)
{
	var c = Math.cos(radians);
	var s = Math.sin(radians);
	this.ex.Set( c, s);
	this.ey.Set(-s, c);
	return this;
}

/**
 * @export 
 * @return {box2d.b2Mat22}
 * @param {box2d.b2Mat22} other
 */
box2d.b2Mat22.prototype.Copy = function (other)
{
	//if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(this !== other); }
	this.ex.Copy(other.ex);
	this.ey.Copy(other.ey);
	return this;
}

/** 
 * Set this to the identity matrix. 
 * @export 
 * @return {box2d.b2Mat22}
 */
box2d.b2Mat22.prototype.SetIdentity = function ()
{
	this.ex.Set(1.0, 0.0);
	this.ey.Set(0.0, 1.0);
	return this;
}

/** 
 * Set this matrix to all zeros. 
 * @export 
 * @return {box2d.b2Mat22}
 */
box2d.b2Mat22.prototype.SetZero = function ()
{
	this.ex.SetZero();
	this.ey.SetZero();
	return this;
}

/** 
 * Extract the angle from this matrix (assumed to be a rotation 
 * matrix). 
 * @export 
 * @return {number}
 */
box2d.b2Mat22.prototype.GetAngle = function ()
{
	return Math.atan2(this.ex.y, this.ex.x);
}

/**
 * @export 
 * @return {box2d.b2Mat22}
 * @param {box2d.b2Mat22} out
 */
box2d.b2Mat22.prototype.GetInverse = function (out)
{
	var a = this.ex.x;
	var b = this.ey.x;
	var c = this.ex.y;
	var d = this.ey.y;
	var det = a * d - b * c;
	if (det !== 0.0)
	{
		det = 1.0 / det;
	}
	out.ex.x =   det * d;
	out.ey.x = (-det * b);
	out.ex.y = (-det * c);
	out.ey.y =   det * a;
	return out;
}

/** 
 * Solve A * x = b, where b is a column vector. This is more 
 * efficient than computing the inverse in one-shot cases. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {number} b_x
 * @param {number} b_y
 * @param {box2d.b2Vec2} out
 */
box2d.b2Mat22.prototype.Solve = function (b_x, b_y, out)
{
	var a11 = this.ex.x, a12 = this.ey.x;
	var a21 = this.ex.y, a22 = this.ey.y;
	var det = a11 * a22 - a12 * a21;
	if (det !== 0.0)
	{
		det = 1.0 / det;
	}
	out.x = det * (a22 * b_x - a12 * b_y);
	out.y = det * (a11 * b_y - a21 * b_x);
	return out;
}

/**
 * @export 
 * @return {box2d.b2Mat22}
 */
box2d.b2Mat22.prototype.SelfAbs = function ()
{
	this.ex.SelfAbs();
	this.ey.SelfAbs();
	return this;
}

/**
 * @export 
 * @return {box2d.b2Mat22}
 */
box2d.b2Mat22.prototype.SelfInv = function ()
{
	return this.GetInverse(this);
}

/**
 * @export 
 * @return {box2d.b2Mat22}
 * @param {box2d.b2Mat22} M
 */
box2d.b2Mat22.prototype.SelfAdd = function (M)
{
	this.ex.SelfAdd(M.ex);
	this.ey.SelfAdd(M.ey);
	return this;
}

/**
 * @export 
 * @return {box2d.b2Mat22}
 * @param {box2d.b2Mat22} M
 */
box2d.b2Mat22.prototype.SelfSub = function (M)
{
	this.ex.SelfSub(M.ex);
	this.ey.SelfSub(M.ey);
	return this;
}

/**
 * @export 
 * @return {box2d.b2Mat22}
 * @param {box2d.b2Mat22} M
 * @param {box2d.b2Mat22} out
 */
box2d.b2Abs_M22 = function (M, out)
{
	var M_ex = M.ex, M_ey = M.ey;
	out.ex.x = box2d.b2Abs(M_ex.x);
	out.ex.y = box2d.b2Abs(M_ex.y);
	out.ey.x = box2d.b2Abs(M_ey.x);
	out.ey.y = box2d.b2Abs(M_ey.y);
	return out;
}

/** 
 * Multiply a matrix times a vector. If a rotation matrix is 
 * provided, then this transforms the vector from one frame to 
 * another. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Mat22} M
 * @param {box2d.b2Vec2} v
 * @param {box2d.b2Vec2} out
 */
box2d.b2Mul_M22_V2 = function (M, v, out)
{
	var M_ex = M.ex, M_ey = M.ey;
	var v_x = v.x, v_y = v.y;
	out.x = M_ex.x * v_x + M_ey.x * v_y;
	out.y = M_ex.y * v_x + M_ey.y * v_y;
	return out;
}

/** 
 * Multiply a matrix transpose times a vector. If a rotation 
 * matrix is provided, then this transforms the vector from one 
 * frame to another (inverse transform). 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Mat22} M
 * @param {box2d.b2Vec2} v
 * @param {box2d.b2Vec2} out
 */
box2d.b2MulT_M22_V2 = function (M, v, out)
{
	var M_ex = M.ex, M_ey = M.ey;
	var v_x = v.x, v_y = v.y;
	out.x = M_ex.x * v_x + M_ex.y * v_y;
	out.y = M_ey.x * v_x + M_ey.y * v_y;
	return out;
}

/**
 * @export 
 * @return {box2d.b2Mat22}
 * @param {box2d.b2Mat22} A
 * @param {box2d.b2Mat22} B
 * @param {box2d.b2Mat22} out
 */
box2d.b2Add_M22_M22 = function (A, B, out)
{
	var A_ex = A.ex, A_ey = A.ey;
	var B_ex = B.ex, B_ey = B.ey;
	out.ex.x = A_ex.x + B_ex.x;
	out.ex.y = A_ex.y + B_ex.y;
	out.ey.x = A_ey.x + B_ey.x;
	out.ey.y = A_ey.y + B_ey.y;
	return out;
}

/**
 * @export 
 * @return {box2d.b2Mat22}
 * @param {box2d.b2Mat22} A
 * @param {box2d.b2Mat22} B
 * @param {box2d.b2Mat22} out
 */
box2d.b2Mul_M22_M22 = function (A, B, out)
{
	var A_ex_x = A.ex.x, A_ex_y = A.ex.y;
	var A_ey_x = A.ey.x, A_ey_y = A.ey.y;
	var B_ex_x = B.ex.x, B_ex_y = B.ex.y;
	var B_ey_x = B.ey.x, B_ey_y = B.ey.y;
	out.ex.x = A_ex_x * B_ex_x + A_ey_x * B_ex_y;
	out.ex.y = A_ex_y * B_ex_x + A_ey_y * B_ex_y;
	out.ey.x = A_ex_x * B_ey_x + A_ey_x * B_ey_y;
	out.ey.y = A_ex_y * B_ey_x + A_ey_y * B_ey_y;
	return out;
}

/**
 * @export 
 * @return {box2d.b2Mat22}
 * @param {box2d.b2Mat22} A
 * @param {box2d.b2Mat22} B
 * @param {box2d.b2Mat22} out
 */
box2d.b2MulT_M22_M22 = function (A, B, out)
{
	var A_ex_x = A.ex.x, A_ex_y = A.ex.y;
	var A_ey_x = A.ey.x, A_ey_y = A.ey.y;
	var B_ex_x = B.ex.x, B_ex_y = B.ex.y;
	var B_ey_x = B.ey.x, B_ey_y = B.ey.y;
	out.ex.x = A_ex_x * B_ex_x + A_ex_y * B_ex_y;
	out.ex.y = A_ey_x * B_ex_x + A_ey_y * B_ex_y;
	out.ey.x = A_ex_x * B_ey_x + A_ex_y * B_ey_y;
	out.ey.y = A_ey_x * B_ey_x + A_ey_y * B_ey_y;
	return out;
}

/** 
 * A 3-by-3 matrix. Stored in column-major order. 
 * @export 
 * @constructor 
 */
box2d.b2Mat33 = function ()
{
	this.ex = new box2d.b2Vec3(1.0, 0.0, 0.0);
	this.ey = new box2d.b2Vec3(0.0, 1.0, 0.0);
	this.ez = new box2d.b2Vec3(0.0, 0.0, 1.0);
}

/**
 * @export 
 * @type {box2d.b2Vec3} 
 */
box2d.b2Mat33.prototype.ex = null;
/**
 * @export 
 * @type {box2d.b2Vec3} 
 */
box2d.b2Mat33.prototype.ey = null;
/**
 * @export 
 * @type {box2d.b2Vec3} 
 */
box2d.b2Mat33.prototype.ez = null;

/**
 * @export 
 * @const 
 * @type {box2d.b2Mat33} 
 */
box2d.b2Mat33.IDENTITY = new box2d.b2Mat33();

/**
 * @export 
 * @return {box2d.b2Mat33}
 */
box2d.b2Mat33.prototype.Clone = function ()
{
	return new box2d.b2Mat33().Copy(this);
}

/**
 * @export 
 * @return {box2d.b2Mat33}
 * @param {box2d.b2Mat33} other
 */
box2d.b2Mat33.prototype.Copy = function (other)
{
	//if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(this !== other); }
	this.ex.Copy(other.ex);
	this.ey.Copy(other.ey);
	this.ez.Copy(other.ez);
	return this;
}

/**
 * @export 
 * @return {box2d.b2Mat33}
 */
box2d.b2Mat33.prototype.SetIdentity = function ()
{
	this.ex.Set(1.0, 0.0, 0.0);
	this.ey.Set(0.0, 1.0, 0.0);
	this.ez.Set(0.0, 0.0, 1.0);
	return this;
}

/** 
 * Set this matrix to all zeros. 
 * @export 
 * @return {box2d.b2Mat33}
 */
box2d.b2Mat33.prototype.SetZero = function ()
{
	this.ex.SetZero();
	this.ey.SetZero();
	this.ez.SetZero();
	return this;
}

/**
 * @export 
 * @return {box2d.b2Mat33}
 * @param {box2d.b2Mat33} M
 */
box2d.b2Mat33.prototype.SelfAdd = function (M)
{
	this.ex.SelfAdd(M.ex);
	this.ey.SelfAdd(M.ey);
	this.ez.SelfAdd(M.ez);
	return this;
}

/** 
 * Solve A * x = b, where b is a column vector. This is more 
 * efficient than computing the inverse in one-shot cases. 
 * @export 
 * @return {box2d.b2Vec3}
 * @param {number} b_x
 * @param {number} b_y
 * @param {number} b_z
 * @param {box2d.b2Vec3} out
 */
box2d.b2Mat33.prototype.Solve33 = function (b_x, b_y, b_z, out)
{
	var a11 = this.ex.x, a21 = this.ex.y, a31 = this.ex.z;
	var a12 = this.ey.x, a22 = this.ey.y, a32 = this.ey.z;
	var a13 = this.ez.x, a23 = this.ez.y, a33 = this.ez.z;
	var det = a11 * (a22 * a33 - a32 * a23) + a21 * (a32 * a13 - a12 * a33) + a31 * (a12 * a23 - a22 * a13);
	if (det !== 0.0)
	{
		det = 1.0 / det;
	}
	out.x = det * (b_x * (a22 * a33 - a32 * a23) + b_y * (a32 * a13 - a12 * a33) + b_z * (a12 * a23 - a22 * a13));
	out.y = det * (a11 * (b_y * a33 - b_z * a23) + a21 * (b_z * a13 - b_x * a33) + a31 * (b_x * a23 - b_y * a13));
	out.z = det * (a11 * (a22 * b_z - a32 * b_y) + a21 * (a32 * b_x - a12 * b_z) + a31 * (a12 * b_y - a22 * b_x));
	return out;
}

/** 
 * Solve A * x = b, where b is a column vector. This is more 
 * efficient than computing the inverse in one-shot cases. Solve 
 * only the upper 2-by-2 matrix equation. 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {number} b_x
 * @param {number} b_y
 * @param {box2d.b2Vec2} out
 */
box2d.b2Mat33.prototype.Solve22 = function (b_x, b_y, out)
{
	var a11 = this.ex.x, a12 = this.ey.x;
	var a21 = this.ex.y, a22 = this.ey.y;
	var det = a11 * a22 - a12 * a21;
	if (det !== 0.0)
	{
		det = 1.0 / det;
	}
	out.x = det * (a22 * b_x - a12 * b_y);
	out.y = det * (a11 * b_y - a21 * b_x);
	return out;
}

/** 
 * Get the inverse of this matrix as a 2-by-2. 
 * Returns the zero matrix if singular.
 * @export 
 * @return {void} 
 * @param {box2d.b2Mat33} M 
 */
box2d.b2Mat33.prototype.GetInverse22 = function (M)
{
	var a = this.ex.x, b = this.ey.x, c = this.ex.y, d = this.ey.y;
	var det = a * d - b * c;
	if (det !== 0.0)
	{
		det = 1.0 / det;
	}

	M.ex.x =  det * d; M.ey.x = -det * b; M.ex.z = 0.0;
	M.ex.y = -det * c; M.ey.y =  det * a; M.ey.z = 0.0;
	M.ez.x =      0.0; M.ez.y =      0.0; M.ez.z = 0.0;
}

/** 
 * Get the symmetric inverse of this matrix as a 3-by-3. 
 * Returns the zero matrix if singular.
 * @export 
 * @return {void} 
 * @param {box2d.b2Mat33} M 
 */
box2d.b2Mat33.prototype.GetSymInverse33 = function (M)
{
	var det = box2d.b2Dot_V3_V3(this.ex, box2d.b2Cross_V3_V3(this.ey, this.ez, box2d.b2Vec3.s_t0));
	if (det !== 0.0)
	{
		det = 1.0 / det;
	}

	var a11 = this.ex.x, a12 = this.ey.x, a13 = this.ez.x;
	var a22 = this.ey.y, a23 = this.ez.y;
	var a33 = this.ez.z;

	M.ex.x = det * (a22 * a33 - a23 * a23);
	M.ex.y = det * (a13 * a23 - a12 * a33);
	M.ex.z = det * (a12 * a23 - a13 * a22);

	M.ey.x = M.ex.y;
	M.ey.y = det * (a11 * a33 - a13 * a13);
	M.ey.z = det * (a13 * a12 - a11 * a23);

	M.ez.x = M.ex.z;
	M.ez.y = M.ey.z;
	M.ez.z = det * (a11 * a22 - a12 * a12);
}

/** 
 * Multiply a matrix times a vector. 
 * @export 
 * @return {box2d.b2Vec3}
 * @param {box2d.b2Mat33} A
 * @param {box2d.b2Vec3} v
 * @param {box2d.b2Vec3} out
 */
box2d.b2Mul_M33_V3 = function (A, v, out)
{
	var v_x = v.x, v_y = v.y, v_z = v.z;
	out.x = A.ex.x * v_x + A.ey.x * v_y + A.ez.x * v_z;
	out.y = A.ex.y * v_x + A.ey.y * v_y + A.ez.y * v_z;
	out.z = A.ex.z * v_x + A.ey.z * v_y + A.ez.z * v_z;
	return out;
}
/**
 * @export 
 * @return {box2d.b2Vec3}
 * @param {box2d.b2Mat33} A
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {box2d.b2Vec3} out
 */
box2d.b2Mul_M33_X_Y_Z = function (A, x, y, z, out)
{
	out.x = A.ex.x * x + A.ey.x * y + A.ez.x * z;
	out.y = A.ex.y * x + A.ey.y * y + A.ez.y * z;
	out.z = A.ex.z * x + A.ey.z * y + A.ez.z * z;
	return out;
}
/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Mat33} A
 * @param {box2d.b2Vec2} v
 * @param {box2d.b2Vec2} out
 */
box2d.b2Mul22_M33_V2 = function (A, v, out)
{
	var v_x = v.x, v_y = v.y;
	out.x = A.ex.x * v_x + A.ey.x * v_y;
	out.y = A.ex.y * v_x + A.ey.y * v_y;
	return out;
}
/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Mat33} A
 * @param {number} x
 * @param {number} y
 * @param {box2d.b2Vec2} out
 */
box2d.b2Mul_M33_X_Y = function (A, x, y, out)
{
	out.x = A.ex.x * x + A.ey.x * y;
	out.y = A.ex.y * x + A.ey.y * y;
	return out;
}

/** 
 * Rotation 
 * Initialize from an angle in radians 
 * @export 
 * @constructor 
 * @param {number=} angle 
 */
box2d.b2Rot = function (angle)
{
	/// Sine and cosine
	if (angle)
	{
		/// TODO_ERIN optimize
		this.angle = angle;
		this.s = Math.sin(angle);
		this.c = Math.cos(angle);
	}
}

/**
 * @export 
 * @type {number} 
 */
box2d.b2Rot.prototype.angle = 0.0;
/**
 * @export 
 * @type {number} 
 */
box2d.b2Rot.prototype.s = 0.0;
/**
 * @export 
 * @type {number} 
 */
box2d.b2Rot.prototype.c = 1.0;

/**
 * @export 
 * @const 
 * @type {box2d.b2Rot} 
 */
box2d.b2Rot.IDENTITY = new box2d.b2Rot();

/**
 * @export 
 * @return {box2d.b2Rot}
 */
box2d.b2Rot.prototype.Clone = function ()
{
	return new box2d.b2Rot().Copy(this);
}

/** 
 * @export 
 * @return {box2d.b2Rot}
 * @param {box2d.b2Rot} other 
 */
box2d.b2Rot.prototype.Copy = function (other)
{
	this.angle = other.angle;
	this.s = other.s;
	this.c = other.c;
	return this;
}

/** 
 * Set using an angle in radians. 
 * @export 
 * @return {box2d.b2Rot} 
 * @param {number} angle 
 */
box2d.b2Rot.prototype.Set = function (angle)
{
	/// TODO_ERIN optimize
	if (Math.abs(this.angle - angle) >= box2d.b2_epsilon)
	{
		this.angle = angle;
		this.s = Math.sin(angle);
		this.c = Math.cos(angle);
	}
	return this;
}

/** 
 * @export 
 * @return {box2d.b2Rot} 
 * @param {number} angle 
 */
box2d.b2Rot.prototype.SetAngle = box2d.b2Rot.prototype.Set;

/** 
 * Set to the identity rotation 
 * @export 
 * @return {box2d.b2Rot} 
 */
box2d.b2Rot.prototype.SetIdentity = function ()
{
	this.angle = 0.0;
	this.s = 0.0;
	this.c = 1.0;
	return this;
}

/** 
 * Get the angle in radians 
 * @export 
 * @return {number}
 */
box2d.b2Rot.prototype.GetAngle = function ()
{
	return this.angle;
//	return Math.atan2(this.s, this.c);
}

/** 
 * Get the x-axis 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2Rot.prototype.GetXAxis = function (out)
{
	out.x = this.c;
	out.y = this.s;
	return out;
}

/** 
 * Get the y-axis 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2Rot.prototype.GetYAxis = function (out)
{
	out.x = -this.s;
	out.y = this.c;
	return out;
}

/** 
 * Multiply two rotations: q * r 
 * @export 
 * @return {box2d.b2Rot} 
 * @param {box2d.b2Rot} q
 * @param {box2d.b2Rot} r
 * @param {box2d.b2Rot} out 
 */
box2d.b2Mul_R_R = function (q, r, out)
{
	// [qc -qs] * [rc -rs] = [qc*rc-qs*rs -qc*rs-qs*rc]
	// [qs  qc]   [rs  rc]   [qs*rc+qc*rs -qs*rs+qc*rc]
	// s = qs * rc + qc * rs
	// c = qc * rc - qs * rs
	var q_c = q.c, q_s = q.s;
	var r_c = r.c, r_s = r.s;
	out.s = q_s * r_c + q_c * r_s;
	out.c = q_c * r_c - q_s * r_s;
	out.angle = box2d.b2WrapAngle(q.angle + r.angle);
	return out;
}

/** 
 * Transpose multiply two rotations: qT * r 
 * @export 
 * @return {box2d.b2Rot} 
 * @param {box2d.b2Rot} q
 * @param {box2d.b2Rot} r
 * @param {box2d.b2Rot} out 
 */
box2d.b2MulT_R_R = function (q, r, out)
{
	// [ qc qs] * [rc -rs] = [qc*rc+qs*rs -qc*rs+qs*rc]
	// [-qs qc]   [rs  rc]   [-qs*rc+qc*rs qs*rs+qc*rc]
	// s = qc * rs - qs * rc
	// c = qc * rc + qs * rs
	var q_c = q.c, q_s = q.s;
	var r_c = r.c, r_s = r.s;
	out.s = q_c * r_s - q_s * r_c;
	out.c = q_c * r_c + q_s * r_s;
	out.angle = box2d.b2WrapAngle(q.angle - r.angle);
	return out;
}

/** 
 * Rotate a vector 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Rot} q 
 * @param {box2d.b2Vec2} v 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2Mul_R_V2 = function (q, v, out)
{
	var q_c = q.c, q_s = q.s;
	var v_x = v.x, v_y = v.y;
	out.x = q_c * v_x - q_s * v_y;
	out.y = q_s * v_x + q_c * v_y;
	return out;
}

/** 
 * Inverse rotate a vector 
 * @export 
 * @return {box2d.b2Vec2} 
 * @param {box2d.b2Rot} q 
 * @param {box2d.b2Vec2} v 
 * @param {box2d.b2Vec2} out 
 */
box2d.b2MulT_R_V2 = function (q, v, out)
{
	var q_c = q.c, q_s = q.s;
	var v_x = v.x, v_y = v.y;
	out.x =  q_c * v_x + q_s * v_y;
	out.y = -q_s * v_x + q_c * v_y;
	return out;
}

/** 
 * A transform contains translation and rotation. It is used to 
 * represent the position and orientation of rigid frames. 
 * @export 
 * @constructor 
 */
box2d.b2Transform = function ()
{
	this.p = new box2d.b2Vec2();
	this.q = new box2d.b2Rot();
}

/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.b2Transform.prototype.p = null;
/**
 * @export 
 * @type {box2d.b2Rot} 
 */
box2d.b2Transform.prototype.q = null;

/**
 * @export 
 * @const 
 * @type {box2d.b2Transform} 
 */
box2d.b2Transform.IDENTITY = new box2d.b2Transform();

/**
 * @export 
 * @return {box2d.b2Transform}
 */
box2d.b2Transform.prototype.Clone = function ()
{
	return new box2d.b2Transform().Copy(this);
}

/**
 * @export 
 * @return {box2d.b2Transform}
 * @param {box2d.b2Transform} other
 */
box2d.b2Transform.prototype.Copy = function (other)
{
	//if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(this !== other); }
	this.p.Copy(other.p);
	this.q.Copy(other.q);
	return this;
}

/** 
 * Set this to the identity transform. 
 * @export 
 * @return {box2d.b2Transform}
 */
box2d.b2Transform.prototype.SetIdentity = function ()
{
	this.p.SetZero();
	this.q.SetIdentity();
	return this;
}

/** 
 * @return {box2d.b2Transform} 
 * @param {box2d.b2Vec2} position 
 * @param {number} angle 
 */
box2d.b2Transform.prototype.Set = function (position, angle)
{
	return this.SetPositionRotationAngle(position, angle);
}

/** 
 * Set this based on the position and angle. 
 * @export 
 * @return {box2d.b2Transform}
 * @param {box2d.b2Vec2} position
 * @param {box2d.b2Rot} q
 */
box2d.b2Transform.prototype.SetPositionRotation = function (position, q)
{
	this.p.Copy(position);
	this.q.Copy(q);
	return this;
}

/**
 * @export 
 * @return {box2d.b2Transform}
 * @param {box2d.b2Vec2} pos
 * @param {number} a
 */
box2d.b2Transform.prototype.SetPositionRotationAngle = function (pos, a)
{
	this.p.Copy(pos);
	this.q.SetAngle(a);
	return this;
}

/**
 * @export 
 * @return {box2d.b2Transform}
 * @param {box2d.b2Vec2} position
 */
box2d.b2Transform.prototype.SetPosition = function (position)
{
	this.p.Copy(position);
	return this;
}

/**
 * @export 
 * @return {box2d.b2Transform}
 * @param {number} x
 * @param {number} y
 */
box2d.b2Transform.prototype.SetPositionXY = function (x, y)
{
	this.p.Set(x, y);
	return this;
}

/**
 * @export 
 * @return {box2d.b2Transform}
 * @param {box2d.b2Rot} rotation
 */
box2d.b2Transform.prototype.SetRotation = function (rotation)
{
	this.q.Copy(rotation);
	return this;
}

/**
 * @export 
 * @return {box2d.b2Transform}
 * @param {number} angle
 */
box2d.b2Transform.prototype.SetRotationAngle = function (angle)
{
	this.q.SetAngle(angle);
	return this;
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 */
box2d.b2Transform.prototype.GetPosition = function ()
{
	return this.p;
}

/**
 * @export 
 * @return {box2d.b2Rot}
 */
box2d.b2Transform.prototype.GetRotation = function ()
{
	return this.q;
}

/**
 * @export 
 * @return {number}
 */
box2d.b2Transform.prototype.GetRotationAngle = function ()
{
	return this.q.GetAngle();
}

/**
 * @export 
 * @return {number}
 */
box2d.b2Transform.prototype.GetAngle = function ()
{
	return this.q.GetAngle();
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Transform} T
 * @param {box2d.b2Vec2} v
 * @param {box2d.b2Vec2} out
 */
box2d.b2Mul_X_V2 = function (T, v, out)
{
//	float32 x = (T.q.c * v.x - T.q.s * v.y) + T.p.x;
//	float32 y = (T.q.s * v.x + T.q.c * v.y) + T.p.y;
//
//	return b2Vec2(x, y);
	var T_q_c = T.q.c, T_q_s = T.q.s;
	var v_x = v.x, v_y = v.y;
	out.x = (T_q_c * v_x - T_q_s * v_y) + T.p.x;
	out.y = (T_q_s * v_x + T_q_c * v_y) + T.p.y;
	return out;
}

/**
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Transform} T
 * @param {box2d.b2Vec2} v
 * @param {box2d.b2Vec2} out
 */
box2d.b2MulT_X_V2 = function (T, v, out)
{
//	float32 px = v.x - T.p.x;
//	float32 py = v.y - T.p.y;
//	float32 x = (T.q.c * px + T.q.s * py);
//	float32 y = (-T.q.s * px + T.q.c * py);
//
//	return b2Vec2(x, y);
	var T_q_c = T.q.c, T_q_s = T.q.s;
	var p_x = v.x - T.p.x;
	var p_y = v.y - T.p.y;
	out.x = ( T_q_c * p_x + T_q_s * p_y);
	out.y = (-T_q_s * p_x + T_q_c * p_y);
	return out;
}

/**
 * v2 = A.q.Rot(B.q.Rot(v1) + B.p) + A.p
 *    = (A.q * B.q).Rot(v1) + A.q.Rot(B.p) + A.p
 * @export 
 * @return {box2d.b2Transform}
 * @param {box2d.b2Transform} A
 * @param {box2d.b2Transform} B
 * @param {box2d.b2Transform} out 
 */
box2d.b2Mul_X_X = function (A, B, out)
{
	box2d.b2Mul_R_R(A.q, B.q, out.q);
	box2d.b2Add_V2_V2(box2d.b2Mul_R_V2(A.q, B.p, out.p), A.p, out.p);
	return out;
}

/**
 * v2 = A.q' * (B.q * v1 + B.p - A.p)
 *    = A.q' * B.q * v1 + A.q' * (B.p - A.p)
 * @export 
 * @return {box2d.b2Transform}
 * @param {box2d.b2Transform} A
 * @param {box2d.b2Transform} B
 * @param {box2d.b2Transform} out 
 */
box2d.b2MulT_X_X = function (A, B, out)
{
	box2d.b2MulT_R_R(A.q, B.q, out.q);
	box2d.b2MulT_R_V2(A.q, box2d.b2Sub_V2_V2(B.p, A.p, out.p), out.p);
	return out;
}

/**
 * This describes the motion of a body/shape for TOI computation.
 * Shapes are defined with respect to the body origin, which may
 * no coincide with the center of mass. However, to support dynamics
 * we must interpolate the center of mass position.
 * @export 
 * @constructor 
 */
box2d.b2Sweep = function ()
{
	this.localCenter = new box2d.b2Vec2();
	this.c0 = new box2d.b2Vec2();
	this.c = new box2d.b2Vec2();
};

/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.b2Sweep.prototype.localCenter = null; ///< local center of mass position
/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.b2Sweep.prototype.c0 = null; ///< center world positions
/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.b2Sweep.prototype.c = null;
/**
 * @export 
 * @type {number} 
 */
box2d.b2Sweep.prototype.a0 = 0.0; ///< world angles
/**
 * @export 
 * @type {number} 
 */
box2d.b2Sweep.prototype.a = 0.0;

/**
 * Fraction of the current time step in the range [0,1]
 * c0 and a0 are the positions at alpha0.
 * @export 
 * @type {number} 
 */
box2d.b2Sweep.prototype.alpha0 = 0.0;

/**
 * @export 
 * @return {box2d.b2Sweep}
 */
box2d.b2Sweep.prototype.Clone = function ()
{
	return new box2d.b2Sweep().Copy(this);
}

/**
 * @export 
 * @return {box2d.b2Sweep}
 * @param {box2d.b2Sweep} other
 */
box2d.b2Sweep.prototype.Copy = function (other)
{
	//if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(this !== other); }
	this.localCenter.Copy(other.localCenter);
	this.c0.Copy(other.c0);
	this.c.Copy(other.c);
	this.a0 = other.a0;
	this.a = other.a;
	this.alpha0 = other.alpha0;
	return this;
}

/** 
 * Get the interpolated transform at a specific time. 
 * @export 
 * @return {box2d.b2Transform}
 * @param {box2d.b2Transform} xf
 * @param {number} beta is a factor in [0,1], where 0 indicates alpha0.
 */
box2d.b2Sweep.prototype.GetTransform = function (xf, beta)
{
	var one_minus_beta = (1.0 - beta);
	xf.p.x = one_minus_beta * this.c0.x + beta * this.c.x;
	xf.p.y = one_minus_beta * this.c0.y + beta * this.c.y;
	var angle = one_minus_beta * this.a0 + beta * this.a;
	xf.q.SetAngle(angle);

	// Shift to origin
	xf.p.SelfSub(box2d.b2Mul_R_V2(xf.q, this.localCenter, box2d.b2Vec2.s_t0));
	return xf;
}

/** 
 * Advance the sweep forward, yielding a new initial state. 
 * @export 
 * @return {void} 
 * @param {number} alpha the new initial time.
 */
box2d.b2Sweep.prototype.Advance = function (alpha)
{
	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(this.alpha0 < 1.0); }
	var beta = (alpha - this.alpha0) / (1.0 - this.alpha0);
	this.c0.x += beta * (this.c.x - this.c0.x);
	this.c0.y += beta * (this.c.y - this.c0.y);
	this.a0 += beta * (this.a - this.a0);
	this.alpha0 = alpha;
}

/** 
 * Normalize an angle in radians to be between -pi and pi 
 * @export 
 * @return {void} 
 */
box2d.b2Sweep.prototype.Normalize = function ()
{
	this.a0 = box2d.b2WrapAngle(this.a0);
	this.a = box2d.b2WrapAngle(this.a);
}

/** 
 * @export 
 * @return {number}
 * @param {box2d.b2Vec3|box2d.b2Vec2} a
 * @param {box2d.b2Vec3|box2d.b2Vec2} b
 */
box2d.b2Dot = function (a, b)
{
	if ((a instanceof box2d.b2Vec2) && (b instanceof box2d.b2Vec2))
	{
		return box2d.b2Dot_V2_V2(a, b);
	}
	else if ((a instanceof box2d.b2Vec3) && (b instanceof box2d.b2Vec3))
	{
		return box2d.b2Dot_V3_V3(a, b);
	}
	else
	{
		throw new Error();
	}
}

/** 
 * @export 
 * @return {box2d.b2Vec3|box2d.b2Vec2|number}
 * @param {box2d.b2Vec3|box2d.b2Vec2|number} a
 * @param {box2d.b2Vec3|box2d.b2Vec2|number} b
 * @param {box2d.b2Vec3|box2d.b2Vec2} out
 */
box2d.b2Cross = function (a, b, out)
{
	if ((a instanceof box2d.b2Vec2) && (b instanceof box2d.b2Vec2))
	{
		return box2d.b2Cross_V2_V2(a, b);
	}
	else if ((a instanceof box2d.b2Vec2) && (typeof(b) === 'number') && (out instanceof box2d.b2Vec2))
	{
		return box2d.b2Cross_V2_S(a, b, out);
	}
	else if ((typeof(a) === 'number') && (b instanceof box2d.b2Vec2) && (out instanceof box2d.b2Vec2))
	{
		return box2d.b2Cross_S_V2(a, b, out);
	}
	else if ((a instanceof box2d.b2Vec3) && (b instanceof box2d.b2Vec3) && (out instanceof box2d.b2Vec3))
	{
		return box2d.b2Cross_V3_V3(a, b, out);
	}
	else
	{
		throw new Error();
	}
}

/** 
 * @export 
 * @return {box2d.b2Vec3|box2d.b2Vec2}
 * @param {box2d.b2Vec3|box2d.b2Vec2} a
 * @param {box2d.b2Vec3|box2d.b2Vec2} b
 * @param {box2d.b2Vec3|box2d.b2Vec2} out
 */
box2d.b2Add = function (a, b, out)
{
	if ((a instanceof box2d.b2Vec2) && (b instanceof box2d.b2Vec2) && (out instanceof box2d.b2Vec2))
	{
		return box2d.b2Add_V2_V2(a, b, out);
	}
	else if ((a instanceof box2d.b2Vec3) && (b instanceof box2d.b2Vec3) && (out instanceof box2d.b2Vec3))
	{
		return box2d.b2Add_V3_V3(a, b, out);
	}
	else
	{
		throw new Error();
	}
}

/** 
 * @export 
 * @return {box2d.b2Vec3|box2d.b2Vec2}
 * @param {box2d.b2Vec3|box2d.b2Vec2} a
 * @param {box2d.b2Vec3|box2d.b2Vec2} b
 * @param {box2d.b2Vec3|box2d.b2Vec2} out
 */
box2d.b2Sub = function (a, b, out)
{
	if ((a instanceof box2d.b2Vec2) && (b instanceof box2d.b2Vec2) && (out instanceof box2d.b2Vec2))
	{
		return box2d.b2Sub_V2_V2(a, b, out);
	}
	else if ((a instanceof box2d.b2Vec3) && (b instanceof box2d.b2Vec3) && (out instanceof box2d.b2Vec3))
	{
		return box2d.b2Sub_V3_V3(a, b, out);
	}
	else
	{
		throw new Error();
	}
}

/** 
 * @export 
 * @return {box2d.b2Transform|box2d.b2Rot|box2d.b2Mat22|box2d.b2Vec3|box2d.b2Vec2}
 * @param {box2d.b2Transform|box2d.b2Rot|box2d.b2Mat33|box2d.b2Mat22} a
 * @param {box2d.b2Transform|box2d.b2Rot|box2d.b2Mat22|box2d.b2Vec3|box2d.b2Vec2} b
 * @param {box2d.b2Transform|box2d.b2Rot|box2d.b2Mat22|box2d.b2Vec3|box2d.b2Vec2} out
 */
box2d.b2Mul = function (a, b, out)
{
	if ((a instanceof box2d.b2Mat22) && (b instanceof box2d.b2Vec2) && (out instanceof box2d.b2Vec2))
	{
		return box2d.b2Mul_M22_V2(a, b, out);
	}
	else if ((a instanceof box2d.b2Mat22) && (b instanceof box2d.b2Mat22) && (out instanceof box2d.b2Mat22))
	{
		return box2d.b2Mul_M22_M22(a, b, out);
	}
	else if ((a instanceof box2d.b2Mat33) && (b instanceof box2d.b2Vec3) && (out instanceof box2d.b2Vec3))
	{
		return box2d.b2Mul_M33_V3(a, b, out);
	}
	else if ((a instanceof box2d.b2Rot) && (b instanceof box2d.b2Rot) && (out instanceof box2d.b2Rot))
	{
		return box2d.b2Mul_R_R(a, b, out);
	}
	else if ((a instanceof box2d.b2Rot) && (b instanceof box2d.b2Vec2) && (out instanceof box2d.b2Vec2))
	{
		return box2d.b2Mul_R_V2(a, b, out);
	}
	else if ((a instanceof box2d.b2Transform) && (b instanceof box2d.b2Vec2) && (out instanceof box2d.b2Vec2))
	{
		return box2d.b2Mul_X_V2(a, b, out);
	}
	else if ((a instanceof box2d.b2Transform) && (b instanceof box2d.b2Transform) && (out instanceof box2d.b2Transform))
	{
		return box2d.b2Mul_X_X(a, b, out);
	}
	else
	{
		throw new Error();
	}
}

/** 
 * @export 
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Mat22} a
 * @param {box2d.b2Vec2} b
 * @param {box2d.b2Vec2} out
 */
box2d.b2Mul22 = function (a, b, out)
{
	if ((a instanceof box2d.b2Mat33) && (b instanceof box2d.b2Vec2))
	{
		return box2d.b2Mul22_M33_V2(a, b, out);
	}
	else
	{
		throw new Error();
	}
}

/** 
 * @export 
 * @return {box2d.b2Transform|box2d.b2Rot|box2d.b2Mat22|box2d.b2Vec3|box2d.b2Vec2}
 * @param {box2d.b2Transform|box2d.b2Rot|box2d.b2Mat33|box2d.b2Mat22} a
 * @param {box2d.b2Transform|box2d.b2Rot|box2d.b2Mat22|box2d.b2Vec3|box2d.b2Vec2} b
 * @param {box2d.b2Transform|box2d.b2Rot|box2d.b2Mat22|box2d.b2Vec3|box2d.b2Vec2} out
 */
box2d.b2MulT = function (a, b, out)
{
	if ((a instanceof box2d.b2Mat22) && (b instanceof box2d.b2Vec2) && (out instanceof box2d.b2Vec2))
	{
		return box2d.b2MulT_M22_V2(a, b, out);
	}
	else if ((a instanceof box2d.b2Mat22) && (b instanceof box2d.b2Mat22) && (out instanceof box2d.b2Mat22))
	{
		return box2d.b2MulT_M22_M22(a, b, out);
	}
///	else if ((a instanceof box2d.b2Mat33) && (b instanceof box2d.b2Vec3) && (out instanceof box2d.b2Vec3))
///	{
///		return box2d.b2MulT_M33_V3(a, b, out);
///	}
	else if ((a instanceof box2d.b2Rot) && (b instanceof box2d.b2Rot) && (out instanceof box2d.b2Rot))
	{
		return box2d.b2MulT_R_R(a, b, out);
	}
	else if ((a instanceof box2d.b2Rot) && (b instanceof box2d.b2Vec2) && (out instanceof box2d.b2Vec2))
	{
		return box2d.b2MulT_R_V2(a, b, out);
	}
	else if ((a instanceof box2d.b2Transform) && (b instanceof box2d.b2Vec2) && (out instanceof box2d.b2Vec2))
	{
		return box2d.b2MulT_X_V2(a, b, out);
	}
	else if ((a instanceof box2d.b2Transform) && (b instanceof box2d.b2Transform) && (out instanceof box2d.b2Transform))
	{
		return box2d.b2MulT_X_X(a, b, out);
	}
	else
	{
		throw new Error();
	}
}

