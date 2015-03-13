goog.provide('main.start');

goog.require('box2d.HelloWorld');

/**
 * @export 
 * @return {void} 
 */
main.start = function ()
{
	var str = "Box2D Hello World version " + box2d.b2_version + " (revision " + box2d.b2_changelist + ")";

	document.body.appendChild(document.createElement('p')).innerHTML = str;

	box2d.HelloWorld.main();
}

