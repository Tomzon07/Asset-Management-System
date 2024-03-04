const AWS = require("aws-sdk");
require('dotenv').config();

AWS.config = {
    endpoint: process.env.ENDPOINT,
    region: process.env.REGION
}

const fs = require('fs');
const parse = require('csv-parser');
const express = require('express');
const app = express();
const dynamo = new AWS.DynamoDB.DocumentClient();
let EMAIL_FUNCTION = process.env.EMAIL_FUNCTION
let EMAIL = process.env.EMAIL
let PASSWORD = process.env.PASSWORD
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator')
const logger = require('../logger.util')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const TABLE_NAME = process.env.TABLE_NAME
const { setCounter } = require("../controller/ticket");
const { date } = require("joi");
const morgan = require('morgan');
const {validateFile} = require('../controller/asset')







//Add User
function generatePassword() {

    const regexForPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/

    let password = '';
    while (!regexForPassword.test(password)) {
        // Generate a random password between 8 and 16 characters in length
        const length = 8 + Math.floor(Math.random() * (16 - 8 + 1));
        password = '';
        for (let i = 0; i < length; i++) {
            // Generate a random character code between 33 and 126 (inclusive)
            const code = 33 + Math.floor(Math.random() * (126 - 33 + 1));
            // Convert the character code to a character and add it to the password
            password += String.fromCharCode(code);
        }

    }
    return password;

}
const createUser = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        let data;
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).send(errors.errors[0].msg);
        }
        const value = await dynamo
            .get({
                TableName: TABLE_NAME,
                Key: {
                    pk: req.body.email,
                    sk: "profile"
                }
            }).promise();
        const empId = await dynamo.query({
            TableName: TABLE_NAME,
            IndexName: 'sk-pk-index',
            KeyConditionExpression: 'sk=:sk',
            FilterExpression: 'employeeId=:employeeId',
            ExpressionAttributeValues: {
                ":employeeId": req.body.empId,
                ":sk": "profile"
            }
        }).promise();

        if (value.Item != undefined) {
            res.status(400).send({ "errorCode": 1084, "message": "Email id already exists" })
        } else if (empId.Count != 0) {
            res.status(400).send({ "errorCode": 1085, "message": "Employee Id already exists" })
        } else {
            let password = generatePassword();
            data = {
                "pk": req.body.email,
                "sk": "profile",
                "name": req.body.name.toLowerCase(),
                "department": req.body.department,
                "permission": req.body.permission,
                "employeeId": req.body.empId,
                "userStatus": "0",
                "password": password,
                "createDate": new Date().toISOString(),
                "updateDate": new Date().toISOString(),
                "version": 1,
                "emailForSearch": req.body.email
            }

            let hashPassword = await bcrypt.hash(data.password, 10);

            logger.info(hashPassword)
            data.password = hashPassword;
            await dynamo
                .put({
                    TableName: TABLE_NAME,
                    Item: data
                })
                .promise();

            const email = req.body.email

            mailSend(email, password)

            delete data['emailForSearch']
            delete data['version']
            delete data['password']
            res.send({ "message": "Successfully added", data });
            logger.info("USER ADDED SUCCESSFULLY : AddUser "+req.body.email)
        }

    }
    catch (error) {
        res.send(error);
        logger.info("AddUserError : ", error)

    }
}

//EDIT USER

