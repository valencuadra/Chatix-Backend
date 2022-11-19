const mongoose = require ("mongoose");
const {isEmail} = require("validator");
const bcrypt = require ("bcrypt");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "no puede estar vacio"]
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "no puede estar vacio"],
        index: true,
        validate: [isEmail, "Email invalido"]
    },
    password: {
        type: String,
        required: [true, "no puede estar vacio"]
    },
    picture: {
        type: String,
    },
    newMessages: {
        type: Object,
        default: {}
    },
    Status: {
        type: String,
        default: "en linea"
    }
}, {minimize: false});

UserSchema.pre("save", function(next){
    const user = this;
    if(!user.isModified("password")) return next()

    bcrypt.genSalt(10, function(err, salt){
        if(err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err);

            user.password = hash
            next();
        })
    })
})

UserSchema.methods.toJSON = function (){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

UserSchema.statics.findByCredentials = async function(email, password) {
    const user = await User.findOne({email});
    if(!user) throw new Error("Email o contraseña invalidos");

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) throw new Error ("Email o contraseña invalidos");
    return user
}

const User = mongoose.model("User", UserSchema);

module.exports = User
