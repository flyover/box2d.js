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

goog.provide('box2d.Testbed.Main');

//#if B2_ENABLE_PARTICLE
goog.provide('box2d.Testbed.TestMain');
//#endif

goog.require('box2d.Testbed.Test');
goog.require('box2d.Testbed.TestEntries');

goog.require('goog.events.BrowserEvent'); // fix compile warning
goog.require('goog.events.KeyCodes');

//#if B2_ENABLE_PARTICLE

goog.require('box2d.Testbed.FullScreenUI');
goog.require('box2d.Testbed.ParticleParameter');

// Fullscreen UI object.
box2d.Testbed.TestMain.fullscreenUI = new box2d.Testbed.FullScreenUI();
// Used to control the behavior of particle tests.
box2d.Testbed.TestMain.particleParameter = new box2d.Testbed.ParticleParameter();

//#endif

/**
 * @export
 * @constructor
 */
box2d.Testbed.Main = function() {
  var that = this; // for callbacks

  var fps_div = this.m_fps_div = /** @type {HTMLDivElement} */ (document.body.appendChild(document.createElement('div')));
  fps_div.style.position = 'absolute';
  fps_div.style.left = '0px';
  fps_div.style.bottom = '0px';
  fps_div.style.backgroundColor = 'rgba(0,0,255,0.75)';
  fps_div.style.color = 'white';
  fps_div.style.font = '10pt Courier New';
  fps_div.style.zIndex = 256;
  fps_div.innerHTML = 'FPS';

  var debug_div = this.m_debug_div = /** @type {HTMLDivElement} */ (document.body.appendChild(document.createElement('div')));
  debug_div.style.position = 'absolute';
  debug_div.style.left = '0px';
  debug_div.style.bottom = '0px';
  debug_div.style.backgroundColor = 'rgba(0,0,255,0.75)';
  debug_div.style.color = 'white';
  debug_div.style.font = '10pt Courier New';
  debug_div.style.zIndex = 256;
  debug_div.innerHTML = '';

  this.m_settings = new box2d.Testbed.Settings();

  this.m_test_entries = box2d.Testbed.GetTestEntries(new Array());

  this.m_projection0 = new box2d.b2Vec2();
  this.m_viewCenter0 = new box2d.b2Vec2();

  document.body.style.backgroundColor = 'black';

  var main_div = document.body.appendChild(document.createElement('div'));
  main_div.style.position = 'absolute'; // relative to document.body
  main_div.style.left = '0px';
  main_div.style.top = '0px';
  var resize_main_div = function() {
    //window.console.log(window.innerWidth + "x" + window.innerHeight);
    main_div.style.width = window.innerWidth + 'px';
    main_div.style.height = window.innerHeight + 'px';
  }
  window.addEventListener('resize', function(e) {
    resize_main_div();
  }, false);
  window.addEventListener('orientationchange', function(e) {
    resize_main_div();
  }, false);
  resize_main_div();

  var title_div = /** @type {HTMLDivElement} */ (main_div.appendChild(document.createElement('div')));
  title_div.style.textAlign = 'center';
  title_div.style.color = 'grey';
  title_div.innerHTML = "Box2D Testbed version " + box2d.b2_version + " (revision " + box2d.b2_changelist + ")";

  var view_div = main_div.appendChild(document.createElement('div'));

  var canvas_div = this.m_canvas_div = /** @type {HTMLDivElement} */ (view_div.appendChild(document.createElement('div')));
  canvas_div.style.position = 'absolute'; // relative to view_div
  canvas_div.style.left = '0px';
  canvas_div.style.right = '0px';
  canvas_div.style.top = '0px';
  canvas_div.style.bottom = '0px';

  var canvas = this.m_canvas = /** @type {HTMLCanvasElement} */ (canvas_div.appendChild(document.createElement('canvas')));

  var resize_canvas = function() {
    //window.console.log(canvas.parentNode.clientWidth + "x" + canvas.parentNode.clientHeight);
    if (canvas.width !== canvas.parentNode.clientWidth) {
      canvas.width = canvas.parentNode.clientWidth;
    }
    if (canvas.height !== canvas.parentNode.clientHeight) {
      canvas.height = canvas.parentNode.clientHeight;
    }
  }
  window.addEventListener('resize', function(e) {
    resize_canvas();
  }, false);
  window.addEventListener('orientationchange', function(e) {
    resize_canvas();
  }, false);
  resize_canvas();

  this.m_ctx = /** @type {CanvasRenderingContext2D} */ (this.m_canvas.getContext("2d"));

  var controls_div = /** @type {HTMLDivElement} */ (view_div.appendChild(document.createElement('div')));
  controls_div.style.position = 'absolute'; // relative to view_div
  controls_div.style.backgroundColor = 'rgba(255,255,255,0.5)';
  controls_div.style.padding = '8px';
  controls_div.style.right = '0px';
  controls_div.style.top = '0px';
  controls_div.style.bottom = '0px';
  controls_div.style.overflowY = 'scroll';

  // tests select box
  controls_div.appendChild(document.createTextNode("Tests"));
  controls_div.appendChild(document.createElement('br'));
  var test_select = document.createElement('select');
  test_select.id = 'testEntries';
  for (var i = 0; i < this.m_test_entries.length; ++i) {
    var option = document.createElement('option');
    option.text = this.m_test_entries[i].name;
    option.value = i;
    test_select.add(option, null);
  }
  test_select.selectedIndex = this.m_test_index;
  test_select.addEventListener('change', function(e) {
    that.m_test_index = this.selectedIndex;
    that.LoadTest();
  }, false);
  controls_div.appendChild(test_select);
  controls_div.appendChild(document.createElement('br'));

  controls_div.appendChild(document.createElement('hr'));

  // simulation number inputs

  /**
   * @return {Node}
   * @param {Node} parent
   * @param {string} label
   * @param {number} number
   * @param {number} min
   * @param {number} max
   * @param {number} step
   * @param {function(number):void} callback
   */
  var connect_number_input = function(parent, label, number, min, max, step, callback) {
    var number_input_tr = parent.appendChild(document.createElement('tr'));
    var number_input_td0 = number_input_tr.appendChild(document.createElement('td'));
    number_input_td0.align = 'right';
    number_input_td0.appendChild(document.createTextNode(label));
    var number_input_td1 = number_input_tr.appendChild(document.createElement('td'));
    var number_input = document.createElement('input');
    if (!goog.userAgent.IE) {
      number_input.type = 'number';
    }
    number_input.size = 8;
    number_input.min = min || 1;
    number_input.max = max || 100;
    number_input.step = step || 1;
    number_input.value = number;
    number_input.addEventListener('change', function(e) {
      callback(parseInt(this.value, 10));
    }, false);
    number_input_td1.appendChild(number_input);
    return number_input;
  }

  var number_input_table = controls_div.appendChild(document.createElement('table'));
  var number_input;
  number_input = connect_number_input(number_input_table, "Vel Iters", that.m_settings.velocityIterations, 1, 20, 1, function(number) {
    that.m_settings.velocityIterations = number;
  });
  number_input = connect_number_input(number_input_table, "Pos Iters", that.m_settings.positionIterations, 1, 20, 1, function(number) {
    that.m_settings.positionIterations = number;
  });
  //#if B2_ENABLE_PARTICLE
  number_input = connect_number_input(number_input_table, "Pcl Iters", that.m_settings.particleIterations, 1, 100, 1, function(number) {
    that.m_settings.particleIterations = number;
  });
  //#endif
  number_input = connect_number_input(number_input_table, "Hertz", that.m_settings.hz, 10, 120, 1, function(number) {
    that.m_settings.hz = number;
  });

  // simulation checkbox inputs

  /**
   * @return {Node}
   * @param {Node} parent
   * @param {string} label
   * @param {boolean} checked
   * @param {function(boolean):void} callback
   */
  var connect_checkbox_input = function(parent, label, checked, callback) {
    var checkbox_input = document.createElement('input');
    checkbox_input.type = 'checkbox';
    checkbox_input.checked = checked;
    checkbox_input.addEventListener('click', function(e) {
      callback(this.checked);
    }, false);
    parent.appendChild(checkbox_input);
    parent.appendChild(document.createTextNode(label));
    parent.appendChild(document.createElement('br'));
    return checkbox_input;
  }

  var checkbox_input;
  checkbox_input = connect_checkbox_input(controls_div, "Sleep", that.m_settings.enableSleep, function(checked) {
    that.m_settings.enableSleep = checked;
  });
  checkbox_input = connect_checkbox_input(controls_div, "Warm Starting", that.m_settings.enableWarmStarting, function(checked) {
    that.m_settings.enableWarmStarting = checked;
  });
  checkbox_input = connect_checkbox_input(controls_div, "Time of Impact", that.m_settings.enableContinuous, function(checked) {
    that.m_settings.enableContinuous = checked;
  });
  checkbox_input = connect_checkbox_input(controls_div, "Sub-Stepping", that.m_settings.enableSubStepping, function(checked) {
    that.m_settings.enableSubStepping = checked;
  });
  //#if B2_ENABLE_PARTICLE
  checkbox_input = connect_checkbox_input(controls_div, "Strict Particle/Body Contacts", that.m_settings.strictContacts, function(checked) {
    that.m_settings.strictContacts = checked;
  });
  //#endif

  // draw checkbox inputs
  var draw_fieldset = controls_div.appendChild(document.createElement('fieldset'));
  var draw_legend = draw_fieldset.appendChild(document.createElement('legend'));
  draw_legend.appendChild(document.createTextNode("Draw"));
  checkbox_input = connect_checkbox_input(draw_fieldset, "Shapes", that.m_settings.drawShapes, function(checked) {
    that.m_settings.drawShapes = checked;
  });
  //#if B2_ENABLE_PARTICLE
  checkbox_input = connect_checkbox_input(draw_fieldset, "Particles", that.m_settings.drawParticles, function(checked) {
    that.m_settings.drawParticles = checked;
  });
  //#endif
  checkbox_input = connect_checkbox_input(draw_fieldset, "Joints", that.m_settings.drawJoints, function(checked) {
    that.m_settings.drawJoints = checked;
  });
  checkbox_input = connect_checkbox_input(draw_fieldset, "AABBs", that.m_settings.drawAABBs, function(checked) {
    that.m_settings.drawAABBs = checked;
  });
  checkbox_input = connect_checkbox_input(draw_fieldset, "Contact Points", that.m_settings.drawContactPoints, function(checked) {
    that.m_settings.drawContactPoints = checked;
  });
  checkbox_input = connect_checkbox_input(draw_fieldset, "Contact Normals", that.m_settings.drawContactNormals, function(checked) {
    that.m_settings.drawContactNormals = checked;
  });
  checkbox_input = connect_checkbox_input(draw_fieldset, "Contact Impulses", that.m_settings.drawContactImpulse, function(checked) {
    that.m_settings.drawContactImpulse = checked;
  });
  checkbox_input = connect_checkbox_input(draw_fieldset, "Friction Impulses", that.m_settings.drawFrictionImpulse, function(checked) {
    that.m_settings.drawFrictionImpulse = checked;
  });
  checkbox_input = connect_checkbox_input(draw_fieldset, "Center of Masses", that.m_settings.drawCOMs, function(checked) {
    that.m_settings.drawCOMs = checked;
  });
  checkbox_input = connect_checkbox_input(draw_fieldset, "Statistics", that.m_settings.drawStats, function(checked) {
    that.m_settings.drawStats = checked;
  });
  checkbox_input = connect_checkbox_input(draw_fieldset, "Profile", that.m_settings.drawProfile, function(checked) {
    that.m_settings.drawProfile = checked;
  });

  // simulation buttons
  var connect_button_input = function(parent, label, callback) {
    var button_input = document.createElement('input');
    button_input.type = 'button';
    button_input.style.width = 100;
    button_input.value = label;
    button_input.addEventListener('click', callback, false);
    parent.appendChild(button_input);
    parent.appendChild(document.createElement('br'));
    return button_input;
  }

  var button_div = controls_div.appendChild(document.createElement('div'));
  button_div.align = 'center';
  var button_input;
  button_input = connect_button_input(button_div, "Pause", function(e) {
    that.Pause();
  });
  button_input = connect_button_input(button_div, "Step", function(e) {
    that.SingleStep();
  });
  button_input = connect_button_input(button_div, "Restart", function(e) {
    that.LoadTest(true);
  });
  button_input = connect_button_input(button_div, "Demo", function(e) {
    that.ToggleDemo();
  });
  this.m_demo_button = /** @type {HTMLButtonElement} */ (button_input);

  // disable context menu to use right-click
  window.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  }, true);

  canvas_div.addEventListener('mousemove', function(e) {
    that.HandleMouseMove( /** @type {MouseEvent} */ (e));
  }, false);
  canvas_div.addEventListener('mousedown', function(e) {
    that.HandleMouseDown( /** @type {MouseEvent} */ (e));
  }, false);
  canvas_div.addEventListener('mouseup', function(e) {
    that.HandleMouseUp( /** @type {MouseEvent} */ (e));
  }, false);
  canvas_div.addEventListener('mousewheel', function(e) {
    that.HandleMouseWheel( /** @type {MouseEvent} */ (e));
  }, false);

  canvas_div.addEventListener('touchmove', function(e) {
    that.HandleTouchMove( /** @type {TouchEvent} */ (e));
  }, false);
  canvas_div.addEventListener('touchstart', function(e) {
    that.HandleTouchStart( /** @type {TouchEvent} */ (e));
  }, false);
  canvas_div.addEventListener('touchend', function(e) {
    that.HandleTouchEnd( /** @type {TouchEvent} */ (e));
  }, false);

  window.addEventListener('keydown', function(e) {
    that.HandleKeyDown( /** @type {KeyboardEvent} */ (e));
  }, false);
  window.addEventListener('keyup', function(e) {
    that.HandleKeyUp( /** @type {KeyboardEvent} */ (e));
  }, false);

  this.LoadTest();

  this.m_time_last = new Date().getTime();
}