const EditUser = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).send(errors.errors[0].msg);
        }
        const body = await dynamo
            .get({
                TableName: TABLE_NAME,
                Key: {
                    pk: req.body.email,
                    sk: "profile"


                }
            }).promise();

        if (body.Item == undefined) {
            res.status(400).send({ "errorCode": "1083", "message": "Data not available" });
        }
        else if (req.body.version == body.Item.version) {

            body.Item.name = req.body.name.toLowerCase();
            body.Item.department = req.body.department;
            body.Item.permission = req.body.permission;
            body.Item.updateDate = new Date().toISOString()
            body.Item.version = parseInt(req.body.version) + 1;


            await dynamo.put({
                TableName: TABLE_NAME,
                Item: body.Item
            }).promise();
            res.send("edited");
            logger.info("EDIT USER SUCCESS : editUser ("+req.body.email+")")

        }
        else {
            res.status(400).send({ "errorCode": "1079", "message": "user version changed" });


        }
    }
    catch (error) {
        res.send(error);
        logger.info("editUserError : ", error);

    }

}
//GET BY EMAIL
const getUserByEmail = async (req, res) => {
    try {
        let body = await dynamo
            .get({
                TableName: TABLE_NAME,
                Key: {
                    pk: req.params.email,
                    sk: "profile"
                }
            })
            .promise();
        if (body.Item.version == undefined) {
            body.Item.version = 1
        }
        res.send(body);

    }
    catch (err) {
        res.send(err);
        logger.info(err)
    }
}


// DELETE USER

const deleteUser = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    const pk = req.query.pk;
    const sk = req.query.sk;
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.errors[0].msg);
    }
    try {
        if (pk === req.user.email) {
            res.status(400).send({ "errorCode": 1083, "message": "Cannot delete current user" })
        }
        else {
            let body = await dynamo.get({
                TableName: TABLE_NAME,
                Key: {
                    pk, sk
                }
            }).promise();
            if (body.Item == undefined) {
                res.status(400).send({ "errorCode": 1018, "message": "Invalid user" });
            }
            else {

                await dynamo.delete({
                    TableName: TABLE_NAME,
                    Key: {
                        pk: pk,
                        sk: sk

                    }
                }).promise();

                let data = body.Item
                data.sk = "deletedprofile"
                data.updateDate = new Date().toISOString()
                await dynamo.put({
                    TableName: TABLE_NAME,
                    Item: data
                }).promise();
                res.send("User deleted Successfully");
                logger.info("USER DELETED SUCCESSFULLY : deleteUser ("+req.query.pk+")")
            }
        }

    }
    catch (error) {
        logger.info(error)

        res.send(error);
        logger.info("deleteUserError : ", error)
    }
}

//GET ALL USERS 
const getAllUsers = async (req, res) => {
    try {
        let body = await dynamo.query({
            TableName: TABLE_NAME,
            IndexName: 'sk-pk-index',
            KeyConditionExpression: 'sk=:pk',
            ExpressionAttributeNames: {
                "#n": "name",
                "#per": "permission"
            },
            ExpressionAttributeValues: {
                ":pk": "profile"
            },
            ProjectionExpression: 'pk,sk,#n,department,#per,employeeId,userStatus,createDate,updateDate'
        }).promise();
        res.send(body);
        logger.info("ALL USERSLIST : getAllUsers");

    }
    catch (error) {
        res.send(error);
        logger.info("getAllUsersError:", error)
    }
}




