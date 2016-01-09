/* 
 * Copyright (c) 2015 Michel Gutierrez
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 */

var extend = require("extend");
var crypto = require("crypto");
var uglify = require("uglify-js");
var ccss = require('clean-css');
var fs = require("fs");
var penthouse = require("penthouse");
var ua = require('universal-analytics');
var browser = require("ua-parser");
var geoip = require('geoip-lite');

var config = require("../config");
var nav = require("./nav");

MakeShortId = function() {
	var b = "aA0";
	var r = [];
	for(var i=0;i<5;i++) {
		var v = Math.floor(Math.random()*62);
		if(v<26)
			r.push(String.fromCharCode(b.charCodeAt(0)+v));
		else if(v<52)
			r.push(String.fromCharCode(b.charCodeAt(1)+v-26));
		else
			r.push(String.fromCharCode(b.charCodeAt(2)+v-52));
	}
	return r.join("");
}

var salt = MakeShortId();

exports.pre = function(app) {

	var hostPortRE = new RegExp("^([^:]*):(.*)$"); 
	
	app.use(function(req,res,next) {
		if(config.domain && req.method=="GET" && req.hostname!=config.domain) {
			var m = hostPortRE.exec(req.get('host'));
			if(m)
				res.redirect(301,req.protocol+"://"+config.domain+":"+m[2]+req.originalUrl);
			else
				res.redirect(301,req.protocol+"://"+config.domain+req.originalUrl);
			return;
		}
		next();
	});
	
}

exports.post = function(app) {
	
	if(config.parseUserAgent)
		app.use(function(req,res,next) {
			req.browser = req.browser || (req.session ? req.session.browser : null);
			if(!req.browser) {
				req.browser = browser.parse(req.headers['user-agent']);
				if(req.session)
					req.session.browser = req.browser;
			}
			next();
		});
	
	if(config.geoip) {
		geoip.startWatchingDataUpdate();
		app.use(function(req,res,next) {
			req.geoip = req.geoip || (req.session ? req.session.geoip : null);
			if(!req.geoip) {
				req.geoip = geoip.lookup(req.ip) || {
					   country: '??',
					   region: '??',
					   city: "??",
					   ll: [0, 0]
				};
				if(req.session)
					req.session.geoip = req.browser.geoip;
			}
			next();
		});
	}

	if(config.gaTrackingCode)
		ua.middleware(config.gaTrackingCode, {cookieName: '_ga'});
}

var cache = {
	css: {},
	js: {},
	cps: {},
	cpsData: {},
}

function WriteCacheFile(cacheFile,type,hash,code) {
	fs.writeFile(cacheFile,code,"utf-8",function(err) {
		if(err)
			console.error("Cannot write cache file",cacheFile,":",err);
		else 
			cache[type][hash] = "/"+type+"/cache-"+hash+"."+type;
	});		
}

function HandleCritPathStyles(cssPath) {
	if(!config.criticalPathStyles || this.criticalPathStyles===false)
		return;
	var key = this.criticalPathStyles;
	if(!key)
		key = this.req.path;
	if(cache.cps[key]===undefined) {
		cache.cps[key] = false;
		var url = this.req.protocol+"://"+this.req.get('host')+this.req.originalUrl;
		penthouse({
			url: url,
			css: "public"+cssPath,
		},function(err,data) {
			if(err) 
				console.error("Could not get CSS critical path:",err);
			else {
				var minified = new ccss({
					processImport: false,
				}).minify(data).styles;
				var hash = crypto.createHash("md5").update(minified).digest("hex");
				cache.cpsData[hash] = minified;
				cache.cps[key] = hash;
			}
		});
	}
}

function Cached(type,files) {
	if(type=="css" && !config.concatStyles)
		return files;
	if(type=="js" && !config.concatScripts)
		return files;
	var hash = crypto.createHash("md5").update(JSON.stringify(files)).digest("hex");
	var entry = cache[type][hash]; 
	if(entry===undefined) {
		cache[type][hash] = null;
		var fileBodies = [];
		var tasksCount = files.length;
		function Done() {
			if(--tasksCount == 0) {
				var cacheFile = "public/"+type+"/cache-"+hash+"."+type;
				var code=fileBodies.join("\n");
				if(type=="js") {
					if(config.minifyScripts)
						code = uglify.minify(code,{fromString:true}).code;
				} else if(type=="css") {
					if(config.minifyStyles)
						code = new ccss({
							processImport: false,
						}).minify(code).styles;
				}
				WriteCacheFile(cacheFile,type,hash,code);
			}
		}
		files.forEach(function(file,index) {
			fs.readFile("public/"+file,"utf-8",function(err,data) {
				if(!err) {
					fileBodies[index] = data;
					Done();
				} else
					console.error("Cache cannot read",file);
			});
		});
		return files;
	} else if(entry===null)
		return files;
	else {
		if(type=="css")
			HandleCritPathStyles.call(this,entry);
		return [entry];
	}
}

function CriticalPathStyles() {
	var key = this.criticalPathStyles;
	if(!key)
		key = this.req.path;
	var cps = cache.cps[key]; 
	if(cps)
		return "<style>"+cache.cpsData[cps]+"</style>";
	else
		return "";
}

