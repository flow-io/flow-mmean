/**
*
*	STREAM: moving mean
*
*
*	DESCRIPTION:
*		- Transform stream which calculates a sliding-window average (moving-mean) over a numeric data stream.
*
*
*	NOTES:
*		[1] 
*
*
*	TODO:
*		[1] 
*
*
*	HISTORY:
*		- 2014/05/27: Created. [AReines].
*
*
*	DEPENDENCIES:
*		[1] through
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. athan@nodeprime.com. 2014.
*
*/

(function() {
	'use strict';

	// MODULES //

	var // Through module:
		through = require( 'through' );


	// FUNCTIONS //

	/**
	* FUNCTION: getBuffer( W )
	*	Returns a buffer array where each element is pre-initialized to zero.
	*
	* @private
	* @param {Number} W - buffer size
	* @returns {Array} buffer
	*/
	function getBuffer( W ) {
		var buffer = new Array( W );
		for ( var i = 0; i < W; i++ ) {
			buffer[ i ] = 0;
		}
		return buffer;
	} // end FUNCTION getBuffer()

	/**
	* FUNCTION: onData( W )
	*	Returns a callback which calculates a moving mean and is invoked upon receiving new data.
	*
	* @private
	* @param {Number} W - window size
	* @returns {Function} callback
	*/
	function onData( W ) {
		var buffer = getBuffer( W ),
			full = false, oldVal,
			mean = 0, N = 0, delta = 0;

		/**
		* FUNCTION: onData( newVal )
		*	Data event handler. Calculates a moving mean.
		*
		* @private
		* @param {Number} newVal - new streamed data value
		*/
		return function onData( newVal ) {
			// Fill the buffer:
			if ( !full ) {
				buffer[ N ] = newVal;

				N += 1;
				delta = newVal - mean;
				mean += delta / N;

				if ( N === W ) {
					full = true;
					this.queue( mean );
				}
				return;
			} // end IF (!full)

			// Update our buffer:
			oldVal = buffer.shift();
			buffer.push( newVal );

			// Calculate the moving mean:
			delta = newVal - oldVal;
			mean += delta / W;

			// Queue the mean value:
			this.queue( mean );
		}; // end FUNCTION onData()
	} // end FUNCTION onData()


	// STREAM //

	/**
	* FUNCTION: Stream()
	*	Stream constructor.
	*
	* @returns {Stream} Stream instance
	*/
	function Stream() {
		this._window = 5;
		return this;
	} // end FUNCTION Stream()

	/**
	* METHOD: window( value )
	*	Setter and getter for window size. If a value is provided, sets the window size. If no value is provided, returns the window size.
	*
	* @param {Number} value - window size
	* @returns {Stream|Number} Stream instance or window size
	*/
	Stream.prototype.window = function( value ) {
		if ( !arguments.length ) {
			return this._window;
		}
		if ( typeof value !== 'number' || value !== value ) {
			throw new Error( 'window()::invalid input argument. Window must be numeric.' );
		}
		this._window = value;
		return this;
	}; // end METHOD window()

	/**
	* METHOD: stream()
	*	Returns a through stream for calculating the moving mean. Note that, when the stream ends, the resulting dataset will have N-Window+1 data points.
	*
	* @returns {object} through stream
	*/
	Stream.prototype.stream = function() {
		return through( onData( this._window ) );
	}; // end METHOD stream()


	// EXPORTS //

	module.exports = function createStream() {
		return new Stream();
	};

})();