// csv upload
// get number of users
async function userCount() {
    let params = {
        TableName: TABLE_NAME,
        IndexName: 'sk-pk-index',
        KeyConditionExpression: 'sk=:pk',
        ExpressionAttributeValues: {
            ":pk": "profile"
        },
        Select: "COUNT"
    }
    const body = await dynamo.query(params).promise();

    return body.Count
}
function parseCSVFile(filePath) {
    return new Promise((resolve, reject) => {
        const csvData = [];
        let lineNumber = 0;

        fs.createReadStream(filePath)
            .pipe(parse({ columns: true }))
            .on('data', (row) => {
                
                csvData.push(row);
                csvData.splice(lineNumber, 1);
                lineNumber++;
            })
            .on('end', () => {
                resolve(csvData);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

// csv function
const csv = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);

    if(req.user.permission != "ADMIN"){
        return res.status(403).send({ errorCode: 1030, message: "Invalid access" })
    }

    let isValid = await validateFile(req.file)
        
        if(isValid){
            return res.status(400).send(isValid)
        }

    // getting all existing user
    let usercount = await userCount()
    
    let csvusercount;
      const csvData = await parseCSVFile(req.file.path)
            csvusercount = csvData.length
            let totalusercount = csvusercount + usercount;
            let valid = await validation(csvData)
            let invalidItems = valid.invalidItems
            let validItems = valid.validItems

            if (csvData.length == 0) {
                res.status(400).send({ errorCode: 1026, message: "Uploading failed ! File cannot be empty" })
                return
            }
            const header = validateHeader(csvData)
            if (!header) {
                return res.status(400).send({ errorCode: 1027, message: "Uploading failed ! Invalid headers" });
            }

            if (invalidItems.length > 0) {
                return res.status(400).send({ error: 'Invalid items detected in CSV file', invalidItems });
            }

            const errorss = await duplicateInCSV(csvData);
            if (errorss.length > 0) {
                return res.status(400).send({ errorCode: 1025, message: "user repeated inside csv", errorss });
            }

            const duplicate = await users(validItems);
            if (duplicate.length !== 0) {
                logger.info("duplicate users", duplicate);
                return res.status(400).send({ errorCode: 1029, message: "duplicate user", " conflictedUsers": duplicate });
            }

            let isSuccess = false;
            while (!isSuccess) {
                const newUserCount = await userCount();
                isSuccess = newUserCount === totalusercount ? true : false;

            }

            logger.info("Success");
            return res.status(200).send({ message: "success" });

       

}
async function validation(csvData) {
    const invalidItems = [];
    const validItems = []

    for (const [index, item] of csvData.entries()) {
        item.createdDate = new Date();
        item.updateDate = new Date();
        const invalidFields = validateItem(item);
        if (!invalidFields) {
            validItems.push(item);
        } else {
            invalidItems.push({
                line: index + 1, // Line number is 1-indexed
                invalidFields,
            });
        }
    }
    return { "invalidItems": invalidItems, "validItems": validItems }
}
async function duplicateInCSV(csvData) {
    let errors = [];
    let uniqueIds = new Set();
    let uniqueEmails = new Set();
    csvData.forEach((obj, index) => {
        if (uniqueIds.has(obj.employeeId) && uniqueEmails.has(obj.email)) {
            errors.push({ index: index + 1, employeeId: obj.employeeId, email: obj.email, error: "Duplicate employeeId and email found" });
        }
        else if (uniqueIds.has(obj.employeeId)) {
            errors.push({ index: index + 1, employeeId: obj.employeeId, error: "Duplicate employeeId found" });
        }
        else if (uniqueEmails.has(obj.email)) {
            errors.push({ index: index + 1, email: obj.email, error: "Duplicate email found" });
        }

        uniqueIds.add(obj.employeeId);
        uniqueEmails.add(obj.email);

    });
    return errors
}





async function users(csvData) {


    let params;
    let isDuplicate = false;
    let duplicateUsers = [];
    let users = {
        TableName: TABLE_NAME,
        IndexName: 'sk-pk-index',
        KeyConditionExpression: 'sk=:pk',
        ExpressionAttributeValues: {
            ":pk": "profile"
        },

    }
    const data = await dynamo.query(users).promise();
    let dbData = data.Items







    csvData.forEach((item1, index1) => {
        let emailIndex = dbData.findIndex(item2 => item2.pk === item1.email);

        if (emailIndex !== -1) {
            duplicateUsers.push({ email: item1.email, line: index1 + 1 });

        }
        let employeeIdIndex = dbData.findIndex(item2 => item2.employeeId === item1.employeeId);
        if (employeeIdIndex !== -1) {


            duplicateUsers.push({ employeeId: item1.employeeId, line: index1 + 1 });


        }
    });



    if (duplicateUsers.length != 0) {


        isDuplicate = true;


    }
    if (!isDuplicate) {
        await batchWriteData(csvData)
    }
    return (duplicateUsers);
}
async function batchWriteData(items, res) {
    let password = "Admin@123";

    let hashPassword = await bcrypt.hash(password, 10);

    const batches = [];
    const batchCount = Math.ceil(items.length / 25);
    const dateToDb = new Date().toISOString()
    const emails = items.map(item => item.email) // Join all email values with comma separator
    for (let i = 0; i < batchCount; i++) {
        const batch = items.slice(i * 25, (i + 1) * 25);
        const params = {
            RequestItems: {
                [TABLE_NAME]: batch.map(item => ({
                    PutRequest: {
                        Item: {
                            "pk": item.email,
                            "sk": "profile",
                            "password": hashPassword,
                            "name": item.name.toLowerCase(),
                            "department": item.department,
                            "userStatus": 0,
                            "permission": item.permission,
                            "employeeId": item.employeeId,
                            "createDate": dateToDb,
                            "updateDate": dateToDb,
                            "version": 1,
                            "emailForSearch": item.email

                        }
                    }
                }))
            }
        };

        try {
            batches.push(dynamo.batchWrite(params).promise());
            if (EMAIL_FUNCTION == "1") {
                let email
                for (email of emails) {


                    mailSend(email, password)
                }

            }

        } catch (err) {
            res.status(500).send({ errorCode: 1030, message: "Unexpected error" })

        }

    }

    return Promise.all(batches);
}
function validateHeader(csvData) {
    let validHeaders = ["name", "email", "createdDate", "department", "permission", "employeeId", "updateDate"]

    //headers in csv
    let csvHeaders = Object.keys(csvData[0]);

    const arraysAreEqual = csvHeaders.every(header => validHeaders.includes(header)) && csvHeaders.length === validHeaders.length;
    return arraysAreEqual;

}

function validateItem(item) {
    const invalidFields = [];
    if (item.permission == "ADMIN" && item.department != "ADMIN") {
        invalidFields.push({ errorCode: 1016, message: 'Department must be ADMIN' });
    }
    // Check if name contains only alphabetic characters
    const nameRegex = /^(?=.{4,30}$)[^\s]+(\s[^\s]+)*$/

    if (!item.name) {
        invalidFields.push({ errorCode: 1066, message: 'name is required' });
    } else if (!nameRegex.test(item.name)) {
        invalidFields.push({ errorCode: 1019, message: 'Invalid name' });
    }
    // checking dept
    const deptRegex = /^(HR|FINANCE|QA|INFRASTRUCTURE|DEVELOPMENT|CISO|ADMIN)$/;
    if (!item.department) {
        invalidFields.push({ errorCode: 1067, message: 'department is required' });
    }
    else if (!deptRegex.test(item.department)) {
        invalidFields.push({ errorCode: 1015, message: 'Invalid department name' });
    }
    // checking permission
    const permissionRegex = /^(HEAD|MANAGER|ADMIN)$/;
    if (!item.permission) {
        invalidFields.push({ errorCode: 1068, message: 'permission is required' });
    }
    else if (!permissionRegex.test(item.permission)) {
        invalidFields.push({ errorCode: 1016, message: 'Invalid permission' });
    }

    // Check if email is a valid email address using a regular expression
    const emailRegex = /^((.[^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!item.email) {
        invalidFields.push({ errorCode: 1065, message: 'email is required' });
    }
    else if (!emailRegex.test(item.email)) {
        invalidFields.push({ errorCode: 1013, message: 'Invalid email' });
    }
    // Check if employeeId is a number using a regular expression
    const IDRegex = /^(?!(0))[0-9]{4,6}$/;
    if (!item.employeeId) {
        invalidFields.push({ errorCode: 1069, message: 'employeeId is required' });
    }
    else if (!IDRegex.test(item.employeeId)) {
        invalidFields.push({ errorCode: 1017, message: 'Invalid employeeId' });
    }
    return invalidFields.length > 0 ? invalidFields : null;
}







//USER LOGING
const userLogin = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    let password = req.body.password;
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.errors[0].msg);
    }
    try {
        let data = await dynamo
            .get({
                TableName: TABLE_NAME,
                Key: {
                    pk: req.body.email,
                    sk: "profile"
                }
            }).promise();


        if (data.Item != undefined) {
            logger.info("USER EXISTS")
            const match = await bcrypt.compare(password, data.Item.password)
            logger.info(match)

            if (match) {
                await userloginhistory(req.body.email);
              

                logger.info("LOGIN SUCCESSFULLY : userLogin "+req.body.email);



                const accessTokenSign = jwt.sign(
                    { email: data.Item.pk, permission: data.Item.permission, department: data.Item.department },

                    process.env.TOKEN_KEY,
                    { expiresIn: "1h" })


                const refreshTokenSign = jwt.sign(
                    { email: data.Item.pk, permission: data.Item.permission, department: data.Item.department, purpose: "REFRESH_TOKEN" },
                    process.env.TOKEN_KEY,
                    { expiresIn: "7d" })


                res.send({ "accessToken": accessTokenSign, "status": data.Item.userStatus, "refresh": refreshTokenSign })
            }
            else {
                res.status(400).send({ "errorCode": 1081, "message": "Incorrect Password " })
            }


        } else {
            res.status(400).send({ "errorCode": 1082, "message": "User not found" })
        }

    } catch (error) {
        res.status(400).send({ "message": "Invalid credentials" });
        logger.info("loginError : ",error)

    }


}
const userloginhistory = async (email) => {
    // storing user logging details
    let history = await setCounter("user");
    let time = new Date()
    let userFootprint = {
        "pk": "userFootprint",
        "sk": "history" + history,
        "email": email,
        "loginTime": time

    }
    await dynamo.put({
        TableName: TABLE_NAME,
        Item: userFootprint
    }).promise();


}

//ACCESS TOKEN BY REFRESH TOKEN

const getAccessTokenService = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        const refreshToken = req.body.refreshTokenSign;
        if (!refreshToken) {
            res
                .status(200)
                .send({ errorMessage: "refresh token is required", status: 21 });
        }
        const decodedRefreshToken = jwt.decode(refreshToken, process.env.TOKEN_KEY);
        if (

            jwt.verify(refreshToken, process.env.TOKEN_KEY)

        ) {
            const accessToken = jwt.sign(
                {
                    email: decodedRefreshToken.email,
                    permission: decodedRefreshToken.permission,
                    department: decodedRefreshToken.department,
                    purpose: "ACCESS_TOKEN",
                },
                process.env.TOKEN_KEY,
                { expiresIn: "12h" }
            );
            res.send({ "accessToken2": accessToken })
        } else {
            res.status(401).send("Invalid token");
        }
    } catch (error) {
        res.send("Error" + error);
    }
};



