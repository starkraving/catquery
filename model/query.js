var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var querySchema = new Schema({
	terms: String,
	timestamp: Number
});

module.exports = mongoose.model('query', querySchema);