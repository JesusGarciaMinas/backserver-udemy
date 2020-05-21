var express = require("express");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

var SEED = require("../config/config").SEED;

var app = express();
var Usuario = require("../models/usuario");

const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID = require("../config/config").CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// Autenticación Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload["sub"];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    };
}

app.post("/google", async(req, res) => {
    var token = req.body.token;

    var googleUser = await verify(token).catch((e) => {
        return res.status(403).json({
            ok: false,
            mensaje: "Token no válido",
        });
    });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err,
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe de usar su autenticación normal",
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, {
                    expiresIn: 3600,
                });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                });
            }
        } else {
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = 'default';

            usuario.save((err, usuarioDB) => {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, {
                    expiresIn: 3600,
                });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                });
            });
        }
    });
});

// Autenticación normal
app.post("/", (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email })
        .select("+password")
        .exec((err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al buscar usuario",
                    errors: err,
                });
            } else if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Credenciales incorrectas - email",
                    errors: err,
                });
            } else if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Credenciales incorrectas - password",
                    errors: err,
                });
            }

            // Creación de token
            var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 3600 });

            res.status(200).json({
                ok: true,
                usuario: usuarioDB,
                token: token,
                id: usuarioDB._id,
            });
        });
});

module.exports = app;