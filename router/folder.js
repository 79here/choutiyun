const router = require('express').Router();
const Folder = require('../model/folder');
const Photo = require('../model/photo');
const User = require('../model/user');
const UserFolderMap = require('../model/user_folder_map');
const FileCache = require('../fileCache');

//查询文件夹列表
router.get('/folders', (req, res) => {
	let qc = {userOpenid: req.session.openid};
	
	UserFolderMap.find({userOpenid:req.session.openid}).then((maps)=>{
		Promise.all(maps.map(e => Folder.findDetail(e.folderID, req.session.openid))).then(folders => {
			if( req.query.type === 'share' ){
				folders = folders.filter((folder) => folder.owner === false);
			}
			else if( req.query.type === 'owner' ){
				folders = folders.filter((folder) => folder.owner === true);
			}

			if( req.query.name ){
				folders = folders.filter((folder) => folder.name.indexOf(req.query.name) !== -1);
			}

			res.send(folders);
		});
	});
});

//查询单个文件夹
router.get('/folders/:id', (req, res) => {
	Folder.findById(req.params.id).then((folder)=>{
		if( folder ){
			UserFolderMap.find({folderID:req.params.id,  userOpenid:req.session.openid}).then(doc => {
				//分享
				if( doc.length === 0 ){
					let userFolderMap = new UserFolderMap({
						folderID: req.params.id,
						userOpenid: req.session.openid,
						owner: false
					});
					userFolderMap.save().then( () => {
						Folder.findDetail(req.params.id, req.session.openid).then(doc => {
							res.send(doc);
						});
					});
				}
				else{
					Folder.findDetail(req.params.id, req.session.openid).then(doc => {
						res.send(doc);
					});
				}
			});
		}
		else{
			//该相册不存在
			res.send("404");
		}
	});
});

//删除文件夹
router.delete('/folders/:id', (req, res) => {
	let folderID = req.params.id;

	Photo.find({folderID: folderID}).then((photos)=>{
		let promises = [];

		promises = promises.concat(photos.map((photo)=>Photo.delete(photo._id)));

		promises.push(UserFolderMap.remove({folderID: folderID}));

		promises.push(Folder.findByIdAndRemove(folderID));

		FileCache.remove(req.session.openid, req.params.id);
		
		Promise.all(promises).then(() => res.send());
	});
});

//创建文件夹
router.post('/folders', (req, res) => {
	let folder = new Folder(req.body);
	folder.createTime = new Date();
	folder.userOpenid = req.session.openid;
	let randomCover = Math.floor(Math.random()*2);
	folder.cover = '/cover/timg-' + randomCover + '.png';
	folder.save().then(newFolder => {
		let userFolderMap = new UserFolderMap({
			folderID: newFolder._id,
			userOpenid: req.session.openid,
			owner: true
		});
		userFolderMap.save().then(() => res.send(newFolder));
	});
});

//修改文件夹
router.put('/folders/:id', (req, res) => {
	Folder.findByIdAndUpdate(req.params.id, {$set: req.body}).then(doc => {
		res.send(doc);
	});
});

module.exports = router;