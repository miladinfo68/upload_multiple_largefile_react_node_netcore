const multer = require("multer");
const path = require("path");

const file_max_size = 10 * 1024 * 1024;//10MB(mega bytes)
const validFileTypes = ["jpeg", "jpg", "jfif", "png", "pdf"];

const storage = multer.diskStorage({
    destination: function (req, file, cb)
    {
        console.log(2, file);
        if (file)
        {
            let currentfileType = (file.mimetype.split('/')[1]).toLocaleLowerCase();
            if (validFileTypes.includes(currentfileType))
            {
                //save file to folder
                if (currentfileType === "pdf")
                    cb(null, 'public/uploads/pdfs/');
                else
                    cb(null, 'public/uploads/images/');
            }
            // return cb(new Error("INVALID_TYPE"));
        }
    },
    filename: function (req, file, cb)
    {
        console.log(3, file);
        cb(null, Date.now() + "__" + file.originalname)
    }
});


const multerConfigs = {
    storage: storage,
    limits: { fileSize: file_max_size },
    fileFilter: function (req, file, cb)
    {
        console.log(1, file);
        const filetypes = /jpeg|jpg|png|jfif|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        else cb("Error: File upload only supports the "
            + "following filetypes - " + filetypes);
    },
}

const upload = multer(multerConfigs);
module.exports = upload;
