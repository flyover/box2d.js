/*
 * Copyright (c) 2011 Erin Catto http://www.box2d.org
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

//#if B2_ENABLE_ROPE

goog.provide('box2d.b2Rope');

goog.require('box2d.b2Math');
goog.require('box2d.b2Draw');

/**
 * @export
 * @constructor
 */
box2d.b2RopeDef = function() {
  this.vertices = new Array();
  this.masses = new Array();
  this.gravity = new box2d.b2Vec2();
};

/*box2d.b2Vec2[]*/
box2d.b2RopeDef.prototype.vertices = null;

/*int32*/
box2d.b2RopeDef.prototype.count = 0;

/*float32[]*/
box2d.b2RopeDef.prototype.masses = null;

/*box2d.b2Vec2*/
box2d.b2RopeDef.prototype.gravity = null;

/*float32*/
box2d.b2RopeDef.prototype.damping = 0.1;

/**
 * Stretching stiffness
 */
/*float32*/
box2d.b2RopeDef.prototype.k2 = 0.9;

/**
 * Bending stiffness. Values above 0.5 can make the simulation
 * blow up.
 */
/*float32*/
box2d.b2RopeDef.prototype.k3 = 0.1;

/**
 * @export
 * @constructor
 */
box2d.b2Rope = function() {
  this.m_gravity = new box2d.b2Vec2();
};

/*int32*/
box2d.b2Rope.prototype.m_count = 0;
/*box2d.b2Vec2[]*/
box2d.b2Rope.prototype.m_ps = null;
/*box2d.b2Vec2[]*/
box2d.b2Rope.prototype.m_p0s = null;
/*box2d.b2Vec2[]*/
box2d.b2Rope.prototype.m_vs = null;

/*float32[]*/
box2d.b2Rope.prototype.m_ims = null;

/*float32[]*/
box2d.b2Rope.prototype.m_Ls = null;
/*float32[]*/
box2d.b2Rope.prototype.m_as = null;

/*box2d.b2Vec2*/
box2d.b2Rope.prototype.m_gravity = null;
/*float32*/
box2d.b2Rope.prototype.m_damping = 0;

/*float32*/
box2d.b2Rope.prototype.m_k2 = 1;
/*float32*/
box2d.b2Rope.prototype.m_k3 = 0.1;

/**
 * @export
 * @return {number}
 */
box2d.b2Rope.prototype.GetVertexCount = function() {
  return this.m_count;
}

/**
 * @export
 * @return {Array.<box2d.b2Vec2>}
 */
box2d.b2Rope.prototype.GetVertices = function() {
  return this.m_ps;
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2RopeDef} def
 */
box2d.b2Rope.prototype.Initialize = function(def) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(def.count >= 3);
  }
  this.m_count = def.count;
  //	this.m_ps = (box2d.b2Vec2*)b2Alloc(this.m_count * sizeof(box2d.b2Vec2));
  this.m_ps = box2d.b2Vec2.MakeArray(this.m_count);
  //	this.m_p0s = (box2d.b2Vec2*)b2Alloc(this.m_count * sizeof(box2d.b2Vec2));
  this.m_p0s = box2d.b2Vec2.MakeArray(this.m_count);
  //	this.m_vs = (box2d.b2Vec2*)b2Alloc(this.m_count * sizeof(box2d.b2Vec2));
  this.m_vs = box2d.b2Vec2.MakeArray(this.m_count);
  //	this.m_ims = (float32*)b2Alloc(this.m_count * sizeof(float32));
  this.m_ims = box2d.b2MakeNumberArray(this.m_count);

  for ( /*int32*/ var i = 0; i < this.m_count; ++i) {
    this.m_ps[i].Copy(def.vertices[i]);
    this.m_p0s[i].Copy(def.vertices[i]);
    this.m_vs[i].SetZero();

    /*float32*/
    var m = def.masses[i];
    if (m > 0) {
      this.m_ims[i] = 1 / m;
    } else {
      this.m_ims[i] = 0;
    }
  }

  /*int32*/
  var count2 = this.m_count - 1;
  /*int32*/
  var count3 = this.m_count - 2;
  //	this.m_Ls = (float32*)be2Alloc(count2 * sizeof(float32));
  this.m_Ls = box2d.b2MakeNumberArray(count2);
  //	this.m_as = (float32*)b2Alloc(count3 * sizeof(float32));
  this.m_as = box2d.b2MakeNumberArray(count3);

  for ( /*int32*/ var i = 0; i < count2; ++i) {
    /*box2d.b2Vec2&*/
    var p1 = this.m_ps[i];
    /*box2d.b2Vec2&*/
    var p2 = this.m_ps[i + 1];
    this.m_Ls[i] = box2d.b2Distance(p1, p2);
  }

  for ( /*int32*/ var i = 0; i < count3; ++i) {
    /*box2d.b2Vec2&*/
    var p1 = this.m_ps[i];
    /*box2d.b2Vec2&*/
    var p2 = this.m_ps[i + 1];
    /*box2d.b2Vec2&*/
    var p3 = this.m_ps[i + 2];

    /*box2d.b2Vec2*/
    var d1 = box2d.b2Sub_V2_V2(p2, p1, box2d.b2Vec2.s_t0);
    /*box2d.b2Vec2*/
    var d2 = box2d.b2Sub_V2_V2(p3, p2, box2d.b2Vec2.s_t1);

    /*float32*/
    var a = box2d.b2Cross_V2_V2(d1, d2);
    /*float32*/
    var b = box2d.b2Dot_V2_V2(d1, d2);

    this.m_as[i] = box2d.b2Atan2(a, b);
  }

  this.m_gravity.Copy(def.gravity);
  this.m_damping = def.damping;
  this.m_k2 = def.k2;
  this.m_k3 = def.k3;
}

