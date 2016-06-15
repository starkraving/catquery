console.log('starting up');
var mode = process.argv[2] || 'development';
if ( mode == 'development' ) {
	require('dotenv').config();
}
var https = require('https');
var mongoose = require('mongoose');
var express = require('express');
var app = express();
mongoose.connect(process.env.MONGODB_URI);
console.log('connected to MongoDB');
var Query = require('./model/query');

app.get('/', function(req, resp){
	resp.contentType('text/html');
	resp.sendFile(__dirname+'/view/home.html');
});

app.get('/search', function(req, resp){
	if ( req.query.terms ) {
		resp.redirect('/search/'+encodeURIComponent(req.query.terms));
	} else {
		resp.redirect('/');
	}
});

app.get('/search/:terms/:offset?', function(req, resp){
	resp.contentType('text/JSON');
	var strTerms = req.params.terms;
	var offset = req.params.offset || 0;
	var timestamp = new Date().getTime();
	var insert = new Query({
		terms: strTerms,
		timestamp: timestamp
	}).save();
	var resultJSON = '';
	var apiReq = https.request({
		host: 'bingapis.azure-api.net',
		path: '/api/v5/images/search?q='+encodeURIComponent(strTerms)+'&count=20&offset='+offset,
		headers: {
			'Host': 'bingapis.azure-api.net',
			'Ocp-Apim-Subscription-Key': '6f5fb9b53d6c44e0b64d2a7281768a7d'
		}
	}, function(res){
		res.on('data', function(data){
			resultJSON += data;
		})
		.on('end', function(){
			var response = {status: 'error'};
			var resultData = JSON.parse(resultJSON);
			if ( 'value' in resultData ) {
				response.status = 'success';
				response.data = [];
				for ( var i in resultData.value ) {
					var result = resultData.value[i];
					response.data.push({
						title: result.name,
						imgURL: result.contentUrl,
						pageURL: result.hostPageDisplayUrl
					});
				}
			} else {
				response.message = 'Did not receive API results';
			}
			resp.end(JSON.stringify(response));
		});
	});
	apiReq.write('');
	apiReq.end();
});

app.get('/top5', function(req, resp){
	
})
console.log('listening on port '+process.env.PORT);
app.listen(process.env.PORT);
