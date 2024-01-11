import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
// import req from 'express/lib/request';
// import res from 'express/lib/response';

class AuthController {
    /**
     * Sign a user in by generating new authentication token
     */
    static async getConnect(request, response) {
        const Authorization = request.header('Authorization') || '';
        const credentials = Authorization.split(' ')[1];
        if (!credentials) return response.status(401).send({ error: 'Unauthorized' });
        const decodedCredentials = Buffer.from(credentials, 'base64').toString('utf-8');

        const [email, password] = decodedCredentials.split(':');
        if (!email || !password) return response.status(401).send({ error: 'Unauthorized' });

        const sha1Password = sha1(password);

        // Find user that is associated with the email and password
        const finishedCreds = { email, password: sha1Password };
        const user = await dbClient.users.findOne(finishedCreds);
        // if there's no user
        if (!user) return response.status(401).send({ error: 'Unauthorized' });

        // Using uuidv4, generate a random string
        const token = uuidv4();
        const key = `auth_${token}`;
        const hoursForExpiration = 24;

        // use the key for storing the user id in Redis for 24 hours
        await redisClient.set(key, user._id.toString(), hoursForExpiration * 3600);

        return response.status(200).send({ token });
    }

    /**
     * 
     * @param {string} request 
     * @param {string} response 
     * @returns 
     */
    static async getDisconnect(request, response) {
        // retrieve user from the token
        const token = request.headers['x-token'];
        const user = await redisClient.get(`auth_${token}`);
        if (!user) return response.status(401).send({ error: 'Unauthorized' });

        // delete token from redis
        await redisClient.del(`auth_${token}`);
        return response.status(204).end();
    }
}

export default AuthController;