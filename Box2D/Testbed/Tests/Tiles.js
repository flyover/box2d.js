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

goog.provide('box2d.Testbed.Tiles');

goog.require('box2d.Testbed.Test');

/**
 * This stress tests the dynamic tree broad-phase. This also
 * shows that tile based collision is _not_ smooth due to Box2D
 * not knowing about adjacency.
 */

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Tiles = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  this.m_fixtureCount = 0;
  /*box2d.b2Timer*/
  var timer = new box2d.b2Timer();

  {
    /*float32*/
    var a = 0.5;
    /*box2d.b2BodyDef*/
    var bd = new box2d.b2BodyDef();
    bd.position.y = -a;
    /*box2d.b2Body*/
    var ground = this.m_world.CreateBody(bd);

    {
      /*int32*/
      var N = 200;
      /*int32*/
      var M = 10;
      /*box2d.b2Vec2*/
      var position = new box2d.b2Vec2();
      position.y = 0.0;
      for ( /*int32*/ var j = 0; j < M; ++j) {
        position.x = -N * a;
        for ( /*int32*/ var i = 0; i < N; ++i) {
          /*box2d.b2PolygonShape*/
          var shape = new box2d.b2PolygonShape();
          shape.SetAsBox(a, a, position, 0.0);
          ground.CreateFixture(shape, 0.0);
          ++this.m_fixtureCount;
          position.x += 2.0 * a;
        }
        position.y -= 2.0 * a;
      }
    }
    //		else
    //		{
    //			/*int32*/ var N = 200;
    //			/*int32*/ var M = 10;
    //			/*box2d.b2Vec2*/ var position = new box2d.b2Vec2();
    //			position.x = -N * a;
    //			for (/*int32*/ var i = 0; i < N; ++i)
    //			{
    //				position.y = 0.0;
    //				for (/*int32*/ var j = 0; j < M; ++j)
    //				{
    //					/*box2d.b2PolygonShape*/ var shape = new box2d.b2PolygonShape();
    //					shape.SetAsBox(a, a, position, 0.0);
    //					ground.CreateFixture(shape, 0.0);
    //					position.y -= 2.0 * a;
    //				}
    //				position.x += 2.0 * a;
    //			}
    //		}
  }

  {
    /*float32*/
    var a = 0.5;
    /*box2d.b2PolygonShape*/
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(a, a);

    /*box2d.b2Vec2*/
    var x = new box2d.b2Vec2(-7.0, 0.75);
    /*box2d.b2Vec2*/
    var y = new box2d.b2Vec2();
    /*box2d.b2Vec2*/
    var deltaX = new box2d.b2Vec2(0.5625, 1.25);
    /*box2d.b2Vec2*/
    var deltaY = new box2d.b2Vec2(1.125, 0.0);

    for ( /*int32*/ var i = 0; i < box2d.Testbed.Tiles.e_count; ++i) {
      y.Copy(x);

      for ( /*int32*/ var j = i; j < box2d.Testbed.Tiles.e_count; ++j) {
        /*box2d.b2BodyDef*/
        var bd = new box2d.b2BodyDef();
        bd.type = box2d.b2BodyType.b2_dynamicBody;
        bd.position.Copy(y);

        //if (i === 0 && j === 0)
        //{
        //	bd.allowSleep = false;
        //}
        //else
        //{
        //	bd.allowSleep = true;
        //}

        /*box2d.b2Body*/
        var body = this.m_world.CreateBody(bd);
        body.CreateFixture(shape, 5.0);
        ++this.m_fixtureCount;
        y.SelfAdd(deltaY);
      }

      x.SelfAdd(deltaX);
    }
  }

  this.m_createTime = timer.GetMilliseconds();
}

goog.inherits(box2d.Testbed.Tiles, box2d.Testbed.Test);

/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.Tiles.e_count = 20;

/**
 * @export
 * @type {number}
 */
box2d.Testbed.Tiles.prototype.m_fixtureCount = 0;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.Tiles.prototype.m_createTime = 0.0;

/**
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Tiles.prototype.Step = function(settings) {
  /*const box2d.b2ContactManager*/
  var cm = this.m_world.GetContactManager();
  /*int32*/
  var height = cm.m_broadPhase.GetTreeHeight();
  /*int32*/
  var leafCount = cm.m_broadPhase.GetProxyCount();
  /*int32*/
  var minimumNodeCount = 2 * leafCount - 1;
  /*float32*/
  var minimumHeight = Math.ceil(Math.log(minimumNodeCount) / Math.log(2.0));
  this.m_debugDraw.DrawString(5, this.m_textLine, "dynamic tree height = %d, min = %d", height, minimumHeight);
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;

  box2d.Testbed.Test.prototype.Step.call(this, settings);

  this.m_debugDraw.DrawString(5, this.m_textLine, "create time = %6.2f ms, fixture count = %d",
    this.m_createTime, this.m_fixtureCount);
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;

  //box2d.b2DynamicTree* tree = this.m_world.this.m_contactManager.m_broadPhase.m_tree;

  //if (this.m_stepCount === 400)
  //{
  //	tree.RebuildBottomUp();
  //}
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Tiles.Create = function(canvas, settings) {
  return new box2d.Testbed.Tiles(canvas, settings);
}
