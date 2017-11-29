/**
 * This sample demonstrates how to upload multiparts to Huawei OBS 
 * using the OBS SDK for Nodejs.
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
var objectKey = 'my-obs-object-key-demo';

/*
 * Create bucket 
 */
obs.createBucket({
	Bucket : bucketName
}, (err, result) => {
	if(!err && result.CommonMsg.Status < 300){
		console.log('Create bucket for demo\n');
        /*
         * Step 1: initiate multipart upload
         */
		console.log('Step 1: initiate multipart upload \n');
		obs.initiateMultipartUpload({
			Bucket: bucketName, 
			Key: objectKey,
		}, (err, result) => {
			if(!err && result.CommonMsg.Status < 300){
				var uploadId = result.InterfaceResult.UploadId;
				 /*
	             * Step 2: upload a part
	             */
				console.log('Step 2: upload part \n');
				obs.uploadPart({
					Bucket: bucketName,
					Key: objectKey,
					UploadId: uploadId,
					PartNumber : 1,
					Body : 'Hello OBS'
				}, (err, result) => {
					if(!err && result.CommonMsg.Status < 300){
						var etag = result.InterfaceResult.ETag;
						 /*
			             * Step 3: complete multipart upload
			             */
						console.log('Step 3: complete multipart upload \n');
						obs.completeMultipartUpload({
							Bucket : bucketName,
							Key : objectKey,
							UploadId: uploadId,
							Parts : [{PartNumber : 1, ETag: etag}]
						}, (err, result) => {
							if(!err && result.CommonMsg.Status < 300){
								console.log('complete multipart upload finished.\n');
							}
						});
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