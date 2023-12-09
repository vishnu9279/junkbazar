"use strict";

import {
    S3Client, PutObjectCommand
} from "@aws-sdk/client-s3";
import {
    getSignedUrl
} from "@aws-sdk/s3-request-presigner";
import {
    basicConfigurationObject 
} from "./constants.js";

const s3Client = new S3Client({
    credentials: {
        accessKeyId: basicConfigurationObject.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: basicConfigurationObject.AWS_S3_SECRET_ACCESS_KEY
    },
    region: basicConfigurationObject.AWS_S3_REGION
});

const bucketName = basicConfigurationObject.BUCKET_NAME_AWS;

const uploadImage = (user_id, type, fileName, ContentType) => {
    console.log("uploadImage works of user_id ", user_id, type, fileName, ContentType);
    const currentTime = new Date().getTime();
    const key = `${type}/${user_id}/${currentTime}-${fileName}`;

    return new Promise((resolve, reject) => {
        const s3Payload = {
            Bucket: bucketName,
            ContentType,
            Key: key
        };

        console.log("s3Payload", s3Payload);
        const command = new PutObjectCommand(s3Payload);

        console.log("Before getSignedUrl call");
        getSignedUrl(s3Client, command, {
            expiresIn: 60
        })
            .then(signedUrl => {
                console.log("Signed URL:", signedUrl);
                resolve({
                    key,
                    signedUrl
                });
            })
            .catch(err => {
                console.error("Error occurred in getSignedUrl: ", err);
                reject(new Error("Error while getting signed URL"));
            });
        console.log("After getSignedUrl call");
    });
};

export default uploadImage;