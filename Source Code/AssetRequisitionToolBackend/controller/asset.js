const AWS = require("aws-sdk");
const moment = require('moment');
const logger = require("../logger.util.js");
const fs = require('fs');
const parse = require('csv-parser')
const { validationResult } = require('express-validator')
require('dotenv').config();
const { addNotificationusers3 } = require("./ticket")
const schedule = require('node-schedule');
let y = schedule.scheduleJob('0 2 * * *', function () {
    expiryNotification();
});
const morgan = require('morgan');


AWS.config = {
    endpoint: process.env.ENDPOINT,
    region: process.env.REGION
}
const TABLE_NAME = process.env.TABLE_NAME;
const dynamo = new AWS.DynamoDB.DocumentClient();


const createAsset = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    let data;
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.errors[0].msg);
    }
    try {
        if (req.user.department == "INFRASTRUCTURE") {
            data = {
                "pk": req.body.assetId.toUpperCase(),
                "sk": "asset",
                "modelNo": req.body.modelNo,
                "category": req.body.category.toUpperCase(),
                "device": req.body.device.toUpperCase(),
                "expiryDate": req.body.expiryDate,
                "version": 1,
                "assetStatus": "FALSE",
                "allocatedUser": "INFRA",
                "ticketId": "",
                "createDate": new Date().toISOString(),
                "updateDate": new Date().toISOString()
            }
            let isDateFormat = moment(data.expiryDate, "DD-MM-YYYY", true).isValid();

            if (isDateFormat) {
                let date = data.expiryDate;
                data.expiryDate = date.split("-").reverse().join("-");
            }

            let errorMessage = await validateData(data, "create");
            if (errorMessage) {
                res.status(400).send(errorMessage)
            } else {
                await dynamo.put({
                    TableName: TABLE_NAME,
                    Item: data
                }).promise();
                res.send({ "message": "Successfully Added" })
                logger.info("ASSET CREATED SUCCESSFULLY : createAsset ("+req.body.assetId+")")
            }
        }
        else {
            res.status(403).send({"errorCode":"1030", "message": "Invalid access" })
            logger.info("Invalid access : createAsset")
        }
    } catch (err) {
        res.status(500).send({ "errorCode": "1907", "message": "An unexpected error occured" })
        logger.info("create asset error : ",err)
    }
}


const assetIdValidation = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    let pk;
    let sk = "asset";
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.errors[0].msg);
    }
    try {
        if(req.user.department != "INFRASTRUCTURE"){
            return res.status(403).send({"errorCode":"1030","message":"Invalid access"})
        }
        pk = req.params.assetId.toUpperCase();
        let asset = await dynamo.get({
            TableName: TABLE_NAME,
            Key: {
                pk, sk
            }
        }).promise();
        if (asset.Item == undefined) {
            res.status(200).send({ "message": "valid" })
            logger.info("ASSET ID VALID : assetIdValidation")
        }
        else {
            res.status(400).send({ "errorCode": 1024, "message": "AssetId already exists" , "assetStatus":asset.Item.assetStatus })
        }

    } catch (err) {
        res.status(500).send({ "errorCode": "1907", "message": "An unexpected error occured" })
        logger.info("asset id validation error : ",err)

    }
}
const editAsset = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    let data;
    let pk = req.body.assetId;
    let sk = "asset";
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.errors[0].msg);
    }
    try {
        if (req.user.department != "INFRASTRUCTURE") {
            return res.status(403).send({"errorCode":"1030", "message": "Invalid access" })
        }
                data = await dynamo.get({
                    TableName: TABLE_NAME,
                    Key: {
                        pk, sk
                    }
                }).promise();

                let isEditable = await canEdit(data,req)

                if(isEditable){
                    return res.status(400).send(isEditable)
                }

                if(req?.body?.expiryDate?.trim()){
                    let newExpiry = req.body.expiryDate.trim()
                    let isDateFormat = moment(newExpiry, "DD-MM-YYYY",true).isValid();
                    if(isDateFormat){
                        let date = newExpiry;
                        data.Item.expiryDate = date.split("-").reverse().join("-");
                    } else{
                        data.Item.expiryDate = newExpiry
                    }

                }else{
                    data.Item.expiryDate = ""
                }      
                data.Item.modelNo = req.body.modelNo;
                data.Item.device = req.body.device.toUpperCase();
                data.Item.category = req.body.category.toUpperCase();
                data.Item.updateDate = new Date().toISOString();
                data.Item.version = parseInt(req.body.version) + 1
                let errorMessage = await validateData(data.Item, "edited")
                if (errorMessage) {
                    res.status(400).send(errorMessage)
                } else {
                    await dynamo.put({
                        TableName: TABLE_NAME,
                        Item: data.Item
                    }).promise();
                    res.send({ "message": "Successfully Edited" })
                    logger.info("Asset edited successfully : editAsset ("+req.body.assetId+")")
                }
        
    } catch (err) {
        res.status(500).send({ "errorCode": "1907", "message": "An unexpected error occured" })
        logger.info("edit asset error : ",err)
    }
}


