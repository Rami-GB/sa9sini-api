const app = require('../src/app');
const request = require('supertest');
const User = require('../src/models/user');
const Skill = require('../src/models/skill')
const {userOneId,userTwoId,userThreeId,setupDatabase,userOne,userTwo,userThree,skillId,skill} = require('../tests/fixtures/db')



//Setting up the database before each unit test
beforeEach(
    setupDatabase
)


//Add skill unit  
//-------------------------------------------------------------------------------
test('Add a skill',async()=>{
    const response = await request(app).post('/skills')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({
    skill : "Skill test",
    description : "skill test description",
    }).expect(201)
    //Assertion about the update of the database
    const skill = await Skill.findById({_id:response.body._id})
    expect(skill).not.toBeNull();
})



//get it's own skills unit
//-------------------------------------------------------------------------------

test('get it"s own skills',async()=>{
    const response = await request(app).get('/skills/me')
    .set("Authorization",`Bearer ${userOne.tokens[0].token}`).send().expect(200)
    //Assertion that the data is valid    checked
    //console.log(response.body)
})


//update skills description unit
//-------------------------------------------------------------------------------

//update your skills description
test('update skill description',async()=>{
    const reponse = await request(app).patch(`/skills/me/${skillId}`)
    .set("Authorization",`Bearer ${userOne.tokens[0].token}`).send(
        {description : "Description updated"}
    ).expect(200)
})

//update other user description failure
test('update other user descrption',async()=>{
    const response = await request(app).patch(`/skills/me/${skillId}`)
    .set("Authorization",`Bearer ${userTwo.tokens[0].token}`).send(
        {description : "Description updated"}
    ).expect(404)
})


//delete skills unit
//-------------------------------------------------------------------------------

//delete it's own skill
test('delete skill',async()=>{
    const response = await request(app).delete(`/skills/${skillId}`)
    .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
    .send().expect(200)

    //check that the database was updated
    const skill  = await Skill.findById({_id:skillId})
    expect(skill).toBeNull()
})

//delete other user skill failure
test('delete skill failure',async()=>{
    const response = await request(app).delete(`/skills/${skillId}`)
    .set("Authorization",`Bearer ${userTwo.tokens[0].token}`)
    .send().expect(404);
})   



//evaluate skills unit
//-------------------------------------------------------------------------------

//evaluate other user skill by id
test('evaluate a skill',async()=>{
    const response = await request(app).patch(`/skills/${skillId}`)
    .set("Authorization",`Bearer ${userTwo.tokens[0].token}`)
    .send({evaluation : 5}).expect(200)
})  


//evaluate your skill failure
test('evaluate a skill',async()=>{
    const response = await request(app).patch(`/skills/${skillId}`)
    .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
    .send({evaluation : 5}).expect(403)
})  



//search skill unit
//-------------------------------------------------------------------------------

//Get skills by name sorted 
test('get skill',async()=>{
    const response = request(app).get('/skills/skill')
    .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
    .send().expect(200)

    //Visualisation ...    checked
})
