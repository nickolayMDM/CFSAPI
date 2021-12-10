const runGetFolderContentsTest = require("./getFolderContents");
const runGenerateGuestUserTest = require("./generateGuestUser");
const runGetUserByCookieTest = require("./getUserByCookie");
const runAddFolder = require("./addFolder");

const run = async (
    {
        testDescribe,
        testIt,
        testEqual,
        testThrows,
        testBefore,
        isInt,
        isDefined,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        isBoolean,
        isNull,
        isCookie,
        isEmail,
        isWithin,
        isID,
        isObject,
        generateUserCookie,
        transformEntityIntoASimpleObject
    }
) => {
    let databaseMock = {
        _ids: {},
        _storage: {},
        _createCollection: function({collectionData}) {
            if (typeof this._storage[collectionData.name] === "undefined") {
                this._storage[collectionData.name] = [];
            }
        },
        _itemIsWithinFilter: function({item, filter}) {
            for (let filterKey in filter) {
                if (!filter.hasOwnProperty(filterKey)) continue;

                let filterValue = filter[filterKey];
                if (isObject(filterValue)) {
                    if (typeof filterValue["$exists"] === "boolean") {
                        if (
                            (filterValue["$exists"] && typeof item[filterKey] === "undefined")
                            || (!filterValue["$exists"] && typeof item[filterKey] !== "undefined")
                        ) {
                            return false
                        }
                    }
                } else {
                    if (item[filterKey] !== filterValue) {
                        return false;
                    }
                }
            }

            return true;
        },
        isID: (value) => {
            return isInt(value)
        },
        generateID: function({collectionName = ""} = {}) {
            if (typeof this._ids[collectionName] === "undefined") {
                this._ids[collectionName] = 0;
            }

            return this._ids[collectionName]++;
        },
        insert: function ({collectionData, data}) {
            this._createCollection({
                collectionData: collectionData
            });
            this._storage[collectionData.name].push(data);
        },
        insertEntity: function ({collectionData, entityData}) {
            this._createCollection({
                collectionData: collectionData
            });
            const data = transformEntityIntoASimpleObject(entityData);
            this._storage[collectionData.name].push(data);
        },
        insertMultiple: function ({insertArray = []} = {}) {
            for (let key in insertArray) {
                let item = insertArray[key];

                this.insert({
                    collectionData: item.collectionData,
                    data: item.data
                });
            }
        },
        findAll: function ({collectionData, filter = {}}) {
            let result = [];
            for (let key in this._storage[collectionData.name]) {
                if (!this._storage[collectionData.name].hasOwnProperty(key)) continue;

                let item = this._storage[collectionData.name][key];
                if (!this._itemIsWithinFilter({item, filter})) {
                    continue;
                }

                result.push(item);
            }

            return result;
        },
        findOne: function ({collectionData, filter = {}}) {
            for (let key in this._storage[collectionData.name]) {
                if (!this._storage[collectionData.name].hasOwnProperty(key)) continue;

                let item = this._storage[collectionData.name][key];
                if (typeof item === "undefined") {
                    return null;
                }
                if (!this._itemIsWithinFilter({item, filter})) {
                    continue;
                }

                return item;
            }
        }
    };

    runAddFolder({
        testDescribe,
        testIt,
        testEqual,
        testBefore,
        testThrows,
        isDefined,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        isNull,
        isBoolean,
        isObject,
        generateDatabaseID: databaseMock.generateID.bind(databaseMock),
        insertEntityIntoDatabase: databaseMock.insertEntity.bind(databaseMock),
        findOneFromDatabase: databaseMock.findOne.bind(databaseMock),
        isID: databaseMock.isID.bind(databaseMock),
        transformEntityIntoASimpleObject
    });

    // runGetFolderContentsTest({
    //     testDescribe,
    //     testIt,
    //     testEqual,
    //     testThrows,
    //     testBefore,
    //     isDefined,
    //     isPopulatedString,
    //     isPopulatedObject,
    //     isTimestamp,
    //     isBoolean,
    //     isNull,
    //     transformEntityIntoASimpleObject,
    //     findAllFromDatabase: databaseMock.findAll.bind(databaseMock),
    //     findOneFromDatabase: databaseMock.findOne.bind(databaseMock),
    //     insertIntoDatabase: databaseMock.insert.bind(databaseMock),
    //     generateDatabaseID: databaseMock.generateID.bind(databaseMock),
    //     isID: databaseMock.isID.bind(databaseMock)
    // });
    //
    // runGenerateGuestUserTest({
    //     testDescribe,
    //     testIt,
    //     testEqual,
    //     testBefore,
    //     isCookie,
    //     isDefined,
    //     isEmail,
    //     isWithin,
    //     isID,
    //     isPopulatedString,
    //     isPopulatedObject,
    //     isTimestamp,
    //     generateDatabaseID: databaseMock.generateID.bind(databaseMock),
    //     findOneFromDatabase: databaseMock.findOne.bind(databaseMock),
    //     insertEntityIntoDatabase: databaseMock.insertEntity.bind(databaseMock),
    //     generateUserCookie
    // });
    //
    // runGetUserByCookieTest({
    //     testDescribe,
    //     testIt,
    //     testEqual,
    //     testThrows,
    //     testBefore,
    //     isDefined,
    //     isEmail,
    //     isWithin,
    //     isID,
    //     isNull,
    //     isPopulatedString,
    //     isPopulatedObject,
    //     isTimestamp,
    //     generateUserCookie,
    //     findOneFromDatabase: databaseMock.findOne.bind(databaseMock),
    //     insertIntoDatabase: databaseMock.insert.bind(databaseMock),
    //     generateDatabaseID: databaseMock.generateID.bind(databaseMock),
    //     insertEntityIntoDatabase: databaseMock.insertEntity.bind(databaseMock)
    // });
};

module.exports = run;