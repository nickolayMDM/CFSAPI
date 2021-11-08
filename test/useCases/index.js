const runGetFolderContentsTest = require("./getFolderContents");
const runGenerateGuestUserTest = require("./generateGuestUser");
const runGetUserByCookieTest = require("./getUserByCookie");

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
        isCookie,
        isEmail,
        isWithin,
        isID,
        generateUserCookie
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
        isID: (value) => {
            return isInt(value)
        },
        generateID: function({collectionData = {name: ""}} = {}) {
            if (typeof this._ids[collectionData.name] === "undefined") {
                this._ids[collectionData.name] = 0;
            }

            return this._ids[collectionData.name]++;
        },
        insert: function ({collectionData, data}) {
            this._createCollection({
                collectionData: collectionData
            });
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
            itemLoop: for (let key in this._storage[collectionData.name]) {
                if (!this._storage[collectionData.name].hasOwnProperty(key)) continue;

                let item = this._storage[collectionData.name][key];
                for (let filterKey in filter) {
                    if (!filter.hasOwnProperty(filterKey)) continue;

                    let filterValue = filter[filterKey];
                    if (item[filterKey] !== filterValue) {
                        continue itemLoop;
                    }
                }

                result.push(item);
            }

            return result;
        },
        findOne: function ({collectionData, filter = {}}) {
            itemLoop: for (let key in this._storage[collectionData.name]) {
                if (!this._storage[collectionData.name].hasOwnProperty(key)) continue;

                let item = this._storage[collectionData.name][key];
                for (let filterKey in filter) {
                    if (!filter.hasOwnProperty(filterKey)) continue;

                    let filterValue = filter[filterKey];
                    if (item[filterKey] !== filterValue) {
                        continue itemLoop;
                    }
                }

                return item;
            }
        }
    };

    runGetFolderContentsTest({
        testDescribe,
        testIt,
        testEqual,
        testThrows,
        testBefore,
        isDefined,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        findAllFromDatabase: databaseMock.findAll.bind(databaseMock),
        insertIntoDatabase: databaseMock.insert.bind(databaseMock),
        generateDatabaseID: databaseMock.generateID.bind(databaseMock),
        isID: databaseMock.isID.bind(databaseMock),
    });

    runGenerateGuestUserTest({
        testDescribe,
        testIt,
        testEqual,
        testBefore,
        isCookie,
        isDefined,
        isEmail,
        isWithin,
        isID,
        isPopulatedString,
        isPopulatedObject,
        isTimestamp,
        generateDatabaseID: databaseMock.generateID.bind(databaseMock),
        insertMultipleIntoDatabase: databaseMock.insertMultiple.bind(databaseMock),
        findOneFromDatabase: databaseMock.findOne.bind(databaseMock),
        generateUserCookie
    });

    runGetUserByCookieTest({
        testDescribe,
        testIt,
        testEqual,
        testThrows,
        testBefore,
        isDefined,
        isEmail,
        isWithin,
        isID,
        findOneFromDatabase: databaseMock.findOne.bind(databaseMock),
        insertIntoDatabase: databaseMock.insert.bind(databaseMock),
        generateDatabaseID: databaseMock.generateID.bind(databaseMock),
        generateUserCookie
    });
};

module.exports = run;