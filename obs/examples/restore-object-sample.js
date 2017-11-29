/**
 * This sample demonstrates how to download an cold object 
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
var process = require('process');
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

var bucketName = 'my-obs-cold-bucket-demo';
var objectKey = 'my-obs-cold-object-key-demo';


/*
 * Create a cold bucket 
 */
obs.createBucket({
	Bucket : bucketName,
	StorageClass : 'GLACIER'
}, (err, result) => {
	if(!err && result.CommonMsg.Status < 300){
		console.log('Create a new cold bucket for demo\n');
		/*
         * Create a cold object
         */
		obs.putObject({
			Bucket : bucketName, 
			Key : objectKey,
			Body : 'Hello OBS'
		}, (err, result) => {
			if(!err && result.CommonMsg.Status < 300){
				console.log('Create a new cold object for demo\n');
				console.log('Restore the cold object');
				obs.restoreObject({
					Bucket: bucketName,
					Key : objectKey,
					Days : 1,
					Tier : 'Expedited'
				}, (err, result) => {
					if(!err && result.CommonMsg.Status < 300){
						/*
			             * Wait 6 minute to get the object
			             */
						setTimeout(()=>{
							 /*
				             * Get the cold object
				             */
							obs.getObject({
								Bucket : bucketName,
								Key : objectKey,
							}, (err, result) => {
								if(!err && result.CommonMsg.Status < 300){
									console.log('Get the cold object:');
									console.log('\tContent-->\n' + result.InterfaceResult.Content);
									console.log('\n');
									
									/*
						             * Delete the cold object
						             */
									obs.deleteObject({
										Bucket : bucketName,
										Key : objectKey
									}, (err, result) => {
										if(!err && result.CommonMsg.Status < 300){
											console.log('Delete the cold object finished.\n');
										}
									});
								}
							});
						}, 6 * 60 * 1000);
					}
				});
			}
		});
	}
});


process.on('beforeExit', (code) => {
	obs.close();
});