const router = require('express').Router();
const config = require('../config.json');
const log4js = require('log4js');
const logger = log4js.getLogger();

router.all('/*', (req, res, next) => {
	if( config.disableAuthorize ){
		return next();
	}

	if( req.url.indexOf('login') !== -1 ){
		next();
	}
	else{
		if( req.session.openid ){
			next();
		}
		else{
			logger.error("not login");
			res.status(500).send("please login");
		}
	}
});

module.exports = router;