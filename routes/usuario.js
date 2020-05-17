var express = require("express");
var bcrypt = require("bcrypt");
var mdAutenticacion = require("../middlewares/autenticacion");

var app = express();

var salt = bcrypt.genSaltSync(10);

var Usuario = require("../models/usuario");

// obtener todos los usuarios
app.get("/", (req, res, next) => {
    Usuario.find({}, "nombre email img role").exec((err, usuarios) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: "Error cargando usuario",
                errors: err,
            });
        } else {
            res.status(200).json({
                ok: true,
                usuarios: usuarios,
            });
        }
    });
});

// Actualizar usuario
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err,
            });
        } else if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario con el id " + id + " no existe",
                errors: { message: "No existe un usuario con ese ID" },
            });
        } else {
            var body = req.body;
            usuario.nombre = body.nombre;
            usuario.email = body.email;
            usuario.role = body.role;

            usuario.save((err, usuarioGuardado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Error al actualizar usuario",
                        errors: err,
                    });
                } else {
                    return res.status(200).json({
                        ok: true,
                        usuario: usuarioGuardado,
                    });
                }
            });
        }
    });
});

// Crear un nuevo usuario
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, salt),
        img: body.img,
        role: body.role,
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear el usuario",
                errors: err,
            });
        } else {
            return res.status(201).json({
                ok: true,
                usuario: usuarioGuardado,
                usuarioToken: req.usuario,
            });
        }
    });
});

// Eliminar usuario
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar el usuario",
                errors: err,
            });
        } else if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe ningún usuario con ese ID",
                errors: { message: "No existe ningún usuario con ese ID" },
            });
        } else {
            return res.status(200).json({
                ok: true,
                usuario: usuarioBorrado,
            });
        }
    });
});

module.exports = app;