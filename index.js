const express = require('express');
const app = express();
const socket = require('socket.io');
const  cors = require('cors');
require('./db/config')                //Connecting with the database
require("dotenv").config();

app.use(cors());
app.use(express.json());


app.use("/api/auth",require('./routes/auth'));
app.use("/api/messages",require('./routes/messageRoute'));

const server = app.listen(process.env.PORT,()=>{
    console.log(`server Started no Port-${process.env.PORT}`);
});

const io = socket(server,{
    cors:{
        origin:"http://localhost:3000",
        credentials: true,
    },
})

global.onlineUsers = new Map();

io.on("connection",(socket)=>{
    global.chatSocket = socket;
    socket.on("add-user",(userId)=>{
        console.log('connected to socket with id',socket.id)
        onlineUsers.set(userId, socket.id);
    })


    socket.on('send-msg',(data)=>{
        const sendUserSocket = onlineUsers.get(data.to);
    console.log("sendusersocket",sendUserSocket);
        if(sendUserSocket){
            socket.to(sendUserSocket).emit('msg-recieve', data.message, data.from)
        }
    })
})