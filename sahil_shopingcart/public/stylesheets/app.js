const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');


const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');


mongodb://sahil_1656:sahil_1656@cluster0-shard-00-00-n7bqn.mongodb.net:27017,cluster0-shard-00-01-n7bqn.mongodb.net:27017,cluster0-shard-00-02-n7bqn.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin

mongoose.connect(
  "mongodb://sahil_1656:"
  + process.env.MONGO_ATLAS_PW +
  "@cluster0-shard-00-00-n7bqn.mongodb.net:27017,cluster0-shard-00-01-n7bqn.mongodb.net:27017,cluster0-shard-00-02-n7bqn.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin",

);
mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use(express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// (req, res, next) => {
//   const authorization = req.get('authorization');
//   const token = authorization.split('Bearer ')[1];
//   ...
// }

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

let Product = require("./api/models/product");

//load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//set public folder
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res){
  Product.find({}, function(err, products){
      if (err) {
        console.log(err);
      } else {
        res.render('index', {
        title: 'Products',
        products: products
      });
    }
  });
});


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
  }
  next();
})

//Route whicg should handle requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);

app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error)
})

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
