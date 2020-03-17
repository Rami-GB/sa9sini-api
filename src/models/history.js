mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    messages : [{
        message : {
            type : String,
            trim : true,
            required : true
        },
        owner : {
            type : String,
            required : true
        },
        status : {
            type : String,
            validate(status){
                if(status !== 'sent' && status !== 'recieved'){
                    throw new Error('Invalid message status')
                }
            }
        }
    }],
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }
})


const History = mongoose.model('History',historySchema);

module.exports = History;