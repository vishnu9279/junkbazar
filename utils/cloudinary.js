const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
    secure: true,
});

const opts = {
    overwrite: true,
    invalidate: true,
    resource_type: "auto",
};

exports.uploads = (file) => {
    const myResult = new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file, opts, (error, result) => {
            if (result && result.secure_url) {
                resolve({
                    name: result.name,
                    url: result.secure_url,
                });
            }
        });
    });

    return myResult;
};
