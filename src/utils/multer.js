import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
    // 5MB file size limit
    fileFilter: function (req, file, cb) {
    // Accept only specified file types
        const allowedMimes = [ "image/jpeg",
            "image/jpg",
            "image/png",
            "application/pdf" ];

        if (allowedMimes.includes(file.mimetype)) 
            cb(null, true);
    
        else 
            cb(new Error("Invalid file type. Only JPEG, JPG, PNG, and PDF files are allowed."));
    },
    
    limits: {
        fileSize: 5 * 1024 * 1024 
    }, 
    storage: storage
});

export default upload;

