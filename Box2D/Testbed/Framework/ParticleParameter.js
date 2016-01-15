/*
 * Copyright (c) 2014 Google, Inc.
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

//#if B2_ENABLE_PARTICLE

goog.provide('box2d.Testbed.ParticleParameter');
goog.provide('box2d.Testbed.ParticleParameter.Definition');

goog.require('box2d.b2Particle');

/**
 * @export
 * @constructor
 */
box2d.Testbed.ParticleParameter = function() {
  this.Reset();
}

/**
 * @export
 * @enum {number}
 */
box2d.Testbed.ParticleParameter.Options = {
  OptionStrictContacts: 1 << 0,
  OptionDrawShapes: 1 << 1,
  OptionDrawParticles: 1 << 2,
  OptionDrawJoints: 1 << 3,
  OptionDrawAABBs: 1 << 4,
  OptionDrawContactPoints: 1 << 5,
  OptionDrawContactNormals: 1 << 6,
  OptionDrawContactImpulse: 1 << 7,
  OptionDrawFrictionImpulse: 1 << 8,
  OptionDrawCOMs: 1 << 9,
  OptionDrawStats: 1 << 10,
  OptionDrawProfile: 1 << 11
};

/**
 * @export
 * @type {number}
 */
box2d.Testbed.ParticleParameter.k_DefaultOptions =
  box2d.Testbed.ParticleParameter.Options.OptionDrawShapes | box2d.Testbed.ParticleParameter.Options.OptionDrawParticles;

/**
 * Value of a particle parameter.
 * @constructor
 * @param {number} value
 * @param {number} options
 * @param {string} name
 */
box2d.Testbed.ParticleParameter.Value = function(value, options, name) {
  this.value = value;
  this.options = options;
  this.name = name;
}

/**
 * Value associated with the parameter.
 * @type {number}
 */
box2d.Testbed.ParticleParameter.Value.prototype.value = 0;

/**
 * Any global (non particle-specific) options associated with
 * this parameter
 * @type {number}
 */
box2d.Testbed.ParticleParameter.Value.prototype.options = 0;

/**
 * Name to display when this parameter is selected.
 * @type {string}
 */
box2d.Testbed.ParticleParameter.Value.prototype.name = "";

/**
 * Particle parameter definition.
 * @constructor
 * @param {Array.<box2d.Testbed.ParticleParameter.Value>} values
 * @param {number=} numValues
 */
box2d.Testbed.ParticleParameter.Definition = function(values, numValues) {
  this.values = values;
  this.numValues = numValues || values.length;
}

/**
 * @type {Array.<box2d.Testbed.ParticleParameter.Value>}
 */
box2d.Testbed.ParticleParameter.Definition.prototype.values = null;

/**
 * @type {number}
 */
box2d.Testbed.ParticleParameter.Definition.prototype.numValues = 0;

/**
 * @return {number}
 */
box2d.Testbed.ParticleParameter.Definition.prototype.CalculateValueMask = function() {
  var mask = 0;
  for (var i = 0; i < this.numValues; i++) {
    mask |= this.values[i].value;
  }
  return mask;
}

/**
 * @type {Array.<box2d.Testbed.ParticleParameter.Value>}
 */
box2d.Testbed.ParticleParameter.k_particleTypes = [
  new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_waterParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "water"),
  new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_waterParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions | box2d.Testbed.ParticleParameter.Options.OptionStrictContacts, "water (strict)"),
  new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_springParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "spring"),
  new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_elasticParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "elastic"),
  new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_viscousParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "viscous"),
  new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_powderParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "powder"),
  new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_tensileParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "tensile"),
  new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_colorMixingParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "color mixing"),
  new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_wallParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "wall"),
  new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_barrierParticle | box2d.b2ParticleFlag.b2_wallParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "barrier"),
  new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_staticPressureParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions, "static pressure"),
  new box2d.Testbed.ParticleParameter.Value(box2d.b2ParticleFlag.b2_waterParticle, box2d.Testbed.ParticleParameter.k_DefaultOptions | box2d.Testbed.ParticleParameter.Options.OptionDrawAABBs, "water (bounding boxes)")
];

/**
 * @type {Array.<box2d.Testbed.ParticleParameter.Definition>}
 */
box2d.Testbed.ParticleParameter.k_defaultDefinition = [
  new box2d.Testbed.ParticleParameter.Definition(box2d.Testbed.ParticleParameter.k_particleTypes)
];

/**
 * @type {number}
 */
box2d.Testbed.ParticleParameter.prototype.m_index = 0;

/**
 * @type {boolean}
 */
box2d.Testbed.ParticleParameter.prototype.m_changed = false;

