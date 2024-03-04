const express = require('express');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-south-1' });
const bodyParser = require('body-parser');
const ticketRoutes = require('./routes/ticket');
const userRoutes = require('./routes/user');
const assetRoutes = require('./routes/asset');
const app = express();
const multer = require('multer');
const upload = multer();
const morgan = require('morgan');

const webSocketPort =process.env.WEB_SOCKET_PORT
const server = require('http').createServer(app);
const io = require("socket.io")(server, {
  cors: {
    orgin: [webSocketPort],
  },
});
require("./middleware/util/socket").connect(io);

// for parsing application/json
app.use(express.json());
const cors = require('cors')
app.use(cors())
require('dotenv').config();
const PORT = process.env.PORT;
app.use(bodyParser.json());
app.use('/tickets', ticketRoutes);
app.use('/users', userRoutes);
app.use('/assets',assetRoutes);
app.use(morgan('combined'));

app.use("/uploads", express.static('uploads'))
server.listen(PORT, () => console.log(`Server Running on port:${PORT}`));
app.get('/',() =>console.log('server running'));



