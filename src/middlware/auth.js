const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        let user;
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        user = await User.findOne({ _id: decoded._id, "tokens.token": token },
            { userName: 1, email: 1, password: 1, gender: 1, tokens: 1, createdAt: 1, updatedAt: 1, imgUrl: 1, backgroundUrl: 1 })

        if (!user) throw new Error();

        req.token = token;
        req.user = user;
        next();
    }
    catch (e) {
        res.status(401).send({ error: "Please authenticate" })
    }
}

module.exports = auth;