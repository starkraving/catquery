console.log('starting up');
var mode = process.argv[2] || 'development';
if ( mode == 'development' ) {
	require('dotenv').config();
}
var express = require('express');
var app = express();
app.use(require('./controller'));

console.log('listening on port '+process.env.PORT);
app.listen(process.env.PORT);