/**
 * @export
 * @return {void}
 * @param {number} h
 * @param {number} iterations
 */
box2d.b2Rope.prototype.Step = function( /*float32*/ h, /*int32*/ iterations) {
  if (h === 0) {
    return;
  }

  /*float32*/
  var d = Math.exp(-h * this.m_damping);

  for ( /*int32*/ var i = 0; i < this.m_count; ++i) {
    this.m_p0s[i].Copy(this.m_ps[i]);
    if (this.m_ims[i] > 0) {
      this.m_vs[i].SelfMulAdd(h, this.m_gravity);
    }
    this.m_vs[i].SelfMul(d);
    this.m_ps[i].SelfMulAdd(h, this.m_vs[i]);

  }

  for ( /*int32*/ var i = 0; i < iterations; ++i) {
    this.SolveC2();
    this.SolveC3();
    this.SolveC2();
  }

  /*float32*/
  var inv_h = 1 / h;
  for ( /*int32*/ var i = 0; i < this.m_count; ++i) {
    box2d.b2Mul_S_V2(inv_h, box2d.b2Sub_V2_V2(this.m_ps[i], this.m_p0s[i], box2d.b2Vec2.s_t0), this.m_vs[i]);
  }
}

/**
 * @export
 * @return {void}
 */
box2d.b2Rope.prototype.SolveC2 = function() {
  /*int32*/
  var count2 = this.m_count - 1;

  for ( /*int32*/ var i = 0; i < count2; ++i) {
    /*box2d.b2Vec2&*/
    var p1 = this.m_ps[i];
    /*box2d.b2Vec2&*/
    var p2 = this.m_ps[i + 1];

    /*box2d.b2Vec2*/
    var d = box2d.b2Sub_V2_V2(p2, p1, box2d.b2Rope.s_d);
    /*float32*/
    var L = d.Normalize();

    /*float32*/
    var im1 = this.m_ims[i];
    /*float32*/
    var im2 = this.m_ims[i + 1];

    if (im1 + im2 === 0) {
      continue;
    }

    /*float32*/
    var s1 = im1 / (im1 + im2);
    /*float32*/
    var s2 = im2 / (im1 + im2);

    p1.SelfMulSub(this.m_k2 * s1 * (this.m_Ls[i] - L), d);
    p2.SelfMulAdd(this.m_k2 * s2 * (this.m_Ls[i] - L), d);

    //		this.m_ps[i] = p1;
    //		this.m_ps[i + 1] = p2;
  }
}
box2d.b2Rope.s_d = new box2d.b2Vec2();

/**
 * @export
 * @return {void}
 * @param {number} angle
 */
box2d.b2Rope.prototype.SetAngle = function(angle) {
  /*int32*/
  var count3 = this.m_count - 2;
  for ( /*int32*/ var i = 0; i < count3; ++i) {
    this.m_as[i] = angle;
  }
}

