var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ["ADMIN_ROLE", "USER_ROLE"],
    message: "{VALUE} no es un valor permitido",
};

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, "Nombre necesario"] },
    email: { type: String, unique: true, required: [true, "Email necesario"] },
    password: {
        type: String,
        required: [true, "Password necesaria"],
        select: false,
    },
    img: { type: String },
    role: {
        type: String,
        required: true,
        default: "USER_ROLE",
        enum: rolesValidos,
    },
    google: { type: Boolean, default: false },
});

usuarioSchema.plugin(uniqueValidator, {
    message: "{PATH} debe de ser único",
});

module.exports = mongoose.model("Usuario", usuarioSchema);