const cookie = require('cookie');
const signature = require('cookie-signature');
const gm = require('gm');

module.exports = {
	signature: function(session){
  		let signed = 's:' + signature.sign(session.id, 'keyboard cat');
  		return cookie.serialize('connect.sid', signed, session.cookie.data).replace('connect.sid=','');
  	},
  	gm: function(srcpath, thumbnaipath){
  		return new Promise((resolve, reject)=>{
	  		gm(srcpath).resize(240, 240).write(thumbnaipath, function (err) {
			  	if (!err) {
			  		resolve();
			  	}
			  	else{
			  		reject(err);
			  	}
			})
  		});
	}
}