const express = require('express');
const ticket = require('../controller/ticket')
const router = express.Router();
const multer = require('multer');
const { authenticateToken, authenticateTokenAdmin, authenticateTokenHead } = require("../auth")
const logger = require('../logger.util')
require('dotenv').config();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.FILE_PATH);
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().split('.')[0]+":"+'.'+file.mimetype.split('/')[1]);
    
  }
});

const upload = multer({ storage: fileStorage });
const {ticketValidator} = require('../middleware/validator/ticket.validator')

router.get('/',  ticket.getAllTickets)
  .get('/category',authenticateToken,ticket.allCategory)
  .post('/', authenticateToken, upload.single('ticketFile'),ticketValidator('createTicket'), ticket.createTicket)
  .put('/:ticketId', authenticateToken,upload.single('ticketFile'),ticketValidator('createTicket'), ticket.editTicket)
  .put('/del/:ticketId', authenticateToken, ticket.deleteTicketById)
  .get('/department/:deptName', authenticateToken, ticket.getTicketByDepartment)
  .get('/email/:email', authenticateToken, ticket.getTicketByEmail)
  .get('/ticketcount', authenticateToken, ticket.countCompletedTicket)
  .get('/pagination', authenticateToken, ticket.Paginated)
  .get('/:ticketId', authenticateToken, ticket.getTicketById)
  .post('/setlevel', authenticateTokenHead,upload.single('ticketFile'),ticketValidator('setlevel'), ticket.SetLevelTicket)
  .post('/setstatus', authenticateTokenHead,ticketValidator('setlevel'), ticket.SetStatusTicket)
  .get('/search/projectid', authenticateToken, ticket.searchTicketByProjectId)
  .get('/allticket', authenticateToken, ticket.getAllPaginated)
  .post('/category',authenticateToken,ticketValidator('createCategory'),ticket.createCategory)
  .post('/tickethistory',ticket.ticketHistory)



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