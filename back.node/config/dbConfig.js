const mongoose = require("mongoose");
const BD_URL="mongodb://localhost:27017/DbFiles";

// const File = require('../schema/fileSchema');
mongoose.connect(BD_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then(() => {
    console.log("connecting to database successfuly has done!");
}).catch(err => {
    console.log("error in conecting to db \n" + err);
});