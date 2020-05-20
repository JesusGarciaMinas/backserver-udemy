var express = require("express");
var mdAutenticacion = require("../middlewares/autenticacion");

var app = express();

var Hospital = require("../models/hospital");

// obtener todos los hospitales
app.get("/", (req, res, next) => {
    var desde = req.query.desde || 0;

    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate("usuario", "nombre email")
        .exec((err, hospitales) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando hospital",
                    errors: err,
                });
            }
            Hospital.count({}, (err, contar) => {
                return res.status(200).json({
                    ok: true,
                    hospital: hospitales,
                    total: contar,
                });
            });
        });
});

// Actualizar hospital
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar hospital",
                errors: err,
            });
        } else if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: "El hospital con el id " + id + " no existe",
                errors: { message: "No existe un hospital con ese ID" },
            });
        } else {
            var body = req.body;
            hospital.nombre = body.nombre;
            hospital.usuario = req.usuario._id;

            hospital.save((err, hospitalGuardado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Error al actualizar hospital",
                        errors: err,
                    });
                } else {
                    return res.status(200).json({
                        ok: true,
                        hospital: hospitalGuardado,
                    });
                }
            });
        }
    });
});

// Crear un nuevo hospital
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id,
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear el hospital",
                errors: err,
            });
        } else {
            return res.status(201).json({
                ok: true,
                hospital: hospitalGuardado,
            });
        }
    });
});

// Eliminar hospital
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar el hospital",
                errors: err,
            });
        } else if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe ningún hospital con ese ID",
                errors: { message: "No existe ningún hospital con ese ID" },
            });
        } else {
            return res.status(200).json({
                ok: true,
                hospital: hospitalBorrado,
            });
        }
    });
});

module.exports = app;