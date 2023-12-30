"use strict";

import Config from "../model/config.model.js";
import combineConfiguration from "./combineConfiguration.js";
import NodeCache from "node-cache";

let cache;

function fetchConfigCollectionFromDb() {
    return new Promise((resolve, reject) => {
        cache = new NodeCache();

        console.log("fetchConfigCollectionFromDb");

        Config.find({}).lean()
            .then(items => {
                const config = combineConfiguration(items);

                cache.set("CONFIG", config);
                // console.log("hdsjhdjkfhsk", cache.get("CONFIG"));
                resolve(cache); // Resolve the promise with the cache instance
            })
            .catch(error => {
                console.error("Error:", error);
                reject(error); // Reject the promise with the error
            });
    });
}

const getCache = () => {
    // console.log("cache", cache);

    return cache;
};

export {
    fetchConfigCollectionFromDb, getCache 
};
