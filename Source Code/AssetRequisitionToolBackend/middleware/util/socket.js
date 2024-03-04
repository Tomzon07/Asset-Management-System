const logger = require('../../logger.util')


let ioObj;
let connectedUsers = {};
const connect = (io) => {
  ioObj = io;
  io.on("connection", (socket) => {
   
    // Store the user ID when the user connects
    socket.on("userConnected", (userId) => {
      connectedUsers[socket.id] = userId.toLowerCase();
     
    });

    socket.on("disconnect", () => {
      // Remove the user ID when the user disconnects
      removeUser(socket.id);
    });

    socket.on("message", (msg) => {
      io.emit("notifyMe/3", msg);
    });
  });
};

const removeUser = (socketId) => {
 
  delete connectedUsers[socketId];
};


const notificationCountSend = (userId,count)=>{
  
 
  for (const key of Object.keys(connectedUsers)) {
    if (connectedUsers[key] === userId) {
      
      ioObj.to(key).emit("notificationCount");
      logger.info("socket working");
    }else{
      logger.info("user not found");
    }
  }
  

  }
  



module.exports = { connect,notificationCountSend};