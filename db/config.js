const mongoose = require('mongoose');
require("dotenv").config();
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log(`db connection succesfully on ${process.env.MONGO_URL}`);
}).catch((err)=>{
    console.log(err);
});