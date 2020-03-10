const multer = require('multer');

const uploadBack = multer({
    limits : {
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(png|jpg|jpeg|svg)$/)){
            return cb(new Error("Upload jpg or png or jpeg"))
        }
        cb(undefined,true)
    }
})




module.exports = uploadBack;