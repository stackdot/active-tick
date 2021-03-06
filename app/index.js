'use strict'



// Required Modules:
const colors 	= require('colors')
const debug 	= require('debug')('active-tick:main')
const request 	= require('request')
const lodash 	= require('lodash')
const async 	= require('async')
const moment 	= require('moment')
const Q 		= require('q')
const fs 		= require('fs')


const AT_STR 		= 'YYYYMMDDHHmmss'
const AT_STRL 		= 'YYYYMMDDHHmmssSSS'
const MAP_LIMIT		= 2


/**
 *  ActiveTick Class
 */
class ActiveTick {



	/**
	 *  Constructor
	 *  @param  {Object} params Params to be set into this instance
	 *  @return {ActiveTick}        ActiveTick instance
	 */
	constructor( params ){

		debug('Instance Created:', params)
		this.params = params
		this.mapLimit = params.mapLimit || MAP_LIMIT
		this.API = params.API

		// this.test()

		return this

	}

	// Simple to make sure it's working properly:
	test(){
		const symb = 'NFLX'
		this.tickData( symb, '8/25/2016' )
			.then(( results ) => {
				console.log('results', results)
				fs.writeFileSync(`./${symb}.csv`, results)
			})
			.catch(( err ) => {
				console.log('ERR', err)
				next( err )
			})
	}



	/**
	 *  Format a MomentJS date to ActiveTick API standard string
	 *  @param  {Date} date MomentJS date in which to format
	 *  @return {String}      Formatted String of the date given.
	 */
	formatToAT( date ){
		return date.format(AT_STR)
	}



	/**
	 *  Execute a Stack
	 *  @param  {Object}   params Params of the stack item
	 *  @param  {Function} cb     Callback
	 */
	exeStack( params, cb ){
		this.fetch( params, '/tickData', cb )
	}



	/**
	 *  Fetch a response from the ActiveTick API
	 *  @param  {Object}   params Query String params to be sent
	 *  @param  {String}   path   API route to be called
	 *  @param  {Function} cb     Callback
	 */
	fetch( params, path, cb ){
		debug('Requesting:', params)
		request({
			url: `${this.API}${path}`,
			qs: params
		}, ( err, res, body ) => {
			debug('Response Code:', res.statusCode)
			if( err ) return cb( err )
			if( res.statusCode != 200 ) return cb( new Error('Not a 200 status OK: '+res.statusCode ) )
			if( body == '0' ) return cb( err, [] )
			cb( err, this.parseResponse( body ) )
		})
	}



	/**
	 *  Parse the CSV format into JS Array
	 *  @param  {String} string CSV string ActiveTick API returns
	 *  @return {Array}        Array of items parsed from string
	 */
	parseResponse( string ){
		string = string.split('\r\n')
		console.log('len', string.length)
		return lodash.reject( string, ( str ) => lodash.isEmpty( str ) )
	}



	/**
	 *  Parse a Tick Response
	 *  @param  {String} str Line response from ActiveTick eg: Q,20160825093000577,0.730000,0.747000,47,35,P,Q,0
	 *  @return {Object}     Object of tick data from str
	 */
	parseTick( str ){
		const pieces = str.split( ',' )
		let res = {}
		res.type = pieces[0]
		res.time = moment(pieces[1], AT_STRL).valueOf()
		if( pieces[0] == 'T' ){
			res.type		= 'trade'
			res.lastprice 	= parseFloat( pieces[2] )
			res.lastsize 	= parseFloat( pieces[3] )
			res.lastexch 	= pieces[4]
			res.c1 			= parseInt( pieces[5] || '0' )
			res.c2 			= parseInt( pieces[6] || '0' )
			res.c3 			= parseInt( pieces[7] || '0' )
			res.c4 			= parseInt( pieces[8] || '0' )
		}else {
			res.type		= 'quote'
			res.bidprice 	= parseFloat( pieces[2] )
			res.askprice 	= parseFloat( pieces[3] )
			res.bidsize 	= parseFloat( pieces[4] )
			res.asksize 	= parseFloat( pieces[5] )
			res.bidexch 	= pieces[6] || ''
			res.askexch 	= pieces[7] || ''
			res.c1 			= parseInt( pieces[8] || '0' )
		}
		return res
	}



	/**
	 *  Get Tick data of a Stock Symbol for an entire day
	 *  @param  {String}   symbol 	Symbol you want the tick data for
	 *  @param  {String}   day    	Date you want tick data for eg: 08/25/2016
	 *  @return {Promise}         	Returns a promise
	 */
	tickData( symbol, day ){

		const deferred = Q.defer()
		debug('tick data', symbol, day)
		day = moment( new Date( day ) )
		debug('D', this.formatToAT( day ))

		// Set our date to 9:30am:
		day.hour( 9 )
		day.minute( 30 )
		day.seconds( 0 )

		// Divide day into 10min intervals:
		let callStack = []
		while( day.get('hours') < 16 ){
			let params = {
				symbol: symbol.toUpperCase(),
				trades: 1,
				quotes: 1,
				beginTime: this.formatToAT( day ),
				endTime: this.formatToAT( day )
			}
			day.add(10, 'minutes')
			params.endTime = this.formatToAT( day )
			callStack.push( params )
		}

		// Execute entire day:
		async.mapLimit( callStack, this.mapLimit, this.exeStack.bind( this ), ( err, res ) => {
			deferred.makeNodeResolver()( err, lodash.flatten( res ) )
		})

		// Return promise
		return deferred.promise

	}



}



/**
 *  Export
 *  @param  {Object} 	params 	ActiveTick library params
 *  @return {ActiveTick}        New instance of the ActiveTick library
 */
module.exports = ( params )=> {
	return new ActiveTick( params )
}
