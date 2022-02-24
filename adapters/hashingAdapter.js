const bcrypt = require('bcrypt');
const saltRounds = 10;

const hash = async (password) => {
    return await bcrypt.hash(password, saltRounds)
};

const compare = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

const validateString = (hash) => {
    const regex = new RegExp(/^\$2a|2b\$\d+\$[a-zA-Z\d\.\/]{53}$/);
    return regex.test(hash);
};

module.exports = { hash, compare, validateString };