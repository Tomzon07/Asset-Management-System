const { body, param, query } = require('express-validator')
const { moment } = require('moment')
let val = 1;
const userValidator = (validationtype) => {
    switch (validationtype) {
        case ('createUser'): {
            return [
                body('email')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1065, message: "Email is required" })
                    .isEmail()
                    .withMessage({ errorCode: 1013, message: "Invalid Email" })
                    .isLength({ max: 50 })
                    .withMessage({ errorCode: 1013, message: "Invalid Email" }),

                body('name')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1066, message: "Name is required" })
                    .isLength({ min: 4, max: 30 })
                    .withMessage({ errorCode: 1019, message: "Invalid name" }),

                body('department')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1067, message: "Department is required" })
                    .isIn(["FINANCE", "CISO", "INFRASTRUCTURE", "HR", "DEVELOPMENT", "QA", "ADMIN"])
                    .withMessage({ errorCode: 1015, message: "Invalid department" }),

                body('permission')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1068, message: "Permission is required" })
                    .isIn(["ADMIN", "MANAGER", "HEAD"])
                    .withMessage({ errorCode: 1016, message: "Invalid permission" })
                    .custom(async (value, { req }) => {

                        if (req.body.department == "ADMIN" && value == "ADMIN")

                            return Promise.resolve()
                        else if (req.body.department != "ADMIN" && value != "ADMIN") {
                            return Promise.resolve()
                        }
                        return Promise.reject()
                    })
                    .withMessage({ errorCode: 1016, message: "Invalid permission" }),

                body('empId')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1069, message: "EmployeeId is required" })
                    .isLength({ min: 4, max: 6 })
                    .withMessage({ errorCode: 1017, message: "Invalid employeeId" })
                    .matches(/^(?!(0))\d+$/)
                    .withMessage({ errorCode: 1017, message: "Invalid employeeId" })


            ]
        }
    
        case ('login'): {
            return [
                body('email')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1050, message: "Email is required" })
                    .isEmail()
                    .withMessage({ errorCode: 1001, message: "Invalid Email" }),

                body('password')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1051, message: "Password is required" })
                    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!^><)(%*#?&])[A-Za-z\d@$!^><)(%*#?&]{8,16}$/)
                    .withMessage({ errorCode: 1012, message: "Invalid password" })
            ]
        }
        case 'deleteUser': {
            return [
                query('pk')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1061, message: "Pk is required" }),


                query('sk')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1062, message: "Sk is required" })


            ]
        }
        case ('changePassword'): {
            return [
                body('currPassword')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1052, message: "Current password is required" }),

                body('newPassword')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1053, message: "New password is required" })
                    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!^><)(%*#?&])[A-Za-z\d@$!^><)(%*#?&]{8,16}$/)
                    .withMessage({ errorCode: 1012, message: "Invalid new password" })
            ]
        }
        case ('forgotPassword'): {
            return [
                body('email')
                    .trim()
                    .notEmpty()
                    .withMessage({ errorCode: 1050, message: "Email is required" })
                    .isEmail()
                    .withMessage({ errorCode: 1001, message: "Invalid email" })
            ]
        }
        case ('emailValidation'): {
            return [
                param('email')
                    .isEmail()
                    .withMessage({ errorCode: 1001, message: "Invalid Email" })
            ]
        }
        case ('empIdValidation'): {
            return [
                param('empId')
                    .isLength({ min: 4, max: 6 })
                    .withMessage({ errorCode: 1017, message: "Invalid EmpId" })
                    .isNumeric()
                    .withMessage({ errorCode: 1017, message: "Invalid empId" })
            ]
        }
    }
}


const editUser = (validationtype) => {
if(validationtype == "userEdit") {
    return [


        body('email')
            .trim()
            .notEmpty()
            .withMessage({ errorCode: 1065, message: "Email is required" })
            .isEmail()
            .withMessage({ errorCode: 1013, message: "Invalid Email" })
            .isLength({ max: 50 })
            .withMessage({ errorCode: 1013, message: "Invalid Email" }),

        body('name')
            .trim()
            .notEmpty()
            .withMessage({ errorCode: 1066, message: "Name is required" })
            .isLength({ min: 4, max: 30 })
            .withMessage({ errorCode: 1019, message: "Invalid name" }),

        body('department')
            .trim()
            .notEmpty()
            .withMessage({ errorCode: 1067, message: "Department is required" })
            .isIn(["FINANCE", "CISO", "INFRASTRUCTURE", "HR", "DEVELOPMENT", "QA", "ADMIN"])
            .withMessage({ errorCode: 1015, message: "Invalid department" }),

        body('permission')
            .trim()
            .notEmpty()
            .withMessage({ errorCode: 1068, message: "Permission is required" })
            .isIn(["ADMIN", "MANAGER", "HEAD"])
            .withMessage({ errorCode: 1016, message: "Invalid permission" })
            .custom(async (value, { req }) => {

                if (req.body.department == "ADMIN" && value == "ADMIN")

                    return Promise.resolve()
                else if (req.body.department != "ADMIN" && value != "ADMIN") {
                    return Promise.resolve()
                }
                return Promise.reject()
            })
            .withMessage({ errorCode: 1016, message: "Invalid permission" }),


        body('version')
            .trim()
            .notEmpty()
            .withMessage({ errorCode: 1076, message: "Version is required" })
            .isNumeric()
            .withMessage({ errorCode: 1078, message: "Invalid version" })




    ]
}
}

module.exports = { userValidator,editUser };