async function validateData(data, action) {
        let message;
        let pk = data.pk;
        let sk = "asset";
        if (action == "create") {
            let asset = await dynamo.get({
                TableName: TABLE_NAME,
                Key: {
                    pk, sk
                }
            }).promise();
            if (asset.Item != undefined) {
                message = { "errorcode": 1024, "message": "Asset Id already exists" }
                return message;
            }
        }
        let categoryList = await dynamo.query({
            TableName: TABLE_NAME,
            IndexName: 'sk-pk-index',
            KeyConditionExpression: 'sk=:pk',
            ExpressionAttributeValues: {
                ":pk": "category"
            }
        }).promise();
        let category = categoryList.Items.map(item => item.pk);
        if (category.includes(data.category)) {
            message = false;
        } else {
            message = { "errorcode": 1020, "messsage": "Invalid category" }
            return message;

        }
        if (data.expiryDate) {
            let dateFormat = moment(data.expiryDate, "YYYY-MM-DD", true).isValid();

            if (dateFormat) {
                let currDate = new Date()

                const currObj = moment(currDate, 'YYYY-MM-DD');
                const dateObj = moment(data.expiryDate, 'YYYY-MM-DD');
                const diffInDays = dateObj.diff(currObj, 'days');
                if (diffInDays < 0)
                    message = { "errorCode": "1088", "message": "Expiry date should not be less than current date" }

                else
                    message = false;

            } else {
                message = { "errorCode": "1021", "message": "Invalid expiryDate" }
            }

        }

        return message;



}


const deleteAsset = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.errors[0].msg);
    }
    let pk = req.query.pk;
    let sk = req.query.sk;
    let data;

    try {
        if (req.user.department == "INFRASTRUCTURE") {
            data = await dynamo.get({
                TableName: TABLE_NAME,
                Key: {
                    pk, sk
                }
            }).promise();
            if (data.Item == undefined) {
                res.status(400).send({ "errorCode": "1012", "message": "Invalid asset" })
            } else if (data.Item.assetStatus == "DELETED") {
                res.status(400).send({ "errorCode": "1083", "message": "Data not available" })
            } else if (data.Item.assetStatus == "TRUE") {
                res.status(400).send({ "errorCode": "1086", "message": "Allocated assets cannot be edited / deleted" })
            } else {
                data.Item.assetStatus = "DELETED";
                await dynamo.put({
                    TableName: TABLE_NAME,
                    Item: data.Item
                }).promise();
                res.status(200).send({ "message": "asset deleted successfully" })
                logger.info("Asset deleted successfully : deleteAsset ("+pk+")")
            }
        } else {
            res.status(403).send({"errorCode":"1030", "message": "Invalid access" })
        }
    } catch (err) {
        res.status(500).send({ "errorCode": "1907", "message": "An unexpected error occured" })
        logger.info("delete asset error : ",err)
    }

}
const allocateAsset = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).send(errors.errors[0].msg);
    }
  
    const newexpiryDate = moment(req.body.expiryDate, "DD-MM-YYYY", true).isValid()
      ? req.body.expiryDate.split("-").reverse().join("-")
      : req.body.expiryDate;
    const diffDays = await dateValidator(newexpiryDate);
  
    if (diffDays < 0) {
      return res.status(400).send({ errorCode: 1088, message: "Expiry date should not be less than current date" });
    }
    if (isNaN(diffDays)) {
      return res.status(400).send({ errorCode: 1021, message: "Invalid expiryDate" });
    }
  
    try {
      if (req.user.department !== "INFRASTRUCTURE") {
        return res.status(403).send({ errorCode: 1030, message: "Invalid access" });
      }
  
      const ticket = {
        pk: req.body.ticketId,
        sk: "ticket",
      };
      const body = await dynamo.get({ TableName: TABLE_NAME, Key: ticket }).promise();
  
      if (!body.Item || body.Item.level !== "INFRASTRUCTURE" || body.Item.ticketstatus === "APPROVED") {
        return res.status(400).send({ errorCode: 1022, message: "Invalid ticketId" });
      }
  
      const asset = {
        pk: req.body.assetId,
        sk: "asset",
      };
      const data = await dynamo.get({ TableName: TABLE_NAME, Key: asset }).promise();
  
      if (!data.Item || data.Item.assetStatus !== "FALSE") {
        return res.status(400).send({ errorCode: 1031, message: "Invalid assetId" });
      }
  
      if (body.Item.allocated === "TRUE") {
        return res.status(400).send({ errorCode: 3031, message: "Ticket already allocated with asset" });
      }
  
      if (data.Item.assetStatus === "TRUE") {
        return res.status(400).send({ errorCode: 3030, message: "Asset already allocated to a ticket" });
      }
  
      body.Item.expiryDate = newexpiryDate;
      body.Item.allocatedAsset = data.Item.pk;
      body.Item.allocated = "TRUE";
      body.Item.ticketstatus = "APPROVED";
  
      await dynamo.put({ TableName: TABLE_NAME, Item: body.Item }).promise();
  
      data.Item.allocatedUser = body.Item.email;
      data.Item.ticketId = req.body.ticketId;
      data.Item.assetStatus = "TRUE";
  
      await dynamo.put({ TableName: TABLE_NAME, Item: data.Item }).promise();
  
      const message = `Asset ${req.body.assetId} is allocated by ${req.user.email}`;
      await addNotificationusers3(message, [body.Item.email], req.body.ticketId);
  
      return res.status(200).send({ message: "Asset allocated successfully" });
    } catch (error) {
      return res.status(500).send({ errorCode: "1907", message: "An unexpected error occurred" });
    }
  };
  
