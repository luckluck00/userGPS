const express = require('express');
const app = express();
const morgan =require('morgan');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const userRoutes = require('./api/routes/user');
const friendRoutes = require('./api/routes/friend')
const driverRoutes = require('./api/routes/driver');
const mongoose = require('mongoose');
const io = require('socket.io');

require('dotenv').config()


mongoose.connect(
    `mongodb+srv://luck04280428:`+process.env.MONGO_ATLAS_PW+`@cluster0.thiqewb.mongodb.net/?retryWrites=true&w=majority`
);
app.use(fileUpload());

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin' , '*');
    res.header(
        "Access-Contrlo-Allow-Headers" ,
        "Origin, X-Request-With, Content-Type, Accept , Authorization"
    );   
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods' , 'PUT, POST, PATCH, DELECT , GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/friend', friendRoutes);
app.use('/user', userRoutes);
app.use('/driver' , driverRoutes);
//app.use('/socket.io', ioRouter);

// 中介軟體設置
  
app.get("/" , (req, res ) => {
    res.send("Hello world!");
});

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});


module.exports = app;