var express = require('express');
var app = express();
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var compression = require('compression');
var exskel = require('./controllers/exskel');
var ejs = require('ejs');
var extend = require('extend');
var config = require('./config');
var https = require('https');
var fs = require('fs');

exskel.pre(app);

app.set('views', __dirname + '/views');
app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(__dirname + '/public',{
	maxage: config.staticMaxAge || '6h',
}));  

var store = new FileStore({ 
	retries: 50,
	ttl: config.sessionExpiration,
	logFn: function(){},
});

app.use(session({
    store: store,
	secret: config.sessionSecret,
	resave: true,
	saveUninitialized: true,
}));

exskel.post(app);

require('express-ads')(app,{
	adminPath: "/admin/eas",
	standaloneAdminUI: false,
	auth: function(req,res,next) {
		// no special auth for express-ads admin as it is handled 
		// at site level for every route under /admin
		next();
	},
	adminStyles: {
		fontAwesome: null,
		bootstrap: null,
	},
	adminScripts: {
		jquery: null,
		bootstrap: null,
	},
	addons: [
	    require('express-ads-chitika'),
	    require('express-ads-adsense'),
	],
});

require('./controllers/admin.js')(app);
require('./controllers/content.js')(app);

app.use(function(req, res, next) {
	res.status(404).render('page-1col',exskel.locals(req,{
		content: 'notfound',
	}));
});

app.use(function(err, req, res, next) {
	res.status(500).render('page-1col',exskel.locals(req,{
		content: 'error',
		error: err,
	}));
});

var httpServer = null;
if(config.http && !config.http.disabled)
	httpServer = app.listen(config.http.port, config.http.bind || undefined, function() {
		console.log('Listening on '+(config.http.bind||'*')+ ':' + config.http.port);
	});

var httpsServer = null;
if(config.https && !config.https.disabled) {
	var sslPort = config.https.port;
    httpsServer = https.createServer({
        key: fs.readFileSync(config.https.keyFile),
        cert: fs.readFileSync(config.https.certFile)
      }, app).listen(config.https.port, config.https.bind || undefined, function() {
    		console.log('Listening on SSL '+(config.https.bind||'*')+ ':' + config.https.port);
      });
}

module.exports = app;

// Graceful shutdown
function Exit() {
	console.info("Exiting");
	var tasks = 1;
	function Done() {
		if(--tasks==0)
			process.exit(0);
	}
	if(httpServer) {
		tasks++;
		console.info("Closing HTTP");
		httpServer.close(function() {
			console.info("Closed HTTP");
			Done();
		});
	}
	if(httpsServer) {
		tasks++;
		console.info("Closing HTTPS");
		httpsServer.close(function() {
			console.info("Closed HTTPS");
			Done();
		});
	}
	setTimeout(function() {
		console.info("Forced exit");
		process.exit(0);
	},config.shutdownTimeout*1000);
	Done();
}

process.on("SIGUSR2",function() {
	var tasks = 1;
	function Done() {
		if(--tasks==0)
			Exit();
	}
	// add shutdown tasks here: increment tasks, call Done() when task finishes
	Done();
});