/**
 * @export
 * @type {number}
 */
box2d.Testbed.Main.prototype.m_time_last = 0;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.Main.prototype.m_fps_time = 0;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.Main.prototype.m_fps_frames = 0;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.Main.prototype.m_fps = 0;
/**
 * @export
 * @type {HTMLDivElement}
 */
box2d.Testbed.Main.prototype.m_fps_div = null;
/**
 * @export
 * @type {HTMLDivElement}
 */
box2d.Testbed.Main.prototype.m_debug_div = null;
/**
 * @export
 * @type {box2d.Testbed.Settings}
 */
box2d.Testbed.Main.prototype.m_settings = null;
/**
 * @export
 * @type {box2d.Testbed.Test}
 */
box2d.Testbed.Main.prototype.m_test = null;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.Main.prototype.m_test_index = 0;
/**
 * @export
 * @type {Array.<box2d.Testbed.TestEntry>}
 */
box2d.Testbed.Main.prototype.m_test_entries = null;
/**
 * @export
 * @type {boolean}
 */
box2d.Testbed.Main.prototype.m_shift = false;
/**
 * @export
 * @type {boolean}
 */
box2d.Testbed.Main.prototype.m_ctrl = false;
/**
 * @export
 * @type {boolean}
 */
box2d.Testbed.Main.prototype.m_lMouseDown = false;
/**
 * @export
 * @type {boolean}
 */
