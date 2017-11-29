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
         * Enable bucket versioning
         */
		obs.setBucketVersioningConfiguration({
			Bucket : bucketName,
			VersionStatus : 'Enabled'
		}, (err, result) => {
			if(!err && result.CommonMsg.Status < 300){
				console.log('Enable bucket versioning finished.\n');
				var events = require('events');
				var eventEmitter = new events.EventEmitter();
				var content = 'Hello OBS';
				var keyPrefix = 'MyObjectKey';
				var folderPrefix = 'src';
				var subFolderPrefix = 'test';
				
				var folderFinishedCount = 0;
				/*
		         * First prepare folders and sub folders
		         */
				for(let i=0;i<5;i++){
					let key = folderPrefix + i + '/';
					obs.putObject({
						Bucket: bucketName,
						Key : key
					}, (err, result) => {
						folderFinishedCount++;
						if(!err && result.CommonMsg.Status < 300){
							for(let j=0;j<3;j++){
								let subKey = key + subFolderPrefix + j + '/';
								obs.putObject({
									Bucket: bucketName,
									Key : subKey
								}, (err, result) => {
									folderFinishedCount++;
									if(folderFinishedCount === 3 * 5){
										eventEmitter.emit('Create folder finished');
									}
								});
							}
						}
					});
				}
				
				var objectFinishedCount = 0;
				eventEmitter.on('Create folder finished', () => {
					/*
			         * Insert 2 objects in each folder
			         */
					obs.listObjects({
						Bucket: bucketName
					}, (err, result) => {
						var length = 0;
						if(!err && result.CommonMsg.Status < 300){
							length += result.InterfaceResult.Contents.length;
							for(let j in result.InterfaceResult.Contents){
								for(let i=0;i<2;i++){
									let objectKey = result.InterfaceResult.Contents[j]['Key'] + keyPrefix + i;
									obs.putObject({
										Bucket: bucketName,
										Key : objectKey
									}, (err, result) => {
										objectFinishedCount ++;
										if(objectFinishedCount === length * 2 + 2){
											eventEmitter.emit('Create object finished');
										}
									});
								}
							}
						}
						
						/*
						 * Insert 2 objects in root path
						 */
						for(let i=0;i<2;i++){
							let objectKey = keyPrefix + i;
							obs.putObject({
								Bucket: bucketName,
								Key : objectKey
							}, (err, result) => {
								objectFinishedCount ++;
								if(objectFinishedCount === length * 2 + 2){
									eventEmitter.emit('Create object finished');
								}
							});
						}
						
					});
				});
				
				eventEmitter.on('Create object finished', ()=>{
					/*
		             * List versions using default parameters, will return up to 1000 objects
		             */
					obs.listVersions({
						Bucket : bucketName
					}, (err, result) => {
						if(!err && result.CommonMsg.Status < 300){
							console.log('List versions using default parameters:');
							console.log('Versions:');
							for(let j in result.InterfaceResult.Versions){
								console.log('Version[' + (j+1) +  ']:');
								console.log('Key-->' + result.InterfaceResult.Versions[j]['Key']);
								console.log('VersionId-->' + result.InterfaceResult.Versions[j]['VersionId']);
							}
							console.log('DeleteMarkers:');
							for(let i in result.InterfaceResult.DeleteMarkers){
								console.log('DeleteMarker[' + (i+1) +  ']:');
								console.log('Key-->' + result.InterfaceResult.DeleteMarkers[i]['Key']);
								console.log('VersionId-->' + result.InterfaceResult.DeleteMarkers[i]['VersionId']);
							}
							console.log('\n');
						}
						
						/*
			             * List all the versions in way of pagination
			             */
						function listAll(nextKeyMarker,nextVersionIdMarker, pageSize, pageIndex){
							obs.listVersions({
								Bucket: bucketName,
								MaxKeys: pageSize,
								KeyMarker: nextKeyMarker,
								VersionIdMarker: nextVersionIdMarker
							}, (err, result) => {
								if(!err && result.CommonMsg.Status < 300){
									console.log('Page:' + pageIndex);
									console.log('Versions:');
									for(let j in result.InterfaceResult.Versions){
										console.log('Version[' + (j+1) +  ']:');
										console.log('Key-->' + result.InterfaceResult.Versions[j]['Key']);
										console.log('VersionId-->' + result.InterfaceResult.Versions[j]['VersionId']);
									}
									console.log('DeleteMarkers:');
									for(let i in result.InterfaceResult.DeleteMarkers){
										console.log('DeleteMarker[' + (i+1) +  ']:');
										console.log('Key-->' + result.InterfaceResult.DeleteMarkers[i]['Key']);
										console.log('VersionId-->' + result.InterfaceResult.DeleteMarkers[i]['VersionId']);
									}
									console.log('\n');
									if(result.InterfaceResult.IsTruncated === 'true'){
										listAll(result.InterfaceResult.NextKeyMarker, result.InterfaceResult.NextVersionIdMarker,pageSize, pageIndex + 1);
									}else{
										eventEmitter.emit('List all in way of pagination finished');
									}
								}
							});
						}
						console.log('List all the versions in way of pagination:');
						listAll(null, null, 10, 1);
						
					});
				});
				
				eventEmitter.on('List all in way of pagination finished', () => {
					console.log('List all versions group by folder');
					obs.listVersions({
						Bucket: bucketName,
						Delimiter: '/'
					}, (err, result) => {
						if(!err && result.CommonMsg.Status < 300){
							console.log('Root path:');
							console.log('Versions:');
							for(let j in result.InterfaceResult.Versions){
								console.log('Version[' + (j+1) +  ']:');
								console.log('Key-->' + result.InterfaceResult.Versions[j]['Key']);
								console.log('VersionId-->' + result.InterfaceResult.Versions[j]['VersionId']);
							}
							console.log('DeleteMarkers:');
							for(let i in result.InterfaceResult.DeleteMarkers){
								console.log('DeleteMarker[' + (i+1) +  ']:');
								console.log('Key-->' + result.InterfaceResult.DeleteMarkers[i]['Key']);
								console.log('VersionId-->' + result.InterfaceResult.DeleteMarkers[i]['VersionId']);
							}
							console.log('\n');
							
							
							var listVersionsByPrefix = function(commonPrefixes){
								for(let i in commonPrefixes){
									obs.listVersions({
										Bucket: bucketName,
										Delimiter: '/',
										Prefix: commonPrefixes[i]['Prefix']
									}, (err, result)=>{
										if(!err && result.CommonMsg.Status < 300){
											console.log('Folder ' + commonPrefixes[i]['Prefix'] + ':');
											console.log('Versions:');
											for(let j in result.InterfaceResult.Versions){
												console.log('Version[' + (j+1) +  ']:');
												console.log('Key-->' + result.InterfaceResult.Versions[j]['Key']);
												console.log('VersionId-->' + result.InterfaceResult.Versions[j]['VersionId']);
											}
											console.log('DeleteMarkers:');
											for(let i in result.InterfaceResult.DeleteMarkers){
												console.log('DeleteMarker[' + (i+1) +  ']:');
												console.log('Key-->' + result.InterfaceResult.DeleteMarkers[i]['Key']);
												console.log('VersionId-->' + result.InterfaceResult.DeleteMarkers[i]['VersionId']);
											}
											console.log('\n');
											if(result.InterfaceResult.CommonPrefixes && result.InterfaceResult.CommonPrefixes.length > 0){
												listVersionsByPrefix(result.InterfaceResult.CommonPrefixes);
											}
										}
									});
								}
							};
							
							listVersionsByPrefix(result.InterfaceResult.CommonPrefixes);
						}
					});
				});
				
			}
		});
		
	}
});


var process = require('process');
var deleteVersionsFinished = false;
process.on('beforeExit', (code) => {
	if(!deleteVersionsFinished){
		
		obs.listVersions({
			Bucket: bucketName
		}, (err, result)=>{
			if(!err && result.CommonMsg.Status < 300){
				var keys = [];
				for(let j in result.InterfaceResult.Versions){
					keys.push({Key:result.InterfaceResult.Versions[j]['Key'], VersionId: result.InterfaceResult.Versions[j]['VersionId']});
				}
				for(let i in result.InterfaceResult.DeleteMarkers){
					keys.push({Key:result.InterfaceResult.DeleteMarkers[i]['Key'], VersionId: result.InterfaceResult.DeleteMarkers[i]['VersionId']});
				}
				obs.deleteObjects({
					Bucket: bucketName,
					Objects: keys
				}, (err, result)=>{
					obs.close();
				});
			}
		});
		
		deleteVersionsFinished = true;
	}
});


