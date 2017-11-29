/**
 * This sample demonstrates how to create an empty folder under 
 * specified bucket to Huawei OBS using the OBS SDK for Nodejs.
 */

'use strict';
 
var ObsClient;
var fs = require('fs');
if(fs.existsSync('./lib/obs')){
	ObsClient = require('./lib/obs');
}else{
	ObsClient = require('../lib/obs');//sample env
}

var obs = new ObsClient();

/*
 * Initialize a obs client instance with your account for accessing OBS
 */
obs.Factory(
{
	access_key_id: '*** Provide your Access Key ***',
	secret_access_key: '*** Provide your Secret Key ***',
	server : 'obs.myhwclouds.com',
	signature : 'v4',
	region : 'CHINA',
	path_style : true,
	is_secure : true
});

var bucketName = 'my-obs-bucket-demo';

/*
 * Create bucket 
 */
obs.createBucket({
	Bucket : bucketName
}, (err, result) => {
	if(!err && result.CommonMsg.Status < 300){
		console.log('Create bucket for demo\n');
		
        /*
         * Way 1:
         */
		var keySuffixWithSlash1 = 'MyObjectKey1/';
		obs.putObject({
			Bucket : bucketName,
			Key : keySuffixWithSlash1
		}, (err, result) => {
			if(!err && result.CommonMsg.Status < 300){
				console.log('Create an empty folder ' + keySuffixWithSlash1 + ' finished.\n');
				/*
	             * Verify whether the size of the empty folder is zero 
	             */
				obs.getObjectMetadata({
					Bucket : bucketName,
					Key : keySuffixWithSlash1
				}, (err, result) => {
					if(!err && result.CommonMsg.Status < 300){
						console.log('Size of the empty folder ' + keySuffixWithSlash1 + ' is ' + result.InterfaceResult.ContentLength);
					}
				});
			}
		});
		
        /*
         * Way 2:
         */
		var keySuffixWithSlash2 = 'MyObjectKey2/';
		obs.putObject({
			Bucket : bucketName,
			Key : keySuffixWithSlash2,
			Body : ''
		}, (err, result) => {
			if(!err && result.CommonMsg.Status < 300){
				console.log('Create an empty folder ' + keySuffixWithSlash2 + ' finished.\n');
				/*
	             * Verify whether the size of the empty folder is zero 
	             */
				obs.getObjectMetadata({
					Bucket : bucketName,
					Key : keySuffixWithSlash1
				}, (err, result) => {
					if(!err && result.CommonMsg.Status < 300){
						console.log('Size of the empty folder ' + keySuffixWithSlash2 + ' is ' + result.InterfaceResult.ContentLength);
					}
				});
			}
		});
		
	}
});


var process = require('process');
process.on('beforeExit', (code) => {
	obs.close();
});

