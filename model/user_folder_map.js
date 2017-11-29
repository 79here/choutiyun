const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserFolderMapSchema = new Schema({
	folderID: Schema.Types.ObjectId,
	userOpenid: String,
	owner: Boolean
});

const UserFolderMap = mongoose.model('UserFolderMap', UserFolderMapSchema);

module.exports = UserFolderMap;