/**
 * @type {boolean}
 */
box2d.Testbed.ParticleParameter.prototype.m_restartOnChange = false;

/**
 * @type {box2d.Testbed.ParticleParameter.Value}
 */
box2d.Testbed.ParticleParameter.prototype.m_value = null;

/**
 * @type {Array.<box2d.Testbed.ParticleParameter.Definition>}
 */
box2d.Testbed.ParticleParameter.prototype.m_definition = null;

/**
 * @type {number}
 */
box2d.Testbed.ParticleParameter.prototype.m_definitionCount = 0;

/**
 * @type {number}
 */
box2d.Testbed.ParticleParameter.prototype.m_valueCount = 0;

box2d.Testbed.ParticleParameter.prototype.Reset = function() {
  this.m_restartOnChange = true;
  this.m_index = 0;
  this.SetDefinition(box2d.Testbed.ParticleParameter.k_defaultDefinition);
  this.Set(0);
}

/**
 * @return {void}
 * @param {Array.<box2d.Testbed.ParticleParameter.Definition>}
 *      definition
 * @param {number=} definitionCount
 */
box2d.Testbed.ParticleParameter.prototype.SetDefinition = function(definition, definitionCount) {
  this.m_definition = definition;
  this.m_definitionCount = definitionCount || definition.length;
  this.m_valueCount = 0;
  for (var i = 0; i < this.m_definitionCount; ++i) {
    this.m_valueCount += this.m_definition[i].numValues;
  }
  // Refresh the selected value.
  this.Set(this.Get());
}

/**
 * @return {number}
 */
box2d.Testbed.ParticleParameter.prototype.Get = function() {
  return this.m_index;
}

/**
 * @return {void}
 * @param {number} index
 */
box2d.Testbed.ParticleParameter.prototype.Set = function(index) {
  this.m_changed = this.m_index !== index;
  this.m_index = this.m_valueCount ? index % this.m_valueCount : index;
  this.m_value = this.FindParticleParameterValue();
  box2d.b2Assert(this.m_value !== null);
}

/**
 * @return {void}
 */
box2d.Testbed.ParticleParameter.prototype.Increment = function() {
  var index = this.Get();
  this.Set(index >= this.m_valueCount ? 0 : index + 1);
}

/**
 * @return {void}
 */
box2d.Testbed.ParticleParameter.prototype.Decrement = function() {
  var index = this.Get();
  this.Set(index === 0 ? this.m_valueCount - 1 : index - 1);
}

/**
 * @return {boolean}
 * @param {Array.<boolean>} restart
 */
box2d.Testbed.ParticleParameter.prototype.Changed = function(restart) {
  var changed = this.m_changed;
  this.m_changed = false;
  if (restart) {
    restart[0] = changed && this.GetRestartOnChange();
  }
  return changed;
}

/**
 * @return {number}
 */
box2d.Testbed.ParticleParameter.prototype.GetValue = function() {
  box2d.b2Assert(this.m_value !== null);
  return this.m_value.value;
}

/**
 * @return {string}
 */
box2d.Testbed.ParticleParameter.prototype.GetName = function() {
  box2d.b2Assert(this.m_value !== null);
  return this.m_value.name;
}

/**
 * @return {number}
 */
box2d.Testbed.ParticleParameter.prototype.GetOptions = function() {
  box2d.b2Assert(this.m_value !== null);
  return this.m_value.options;
}

/**
 * @return {void}
 * @param {boolean} enable
 */
box2d.Testbed.ParticleParameter.prototype.SetRestartOnChange = function(enable) {
  this.m_restartOnChange = enable;
}

/**
 * @return {boolean}
 */
box2d.Testbed.ParticleParameter.prototype.GetRestartOnChange = function() {
  return this.m_restartOnChange;
}

/**
 * @return {number}
 * @param {number} value
 */
box2d.Testbed.ParticleParameter.prototype.FindIndexByValue = function(value) {
  var index = 0;
  for (var i = 0; i < this.m_definitionCount; ++i) {
    var definition = this.m_definition[i];
    var numValues = definition.numValues;
    for (var j = 0; j < numValues; ++j, ++index) {
      if (definition.values[j].value === value) return index;
    }
  }
  return -1;
}

/**
 * @return {box2d.Testbed.ParticleParameter.Value}
 */
box2d.Testbed.ParticleParameter.prototype.FindParticleParameterValue = function() {
  var start = 0;
  var index = this.Get();
  for (var i = 0; i < this.m_definitionCount; ++i) {
    var definition = this.m_definition[i];
    var end = start + definition.numValues;
    if (index >= start && index < end) {
      return definition.values[index - start];
    }
    start = end;
  }
  return null;
}

//#endif
