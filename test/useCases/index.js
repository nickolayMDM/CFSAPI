const runGetFolderContentsTest = require("./getFolderContents");
const runGenerateGuestUserTest = require("./generateGuestUser");
const runGetUserByCookieTest = require("./getUserByCookie");
const runAddFolder = require("./addFolder");
const runAddPasswordAuthorizationToUser = require("./addPasswordAuthorizationToUser");
const runAddPost = require("./addPost");
const runChangeFolderPinStatus = require("./changeFolderPinStatus");
const runChangePostPinStatus = require("./changePostPinStatus");
const runDeleteFolder = require("./deleteFolder");
const runDeletePost = require("./deletePost");
const runGetInputDetailsTest = require("./getInputDetails");
const runGetSimpleFolderTreeTest = require("./getSimpleFolderTree");
const runMovePostTest = require("./movePost");
const runMoveFolderTest = require("./moveFolder");
const runGetUserByTokenTest = require("./getUserByToken");
const runGetPostsCountTest = require("./getPostsCount");
const runGetSearchedContentTest = require("./getSearchedContent");
const runGetUserByIDTest = require("./getUserByID");
const runMergeUsersTest = require("./mergeUsers");
const runRenameFolderTest = require("./renameFolder");
const runRenamePostTest = require("./renamePost");
const runSetPostNoteTest = require("./setPostNote");

