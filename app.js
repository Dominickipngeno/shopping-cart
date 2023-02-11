require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo');
var passport= require("passport")
var flash = require('connect-flash')
var expressLayouts = require('express-ejs-layouts');
const { init } = require('./models/User')
const userRoutes = require('./routes/user')
const app = express()
require('./config/passport')

const PORT = process.env.PORT || 5000

mongoose.set('strictQuery', false);
//db connectionss
mongoose.connect(process.env.DB_URI,{useNewUrlParser: true, useUnifiedTopology: true})

const db = mongoose.connection
db.on("error", (error)=> console.log(error))
db.once("open", ()=>console.log("Connected to the database!"))

app.use(express.urlencoded({ extended: true}))
//set engine
app.set('view engine', 'ejs')
//express layouts
app.use(expressLayouts);
//bodyparser
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
//statics folders
app.use(express.static('public'))
 //image folders
 app.use(express.static('uploads'))
 //validator
//sessions
app.use(session({
    secret: 'secret',
    resave:true,
    saveUninitialized: true,
    store: MongoStore.create({mongoUrl:'mongodb://localhost:27017/shopping'}),
    cookie:{maxAge: 180 * 60* 1000 }
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.use(function(req,res,next){
    res.locals.login =req.isAuthenticated()
     res.locals.session = req.session;
    next()
})

// call routes 
app.use('/', require('./routes/index'))
app.use('/user', require('./routes/user'))
//setting server
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
 });