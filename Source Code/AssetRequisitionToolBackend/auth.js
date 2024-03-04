const passport = require('passport');
const AWS = require("aws-sdk");
require('dotenv').config();

AWS.config = {
    endpoint: process.env.ENDPOINT,
    region: process.env.REGION
}

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const jwt = require('jsonwebtoken')
const logger = require('./logger.util')

const GOOGLE_CLIENT_ID = '276320046261-r7p2b9g5gjtkgl0b2nf4pe5i8e40stu4.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/users/auth/google/callback",
    passReqToCallback: true,
},
    function (request, accessToken, refreshToken, profile, done) {

        return done(null, profile);
    }));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

//AUTHENTICATION FUNCTION
const authenticateToken = async (req, res, next) => {
    try{
    if (!req.headers.authorization) {
        return res.status(403).send("Access Denied");
    }
    else {
        const authHeader = req.headers['authorization']

        const token = authHeader.split(' ')[1];

        if (token == null) {
            return res.status(403).send("Token not Provided");

        } else {

            const decoded = jwt.verify(token, process.env.TOKEN_KEY);
            req.user = decoded;

            let pk = decoded.email
            let sk = "profile"
            let data = await dynamo.get({
                TableName: TABLE_NAME,
                Key: {
                    pk, sk

                }

            }).promise()
            if (data.Item == undefined || decoded.permission != data.Item.permission || decoded.department != data.Item.department) {
                res.status(403).send("User Denied")
            }
            else {
                return next();
            }
        }
    }

    }
    catch (error) {
        
        
        res.status(403).send({"errorCode":"1047","message":"Invalid token"});
}
}




const authenticateTokenHead = async (req, res, next) => {

    if (!req.headers.authorization) {
        return res.status(403).send("Accessss Denied");
    }
    else {
        const authHeader = req.headers['authorization']
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.TOKEN_KEY);
            let pk = decoded.email
            let sk = "profile"
            let data = await dynamo.get({
                TableName: TABLE_NAME,
                Key: {
                    pk, sk

                }

            }).promise()

            if (data.Item == undefined || decoded.permission != data.Item.permission || decoded.department != data.Item.department) {
                res.status(403).send("User Denied")
            }
            else {
                if (decoded.permission.toUpperCase() === "HEAD") {
                    req.user = decoded;
                    return next();
                }
                else {
                
                    res.status(403).send("Access Denied")

                }
            }

        } catch (error) {
            res.status(403).send({"errorCode":"1047","message":"Invalid token"});


        }
    }

}
const authenticateTokenAdmin = async (req, res, next) => {

    if (!req.headers.authorization) {
        return res.status(403).send("Accessss Denied");
    }
    else {
        const authHeader = req.headers['authorization']
        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.TOKEN_KEY);
            let pk = decoded.email
            let sk = "profile"
            let data = await dynamo.get({
                TableName: TABLE_NAME,
                Key: {
                    pk, sk

                }

            }).promise()

            if (data.Item == undefined || decoded.permission != data.Item.permission || decoded.department != data.Item.department) {
                res.status(403).send("User Denied")
            }
            else {
                if (decoded.permission.toUpperCase() === "ADMIN") {
                    req.user = decoded;
                    return next();
                }
                else {
                    return res.status(403).send("Access Denied");

                }

            }
        } catch (error) {
            res.status(403).send({"errorCode":"1047","message":"Invalid token"});


        }
    }

}





module.exports = {
    authenticateToken,
    authenticateTokenAdmin,
    authenticateTokenHead

}