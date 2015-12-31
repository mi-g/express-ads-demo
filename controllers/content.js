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
	app.get("/one-column",function(req, res) {
		res.render('page-1col',exskel.locals(req,{
			content: 'sample-lorem',
		}));
	});
	app.get("/two-columns-1",function(req, res) {
		res.render('page-2col1',exskel.locals(req,{
			contentLeft: 'sample-lorem',
			contentRight: 'sample-some-stuff',
		}));
	});
	app.get("/two-columns-2",function(req, res) {
		res.render('page-2col2',exskel.locals(req,{
			contentLeft: 'sample-some-stuff',
			contentRight: 'sample-lorem',
		}));
	});
	app.get("/three-columns",exskel.forceHttps(function(req, res) {
		res.render('page-3col',exskel.locals(req,{
			contentLeft: 'sample-some-stuff2',
			contentMiddle: 'sample-lorem',
			contentRight: 'sample-some-stuff',
		}));
	}));
}