const assetByCategory = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    let data;
    try {
        if (req.user.department == "INFRASTRUCTURE" || req.user.permission == "MANAGER") {
            let categoryList = await dynamo.query({
                TableName: TABLE_NAME,
                IndexName: 'sk-pk-index',
                KeyConditionExpression: 'sk=:pk',
                ExpressionAttributeValues: {
                    ":pk": "category"
                }
            }).promise();
            let category = categoryList.Items.map(item => item.pk);
            if (category.includes(req.params.category)) {
                data = await dynamo.query({
                    TableName: TABLE_NAME,
                    IndexName: 'sk-pk-index',
                    FilterExpression: '(NOT assetStatus=:assetStatus) AND category=:category',
                    KeyConditionExpression: 'sk=:pk',
                    ExpressionAttributeValues: {
                        ":pk": "asset",
                        ":category": req.params.category,
                        ":assetStatus": "DELETED"
                    },
                    ProjectionExpression: 'device'
                }).promise();
                let allAssets = (data.Items.map(item => item.device))
                let assets = allAssets.filter((value, index) => allAssets.indexOf(value) === index)
                res.send(assets);
                logger.info("List assets by category success: assetByCategory")

            } else {
                res.status(400).send({ "errorcode": 1020, "message": "Invalid category" })
                logger.info("List assets by category invalid category : assetByCategory")
            }
        } else {
            res.status(403).send({ "errorCode": "1030", "message": "Invalid access" })
        }

    } catch (err) {
        res.status(500).send({ "errorCode": "1907", "message": "An unexpected error occured" })
        logger.info("asset by category error : ",err)
    }

}
// view total/allocated/free asset
const viewAsset = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    let data;
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.errors[0].msg);
    }
    if (req.user.department == "INFRASTRUCTURE") {
        switch (req.params.view) {
            case 'total':
                try {
                     data = await dynamo.query({
                        TableName: TABLE_NAME,
                        IndexName: 'updateDate-index',
                        FilterExpression: 'NOT assetStatus=:DELETED',
                        KeyConditionExpression: 'sk=:pk',
                        ExpressionAttributeValues: {
                            ':pk': 'asset',
                            ':DELETED': 'DELETED',
                        },
                        ScanIndexForward: false
                    }).promise();
                    res.send(data);
                } catch (error) {
        res.status(500).send({ "errorCode": "1030", "message": "Invalid access" })
                }
                break;
            case 'allocated':
                data = await dynamo.query({
                    TableName: TABLE_NAME,
                    IndexName: 'sk-pk-index',
                    KeyConditionExpression: 'sk=:pk',
                    FilterExpression: 'assetStatus=:assetStatus  ',
                    ExpressionAttributeValues: {
                        ":pk": "asset",
                        ":assetStatus": "TRUE"
                    },
                }).promise();
                res.send(data);
                break;
            case 'free':
                data = await dynamo.query({
                    TableName: TABLE_NAME,
                    IndexName: 'sk-pk-index',
                    KeyConditionExpression: 'sk=:pk',
                    FilterExpression: 'assetStatus=:assetStatus ',
                    ExpressionAttributeValues: {
                        ":pk": "asset",
                        ":assetStatus": "FALSE"
                    },
                }).promise();
                res.send(data);
                break;

        }
    } else {
        res.status(403).send({ "errorCode": "1030", "message": "Invalid access" })
    }

}
const viewAssetCategory = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    let category;
    let categoriesArray = [];
    let data;
    let keyValues;
   let categoryArray
   let obj
     
    let pk = req.query.pk;
    let sk = req.query.sk
    if (pk && sk) {
        keyValues = {
           "pk": pk,
           "sk": sk
       };
   }else{
       keyValues = false
   }
    switch (req.params.view) {
        case 'total':
          
            category = await categories(keyValues)
            categoryArray = category.Items.map(Item => Item.pk);
            for (const category of categoryArray) {
                data = await dynamo.query({
                    TableName: TABLE_NAME,
                    IndexName: 'sk-pk-index',
                    KeyConditionExpression: 'sk=:pk',
                    FilterExpression: 'NOT assetStatus=:assetStatus AND category=:category',
                    ExpressionAttributeValues: {
                        ":pk": "asset",
                        ":assetStatus": "DELETED",
                        ":category": category
                    }
                }).promise();

                categoriesArray.push({ "categoryName": category, "count": data.Count})

            }
            
            // categoriesArray.push([{ "lastEvaluatedKey":category.LastEvaluatedKey }])
             obj={"items": categoriesArray,"lastEvaluatedKey":category.LastEvaluatedKey}

            res.send(obj);
            break;

        case 'allocated':
            
           category = await categories(keyValues)
           categoryArray = category.Items.map(Item => Item.pk);
            for (const category of categoryArray) {
                data = await dynamo.query({
                    TableName: TABLE_NAME,
                    IndexName: 'sk-pk-index',
                    KeyConditionExpression: 'sk=:pk',
                    FilterExpression: ' assetStatus=:assetStatus AND category=:category',
                    ExpressionAttributeValues: {
                        ":pk": "asset",
                        ":assetStatus": "TRUE",
                        ":category": category
                    }
                }).promise();
                categoriesArray.push({ "categoryName": category, "count": data.Count})
                

            }
             obj={"items": categoriesArray,"lastEvaluatedKey":category.LastEvaluatedKey}

            res.send(obj);
            break;
        case 'free':
          
           category = await categories(keyValues)
           categoryArray = category.Items.map(Item => Item.pk);
            for (const category of categoryArray) {

                data = await dynamo.query({
                    TableName: TABLE_NAME,
                    IndexName: 'sk-pk-index',
                    KeyConditionExpression: 'sk=:pk',
                    FilterExpression: 'assetStatus=:assetStatus AND category=:category',
                    ExpressionAttributeValues: {
                        ":pk": "asset",
                        ":assetStatus": "FALSE",
                        ":category": category
                    }
                }).promise();
                categoriesArray.push({ "categoryName": category, "count": data.Count })



            }
            obj={"items": categoriesArray,"lastEvaluatedKey":category.LastEvaluatedKey}

            res.send(obj);
            break;
        default:
            // do something if none of the above cases match
            break;
    }
}


