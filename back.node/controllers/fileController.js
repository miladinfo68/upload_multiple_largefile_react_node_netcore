const fs = require('fs');
const File = require("../models/fileSchema");


const fetchingFilesFromDirAndSubDir = () => {
    let files = [];
    fs.readdirSync("public/uploads").forEach(subdir => {
        fs.readdirSync(`public/uploads/${subdir}`).forEach(file => {
            files.push(file);
        });
    });
    return files;
}


const homePage = (req, res) => {
    let files = [];
    File.find({}).then(result => {
        result.forEach(file => {
            files.push({
                href: `/file/${file.filename}`,
                name: file.filename
            });
        });
        return res.render("index", {
            files: files,
            title: "Home page"
        });

    }).catch(err => {
        console.log(getAllFiles, err);
    });
}

const aboutPage = (req, res) => {
    res.render("about", {
        title: "About page"
    });
}

const uploadFiles = (req, res) => {
    // console.log(req.files);
    if (req.files && req.files.length > 0) {
        console.log(req.files);
        let coustomizedFiles = req.files.map(f => {
            let obj = {}
            obj.originalname = f.originalname;
            obj.filename = f.filename;
            obj.serverpath = f.path;
            obj.size = f.size;
            obj.contentType = f.mimetype;
            return obj;
        });

        //save bulky files to db 
        File.insertMany(coustomizedFiles).then(result => {
            console.log(`${result.length} Files Added to Db`);
            res.redirect('/');
            //return res.send({redirect: '/'});
        }).catch((err) => {
            console.log(err);
            return res.status(400).send("Error in uploading file \n" + err ? err : "");
        });
        return;

    }
    return res.status(400).send("Error in uploading file \n" + err ? err : "");
}

const downloadFile = (req, res) => {
    const { name } = req.params;
    if (!fetchingFilesFromDirAndSubDir().find(x => x === name)) {
        return res.status(200).send("There is not such a file !");
    }

    File.findOne({ filename: name }).then(result => {
        const filePath = `${process.cwd()}/${result.serverpath}`.replace(/\\/g, "/");
        const file = fs.readFileSync(filePath, 'binary');
        // console.log(file)
        res.setHeader('Content-Length', file.length);
        res.write(file, 'binary');
        res.end();
        // res.download(filePath);
        // res.status(200).send(filePath);
    }).catch((err) => {
        console.log(err);
        res.status(400).send("Error in downloading file \n" + err);
    });
}




//@@@@@@@@@@@ multer model save file
// fieldname: 'fileUploader',
// originalname: 'id.jpg',
// encoding: '7bit',
// mimetype: 'image/jpeg',
// destination: 'uploads/images',
// filename: '1638091651020__id.jpg',
// path: 'uploads\\images\\1638091651020__id.jpg',
// size: 186709



module.exports = {
    homePage,
    aboutPage,
    uploadFiles,
    downloadFile
};