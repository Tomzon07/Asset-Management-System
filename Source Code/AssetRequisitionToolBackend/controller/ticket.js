require('dotenv').config();
const AWS = require("aws-sdk");
AWS.config = {
    endpoint: process.env.ENDPOINT,
    region: process.env.REGION
}
const jwt = require('jsonwebtoken');
const logger = require('../logger.util')
const { ticket, ticketlevel, notification, category, otherTicket, pksk } = require('../validation.js');
const { validationResult } = require('express-validator')
const dynamo = new AWS.DynamoDB.DocumentClient();
const nodemailer = require('nodemailer')
let EMAIL_FUNCTION = process.env.EMAIL_FUNCTION
let EMAIL = process.env.EMAIL
const TABLE_NAME = process.env.TABLE_NAME
let PASSWORD = process.env.PASSWORD
const {notificationCountSend} = require('../middleware/util/socket')




require('dotenv').config();
const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT"
};



// Create Ticket
const createTicket = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try{
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).send(errors.errors[0].msg);
        }
        if (req.user.permission != "MANAGER") {
            return  res.status(403).send({ "errorCode": "1030", "message": "Invalid access" })
        }
        let flag;
        let data;
        let message = "created";
        let email = req.user.email;
        let department = req.user.department
        let filePath = req.file ? new Date().toISOString().split('.')[0] + ":" + '.' + req.file.mimetype.split('/')[1] : " ";
        if (req?.file?.size > 1024 * 1024) {
            res.status(400).send({ "errorCode": "1009", "message": "Invalid Ticket file" })
        } else {
            data = {
                "pk": "Ticket",
                "sk": "ticket",
                "department": department,
                "title": req.body.title.toLowerCase(),
                "projectcode": req.body.projectcode.toLowerCase(),
                "projectname": req.body.projectname.toLowerCase(),
                "email": email,
                "category": req.body.category,
                "device": req.body.device,
                "ticketstatus": "PENDING",
                "level": "HEAD",
                "allLevel": ["HEAD"],
                "forward": "FALSE",
                "history": [{
                    "action": "Created",
                    "user": email,
                    "time": new Date().toISOString()
                }],
                "createDate": new Date().toISOString(),
                "description": req.body.description,
                "updateDate": new Date().toISOString(),
                "path": filePath,
                "permission": req.user.permission,
                "estimatePath": " "
            }

            flag = await validateTicket(data, req.body)
            if (flag.message == "success") {
                let tCounter = new Date().getTime();
                let status = "created";
                try {

                    data.pk = "Ticket" + tCounter
                    await dynamo.put({
                        TableName: TABLE_NAME,
                        Item: data
                    }).promise();
                    mailSend(email, data.pk, status, data.department)
                    addNotification(data.pk, email, department, message);
                    
                    res.status(200).send({ "message": "success" });
                    logger.info("TICKET CREATED SUCCESSFULLY : createTicket (Ticket"+tCounter+")")
                } catch (error) {
                    res.send(error);
                    logger.info(error)
                }

            } else {
                res.status(400).send(flag)
            }
        }
    
        

    }catch(err){
        res.status(500).send({"errorCode":"1907","message":"An unexpected error occured"})
        logger.info("create ticket error : ",err)
    }
    

}


async function validateTicket(data, body) {
    let deviceName;
    let flag;
    if(body.deviceName){
        deviceName = body.deviceName.trim();
    }
    let categories = await dynamo.query({
        TableName: TABLE_NAME,
        IndexName: 'sk-pk-index',
        KeyConditionExpression: 'sk=:pk',
        ExpressionAttributeValues: {
            ":pk": "category"
        }
    }).promise();
    let category = categories.Items.map(item => item.pk);
    let assets = await dynamo.query({
        TableName: TABLE_NAME,
        IndexName: 'sk-pk-index',
        KeyConditionExpression: 'sk=:pk',
        FilterExpression: '(NOT assetStatus=:assetStatus) AND category=:category',
        ExpressionAttributeValues: {
            ":pk": "asset",
            ":category": data.category,
            ":assetStatus":"DELETED"
        }
    }).promise();
    let asset = assets.Items.map(item => item.device);
    if (data.category == "OTHER") {
        if (data.device == "OTHER") {
            data.deviceName = deviceName
            flag = { "message": "success", "data": data };

        } else {
            flag = { "errorCode": "1011", "message": "Invalid device" }
        }
    } else if (category.includes(data.category)) {
        if (asset.includes(data.device)) {
            flag = { "message": "success", "data": data };
        } else if (data.device == "OTHER") {

                data.deviceName = deviceName
                flag = { "message": "success", "data": data }
            
        } else {
            flag = { "errorCode": "1011", "message": "Invalid device" }
        }
    } else {
        flag = { "errorCode": "1005", "message": "Invalid category" }
    }
    return flag;
}


