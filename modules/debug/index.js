//TODO: move serverLogEntity to a unique useCase "addServerLog"
//TODO: move all modules into adapters
let _databaseAdapter;
let _serverLogEntity;
let _validators;

const initialize = ({databaseAdapter, serverLogEntity, validators}) => {
    _databaseAdapter = databaseAdapter;
    _serverLogEntity = serverLogEntity;
    _validators = validators;
};

const getErrorCode = (error) => {
    if (_validators.isPositiveInt(error.code)) {
        return error.code;
    }

    if (error instanceof TypeError) {
        return 400;
    }

    return 500;
};

const getErrorJson = (error) => {
    let json = {error: error.message};
    if (_validators.isPopulatedString(error.name)) {
        json.name = error.name;
    }

    return json;
};

const returnServerError = async ({res, error}) => {
    const serverLogCollectionData = _serverLogEntity.getCollectionData();
    const buildServerLog = _serverLogEntity.buildServerLogFactory({
        database: _databaseAdapter,
        validators: _validators
    });
    const serverLogID = _databaseAdapter.generateID({collectionName: serverLogCollectionData.name});
    let serverLogData = {
        ID: serverLogID,
        name: error.name,
        message: error.message,
        stack: error.stack
    };
    if (_validators.isPopulatedObject(error.payload)) {
        serverLogData.payload = error.payload;
    }
    const serverLog = buildServerLog(serverLogData);
    await _databaseAdapter.insertEntity({
        collectionData: serverLogCollectionData,
        entityData: serverLog
    });

    if (typeof res !== "undefined") {
        const errorStatus = getErrorCode(error);
        const errorJson = getErrorJson(error);

        return res.status(errorStatus).json(errorJson);
    }
};

module.exports = {initialize, returnServerError};