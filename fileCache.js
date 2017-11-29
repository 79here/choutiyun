const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const rmdir = require('rmdir');

const cachePath = path.join(__dirname, './public/cache');

module.exports = {
	get: function(openid, folderID, photo){
		return new Promise((resolve, reject) => {
			let folderPath = cachePath + "/" + openid + "/" + folderID;

			if ( fs.existsSync(folderPath) ){
			    resolve(folderPath + "/" + photo);
			}
			else{
				mkdirp(folderPath , function (err) {
					if( err ){
						reject(err);
					}
					else{
						resolve(folderPath + "/" + photo);
					}
				});
			}
		});
  	},

  	remove: function(openid, folderID, photo){
  		return new Promise((resolve, reject) => {
  			let folderPath = cachePath + "/" + openid + "/" + folderID;
  			if( photo ){
  				folderPath = folderPath + "/" + photo;
				if ( fs.existsSync(folderPath + "/" + photo) ){
				  	fs.unlink(folderPath, function (err) {
				        if (err) {
				            reject(err);
				        } 
				        else {
				            resolve(folderPath);
				        }
				    });
				}
				else{
					resolve("empty");
				}
			}
			else{
				rmdir(folderPath, function (err, dirs, files) {
					if (err) {
			           reject(err);
			        } 
			        else {
			           resolve(folderPath);
			        }
				});
			}
		});
  	}
}