box2d.Testbed.Main.prototype.m_rMouseDown = false;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.Testbed.Main.prototype.m_projection0 = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.Testbed.Main.prototype.m_viewCenter0 = null;
/**
 * @export
 * @type {boolean}
 */
box2d.Testbed.Main.prototype.m_demo_mode = false;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.Main.prototype.m_demo_time = 0;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.Main.prototype.m_max_demo_time = 1000 * 10;
/**
 * @export
 * @type {HTMLDivElement}
 */
box2d.Testbed.Main.prototype.m_canvas_div = null;
/**
 * @export
 * @type {HTMLCanvasElement}
 */
box2d.Testbed.Main.prototype.m_canvas = null;
/**
 * @export
 * @type {CanvasRenderingContext2D}
 */
box2d.Testbed.Main.prototype.m_ctx = null;
/**
 * @export
 * @type {HTMLButtonElement}
 */
box2d.Testbed.Main.prototype.m_demo_button = null;

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} viewport
 * @param {box2d.b2Vec2} out
 */
box2d.Testbed.Main.prototype.ConvertViewportToElement = function(viewport, out) {
  // 0,0 at center of canvas, x right and y up
  var rect = this.m_canvas_div.getBoundingClientRect();
  var element_x = (+viewport.x) + rect.left + (0.5 * rect.width);
  var element_y = (-viewport.y) + rect.top + (0.5 * rect.height);
  var element = out.Set(element_x, element_y);
  return element;
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} element
 * @param {box2d.b2Vec2} out
 */
