"use strict";

import Config from "../model/config.model.js";
import combineConfiguration from "./combineConfiguration.js";
import cache from "memory-cache";

async function fetchConfigCollectionFromDb() {
    console.log("fetchConfigCollectionFromDb");
    // const db = createDatabaseConn.connect();
    try {
        const items = await Config.find();
        const config = combineConfiguration(items);

        // console.log("Configuration Load  ed", items);

        await cache.put("CONFIG", config);
        // console.log(cache.get("CONFIG"));
    }
    catch (error) {
        console.error("Error:", error);
    }
}

export default fetchConfigCollectionFromDb;
