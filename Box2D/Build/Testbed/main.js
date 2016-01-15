goog.provide('main.start');

goog.require('box2d.Testbed');

// shim layer with setTimeout fallback
goog.global.requestAnimFrame = (function() {
  return goog.global['requestAnimationFrame'] ||
    goog.global['webkitRequestAnimationFrame'] ||
    goog.global['mozRequestAnimationFrame'] ||
    goog.global['oRequestAnimationFrame'] ||
    goog.global['msRequestAnimationFrame'] ||
    function( /* function */ callback, /* DOMElement */ element) {
      goog.global.setTimeout(callback, 1000 / 60);
    };
})();

/**
 * @export
 * @type {box2d.Testbed.Main}
 */
main.m_app = null;

/**
 * @export
 * @return {void}
 */
main.start = function() {
  main.m_app = new box2d.Testbed.Main();

  main.loop();
}

/**
 * @export
 * @return {void}
 */
main.loop = function() {
  goog.global.requestAnimFrame(main.loop);

  main.m_app.SimulationLoop();
}
