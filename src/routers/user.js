// Initialisation of npm modules

const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const History = require('../models/history')
const mail = require('../emails/account')
const auth = require('../middlware/auth');

const uploadProfile = require('../middlware/uploadProfile');
const uploadBack = require('../middlware/uploadBack');

//const jimp = require('jimp');

//Basiclly SignIn
router.post('/users',async (req,res)=>{
    const user = new User(req.body);
    const history = new History({
    messages :[{ 
    message : "Welcome",
    status : "recieved",
    owner : "Admin"
    }],
      user : user._id
    })
    try { 
        const token = await user.generateAuthToken(); 
        //Send Welcome Mail
        await user.save(); 
        await history.save()
        mail.sendWelcomeEmail(user)
        res.status(201).send({user,token,history});
      
    } catch (error) {   
        res.status(400).send(error)
    }
})


//Done ...

//Login 
router.post('/users/login',async (req,res)=>{
    try {
        const user = await User.findBycredentials(req.body.email,req.body.password);
        const token = await user.generateAuthToken();
        await user.save();
        res.send({user,token})
    } catch (error) {
    res.status(400).send({error:"Unable to login"})        
    }
})



//Logout
router.post('/users/logout',auth,async (req,res)=>{

    try{
        // We did not pop the last element because we may login with multiple devices

        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send(req.user) 
    }catch(e){
        res.status(500).send()
    }
})


router.post('/users/logoutAll',auth,async (req,res)=>{
    try {
        req.user.tokens = [];
                await req.user.save()
                res.send(req.user).status(200) 
    } catch (error) {
        res.status(500).send()
    }
})


//get your profile
router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user).status(200);
})


//get other user profile
router.get('/users/:id',auth,async (req,res)=>{
    try {
        const user = await User.findById({_id:req.params.id})
        if(!user){res.status(404).send("User not found")}
        res.send(user)
    } catch (error) {
        res.status(500).send()
    }

})



 

//Delete your profile 
router.delete('/users/me',auth,async(req,res)=>{
    try {
        await req.user.remove();
        //Send cancelation email
        mail.sendCancelationEmail(req.user)   
        res.send(req.user);
    } catch (error) {
        res.status(500).send()
        
    }
})




//Update user
//Note : pictures are updated in diffrent routes
router.patch('/users/me',auth,async(req,res)=>{
    const updates = Object.keys(req.body);
    
    const allowedUpdates =
     ["userName","email","password","gender","lastName","firstName"];
     const allowed = updates.every((update)=>allowedUpdates.includes(update));
     //allowed true if every update is included in the allowedUpdates arr

     if(!allowed){return res.status(400).send({error : "Invalid updates"})}

     try {
         updates.forEach((update)=>req.user[update] = req.body[update])         
         await req.user.save();
         res.send(req.user)
     } catch (error) {
         res.status(500).send()
     }

})






//Handling the profilePicture

router.post('/users/me/profilePicture',auth,uploadProfile.single('profilePicture'),async (req,res)=>{
  req.user.profilePict = req.file.buffer

        //Image manipulations suivant les requets de designer
        //Barebone setup
/*
 const image = await Jimp.read(req.file.buffer);
    image.resize(250,250)
    req.user.profilePict = await image.getBufferAsync(Jimp.MIME_PNG);
    await req.user.save()
*/



    await req.user.save()
    res.send()

},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
    next()
})

//Update profilePicture
router.patch('/users/me/profilePicture',auth,uploadProfile.single('profilePicture'),async (req,res)=>{
    req.user.profilePict = req.file.buffer;
     //Image manipulations suivant les requets de designer
        //Barebone setup
/*
 const image = await Jimp.read(req.file.buffer);
    image.resize(250,250)
    req.user.profilePict = await image.getBufferAsync(Jimp.MIME_PNG);
    await req.user.save()
*/

await req.user.save()
res.send({pict:req.user.profilePict})

},(error,req,res,next)=>{
res.status(400).send({error:error.message})
next()
})


//Handling the background picture

router.post('/users/me/backgroundPicture',auth,uploadBack.single('backgroundPicture'),async (req,res)=>{
    req.user.backgroundPict = req.file.buffer;
    
       //Image manipulations suivant les requets de designer
        //Barebone setup
/*
 const image = await Jimp.read(req.file.buffer);
    image.resize(250,250)
    req.user.profilePict = await image.getBufferAsync(Jimp.MIME_PNG);
    await req.user.save()
*/

    await req.user.save();
    res.send();
  

},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
    next();
})

router.patch('/users/me/backgroundPicture',auth,uploadBack.single('backgroundPicture'),async (req,res)=>{
    req.user.backgroundPict = req.file.buffer;
    
       //Image manipulations suivant les requets de designer
        //Barebone setup
/*
 const image = await Jimp.read(req.file.buffer);
    image.resize(250,250)
    req.user.profilePict = await image.getBufferAsync(Jimp.MIME_PNG);
    await req.user.save()
*/

    await req.user.save();
    res.send();
  

},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
    next();
})


//add message 

router.patch('/users/chat')


















































































































































//////////////////////////////////////////////////////////////////////////////////
   //Handling facebook authentification
// a choisir

/*
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });
  
      passport.use(new FacebookStrategy({
        clientID: 917604792030025,
        clientSecret: "766efd2385668cee64db73d335a3e14b",
        callbackURL: '/auth/facebook/callback'
      },
      async (accessToken, refreshToken, profile, done)=> {
          try {
            const user = await User.findOne({ 'facebook.id' : profile.id });
            if(user){ return done(null,user)};
            const newUser = new User();
            newUser.facebook.id = profile.id;
            newUser.facebook.token = accessToken;
            newUser.tokens.push(accessToken);            
            newUser.facebook.name  = profile.displayName;
            if(typeof profile.emails != 'undefined' && profile.emails.length > 0){
                newUser.email = profile.emails[0].value;
                newUser.facebook.email = profile.emails[0].value;
            }

            newUser.userName = profile.displayName;
            await newUser.save();
            return done(null,newUser)
          } catch (error) {
             done(error) 
          }

      }));


router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }),(req,res)=>{
                                          res.send(req.user)
                                      });
 
        
*/

//Github strategy        ...The rest after decision

/*
passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/github/callback"
},
async (accessToken, refreshToken, profile, done)=> {
    try {
      const user = await User.findOne({ 'facebook.id' : profile.id });
      if(user){ return done(null,user)};
      const newUser = new User();
      newUser.github.id = profile.id;
      newUser.github.token = accessToken;
      newUser.tokens.push(accessToken);            
      newUser.github.name  = profile.displayName;
      if(typeof profile.emails != 'undefined' && profile.emails.length > 0){
          newUser.email = profile.emails[0].value;
          newUser.github.email = profile.emails[0].value;
      }

      newUser.userName = profile.displayName;
      await newUser.save();
      return done(null,newUser)
    } catch (error) {
       done(error) 
    }

}));
 
router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }),(req,res)=>{
                                          res.send(req.user)
                                      });
 
        
*/

//End of documentation
//////////////////////////////////////////////////////////////////////////////////


module.exports = router;







































































































































































