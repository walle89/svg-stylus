var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var rework = require('rework');
var xmldoc = require('xmldoc');


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


var getStyledSvgAsDataURL = function (filename, style) {
  var xml_source = fs.readFileSync(filename, 'utf8');
  var doc = new xmldoc.XmlDocument(xml_source);

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
};


var querySelectorAll = function (root, selector) {
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

    // children by ID
    if (level_parts[2]) {
      var attr_matches = _.union.apply(_, elements.map(function (el) {
        var value = (level_parts[2] || '').replace(/^["']|["']$/g, '');
        return el.childrenWithAttributeRecursive('id', value);
      }));
      // merge results
      matches = _.intersection(matches, attr_matches);
    }

    // children by attribute
    if (level_parts[3]) {
      var attr_matches = _.union.apply(_, elements.map(function (el) {
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
};

var getSvgPropAsJSON = function(style) {
	if (!style)
		return '';
	
	var json = '';

	var rules = style.split(',');
	for (var i=0;i<rules.length;i++) {
		var parts = rules[i].trim().split(/\s+/);
		if (parts.length < 3)
			continue;
		
		json += parts[0].replace(/\$/g,'#')+'{'+parts[1]+':'+parts[2]+'} ';
	}
	
	return json;
}

module.exports = function (base_path) {
  return function (style) {
    style.rules.forEach(function (rule) {
      if (rule.declarations) {
        rule.declarations.forEach(function (declaration) {
          if (declaration.property === 'background-image') {
            declaration.value = declaration.value.replace(SVG_PATTERN,
                function (match, pre_whitespace, url_match, svg_style_json) {
              var url = url_match.replace(/^["']|["']$/g, '');
              // rewrite param syntax to rework-svg JSON before rework
			  var svg_style = rework(getSvgPropAsJSON(svg_style_json)).obj.stylesheet;
              var filename = base_path ? path.join(base_path, url) : url;

              var svg_data_uri = getStyledSvgAsDataURL(filename, svg_style);
              return pre_whitespace + 'url(\'' + svg_data_uri + '\')';
            });
          }
        });
      }
    });
  };
};
