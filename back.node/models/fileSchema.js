const mongoose = require('mongoose');
const fileSchema = new mongoose.Schema({
    originalname: {
        type: String,
        required: [true, "Uploaded file must have a name"],
    },
    filename: {
        type: String,
        required: [true, "Uploaded file must have a name"],
    },    
    serverpath: {
        type: String,
    },
    size: {
        type: Number,
        required: [true, "Uploaded file must have length between 1 and 10 Mb"],
    },
    contentType: {
        type: String,
        required: [true, "Content Type must not be empty"],
    },
    uploadedDate: {
        type: Date,
        default: Date.now,
    },
});
 
module.exports = mongoose.model("File", fileSchema);

