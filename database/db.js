require('dotenv').config()
const mongoose = require("mongoose");
const user = process.env.Db;
const db = process.env.PASS;
const connectToDb =()=>{
mongoose.connect(

        `mongodb+srv://${user}:${db}@todolist.icorwkf.mongodb.net/?retryWrites=true&w=majority`
        
    ).then(()=> console.log("MongoDb atlas conectado")).catch((err)=>console.log(err));
 };

 module.exports = connectToDb;