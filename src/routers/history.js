const express = require('express');
const router = new express.Router();
const History = require('../models/history');
const auth = require('../middlware/auth');


//Add a message
//Recieved data from reques is {message,type,owner}


//Add message to chat history

router.patch('/chat', auth, async (req, res) => {

  try {

    let history = await History.findOne({ user: req.user._id });
    const message = req.body
    console.log(message)
    history.messages.push(message)
    await history.save()
    res.send(history)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})


//Remove message from chat history

router.patch('/chat/:id', auth, async (req, res) => {
  let history = await History.findOne({ user: req.user._id });



  //From his history only
  //Add other users message delete    ..Another feature

  try {
    const index = history.messages.findIndex((el) => el._id.equals(req.params.id))
    history.messages.splice(index, 1)
    await history.save()
    res.send(history)
  } catch (error) {
    res.status(500).send(error)
  }

})



//Get users all users chat history
router.get('/chat', auth, async (req, res) => {
  try {
    let history = await History.findOne({ user: req.user._id });
    res.send(history)
  } catch (error) {
    res.status(500).send()
  }
})







































module.exports = router;