//CHANGE PASSWORD

const changePassword = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.errors[0].msg);
    }
    const pk = req.user.email;
    const newPassword = req.body.newPassword
    const sk = "profile";
    try {
        let data = await dynamo
            .get({
                TableName: TABLE_NAME,
                Key: {
                    pk, sk
                }
            }).promise();


        logger.info(data.Item.password)
        let match = await bcrypt.compare(req.body.currPassword, data.Item.password)
        if (match) {
            let hash = await bcrypt.hash(newPassword, 10);
            data.Item.password = hash;
            data.Item.userStatus = "1";
            data.Item.updateDate = new Date().toISOString();
            await dynamo
                .put({
                    TableName: TABLE_NAME,
                    Item: data.Item
                }).promise();

            res.send({ "message": "Password changed successfully" });
            logger.info("PASSWORD CHANGED SUCCESSFULLY: changePassword")
        } else {
            res.status(400).send({ "errorCode": 1002, "message": "Current password doesn't match" });
            logger.info("PASSWORD DOESN'T MATCH")
        }


    } catch (err) {
        res.send(err)
        logger.info("changePassword Error : ",err)

    }





}
//FORGOT PASSWORD

const forgotPassword = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.errors[0].msg);
    }
    const pk = req.body.email;
    const sk = "profile";

    try {
        let data = await dynamo
            .get({
                TableName: TABLE_NAME,
                Key: {
                    pk, sk
                }
            }).promise();

        if (data.Item == undefined) {
            res.status(404).send({ "message": "User not found" });
        }
        else {

            let password = generatePassword();

            let hashPassword = await bcrypt.hash(password, 10);
            data.Item.password = hashPassword;
            data.Item.userStatus = "0";
            data.Item.updateDate = new Date().toISOString()

            await dynamo
                .put({
                    TableName: TABLE_NAME,
                    Item: data.Item
                })
                .promise();
            const email = req.body.email

            mailSend(email, password)
            logger.info("mail sent succesully :forgotPassword ")
            res.send({ "message": "success" })

        }
    }
    catch (error) {
        res.send(error);
        logger.info("forgotPasswordError : ", error);

    }


}


