const database = require("../adapters/databaseAdapter");
const validators = require("../helpers/validators");
const debug = require("../adapters/debugAdapter");
const getSearchedContentFactory = require("../useCases/getSearchedContent");
const RequestError = require("../errors/RequestError");

const getSearchedContent = async (req, res) => {
    const searchQuery = req.query.search;
    const sortBy = req.query.sortBy;
    const sessionUserID = req.currentUserID;
    let contents = {};

    const getSearchedContentUseCase = getSearchedContentFactory({
        validators,
        database,
        RequestError
    });

    try {
        contents = await getSearchedContentUseCase({
            userID: sessionUserID,
            searchQuery,
            sortBy
        });
    } catch (error) {
        return await debug.returnServerError({
            res,
            error
        });
    }

    return res.status(200).json(contents);
};

module.exports = {getSearchedContent};