// /Approve,Reject Request
const SetStatusTicket = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    let body;
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).send(errors.errors[0].msg);
        }
        const pk = req.body.pk;
        const sk = req.body.sk;
        body = await dynamo.get({
            TableName: TABLE_NAME,
            Key: {
                pk, sk
            }
        }).promise();
        if (body.Item == undefined) {
            res.status(400).send({ "errorCode": 1010, "message": "Invalid ticket" });
            logger.info("Data not available")
        }
        else if (body.Item.ticketstatus == "PENDING") {
            if ((req.user.department == body.Item.department) || (req.user.department == body.Item.level)) {
                body.Item.ticketstatus = "REJECTED";
                body.Item.updateDate = new Date().toISOString()
                body.Item.history.push({
                    "action": "Rejected",
                    "user": req.user.email,
                    "time": new Date().toISOString()
                })
                await dynamo.put({
                    TableName: TABLE_NAME,
                    Item: body.Item
                }).promise();
                addNotification(pk, body.Item.email, req.user.email, "rejected")
                // When a head user approves a request, emit a socket event to the manager user


                mailSend(body.Item.email, body.Item.pk, "REJECTED", req.user.department)
                res.status(200).send({ "message": "REJECTED" });
                logger.info("SET STATUS OF TICKET : SetStatusTicket");
            } else {
                res.status(403).send({ "errorCode": 1030, "message": "Invalid access" })
            }
        } else {
            res.status(400).send({ "errorCode": 1035, "message": "Ticket has been already approved/ rejected" })
        }
    } catch (error) {
        res.status(500).send({"errorCode":"1907","message":"An unexpected error occured"})
        logger.info("set status error : ",error);
    }
}
// setlevel in if
const SetLevelTicket = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).send(errors.errors[0].msg);
        }
    let time = new Date().toISOString();
    let ticketId = req.body.pk;
    let filePath = req.file ? new Date().toISOString().split('.')[0] + ":" + '.' + req.file.mimetype.split('/')[1] : " ";
    
    try {
        
        const isValid = await setLevelValidation(req);
        let data=isValid.data
        let message;
        let email;
        let emails;
        let currentUser;
        let body;
        switch(isValid.status){
            
            case 1:
                res.status(400).send({errorCode: "1010", message: "Data not available"})
                break;

            case 2:
                data.Item.level = "INFRASTRUCTURE";
                data.Item.allLevel.push("INFRASTRUCTURE");
                data.Item.updateDate = new Date().toISOString();
                data.Item.history.push({
                    "action": "Approved by Finance Head ",
                    "user": req.user.email,
                    "time": time
                })
                message = "Forwarded to Infrastructure"
                email = data.Item.email;
                currentUser = req.user.email;
                await insertDB(data.Item)
                
                // getting all Infra  head 
                body = await dynamo.query({
                    TableName: TABLE_NAME,
                    IndexName: 'sk-pk-index',
                    KeyConditionExpression: 'sk=:pk',
                    ExpressionAttributeNames: {
                        "#n": "name",
                        "#per": "permission"
                    },
                    FilterExpression: 'department=:dept AND #per=:permission',
                    ExpressionAttributeValues: {
                        ":pk": "profile",
                        ":permission": "HEAD",
                        ":dept": "INFRASTRUCTURE"
                    },
                    ProjectionExpression: 'pk,sk,#n,department,#per,employeeId,userStatus,createDate,updateDate'
                }).promise();

                emails = body.Items.map(item => item.pk);
                emails.push(email);

                addNotificationusers2(ticketId, message, emails, currentUser);
                res.status(200).send({ message: "success" });
                break;

            case 3:
                if(!req.file){
                    res.status(400).send({"errorCode":"1064","message":"Ticket file is required"})
                }
                
                else if(req.file.size > 1024 * 1024){
                    res.status(400).send({"errorCode":1022,"message":"Invalid size of file"})

                }
                else{
                    data.Item.level = "FINANCE";
                    data.Item.allLevel.push("FINANCE");
                    data.Item.updateDate = new Date().toISOString();
                    data.Item.history.push({
                        "action": "Approved by CISO Head",
                        "user": req.user.email,
                        "time": time
                    })
                    data.Item.forward = "TRUE"
                    data.Item.estimatePath = filePath;
                    email = data.Item.email;
                    currentUser = req.user.email;
                    message = "Forwarded to Finance"
                    await insertDB(data.Item)
                    // getting all Finance  head 
                    body = await dynamo.query({
                        TableName: TABLE_NAME,
                        IndexName: 'sk-pk-index',
                        KeyConditionExpression: 'sk=:pk',
                        ExpressionAttributeNames: {
                            "#n": "name",
                            "#per": "permission"
                        },
                        FilterExpression: 'department=:dept AND #per=:permission',
                        ExpressionAttributeValues: {
                            ":pk": "profile",
                            ":permission": "HEAD",
                            ":dept": "FINANCE"
                        },
                        ProjectionExpression: 'pk,sk,#n,department,#per,employeeId,userStatus,createDate,updateDate'
                    }).promise();
                    emails = body.Items.map(item => item.pk);
                    emails.push(email);
                    addNotificationusers2(ticketId, message, emails, currentUser);
                    res.status(200).send({ message: "success" });
                }
                break;

            case 4:
                data.Item.level = "CISO";
                data.Item.forward = "TRUE"
                data.Item.allLevel.push("CISO");
                data.Item.updateDate = new Date().toISOString();
                data.Item.history.push({
                    "action": "Approved by Infrastructure Head",
                    "user": req.user.email,
                    "time": time
                })
                email = data.Item.email;
                currentUser = req.user.email;
                await insertDB(data.Item);
                // getting all ciso head 
                body = await dynamo.query({
                    TableName: TABLE_NAME,
                    IndexName: 'sk-pk-index',
                    KeyConditionExpression: 'sk=:pk',
                    ExpressionAttributeNames: {
                        "#n": "name",
                        "#per": "permission"
                    },
                    FilterExpression: 'department=:dept AND #per=:permission',
                    ExpressionAttributeValues: {
                        ":pk": "profile",
                        ":permission": "HEAD",
                        ":dept": "CISO"
                    },
                    ProjectionExpression: 'pk,sk,#n,department,#per,employeeId,userStatus,createDate,updateDate'
                }).promise();
                emails = body.Items.map(item => item.pk);
                emails.push(email);
                message = "Forwarded to CISO"
                addNotificationusers2(ticketId, message, emails, currentUser);

                res.status(200).send({ message: "Success" });
                break;

            case 5 :
                data.Item.level = "INFRASTRUCTURE";
                data.Item.allLevel.push("INFRASTRUCTURE");
                data.Item.updateDate = new Date().toISOString();
                data.Item.history.push({
                    "action": "Approved by Department Head",
                    "user": req.user.email,
                    "time": time
                })
                message = "Forwarded to Infrastructure"
                email = data.Item.email;
                currentUser = req.user.email;
                await insertDB(data.Item);
                // getting all Infra  head 
                body = await dynamo.query({
                    TableName: TABLE_NAME,
                    IndexName: 'sk-pk-index',
                    KeyConditionExpression: 'sk=:pk',
                    ExpressionAttributeNames: {
                        "#n": "name",
                        "#per": "permission"
                    },
                    FilterExpression: 'department=:dept AND #per=:permission',
                    ExpressionAttributeValues: {
                        ":pk": "profile",
                        ":permission": "HEAD",
                        ":dept": "INFRASTRUCTURE"
                    },
                    ProjectionExpression: 'pk,sk,#n,department,#per,employeeId,userStatus,createDate,updateDate'
                }).promise();
                res.send({ "message": "Success" });
                logger.info("SET LEVEL OF TICKET : setLevelTicket");
                emails = body.Items.map(item => item.pk);
                emails.push(email);
                addNotificationusers2(ticketId, message, emails, currentUser);
                break;

            default : 
                res.status(403).send({ errorCode: "1030", message: "Unauthorized user" })
                break;

        }
    }
    catch (error) {
        res.status(500).send({"errorCode":"1907","message":"An unexpected error occured"})
        logger.info("setlevel error : ",error);
    }
}
// setlevel inserting into DB
const insertDB = async (data) => {
    try {

        await dynamo.put({
            TableName: TABLE_NAME,
            Item: data
        }).promise();
    } catch (error) {
        res.send(error);
        logger.info(error);
    }
}



