const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const user = require('../models/User');

//////////////////////creating a new user
router.post('/createuser',async (req, resp) => {

    //Finding if the user exists in the database or not

    try{
    let a = await user.findOne({email:req.body.email})
   if(a){
    return resp.status(400).json({error:"sorry the email already exists",status:false})
   }
   const codedpass = await bcrypt.hashSync(req.body.password, 10);
     let newUser = new user({
        username: req.body.username,
        email:req.body.email,
        password: codedpass,
      })
      
      newUser=await newUser.save()
      newUser = newUser.toObject();
      delete newUser.password;
      console.log(newUser);
      resp.json({newUser,status:true})
    } catch(err){
       resp.status(500).send({err:"Internal Server Error",status:false});
    }     
      //.then(user => resp.json(user)).catch(err=> resp.json({error: "please enter a unique value for email"}));
})



//////////////////////Logging in a new user
router.post('/login',async (req, resp) => {

  //Finding if the user exists in the database or not

  try{
  let existingUser = await user.findOne({email:req.body.email})
 if(!existingUser){
  return resp.status(400).json({error:"Please check your email or password",status:false})
 }
 const isPasswordValid = bcrypt.compareSync(req.body.password , existingUser.password);
    if(!isPasswordValid){
      return resp.status(400).json({error:"Please check your email or password",status:false})
    }
    existingUser = existingUser.toObject();
    delete existingUser.password
  
    console.log(existingUser);
    resp.json({existingUser,status:true})
  } catch(err){
     resp.status(500).send({err:"Internal Server Error",status:false});
  }     
    //.then(user => resp.json(user)).catch(err=> resp.json({error: "please enter a unique value for email"}));
})



//////////Setting avatar of the specific User.

router.post('/setAvatar/:id',async (req,resp)=>{
try{
const userId = req.params.id;
const avatarImage = req.body.image;
const userData= await user.findByIdAndUpdate(userId,{
  isAvatarImageSet:true,
  avatarImage:avatarImage
})
console.log(userData);
return resp.json({
  isSet: userData.isAvatarImageSet,
  image: userData.avatarImage}
  );
}
catch(err)
{
  resp.status(500).send({err:err,status:false});
}
});


//////////////////////fetching all users form the database

router.get('/allusers/:id',async(req,resp)=>{
  try{
const users = await user.find({_id:{$ne:req.params.id}}).select([
  "email","username","avatarImage","_id"
]);
resp.json(users);
  }catch(err){
    resp.status(500).send({err:err,status:false});
  }
})


//////////////////////////
module.exports = router