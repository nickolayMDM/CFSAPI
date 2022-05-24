const { MongoClient, ObjectId } = require("mongodb");
const config = require("../config");
const validators = require("../helpers/validators");
const objectHelpers = require("../helpers/object");
const url = config.database.url;
const databaseName = config.database.databaseName;
const client = new MongoClient(url);

let clientConnection;
let databaseConnection;

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

const _countDocuments = async ({collectionData, filter}) => {
    const databaseConnection = await getDatabaseConnection(databaseName);

    let result = await databaseConnection.collection(collectionData.name).aggregate([
        {
            $match: filter
        },
        {
            $count: "count"
        }
    ]).toArray();

    return result;
};

const _countGrouped = async ({collectionData, filter, group}) => {
    const databaseConnection = await getDatabaseConnection(databaseName);

    let result = await databaseConnection.collection(collectionData.name).aggregate([
        {
            $match: filter
        },
        {
            $group: {
                _id: "$" + group,
                count: {
                    $sum: 1
                }
            }
        }
    ]).toArray();

    return result;
};

const _transformFieldStringToDatabase = (value) => {
    if (value === "ID") {
        return "_id";
    }

    return value;
};

const getDatabaseConnection = async (databaseName) => {
    if (typeof clientConnection === "undefined") {
        clientConnection = await client.connect();
    }

    if (typeof databaseConnection === "undefined") {
        databaseConnection = clientConnection.db(databaseName);
    }

    return databaseConnection;
};

const databaseAdapter = {
    isID: (value) => {
        const testOrigin = new RegExp("^[0-9a-fA-F]{24}$");
        return testOrigin.test(value);
    },
    transformStringIDToObject: (value) => {
        return new ObjectId(value);
    },
    generateID: ({collectionName = ""} = {}) => {
        return ObjectId();
    },
    findOne: async ({collectionData, filter, sort = {}}) => {
        const databaseConnection = await getDatabaseConnection(databaseName);

        filter = _transformFilter(filter);

        let result = databaseConnection.collection(collectionData.name).find(filter).limit(1);
        if (validators.isPopulatedObject(sort)) {
            result.sort(sort);
        }
        result = await result.toArray();
        if (!validators.isNull(result) && validators.isPopulatedArray(result)) {
            result = result[0];
            result = _convertIDPropertyFromDatabase(result);

            return result;
        }

        return null;
    },
    findAll: async ({collectionData, filter, project = {}, sort = {}, join = []}) => {
        const databaseConnection = await getDatabaseConnection(databaseName);
        filter = _transformFilter(filter);
        let aggregation = [
            { $match: filter }
        ];
        if (validators.isPopulatedObject(project)) {
            project = _convertIDPropertyToDatabase(project);
            aggregation.push({
                $project: project
            });
        }
        if (validators.isPopulatedObject(sort)) {
            aggregation.push({
                $sort: sort
            });
        }
        if (validators.isPopulatedArray(join)) {
            for (let key in join) {
                if (!join.hasOwnProperty(key)) continue;

                const localField = _transformFieldStringToDatabase(join[key].masterField);
                const foreignField = _transformFieldStringToDatabase(join[key].fromField);

                aggregation.push({
                    $lookup: {
                        from: join[key].collectionData.name,
                        as: join[key].outputKey,
                        localField,
                        foreignField
                    }
                });
            }
        }

        let result = await databaseConnection.collection(collectionData.name).aggregate(aggregation).toArray();
        if (!validators.isNull(result) && validators.isPopulatedArray(result)) {
            result = _convertIDPropertyFromDatabase(result);
        }

        return result;
    },
    insert: async ({collectionData, entityData, databaseConnection}) => {
        if (typeof databaseConnection === "undefined") {
            databaseConnection = await getDatabaseConnection(databaseName);
        }
        if (typeof entityData._id === "undefined" && typeof entityData.ID !== "undefined") {
            entityData = _convertIDPropertyToDatabase(entityData);
        }
        else if (typeof entityData._id === "undefined") {
            entityData._id = databaseAdapter.generateID();
        }

        await databaseConnection.collection(collectionData.name).insertOne(entityData);
    },
    insertMultiple: async ({insertArray = []} = {}) => {
        const databaseConnection = await getDatabaseConnection(databaseName);

        for (let key in insertArray) {
            if (!insertArray.hasOwnProperty(key)) continue;

            await databaseAdapter.insert({
                collectionData: insertArray[key].collectionData,
                entityData: insertArray[key].data,
                databaseConnection
            });
        }
    },
    insertMultipleInOneCollection: async ({collectionData, insertArray = []} = {}) => {
        const databaseConnection = await getDatabaseConnection(databaseName);

        for (let key in insertArray) {
            if (!insertArray.hasOwnProperty(key)) continue;

            await databaseAdapter.insert({
                collectionData,
                entityData: insertArray[key],
                databaseConnection
            });
        }
    },
    insertEntity: async ({collectionData, entityData, databaseConnection}) => {
        let data = objectHelpers.transformEntityIntoASimpleObject(entityData);

        return await databaseAdapter.insert({
            collectionData,
            entityData: data,
            databaseConnection
        });
    },
    update: async ({collectionData, ID, updateData, unsetData} = {}) => {
        const databaseConnection = await getDatabaseConnection(databaseName);

        let update = {};
        if (typeof updateData !== "undefined") {
            update.$set = updateData;
        }
        if (typeof unsetData !== "undefined") {
            update.$unset = unsetData;
        }

        await databaseConnection.collection(collectionData.name).updateOne({_id: ID}, update);
    },
    updateEntity: async ({collectionData, entityData}) => {
        const ID = entityData.getID();
        let data = objectHelpers.transformEntityIntoASimpleObject(entityData);
        delete data.ID;

        await databaseAdapter.update({
            collectionData,
            ID,
            updateData: data
        });
    },
    updateMany: async ({collectionData, filter, updateData, unsetData} = {}) => {
        const databaseConnection = await getDatabaseConnection(databaseName);

        filter = _convertIDPropertyToDatabase(filter);

        let update = {};
        if (typeof updateData !== "undefined") {
            update.$set = updateData;
        }
        if (typeof unsetData !== "undefined") {
            update.$unset = unsetData;
        }

        await databaseConnection.collection(collectionData.name).updateMany(filter, update);
    },
    count: async ({collectionData, filter, group}) => {
        let result;
        filter = _transformFilter(filter);

        if (typeof group !== "undefined") {
            result = await _countGrouped({
                collectionData,
                filter,
                group
            });
        } else {
            result = await _countDocuments({
                collectionData,
                filter
            });
        }

        if (!validators.isNull(result) && validators.isPopulatedArray(result)) {
            result = _convertIDPropertyFromDatabase(result);
        }

        return result;
    },
    delete: async ({collectionData, filter}) => {
        const databaseConnection = await getDatabaseConnection(databaseName);

        if (typeof filter._id === "undefined" && typeof filter.ID !== "undefined") {
            filter = _convertIDPropertyToDatabase(filter);
        }

        await databaseConnection.collection(collectionData.name).deleteMany(filter);
    }
};

module.exports = databaseAdapter;