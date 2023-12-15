import fieldValidator from "../utils/fieldValidator.js";
import ApiError from "../utils/ApiError.js";

import {
    S3Client,
    GetObjectCommand
} from "@aws-sdk/client-s3";
import {
    getSignedUrl
} from "@aws-sdk/s3-request-presigner";
import {
    basicConfigurationObject,
    statusCodeObject,
    errorAndSuccessCodeConfiguration,
    CommonMessage
} from "../utils/constants.js";

const s3Client = new S3Client({
    credentials: {
        accessKeyId: basicConfigurationObject.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: basicConfigurationObject.AWS_S3_SECRET_ACCESS_KEY
    },
    region: basicConfigurationObject.AWS_S3_REGION
});

const bucketName = basicConfigurationObject.BUCKET_NAME_AWS;

const generateS3SignedUrl = (imageKeyName, expiresIn = 60) => {
    console.log("imageKey", imageKeyName);

    return new Promise((resolve, reject) => {
        try {
            if (fieldValidator(imageKeyName)) {
                throw new ApiError(
                    statusCodeObject.HTTP_STATUS_BAD_REQUEST,
                    errorAndSuccessCodeConfiguration.HTTP_STATUS_BAD_REQUEST,
                    CommonMessage.ERROR_FIELD_REQUIRED
                );
            }

            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: imageKeyName
            });

            getSignedUrl(s3Client, command, {
                expiresIn
            })
                .then(signedUrl => {
                    resolve(signedUrl);
                })
                .catch(err => {
                    console.error("Error occurred in getSignedUrl: ", err);
                    reject(new Error("Error while getting signed URL"));
                });
        }
        catch (error) {
            console.error("Error in generateS3SignedUrl: ", error);
            reject(error);
        }
    });
};

export default generateS3SignedUrl;
