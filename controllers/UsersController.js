import sha1 from 'sha1';
import Queue from 'bull';
import { findUserById, findUserIdByToken } from '../utils/helpers';
import dbClient from '../utils/db';

const userQueue = new Queue('userQueue');

class UsersController {
    /**
     * this will create new user using the email and password
     */
    static async postNew(request, response) {
        const { email, password } = request.body;

        // check for email and password
        if (!email) return response.status(400).send({ error: 'Missing email' });
        if (!password) return response.status(400).send({ error: 'Missing password'});

        // check if email exists in the database
        const emailExists = await dbClient.users.findOne({ email });
        if (emailExists) return response.status(400).send({ error: 'Already exist' });
        
        // to insert a new user
        const sha1Password = sha1(password);
        let result;
        try {
            result = await dbClient.users.insertOne({
                email, password: sha1Password,
            });
        } catch (err) {
            await userQueue.add({});
            return response.status(500).send({ error: 'Error creating user' });
        }
        
        const user = {
            id: result.insertedId,
            email,
        };

        await userQueue.add({
            userId: result.insertedId.toString(),
        });

        return response.status(201).send(user);
    }

    /**
     * retrieve the user base on the token that was used
     */
    static async getMe(request, response) {
        const token = request.headers['x-token'];
        if (!token) {
            return response.status(401).json({ error: 'Unauthorizes' });
        }

        // retrieving user using token
        const userId = await findUserIdByToken(request);
        if (!userId) return response.status(401).send({ error: 'Unauthorized' });

        const user = await findUserById(userId);

        if (!user) return response.status(401).send({ error: 'Unauthorized' });

        const processedUser = { id: user._id, ...user };
        delete processedUser._id;
        delete processedUser.password;

        // return the user object ( email and id alone )
        return response.status(200).send(processedUser);
    }
}

export default UsersController;