const { homePage, aboutPage, uploadFiles, downloadFile }
    = require("../controllers/fileController");
//save recieved files in uploads directory
const  upload = require('../config/multerConfig');

module.exports = (app) => {
    app.get("/", homePage);
    app.get("/about", aboutPage);
    app.post("/upload",upload.array("myFiles",5) , uploadFiles);
    app.get("/file/:name", downloadFile);
}
