const express = require("express");

const app = express();

// settings
app.set("port", process.env.PORT || 3000);

module.exports = app;