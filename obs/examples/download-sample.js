/**
 * This sample demonstrates how to download an object 
 * from Huawei OBS in different ways using the OBS SDK for Nodejs.
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

var pathLib = require('path');
var sampleFilePath = '/temp/text.txt';

function mkdirsSync(dirname){
    if(fs.existsSync(dirname)){
        return true;
    }else{
        if(mkdirsSync(pathLib.dirname(dirname))){
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

function createSampleFileSync(sampleFilePath){
	if(!fs.existsSync(sampleFilePath)){
		mkdirsSync(pathLib.dirname(sampleFilePath));
		var fd = fs.openSync(sampleFilePath, 'w');
		if(fd){
			fs.writeSync(fd, String(Math.random()) + '\n');
			fs.writeSync(fd, String(Math.random()) + '\n');
			fs.writeSync(fd, String(Math.random()) + '\n');
			fs.writeSync(fd, String(Math.random()) + '\n');
			fs.closeSync(fd);
		}
	}
	return sampleFilePath;
}

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
         * Upload an object to your bucket
         */
		obs.putObject({
			Bucket: bucketName,
			Key: objectKey,
			SourceFile : createSampleFileSync(sampleFilePath)
		}, (err, result) => {
			if(!err && result.CommonMsg.Status < 300){
				console.log('Uploading a new object to OBS from a file finished.\n');
				
				/*
	             * Download the object as a String
	             */
				obs.getObject({
					Bucket: bucketName,
					Key: objectKey,
				}, (err, result) => {
					if(!err && result.CommonMsg.Status < 300){
						console.log('Get object content');
						console.log('\tContent-->\n' + result.InterfaceResult.Content);
						console.log('\n');
					}
				});
				
				var localFilePath = '/temp/' + objectKey;
				/*
	             * Download the object to a file
	             */
				obs.getObject({
					Bucket: bucketName,
					Key: objectKey,
					SaveAsFile: localFilePath
				}, (err, result) => {
					console.log('Download the object to a file finished.\n');
				});
			}
		});
	}
});

var isDeleteObjectFinished = false; 
var process = require('process');
process.on('beforeExit', (code) => {
	if(fs.existsSync(sampleFilePath)){
		fs.unlinkSync(sampleFilePath);
	}
	
	if(!isDeleteObjectFinished){
		/*
		 * Delete object
		 */
		obs.deleteObject({
			Bucket: bucketName,
			Key: objectKey
		}, (err, result) => {
			if(!err && result.CommonMsg.Status < 300){
				console.log('Delete object ' + objectKey +  ' finished.\n');
			}
			obs.close();
		});
		isDeleteObjectFinished = true;
	}
});