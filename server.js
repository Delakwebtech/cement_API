const dotenv = require('dotenv');

// Load env vars
const path = require('path');
dotenv.config({path: './config/config.env'});

const express = require('express');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const cors = require('cors');


// connect to database
connectDB();


// Route files
const cements = require('./routes/cements');
const auth = require('./routes/auth');
const order = require('./routes/order');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Body Perser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// File upload
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/cements', cements);
app.use('/api/auth', auth);
app.use('/api/order', order);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);


// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // close server and exit process
    server.close(() => process.exit(1)); 
});