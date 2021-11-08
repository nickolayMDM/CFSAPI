const { MongoClient, ObjectId } = require("mongodb");
const validators = require("../helpers/validators");
const textHelpers = require("../helpers/text");
const url = "mongodb://root:root@localhost:27017/?authSource=dungeonclicker&readPreference=primary&appname=MongoDB%20Compass&ssl=false";
const databaseName = "contentFolders";
const client = new MongoClient(url);

const _convertIDPropertyFromDatabase = (data) => {
    if (validators.isArray(data)) {
        return data.map((item) => {
            return _convertIDPropertyFromDatabase_iteration(item);
        });
    }

    return _convertIDPropertyFromDatabase_iteration(data);
};
const _convertIDPropertyFromDatabase_iteration = (item) => {
    item.ID = item._id;
    delete item._id;

    return item;
};

const _convertIDPropertyToDatabase = (data) => {
    data._id = data.ID;
    delete data.ID;

    return data;
};

const _transformFilter = (filter) => {
    Object.keys(filter).map((key) => {
        if (databaseAdapter.isID(filter[key])) {
            filter[key] = ObjectId(filter[key]);
        }
    });

    if (typeof filter.ID !== "undefined") {
        filter._id = filter.ID;
        delete filter.ID;
    }

    return filter;
};

const databaseAdapter = {
    isID: (value) => {
        return ObjectId.isValid(value);
    },
    transformStringIDToObject: (value) => {
        return new ObjectId(value);
    },
    generateID: ({collectionName = ""} = {}) => {
        return ObjectId();
    },
    findOne: async ({collectionData, filter}) => {
        const clientConnection = await client.connect();
        const databaseConnection = clientConnection.db(databaseName);

        filter = _transformFilter(filter);

        //TODO: create a switch on-switch off adapter for console logging
        let result = await databaseConnection.collection(collectionData.name).findOne(filter);
        if (!validators.isNull(result) && typeof result._id !== "undefined") {
            result = _convertIDPropertyFromDatabase(result);
        }

        return result;
    },
    findAll: async ({collectionData, filter}) => {
        const clientConnection = await client.connect();
        const databaseConnection = clientConnection.db(databaseName);

        filter = _transformFilter(filter);

        let result = await databaseConnection.collection(collectionData.name).find(filter).toArray();
        if (!validators.isNull(result) && typeof result._id !== "undefined") {
            result = _convertIDPropertyFromDatabase(result);
        }

        return result;
    },
    insert: async ({collectionData, entityData, databaseConnection}) => {
        let clientConnection;
        if (typeof databaseConnection === "undefined") {
            clientConnection = await client.connect();
            databaseConnection = clientConnection.db(databaseName);
        }
        if (typeof entityData._id === "undefined" && typeof entityData.ID !== "undefined") {
            entityData = _convertIDPropertyToDatabase(entityData);
        }

        await databaseConnection.collection(collectionData.name).insertOne(entityData);

        if (typeof clientConnection !== "undefined") {
            await clientConnection.close();
        }
    },
    insertMultiple: async ({insertArray = []} = {}) => {
        const clientConnection = await client.connect();
        const databaseConnection = clientConnection.db(databaseName);

        for (let key in insertArray) {
            if (!insertArray.hasOwnProperty(key)) continue;

            await databaseAdapter.insert({
                collectionData: insertArray[key].collectionData,
                entityData: insertArray[key].data,
                databaseConnection
            });
        }

        await clientConnection.close();
    },
    insertEntity: async ({collectionData, entityData, databaseConnection}) => {
        let data = {};
        for (let key in entityData) {
            if (!entityData.hasOwnProperty(key) || typeof entityData[key] !== "function" || key.substr(0, 3) !== "get") continue;
            let dataKey = key.slice(3);
            if (dataKey !== "ID") {
                dataKey = textHelpers.uncapitalizeFirstLetter(dataKey);
            }

            data[dataKey] = entityData[key]();
        }

        return await databaseAdapter.insert({
            collectionData,
            entityData: data,
            databaseConnection
        });
    },
    update: async ({collectionData, ID, updateData, unsetData} = {}) => {
        const clientConnection = await client.connect();
        const databaseConnection = clientConnection.db(databaseName);
        let update = {};
        if (typeof updateData !== "undefined") {
            update.$set = updateData;
        }
        if (typeof unsetData !== "undefined") {
            update.$unset = unsetData;
        }

        await databaseConnection.collection(collectionData.name).updateOne({_id: ID}, update);

        await clientConnection.close();
    },
    updateEntity: async ({collectionData, entityData}) => {
        const ID = entityData.getID();
        let data = {};
        for (let key in entityData) {
            if (!entityData.hasOwnProperty(key) || typeof entityData[key] !== "function" || key.substr(0, 3) !== "get") continue;
            let dataKey = key.slice(3);
            if (dataKey === "ID") continue;
            dataKey = textHelpers.uncapitalizeFirstLetter(dataKey);

            data[dataKey] = entityData[key]();
        }

        await databaseAdapter.update({
            collectionData,
            ID,
            updateData: data
        });
    },
};

module.exports = databaseAdapter;