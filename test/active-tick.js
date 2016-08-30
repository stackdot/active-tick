

process.env.NODE_ENV 	= 'test'


// Required Modules:
const chai 			= require('chai')
const should 		= chai.should()
const expect		= require("chai").expect
const assert 		= require('assert')
const nock 			= require('nock')
const Lib 			= require('../app/index.js')({
	API: 'http://localhost:5000'
})


// http scope:
let scope = null



describe('Active Tick', function(){


	before(function( cb ){
		scope = nock('http://localhost:5000')
			.get('/tickData')
			.reply(200)
		cb()
	})


	after(function( cb ){
		scope.isDone()
		cb()
	})


	it('should write some tests....', function( cb ){
		cb()
	})


})