const dotenv = require('dotenv');
dotenv.config();

const CONFIG = {
    PORT: 3000 || process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET
}


module.exports = {
    CONFIG
}