/*
 * Template engine for Mustache
 * Based on Mustache.js - https://github.com/janl/mustache.js 
*/

var Mustache = require("mustache");
var events = require('events');
var util = require('util');

function MustacheEngine(options){
	events.EventEmitter.call(this);
  this.afterRender = null;
  this.template = null;
  this.content = null;
  this.partials = null;

	this.extension = MustacheEngine.extension;
	this.rendering_canceled = false;

	this.lastRender = (options && options.lastRender) || null;
	this.lastModified = null;
};

util.inherits(MustacheEngine, events.EventEmitter);

MustacheEngine.extension = ".mustache";

MustacheEngine.prototype.setTemplate = function(template, last_modified){
	var self = this;
  self.template = template;

	if(last_modified > self.lastModified){
		self.lastModified = last_modified;	
	}

  return self.render(); 
};

MustacheEngine.prototype.setContent = function(content, last_modified){
  var self = this;
  self.content = content;

	if(last_modified > self.lastModified){
		self.lastModified = last_modified;	
	}

  return self.render(); 
};

MustacheEngine.prototype.setPartials = function(partials, last_modified){
	var self = this;
  self.partials = partials;

	if(last_modified > self.lastModified){
		self.lastModified = last_modified;	
	}

  return self.render(); 

}

MustacheEngine.prototype.render = function(){
	var self = this;

	if(self.template && self.content && self.partials && !self.rendering_canceled){
		if(self.lastModified > self.lastRender){
			try {
				var output = Mustache.render(self.template, self.content, self.partials);  
				var modified = true;
			} catch (err) {
				return self.emit("renderCanceled", err, 500);
			}
		} else {
			var output = null;	
			var modified = false;
		}

		return self.emit("renderComplete", output, modified);
	}
};

MustacheEngine.prototype.cancelRender = function(err, status_code){
	var self = this;

	// rendering already canceled; do nothing
	if (self.rendering_canceled) {
		return;
	}

	self.rendering_canceled = true;
	self.emit("renderCanceled", err, (status_code || 404));
}

module.exports = MustacheEngine;