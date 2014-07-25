var eventStream = require( 'event-stream' ),
	mStream = require( '../lib' );

// Create some data...
var data = new Array( 1000 );
for ( var i = 0; i < data.length; i++ ) {
	data[ i ] = Math.random();
}

// Create a readable stream:
var readStream = eventStream.readArray( data );

// Create a new moving mean stream:
var stream = mStream()
	.window( 10 )
	.stream();

// Pipe the data:
readStream.pipe( stream )
	.pipe( eventStream.map( function( d, clbk ){
		clbk( null, d.toString()+'\n' );
	}))
	.pipe( process.stdout );