box2d.Testbed.Main.prototype.ConvertElementToViewport = function(element, out) {
  // 0,0 at center of canvas, x right and y up
  var rect = this.m_canvas_div.getBoundingClientRect();
  var viewport_x = +(element.x - rect.left - (0.5 * rect.width));
  var viewport_y = -(element.y - rect.top - (0.5 * rect.height));
  var viewport = out.Set(viewport_x, viewport_y);
  return viewport;
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} projection
 * @param {box2d.b2Vec2} out
 */
box2d.Testbed.Main.prototype.ConvertProjectionToViewport = function(projection, out) {
  var viewport = out.Copy(projection);
  box2d.b2Mul_S_V2(1 / this.m_settings.viewZoom, viewport, viewport);
  box2d.b2Mul_S_V2(this.m_settings.canvasScale, viewport, viewport);
  return viewport;
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} viewport
 * @param {box2d.b2Vec2} out
 */
box2d.Testbed.Main.prototype.ConvertViewportToProjection = function(viewport, out) {
  var projection = out.Copy(viewport);
  box2d.b2Mul_S_V2(1 / this.m_settings.canvasScale, projection, projection);
  box2d.b2Mul_S_V2(this.m_settings.viewZoom, projection, projection);
  return projection;
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} world
 * @param {box2d.b2Vec2} out
 */
