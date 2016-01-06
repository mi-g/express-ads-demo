/* 
 * Copyright (c) 2015 Michel Gutierrez
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 */

var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var extend = require("extend");
var crypto = require("crypto");
var exskel = require("./exskel");

var config = require('../config');
var nav = require("./admin-nav");

if(config.forceAdmin)
	console.info("Admin not protected !!!")

module.exports = function(app) {
	
	app.use(passport.initialize());
	app.use(passport.session());

	passport.serializeUser(function(user, done) {
	    done(null, user.username);
	});

	passport.deserializeUser(function(id, done) {
		done(null, {
			username: id,
			admin: true,
		});
	});

	function Authenticate(req, username, password, done) {
		var hash = crypto.createHash("sha256").update(password).digest("hex");
		if(config.login==username && config.password==hash)
			done(null,{
				username: username,
				admin: true,
			});
		else
			done(null,null);
	}

	passport.use(new LocalStrategy({
    	usernameField: 'username',
    	passwordField: 'password',
    	passReqToCallback: true,
	},Authenticate));
	
	app.get('/user/login', function(req, res) {
		res.render('page-1col',exskel.locals(req,{
			content: 'user-login',
		}));
	});
	
	app.post('/user/login',passport.authenticate('local',{
	    failureRedirect: '/user/login',
	}),function(req,res) {
		if(req.session && req.session.afterLogin) {
			res.redirect(req.session.afterLogin);
			delete req.session.afterLogin;
		} else
			res.redirect('/');
	});
	
	app.get('/user/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});
	
	if(config.forceAdmin)
		app.use(function(req,res,next) {
			req.user = {
				admin: true
			}
			next();
		});
	else  {
		app.all('/admin/api*',function(req,res,next) {
			if(req.user && req.user.admin)
				next();
			else {
				res.status(403).send("Not allowed");
			}
		});
		app.all('/admin*',function(req,res,next) {
			if(req.user && req.user.admin)
				next();
			else {
				if(req.method=='POST')
					res.status(403).send("Not allowed");
				else {
					if(req.session)
						req.session.afterLogin = req.originalUrl;
					res.redirect('/user/login');
				}
			}
		});
	}
	
	function AdminLocals(req,data) {
		var locals = extend(true,{},exskel.locals(req,data),{
		});
		locals.nav = nav;
		return locals;
	}
	
	app.get("/admin",function(req, res) {
		res.render('page-1col',AdminLocals(req,{
			content: 'admin',
		}));
	});

	app.get("/admin/ads",function(req, res) {
		res.render('page-1col',AdminLocals(req,{
			content: 'ads',
		}));
	});
	
};

