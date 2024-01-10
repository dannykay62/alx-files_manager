import redisClient from "../utils/redis";
import dbClient from '../utils/db';

class AppController {
    /**
     * return if Redis is alive and db is alive
     * using utils created earlier
     * { "redis": true, "db": true } with status code 200
     */
    static getStatus(request, response) {
        const status = {
            redis: redisClient.isAlive(),
            db: dbClient.isAlive(),
        };
        response.status(200).send(status);
    }

    /**
     * return the number of files and users in the database
     * { "users": 5, "files": 35}
     */
    static async getStats(request, response) {
        const stats = {
            users: await dbClient.nbUsers(),
            files: await dbClient.nbFiles(),
        };
        response.status(200).send(stats);
    }
}

export default AppController;