const searchUser = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        const pk = req.query.pk;
        const sk = req.query.sk;
        let email = req.user.email;
        const nameValueBeforeLowercase = req.params.username;
        const nameValue = nameValueBeforeLowercase.toLowerCase();



        let params2 = {
            TableName: TABLE_NAME,
            IndexName: 'sk-pk-index',
            FilterExpression: "(contains(#emailForSearch,:username) OR contains(#name,:username) OR contains(#employeeId,:username))",
            KeyConditionExpression: 'sk=:pk',
            ProjectionExpression: '#name,#department,#pk,#employeeId,#permission,sk',
            ExpressionAttributeNames: {
                '#name': 'name',
                '#department': 'department',
                '#pk': 'pk',
                '#employeeId': 'employeeId',
                '#permission': 'permission',
                '#emailForSearch': 'emailForSearch'
            },
            ExpressionAttributeValues: {
                ":pk": "profile",
                ":username": nameValue,
            }
        }
        if (pk && sk) {
            const keyValues = {
                "pk": pk,
                "sk": sk
            }
            params2.ExclusiveStartKey = keyValues;
        }
        let body = await dynamo.query(params2).promise();
        body.Items = body.Items.filter((item) => item.pk !== email);
        body.Count = body.Items.length
        res.send(body);
        logger.info("searchUserSuccess : searchUser")

    } catch (error) {
        res.send(error);
        logger.info("searchUserError : ", error)
    }
}

