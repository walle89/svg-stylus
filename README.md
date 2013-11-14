**svg-stylus**

This project aims to recreate the functionality of rework-svg (https://npmjs.org/package/rework-svg) but adapted to work with Stylus (http://learnboost.github.io/stylus/).

Given the difference in syntax between CSS and Stylus, some adaptions to syntax have been made.
Available characters which do not yield Stylus syntax errors are fairly few and thus syntax is more limited than in rework-svg.

url() has been replaced with svgurl() as url() will automatically be base64 encoded.
The URL inside svgurl() MUST be surrounded by quotes or Stylus will yield a syntax error.

SVG parameters are given as svg(selector attribute value, selector attribute value)
This means selector must be repeated to set multiple attributes.

Selectors:
tagname
tagname#id -> entered as tagname$id, as # yields Stylus syntax error.
tagname[attr="value"] -> Not supported. [] yields Stylus syntax error.
tagname#id[attr="value"] -> Not supported. # and [] yields Stylus syntax errors.

Examples:
------------------------------------------------------------------------------------------
background-image: url('./img/icon.svg') svg();

	BECOMES

background-image svgurl('./img/icon.svg') svg()
------------------------------------------------------------------------------------------
background-image: url('./img/icon.svg') svg({
path { fill: #FF0000; }
});

	BECOMES

background-image svgurl('./img/icon.svg') svg(path fill #FF0000)
------------------------------------------------------------------------------------------
background-image: url('./img/icon.svg') svg({
path#p1 { fill: #00FF00; }
path[id="p2"] { fill: #FF0000; }
});

	BECOMES

background-image: svgurl('./img/icon.svg') svg(path$p1 fill #00FF00, path$p2 fill #FF0000)
------------------------------------------------------------------------------------------