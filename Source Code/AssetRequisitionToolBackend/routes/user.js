const express = require('express');
const user = require('../controller/user');
const router = express.Router();
const multer = require('multer');
const { authenticateToken, authenticateTokenAdmin } = require("../auth")
const logger = require('../logger.util')
require('dotenv').config();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.FILE_PATH);
  },
  filename: (req, file, cb) => {
    cb(null, new Date() + '-' + file.originalname);
  }
});

const upload = multer({ storage: fileStorage });
const {userValidator, editUser} = require('../middleware/validator/user.validator')



router.get('/', authenticateTokenAdmin, user.getAllUsers)
  .post('/',authenticateTokenAdmin,userValidator('createUser'),user.createUser)
  .put('/', authenticateTokenAdmin,editUser('userEdit'),user.EditUser)
  .get('/email/:email', authenticateToken, user.getUserByEmail)
  .post('/csv', authenticateTokenAdmin, upload.single('csv'),user.csv)
  .post('/login',userValidator('login'), user.userLogin)
  .put('/del', authenticateTokenAdmin,userValidator('deleteUser'), user.deleteUser)
  .get('/search/:username', authenticateTokenAdmin, user.searchUser)
  .get('/pagination', authenticateTokenAdmin, user.userPaginated)
  .post('/changepassword', authenticateToken,userValidator('changePassword'), user.changePassword)
  .put('/refreshAccessToken',user.getAccessTokenService)
  .get('/validempId/:empId',authenticateTokenAdmin,userValidator('empIdValidation'),user.empIdValidation)
  .put('/forgotpassword',userValidator('forgotPassword'), user.forgotPassword)
  .get('/validateEmail/:email',authenticateTokenAdmin,userValidator('emailValidation'),user.emailValidation)
  .get('/userDetails',authenticateToken,user.userDetails)
  .get('/notification',authenticateToken,user.getNotification)
  .put('/notification/:notificationId',authenticateToken,user.viewNotification)



  router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .send({errorCode: 720 ,message: "Invalid file"  });
    } else if (err) {
      return res.status(404).send({ message: "unknown error", errorCode: 500 });
    }
  });
module.exports = router;