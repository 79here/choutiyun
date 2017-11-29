/**
 * This sample demonstrates how to delete objects under specified bucket 
 * from Huawei OBS using the OBS SDK for Nodejs.
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
		
		var events = require('events');
		var eventEmitter = new events.EventEmitter();
		var keys = [];
		
		 /*
         * Batch put objects into the bucket
         */
		var content = 'Thank you for using Huawei Object Storage Servic';
		var keyPrefix = 'MyObjectKey';
		var finishedCount = 0;
		
		for(let i=0;i<100;i++){
			let key = keyPrefix + i;
			obs.putObject({
				Bucket : bucketName,
				Key : key,
				Body : content
			}, (err, result) => {
				finishedCount++;
				if(!err && result.CommonMsg.Status < 300){
					console.log('Succeed to put object' + key);
					keys.push({Key:key});
				}
				if(finishedCount === 100){
					console.log('\n');
					eventEmitter.emit('Batch put objects finished');
				}
			});
		}
		
		
		/*
         * Delete all objects uploaded recently under the bucket
         */
		eventEmitter.on('Batch put objects finished', () => {
			console.log('Deleting all objects\n');
			obs.deleteObjects({
				Bucket: bucketName,
				Quiet:false,
				Objects: keys
			}, (err, result)=> {
				if(!err && result.CommonMsg.Status < 300){
					console.log('Deleteds:');
					for(let i in result.InterfaceResult.Deleteds){
						console.log('Deleted[' + (i+1) + ']:');
						console.log('Key-->'+result.InterfaceResult.Deleteds[i]['Key']);
						console.log('VersionId-->' + result.InterfaceResult.Deleteds[i]['VersionId']);
						console.log('DeleteMarker-->' + result.InterfaceResult.Deleteds[i]['DeleteMarker']);
						console.log('DeleteMarkerVersionId-->' + result.InterfaceResult.Deleteds[i]['DeleteMarkerVersionId']);
					}
					console.log('\n');
					console.log('Errors:');
					for(let i in result.InterfaceResult.Errors){
						console.log('Error[' + (i+1) + ']:');
						console.log('Key-->' + result.InterfaceResult.Errors[i]['Key']);
						console.log('VersionId-->' + result.InterfaceResult.Errors[i]['VersionId']);
						console.log('Code-->' + result.InterfaceResult.Errors[i]['Code']);
						console.log('Message-->' + result.InterfaceResult.Errors[i]['Message']);
					}
				}
			});
		});
	}
});


var process = require('process');
process.on('beforeExit', (code) => {
	obs.close();
});

