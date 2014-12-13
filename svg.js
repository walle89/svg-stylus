/*jslint vars:true*/
'use strict';

var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var rework = require('rework');
var xmldoc = require('xmldoc');
var _config = {};


var SVG_PATTERN = new RegExp(
  '(^|\\s)' +
    // url(...)
    '(?:svgurl\\((.*?)\\))' + '\\s+' +
    // svg(...)
    '(?:svg\\(' + '\\s*' +
    // { ... } (optional)
    '(?:(.*?))?' + '\\s*' +
    '\\))'
);

var SELECTOR_PATTERN = new RegExp(
  '^' +
    // tag name
    '([\\w:-]+)' +
    // ID (optional)
    '(?:#([\\w:-]+))?' +
    // attribute (optional)
    '(?:\\[' +
    // attribute name
    '([\\w:-]+)' +
    // attribute value (optional)
    '(?:=([^\\]]+))?' +
    '\\])?' +
    '$'
);


/**
 * Parse config options
 * @param {Object|String} options Options map; falls back to support original `base_path` param
 * @returns {undefined} undefined
 */
function parseConfig(options) {
  if (typeof options === 'object') {
    _config = _.extend(_config, options);
  } else if (typeof options === 'string') {
    _config.base_path = options;
  }
}


/**
 * Get SVG as ecoded data
 * @returns {String} encoded image data
 */
function getStyledSvgAsDataURL(filename, style) {
  var xml_source = fs.readFileSync(filename, 'utf8');
  var doc = new xmldoc.XmlDocument(xml_source);

  // Populate all SVG styles
  style.rules.forEach(function (rule) {
    if (rule.declarations) {
      rule.selectors.forEach(function (selector) {
        var elements = querySelectorAll(doc, selector);

        elements.forEach(function (element) {
          rule.declarations.forEach(function (declaration) {
            element.attr[declaration.property] = declaration.value;
          });
        });
      });
    }
  });

  var svg_buffer = new Buffer(doc.toString(true, true));
  return 'data:image/svg+xml;base64,' + svg_buffer.toString('base64');
}


/**
 * Get document elements
 * @param {Object} root Root element
 * @param {String} selector Element selector
 * @returns {Array} matched elements
 */
function querySelectorAll(root, selector) {
  var selector_path = selector.split(/\s+/);
  var elements = [ root ];

  var level;
  var children = [];
  while (level = selector_path.shift()) {
    var level_parts = level.match(SELECTOR_PATTERN);

    // children by tag name
    var matches = _.union.apply(_, elements.map(function (el) {
      return el.childrenNamedRecursive(level_parts[1]);
    }));

    var attr_matches;

    // children by ID
    if (level_parts[2]) {
      attr_matches = _.union.apply(_, elements.map(function (el) {
        var value = (level_parts[2] || '').replace(/^["']|["']$/g, '');
        return el.childrenWithAttributeRecursive('id', value);
      }));
      // merge results
      matches = _.intersection(matches, attr_matches);
    }

    // children by attribute
    if (level_parts[3]) {
      attr_matches = _.union.apply(_, elements.map(function (el) {
        var value = (level_parts[4] || '').replace(/^["']|["']$/g, '');
        return el.childrenWithAttributeRecursive(level_parts[4], value);
      }));
      // merge results
      matches = _.intersection(matches, attr_matches);
    }

    children = children.concat(matches);
    elements = children;
    children = [];
  }

  return elements;
}


/**
 * Get SVG property as JSON
 * @param {String} style Style property
 * @returns {String} json string
 */
function getSvgPropAsJSON(style) {
  var json = '';

  if (!style) {
    return json;
  }

  var rules = style.split(',');
  var i, len;
  for (i = 0, len = rules.length; i < len; i++) {
    var parts = rules[i].trim().split(/\s+/);
    if (parts.length < 3) {
      continue;
    }

    json += parts[0].replace(/\$/g, '#') + '{' + parts[1] + ':' + parts[2] + '} ';
  }

  return json;
}


/**
 * Replace style declaration value
 * String.replace() method
 * @param match {?} ?
 * @param match {String} ?
 * @param match {String} ?
 * @param match {?} ?
 * @returns {String} new declaration value
 */
function replaceDeclarationValue(match, pre_whitespace, url_match, svg_style_json) {
  var url = url_match.replace(/^["']|["']$/g, '');

  // rewrite param syntax to rework-svg JSON before rework
  var svg_style = rework(getSvgPropAsJSON(svg_style_json)).obj.stylesheet;
  var filename = _config.base_path ? path.join(_config.base_path, url) : url;

  var svg_data_uri = getStyledSvgAsDataURL(filename, svg_style);
  return pre_whitespace + 'url(\'' + svg_data_uri + '\')';
}


/**
 * Parse style declaration
 * @param {Object} declaration Style declaration
 * @returns {undefined} undefined
 */
function parseDeclaration(declaration) {
  if (!declaration || declaration.property !== 'background-image') {
    return;
  }

  declaration.value = declaration.value.replace(SVG_PATTERN, replaceDeclarationValue);
}


/**
 * Parse style rule
 * @param {Object} rule Style rule
 * @returns {undefined} undefined
 */
function parseRule(rule) {
  if (!rule || !rule.declarations) {
    return;
  }
  rule.declarations.forEach(parseDeclaration);
}


/**
 * Process styles
 * @param {Object} style Style object
 * @returns {undefined} undefined
 */
function svgStylus(style) {
  if (!style || !style.rules) {
    return;
  }
  style.rules.forEach(parseRule);
}



// Configure and export
module.exports = function (options) {
  parseConfig(options);
  return svgStylus;
};
