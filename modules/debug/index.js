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
        isID: _databaseAdapter.isID,
        isPopulatedString: _validators.isPopulatedString,
        isTimestamp: _validators.isTimestamp
    });
    const serverLogID = _databaseAdapter.generateID({collectionName: serverLogCollectionData.name});
    const serverLog = buildServerLog({
        ID: serverLogID,
        message: error.message,
        stack: error.stack,
    });
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