const run = async (
    {
        test,
        validators,
        objectHelpers,
        userCookieGenerator,
        hashing,
        RequestError
    }
) => {
    const useCaseTest = {
        ...test,
        before: async (func) => {
            test.before(async () => {
                await databaseMock.clearDatabase();
                if (validators.isFunction(func)) {
                    await func();
                }
            });
        }
    };

    const databaseMock = {
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
                if (validators.isObject(filterValue) || validators.isArray(filterValue)) {
                    if (validators.isBoolean(filterValue["$exists"])) {
                        if (
                            (filterValue["$exists"] && typeof item[filterKey] === "undefined")
                            || (!filterValue["$exists"] && typeof item[filterKey] !== "undefined")
                        ) {
                            return false
                        }
                    }
                    if (validators.isPopulatedArray(filterValue["$in"])) {
                        let isFilterTrue = false;
                        for (let key in filterValue["$in"]) {
                            const filter = {};
                            filter[filterKey] = filterValue["$in"][key];
                            if (this._itemIsWithinFilter(
                                {
                                    item,
                                    filter
                                }
                            )) {
                                isFilterTrue = true;
                            }
                        }
                        if (!isFilterTrue) {
                            return false;
                        }
                    }
                    if (filterKey === "$or") {
                        let isFilterTrue = false;
                        for (let key in filterValue) {
                            if (this._itemIsWithinFilter(
                                {
                                    item,
                                    filter: filterValue[key]
                                }
                            )) {
                                isFilterTrue = true;
                            }
                        }
                        if (!isFilterTrue) {
                            return false;
                        }
                    }
                } else if (validators.isRegExp(filterValue)) {
                    if (!filterValue.test(item[filterKey])) {
                        return false;
                    }
                } else {
                    if (filterKey.substr(0,1) !== "$" && item[filterKey] !== filterValue) {
                        return false;
                    }
                }
            }

            return true;
        },
        _countDocuments: function ({collectionData, filter}) {
            let result = 0;

            for (let key in this._storage[collectionData.name]) {
                if (!this._storage[collectionData.name].hasOwnProperty(key)) continue;

                let item = this._storage[collectionData.name][key];
                if (!this._itemIsWithinFilter({item, filter})) {
                    continue;
                }

                result++;
            }

            return [{count: result}];
        },
        _countGrouped: function ({collectionData, filter, group}) {
            let result = {};

            for (let key in this._storage[collectionData.name]) {
                if (!this._storage[collectionData.name].hasOwnProperty(key)) continue;

                let item = this._storage[collectionData.name][key];
                if (!this._itemIsWithinFilter({item, filter})) {
                    continue;
                }

                if (!validators.isInt(result[item[group]])) {
                    result[item[group]] = {
                        ID: item[group],
                        count: 0
                    };
                }
                result[item[group]].count++;
            }

            return result;
        },
        isID: (value) => {
            return validators.isInt(value)
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
            const data = objectHelpers.transformEntityIntoASimpleObject(entityData);
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

            return null;
        },
        findOneKey: function ({collectionData, filter = {}}) {
            for (let key in this._storage[collectionData.name]) {
                if (!this._storage[collectionData.name].hasOwnProperty(key)) continue;

                let item = this._storage[collectionData.name][key];
                if (typeof item === "undefined") {
                    return null;
                }
                if (!this._itemIsWithinFilter({item, filter})) {
                    continue;
                }

                return key;
            }
        },
        update: async function ({collectionData, ID, updateData, unsetData}) {
            const itemKey = this.findOneKey({
                collectionData,
                filter: {
                    ID
                }
            });

            if (typeof updateData !== "undefined") {
                for (let key in updateData) {
                    if (!updateData.hasOwnProperty(key)) continue;

                    this._storage[collectionData.name][itemKey][key] = updateData[key];
                }
            }
            if (typeof unsetData !== "undefined") {
                for (let key in unsetData) {
                    if (!unsetData.hasOwnProperty(key) || !this._storage[collectionData.name][itemKey].hasOwnProperty(key)) continue;

                    delete this._storage[collectionData.name][itemKey][key];
                }
            }
        },
        updateEntity: async function ({collectionData, entityData}) {
            const ID = entityData.getID();
            let data = objectHelpers.transformEntityIntoASimpleObject(entityData);
            delete data.ID;

            await this.update({
                collectionData,
                ID,
                updateData: data
            });
        },
        updateMany: async function ({collectionData, filter, updateData, unsetData}) {
            const items = this.findAll({
                collectionData,
                filter
            });

            items.map((item) => {
                this.update({
                    collectionData,
                    ID: item.ID,
                    updateData,
                    unsetData
                });
            });
        },
        count: async function ({collectionData, filter, group}) {
            let result;

            if (typeof group !== "undefined") {
                result = this._countGrouped({
                    collectionData,
                    filter,
                    group
                });
            } else {
                result = this._countDocuments({
                    collectionData,
                    filter
                });
            }

            return result;
        },
        clearDatabase: async function () {
            this._storage = {};
        }
    };
    const processPostInputMock = ({postInput}) => {
        return {
            response: {
                postDetails: {
                    imageUrl: "https://fake.image/path.png",
                    name: "inputName",
                    author: "inputAuthor",
                    originalData: {
                        no: "data here"
                    }
                }
            }
        }
    };
    const imageProcessorObjectMock = function () {
        this.url = "";

        this.setFromUrl = function (url) {
            this.url = url;
        };
        this.resize = function ({height, width}) {

        };
        this.returnExtension = function () {
            return "png";
        };
        this.saveToPath = function (path) {

        };
    };

    runAddFolder({
        test: useCaseTest,
        validators,
        database: databaseMock,
        objectHelpers,
        RequestError
    });

    runAddPasswordAuthorizationToUser({
        test: useCaseTest,
        validators,
        database: databaseMock,
        objectHelpers,
        hashing,
        RequestError
    });

    runAddPost({
        test: useCaseTest,
        validators,
        database: databaseMock,
        objectHelpers,
        processPostInput: processPostInputMock,
        imageProcessorObject: imageProcessorObjectMock,
        RequestError
    });

    runChangeFolderPinStatus({
        test: useCaseTest,
        validators,
        database: databaseMock,
        objectHelpers,
        RequestError
    });

    runChangePostPinStatus({
        test: useCaseTest,
        validators,
        database: databaseMock,
        objectHelpers,
        processPostInput: processPostInputMock,
        imageProcessorObject: imageProcessorObjectMock,
        RequestError
    });

    // runDeleteFolder({
    //     test: useCaseTest,
    //     validators,
    //     database: databaseMock,
    //     objectHelpers,
    //     RequestError
    // });

    runDeletePost({
        test: useCaseTest,
        validators,
        database: databaseMock,
        objectHelpers,
        processPostInput: processPostInputMock,
        imageProcessorObject: imageProcessorObjectMock,
        RequestError
    });

    runGenerateGuestUserTest({
        test: useCaseTest,
        validators,
        database: databaseMock,
        userCookieGenerator,
        RequestError
    });

    runGetFolderContentsTest({
        test: useCaseTest,
        validators,
        database: databaseMock,
        objectHelpers,
        RequestError
    });

    runGetInputDetailsTest({
        test: useCaseTest,
        validators,
        database: databaseMock,
        processPostInput: processPostInputMock,
        RequestError
    });

    runGetPostsCountTest({
        test: useCaseTest,
        validators,
        database: databaseMock,
        RequestError
    });

    runGetSearchedContentTest({
        test: useCaseTest,
        validators,
        database: databaseMock,
        RequestError
    });

    runGetSimpleFolderTreeTest({
        test: useCaseTest,
        validators,
        database: databaseMock,
        RequestError
    });

    runGetUserByCookieTest({
        test: useCaseTest,
        validators,
        database: databaseMock,
        userCookieGenerator,
        RequestError
    });

    runGetUserByIDTest({
        test: useCaseTest,
        validators,
        database: databaseMock,
        RequestError
    });

    runGetUserByTokenTest({
        test: useCaseTest,
        validators,
        database: databaseMock,
        objectHelpers,
        userCookieGenerator,
        hashing,
        RequestError
    });

    runMergeUsersTest({
        test: useCaseTest,
        validators,
        database: databaseMock,
        objectHelpers,
        RequestError
    });

    runMoveFolderTest({
        test: useCaseTest,
        validators,
        database: databaseMock,
        objectHelpers,
        RequestError
    });

    runMovePostTest({
        test: useCaseTest,
        validators,
        database: databaseMock,
        objectHelpers,
        RequestError
    });

    runRenameFolderTest({
        test: useCaseTest,
        validators,
        database: databaseMock,
        objectHelpers,
        RequestError
    });

    runRenamePostTest({
        test: useCaseTest,
        validators,
        database: databaseMock,
        objectHelpers,
        RequestError
    });

    runSetPostNoteTest({
        test: useCaseTest,
        validators,
        database: databaseMock,
        objectHelpers,
        RequestError
    });
};

module.exports = run;