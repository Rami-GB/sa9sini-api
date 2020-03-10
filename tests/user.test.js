const app = require('../src/app');
const request = require('supertest');
const User = require('../src/models/user');
const {userOneId,userTwoId,userThreeId,setupDatabase,userOne,userTwo,userThree} = require('../tests/fixtures/db')


//Setting up the database before each unit test
beforeEach(
    setupDatabase
)
 

//Testing the signup unit
//----------------------------------------------------------

test('Signup a new user',async()=>{
    const usertest = {
        userName :"Test UserName",
        email : "test@gmail.com",
        password : "testHashed"
    }
    const response = await request(app).post('/users').send(usertest).expect(201);
  

    //Assert that the database was updated
const user = await User.findById(response.body.user._id)
expect(user).not.toBeNull();

//Assertion about the response
expect(response.body).toMatchObject({
    user:{
        userName : "Test UserName",
        email: "test@gmail.com",
    },
    token:user.tokens[0].token
})
   expect(user.password).not.toBe("AnisBoudiaf");
})
 

//testing the login unit
//----------------------------------------------------------

//Login 

test('login a user',async()=>{
    const response = await request(app).post('/users/login').send({
        email : userOne.email,
        password : userOne.password
    }).expect(200);

    const user = await User.findById(response.body.user._id)

    //Assert that the token generated matches the second token
    //stored in the user tokens arr
    expect(user.tokens[1].token).toBe(response.body.token);
})


//Login fails
test('login failure',async ()=>{
    await request(app).post('/users/login').send({
        email : "failed@gmail.com",
        password : "randomizeOOO"
    }).expect(400);
})







//testing the logout unit
//----------------------------------------------------------

test('simple logout',async()=>{
    const response = await request(app).post('/users/logout')
    .set("Authorization",`Bearer ${userOne.tokens[0].token}`).send().expect(200)
    
    const user = await User.findById({_id:response.body._id})
    //assertion that the database is updated 
    expect(user.tokens.length).toEqual(0);
})



test('logout all',async()=>{
        const response = await request(app).post('/users/logoutAll')
        .set("Authorization",`Bearer ${userTwo.tokens[0].token}`).send().expect(200);

    //assertion that the database is updated
    const user = await User.findById({_id:response.body._id})
    expect(user.tokens.length).toEqual(0);    
})





//testing the getUser unit
//----------------------------------------------------------
 
//get authenticated user                ...Your profile
test('get authenticated user',async()=>{
    await request(app).get('/users/me').set(
     "Authorization",`Bearer ${userOne.tokens[0].token}`
 ).send().expect(200)
})

//authentication failure
test('shouldn"t get unauthenticated user',async()=>{
   await request(app).get('/users/me').set(
   "Authorization",`Bearer notoken` 
 ).send().expect(401)
})


//Get other user profile

test('get other user profile',async()=>{
  const response = await request(app).get(`/users/${userTwoId}`)
  .set(
    "Authorization",`Bearer ${userOne.tokens[0].token}` 
  ).send().expect(200);
  //assertion that we get the right user
  expect(response.body.email).toBe(userTwo.email);   //The email is unique valide test
})


//Get other user profile failure
test('get other user profile failure',async()=>{
 const response = await request(app).get(`/users/invalidId`)
 .set( "Authorization",`Bearer ${userOne.tokens[0].token}` ).expect(500);
})







//testing the delete unit
//----------------------------------------------------------
test('delete authenticated user',async()=>{
    const response = await request(app).delete('/users/me') 
    .set("Authorization",`Bearer ${userOne.tokens[0].token}`).send().expect(200)
   
   //Assertion about database update
    const user = await User.findById(userOneId)
    expect(user).toBeNull()

})

test('unable to delete unauthenticated user',async()=>{
    await request(app).delete('/users/me') 
    .set("Authorization",`Bea`).send().expect(401)
})
 


//testing the Update unit
//----------------------------------------------------------

//update your profile
test('update your profile',async()=>{
    const response = await request(app).patch('/users/me').send({
        userName : "UserName updated",
        email : "emailupdated@mail.com",
    }).set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .expect(200)
    //Assertion database updated
    const user = await User.findById({_id:response.body._id})
    expect(user).toMatchObject({
        userName : "UserName updated",
        email : "emailupdated@mail.com",
    })
})



//update profile failed

test('update profile failed',async()=>{
    const response = await request(app).patch('/users/me').send({
       _id : "objectUpdated"      //Not allowed executed first
    }).set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .expect(400)
})



//testing the upload of image unit
//----------------------------------------------------------

test('Upload a profilePicture',async()=>{
    await request(app).post('/users/me/profilePicture')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .attach('profilePicture','tests/fixtures/test-pic.jpg')
    .expect(200)
    
    //assert that the profilePicture was stored properly
    const user = await User.findById(userOneId)
    expect(user.profilePict).toEqual(expect.any(Buffer))
})
 




test('Upload a background picture',async()=>{
    const response = await request(app).post('/users/me/backgroundPicture')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .attach('backgroundPicture','tests/fixtures/test-pic.jpg')
    .expect(200)
    
    //assert that the backgroundPicture was stored properly
    const user = await User.findById(userOneId)
    expect(user.backgroundPict).toEqual(expect.any(Buffer))
}) 


 test('update profile picture',async()=>{
     const response = await request(app).patch('/users/me/profilePicture')
     .set('Authorization',`Bearer ${userOne.tokens[0].token}`) 
     .attach('profilePicture','tests/fixtures/test-pic.jpg')    
     .expect(200)
     //Assert the update on the database
     //const user = await User.findById(userOneId)
     //verification
 })
 
 

 
 test('update background picture',async()=>{
    const response = await request(app).patch('/users/me/backgroundPicture')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`) 
    .attach('backgroundPicture','tests/fixtures/test-pic.jpg')    
    .expect(200)
    //Assert the update on the database
    //const user = await User.findById(userOneId)
    //verification
})

