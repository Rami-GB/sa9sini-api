const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
})

console.log('Database connected successfully');



//mongod --dbpath /home/anis/Desktop/mongoDev/data/db  init server command


 