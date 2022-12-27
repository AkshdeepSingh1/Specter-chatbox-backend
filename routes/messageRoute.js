const express = require('express');
const router = express.Router();
const messages = require('../models/MessageModel');

//////////////////////adding a message to the database.

router.post('/addmsg/',async(req,resp)=>{
try{
       const {from,to,message} = req.body;
       const data = await messages.create({
        message:{text:message},
        users:[from,to],
        sender: from,
       });
       if(data)
       return resp.json({msg:"Message added successfully."});
       return resp.json({msg: "Failed to add message to the database."})
}catch(err){
    resp.status(500).send({err:"Internal Server Error",status:false});
}
});

//////////////////////fetching all the messages from the database.
router.post('/getmsg/',async (req,resp)=>{
try{
    const {from, to } = req.body;
    const allMessage = await messages.find({
        users:{
            $all:[from,to],
        },
    }).sort({updated:1});
    const projectMessages = allMessage.map((msg)=>{
        return{
            fromSelf: msg.sender.toString() === from,
            message: msg.message.text,
        };
    });
    resp.json(projectMessages);

}catch(err){
    resp.status(500).send({err:"Internal Server Error",status:false});
}
});







module.exports = router