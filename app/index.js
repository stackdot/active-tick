'use strict'



// Required Modules:
const colors 	= require('colors')
const debug 	= require('debug')('active-tick:main')
const request 	= require('request')
const lodash 	= require('lodash')
const async 	= require('async')
const moment 	= require('moment')
const Q 		= require('q')




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

		this.params = params
		this.mapLimit = 1
		this.API = params.API
		return this

	}



	/**
	 *  Format a MomentJS date to ActiveTick API standard string
	 *  @param  {Date} date MomentJS date in which to format
	 *  @return {String}      Formatted String of the date given.
	 */
	formatToAT( date ){
		return date.format('YYYYMMDDHHmmSS')
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
			cb( err, body )
		})
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
		async.mapLimit( callStack, this.mapLimit, this.exeStack.bind( this ), deferred.makeNodeResolver())


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
