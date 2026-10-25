 const mongoose = require('mongoose');
 
 const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DATABASE NAME:", mongoose.connection.name);
        console.log('MongoDb connected SuccessFully');
        console.log(
  "MONGO HOST:",
  mongoose.connection.host,
  "PORT:",
  mongoose.connection.port
);
    }
    catch(error){
        console.log('MongoDB connection failed');
        console.log(error.message);
    }
 }

 module.exports = connectDB;