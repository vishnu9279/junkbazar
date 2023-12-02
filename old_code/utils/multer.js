const multer = require("multer");
const path = require("path");

// specify the storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);

        cb(null, file.fieldname + "-" + Date.now() + ext);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/pdf" ||
        file.mimetype === "application/pdf" ||
        file.mimetype === "application/msword" ||
        file.mimetype === "application/vnd.openxmlformatsofficedocument.wordprocessingml.document"
    )
        cb(null, true);
    else {
        const newError = new Error("File type is incorrect!");

        newError.name = "MulterError";
        cb(newError, false);
    }
};

//m
const upload = multer({
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 
    },
    storage: storage
});

module.exports = upload;