box2d.Testbed.Main.prototype.ConvertWorldToProjection = function(world, out) {
    var projection = out.Copy(world);
    box2d.b2Sub_V2_V2(projection, this.m_settings.viewCenter, projection);
    box2d.b2MulT_R_V2(this.m_settings.viewRotation, projection, projection);
    return projection;
  }
  /**
   * @export
   * @return {box2d.b2Vec2}
   * @param {box2d.b2Vec2} projection
   * @param {box2d.b2Vec2} out
   */
box2d.Testbed.Main.prototype.ConvertProjectionToWorld = function(projection, out) {
  var world = out.Copy(projection);
  box2d.b2Mul_R_V2(this.m_settings.viewRotation, world, world);
  box2d.b2Add_V2_V2(this.m_settings.viewCenter, world, world);
  return world;
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} element
 * @param {box2d.b2Vec2} out
 */
box2d.Testbed.Main.prototype.ConvertElementToWorld = function(element, out) {
  var viewport = this.ConvertElementToViewport(element, out);
  var projection = this.ConvertViewportToProjection(viewport, out);
  return this.ConvertProjectionToWorld(projection, out);
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} element
 * @param {box2d.b2Vec2} out
 */
box2d.Testbed.Main.prototype.ConvertElementToProjection = function(element, out) {
  var viewport = this.ConvertElementToViewport(element, out);
  return this.ConvertViewportToProjection(viewport, out);
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2Vec2} move
 */
box2d.Testbed.Main.prototype.MoveCamera = function(move) {
  var position = this.m_settings.viewCenter.Clone();
  var rotation = this.m_settings.viewRotation.Clone();
  move.SelfRotateAngle(rotation.GetAngle());
  position.SelfAdd(move);
  this.m_settings.viewCenter.Copy(position);
}

/**
 * @export
 * @return {void}
 * @param {number} roll
 */
box2d.Testbed.Main.prototype.RollCamera = function(roll) {
  var angle = this.m_settings.viewRotation.GetAngle();
  this.m_settings.viewRotation.SetAngle(angle + roll);
}

/**
 * @export
 * @return {void}
 * @param {number} zoom
 */
box2d.Testbed.Main.prototype.ZoomCamera = function(zoom) {
  this.m_settings.viewZoom *= zoom;
  this.m_settings.viewZoom = box2d.b2Clamp(this.m_settings.viewZoom, 0.02, 200);
}

/**
 * @export
 * @return {void}
 */
box2d.Testbed.Main.prototype.HomeCamera = function() {
  this.m_settings.viewZoom = (this.m_test) ? (this.m_test.GetDefaultViewZoom()) : (1.0);
  this.m_settings.viewCenter.Set(0.0, 20.0 * this.m_settings.viewZoom);
  this.m_settings.viewRotation.SetAngle(box2d.b2DegToRad(0.0));
}

/**
 * @export
 * @return {void}
 * @param {MouseEvent} e
 */
box2d.Testbed.Main.prototype.HandleMouseMove = function(e) {
  var element = new box2d.b2Vec2(e.clientX, e.clientY);
  var world = this.ConvertElementToWorld(element, new box2d.b2Vec2());

  if (this.m_lMouseDown) {
    this.m_test.MouseMove(world);
  }

  if (this.m_rMouseDown) {
    // viewCenter = viewCenter0 - (projection - projection0);
    var projection = this.ConvertElementToProjection(element, new box2d.b2Vec2());
    var diff = box2d.b2Sub_V2_V2(projection, this.m_projection0, new box2d.b2Vec2());
    var viewCenter = box2d.b2Sub_V2_V2(this.m_viewCenter0, diff, new box2d.b2Vec2());
    this.m_settings.viewCenter.Copy(viewCenter);
  }
}

/**
 * @export
 * @return {void}
 * @param {MouseEvent} e
 */
