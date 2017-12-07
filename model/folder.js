const Photo = require('./photo');
const UserFolderMap = require('./user_folder_map');
const User = require('./user');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FolderSchema = new Schema({
	name: String,
	description: String,
	cover: String,
	owner: Boolean,
	createTime: Date,
	photoCount: Number,
	userOpenid: String,
	ownername: String,
	ownerimg: String,
	shareCount: Number
});

FolderSchema.statics.findDetail = function(id, openid){
	let self = this;
	return new Promise(resolve=>{
		Promise.all([
			self.findById(id),
			Photo.count({folderID: id}),
			UserFolderMap.findOne({folderID:id,  userOpenid:openid}),
			UserFolderMap.findOne({folderID:id,  owner:true})
		]).then((r)=>{
			if( r[0] ){
				r[0].photoCount = r[1];
				r[0].owner = r[2] ? r[2].owner : false;
				r[0].ownerID = r[3] ? r[3].userOpenid : null;

				let ps = [];

				ps.push(
					User.findOne({openid: r[0].ownerID}).then((user)=>{
						r[0].ownername = user.name;
						r[0].ownerimg = user.img;
					})
				)

				
				ps.push(
					UserFolderMap.count({folderID:id}).then((count)=>{
						r[0].shareCount = count - 1;
					})
				)
				

				if( r[0].photoCount ){
					ps.push(
						Photo.findOne({folderID: id}, {}, {sort: '-uploadTime'}).then(photo=>{
							r[0].cover = photo.src;
						})
					)
				}

				Promise.all(ps).then(function(){
					resolve(r[0]);
				});
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