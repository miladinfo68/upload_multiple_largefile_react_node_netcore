const fs = require("fs");
const File = require("../models/fileSchema");
const validFileTypes = ["jpeg", "jpg", "jfif", "png", "pdf"];
let Response = { success: true, data: null, message: null, error: null };

const setResponse = (success = true, data = null, message = null, error = null) => {
    Response.success = true;
    Response.data = null;
    Response.message = null;
    Response.error = null;

    Response.success = success;
    Response.data = data;
    Response.message = message;
    Response.error = error;
}

const fetchingFilesFromDirAndSubDir = () => {
    let files = [];
    fs.readdirSync("public/uploads").forEach(subdir => {
        fs.readdirSync(`public/uploads/${subdir}`).forEach(file => {
            files.push(file);
        });
    });
    return files;
}


const objectIsIterable = (obj) => {
    if (!obj) return false
    return typeof obj[Symbol.iterator] === 'function'
}

module.exports.getAll = async (req, res) => {
    let files = [];
    File.find({}).then(result => {
        result.forEach(file => {
            files.push({
                href: `/file/${file.filename}`,
                name: file.filename
            });
        });
        setResponse(true, files, null, null);
        res.json(Response);
    }).catch(err => {
        setResponse(false, null, "Error in fetching data", err);
        res.json(Response);
    });

}


module.exports.download = async (req, res) => {
    const { name } = req.params;
    console.log(name)
    if (!fetchingFilesFromDirAndSubDir().find(x => x === name)) {
        setResponse(false, null, "There is not such a file !", null);
        return res.json(Response);
    }

    File.findOne({ filename: name }).then(result => {
        const filePath = `${process.cwd()}/${result.serverpath}`.replace(/\\/g, "/");
        // console.log(filePath)

        // const file = fs.readFileSync(filePath, 'binary');
        // res.setHeader('Content-Length', file.length);
        // res.write(file, 'binary');
        // res.end();

        setResponse(true, null, "file downloaded successfully", null);
        res.download(filePath);

    }).catch(err => {
        setResponse(false, null, "Error in downloding file", err);
        res.json(Response);
    });
}


module.exports.upload = async(req, res) => {
    let errors = [];
    let success = true;
    // console.log(req.body);
    // console.log(req.files?.myFiles);
    // console.log("objectIsIterable", objectIsIterable(req.files?.myFiles));

    let postedFiles = [];
    if (req.files?.myFiles) {
        if (objectIsIterable(req.files.myFiles))
        postedFiles = [...req.files.myFiles];
        else
        postedFiles.push(req.files.myFiles);
    }
    // console.log("postedFiles", postedFiles);
    // return res.json(Response);

    try {
        
        if (postedFiles.length > 0) {
            let validList = [], invalidList = [], storedFilesInDir = [];
            postedFiles.map(f =>
                validFileTypes.includes(f.mimetype.split('/')[1]) ?
                    validList.push(f) : invalidList.push(f)
            );
            
            // console.log(validList);
            // console.log(invalidList);

            //// throw new Error("something is wrong")
            if (invalidList.length > 0) {
                success = false;
                invalidList.forEach(file => {
                    errors.push({ err: `[${file.name}] has invalid format try again with correct format` });
                });
            }

            for (const file of validList) {
                // console.log(file);

                let saveFilePath, serverPath;
                let file_name = `${Date.now()}__${file.name}`;
                if (file.mimetype.split('/')[1] === "pdf") {
                    serverPath = `public\\uploads\\pdfs\\${file_name}`;
                } else {
                    serverPath = `public\\uploads\\images\\${file_name}`;
                }
                saveFilePath = `${process.cwd()}\\${serverPath}`.replace(/\\/g, "/");
                // console.log(saveFilePath);

                //save files in directory
                file.mv(saveFilePath, err => {
                    if (!err) {
                        let obj = {};
                        obj.originalname = file.name;
                        obj.filename = file_name;
                        obj.serverpath = serverPath;
                        obj.size = file.size;
                        obj.contentType = file.mimetype;
                        storedFilesInDir.push(obj);
                    } else {
                        success = false;
                        console.log(`[${file.name}] not be save on server\n${err}`);
                        errors.push({ err: `[${file.name}] not be save on server\n${err}` });
                    }
                });
            }

            //save file in database
            setTimeout(() => {

                // console.log(storedFilesInDir);

                //save bulky files to db 
                File.insertMany(storedFilesInDir).then(result => {
                    console.log(`${result.length} files added to database`);
                }).catch((err) => {
                    success = false;
                    console.log(`some files not be save on database\n${err}`);
                    errors.push({ err: `some files not be save on database\n${err}` });
                });

            }, 1000);
        } else {
            success = false;
            errors.push({ err: `there is no file  to saving` });
        }
    } catch (err) {
        errors.push({ err: `error in saving file\n${err}` });
    }
    finally {
        setResponse(
            success,
            null,
            success && errors.length === 0 ? "all files saved successfuly" : "some files couldn't be saved",
            errors
        );
        return res.json(Response);
    }

    // name: 'passport.jfif',
    // data: <Buffer> ,
    // size: 128234,
    // encoding: '7bit',
    // tempFilePath: '',
    // truncated: false,
    // mimetype: 'image/jpeg',
    // md5: 'c3520217bfa8361301b88deb82489506',
    // mv: [Function: mv]
}