box2d.Testbed.Main.prototype.HandleMouseDown = function(e) {
  var element = new box2d.b2Vec2(e.clientX, e.clientY);
  var world = this.ConvertElementToWorld(element, new box2d.b2Vec2());

  switch (e.which) {
    case 1: // left mouse button
      this.m_lMouseDown = true;
      if (!this.m_shift) {
        this.m_test.MouseDown(world);
      } else {
        this.m_test.ShiftMouseDown(world);
      }
      break;
    case 3: // right mouse button
      var projection = this.ConvertElementToProjection(element, new box2d.b2Vec2());
      this.m_projection0.Copy(projection);
      this.m_viewCenter0.Copy(this.m_settings.viewCenter);
      this.m_rMouseDown = true;
      break;
  }
}

/**
 * @export
 * @return {void}
 * @param {MouseEvent} e
 */
box2d.Testbed.Main.prototype.HandleMouseUp = function(e) {
  var element = new box2d.b2Vec2(e.clientX, e.clientY);
  var world = this.ConvertElementToWorld(element, new box2d.b2Vec2());

  switch (e.which) {
    case 1: // left mouse button
      this.m_test.MouseUp(world);
      this.m_lMouseDown = false;
      break;
    case 3: // right mouse button
      this.m_rMouseDown = false;
      break;
  }
}

/**
 * @export
 * @return {void}
 * @param {TouchEvent} e
 */
box2d.Testbed.Main.prototype.HandleTouchMove = function(e) {
  var element = new box2d.b2Vec2(e.touches[0].clientX, e.touches[0].clientY);
  var world = this.ConvertElementToWorld(element, new box2d.b2Vec2());
  this.m_test.MouseMove(world);
  e.preventDefault();
}

/**
 * @export
 * @return {void}
 * @param {TouchEvent} e
 */
box2d.Testbed.Main.prototype.HandleTouchStart = function(e) {
  var element = new box2d.b2Vec2(e.touches[0].clientX, e.touches[0].clientY);
  var world = this.ConvertElementToWorld(element, new box2d.b2Vec2());
  this.m_test.MouseDown(world);
  e.preventDefault();
}

/**
 * @export
 * @return {void}
 * @param {TouchEvent} e
 */
box2d.Testbed.Main.prototype.HandleTouchEnd = function(e) {
  this.m_test.MouseUp(this.m_test.m_mouseWorld);
  e.preventDefault();
}

/**
 * @export
 * @return {void}
 * @param {MouseEvent} e
 */
box2d.Testbed.Main.prototype.HandleMouseWheel = function(e) {
  if (e.wheelDelta > 0) {
    this.ZoomCamera(1 / 1.1);
  } else if (e.wheelDelta < 0) {
    this.ZoomCamera(1.1);
  }
  e.preventDefault();
}

/**
 * @export
 * @return {void}
 * @param {KeyboardEvent} e
 */
box2d.Testbed.Main.prototype.HandleKeyDown = function(e) {
  switch (e.keyCode) {
    case goog.events.KeyCodes.CTRL:
      this.m_ctrl = true;
      break;
    case goog.events.KeyCodes.SHIFT:
      this.m_shift = true;
      break;
    case goog.events.KeyCodes.LEFT:
      if (this.m_ctrl) {
        if (this.m_test) {
          this.m_test.ShiftOrigin(new box2d.b2Vec2(2, 0));
        }
      } else {
        this.MoveCamera(new box2d.b2Vec2(-0.5, 0));
      }
      break;
    case goog.events.KeyCodes.RIGHT:
      if (this.m_ctrl) {
        if (this.m_test) {
          this.m_test.ShiftOrigin(new box2d.b2Vec2(-2, 0));
        }
      } else {
        this.MoveCamera(new box2d.b2Vec2(0.5, 0));
      }
      break;
    case goog.events.KeyCodes.DOWN:
      if (this.m_ctrl) {
        if (this.m_test) {
          this.m_test.ShiftOrigin(new box2d.b2Vec2(0, 2));
        }
      } else {
        this.MoveCamera(new box2d.b2Vec2(0, -0.5));
      }
      break;
    case goog.events.KeyCodes.UP:
      if (this.m_ctrl) {
        if (this.m_test) {
          this.m_test.ShiftOrigin(new box2d.b2Vec2(0, -2));
        }
      } else {
        this.MoveCamera(new box2d.b2Vec2(0, 0.5));
      }
      break;
    case goog.events.KeyCodes.PAGE_DOWN:
      this.RollCamera(box2d.b2DegToRad(-1));
      break;
    case goog.events.KeyCodes.PAGE_UP:
      this.RollCamera(box2d.b2DegToRad(1));
      break;
    case goog.events.KeyCodes.Z:
      this.ZoomCamera(1 / 1.1);
      break;
    case goog.events.KeyCodes.X:
      this.ZoomCamera(1.1);
      break;
    case goog.events.KeyCodes.HOME:
      this.HomeCamera();
      break;
    case goog.events.KeyCodes.R:
      this.LoadTest(true);
      break;
    case goog.events.KeyCodes.SPACE:
      if (this.m_test) {
        this.m_test.LaunchBomb();
      }
      break;
    case goog.events.KeyCodes.P:
      this.Pause();
      break;
    case goog.events.KeyCodes.OPEN_SQUARE_BRACKET:
      this.DecrementTest();
      break;
    case goog.events.KeyCodes.CLOSE_SQUARE_BRACKET:
      this.IncrementTest();
      break;
      //#if B2_ENABLE_PARTICLE
    case goog.events.KeyCodes.COMMA:
      if (this.m_shift) {
        // Press < to select the previous particle parameter setting.
        box2d.Testbed.TestMain.particleParameter.Decrement();
      }
      break;
    case goog.events.KeyCodes.PERIOD:
      if (this.m_shift) {
        // Press > to select the next particle parameter setting.
        box2d.Testbed.TestMain.particleParameter.Increment();
      }
      break;
      //#endif
    case goog.events.KeyCodes.SLASH:
      this.SingleStep();
      break;
    default:
      //window.console.log(e.keyCode);
      break;
  }

  if (this.m_test) {
    this.m_test.Keyboard(e.keyCode);
  }
}

