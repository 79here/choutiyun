const axios = require('axios');
const router = require('express').Router();
const config = require('../config.json');
const User = require('../model/user');
const Utils = require('../utils');
const Folder = require('../model/folder');
const Photo = require('../model/photo');

router.post('/login', (req, res) => {
	let js_code = req.body.js_code || "013140E71M6GiT1BNuD71aedE71140En";
	let url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + config.appid + '&secret=' + config.secret +'&js_code=' + js_code + '&grant_type=authorization_code';
	
	axios.get(url).then(response => {
		let session_key = response.data.session_key;
		let openid = response.data.openid;

        req.session.regenerate(function(err) {
			req.session.session_key = session_key;
			req.session.openid = openid;
			req.session['3rd_session'] = session_key + openid;

			let sessionid = Utils.signature(req.session);

			//用户不存在,则新建用户
			User.find({openid: openid}).then(users=>{
				if( users.length === 0 ){
					(new User({openid: openid})).save().then(user=>{
						res.send(sessionid);
					});
				}
				else{
					res.send(sessionid);
				}
			});
		});
        
	}).catch(error => {
		console.log(error);
    	res.status(500).send(error);
  	});
});

router.get("/statistics", (req, res) => {
	let openid = req.session.openid;

	Promise.all(
		Folder.count({userOpenid: openid}),
		Photo.count({userOpenid: openid})
	).then((counts)=>{
		res.send({
			folderCount: counts[0],
			photoCount: counts[1]
		});
	});
});

module.exports = router;