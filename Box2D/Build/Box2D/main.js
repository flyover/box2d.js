goog.provide('main.start');

goog.require('box2d');

/**
 * @export 
 * @return {void} 
 */
main.start = function ()
{
	var str = "Box2D version " + box2d.b2_version + " (revision " + box2d.b2_changelist + ")";

	document.body.appendChild(document.createElement('p')).innerHTML = str;

	var gravity = new box2d.b2Vec2(0.0, -9.8);
	var world = new box2d.b2World(gravity);
}

