//TODO: use RabbitMQ when there will be an actual server
const axios = require("axios");

const get = async ({url, params, headers = {}} = {}) => {
    let response;
    let result = {};

    try {
        response = await axios.get(url, {
            params,
            headers
        });
    } catch (error) {
        response = error.response;
    }

    result.response = response.data;
    result.headers = response.headers;
    result.status = response.status;

    return result;
};

const getFile = async ({url, params, headers = {}} = {}) => {
    let response;
    let result = {};

    try {
        response = await axios.request({
            url,
            responseType: "arraybuffer",
            method: 'get',
            params,
            headers
        });
    } catch (error) {
        response = error.response;
    }

    result.response = Buffer.from(response.data);
    result.headers = response.headers;
    result.status = response.status;

    return result;
};

const post = async ({url, params, headers = {}} = {}) => {
    let response;
    let result = {};

    try {
        response = await axios.post(url, {
            params,
        },
        {
            headers: {
                'Content-Type': 'application/JSON',
                ...headers
            }
        });
    } catch (error) {
        response = error.response;
    }

    result.response = response.data;
    result.status = response.status;

    if (typeof result.response === "string") {
        result.response = JSON.parse(result.response);
    }

    return result;
};

module.exports = { get, post, getFile };