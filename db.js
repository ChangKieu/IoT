const mysql = require('mysql2');
require('dotenv').config();

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USERNAME);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_DATABASE:", process.env.DB_DATABASE);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,  
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE 
}).promise();

module.exports = pool;
