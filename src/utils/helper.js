import cache from "memory-cache";

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

        return cache.get(config)[key];
    }
}

export default new Helper();