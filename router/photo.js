const router = require('express').Router();
const Photo = require('../model/photo');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const FileCache = require('../fileCache');

//上传照片
router.post('/folders/:id/photos', (req, res) => {
	let photo = req.files.photo;
	let folderID = req.params.id;
	let newPhotoID = mongoose.Types.ObjectId();

	console.log("path" + req.session.openid);

	FileCache.get(req.session.openid, folderID, photo.name).then(sourceFile => {
		photo.mv(sourceFile, function(err) {
		    if (err){
		    	return res.status(500).send(err);
		    }

		    let newPhoto = new Photo({
				_id: newPhotoID,
				name: photo.name,
				folderID: folderID,
				uploadTime: new Date(),
				src: sourceFile.split("public")[1].replace("\\","/"),
				userOpenid: req.session.openid
			});

			newPhoto.save().then((doc)=>res.send(doc));

		    global.obs.upload(newPhotoID + "", sourceFile).then(()=>{
		    	
		    }).catch((err)=>{
		    	console.log("upload " + sourceFile + " error");
		    	// res.status(500).send();
		    });
		});
	});
});

//查看照片
router.get('/folders/:id/photos', (req, res) => {
	Photo.find({folderID: req.params.id}).then((photos)=>{
		Promise.all(
			photos.map((photo) => {
				FileCache.get(req.session.openid, req.params.id, photo.name).then(sourceFile => {
					return new Promise((resolve, reject)=>{
						if( fs.existsSync(sourceFile) ){
							resolve();
						}
						else{
							global.obs.download(photo._id + "", sourceFile).then(()=>resolve());
						}
					})
				});
			})
		).then(() => {
			res.send(photos);
		});
	});
});

//删除照片
router.delete('/folders/:id/photos/:photoId', (req, res) => {
	Photo.delete(req.params.photoId).then((doc)=>{
		FileCache.remove(req.session.openid, req.params.id, doc.name);
		res.send(doc);
	});
});

module.exports = router;