//GetAllTickets
const getAllTickets = async (req, res) => {
    try {
        let body = await dynamo.query({
            TableName: TABLE_NAME,
            IndexName: 'sk-pk-index',
            KeyConditionExpression: 'sk=:pk',
            FilterExpression: 'NOT ticketstatus=:ticketstatus',
            ExpressionAttributeValues: {
                ":pk": "ticket",
                ":ticketstatus": "DELETED"
            }
        }).promise();
        res.send(body)
        logger.info("Get all tickets : getAllTickets")
    }
    catch (error) {
        res.send(error);
        logger.info(error);

    }
}

// Edit Ticket
const editTicket = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.errors[0].msg);
    }
    let pk = req.params.ticketId;
    let sk = "ticket";
    let exists;
    let message = "edited"
    let filePath;
    let email = req.user.email;
    let dept = req.user.department;
    try {
        if (req.user.permission != "MANAGER") {
            return  res.status(403).send({ "errorCode": "1030", "message": "Invalid access" })
        }

        exists = await dynamo.get({
            TableName: TABLE_NAME,
            Key: {
                pk, sk
            }
        }).promise();

        let isEdit = await isEditable(exists,dept)


        if(isEdit){
            res.status(400).send(isEdit);
        }else{
            filePath = req.file ? new Date().toISOString().split('.')[0] + ":" + '.' + req.file.mimetype.split('/')[1] : exists.Item.path;
            if (req?.file?.size > 1024 * 1024) {
                res.status(400).send({ "errorCode": "1009", "message": "Invalid Ticket file" })
            }else {
                exists.Item.title = req.body.title
                exists.Item.projectcode = req.body.projectcode
                exists.Item.projectname = req.body.projectname
                exists.Item.category = req.body.category
                exists.Item.device = req.body.device
                exists.Item.description = req.body.description
                exists.Item.path = filePath
                exists.Item.updateDate = new Date().toISOString()
                let errMsg = await validateTicket(exists.Item, req.body)
                if (errMsg.message == "success") {
                    await dynamo.put({
                        TableName: TABLE_NAME,
                        Item: errMsg.data
                    }).promise();
                    addNotification(pk, email, dept, message);

                    res.send({ "message": "success" });
                    logger.info("EditTicketSuccess: (Ticket"+pk+")");

                } else {
                    res.status(400).send(errMsg)
                }
            }

        }
    }
    catch (error) {
        res.status(500).send({"errorCode":"1907","message":"An unexpected error occured"})
        logger.info("EditTicketError : ", error);
    }
}



