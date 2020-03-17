const express = require('express');
require('./db/mongoose');  //Connect to the database
var passport = require('passport');
//Passport setup for further 
const app = express();
 const userRouter = require('./routers/user');
 const skillRouter = require('./routers/skill');
 const historyRouter = require('./routers/history') 

app.use(express.json()); //Incoming requests are objects ...  function

//Passport init
app.use(passport.initialize());
app.use(passport.session({
    secret:process.env.JWT_SECRET,
    saveUninitialized: true,
    resave: true
  }));
app.use(userRouter);
app.use(skillRouter) 
app.use(historyRouter);

 
module.exports = app; 