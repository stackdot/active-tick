[![Node Version](https://img.shields.io/node/v/active-tick.svg?maxAge=60)](https://www.npmjs.com/package/active-tick) [![NPM Version](https://img.shields.io/npm/v/active-tick.svg?maxAge=60)](https://www.npmjs.com/package/active-tick)  [![NPM License](https://img.shields.io/npm/l/active-tick.svg?maxAge=60)](https://www.npmjs.com/package/active-tick) 

[![Build Status](https://drone.stackdot.com/api/badges/stackdot/active-tick/status.svg?maxAge=60)](https://drone.stackdot.com/stackdot/active-tick) [![dependencies Status](https://img.shields.io/david/stackdot/active-tick.svg?maxAge=60)](https://david-dm.org/stackdot/active-tick)


<p align="center"><img src="assets/logo.png" /></p>


ActiveTick
===

ActiveTick Nodejs Library.
- Uses promises
- Uses ES6

Requirements:
---

- [NodeJS](https://nodejs.org/en/download/) ( Version 6+ )
 - We recommend using [Node Version Manager](https://github.com/creationix/nvm)

To Get Started:
---

- Install the package in your project

```bash
npm install active-tick --save
```

To use:
```javascript

const ActiveTick = require('active-tick')({
	// Location of your ActiveTick API:
	API: 'http://localhost:5000'
})

ActiveTick.tickData( 'TSLA', '8/25/2016' )
	.then(( res ) => {
		console.log('Results:', res)
	})
	.catch(( err ) => {
		console.log('Error:', err)
	})

```



Enabling the Debugger
---

To enable [debug](https://github.com/visionmedia/debug) logs, enable them via environment variables.

To see all debug logs from this app, set the env variable:

```bash
DEBUG=active-tick*
```

Running with your project:

```bash
DEBUG=active-tick* node myproject.js
```












License
----

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