// Delete Ticket by Ticket Id 
const deleteTicketById = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    let exists;
    let dept = req.user.department;
    let pk = req.params.ticketId;
    let sk = "ticket";
    if (req.user.permission == "MANAGER") {
        try {

            exists = await dynamo.get({
                TableName: TABLE_NAME,
                Key: {
                    pk, sk
                }
            }).promise();
            if (exists.Item == undefined) {
                res.status(400).send({ "errorCode": 1040, "message": "Invalid ticket" })
            }else if ( exists.Item.department != dept || exists.Item.ticketstatus == "DELETED") {
                res.status(400).send({ "errorCode": 1083, "message": "Data not available" })
            }else if(exists.Item.level != "HEAD" || exists.Item.ticketstatus == "APPROVED" || exists.Item.ticketstatus == "REJECTED"){
                res.status(400).send({"errorCode": 1087 , "message":"Approved / rejected tickets cannot be edited / deleted"})
            }else {
                exists.Item.ticketstatus = "DELETED"
                exists.Item.updateDate = new Date().toISOString()
                await dynamo.put({
                    TableName: TABLE_NAME,
                    Item: exists.Item
                }).promise();
                res.send({ "message": "Ticket deleted successfully" });
                logger.info("deleteTicket : deleteTicketById (Ticket"+pk+")");
            }

        }
        catch (error) {
            res.status(500).send({"errorCode":"1907","message":"An unexpected error occured"})
            logger.info("deleteTicketError : ", error);
        }
    } else {
        res.status(403).send({ "message": "Invalid access" })
    }

}


// Get Ticket By Department-------edited
const getTicketByDepartment = async (req, res) => {
    try {
        if (req.user.permission == "HEAD") {
            const department = req.user.department;
            let body = await dynamo.query({
                TableName: TABLE_NAME,
                IndexName: 'sk-pk-index',
                KeyConditionExpression: 'sk=:pk',
                FilterExpression: 'NOT ticketstatus=:s AND department=:department',
                ExpressionAttributeValues: {
                    ":pk": "ticket",
                    ":department": department,
                    ":s": "DELETED"
                }
            }).promise();
            if (body.Count == 0) {
                body = "No tickets available";
            }
            res.send(body);
            logger.info(body);

        }
        else {
            res.status(401).send({ "message": "No Access" })
        }
    }
    catch (error) {
        res.send(error);
        logger.info("getTicketByDepartmentError:", error);
    }
}


//GET TICKETS BY EMAIL-
const getTicketByEmail = async (req, res) => {
    const email = req.user.email;
    try {
        let body = await dynamo.query({
            TableName: TABLE_NAME,
            IndexName: 'sk-pk-index',
            KeyConditionExpression: 'sk=:pk',
            FilterExpression: 'NOT ticketstatus=:s AND email=:email',
            ExpressionAttributeValues: {
                ":pk": "ticket",
                ":email": email,
                ":s": "DELETED"
            }
        }).promise();
        if (body.Count == 0) {
            body = "No tickets available";
        }
        res.send(body);
        logger.info("TICKETS BY EMAIL : getTicketByEmail");

    }
    catch (error) {
        res.send(error);
        logger.info(error);

    }
}








