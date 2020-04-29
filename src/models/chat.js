mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    message: String,
    owner: {
        _id: mongoose.Types.ObjectId,
        UserName: String,
        imgUrl: String
    },
    receiver: {
        _id: mongoose.Types.ObjectId,
        UserName: String,
        imgUrl: String
    }
},{
    timestamps: true
})



const Chat = mongoose.model('Chat', historySchema);
module.exports = Chat;