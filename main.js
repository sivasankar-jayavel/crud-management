// Imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require("express-session");

const app = express();
const Port = process.env.PORT || 3000;

// DB Connection
const connectDB = ()=>{
    mongoose.connect(process.env.DB_URI).then(con=>{
        console.log(`MongoDB is connected to the Host : ${con.connection.host}`)
    });
}
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended:false}));
app.use(session({
    secret:'secret key',
    saveUninitialized:true,
    resave:false
}));

app.use((req, res ,next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next()
});

// set template engine
app.set('view engine','ejs')

// route Prefix
app.use("",require('./routes/routes'));

app.listen(Port ,
console.log(`Server is running at : http://localhost:${Port}`)
);