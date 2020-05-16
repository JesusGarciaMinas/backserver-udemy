// Requires
var express = require("express");
var mongoose = require('mongoose');


// Inicializar variables
var app = express();

// Conexión a la Base de Datos
mongoose.connect('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true });

// Rutas
app.get("/", (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

// Escuchar peticiones
app.listen(3000, () => {
    console.log("Node/Express: \x1b[36m%s\x1b[0m", "online");
});