const ticketByAssetId = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);

    try {
        if (req.user.department == "INFRASTRUCTURE") {
            let pk = req.params.assetId;
            let sk = "asset";
            let asset = await dynamo.get({
                TableName: TABLE_NAME,
                Key: {
                    pk, sk
                }
            }).promise();
            if(asset.Item == undefined || asset.Item.assetStatus == "DELETED"){
                res.status(400).send({"errorCode":"1045","message":"Invalid assetId"})
            }else{
                let ticket = await dynamo.query({
                    TableName: TABLE_NAME,
                    IndexName: 'sk-pk-index',
                    KeyConditionExpression: 'sk=:pk',
                    FilterExpression: 'allocatedAsset=:allocatedAsset AND allocated=:allocated',
                    ExpressionAttributeValues: {
                        ":pk": "ticket",
                        ":allocatedAsset": pk,
                        ":allocated": "TRUE"
                    }
                }).promise();
                if (ticket.Count == 0) {
                    res.send({ "message": "asset is free" })
                } else {
                    res.send(ticket)
                    logger.info("get ticket by asset Id : ticketByAssetId ("+req.params.assetId+")")
                }
            }

        } else {
            res.status(403).send({"errorCode":"1030","message":"Invalid access"})
        }
    } catch (err) {
        res.status(500).send({ "errorCode": "1907", "message": "An unexpected error occured" })
        logger.info("get tickey by asset id error : ",err)
    }

}


