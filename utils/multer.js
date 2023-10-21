const multer = require("multer");
const path = require("path");

// specify the storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, new Date().toISOString().replace(/:/g, "-") + ext);
    },
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
        var newError = new Error("File type is incorrect!");
        newError.name = "MulterError";
        cb(newError, false);
    }
};

//m
const upload = multer({
    storage,
    fileFilter,
});


module.exports = upload