//GET COMPLETED TICKET COUNT--------(get count of pending,complete,total tickets-----NEW)
const countCompletedTicket = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        let completedparams = {
            TableName: TABLE_NAME,
            IndexName: 'sk-pk-index',
            KeyConditionExpression: 'sk=:pk',
            Select: "COUNT"
        }
        let pendingparams = {
            TableName: TABLE_NAME,
            IndexName: 'sk-pk-index',
            KeyConditionExpression: 'sk=:pk',
            Select: "COUNT"
        }
        switch (req.user.permission) {
            case "ADMIN":
                completedparams.FilterExpression = 'ticketstatus=:st OR ticketstatus=:s'
                completedparams.ExpressionAttributeValues = {
                    ":pk": "ticket",
                    ":st": "REJECTED",
                    ":s": "APPROVED"
                }
                pendingparams.FilterExpression = 'ticketstatus=:s'
                pendingparams.ExpressionAttributeValues = {
                    ":pk": "ticket",
                    ":s": "PENDING"
                }
                break;

            case "MANAGER":
                completedparams.FilterExpression = 'email=:email AND (ticketstatus=:st OR ticketstatus=:s)'
                completedparams.ExpressionAttributeValues = {
                    ":pk": "ticket",
                    ":st": "REJECTED",
                    ":s": "APPROVED",
                    ":email": req.user.email
                }
                pendingparams.FilterExpression = 'ticketstatus=:s AND email=:email'
                pendingparams.ExpressionAttributeValues = {
                    ":pk": "ticket",
                    ":s": "PENDING",
                    ":email": req.user.email
                }
                break;

            case "HEAD":
                completedparams.ExpressionAttributeNames = {
                    "#lev": "allLevel"
                }
                completedparams.FilterExpression = '( ticketstatus=:s OR ticketstatus=:st) AND (contains(#lev,:department) OR department=:department)'
                completedparams.ExpressionAttributeValues = {
                    ":pk": "ticket",
                    ":st": "REJECTED",
                    ":s": "APPROVED",
                    ":department": req.user.department,

                }
                pendingparams.ExpressionAttributeNames = {
                    "#lev": "allLevel"
                }
                pendingparams.FilterExpression = ' ticketstatus=:s AND( contains(#lev,:department) OR department=:department)'
                pendingparams.ExpressionAttributeValues = {
                    ":pk": "ticket",
                    ":s": "PENDING",
                    ":department": req.user.department,
                }
                break;
        }
        let completed = await dynamo.query(completedparams).promise();
        let pending = await dynamo.query(pendingparams).promise();
        let total = completed.Count + pending.Count;
        res.send({ "completed": completed, "pending": pending, "total": total });
        logger.info("NUMBER OF COMPLETED,PENDING,TOTAL TICKETS : countCompletedTicket");
    }
    catch (error) {
        res.status(500).send({"errorCode":"1907","message":"An unexpected error occured"})
        logger.info("countCompletedTicket Error : ", error);

    }
}
//

//PAGINATION
const Paginated = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        let params2
        const pk = req.query.pk;
        const sk = req.query.sk;
        const updateDate = req.query.updateDate;
        switch (req.user.permission) {
            case "ADMIN":
                params2 = {
                    TableName: TABLE_NAME,
                    IndexName: 'updateDate-index',
                    KeyConditionExpression: 'sk=:pk',
                    FilterExpression: 'NOT ticketstatus=:ticketstatus',
                    ExpressionAttributeValues: {
                        ':pk': "ticket",
                        ":ticketstatus": "DELETED",
                    },
                    ScanIndexForward: false,
                };
                break;
            case "HEAD":
                params2 = {
                    TableName: TABLE_NAME,
                    IndexName: 'updateDate-index',
                    KeyConditionExpression: 'sk=:pk',
                    ExpressionAttributeNames: {
                        "#lev": "allLevel"
                    },
                    FilterExpression: 'NOT ticketstatus=:ticketstatus AND( contains(#lev,:department) OR department=:department)',
                    ExpressionAttributeValues: {
                        ':pk': "ticket",
                        ":ticketstatus": "DELETED",
                        ":department": req.user.department

                    },
                    ScanIndexForward: false
                };
                break;
            case "MANAGER":
                params2 = {
                    TableName: TABLE_NAME,
                    IndexName: 'updateDate-index',
                    KeyConditionExpression: 'sk=:pk',
                    FilterExpression: 'NOT ticketstatus=:ticketstatus AND email=:email',
                    ExpressionAttributeValues: {
                        ':pk': "ticket",
                        ":ticketstatus": "DELETED",
                        ":email": req.user.email
                    },
                    ScanIndexForward: false
                };
                break;
        }

        if (pk && sk && updateDate) {
            let keyValues = {
                "pk": pk,
                "sk": sk,
                "updateDate":updateDate
            };
            params2.ExclusiveStartKey = keyValues;
        }
        let body = await dynamo.query(params2).promise();
        res.send(body);
        logger.info("TICKET PAGINATION : paginated");

    } catch (err) {
        res.status(500).send({"errorCode":"1907","message":"An unexpected error occured"})
        logger.info("ticket pagination error : ",err);

    }

}


