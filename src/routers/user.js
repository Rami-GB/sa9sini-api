// Initialisation of npm modules
const { join } = require('path');
const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const History = require('../models/history')
const mail = require('../emails/account')
const auth = require('../middlware/auth');
const sharp = require('sharp');


const uploadPhoto = require('../middlware/uploadPhoto');

//const jimp = require('jimp');

//Basiclly SignUn
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    const profileDist = join(__dirname, '../helpers/default_avatar.jpg')
    const backgroundDist = join(__dirname, '../helpers/background.jpeg')

    user.imgUrl = `/users/${user._id}/profilePicture`;
    user.backgroundUrl = `/users/${user._id}/backgroundPicture`;


    user.profilePict = await sharp(profileDist)
        .resize(250, 250)
        .jpeg()
        .toBuffer()
    user.backgroundPict = await sharp(backgroundDist)
        .jpeg()
        .toBuffer()

    // const history = new History({
    //     messages: [{
    //         message: "Welcome",
    //         status: "recieved",
    //         owner: "Admin"
    //     }],
    //     user: user._id
    // })

    try {
        const token = await user.generateAuthToken();
        //Send Welcome Mail
        await user.save();
        //await history.save()
        //mail.sendWelcomeEmail(user)
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error)
    }
})


//Done ...

//Login 
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findBycredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        await user.save();
        res.send({ user, token })
    } catch (error) {
        res.status(400).send({ error: "Unable to login" })
    }
})



//Logout
router.post('/users/logout', auth, async (req, res) => {

    try {
        // We did not pop the last element because we may login with multiple devices

        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})


router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send(req.user);
    } catch (error) {
        res.status(500).send()
    }
})


//get your profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})


//get other user profile
router.get('/users/:id', auth, async (req, res) => {
    try {
        const user = await User.findById({ _id: req.params.id },
            { userName: 1, email: 1, password: 1, gender: 1, tokens: 1, createdAt: 1, updatedAt: 1, imgUrl: 1, backgroundUrl: 1 });

        if (!user) { res.status(404).send("User not found") }
        res.send(user)
    } catch (error) {
        res.status(500).send()
    }

})





//Delete your profile 
router.delete('/users/me', auth, async (req, res) => {
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
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);

    const allowedUpdates =
        ["userName", "email", "password", "gender"];
    const allowed = updates.every((update) => allowedUpdates.includes(update));
    //allowed true if every update is included in the allowedUpdates arr

    if (!allowed) { return res.status(400).send({ error: "Invalid updates" }) }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save();
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }

})






//Handling the profilePicture

router.post('/users/me/profilePicture', auth, uploadPhoto.single('profilePicture'), async (req, res) => {
    req.user.profilePict = await sharp(req.file.buffer).resize(250, 250).jpeg().toBuffer();

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

}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
    next();
})

//Update profilePicture
router.patch('/users/me/profilePicture', auth, uploadPhoto.single('profilePicture'), async (req, res) => {
    req.user.profilePict = await sharp(req.file.buffer).resize(250, 250).jpeg().toBuffer();
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

}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
    next();
})


//GET my own profile Picture
router.get('/users/me/profilePicture', auth, async (req, res) => {
    const { profilePict } = await User.findOne({ _id: req.user._id }, { profilePict: 1 });

    if (!profilePict) return res.status(404).send();

    res.set('Content-Type', 'image/jpeg');
    res.send(profilePict);
})

//GET others profile Picture
router.get('/users/:id/profilePicture', auth, async (req, res) => {
    const { profilePict } = await User.findOne({ _id: req.params.id }, { profilePict: 1 });

    if (!profilePict) return res.status(404).send();

    res.set('Content-Type', 'image/jpeg');
    res.send(profilePict);
})


//Handling the background picture

router.post('/users/me/backgroundPicture', auth, uploadPhoto.single('backgroundPicture'), async (req, res) => {
    req.user.backgroundPict = await sharp(req.file.buffer).jpeg().toBuffer();

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


}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
    next();
})

router.patch('/users/me/backgroundPicture', auth, uploadPhoto.single('backgroundPicture'), async (req, res) => {
    req.user.backgroundPict = await sharp(req.file.buffer).jpeg().toBuffer();

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


}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
    next();
})

//get my own backgound pic
router.get('/users/me/backgroundPicture', auth, async (req, res) => {
    const { backgroundPict } = await User.findOne({ _id: req.user._id }, { backgroundPict: 1 });

    if (!backgroundPict) return res.status(404).send();

    res.set('Content-Type', 'image/jpeg');
    res.send(backgroundPict);
})

//get others backgound pic
router.get('/users/:id/backgroundPicture', auth, async (req, res) => {
    const { backgroundPict } = await User.findOne({ _id: req.params.id }, { backgroundPict: 1 });

    if (!backgroundPict) return res.status(404).send();

    res.set('Content-Type', 'image/jpeg');
    res.send(backgroundPict);
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







































































































































































