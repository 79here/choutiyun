const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PhotoSchema = new Schema({
	name: String,
	folderID: Schema.Types.ObjectId,
	uploadTime: Date,
	src: String,
	thumbnai: String,
	userOpenid: String
});

PhotoSchema.statics.delete = function(photoID){
	let PhotoModel = this;
	return new Promise((resolve, reject)=>{
		global.obs.delete(photoID).then(() =>{
			PhotoModel.findByIdAndRemove(photoID).then((doc) => resolve(doc));
		}).catch(err => {
			reject(err);
		});
	});
}

const Photo = mongoose.model('Photo', PhotoSchema);

module.exports = Photo;