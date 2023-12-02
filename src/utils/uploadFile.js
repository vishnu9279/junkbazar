"use strict";

import AWS from "aws-sdk";

import {
    basicConfigurationObject 
} from "./constants.js";
AWS.config.update({
    accessKeyId: basicConfigurationObject.AWS_S3_ACCESS_KEY_ID,
    region: basicConfigurationObject.AWS_S3_REGION,
    secretAccessKey: basicConfigurationObject.AWS_S3_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3({});

const bucketName = basicConfigurationObject.BUCKET_NAME_AWS;

const uploadFile = async (file, user_id, type, access_type) => {
    console.log("uploadFile works  of user_id ", user_id);
    const currentTime = new Date().getTime();

    const array = file.originalname.split(".");

    const fileExtension = `.${array[array.length - 1]}`;

    const key = `${type}/${user_id}/${currentTime}${fileExtension}`;

    return new Promise((resolve, reject) => {
        const imageObject = {};
    
        s3.upload({
            ACL: (access_type === "private") ? "private" : "public-read",
            Body: file.buffer,
            Bucket: bucketName,
            ContentEncoding: "base64",
            ContentType: file.mimetype,
            Key: key
        }, function(err, s3Obj) {
            console.log("s3Obj", s3Obj);

            if (err) {
                console.error("Error occurred in uploading file => ", err);
                reject(new Error("Error while uploading attachment"));
            }
            else if (s3Obj.Location) {
                console.log("S3 upload URL => ", s3Obj.Location);
                imageObject.url = s3Obj.Location;
                imageObject.docId = currentTime;
                imageObject.docPath = s3Obj.Key;
                resolve(imageObject);
            }
            else {
                console.error("Could not get attachment URL");
                reject(new Error("Error while uploading attachment"));
            }
        });
    });
};

export default uploadFile;
