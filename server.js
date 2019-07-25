const express = require('express')
const app = express()
const uuidv1 = require('uuid/v1')
const mongo = require('mongodb')
const mongoClient = mongo.MongoClient
const bodyParser = require('body-parser')
let db 

const session = require('./common/session')
const userController = require("./controllers/users")
const applicationController = require('./controllers/applications')
const logController = require('./controllers/logs/log')
const environmentController = require('./controllers/logs/environment')
const versionController = require('./controllers/logs/version')

// session.clearSessionId()
require("./db").init().then(_ => {
    app.post('/register',userController.register)
    app.post('/login', userController.login)
    app.post('/loginOut',userController.loginOut)
    app.post('/modifyPassword',userController.modifyPassword)
    
    app.post('/createApp',applicationController.createApp)
    app.delete('/deleteApp', applicationController.deleteApp)
    app.post('/modifyAppName', applicationController.modifyAppName)
    app.get('/queryAppList', applicationController.queryAppList)
    app.post('/modifyDomainNames', applicationController.modifyDomainNames)

    app.post('/insertLogs', logController.insertLogs)
    app.get('/queryLogs', logController.queryLogs)

    app.get('/switchEnvironment', environmentController.switchEnvironment)
    app.post('/modifyEnvironment', environmentController.modifyEnvironment)
    app.delete('/deleteEnvironment', environmentController.deleteEnvironment)
    app.get('/queryEnvironment', environmentController.queryEnvironment)

    app.get('/queryVersion', versionController.queryVersion)
})

app.listen(1111,()=>{
    console.log('Listening on port 1111')
})


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    next();
});
// app.use(session.getCookieParser())