const assetOwned = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    let data;
    try {
        if (req.user.permission == "MANAGER") {
            data = await dynamo.query({
                TableName: TABLE_NAME,
                IndexName: 'sk-pk-index',
                KeyConditionExpression: 'sk=:pk',
                FilterExpression: 'allocatedUser=:allocatedUser',
                ExpressionAttributeValues: {
                    ":pk": "asset",
                    ":allocatedUser": req.user.email
                }
            }).promise();
            res.send(data);
            logger.info("ASSET OWNED BY MANAGERS : assetOwned (email : "+req.user.email+")")
        } else {
            res.status(403).send({"errorCode":"1030","message":"Invalid access"})
            logger.info("Invalid access : assetOwned")
        }
    } catch (err) {
        res.status(500).send({ "errorCode": "1907", "message": "An unexpected error occured" })
        logger.info("asset owned by manager error : ",err)
    }

}



// get all categories
const categories = async (values) => {
    let param ={
        TableName: TABLE_NAME,
        IndexName: 'sk-pk-index',
        KeyConditionExpression: 'sk=:pk',
        ExpressionAttributeValues: {
            ":pk": "category"
        },
        ProjectionExpression: 'pk',
        Limit : 15
    }
    if(values){
        param.ExclusiveStartKey = values
    }
    return await dynamo.query(param).promise();
    
   
}
// asset expiry notifucation
const expiryNotification = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    let message;
    let emails = [];
    let email;
    let ticketId;
    let data = await dynamo.query({
        TableName: TABLE_NAME,
        IndexName: 'sk-pk-index',
        KeyConditionExpression: 'sk=:pk',
        // FilterExpression: 'assetStatus=:assetStatus ',
        ExpressionAttributeValues: {
            ":pk": "ticket",
        },
    }).promise();

    for (const item of data.Items) {


        const expiryDate = new Date(item.expiryDate);

        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

        switch (diffDays) {
            case 3:

                message = "Asset" + " " + item.allocatedAsset + " " + "expires in 3 days"
                email = item.email
                emails = [];
                emails.push(email);
                ticketId = item.pk
                await addNotificationusers3(message, emails, ticketId);

                break;
            case 2:

                message = "Asset" + " " + item.allocatedAsset + " " + "expires in 2 days"
                email = item.email

                emails.push(email);
                ticketId = item.pk
                await addNotificationusers3(message, emails, ticketId);


                break
            case 1:

                message = "Asset" + " " + item.allocatedAsset + " " + "expires Today"
                email = item.email

                // getting all Infra  head 
                let body = await dynamo.query({
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
                emails = body.Items.map(head => head.pk);
                emails.push(email);
                ticketId = item.pk
                await addNotificationusers3(message, emails, ticketId);

                break;
            default:

        }
    }

    //  extending asset


}

// csv upload---asset
const assetCsv = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try{
        if (req.user.department != "INFRASTRUCTURE") {
            return  res.status(403).send({ "errorCode": "1030", "message": "Invalid access" })
        }
        
        let isValid = await validateFile(req.file)
        
        if(isValid){
            return res.status(400).send(isValid)
        }
        
        let lineNumber = 1;
        let csvData = [];
        fs.createReadStream(req.file.path)
            .pipe(parse({ columns: true }))
            .on('data', (row) => {
                csvData.push(row);
                csvData.splice(lineNumber, 1);
                lineNumber++;
            })

            .on('end', async () => {
                let newArr;

                if (csvData.length == 0) {
                   return res.status(400).send({ "errorCode": 1026, "message": "Uploading failed! Empty data" })
                } else {
                    //expected headers
                    let validHeaders = ["assetId", "modelNo", "category", "device", "expiryDate"]

                    //headers in csv
                    let csvHeaders = Object.keys(csvData[0]);
                    newArr = csvHeaders.every(header => validHeaders.includes(header)) && csvHeaders.length === validHeaders.length;
                    
                }
                if (!newArr) {
                    res.status(400).send({ "errorCode": 1027, "message": "Uploading failed! Invalid fields" })
                }
                else {
                    let response = await validateAndAdd(csvData)
                    if (response.message == "success") {
                        res.status(200).send(response)
                        logger.info("Asset uploaded successfully : assetCsv")
                    } else {
                        res.status(400).send(response)
                    }
                }
            });
            
        

    } catch (err) {
        res.status(500).send({ "errorCode": "1907", "message": "An unexpected error occured" })
        logger.info("bulk import asset error : ",err)
    }


}





