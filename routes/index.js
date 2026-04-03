const express = require("express");
const app = express()

app.use("/auth", require("../controllers/auth"));

app.use("/customers", require("./customers"));

app.use("/store", require("./store"));

app.use("/quotations", require("./quotation"));

app.use('/sale-invoices', require('./sale_invoice'))

module.exports = app