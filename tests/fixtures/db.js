const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Skill = require('../../src/models/skill')


const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();
const userThreeId = new mongoose.Types.ObjectId();
const skillId = new mongoose.Types.ObjectId();

const userOne = {
    _id: userOneId,
    userName: "userOne",
    email: "dhiaeboudiaf@gmail.com",
    password: "mypass28",
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

const userTwo = {
    _id: userTwoId,
    userName: "userTwo",
    email: "anistifon@gmail.com",
    password: "mypass28",
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }, {
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }, {
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
}


const userThree = {
    _id: userThreeId,
    userName: "userThree",
    email: "a.boudiaf@esi-sba.dz",
    password: "mypass28",
    tokens: [{
        token: jwt.sign({ _id: userThreeId }, process.env.JWT_SECRET)
    }]
}


const skill = {
    _id: skillId,
    skill: "Skill",
    description: "skill description",
    owner: {
        _id: userOneId,
        userName: userOne.userName
    },
    evaluation: 0,
    nbrEvaluations: 0
}

const setupDatabase = async () => {
    await User.deleteMany();
    await Skill.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new User(userThree).save();
    await new Skill(skill).save()
}



module.exports = { userOneId, userTwoId, userThreeId, setupDatabase, userOne, userTwo, userThree, skillId }