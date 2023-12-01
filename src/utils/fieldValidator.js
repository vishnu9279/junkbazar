"use strict";

const fieldValidator = (value) => {
    return (
        value === undefined ||
        value === null ||
        (typeof value === "string" && (value === "" || value.toLowerCase() === "undefined" || value.toLowerCase() === "null")) ||
        (Array.isArray(value) && value.length === 0)
    );
};

export default fieldValidator;
