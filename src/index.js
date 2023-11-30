import app from "./app.js";
import setupServer from "./server.js";
import {
    basicConfigurationObject
} from "./utils/constants.js";
const serverInstance = new setupServer(app);

const PORT = (basicConfigurationObject.PORT_NUMBER) ? parseInt(basicConfigurationObject.PORT_NUMBER) : 3000;

serverInstance.startServer(PORT);