//get ticket by id
const getTicketById = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        const pk = req.params.ticketId;
        const sk = "ticket";
        let body = await dynamo.get({
            TableName: TABLE_NAME,
            Key: {
                pk, sk
            }
        }).promise();
        if (body.Item == undefined || body.Item.ticketstatus == "DELETED") {
            res.status(400).send({ "errorCode": 1040, "message": "Invalid ticket" });
        }
        else {
            res.send(body)
            logger.info("TICKET DETAILS BY ID : getTicketById (Ticket"+pk+")");
        }

    } catch (err) {
        res.status(500).send({"errorCode":"1907","message":"An unexpected error occured"})
        logger.info("get ticket by id error : ",err);

    }
}


// SEARCH
const searchTicketByProjectId = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        let params2 = {
            TableName: TABLE_NAME,
            IndexName: 'sk-pk-index',
            KeyConditionExpression: 'sk=:pk',
        }
        let val = req.query.id;
        let value = val.toLowerCase();
        switch (req.user.permission) {
            case "ADMIN":
                params2.FilterExpression = 'NOT ticketstatus=:ticketstatus AND ((contains(projectcode,:search)) OR (contains(projectname,:search)) OR (contains(title,:search)))'
                params2.ExpressionAttributeValues = {
                    ':pk': "ticket",
                    ":ticketstatus": "DELETED",
                    ":search": value
                }
                break;

            case "HEAD":
                params2.ExpressionAttributeNames = {
                    "#lev": "allLevel"
                }
                params2.FilterExpression = 'NOT ticketstatus=:ticketstatus AND( contains(#lev,:department) OR department=:department) AND ((contains(projectcode,:search)) OR (contains(projectname,:search)) OR (contains(title,:search)))'
                params2.ExpressionAttributeValues = {
                    ':pk': "ticket",
                    ":ticketstatus": "DELETED",
                    ":department": req.user.department,
                    ":search": value
                }
                break;

            case "MANAGER":
                params2.FilterExpression = 'NOT ticketstatus=:ticketstatus AND email=:email AND ((contains(projectcode,:search)) OR (contains(projectname,:search)) OR (contains(title,:search)))'
                params2.ExpressionAttributeValues = {
                    ':pk': "ticket",
                    ":ticketstatus": "DELETED",
                    ":email": req.user.email,
                    ":search": value
                }
                break;
        }
        let body = await dynamo.query(params2).promise();
        if (body.Count == 0) {
            res.send({ "message": "Search results not found" })
        }
        else {
            res.send(body);
        }
        logger.info("SEARCH TICKET BY PROJECT ID : searchTicketByProjectId");

    } catch (err) {
        res.status(500).send({"errorCode":"1907","message":"An unexpected error occured"})
        logger.info("search ticket error : ",err);

    }
}





// GETALL Paginated
const getAllPaginated = async (req, res) => {
    try {
        const ticketstatus = req.params.status
        const pk = req.query.pk;
        const sk = req.query.sk;
        let param
        switch (req.user.permission) {
            case "ADMIN":
                param = {
                    TableName: TABLE_NAME,
                    IndexName: 'sk-pk-index',
                    KeyConditionExpression: 'ticketstatus=:ticketstatus',
                    FilterExpression: 'level=:level',
                    ExpressionAttributeValues: {
                        ':ticketstatus': "PENDING",
                        ':level': "ADMIN"
                    },
                };
                break;
            case "HEAD":

                param = {
                    TableName: TABLE_NAME,
                    IndexName: 'sk-pk-index',
                    KeyConditionExpression: 'ticketstatus=:ticketstatus',
                    FilterExpression: 'level=:level AND department=:department',
                    ExpressionAttributeValues: {
                        ':ticketstatus': "PENDING",
                        ':level': "HEAD",
                        ':department': req.user.department
                    },
                };
                break;
            case "MANAGER":

                param = {
                    TableName: TABLE_NAME,
                    IndexName: 'ticketstatus-index',
                    KeyConditionExpression: 'ticketstatus=:ticketstatus',
                    FilterExpression: 'email=:email',
                    ExpressionAttributeValues: {
                        ':ticketstatus': ticketstatus,
                        ':email': req.user.email
                    },
                };
        }
        if (pk && sk) {
            let keyValues = {
                "pk": pk,
                "sk": sk
            };
            param.ExclusiveStartKey = keyValues;
        }
        let body = await dynamo.query(param).promise();
        res.send(body);

    } catch (err) {
        res.send(err)
        logger.info("getAllPaginatedError", err)
    }
}


