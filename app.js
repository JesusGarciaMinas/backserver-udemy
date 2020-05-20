// Requires
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

// Importar Rutas
var appRoutes = require("./routes/app");
var usuarioRoutes = require("./routes/usuario");
var hospitalRoutes = require("./routes/hospital");
var medicoRoutes = require("./routes/medico");
var busquedaRoutes = require("./routes/busqueda");
var uploadRoutes = require("./routes/upload");
var imagenesRoutes = require("./routes/imagenes");
var loginRoutes = require("./routes/login");

// Inicializar variables
var app = express();

// Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Conexión a la Base de Datos
mongoose.connect("mongodb://localhost:27017/hospitalDB", {
    useNewUrlParser: true,
});

// Serve index config
var serveIndex = require("serve-index");
app.use(express.static(__dirname + "/"));
app.use("/uploads", serveIndex(__dirname + "/uploads"));

// Rutas
app.use("/usuario", usuarioRoutes);
app.use("/hospital", hospitalRoutes);
app.use("/medico", medicoRoutes);
app.use("/login", loginRoutes);
app.use("/busqueda", busquedaRoutes);
app.use("/upload", uploadRoutes);
app.use("/imagenes", imagenesRoutes);
app.use("/", appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log("Node/Express: \x1b[36m%s\x1b[0m", "online");
});