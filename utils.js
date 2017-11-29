var cookie = require('cookie');
var signature = require('cookie-signature');

module.exports = {
	signature: function(session){
  		let signed = 's:' + signature.sign(session.id, 'keyboard cat');
  		return cookie.serialize('connect.sid', signed, session.cookie.data).replace('connect.sid=','');
  	}
}