const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var battleSchema = new mongoose.Schema({
    invader: {
        type:mongoose.Schema.ObjectId.ObjectId,
        ref:"Player"
    },
    defender: {
        type:mongoose.Schema.ObjectId.ObjectId,
        ref:"Player"
    },
});

//Export the model
module.exports = mongoose.model('Battle', battleSchema);