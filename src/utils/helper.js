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
        const Obj = cache.get(config);

        console.log("response object", Obj[key]);

        return Obj[key];
    }
}

export default new Helper();