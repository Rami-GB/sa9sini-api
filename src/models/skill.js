mongoose = require('mongoose');


const skillSchema = new mongoose.Schema({



    skill:{
        type : String,
        trim : true,
        required : true
    },
    nbrEvaluations:{
        type :Number
    },
    evaluation : {
        type : Number,
    },
    description : {
        type : String,
        trim : true,
        required : true
    },
    owner :{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    }
},{
    timestamps : true
})

const Skill= mongoose.model('Skill',skillSchema)

module.exports = Skill;