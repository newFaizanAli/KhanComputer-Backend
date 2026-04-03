import bcrypt from 'bcrypt';

async function hashPassword({ password }) {
    const passwordString = password.toString();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordString, salt);

    return hashedPassword;

}


async function checkPassword({ password, hashedPassword }) {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;

}


const parseDate = (value) => {
    return value && value !== "" ? new Date(value) : null;
};

export {
    hashPassword,
    checkPassword,
    parseDate
}