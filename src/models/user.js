const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Skill = require('../models/skill');


const userSchema = new mongoose.Schema({
  userName:{
      type:String,
      trim:true,
      required : true,
      unique:true
  },
  firstName:{
    type:String,
    trim:true
  },
  lastName:{
    type:String,
    trim:true
  },
  email:{
      type:String,
      unique:true,
      trim:true,
      lowercase:true,
      validate(value){
          if(!validator.isEmail(value)){
              throw new Error('Email is invalid');
          }
      }
  },
  password:{
      type : String,
      minlength:8,
      trim:true
  },
  gender:{
      type:String,
      trim:true,
      validate(value){
          if(! (['male','female','not specific'].includes(value))){
              throw new Error('Error gender');
          }
      }
  },tokens:[
      {
          token:{
              type:String,
              required:true
          } 
      }
  ],
  profilePict:{
      type:Buffer
  },
  backgroundPict:{
      type:Buffer
  },
  messages : [{
         message : {
             text : {
                 type : String,
                 trim : true
             },
             messageType:{
                 type : String,
                 validate(msg){
                     if (msg !=='sent' && msg!=='recieved'){
                         throw new Error("invalid message type")
                     }
                 }
             }
         },
         owner : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'
         }
  }]
},{
    timestamps:true
})



/*
//Setting up relations (Facultative
userSchema.virtual('skills',{
    ref:"Skill",
    localField:"_id",
    foreignField:"owner"
})
*/



userSchema.pre('save',async function(next){
    const user = this;
    if(user.isModified("password")){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

userSchema.pre('remove',function(next){
    const user = this;
    Skill.deleteMany({owner : user._id})
    next();
})


userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id : user._id.toString()},process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    return token;
}


//hide private data ...  monngoose the document to an object 
// before it sends it back with res.send .
userSchema.methods.toJSON =function (){ 
    const user = this
 
    const userObject = user.toObject();
  
    delete userObject.password;   
    delete userObject.tokens;  
    delete userObject.avatar;    

    return userObject   
}

userSchema.statics.findBycredentials = async (email,password)=>{
    const user = await User.findOne({email});
    if(!user){
        throw new Error("Unable to login");
    }
    const ismatch = await bcrypt.compare(password,user.password);
    if(!ismatch){
        throw new Error("Unable to login")
    }

    return user
}


 

const User = mongoose.model('User',userSchema);

module.exports = User;