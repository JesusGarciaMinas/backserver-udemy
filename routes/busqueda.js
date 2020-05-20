var express = require("express");
var app = express();

var Hospital = require("../models/hospital");

var Medico = require("../models/medico");

var Usuario = require("../models/usuario");

// Búsqueda por colección
app.get("/coleccion/:tabla/:busqueda", (req, res, next) => {
    var busqueda = req.params.busqueda;

    var regex = new RegExp(busqueda, "i");

    var tabla = req.params.tabla;

    switch (tabla) {
        case "usuarios":
            promesa = buscarUsuarios(regex);
            break;
        case "hospital":
            promesa = buscarHospitales(regex);
            break;
        case "medico":
            promesa = buscarMedicos(regex);
            break;
        default:
            res.status(400).json({
                ok: false,
                mensaje: "Los tipos de búsqueda válidos solo son: usuarios, médicos y hospitales",
                error: { mensaje: "Tipo de tabla / colección no válido" },
            });
            break;
    }
    promesa.then((data) => {
        res.status(200).json({
            ok: true,
            [tabla]: data,
        });
    });
});

// Búsqueda general
app.get("/todo/:busqueda", (req, res, next) => {
    var busqueda = req.params.busqueda;

    var regex = new RegExp(busqueda, "i");

    Promise.all([
        buscarHospitales(regex),
        buscarMedicos(regex),
        buscarUsuarios(regex),
    ]).then((respuestas) => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2],
        });
    });
});

function buscarHospitales(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find()
            .populate("usuario", "nombre email")
            .populate("hospital")
            .exec({ nombre: regex }, (err, hospitales) => {
                if (err) {
                    reject("Error al cargar hospitales");
                }
                resolve(hospitales);
            });
    });
}

function buscarMedicos(regex) {
    return new Promise((resolve, reject) => {
        Medico.find()
            .populate("usuario", "nombre email")
            .populate("hospital")
            .exec({ nombre: regex }, (err, medicos) => {
                if (err) {
                    reject("Error al cargar medicos");
                }
                resolve(medicos);
            });
    });
}

function buscarUsuarios(regex) {
    return new Promise((resolve, reject) => {
        Usuario.find()
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject("Error al cargar usuarios");
                }
                resolve(usuarios);
            });
    });
}

module.exports = app;