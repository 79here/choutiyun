//封装OBS SDK原有功能
module.exports = function(obs){
	//TODO 桶映射管理
	obs.getBucket = function(){
		return 'obs-ucd-test';
	}

	//上传文件到OBS
	obs.upload = function(key, sourceFile){
		return new Promise((resolve, reject) => {
			let baseConfig = {
				Bucket: obs.getBucket(),
				Key: key
			};

			obs.initiateMultipartUpload(baseConfig, (err, result) => {
				if( err || result.CommonMsg.Status >= 300 ){
					return reject(err);
				}
				
				let uploadId = result.InterfaceResult.UploadId;
					
				obs.uploadPart(Object.assign({
					UploadId: uploadId,
					PartNumber : 1,
					SourceFile : sourceFile
				}, baseConfig), (err, result) => {
					if( err || result.CommonMsg.Status >= 300 ){
						return reject(err);
					}
					
					obs.completeMultipartUpload(Object.assign({
						UploadId: uploadId,
						Parts : [{PartNumber : 1, ETag: result.InterfaceResult.ETag}]
					}, baseConfig), (err, result) => {
						if( err || result.CommonMsg.Status >= 300 ){
							return reject(err);
						}

						console.log('upload ' + key + '  finished.\n');
						resolve();
					});				
				});
			});
		});
	}

	//下载文件到本地
	obs.download = function(key, destFile){
		return new Promise((resolve, reject) => {
			obs.getObject({
				Bucket: obs.getBucket(),
				Key: key,
				SaveAsFile: destFile
			}, (err, result) => {
				if( err || result.CommonMsg.Status >= 300 ){
					return reject();
				}

				console.log('download ' + key + ' finished.\n');
				resolve();
			});	
		});
	}

	//删除单个文件
	obs.delete = function(key){
		return new Promise((resolve, reject) => {
			obs.deleteObjects({
				Bucket: obs.getBucket(),
				Quiet: false,
				Objects: [{Key: key}]
			}, (err, result)=> {
				if(err || result.CommonMsg.Status >= 300){
					return reject(err);
				}

				console.log('delete file:' + key + ' finished.\n');
				resolve();
			});
		});
	}

	return obs;
}