
Demo web site for express-ads: an Node.js module to display and managed ads on any Express-based web site.

# About

This web site runs [express-ads](https://github.com/mi-g/express-ads) in a special demo mode. Every user can modify the ads without being an administrator,
however the changes are only viewable by this user. Plus, the whole configuration is reset after 10 minutes of inactivity.

You can use this site online from [http://demo.eas.rocks/](http://demo.eas.rocks/).

## Run the site in your dev environment

* clone this repository
* copy `config.default.json` to `config.json`
* run `npm install` to install dependencies
* run the app `node app.js`
* point your browser to `http://localhost:9080/` 
