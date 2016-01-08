/* 
 * Copyright (c) 2015 Michel Gutierrez
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 */

var exskel = require("./exskel");

module.exports = function(app) {
	app.get("/",function(req, res) {
		res.render('page-1col',exskel.locals(req,{
			layoutedContent: 'sample-home',
			banner: 'sample-homebanner',
		}));
	});
	app.get("/content",function(req, res) {
		res.render('page-1col',exskel.locals(req,{
			content: 'sample-lorem',
		}));
	});	
	app.get("/admin-ads",function(req, res) {
		res.render('page-1col',exskel.locals(req,{
			content: 'ads',
		}));
	});

}

