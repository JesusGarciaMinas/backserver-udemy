var express = require("express");

var fileUpload = require("express-fileupload");
var fs = require("fs");

var app = express();

var Usuario = require("../models/usuario");
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");

app.use(
    fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
    })
);

app.put("/:tipo/:id", (req, res, next) => {
    var tipo = req.params.tipo.toLowerCase();
    var id = req.params.id;

    var tiposValidos = ["hospitales", "usuarios", "medicos"];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Tipo de colección no es valida",
            errors: { message: "Colecciones válidas: " + tiposValidos.splice(", ") },
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: "No selecciono nada",
            errors: { message: "Debe de seleccionar una imagen" },
        });
    }

    // Obtener nombre del archivo.
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split(".");
    var extension = nombreCortado[nombreCortado.length - 1].toLowerCase();

    // Extensiones aceptadas
    var extensionesValidas = ["png", "jpg", "gif", "jpeg"];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Extensión no válida",
            errors: {
                message: "Las extensiones válidas son: " + extensionesValidas.join(", "),
                extension: extension.toLowerCase(),
            },
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}_${new Date().getMilliseconds()}.${extension.toLowerCase()}`;
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al mover archivo",
                errors: err,
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res);
    });
});

function subirPorTipo(tipo, id, nombreArchivo, respuesta) {
    if (tipo === "usuarios") {
        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                return respuesta.status(400).json({
                    ok: true,
                    mensaje: "Usuario no existe",
                    errors: { message: "Usuario no existe" },
                });
            }

            var oldPath = "./uploads/usuarios/" + usuario.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                return respuesta.status(200).json({
                    ok: true,
                    mensaje: "Imagen de usuario actualizada",
                    usuario: usuarioActualizado,
                });
            });
        });
    } else if (tipo === "hospitales") {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return respuesta.status(400).json({
                    ok: true,
                    mensaje: "Hospital no existe",
                    errors: { message: "Hospital no existe" },
                });
            }

            var oldPath = "./uploads/hospitales/" + hospital.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                return respuesta.status(200).json({
                    ok: true,
                    mensaje: "Imagen de hospital actualizada",
                    hospital: hospitalActualizado,
                });
            });
        });
    } else if (tipo === "medicos") {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return respuesta.status(400).json({
                    ok: true,
                    mensaje: "Medico no existe",
                    errors: { message: "Medico no existe" },
                });
            }

            var oldPath = "./uploads/medicos/" + medico.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                return respuesta.status(200).json({
                    ok: true,
                    mensaje: "Imagen de medico actualizada",
                    medico: medicoActualizado,
                });
            });
        });
    }
}

module.exports = app;