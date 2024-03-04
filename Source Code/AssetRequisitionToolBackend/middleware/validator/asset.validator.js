const { body, param, query } = require('express-validator')
const moment = require('moment')

const assetValidator = (validationtype) => {
    switch (validationtype) {
        case 'allocateAsset': {
            return [
                body('assetId')
                    .trim()
                    .notEmpty()
                    .withMessage({ message: "AssetId is required ", errorCode: 1070 }),


                body('ticketId')
                    .trim()
                    .notEmpty()
                    .withMessage({ message: "TicketId is required", errorCode: 1062 }),

                body('expiryDate')
                
                    .trim()
                    .notEmpty()
                    .withMessage({errorCode:1021,message:"Invalid expiryDate"})



            ]
        }
        case 'viewasset': {
            return [
                param('view')
                    .trim()
                    .isIn(["free", "allocated", "total"])
                    .withMessage({ message: "Invalid option", errorCode: 2023 })
            ]

        }
        case 'extend': {
            return [
                body('extendedDate')
                    .notEmpty()
                    .withMessage({ errorCode: 1122, message: "Date required" })
                   
                   
            ]
        }
        case 'addAsset': {
            return [
                body('assetId')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1070, message: "AssetId is required" })
                    .isLength({ min: 4, max: 30 })
                    .withMessage({ errorCode: 1031, message: "Invalid assetId" }),

                body('modelNo')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1071, message: "ModelNo is required" })
                    .isLength({ min: 4, max: 30 })
                    .withMessage({ errorCode: 1032, message: "Invalid modelNo" }),

                body('category')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1072, message: "Category is required" })
                    .isLength({ min: 4, max: 30 })
                    .withMessage({ errorCode: 1020, message: "Invalid category" }),

                body('device')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1073, message: "Device is required" })
                    .isLength({ max: 20 })
                    .withMessage({ errorCode: 1033, message: "Invalid device" }),





            ]
        }
        case 'editAsset': {
            return [
                body('assetId')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1070, message: "AssetId is required" })
                    .isLength({ min: 4, max: 30 })
                    .withMessage({ errorCode: 1032, message: "Invalid assetId" }),

                body('modelNo')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1070, message: "ModelNo is required" })
                    .isLength({ min: 4, max: 30 })
                    .withMessage({ errorCode: 1032, message: "Invalid modelNo" }),

                body('category')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1072, message: "Category is required" })
                    .isLength({ min: 4, max: 30 })
                    .withMessage({ errorCode: 1020, message: "Invalid category" }),

                body('device')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1073, message: "Device is required" })
                    .isLength({ max: 20 })
                    .withMessage({ errorCode: 1033, message: "Invalid device" }),


                body('version')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1076, message: "Version is required" })
                    .isNumeric()
                    .withMessage({ errorCode: 1078, message: "Invalid version" })

            ]
        }
        case 'deleteAsset': {
            return [
                query('pk')
                    .notEmpty()
                    .withMessage({ errorCode: 1061, message: "Pk is required" }),
                query('sk')
                    .notEmpty()
                    .withMessage({ errorCode: 1062, message: "Sk is required" })




            ]
        }

        case 'validateAssetId': {
            return [
                param('assetId')
                    .trim()
                    .isLength({ min: 4, max: 30 })
                    .withMessage({ errorCode: 1017, message: "Invalid assetId" })
            ]
        }

    }

}
module.exports = { assetValidator }