async function validateAndAdd(csvData) {
    
        const invalidItems = [];
        const requiredItems = [];
        let message;
        for (const [index, item] of csvData.entries()) {
            let invalidFields;
            let requiredFields;
            item.pk = csvData[index].assetId.trim().toUpperCase()
            item.device = csvData[index].device.trim().toUpperCase()
            item.category = csvData[index].category.trim().toUpperCase()
            item.modelNo = csvData[index].modelNo.trim()
            delete csvData[index].assetId;

            //check format of date and convert into YYYY-MM-DD format
            let result1 = moment(item.expiryDate, "DD-MM-YYYY", true).isValid();
            if (result1) {
                let date = item.expiryDate;
                item.expiryDate = date.split("-").reverse().join("-");
            }


            //required items
            requiredFields = await validateInputs(item);
            if (requiredFields) {
                requiredItems.push({ "lineNumber": index + 2, requiredFields })
            } else {
                //validate data
                invalidFields = await validateCsv(item);
                if (invalidFields) {
                    invalidItems.push({ "lineNumber": index + 2, invalidFields })
                }
            }

            item.sk = "asset";
            item.assetStatus = "FALSE";
            item.allocatedUser = "INFRA";
            item.createDate = new Date().toISOString();
            item.updateDate = new Date().toISOString();
            item.ticketId = "";
            item.version = 1;
        }

        if (requiredItems.length > 0) {
            message = { "RequiredItems": requiredItems }
            return message;
        } else if (invalidItems.length > 0) {
            message = { "InvalidItems": invalidItems }
            return message;
        } 

        //duplicates inside csv or asset already exists
        let duplicate = await duplicateAssets(csvData)
        
        if (duplicate) {
            message = { "DuplicateItems": duplicate }
            return message;
        } 

        //add assets
        for (const item of csvData) {
            await dynamo.put({
                TableName: TABLE_NAME,
                Item: item
            }).promise();
        }
        message = { "message": "success" }
        return message;
            
        

    

}

//validate data inside csv file
async function validateCsv(item) {
    
        let errorMessage = [];
        if (item.expiryDate) {

            let dateFormat = moment(item.expiryDate, "YYYY-MM-DD", true).isValid();

            if (dateFormat) {
                let currDate = new Date()

                const currObj = moment(currDate, 'YYYY-MM-DD');
                const dateObj = moment(item.expiryDate, 'YYYY-MM-DD');
                const diffInDays = dateObj.diff(currObj, 'days');
                if (diffInDays < 0)
                    errorMessage.push({ "errorCode": "1088", "message": "Expiry date should not be less than current date" })

            } else {
                errorMessage.push({ "errorCode": "1021", "message": "Invalid expiryDate" })
            }

        }

        if(item.pk.length<4 || item.pk.length >30 ){
            errorMessage.push({ "errorCode": "1031", "message": "Invalid assetId" })
        }

        if(item.modelNo.length<4 || item.modelNo.length >30 ){
            errorMessage.push({ "errorCode": "1032", "message": "Invalid modelNo" })
        }

        if( item.device.length >20 ){
            errorMessage.push({ "errorCode": "1033", "message": "Invalid device" })
        }

        let categoryList = await dynamo.query({
            TableName: TABLE_NAME,
            IndexName: 'sk-pk-index',
            KeyConditionExpression: 'sk=:pk',
            ExpressionAttributeValues: {
                ":pk": "category"
            }
        }).promise();

        let catgry = categoryList.Items.map(categoryName => categoryName.pk);
        if (!catgry.includes(item.category.toUpperCase())) {
            errorMessage.push({ "errorCode": "1020", "message": "Invalid category" })
        }
        

        return errorMessage.length > 0 ? errorMessage : null;
    




}


