const request = require("../../adapters/requestAdapter");

let userGeolocation = {
    getDataByIp: async (IP) => {
        let url = "http://www.geoplugin.net/json.gp";
        let params = {
            IP
        };
        let result = await request.get({
            url,
            params
        });

        return result.response;
    },

    getCountryCodeByIp: async (IP, {lowercase = false} = {}) => {
        let data = await userGeolocation.getDataByIp(IP);
        if (typeof data.geoplugin_countryCode !== "string") return false;

        let result = data.geoplugin_countryCode;
        if (lowercase) {
            result = result.toLowerCase();
        }

        return result;
    }
};

module.exports = userGeolocation;