const userPaginated = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        let updateDate = req.query.updateDate;
        let sk = req.query.sk;
        let pk = req.query.pk
        let email = req.user.email;
        let params2 = {
            TableName: TABLE_NAME,
            IndexName: 'updateDate-index',
            KeyConditionExpression: 'sk=:pk ',
            ExpressionAttributeNames: {
                "#n": "name",
                "#per": "permission"
            },
            ExpressionAttributeValues: {
                ":pk": "profile",
            },
            ScanIndexForward: false,

            ProjectionExpression: 'pk,sk,#n,department,#per,employeeId,userStatus,createDate,updateDate'

        };
        if (updateDate && sk && pk) {
            let keyValues = {
                "updateDate": updateDate,
                "sk": sk,
                "pk": pk
            };
            params2.ExclusiveStartKey = keyValues;
        }

        let body = await dynamo.query(params2).promise();
        body.Items = body.Items.filter((item) => item.pk !== email);
        body.Count = body.Items.length

        res.send(body);
        logger.info("PAGINATION: userPaginated");

    } catch (error) {
        res.send(error)
        logger.info("paginationError : userPaginated ", error)
    }
}




// Mail Send

function mailSend(email, password) {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL,
            pass: PASSWORD
        }
    });

    const mailOptions = {
        from: 'ASSET  REQUISITION',
        to: email,
        subject: 'WELCOME',
        html: email + "<br>" + 'password:' + password

    };
    if (EMAIL_FUNCTION == "1") {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                logger.info("mail error", error);
            } else {
                logger.info('Email sent: ' + "to  " + email + "  " + info.response);
            }
        })
    }
}