/**
 * @export
 * @return {void}
 * @param {KeyboardEvent} e
 */
box2d.Testbed.Main.prototype.HandleKeyUp = function(e) {
  switch (e.keyCode) {
    case goog.events.KeyCodes.CTRL:
      this.m_ctrl = false;
      break;
    case goog.events.KeyCodes.SHIFT:
      this.m_shift = false;
      break;
    default:
      //window.console.log(e.keyCode);
      break;
  }

  if (this.m_test) {
    this.m_test.KeyboardUp(e.keyCode);
  }
}

/**
 * @export
 * @return {void}
 * @param {number} time_elapsed
 */
box2d.Testbed.Main.prototype.UpdateTest = function(time_elapsed) {
  if (this.m_demo_mode) {
    this.m_demo_time += time_elapsed;

    if (this.m_demo_time > this.m_max_demo_time) {
      this.IncrementTest();
    }

    var str = ((500 + this.m_max_demo_time - this.m_demo_time) / 1000).toFixed(0).toString()
    this.m_demo_button.value = str;
  } else {
    this.m_demo_button.value = "Demo";
  }
}

/**
 * @export
 * @return {void}
 */
box2d.Testbed.Main.prototype.DecrementTest = function() {
  if (this.m_test_index <= 0) {
    this.m_test_index = this.m_test_entries.length;
  }
  this.m_test_index--;
  document.getElementById('testEntries').selectedIndex = this.m_test_index;
  this.LoadTest();
}

/**
 * @export
 * @return {void}
 */
box2d.Testbed.Main.prototype.IncrementTest = function() {
  this.m_test_index++;
  if (this.m_test_index >= this.m_test_entries.length) {
    this.m_test_index = 0;
  }
  document.getElementById('testEntries').selectedIndex = this.m_test_index;
  this.LoadTest();
}

/**
 * @export
 * @return {void}
 * @param {boolean=} restartTest
 */
box2d.Testbed.Main.prototype.LoadTest = function(restartTest) {
  //#if B2_ENABLE_PARTICLE
  box2d.Testbed.TestMain.fullscreenUI.Reset();
  if (!restartTest) box2d.Testbed.TestMain.particleParameter.Reset();
  //#endif

  this.m_demo_time = 0;
  //#if B2_ENABLE_PARTICLE
  if (this.m_test) {
    this.m_test.RestoreParticleParameters();
  }
  //#endif
  this.m_test = this.m_test_entries[this.m_test_index].createFcn(this.m_canvas, this.m_settings);
  if (!restartTest) {
    this.HomeCamera();
  }
}

/**
 * @export
 * @return {void}
 */
box2d.Testbed.Main.prototype.Pause = function() {
  this.m_settings.pause = !this.m_settings.pause;
}

/**
 * @export
 * @return {void}
 */
box2d.Testbed.Main.prototype.SingleStep = function() {
  this.m_settings.pause = true;
  this.m_settings.singleStep = true;
}

/**
 * @export
 * @return {void}
 */
