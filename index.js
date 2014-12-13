'use strict';

//var autoprefixer = require('autoprefixer');
var rework = require('rework');
var svg = require('./svg');

module.exports = function () {
  var args = Array.prototype.slice.call(arguments);

  return function (style) {
    this.on('end', function (err, css) {
      var cssObj = rework(css);
      cssObj.use(svg(args));

      return cssObj.toString();
    });
  };
};
