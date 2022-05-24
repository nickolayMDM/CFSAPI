const userLogEntity = require("../entities/userLogEntity");
const folderEntity = require("../entities/folderEntity");
const userEntity = require("../entities/userEntity");

const errorPrefix = "get simple folder tree use case validation error: ";

let getSimpleFolderTreeFactory = (
    {
        validators,
        database,
        RequestError
    }
) => {
    const insertUserLog = async ({userID}) => {
        const userLogCollectionData = userLogEntity.getCollectionData();
        const userLogID = database.generateID({
            collectionName: userLogCollectionData.name
        });
        const buildUserLog = userLogEntity.buildUserLogFactory({
            validators,
            database
        });
        const userLog = buildUserLog({
            ID: userLogID,
            userID,
            description: "Getting simple folder tree"
        });
        await database.insert({
            collectionData: userLogCollectionData,
            entityData: {
                ID: userLog.getID(),
                userID: userLog.getUserID(),
                description: userLog.getDescription(),
                timestamp: userLog.getTimestamp()
            }
        });
    };

    const findAllFolders = async ({userID}) => {
        const folderCollectionData = folderEntity.getCollectionData();
        let filter = {
            userID,
            isDeleted: false
        };

        return await database.findAll({
            collectionData: folderCollectionData,
            filter,
            project: {
                ID: 1,
                name: 1,
                parentID: 1
            }
        });
    };

    const _addToNestedFolder = ({nestedFolders, IDtoArrayIndex, nestBuffer, value, parentID}) => {
        let array = nestedFolders;
        let arrayIndex = nestedFolders.length;
        if (database.isID(parentID)) {
            let keyIDsArray;
            let keyID = IDtoArrayIndex[parentID];

            if (validators.isPopulatedString(keyID) && keyID.includes(".")) {
                keyIDsArray = keyID.split(".");
            }
            if (!validators.isPopulatedArray(keyIDsArray)) {
                keyIDsArray = [keyID];
            }
            array = keyIDsArray.reduce((accumulator, value) => {
                if (typeof accumulator[value]["children"] === "undefined") {
                    accumulator[value]["children"] = [];
                }

                return accumulator[value]["children"];
            }, array);

            arrayIndex = keyID + "." + array.length;
        }

        IDtoArrayIndex[value.ID] = arrayIndex;
        array.push(value);

        if (validators.isPopulatedArray(nestBuffer[value.ID])) {
            nestBuffer[value.ID].map((value) => {
                _addToNestedFolder({
                    nestedFolders,
                    IDtoArrayIndex,
                    nestBuffer,
                    value,
                    parentID: value.parentID
                });
            });
        }
    };

    const nestFolders = ({folders}) => {
        let nestedFolders = [];
        let IDtoArrayIndex = {};
        let nestBuffer = {};

        folders.map((value) => {
            if (!database.isID(value.parentID)) {
                _addToNestedFolder({nestedFolders, IDtoArrayIndex, nestBuffer, value});
                return;
            }

            if (typeof IDtoArrayIndex[value.parentID.toString()] === "undefined") {
                if (typeof nestBuffer[value.parentID] === "undefined") {
                    nestBuffer[value.parentID] = [];
                }

                nestBuffer[value.parentID].push(value);
                return;
            }

            _addToNestedFolder({
                nestedFolders,
                IDtoArrayIndex,
                nestBuffer,
                value,
                parentID: value.parentID
            });
        });

        return nestedFolders;
    };

    const addRootFolder = ({folders}) => {
        return {
            ID: null,
            name: "Home folder",
            children: folders
        };
    };

    return async (
        {
            userID
        } = {}
    ) => {
        if (
            !database.isID(userID)
        ) {
            throw new RequestError(errorPrefix + "invalid data passed", {
                userID
            });
        }

        const userData = database.findOne({
            collectionData: userEntity.getCollectionData(),
            filter: {
                ID: userID
            }
        });
        if (validators.isNull(userData)) {
            throw new RequestError(errorPrefix + "user does not exist in the database", {
                userID
            });
        }

        let folders = await findAllFolders({
            userID
        });
        folders = await nestFolders({
            folders
        });
        folders = await addRootFolder({
            folders
        });

        await insertUserLog({
            userID
        });

        return Object.freeze(folders);
    }
};

module.exports = getSimpleFolderTreeFactory;