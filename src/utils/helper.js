import cache from "memory-cache";
import crypto from "crypto";

class Helper{
    getRandomOTP (min, max){
        return Math.floor(Math.random() * (max - min) + min);
    }
    getCacheElement(config = "CONFIG", key){
        console.log("getCacheElement working", {
            config,
            key
        });
        console.log("response object", cache.get(config));
        const Obj = cache.get(config);

        // console.log("response object", Obj[key]);

        return Obj[key];
    }

    encryptAnyData(messages) {
        console.log("incoming message To encrypt = >", messages);
        const algorithm = this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_ALGO");
        const initVector = this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_INIVECTOR_KEY");
        const Securitykey = this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_SECURITY_KEY");

        console.log({
            algorithm,
            initVector,
            Securitykey
        });
        const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
        let encryptedData = cipher.update(JSON.stringify(messages), "utf-8", "hex");

        encryptedData += cipher.final("hex");

        return encryptedData;
    }

    decryptAnyData(encryptedData) {
        console.log("incoming message To decrypt = >", encryptedData);
        const algorithm = this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_ALGO");
        const initVector = this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_INIVECTOR_KEY");
        const Securitykey = this.getCacheElement("CONFIG", "ENCRYPT_AND_DECRYPT_KEY_SECURITY_KEY");

        console.log({
            algorithm,
            initVector,
            Securitykey
        });
        const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);

        let decryptedData = decipher.update(encryptedData, "hex", "utf-8");

        decryptedData += decipher.final("utf8");
        
        const inObjectDecryptData = JSON.parse(decryptedData);

        return inObjectDecryptData;
    }
}

export default new Helper();