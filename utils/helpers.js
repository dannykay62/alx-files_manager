import redisClient from "./redis";
import dbClient from "./db";

async function getAuthToken(request) {
    const token = request.headers['x-token'];
    return `auth_${token}`;
}

/**
 * check the authentication against verified information
 * @param {string} request
 * @returns userId of user
 */
async function findUserIdByToken(request) {
    const key = await getAuthToken(request);
    const userId = await redisClient.get(key);
    
    return userId || null;
}

async function findUserById(userId) {
    const userExistArray = await dbClient.users.find(`ObjectId("${userId}")`).toArray();
    return userExistArray[0] || null;
}

export {
    findUserById, findUserIdByToken,
};