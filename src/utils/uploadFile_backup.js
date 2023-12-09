"use strict";

import AWS from "aws-sdk";

import {
    basicConfigurationObject 
} from "./constants.js";
// const customEndpoint = "https://assets.hksoftware.in";

AWS.config.update({
    accessKeyId: basicConfigurationObject.AWS_S3_ACCESS_KEY_ID,
    region: basicConfigurationObject.AWS_S3_REGION,
    secretAccessKey: basicConfigurationObject.AWS_S3_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3({});
// const s3 = new AWS.S3({
//     endpoint: customEndpoint,
//     s3ForcePathStyle: true
// });
const bucketName = basicConfigurationObject.BUCKET_NAME_AWS;

const uploadFile = async (file, user_id, type, access_type) => {
    console.log("uploadFile works  of user_id ", user_id);
    const currentTime = new Date().getTime();

    const array = file.originalname.split(".");

    const fileExtension = `.${array[array.length - 1]}`;

    const key = `${type}/${user_id}/${currentTime}${fileExtension}`;
    const s3Payload = {
        // ACL: "private",
        Body: file.buffer,
        Bucket: bucketName,
        // ContentEncoding: "base64",
        ContentType: file.mimetype,
        Key: key
    };

    if (access_type === "private") 
        s3Payload.ACL = "private"; 

    console.log("access_type", access_type);

    return new Promise((resolve, reject) => {
        const imageObject = {};
    
        s3.upload(s3Payload, function(err, s3Obj) {
            console.log("s3Obj", s3Obj, err);

            if (err) {
                console.error("Error occurred in uploading file => ", err);
                reject(new Error("Error while uploading attachment"));
            }
            else if (s3Obj.Location) {
                console.log("S3 upload URL => ", s3Obj.Location);
                imageObject.url = s3Obj.Location;
                // imageObject.CustomUrl = `${customEndpoint}/${s3Obj.Key}`;
                imageObject.docId = currentTime;
                imageObject.docPath = s3Obj.Key;
                console.log(imageObject);
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

// {
//     "Version": "2012-10-17",
//     "Statement": [
//         {
//             "Sid": "AllowCopy",
//             "Effect": "Allow",
//             "Principal": {
//                 "AWS": "arn:aws:iam::970952497218:root"
//             },
//             "Action": [
//                 "s3:ListBucket",
//                 "s3:GetObject"
//             ],
//             "Resource": [
//                 "arn:aws:s3:::junkbazarstaging/*",
//                 "arn:aws:s3:::junkbazarstaging"
//             ]
//         },
//         {
//             "Sid": "AllowCloudFrontServicePrincipal",
//             "Effect": "Allow",
//             "Principal": {
//                 "Service": "cloudfront.amazonaws.com"
//             },
//             "Action": "s3:GetObject",
//             "Resource": "arn:aws:s3:::junkbazarstaging/*",
//             "Condition": {
//                 "StringEquals": {
//                     "AWS:SourceArn": "arn:aws:s3:::junkbazarstaging"
//                 }
//             }
//         }
//     ]
// }