//find duplicate assets inside csv or asset already exists in db
async function duplicateAssets(csvData) {
    
        let assetIds = new Set();
        let errors = [];
        csvData.forEach((obj, index) => {

            //check duplicates inside csv
            if (assetIds.has(obj.pk)) {
                errors.push({ lineNumber: index + 2, assetId: obj.pk, errorCode: 1025, error: "Duplicate assetId found" });
            }
            assetIds.add(obj.pk)
        })
        if (errors.length == 0) {

            //get all assetIds in db
            let assetId = await dynamo.query({
                TableName: TABLE_NAME,
                IndexName: 'sk-pk-index',
                KeyConditionExpression: 'sk=:pk',
                ExpressionAttributeValues: {
                    ":pk": "asset"
                },
                ProjectionExpression: 'pk'
            }).promise();
            let assets = assetId.Items.map(item => item.pk);
            assetIds = new Set(assets)

            //Assets already exists found in csv
            csvData.forEach((obj, index) => {
                if (assetIds.has(obj.pk)) {
                    errors.push({ lineNumber: index + 2, assetId: obj.pk, errorCode: 1024, error: "AssetId already exists" });
                }

            })
        }
        return errors.length > 0 ? errors : null;

   

}


const getById = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        if (req.user.department == "INFRASTRUCTURE") {
            const pk = req.params.assetId;
            const sk = "asset"
            let data = await dynamo.get({
                TableName: TABLE_NAME,
                Key: {
                    pk, sk
                },
                ProjectionExpression: 'pk,modelNo,category,device,expiryDate,ticketId,allocatedUser,version,assetStatus'
            }).promise();
            if (data.Item == undefined || data.Item.assetStatus == "DELETED") {
                res.status(400).send({ "errorCode": "1045", "message": "Invalid asset" })
            } else {
                res.send(data);
                logger.info("Asset details by Id : getById ("+pk+")")
            }
        } else {
            res.status(403).send({ "errorCode": "1030", "message": "Invalid access" })
        }
    } catch (err) {
        res.status(500).send({ "errorCode": "1907", "message": "An unexpected error occured" })
        logger.info("get asset by id error : ",err)
    }


}
// retrun asset 

const returnAsset = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        const pk = req.params.ticketId;
        const sk = "ticket";
        let ticket = await dynamo.get({
            TableName: TABLE_NAME,
            Key: {
                pk, sk
            }
        }).promise();
        if (ticket.Item == undefined) {
            res.status(400).send({ errorCode: "1123", message: "Invalid ticket" });
        }
        else {
            if (ticket.Item.allocated === "TRUE") {
                ticket.Item.expiryDate = "";
                ticket.Item.updateDate = new Date().toISOString();
                ticket.Item.allocated = "FALSE"
                logger.info("TICKET DETAILS BY ID : getTicketById");
                await dynamo.put({
                    TableName: TABLE_NAME,
                    Item: ticket.Item
                }).promise();

                const pk = ticket.Item.allocatedAsset;
                const sk = "asset";
                let asset = await dynamo.get({
                    TableName: TABLE_NAME,
                    Key: {
                        pk, sk
                    }
                }).promise();
                asset.Item.allocatedUser = "INFRA"
                asset.Item.assetStatus = "FALSE"
                asset.Item.updateDate = new Date().toISOString();
                await dynamo.put({
                    TableName: TABLE_NAME,
                    Item: asset.Item
                }).promise();

                res.status(200).send({ "message": "success" })
                logger.info("Return asset success : returnAsset")
            } else {
                res.status(400).send({ errorCode: "1124", message: "No asset to return" });
            }
        }
    } catch (err) {
        res.status(500).send({ "errorCode": "1907", "message": "An unexpected error occured" })
        logger.info("return asset error : ",err);
    }
}
// extend asset