/**
 * @export
 * @return {void}
 */
box2d.b2Rope.prototype.SolveC3 = function() {
  /*int32*/
  var count3 = this.m_count - 2;

  for ( /*int32*/ var i = 0; i < count3; ++i) {
    /*box2d.b2Vec2&*/
    var p1 = this.m_ps[i];
    /*box2d.b2Vec2&*/
    var p2 = this.m_ps[i + 1];
    /*box2d.b2Vec2&*/
    var p3 = this.m_ps[i + 2];

    /*float32*/
    var m1 = this.m_ims[i];
    /*float32*/
    var m2 = this.m_ims[i + 1];
    /*float32*/
    var m3 = this.m_ims[i + 2];

    /*box2d.b2Vec2*/
    var d1 = box2d.b2Sub_V2_V2(p2, p1, box2d.b2Rope.s_d1);
    /*box2d.b2Vec2*/
    var d2 = box2d.b2Sub_V2_V2(p3, p2, box2d.b2Rope.s_d2);

    /*float32*/
    var L1sqr = d1.LengthSquared();
    /*float32*/
    var L2sqr = d2.LengthSquared();

    if (L1sqr * L2sqr === 0) {
      continue;
    }

    /*float32*/
    var a = box2d.b2Cross_V2_V2(d1, d2);
    /*float32*/
    var b = box2d.b2Dot_V2_V2(d1, d2);

    /*float32*/
    var angle = box2d.b2Atan2(a, b);

    /*box2d.b2Vec2*/
    var Jd1 = box2d.b2Mul_S_V2((-1 / L1sqr), d1.SelfSkew(), box2d.b2Rope.s_Jd1);
    /*box2d.b2Vec2*/
    var Jd2 = box2d.b2Mul_S_V2((1 / L2sqr), d2.SelfSkew(), box2d.b2Rope.s_Jd2);

    /*box2d.b2Vec2*/
    var J1 = box2d.b2Rope.s_J1.Copy(Jd1).SelfNeg();
    /*box2d.b2Vec2*/
    var J2 = box2d.b2Sub_V2_V2(Jd1, Jd2, box2d.b2Rope.s_J2);
    /*box2d.b2Vec2*/
    var J3 = Jd2;

    /*float32*/
    var mass = m1 * box2d.b2Dot_V2_V2(J1, J1) + m2 * box2d.b2Dot_V2_V2(J2, J2) + m3 * box2d.b2Dot_V2_V2(J3, J3);
    if (mass === 0) {
      continue;
    }

    mass = 1 / mass;

    /*float32*/
    var C = angle - this.m_as[i];

    while (C > box2d.b2_pi) {
      angle -= 2 * box2d.b2_pi;
      C = angle - this.m_as[i];
    }

    while (C < -box2d.b2_pi) {
      angle += 2 * box2d.b2_pi;
      C = angle - this.m_as[i];
    }

    /*float32*/
    var impulse = -this.m_k3 * mass * C;

    p1.SelfMulAdd((m1 * impulse), J1);
    p2.SelfMulAdd((m2 * impulse), J2);
    p3.SelfMulAdd((m3 * impulse), J3);

    //		this.m_ps[i] = p1;
    //		this.m_ps[i + 1] = p2;
    //		this.m_ps[i + 2] = p3;
  }
}
box2d.b2Rope.s_d1 = new box2d.b2Vec2();
box2d.b2Rope.s_d2 = new box2d.b2Vec2();
box2d.b2Rope.s_Jd1 = new box2d.b2Vec2();
box2d.b2Rope.s_Jd2 = new box2d.b2Vec2();
box2d.b2Rope.s_J1 = new box2d.b2Vec2();
box2d.b2Rope.s_J2 = new box2d.b2Vec2();

/**
 * @export
 * @return {void}
 * @param {box2d.b2Draw} draw
 */
box2d.b2Rope.prototype.Draw = function(draw) {
  /*box2d.b2Color*/
  var c = new box2d.b2Color(0.4, 0.5, 0.7);

  for ( /*int32*/ var i = 0; i < this.m_count - 1; ++i) {
    draw.DrawSegment(this.m_ps[i], this.m_ps[i + 1], c);
  }
}

//#endif
