const path = require("path");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
// const multer = require("multer");
// const formidable = require('express-formidable');
const expressfileUpload = require('express-fileupload');
const corsOptions = {
  // origin: 'http://localhost:5000',
  origin: '*',
  credentials: true,//access-control-allow-credentials:true
  optionSuccessStatus: 200,
}


const port = 5000;
const app = express();

require("./config/dbConfig");

// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// for parsing application/json
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static('public'));
app.use(cors(corsOptions));
// app.use(cors());

// app.use(formidable());

////comment this section when use multer
app.use(expressfileUpload({
  limits: { fileSize: 5 * 1024 * 1024 },
}));



require("./routes/index")(app);
require("./routes/indexAPI")(app);

// require("./routes/index");
// require("./routes/indexAPI");

app.get('*', function (req, res) {
  res.render('notfound', {
    title: '404'
  })
});



app.listen(port, () => {
  console.log("App started at http://localhost:", port)
})
