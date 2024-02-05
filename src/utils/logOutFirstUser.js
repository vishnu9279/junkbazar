import Session  from "../model/users/session.model.js";
import UserModel  from "../model/users/user.model.js";

const logOutFirstUser = async(userId, session) => {
    console.log("logOutFirstUser working");
    try {
        const singleSession = await Session.find({
            enabled: true,
            userId
        }).sort({
            created: 1
        }).limit(1);

        console.log({
            jwtId: singleSession[0].jwtId
        });
        await UserModel.findOneAndUpdate({
            userId
        }, {
            $inc: {
                loginCount: -1
            }
        }, {
            session: session
        });
        const resp = await Session.updateMany({
            jwtId: singleSession[0].jwtId,
            userId
        }, {
            $set: {
                enabled: false,
                terminated_at: (new Date()).getTime()
            }
        }, {
            session: session
        });

        console.log("resp", resp);

        return resp;
    }
    catch (error) {
        console.error("Error", error);
        throw error;
    }
};

export default logOutFirstUser;