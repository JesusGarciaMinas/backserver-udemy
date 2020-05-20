var express = require("express");
var mdAutenticacion = require("../middlewares/autenticacion");

var app = express();

var Medico = require("../models/medico");

// obtener todos los medicos
app.get("/", (req, res, next) => {
    var desde = req.query.desde || 0;

    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate("usuario", "nombre email")
        .populate("hospital")
        .exec((err, medicos) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando medico",
                    errors: err,
                });
            }
            Medico.count({}, (err, contar) => {
                return res.status(200).json({
                    ok: true,
                    medico: medicos,
                    total: contar,
                });
            });
        });
});

// Actualizar medico
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar medico",
                errors: err,
            });
        } else if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: "El medico con el id " + id + " no existe",
                errors: { message: "No existe un medico con ese ID" },
            });
        } else {
            var body = req.body;
            medico.nombre = body.nombre;
            medico.usuario = req.usuario._id;
            medico.hospital = body.hospital;

            medico.save((err, medicoGuardado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Error al actualizar medico",
                        errors: err,
                    });
                } else {
                    return res.status(200).json({
                        ok: true,
                        medico: medicoGuardado,
                    });
                }
            });
        }
    });
});

// Crear un nuevo medico
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital,
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear el medico",
                errors: err,
            });
        } else {
            return res.status(201).json({
                ok: true,
                medico: medicoGuardado,
            });
        }
    });
});

// Eliminar medico
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar el medico",
                errors: err,
            });
        } else if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe ningún medico con ese ID",
                errors: { message: "No existe ningún medico con ese ID" },
            });
        } else {
            return res.status(200).json({
                ok: true,
                medico: medicoBorrado,
            });
        }
    });
});

module.exports = app;