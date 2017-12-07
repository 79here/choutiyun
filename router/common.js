const axios = require('axios');
const router = require('express').Router();
const config = require('../config.json');
const User = require('../model/user');
const Utils = require('../utils');
const Folder = require('../model/folder');
const Photo = require('../model/photo');
const log4js = require('log4js');
const logger = log4js.getLogger();

router.post('/login', (req, res) => {
	let js_code = req.body.js_code || "013140E71M6GiT1BNuD71aedE71140En";
	let username = req.body.username;
	let img = req.body.img;
	let url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + config.appid + '&secret=' + config.secret +'&js_code=' + js_code + '&grant_type=authorization_code';
	
	logger.info('start login');
	axios.get(url).then(response => {
		let session_key = response.data.session_key;
		let openid = response.data.openid;

        req.session.regenerate(function(err) {
			req.session.session_key = session_key;
			req.session.openid = openid;
			req.session['3rd_session'] = session_key + openid;

			let sessionid = Utils.signature(req.session);

			//用户不存在,则新建用户
			User.findOne({openid: openid}).then(user=>{
				if( !user ){
					(new User({openid:openid, name:username, img:img})).save().then(user=>{
						logger.info('start success openid: ' + openid);
						res.send(sessionid);
					});
				}
				else{
					user.name = username;
					user.img = img;
					user.save().then(()=>{
						console.log(user);
						logger.info('start success openid: ' + openid);
						res.send(sessionid);
					});
				}
			});
		});
        
	}).catch(error => {
		logger.error(error);
    	res.status(500).send(error);
  	});
});

//检查session是否过期
router.post('/checkSession', (req, res) => {
	res.send(!!req.session.openid);
});

router.get("/statistics", (req, res) => {
	let openid = req.session.openid;
	
	logger.info(openid);

	Promise.all([
		Folder.count({userOpenid: openid}),
		Photo.count({userOpenid: openid})
	]).then((counts)=>{
		res.send({
			folderCount: counts[0],
			photoCount: counts[1]
		});
	}).catch(err=>{
		logger.error(err);
		res.status(500).send(error);
	})
});

module.exports = router;