// const express = require("express");
// const router = express.Router();
const fileAPIControler = require("../controllers/fileControllerAPI");
module.exports = (app) => {
    
    app.get("/api", fileAPIControler.getAll);
    app.get("/api/file/:name", fileAPIControler.download);
    app.post("/api/file/upload", fileAPIControler.upload);
}

// router.get("/api", fileAPIControler.getAll);
// router.get("/api/file/:name", fileAPIControler.download);
// router.post("/api/file/upload", fileAPIControler.upload);
// router.post("/api", fileAPIControler.testi);

// module.exports = router;