function mailSend(email, id, status, dept) {

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
        subject: 'WELCOME'


    };

    if (status == "APPROVED" || status == "REJECTED") {
        mailOptions.html = 'Hi ' + email + "<br>" + 'Request for ticket : ' + id + ' has been ' + status + ' by ' + dept.toLowerCase() + ' head'
    }
    else if (status == "created") {
        mailOptions.html = 'Hi ' + email + "<br>" + 'Your ticket has been submitted successfully with ticketid ' + id
    }
    else {
        EMAIL_FUNCTION = "0";
    }


    if (EMAIL_FUNCTION == "1") {

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                logger.info("mail error", error);
            } else {
                logger.info('Email sent: ' + info.response);

            }
        })
    }
}


async function setCounter(type) {
    let counter;
    let pk = type;
    let sk = "counter";
    let params = {
        TableName: TABLE_NAME,
        Key: {
            pk, sk
        }
    }
    let body = await dynamo.get(params).promise();

    if (body.Item == undefined) {
        let Ndata = {
            "pk": type,
            "sk": "counter",
            "counter": 1
        }
         await dynamo.put({
            TableName: TABLE_NAME,
            Item: Ndata
        }).promise();
        counter = 1;

    } else {
        body.Item.counter = body.Item.counter + 1;
        counter = body.Item.counter

        await dynamo.put({
            TableName: TABLE_NAME,
            Item: body.Item
        }).promise();









    }
    return counter;
}




async function addNotification(tCounter, email, department, message) {

    
    if (message == "created" || message == "edited") {
        let deptHeads = await dynamo.query({
            TableName: TABLE_NAME,
            IndexName: 'sk-pk-index',
            KeyConditionExpression: 'sk=:pk',
            ExpressionAttributeNames: {
                "#per": "permission"
            },
            FilterExpression: '#per=:permission AND department=:department',
            ExpressionAttributeValues: {
                ':pk': "profile",
                ":permission": "HEAD",
                ":department": department

            }
        }).promise();
        for (const key in deptHeads.Items) {
           
            let nCounter = new Date().getTime();
            let data = {
                "pk": "Notification" + nCounter,
                "sk": "notification",
                "email": deptHeads.Items[key].pk,
                "ticketId": tCounter,
                "message": "Ticket : " +tCounter+ ' ' + message + ' by ' + email,
                "status": "ACTIVE",
                "createDate": new Date().toISOString(),
                "updateDate": new Date().toISOString()
            }
            
                await dynamo.put({
                    TableName: TABLE_NAME,
                    Item: data
                }).promise();
                notificationCountSend(deptHeads.Items[key].pk,1)
            
        }
    } else {
        let nCounter = new Date().getTime();
        let data = {
            "pk": "Notification" + nCounter,
            "sk": "notification",
            "email": email,
            "ticketId": "Ticket" + tCounter,
            "message": "Ticket : "+tCounter + ' ' + message + " by " + department,
            "status": "ACTIVE",
            "createDate": new Date().toISOString(),
            "updateDate": new Date().toISOString()
        }
        await dynamo.put({
                TableName: TABLE_NAME,
                Item: data
            }).promise();
            notificationCountSend(email)
           

        

    }
}
async function addNotificationusers2(tCounter, message, user, email) {
    for (const key in user) {

        // triggering socket
        let nCounter = new Date().getTime();
        let data = {
            "pk": "Notification" + nCounter,
            "sk": "notification",
            "email": user[key],
            "ticketId": tCounter,
            "message": "Ticket : "+tCounter + ' ' + message + ' by ' + email,
            "status": "ACTIVE",
            "createDate": new Date().toISOString(),
            "updateDate": new Date().toISOString()
        }
         await dynamo.put({
                TableName: TABLE_NAME,
                Item: data
            }).promise();
            notificationCountSend(user[key],1)

        
    }

}
async function addNotificationusers3(message, user, ticketId) {
    for (const key in user) {
   // triggering socket
        let nCounter = new Date().getTime();
        let data = {
            "pk": "Notification" + nCounter,
            "sk": "notification",
            "email": user[key],
            "ticketId": ticketId,
            "message": message,
            "status": "ACTIVE",
            "createDate": new Date().toISOString(),
            "updateDate": new Date().toISOString()
        }
        


        await dynamo.put({
            TableName: TABLE_NAME,
            Item: data
        }).promise();
        notificationCountSend(user[key],1)


    }

}
// Create Category
const createCategory = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try{
        if (req.user.department == "INFRASTRUCTURE" && req.user.permission == "HEAD") {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).send(errors.errors[0].msg);
            }
    
            const params = {
                TableName: TABLE_NAME,
                Key: {
                    'pk': req.body.category,
                    'sk': 'category'
                }
            };
            let data = await dynamo.get(params).promise();
    
    
            if (data.Item === undefined) {
                data = {
                    "pk": req.body.category.toUpperCase(),
                    "sk": "category",
                    "createDate": new Date().toISOString(),
                    "updateDate": new Date().toISOString(),
                }
                
                    try {
                        await dynamo
                            .put({
                                TableName: TABLE_NAME,
                                Item: data
                            })
                            .promise();
                        res.status(200).send("success");
    
                        logger.info("CATEGORY CREATED SUCCESSFULLY : createCategory ("+req.body.category+")")
    
                    } catch (error) {
                        res.send(error);
                        logger.info(error)
                    }
    
                
    
            } else {
                res.status(400).send({ message: "Category already exist", errorCode: 1063 });
            }
    
    
        } else {
            res.status(400).send({ errorCode: 1030, message: "Invalid access" });
        }

    }catch(err){
        res.status(500).send({"errorCode":"1907","message":"An unexpected error occured"})
        logger.info("create category error : ",err)
    }

    

}
// history of a ticket



