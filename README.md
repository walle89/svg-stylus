#SVG Stylus

This project aims to recreate the functionality of [rework-svg](https://npmjs.org/package/rework-svg) but adapted to work with [Stylus](http://learnboost.github.io/stylus/).

##Installation

###Node installation
```bash
$ npm install -g svg-stylus
```
###Node installation (master from Github)
```bash
$ npm install -g https://github.com/walle89/svg-stylus/archive/master.tar.gz
```

###Run the plugin from the command line
```bash
$ stylus -u svg-stylus
```

##Usage

Given the difference in syntax between CSS and Stylus, some adaptions to syntax have been made.
Available characters which do not yield Stylus syntax errors are fairly few and thus syntax is more limited than in rework-svg.

url() has been replaced with svgurl() as url() will automatically be base64 encoded.
The URL inside svgurl() MUST be surrounded by quotes or Stylus will yield a syntax error.

SVG parameters are given as:

```css
svg([selector attribute value [, selector attribute value...]])
```

This means selector must be repeated to set multiple attributes.

###Selectors

* tagname
* tagname#id -> entered as tagname$id, as # yields Stylus syntax error.
* tagname[attr="value"] -> *Not supported*. [] yields Stylus syntax error.
* tagname#id[attr="value"] -> *Not supported*. # and [] yields Stylus syntax errors.

###Examples

####SVG file inlined (rework-svg)

```css
background-image: url('./img/icon.svg') svg();
```

####SVG file inlined (svg-stylus)

```css
background-image svgurl('./img/icon.svg') svg()
```

---

####All paths filled red (rework-svg)
```css
background-image: url('./img/icon.svg') svg({
path { fill: #FF0000; }
});
```

####All paths filled red (svg-stylus)

```css
background-image svgurl('./img/icon.svg') svg(path fill #FF0000)
```

---

####First path filled green, second filled red (rework-svg)
```css
background-image: url('./img/icon.svg') svg({
	path#p1 { fill: #00FF00; }
	path[id="p2"] { fill: #FF0000; }
});
```

####First path filled green, second filled red (svg-stylus)
```css
background-image: svgurl('./img/icon.svg') svg(path$p1 fill #00FF00, path$p2 fill #FF0000)
```

##Feedback, issues, bugs, etc.
Create a issue at this project's [Github page](https://github.com/walle89/svg-stylus/issues).

##License (MIT)
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.