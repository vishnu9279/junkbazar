class Helper{
    getRandomOTP (min, max){
        return Math.floor(Math.random() * (max - min) + min);
    }
}

export default new Helper();