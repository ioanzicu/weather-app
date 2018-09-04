const yargs   	= require('yargs');
const axios   	= require('axios');
const fs 		= require('fs');

var logger = (logMessage) => {
	var now = new Date().toString();
	var log = `${now}: ${logMessage}`;
	// console.log(log);
	fs.appendFile('search-weather-history.log', log + '\n', (err) => {
		if (err) {
			console.log('Unable to append to server.log');
		}
	});
};

const argv = yargs
	.options({
		a: {
			demand: true,
			alias: 'address',
			describe: 'Address to fetch weather for.' 
						+ '\n' + 'Default: Berlin.',
			string: true
		}
	})
	.help()
	.alias('help', 'h')
	.argv;

// SET DEFAULT VALUE
if (argv.address === '') {
	argv.address = 'Berlin';
}

var encodedAddress = encodeURIComponent(argv.address);
var geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`;

axios.get(geocodeUrl).then((response) => {
	if (response.data.status === 'ZERO_RESULTS') {
    	throw new Error('Unable to find that address.');
  	} 
  	// console.log(response.data.status);
	var lat = response.data.results[0].geometry.lat;
	var lng = response.data.results[0].geometry.lng;
	var weatherUrl = `https://api.darksky.net/forecast/1e6a0b68eeb1a962beaac36a1b98b9c9/${lat},${lng}`;
	console.log(response.data.results[0].formatted_address);
	var logMessage = response.data.results[0].formatted_address, lat, lng;
	logger(logMessage);
	return axios.get(weatherUrl);
}).then((response) => {
	var temperature = response.data.currently.temperature;
	var apparentTemperature = response.data.currently.apparentTemperature;
	var logMessage = `It's currently ${temperature}. It feels like ${apparentTemperature}.`;
	logger(logMessage);
	console.log(logMessage);
}).catch((e) => {
	logger(e.message);
	console.log(e.message);
});