var nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
  //  service: "gmail",
    service: 'Gmail',
    auth: {
      user: process.env.ADMIN, 
      pass: process.env.PASSWORD 
    } 
  }); 

//  "use strict";
// async..await is not allowed in global scope, must use a wrapper
 
/*
    
     const main = async ()=> {
      // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  // create reusable transporter object using the default SMTP transport

  
  try {    
      // send mail with defined trans 

      let info = await transporter.sendMail({
    from: 'dhiaeboudiaf@gmail.com', // sender address
    to: "a.boudiaf@esi-sba.dz", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>" // html body
  }); 


  } catch (error) {
    console.log(error)   
  }
    }
*/
  

  const sendWelcomeEmail = async({email,userName})=>{
    let mailOptions = {
      from : process.env.ADMIN,
      to : email,
      subject : "Hello",
      test : `Hi ${userName}!

      Welcome to Sa9ssini! Thanks so much for joining us. You’re on your way to solve problems and beyond!
      Have any questions? Just shoot us an email! We’re always here to help.
      
      Cheerfully yours,
      
      The Sa9ssini Team`
    };

    let info = await transporter.sendMail(mailOptions)
  }
      
  const sendCancelationEmail = async({email,UserName})=>{

    let mailOptions = {
      from : process.env.ADMIN,
      to : email,
      subject : 'customize later',
      test : `customize later`
    };

    let info = await transporter.sendMail(mailOptions,(err,data)=>{
      if(err){
        console.log(err)
      }else{
        console.log('Email sent : '+data.response);
      }
    })
  }
      


  module.exports = {sendWelcomeEmail,sendCancelationEmail}