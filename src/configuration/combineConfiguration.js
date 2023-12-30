"use strict";

function combineConfiguration(fullConfiguration) {
    console.log("combineConfiguration");

    const tempConfigs = {};

    fullConfiguration.forEach((item) => {
        // console.log(item);
        // const plainItem = item;

        for (const ObjKey in item) {
            if (ObjKey === "CONFIG_TYPE" || ObjKey === "_id")
                continue;

            else if (tempConfigs[ObjKey]) {
                console.log("Duplicate key:", ObjKey);
                console.error("This field already exist in configuration");
            }
            else
                tempConfigs[ObjKey] = item[ObjKey];
        }
    });
    // console.log("tempConfig", tempConfigs);

    return tempConfigs ;
}

export default combineConfiguration;
