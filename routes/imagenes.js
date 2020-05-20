var express = require("express");
var app = express();

var path = require("path");
var fs = require("fs");

app.get("/:tipo/:imagen", (req, res, next) => {
    var tipo = req.params.tipo;
    var img = req.params.imagen;

    var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);
    console.log(pathImagen);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImage = path.resolve(__dirname, "../assets/no-img.jpg");
        res.sendFile(pathNoImage);
    }
});

module.exports = app;