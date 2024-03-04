const { body, param } = require('express-validator')
const {moment} = require('moment')
const ticketValidator = (validationtype) => {   
    switch (validationtype) {
        case 'setlevel': {
            return [
                body('pk')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode:1061 , message:"Pk is required" }),


                body('sk')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode:1062 , message:"Sk is required" })
                    
              
            ]
        }
        case 'createTicket':{
            return [
                body('title')
                    .trim()
                   
                    .notEmpty()
                    .withMessage({ errorCode:1054 , message : "Title is required" })
                    .isLength({min:4,max:30})
                    .withMessage({ errorCode: 1003 , message : "Invalid title" }),

                body('projectname')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode:1056 , message : "Project name is required" })
                    .isLength({min:4,max:30})
                    .withMessage({ errorCode: 1006 , message : "Invalid project name" }),

                body('projectcode')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode:1055 , message : "Project code is required" })
                    .isLength({min:4,max:20})
                    .withMessage({ errorCode: 1004 , message : "Invalid project code" })
                    .matches(/^(?!\d)[\p{L}\p{M}0-9]*$/u)
                    .withMessage({ errorCode: 1004, message:  "Invalid project code" }),

                body('description')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode:1059 , message : "Description is required" })
                    .isLength({max:100})
                    .withMessage({ errorCode: 1007 , message : "Invalid description" }),
                    
                body('category')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode:1057 , message : "Category is required" }),

                body('device')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode:1058 , message : "Device is required" })
                    .custom(async (value,{ req }) => {
                       
                        if ((req.body.category == "OTHER" && value == "OTHER") || (value == "OTHER")){
                            if(!req.body.deviceName){
                                return Promise.reject({errorCode : 1080,message  : "Device name is required"})
                            }else if(req.body.deviceName.length < 4 || req.body.deviceName.length > 30){
                                return Promise.reject({errorCode: 1008, message: "Invalid device name"})
                            }else{
                                return Promise.resolve()
                            }
                        }
                            
                    })

            ]
        }
        case 'createCategory':{
            return[
                body('category')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode:1075 , message : "Category is required" })
                    .isLength({min:4,max:30})
                    .withMessage({ errorCode:1036 , message : "Invalid category name" })
            ]
        }

    }
}
module.exports = { ticketValidator }