const fs = require('fs');
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const fileUpload = require('express-fileupload');
const ObsClient = require('./obs/lib/obs');
const obsExtend = require('./obs/extend');
const Config = require('./config');

mongoose.connect('mongodb://localhost/cty');
mongoose.Promise = Promise;

const http = require('http');
const https = require('https');
const privateKey  = fs.readFileSync(path.join(__dirname, './certificate/private.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, './certificate/file.crt'), 'utf8');
const credentials = {key: privateKey, cert: certificate};  

const httpServer = http.createServer(app);  
const httpsServer = https.createServer(credentials, app);
  
global.obs = new ObsClient();
global.obs.Factory(Config.obs_account);
obsExtend(global.obs);

Config.session.store = new RedisStore(Config.Redis);

app.use(session(Config.session));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static('public'));

app.use("/api", require("./router/authorize"));
app.use("/api", require("./router/common"));
app.use("/api", require("./router/folder"));
app.use("/api", require("./router/photo"));

app.use(function(err, req, res, next) {
  	console.error(err.stack);
  	res.status(500).send('system error');
});

var PORT = 8000;  
var SSLPORT = 443;

//创建http服务器  
httpServer.listen(PORT, function() {  
    console.log('HTTP Server is running on: http://localhost:%s', PORT);  
});  
  
//创建https服务器  
// httpsServer.listen(SSLPORT, function() {  
//     console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);  
// });

process.on('uncaughtException', function (err) {
    console.error('Caught exception: ', err);
})