const extendAsset = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.errors[0].msg);
    }
    if (req.user.department == "INFRASTRUCTURE") {
        try {
            const pk = req.params.ticketId;
            const sk = "ticket";
            let ticket = await dynamo.get({
                TableName: TABLE_NAME,
                Key: {
                    pk, sk
                }
            }).promise();
            let newexpiryDate =  req.body.extendedDate
            let isDateFormat = moment(newexpiryDate, "DD-MM-YYYY", true).isValid();

            if (isDateFormat) {
                
                
                newexpiryDate = newexpiryDate.split("-").reverse().join("-");
            }
         
            let diffDays =  await  dateValidator(newexpiryDate);
            if (diffDays < 0){
                  
                res.status(400).send({ errorCode: 1088, message: "Expiry date should not be less than current date"  })
                return
        
            }
            else if(isNaN(diffDays)) {
                res.status(400).send({ errorCode: 1088, message: "Invalid date"  })
                return
            }

            if (ticket.Item == undefined || ticket.Item.ticketstatus=="DELETED" ) {
                res.status(400).send({ errorCode: "1123", message: "Invalid ticket" });
            } else if (ticket.Item.ticketstatus != "APPROVED") {
                res.status(400).send({ errorCode: "1091", message: "No asset to extend" })
            } else {

                ticket.Item.expiryDate = newexpiryDate;
                ticket.Item.updateDate = new Date().toISOString();

                await dynamo.put({
                    TableName: TABLE_NAME,
                    Item: ticket.Item
                }).promise();
                res.status(200).send({ "message": "success" })
            }
        } catch(err) {
            
            res.status(500).send({ "errorCode": "1907", "message": "An unexpected error occured" })
            logger.info("extend asset error : ",err)
            
        }
    } else {
        res.status(403).send({ errorCode: "1030", message: "Invalid access" });

    }


}


const allAssetIds = async (req, res) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    try {
        let currDate = new Date().toISOString().split('T')[0]
        let date = new Date(currDate)

        let idList = [];
        let expDate;
        if (req.user.department == "INFRASTRUCTURE") {
            const cat = req.params.asset;
            let assetId = await dynamo.query({
                TableName: TABLE_NAME,
                IndexName: 'sk-pk-index',
                KeyConditionExpression: 'sk=:pk',
                FilterExpression: 'device=:device AND assetStatus=:assetStatus ',
                ExpressionAttributeValues: {
                    ":pk": "asset",
                    ":device": cat,
                    ":assetStatus": "FALSE"
                }
            }).promise();
            assetId.Items.forEach(element => {

                if (element.expiryDate) {
                    expDate = new Date(element.expiryDate)
                    if (expDate >= date)
                        idList.push(element.pk)
                } else {
                    idList.push(element.pk)
                }

            });
            res.send(idList)



        } else {
            res.status(403).send({ "errorCode": 1030, "message": "Invalid access" })
        }
    } catch (err) {
        res.status(500).send({ "errorCode": "1907", "message": "An unexpected error occured" })
        logger.info("get all asset id error : ",err)
    }


}


async function validateInputs(data) {
    let errorMessage = [];
    if (!data.pk) {
        errorMessage.push({ "errorCode": "1070", "message": "AssetId is required" })
    }

    if (!data.modelNo) {
        errorMessage.push({ "errorCode": "1071", "message": "ModelNo is required" })
    }

    if (!data.category) {
        errorMessage.push({ "errorCode": "1072", "message": "Category is required" })
    }

    if (!data.device) {
        errorMessage.push({ "errorCode": "1073", "message": "Device is required" })
    }

    return errorMessage.length > 0 ? errorMessage : null;


 }




 async function validateFile(file){
    let message;
    if(!file){
        message = { "errorCode": 1089, "message": "File is required" }
    }else if (file.mimetype !== "text/csv") {
        message = { "errorCode": 1023, "message": "Invalid file type!Only csv files are allowed" }
    } else if (file.size >  1024 * 1024) {
        message = { "errorCode": 1022, "message": "File size is too large! Maximum size is 1 MB" }
    } else {
        message = false;
    }
    return message

 }


 async function canEdit(data,req){
    
    let message ;

    if (data.Item == undefined || data.Item.assetStatus == "DELETED") {
        message = {"errorCode":"1083", "message": "Data not available" }
    }else if(data.Item.assetStatus == "TRUE"){
        message = {"errorCode":"1086","message":"Allocated assets cannot be edited / deleted"}
    } else if (data.Item.version != req.body.version) {
        message = {"errorCode":"1077", "message": "Asset version changed" }
    }
    else{
        message = false;
    }
    return message;

 

}
// date validator
const dateValidator = async (newexpiryDate) => {
    const expiryDate = new Date(newexpiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    return diffDays;
    }


module.exports = {
    createAsset,
    assetIdValidation,
    editAsset,
    deleteAsset,
    assetByCategory,
    allocateAsset,
    ticketByAssetId,
    viewAsset,
    viewAssetCategory,
    assetOwned,
    assetCsv,
    getById,
    expiryNotification,
    returnAsset,
    extendAsset,
    allAssetIds,
    validateFile




}