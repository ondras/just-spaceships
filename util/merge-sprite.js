#!/usr/bin/env v8cgi

var GD = require("gd");
var FS = require("fs");

var files = new FS.Directory(".").listFiles();
var images = [];

for (var i=0;i<files.length;i++) {
	var file = files[i];
	if (file.indexOf(".png") != -1) { images.push(file); }
}

if (!images.length) { exit(); }

images.sort();

var test = new GD.Image(GD.Image.PNG, images[0]);
var out = new GD.Image(GD.Image.TRUECOLOR, test.sx(), test.sy()*images.length);
out.alphaBlending(false);
out.saveAlpha(true);

for (var i=0;i<images.length;i++) {
	system.stdout.write("adding " + images[i]);
	var src = new GD.Image(GD.Image.PNG, images[i]);
	out.copy(src, 0, i*test.sy(), 0, 0, src.sx(), src.sy());
}

out.save(GD.Image.PNG, images[0]+".out");
