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
        let errorStatus = 500;
        if (error instanceof TypeError) {
            errorStatus = 400;
        }
        return res.status(errorStatus).json({error: error.message});
    }
};

module.exports = {initialize, returnServerError};