box2d.Testbed.Main.prototype.ToggleDemo = function() {
  this.m_demo_mode = !this.m_demo_mode;
}

/**
 * @export
 * @return {void}
 */
box2d.Testbed.Main.prototype.SimulationLoop = function() {
  var time = new Date().getTime();

  this.m_time_last = this.m_time_last || time;

  var time_elapsed = time - this.m_time_last;
  this.m_time_last = time;

  if (time_elapsed > 1000) {
    time_elapsed = 1000;
  } // clamp

  this.m_fps_time += time_elapsed;
  this.m_fps_frames++;

  if (this.m_fps_time >= 500) {
    this.m_fps = (this.m_fps_frames * 1000) / this.m_fps_time;
    this.m_fps_frames = 0;
    this.m_fps_time = 0;

    this.m_fps_div.innerHTML = this.m_fps.toFixed(1).toString();
  }

  if (time_elapsed > 0) {
    var ctx = this.m_ctx;

    var w = this.m_canvas.width;
    var h = this.m_canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.save();

    // 0,0 at center of canvas, x right, y up
    ctx.translate(0.5 * w, 0.5 * h);
    ctx.scale(1, -1);
    ctx.scale(this.m_settings.canvasScale, this.m_settings.canvasScale);
    ctx.lineWidth /= this.m_settings.canvasScale;

    // apply camera
    ctx.scale(1 / this.m_settings.viewZoom, 1 / this.m_settings.viewZoom);
    ctx.lineWidth *= this.m_settings.viewZoom;
    ctx.rotate(-this.m_settings.viewRotation.GetAngle());
    ctx.translate(-this.m_settings.viewCenter.x, -this.m_settings.viewCenter.y);

    this.m_test.Step(this.m_settings);

    //#if B2_ENABLE_PARTICLE
    // Update the state of the particle parameter.
    var restartTest = [false];
    var changed = box2d.Testbed.TestMain.particleParameter.Changed(restartTest);
    //#endif

    var msg = this.m_test_entries[this.m_test_index].name;
    //#if B2_ENABLE_PARTICLE
    if (box2d.Testbed.TestMain.fullscreenUI.GetParticleParameterSelectionEnabled()) {
      msg += " : ";
      msg += box2d.Testbed.TestMain.particleParameter.GetName();
    }
    //#endif
    this.m_test.DrawTitle(msg);

    ctx.restore();

    //#if B2_ENABLE_PARTICLE
    if (restartTest[0]) {
      this.LoadTest(true);
    }
    //#endif

    this.UpdateTest(time_elapsed);
  }
}

//#if B2_ENABLE_PARTICLE

/**
 * Set whether to restart the test on particle parameter
 * changes. This parameter is re-enabled when the test changes.
 * @export
 * @return {void}
 * @param {boolean} enable
 */
box2d.Testbed.TestMain.SetRestartOnParticleParameterChange = function(enable) {
  box2d.Testbed.TestMain.particleParameter.SetRestartOnChange(enable);
}

/**
 * Set the currently selected particle parameter value.  This
 * value must match one of the values in
 * TestMain::k_particleTypes or one of the values referenced by
 * particleParameterDef passed to SetParticleParameters().
 * @export
 * @return {number}
 * @param {number} value
 */
box2d.Testbed.TestMain.SetParticleParameterValue = function(value) {
  var index = box2d.Testbed.TestMain.particleParameter.FindIndexByValue(value);
  // If the particle type isn't found, so fallback to the first entry in the
  // parameter.
  box2d.Testbed.TestMain.particleParameter.Set(index >= 0 ? index : 0);
  return box2d.Testbed.TestMain.particleParameter.GetValue();
}

/**
 * Get the currently selected particle parameter value and
 * enable particle parameter selection arrows on Android.
 * @export
 * @return {number}
 */
box2d.Testbed.TestMain.GetParticleParameterValue = function() {
  // Enable display of particle type selection arrows.
  box2d.Testbed.TestMain.fullscreenUI.SetParticleParameterSelectionEnabled(true);
  return box2d.Testbed.TestMain.particleParameter.GetValue();
}

/**
 * Override the default particle parameters for the test.
 * @export
 * @return {void}
 * @param {Array.<?>} particleParameterDef
 * @param {number=} particleParameterDefCount
 */
box2d.Testbed.TestMain.SetParticleParameters = function(particleParameterDef, particleParameterDefCount) {
  box2d.Testbed.TestMain.particleParameter.SetDefinition(particleParameterDef, particleParameterDefCount);
}

//#endif
