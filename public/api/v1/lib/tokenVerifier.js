const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const tokenSecret = process.env.TOKEN_SECRET;

verifyToken = (token) => {
    // return { isVerified: true, message: "OK" };
    var retValue = { isVerified: false, message: null, username: null };
    try {
        jwt.verify(token, tokenSecret);
        const { username } = jwt.decode(token);
        retValue.username = username
        retValue.message = "OK";
    } catch (err) {
        retValue.message = err.message;
        retValue.isVerified = false;
        return retValue;
    }
    retValue.isVerified = true;
    return retValue;
};

module.exports = verifyToken;