const allCategory = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        if (req.user.department == "INFRASTRUCTURE" || req.user.permission == "MANAGER") {
            let categories = await dynamo.query({
                TableName: TABLE_NAME,
                IndexName: 'sk-pk-index',
                KeyConditionExpression: 'sk=:pk',
                ExpressionAttributeValues: {
                    ":pk": "category"
                },
                ProjectionExpression: 'pk'
            }).promise();
            let category = categories.Items.map(item => item.pk);
            res.send(category)
            logger.info("GET ALL CATEGORY : allCategory")
        } else {
            res.status(403).send({ errorCode: 1030, message: "Invalid access" })
        }
    } catch (err) {
        res.status(500).send({"errorCode":"1907","message":"An unexpected error occured"})
        logger.info("get all category Error : ",err)
    }


}

const ticketHistory = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        const pk = req.body.ticketId;
        const sk = "ticket";
        const exists = await dynamo.get({
            TableName: TABLE_NAME,
            Key: { pk, sk },
            ProjectionExpression: "history"
        }).promise();
        if (exists.Item) {
            res.status(200).send(exists.Item)
        } else {
            res.status(400).send({ message: "Invalid ticket", errorCode: 1050 })
        }


    } catch (error) {
        res.status(500).send({"errorCode":"1907","message":"An unexpected error occured"})
        logger.info("ticket history error : ",error)
    }
}
// all notification
const notifications = async (email) => {
    
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
                ":email": email,
                ":status": "ACTIVE"
            },
            ScanIndexForward: false
        }).promise();
        
        return data;
    }
    catch (err) {
        res.send(err);
    }
}



async function isEditable(exists,dept){
    let message;
    if(exists.Item == undefined){
        message = { "errorCode": 1040, "message": "Invalid ticket" }
    }else if ( exists.Item.department != dept || exists.Item.ticketstatus == "DELETED") {
        message = { "errorCode": 1083, "message": "Data not available" }
    }else if(exists.Item.level != "HEAD" || exists.Item.ticketstatus == "APPROVED" || exists.Item.ticketstatus == "REJECTED"){
        message = {"errorCode": 1087 , "message":"Approved / rejected tickets cannot be edited / deleted"}
    }else{
        message = false
    }
    return message;
}


async function setLevelValidation(req){
    const pk = req.body.pk;
    const sk = req.body.sk;
    let errorMessage;
    let data = await dynamo.get({
        TableName: TABLE_NAME,
        Key: {
            pk, sk
        }
    }).promise();


    if (data.Item == undefined) {
        errorMessage = { status : 1 }
        
    }else if(req.user.department === "FINANCE" && data.Item.level === "FINANCE" && data.Item.ticketstatus === "PENDING"){
        errorMessage = { status : 2, data:data}
        
        
    }else if(req.user.department == "CISO" && data.Item.level === "CISO" && data.Item.ticketstatus === "PENDING"){
        errorMessage = { status : 3, data : data}
        

    }else if(req.user.department == "INFRASTRUCTURE" && data.Item.level === "INFRASTRUCTURE" && data.Item.ticketstatus === "PENDING" && data.Item.forward === "FALSE"){
        errorMessage = { status : 4 , data : data}
        

    }else if(req.user.department === data.Item.department && data.Item.level === "HEAD" && data.Item.ticketstatus === "PENDING"){
        errorMessage = { status : 5 ,data : data}
        

    }else{
        errorMessage = { status : 6 }
    }
    return errorMessage

}


module.exports = {
    getAllTickets,
    createTicket,
    getTicketByDepartment,
    getTicketByEmail,
    editTicket,
    deleteTicketById,
    countCompletedTicket,
    Paginated,
    SetStatusTicket,
    getTicketById,
    SetLevelTicket,
    searchTicketByProjectId,
    getAllPaginated,
    createCategory,
    ticketHistory,
    addNotificationusers3,
    allCategory,
    setCounter

}



