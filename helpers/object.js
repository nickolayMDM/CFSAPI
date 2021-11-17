const textHelpers = require("./text");
const validators = require("./validators");

const transformEntityIntoASimpleObject = (entity, filter) => {
    let simpleObject = {};
    for (let key in entity) {
        if (!entity.hasOwnProperty(key) || typeof entity[key] !== "function" || key.substr(0, 3) !== "get") continue;
        let dataKey = key.slice(3);
        if (dataKey !== "ID") {
            dataKey = textHelpers.uncapitalizeFirstLetter(dataKey);
        }
        if (validators.isArray(filter) && !filter.includes(dataKey)) continue;

        simpleObject[dataKey] = entity[key]();
    }

    return simpleObject;
};

module.exports = {transformEntityIntoASimpleObject};