//EmpId validation
const empIdValidation = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.errors[0].msg);
    }
    try {

        const id = await dynamo.query({
            TableName: TABLE_NAME,
            IndexName: 'sk-pk-index',
            KeyConditionExpression: 'sk=:pk',
            FilterExpression: 'employeeId=:employeeId',
            ExpressionAttributeValues: {
                ":pk": "profile",
                ":employeeId": req.params.empId
            }
        }).promise();
        if (id.Count != 0) {
            res.status(400).send({ "errorCode": 1085, "message": "Employee Id already exists" })
        }
        else {
            res.status(200).send({ "message": "valid" })
        }


    } catch (err) {
        res.send(err)
        logger.info("empIdValidatiion error : ",err)

    }

}


//Email Id validation
const emailValidation = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.errors[0].msg);
    }
    try {

        let pk = req.params.email;
        let sk = "profile"
        let id = await dynamo.get({
            TableName: TABLE_NAME,
            Key: {
                pk, sk
            }
        }).promise();
        if (id.Item == undefined) {
            res.status(200).send({ "message": "valid" })
        }
        else {
            res.status(400).send({ "errorCode": 1084, "message": "Email Id already exists" })
        }


    } catch (err) {
        res.send(err)
        logger.info("emailIdValidation Error : ",err)

    }
}

const userDetails = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    let pk = req.user.email;
    let sk = "profile"
    try {
        let data = await dynamo.get({
            TableName: TABLE_NAME,
            Key: {
                pk, sk
            },
            ExpressionAttributeNames: {
                "#n": "name",
                "#per": "permission"
            },
            ProjectionExpression: 'pk,sk,#n,department,#per,employeeId,userStatus'
        }).promise();
        res.send(data)
        logger.info("GET USER DEATILS : userDetails ("+req.user.email+")")
    } catch (err) {
        res.send(err)
        logger.info("userDetails Error : "+err)
    }

}

// all notification
const getNotification = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        let data = await dynamo.query({
            TableName: TABLE_NAME,
            IndexName: 'updateDate-index',
            KeyConditionExpression: 'sk=:pk',
            ExpressionAttributeNames: {
                "#status": "status"
            },
            FilterExpression: 'email=:email AND #status=:status',
            ExpressionAttributeValues: {
                ":pk": "notification",
                ":email": req.user.email,
                ":status": "ACTIVE"
            },
            ScanIndexForward: false
        }).promise();
        res.send(data)
        logger.info("GET ALL NOTIFICATIONS OF A USER : "+req.user.email)
    }
    catch (err) {
        res.send(err);
        logger.info("Get all notifications Error : "+err)
    }
}




const viewNotification = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        const pk = req.params.notificationId;
        const sk = "notification"
        let data = await dynamo.get({
            TableName: TABLE_NAME,
            Key: {
                pk, sk
            }
        }).promise();
        if (data.Item == undefined || data.Item.status == "INACTIVE") {
            res.status(400).send({ "errorCode": 1041, "message": "Invalid notification" })
        } else {
            if (req.user.email == data.Item.email) {
                data.Item.status = "INACTIVE";
                await dynamo.put({
                    TableName: TABLE_NAME,
                    Item: data.Item
                }).promise();
                res.send({ "message": "success" })

            } else {
                res.status(403).send({ "errorCode": "1030", "message": "Invalid access" })
            }
        }


    } catch (err) {
        res.send(err)
        logger.info("view nofification Error : ",err)
    }


}
// notification using web socket
// Set up a DynamoDB stream




module.exports = {
    createUser,
    getAllUsers,
    getUserByEmail,
    csv,
    userLogin,
    deleteUser,
    searchUser,
    userPaginated,
    changePassword,
    getAccessTokenService,
    EditUser,
    empIdValidation,
    forgotPassword,
    emailValidation,
    userDetails,
    getNotification,
    viewNotification



}