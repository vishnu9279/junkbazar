"use strict";

function combineConfiguration(fullConfiguration) {
    console.log("combineConfiguration");

    const tempConfigs = {};

    fullConfiguration.forEach((item) => {
        // console.log(item);
        const plainItem = item.toObject();

        for (const ObjKey in plainItem) {
            if (ObjKey === "CONFIG_TYPE" || ObjKey === "_id")
                continue;

            else if (tempConfigs[ObjKey]) {
                console.log("Duplicate key:", ObjKey);
                console.error("This field already exist in configuration");
            }
            else
                tempConfigs[ObjKey] = plainItem[ObjKey];
        }
    });
    // console.log("tempConfig", tempConfigs);

    return tempConfigs ;
}

export default combineConfiguration;
