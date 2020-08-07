var createError = require('http-errors');
var express = require('express');
var path = require('path');
require('./helpers/constants').loadConstants();
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const rateLimit = require("express-rate-limit");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
global.autoIncrement = require('mongoose-auto-increment-fix');
var uristring = process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/asdApp',
    session = require('express-session');
global.db = mongoose.createConnection(uristring,{useNewUrlParser: true }, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uristring);
    }
});

autoIncrement.initialize(db);

var app = express();
app.use(bodyParser.json({limit: '50mb', extended: true,parameterLimit:50000000}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true,parameterLimit:50000000}))
app.disable('x-powered-by');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000 // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);
var companyRouter = require('./routes/webservice/company');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
var serviceAccount = require("./routes/webservice/users/asdapp.json");


global.publicPath="/home/user01/asdapp-Backend/public/";
global.publicLink="http://192.168.22.51:3000/";
global.IosVersion=1;
global.AndroidVersion=1;
global.versionCode="0.1";
app.use(fileUpload());


app.use(function (req,res,next) {
    console.log(req.protocol + '://' + req.get('host') + req.originalUrl)
    next();
});

//todo comment one below line on real server
global.panelurl="http://localhost:3000/";
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session(
        {
            secret: process.env.SESSION_SECRET || 'asd_app',
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge: 7 * 24 * 60 * 60 * 1000 // seconds which equals 1 week
            }
        }
    )
);

app.use('/webservice/company', companyRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    console.log(err);
    // render the error page
    res.status(err.status || 500);
    res.json({
        status: 'error',
        message: err.message || 'An error occured',
    });
});

module.exports = app;
