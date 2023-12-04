const ChatSocketHander = require('./chatindex');

const Message = (io) => {
  return async (socket) => {
    console.log('Client connected with id:', socket.id);
  
    const chatSocketHander = new ChatSocketHander();
    
    socket.on('login', (token) => {
      const userEmail = chatSocketHander.connect(token);
      console.log(userEmail); 
      socket.userEmail = userEmail;
      socket.join(userEmail);
      socket.emit('loggedIn', userEmail);
    });
    
    /*try {
      const result = await chatSocketHander.getMessage();
      if (result.success) {
        const data = result.data;
        socket.emit('historyData', data);
        console.log("123")
      } else {
        console.error(result.error);
      }
    } catch (err) {
      console.error(err);
    }*/
    socket.on('historyMessage', async (data)  => {
      const result = await chatSocketHander.getMessage(data);
      if (result.success) {
        const data = result.data;
        socket.emit('historyData', data);
        console.log("123")
      } else {
        console.error(result.error);
      }
    })


    socket.on('sendMessage', async (data) => {
      const senderEmail = socket.userEmail;
      const recipientEmail = data.friendEmail;
      const message = await chatSocketHander.sendMessage(data, socket.id);
      socket.emit('MessageSaved', { message: 'Message data saved to MongoDB!' });
      // Emit the message to the recipient's room
      socket.to(recipientEmail).emit('privateMessage', { sender: senderEmail, message: message });
    });
  };
};

module.exports = { Message };