function PrefetchStyles() {
	var styles = Cached.call(this,'css',this.styles);
	this.currentStyles = this.extStyles;
	for(var i=0, l=styles.length; i<l; i++) {
		var style = styles[i];
		if(config.staticBypassCache)
			this.currentStyles.push(style+"?"+salt);
		else
			this.currentStyles.push(style);		
	}	
	var parts = [];
	for(var i=0, l=this.currentStyles.length; i<l; i++) {
		var style = this.currentStyles[i];
		parts.push("<link rel='prefetch' href='"+style+"'/>");
	}
	return parts.join("\n");
}

function LoadStyles() {
	var parts = [];
	for(var i=0, l=this.currentStyles.length; i<l; i++) {
		var style = this.currentStyles[i];
		parts.push("<link rel='stylesheet' href='"+style+"'/>");
	}
	return parts.join("\n");
}

function LoadScripts() {
	var scripts = Cached('js',this.scripts);
	this.currentScripts = this.extScripts;
	for(var i=0, l=scripts.length; i<l; i++) {
		var script = scripts[i];
		if(config.staticBypassCache)
			this.currentScripts.push(script+"?"+salt);
		else
			this.currentScripts.push(script);		
	}	
	var parts = [];
	for(var i=0, l=this.currentScripts.length; i<l; i++) {
		var script = this.currentScripts[i];
		parts.push('<link rel="subresource" href="'+script+'">\n');
	}
	parts.push('<script>');
	parts.push('!function(e,t,r){function n(){for(;d[0]&&"loaded"==d[0]');
	parts.push('[f];)c=d.shift(),c[o]=!i.parentNode.insertBefore(c,i)}for(var ');
	parts.push('s,a,c,d=[],i=e.scripts[0],o="onreadystatechange",f="readyState";');
	parts.push('s=r.shift();)a=e.createElement(t),"async"in ');
	parts.push('i?(a.async=!1,e.head.appendChild(a)):i[f]?');
	parts.push('(d.push(a),a[o]=n):e.write("<"+t+\' src="\'+s+\'" defer>');
	parts.push('</\'+t+">"),a.src=s}(document,"script",');
	parts.push(JSON.stringify(this.currentScripts));
	parts.push(')</script>');
	return parts.join("");	
}

function GoogleAnalytics() {
	if(config.gaTrackingCode) {
		var parts = [];
		parts.push("<script>");
		parts.push("window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;");
		parts.push("ga('create', '"+ config.gaTrackingCode +"', '"+this.req.hostname+"');");
		parts.push("ga('send', 'pageview','" + (this.gaPath || this.req.path) + "');");
		if(this.gaEvents)
			gaEvents.forEach(function(event) {
				parts.push("ga('send','event','" + event.join("','") +"');");
			});
		parts.push("</script>");
		parts.push("<script async src='//www.google-analytics.com/analytics.js'></script>");
		return parts.join("\n");
	}
	return "";
}

function Header() {
	return [
	 	CriticalPathStyles.call(this),
	 	PrefetchStyles.call(this),
	 	LoadScripts.call(this),
	 	GoogleAnalytics.call(this),
	].join("\n");
}

function Footer() {
	return [
	 	LoadStyles.call(this),
	].join("\n");
}

module.exports.locals = function(req,data) {
	var locals = extend(true,{
		pageTitle: config.siteName,
		criticalPathStyles: null, // null: use url without query as key, false: do not use feature, any other value: use as key
		styles: [],
		extStyles: [],
		scripts: [],
		extScripts: [],
	},data);
	locals.req = req;
	locals.ad = req.deliverAd;
	locals.config = config;
	locals.nav = nav || [];
	locals.user = req.user || null;
	locals.styles = [].concat(config.defaultStyles);
	locals.extStyles = [].concat(config.defaultExtStyles);
	locals.scripts = [].concat(config.defaultScripts);
	extScripts = [].concat(config.defaultExtScripts);
	if(data) {
		if(data.styles) locals.styles = locals.styles.concat(data.styles);
		if(data.extStyles) locals.extStyles = locals.extStyles.concat(data.extStyles);
		if(data.scripts) locals.scripts = locals.scripts.concat(data.scripts);
		if(data.extScripts) locals.extScripts = locals.extScripts.concat(data.extScripts);
		if(data.nav) locals.nav = data.nav;
	}
	locals.criticalPathStyles = CriticalPathStyles;
	locals.prefetchStyles = PrefetchStyles;
	locals.loadStyles = LoadStyles;
	locals.loadScripts = LoadScripts;
	locals.googleAnalytics = GoogleAnalytics;
	locals.header = Header;
	locals.footer = Footer;
	return locals;
}

exports.gaSendEvent = function(req) {
	if(req.visitor) {
		var evArgs = [];
		for(var i=1;i<arguments.length;i++)
			evArgs.push(arguments[i]);
		req.visitor.event.apply(req.visitor,evArgs).send();
	}
}

exports.apiCall = function(req,res,method) {
	method(req,function(err,data) {
		if(err) {
			try {
			res.status(500).json({
				status: false,
				error: err.message
			});
			} catch(e) {}
		} else {
			try {
				res.json({
					status: true,
					result: data
				});
			} catch(e) {}
		}
	});
}

exports.forceHttps = function(callback) {
	return function(req,res) {
		if(config.https.disabled || req.protocol=="https")
			callback(req,res);
		else {
			var host = req.hostname;
			var port = config.https.port;
			if(port!=443)
				host+=":"+port;
			res.redirect("https://"+host+req.originalUrl);
		}
	}
}
