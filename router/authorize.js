const router = require('express').Router();
const config = require('../config.json');

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
			res.status(500).send("please login");
		}
	}
});

module.exports = router;