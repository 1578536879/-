const mongo = require('mongodb')
const mongoClient = mongo.MongoClient

let db

exports.init = function(){
    let url = "mongodb://127.0.0.1:27017"
    return new Promise((resolve, reject) => {
        mongoClient.connect(url,{useNewUrlParser: true},function(err,res){
            if(err){
                console.log(err)
                reject(err)
                return 
            }
            db = res.db('loggingSystem')
            resolve(db)
        })
    })
}

exports.getDB = function(){
    return db
}