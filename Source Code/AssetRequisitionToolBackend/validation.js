const joi = require('joi').extend(require('@joi/date'))

const schema = {

    user: joi.object({
        pk: joi.string().email().required(),
        sk: joi.string().required(),
        name: joi.string().required().max(30).min(4),
        department: joi.string().required().valid("FINANCE", "CISO", "INFRASTRUCTURE", "HR", "DEVELOPMENT", "QA", "ADMIN"),
        permission: joi.string().required().valid("HEAD", "MANAGER", "ADMIN"),
        employeeId: joi.string().required().regex(/^(?!(0))[0-9]+$/).max(6).min(4),
        userStatus: joi.number().required(),
        password: joi.string().required(),
        createDate: joi.date().required(),
        updateDate: joi.date().required(),
        version: joi.number().required(),
        emailForSearch: joi.string().email().required()

    }),
    ticket: joi.object({
        pk: joi.string().required(),
        sk: joi.string().required(),
        department: joi.string().required().valid("FINANCE", "CISO", "INFRASTRUCTURE", "HR", "DEVELOPMENT", "QA"),
        title: joi.string().required().max(30).min(4),
        projectcode: joi.string().required().max(20).min(4),
        forward: joi.string().required(),
        projectname: joi.string().required().max(30).min(4),
        email: joi.string().email().required(),
        category : joi.string().required().min(4).max(30),
        device : joi.string().required().min(4).max(30),
        ticketstatus: joi.string().required().valid("PENDING", "APPROVED", "REJECTED", "DELETED"),
        level: joi.string().required().valid("HEAD", "CISO", "INFRASTRUCTURE", "FINANCE"),
        allLevel: joi.array().items(joi.string().valid("HEAD", "CISO", "INFRASTRUCTURE", "FINANCE")).required(),
        createDate: joi.date().required(),
        updateDate: joi.date().required(),
        path: joi.string(),
        estimatePath: joi.string().required(),
        description: joi.string().required().max(100),
        history : joi.array().required()
    }),
    otherTicket: joi.object({
        pk: joi.string().required(),
        sk: joi.string().required(),
        department: joi.string().required().valid("FINANCE", "CISO", "INFRASTRUCTURE", "HR", "DEVELOPMENT", "QA"),
        title: joi.string().required().max(30).min(4),
        projectcode: joi.string().required().max(20).min(4),
        forward: joi.string().required(),
        projectname: joi.string().required().max(30).min(4),
        email: joi.string().email().required(),
        category : joi.string().required().min(4).max(30),
        device : joi.string().required().min(4).max(30),
        deviceName : joi.string().required().min(4).max(30),
        ticketstatus: joi.string().required().valid("PENDING", "APPROVED", "REJECTED", "DELETED"),
        level: joi.string().required().valid("HEAD", "CISO", "INFRASTRUCTURE", "FINANCE"),
        allLevel: joi.array().items(joi.string().valid("HEAD", "CISO", "INFRASTRUCTURE", "FINANCE")).required(),
        createDate: joi.date().required(),
        updateDate: joi.date().required(),
        path: joi.string(),
        estimatePath: joi.string().required(),
        description: joi.string().required().max(100),
        history : joi.array().required()
    }),
    ticketlevel: joi.object({
        pk: joi.string().required(),
        sk: joi.string().required().valid("FINANCE", "CISO", "INFRASTRUCTURE", "HR", "DEVELOPMENT", "QA"),
        email: joi.string().email().required(),
        createDate: joi.date().required(),
        updateDate: joi.date().required(),
        filepath: joi.string(),
        remark: joi.string()
    }),
    login: joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(8).max(16).regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!^><)(%*#?&])[A-Za-z\d@$!^><)(%*#?&]{8,16}$/).required()
    }),
    changePass: joi.object({
        currPassword: joi.string().min(8).max(16).regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!^><)(%*#?&])[A-Za-z\d@$!^><)(%*#?&]{8,16}$/).required(),
        newPassword: joi.string().min(8).max(16).regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!^><)(%*#?&])[A-Za-z\d@$!^><)(%*#?&]{8,16}$/).required()
    }),
    empIdValid: joi.object({
        employeeId: joi.string().required().regex(/^(?!(0))[0-9]+$/)
    }),
    emailValid: joi.object({
        email: joi.string().email().required().max(50)
    }),
    notification: joi.object({
        pk: joi.string().required(),
        sk: joi.string().required(),
        email: joi.string().email(),
        assetId:joi.string().optional(),
        ticketId:joi.string().required(),
        message: joi.string().required(),
        status: joi.string().required(),
        createDate: joi.date().required(),
        updateDate :joi.date().required()
    }),
    category:joi.object({
        pk:joi.string().required(),
        sk: joi.string().required(),
        createDate: joi.date().required(),
        updateDate :joi.date().required()
    }),
    asset : joi.object({
        pk : joi.string().required().min(4).max(30),
        sk : joi.string().required(),
        modelNo : joi.string().required().max(30).min(4),
        category : joi.string().required().max(30),
        device :joi.string().required().max(20),
        expiryDate : joi.date().format('YYYY-MM-DD').utc().greater(Date.now()),
        version : joi.number().required(),
        assetStatus : joi.string().required(),
        allocatedUser : joi.string().required(),
        createDate : joi.string().required(),
        updateDate : joi.string().required()
    }),
    assetIdValid : joi.object({
        assetId : joi.string().required().min(4).max(30)
    }),
    modelNoValid : joi.object({
        modelNo : joi.string().required().max(30).min(4),
    }),
    categoryValid : joi.object({
        category : joi.string().required().max(30)
    }),
    deviceValid : joi.object({
        device : joi.string().required().max(20)
    }),
    expiryDateValid : joi.object({
        expiryDate : joi.date().format('YYYY-MM-DD').utc().greater(Date.now()).optional()
    })
}
module.exports = schema;