
An Express-based web site skeleton

# About

After developing a few Express web sites, i wanted to pack a number of things together in order to reduce the setup time
between the beginning of the project and when starting coding project-specific stuff. Since it might be useful to others, it 
then made sense to share it.

This project is not intended to be a framework (a system with strong patterns to rely on) but more of a skeleton, i.e. a code base to start from for building
your web site.

Before you proceed with installation, it is certainly a good idea to walk through what this project does and does not provide.

## Performance

The whole skeleton is designed with performance in mind. It provides:

* non-blocking styles and scripts loading with prefetch when browser-supported
* automatic concatenation and minification of stylesheets
* automatic concatenation and minification of scripts
* automatic generation and inline integration of above-the-fold critical path CSS

All of these, along with using a CDN, ensure a 95% to 100% score on [Google Page Speed Insights](https://developers.google.com/speed/pagespeed/insights).

## Deployment

The project includes detailed instructions and scripts to setup GIT deployment. Basically, you develop and test in your environment. When
you are happy with your work, you push your commits to the *prod* branch on your server and that's it.

## HTML Templates

You are of course free to use the HTML templates that are provided by default with Exskel (*Minimaxing theme* from [HTML5Up](http://html5up.net/minimaxing)),
but you can easily use any template you want with a minimum of effort. 

## Authentication

As is, Exskel only supports a very basic authentication scheme, used to access the admin part of the site: single user/password provided
in the site configuration file. This might be a good fit if you are webmastering a simple site and just need to access some administration 
pages. But it won't help if you need a fully featured multi-users environment. 

## Requirements / Non-requirements

The whole project has been developed and tested on Express 4 (specifically 4.12.3).

A linux server is being assumed (developed and tested on Ubuntu 14.04, other distributions or versions are likely to work directly). You can 
probably use something else, but in that case the GIT deployment instructions won't certainly work out of the box.

No particular database is enforced, you can use whichever you want.

The templating engine being used here is EJS. This is not a strong requirement. If you prefer using another engine like Jade, there will only
be little modifications to do.

## Other features

A number of other features have been added since they are likely to be needed by any web site. Most of those features are provided by third-party modules
with a little bit of code for integration.

* HTTP and/or HTTPS servers are controlled from the configuration file: ports, optional IP bindings, SSL certificates
* cookie parser / body parser / compression
* configurable static resources caching
* session management: a session file store module is being used by default. If you setup a database, you may want to use a DB-backed store instead
* Google analytics: you can optionally use GA to track visited pages, send GA events from the client AND the server
* Geo-location: you can optionally have access to the visitor location
* Browser detection: you can optionally get information on the visitor browser and OS
* Graceful shutdown: whether you restarted the browser manually or because of a GIT push to the *prod* branch, you can do things like saving some
memory-held data to the disk before the process exits
* REST interface: simple management of AJAX calls from the client to your web site
* Force HTTPS: you can easily force some pages (like for payments or handling sensitive information) to be opened in HTTPS if enabled
* Admin section: the /admin/* part of the site requires to be logged and direct to a login page if not authenticated  

# Install for development

Ready to go ?

* clone the project to a local directory
* copy *config.default.json* to *config.json*
* edit *config.json* parameters (see below for parameters details. You probably want to set `concatStyles` and `concatScripts` to `false`)
* go to your project directory
* `npm install`
* `node app.js`

## Configuration parameters

| Param | Default | Description |
| ----- | ------- | ----------- |
| `login`     | `"admin"`   | the username to be used when login to the admin section of the site|
| `password`  | SHA256 for `"password"` | the SHA256 hash of the admin password. On linux, you can get it easily from the command <code>echo -n "mypassword" &#124; sha256sum</code> |
| `sessionSecret` | a string | just put any string here but change the default value |
| `staticMaxAge` | `"7d"` | the duration before static resources cache expires in the browser |
| `siteName` | | a human name for your site |
| `domain` | `null` | if not `null`, received GET requests that do not match this exact domain are redirected to the specified domain, keeping the protocol, path and query unchanged | 
| `shutdownTimeout` | `5` | when a graceful shutdown is requested, the number of seconds to wait before forcing the process killing |
| `sessionExpiration` | `259200` | the session time-to-live in seconds. 3 days by default |
| `parseUserAgent` | `true` | if set, visitor browser info is available on `req.browser` |
| `geoip` | `true` | if set, visitor location is available on `req.geoip` |
| `gaTrackingCode` | `null` | if set to a Google Analytics tracking ID (something like `UA-XXXX`), page visits will be tracked and browser and server event sending will be enabled |
| `http.disabled` | `false` | if disabled, the web site won't listen for HTTP connections |
| `http.port` | `9080` | the port to listen to for HTTP |
| `http.bind` | `null` | by default, HTTP listens to any network interface. Set an IP address to listen to a specific interface |
| `https.disabled` | `true` | if disabled, the web site won't listen for HTTPS connections |
| `https.port` | `9443` | the port to listen to for HTTPS |
| `https.bind` | `null` | by default, HTTPS listens to any network interface. Set an IP address to listen to a specific interface |
| `https.keyFile` | | the path to a local file containing the certificate key |
| `https.certFile` | | the path to a local file containing the certificate |
| `staticBypassCache` | `true` | in order to accomodate long cache expiration for performance and the ability to update stylesheets and scripts, the publish resource URL includes a random number that changes everytime the server application is restarted |
| `concatStyles` | `true` | should local stylesheets be concatenated. It is a good idea to set it to `false` in the development environment |
| `minifyStyles` | `true` | should the local concatenated stylesheet be minified |
| `concatScripts` | `true` | should local scripts be concatenated. Set it to `false` in the development environment |
| `minifyScripts` | `true` | should the local concatenated script be minified |
| `criticalPathStyles` | `true` | when set, the server will make a request to itself to determine the minimum CSS that should be included inline in order to render the above-the-fold part of the page |    
| `forceAdmin` | `false` | when set, the user is automatically authenticated as admin. Convenient when developing on the admin section, not for production |
| `defaultScripts` | some local JS files | an array of local JS files to be included in every page |
| `defaultExtScripts` | some JS URLs | an array of URLs to external JS resources to be included in every page |
| `defaultStyles` | some local CSS files | an array of local CSS files to be included in every page |
| `defaultExtScripts` | some CSS URLs | an array of URLs to external CSS resources to be included in every page |

## Install for production (deploying with GIT)

Setting up your server to allow deploying a new version to the server just by pushing commits to the `prod` branch is explained in details in
[this tutorial](README.git-deploy.md).

From the development repository: 
* `git remote add myserver git@myserver:/var/git/mysite.git`
* `git push myserver prod`

Note that the first push to *prod*, you will get some errors because the file *config.json* has not been created yet

From the server:
* `cd /home/mysite`
* `cp config.default.json config.json`
* edit site parameters in file *config.json*
* `/etc/mysite/restart-prod.sh`

New pushes to the *prod* branch on server *myserver* will automatically update and restart the server application. 

# Using the skeleton

## Rendering pages

Generally in Express, you render pages this way:

```
app.get('/mypath',function(req,res) {
    res.render('mytemplate',params);
});
```

where `params` is an object containing variables that can be accessed from the template.

Using this skeleton, you do so this way:

```
var exskel = require('./exskel');

app.get('mypath',function(req.res) {
    res.render('mytemplate',exskel.locals(params));
});
```

By doing so, the object you pass to the template will also contain some overwritable entries used to setup the header and footer for the HTML page.

In addition, this gives access to following variables, available in your template:

| Parameter | Description |
| --------- | ----------- |
| `req` | the request object |
| `config` | the content of the `config.json` file | 
| `user` | the logged user or `null` |

For instance:

```
<% if(user) { %><p>Hello <%= user.username %><% } %>
<p>You are on <%= config.siteName %>. Your IP is <%= req.ip %></p>
```

You can modify the scripts and styles to be loaded in a specific page with:

| Parameter | Description |
| --------- | ----------- |
| `scripts` | an array of local scripts that will be appended to the list of default scripts to be included (concatenated and minified). For instance, `scripts: ['/js/angular.js','/js/angular-sanitize.js']` add those two scripts to the page |
| `extScripts` | an array of external scripts to be appended to the default list of external scripts. For instance `extScripts: ['//cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.8/angular.min.js]`. Note that external scripts are not concatenated nor minified |
| `styles` | an array of local stylesheets to be appended to the default list of styles |
| `extStyles` | an array of external stylesheets to be appended to the default list of external styles. External styles are not concatenated nor minified |
| `criticalPathStyles` | `null` by default. If CSS critical path is used (`criticalPathStyles` set to `true` in `config.json`), the system will create a CSS cache string (5K to 10K) for each URL path (without the query part) it serves. So, if you have a route like `/article/:id/view`, this will lead to many useless entries if you have a large number of articles, while they all share the same critical path CSS. By setting parameter `criticalPathStyles` to something like `"article-view"`, this string will be used as the cache key instead of the URL path | 

The template variables object also contains some functions used to setup the optimized scripts and styles loading:

| Parameter | Description |
| --------- | ----------- |
| `header` | a function returning the HTML code to be included just before `</head>` |
| `footer` | a function returning the HTML code to be included just before `</body>` |

So, templates (EJS version) should look like:

```
<html>
  <head>
    ...
    <%- header() %>
  </head>
  <body>
    ...
    <%- footer() %>
  </body>
</html>
```

## Default template

The template provided by default in this project holds 4 different layouts:
* *page-1col*: all the content in a single column
* *page-2col1*: the bigger column is at the right
* *page-2col2*: the bigger column is at the left
* *page-3col*: the bigger column in the middle, two smaller ones at the sides

When using this template, you may be interested in those template variables: 

| Parameter | Description |
| --------- | ----------- |
| `content` | name of a file in the `views` directory (without the .ejb extension) to be included as content, used with layout *page-1col* |
| `contentLeft` | name of a file in the `views` directory (without the .ejb extension) to be included as left content, used with layout *page-2col1*, *page-2col2* and *page-2col* |
| `contentRight` | name of a file in the `views` directory (without the .ejb extension) to be included as right content, used with layout *page-2col1*, *page-2col2* and *page-3col* |
| `contentMiddle` | name of a file in the `views` directory (without the .ejb extension) to be included as middle content, used with layout *page-3col* |
| `pageTitle` | the HTML title for the page |
| `nav` | a object describing the primary menu. See `/controllers/nav.json` for the structure |

If you set `inline` as a content to be included, you can also use those parameters to create very simple content:

| Parameter | Description |
| --------- | ----------- |
| `title` | a title to appear in the content |
| `text` | a text (will be enclosed in `<p>`) |
| `paragraphs` | an array of texts (each of them will be enclosed in `<p>`) |
| `html` | raw HTML code | 

## Other tools

A few other tools may also be useful.

### Google Analytics

In the template variable object:

| Parameter | Description |
| --------- | ----------- |
| `gaPath` | by default the page reported to GA is the page path, but if your route is say `/article/:id/view` and you are more interested in the global visits to this type of page than to each individual page, you can set `gaPath` to something like `/article/any/view` |
| `gaEvents` | some events to be sent to Google Analytics from the user browser. For instance, `[["Article","view","myarticle",1]]` |

It is also possible to send events on behalf of the user from the server itself:

```
exskel.gaSendEvent(req,"Article","view",42);
```

### REST interface

For AJAX calls, you can use the following utility to answer properly:

```
app.post('/api/do-some-stuff',function(req,res) {
	exskel.apiCall(req,res,function(req,cb) {
		// do some sync or async stuff
		// call cb(err,result) when done
	});
});
```

This will return a proper JSON response with fields:

| Parameter | Description |
| --------- | ----------- |
| `status` | Boolean. Indicates whether the call succeeded or failed |
| `error` | if `status` is false, a string telling about the error reason |
| `result` | if `status` is true, the result of the operation |

### Forcing HTTPS

If you want some pages (like the ones concerning payments or sensitive information) to be served in HTTPS only, you can do this:

```
app.get('/secure-page',exskel.forceHttps(function(req,res) {
	res.render(...);
}));
``` 

# Additional notes

## Performance

Regarding the concatenation / minification  of styles and scripts and the CSS critical path, it may take a couple of browser refreshs
before seeing the effect in the HTML code. This is because those operations are performed in background while we answer the request as
quickly as we can, even if we don't have the optimized data yet.

For instance, right after starting the server application, if you visit `view-source:http://localhost:9080/`, you see:

```
<html>
	<head>
	...		
<link rel='prefetch' href='//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css'/>
<link rel='prefetch' href='/css/bootstrap.min.css?YoCvg'/>
<link rel='prefetch' href='/css/bootstrap-theme.min.css?YoCvg'/>
<link rel='prefetch' href='/css/main.css?YoCvg'/>
<link rel="subresource" href="/js/jquery.min.js?YoCvg">
<link rel="subresource" href="/js/jquery.dropotron.min.js?YoCvg">
<link rel="subresource" href="/js/bootstrap.min.js?YoCvg">
<link rel="subresource" href="/js/skel.min.js?YoCvg">
<link rel="subresource" href="/js/skel-viewport.min.js?YoCvg">
<link rel="subresource" href="/js/util.js?YoCvg">
<link rel="subresource" href="/js/main.js?YoCvg">
<script>!function(e,t,r){function n(){for(;d[0]&&"loaded"==d[0][f];)c=d.shift(),c[o]=!i.parentNode.insertBefore(c,i)}for(var s,a,c,d=[],i=e.scripts[0],o="onreadystatechange",f="readyState";s=r.shift();)a=e.createElement(t),"async"in i?(a.async=!1,e.head.appendChild(a)):i[f]?(d.push(a),a[o]=n):e.write("<"+t+' src="'+s+'" defer></'+t+">"),a.src=s}(document,"script",["/js/jquery.min.js?YoCvg","/js/jquery.dropotron.min.js?YoCvg","/js/bootstrap.min.js?YoCvg","/js/skel.min.js?YoCvg","/js/skel-viewport.min.js?YoCvg","/js/util.js?YoCvg","/js/main.js?YoCvg"])</script>
	</head>
	<body>
	...
<link rel='stylesheet' href='/css/bootstrap.min.css?YoCvg'/>
<link rel='stylesheet' href='/css/bootstrap-theme.min.css?YoCvg'/>
<link rel='stylesheet' href='/css/main.css?YoCvg'/>
	</body>
</html>
```

Refresh the page once. Now you get:

```
<html>
	<head>
	...
<link rel='prefetch' href='//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css'/>
<link rel='prefetch' href='/css/cache-6ad2713fc4ddfe5d801278b4fef4e5d3.css?YoCvg'/>
<link rel="subresource" href="/js/cache-ade755560a51198ea7c00320d5baf400.js?YoCvg">
<script>!function(e,t,r){function n(){for(;d[0]&&"loaded"==d[0][f];)c=d.shift(),c[o]=!i.parentNode.insertBefore(c,i)}for(var s,a,c,d=[],i=e.scripts[0],o="onreadystatechange",f="readyState";s=r.shift();)a=e.createElement(t),"async"in i?(a.async=!1,e.head.appendChild(a)):i[f]?(d.push(a),a[o]=n):e.write("<"+t+' src="'+s+'" defer></'+t+">"),a.src=s}(document,"script",["/js/cache-ade755560a51198ea7c00320d5baf400.js?YoCvg"])</script>
	</head>
	<body>
	...
<link rel='stylesheet' href='//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css'/>
<link rel='stylesheet' href='/css/cache-6ad2713fc4ddfe5d801278b4fef4e5d3.css?YoCvg'/>
	</body>
</html>	
```

As you can see, scripts and styles local resources have been concatenated (and also minified) to single `cache-xxx.js` and `cache-xxx.css` files. Refresh
again to see:

```
<html>
	<head>
	...
<style>html{-webkit-text-size-adjust:100%...#main{margin-top:44px}}</style>
<link rel='prefetch' href='//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css'/>
<link rel='prefetch' href='/css/cache-6ad2713fc4ddfe5d801278b4fef4e5d3.css?YoCvg'/>
<link rel="subresource" href="/js/cache-ade755560a51198ea7c00320d5baf400.js?YoCvg">
<script>!function(e,t,r){function n(){for(;d[0]&&"loaded"==d[0][f];)c=d.shift(),c[o]=!i.parentNode.insertBefore(c,i)}for(var s,a,c,d=[],i=e.scripts[0],o="onreadystatechange",f="readyState";s=r.shift();)a=e.createElement(t),"async"in i?(a.async=!1,e.head.appendChild(a)):i[f]?(d.push(a),a[o]=n):e.write("<"+t+' src="'+s+'" defer></'+t+">"),a.src=s}(document,"script",["/js/cache-ade755560a51198ea7c00320d5baf400.js?YoCvg"])</script>
	</head>
	<body>
	...
<link rel='stylesheet' href='//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css'/>
<link rel='stylesheet' href='/css/cache-6ad2713fc4ddfe5d801278b4fef4e5d3.css?YoCvg'/>
	</body>
</html>	
```

The additional inline `<style>...</style>` represents the minimal CSS required to display properly the visible part (above-the-fold) of the page. Additional styles (complete CSS with hovers, transitions, ...) are loaded shortly after but from a visitor point of view, the page loaded quickly and had immediately its final look.

Additional refreshes won't change the HTML code.

Also, if you are concerned about performance and did not setup a CDN (like Cloudflare) yet, you should do so as your priority.
