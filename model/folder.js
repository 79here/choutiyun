const Photo = require('./photo');
const UserFolderMap = require('./user_folder_map');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FolderSchema = new Schema({
	name: String,
	description: String,
	cover: String,
	owner: Boolean,
	createTime: Date,
	photoCount: Number,
	userOpenid: String
});

FolderSchema.statics.findDetail = function(id, openid){
	let self = this;
	return new Promise(resolve=>{
		Promise.all([
			self.findById(id),
			Photo.count({folderID: id}),
			UserFolderMap.findOne({folderID:id,  userOpenid:openid})
		]).then((r)=>{
			if( r[0] ){
				r[0].photoCount = r[1];
				r[0].owner = r[2] ? r[2].owner : false;
				resolve(r[0]);
			}
			else{
				resolve();	
			}
		}).catch(err => {
			console.log(err);
			reject(err);
		})
	});
}

const Folder = mongoose.model('Folder', FolderSchema);

module.exports = Folder;