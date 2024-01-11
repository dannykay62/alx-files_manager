import { MongoClient } from "mongodb";

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

class DBClient {
    constructor() {
        this.connect();
    }

    async connect() {
        try {
            const client = await MongoClient.connect(url, { useUnifiedTopology: true });
            this.db = client.db(DB_DATABASE);
            this.users = this.db.collection('users');
            this.files = this.db.collection('files');
            console.log("MongoDB connection established");
        } catch (err) {
            console.error(`MongoDB connection error: ${err.message}`);
            this.db = false;
        }
    }

    isAlive() {
        return !!this.db;
    }

    async nbUsers() {
        return this.users.countDocuments();
    }

    async nbFiles() {
        return this.files.countDocuments();
    }

    async getUser(query) {
        try {
            const user = await this.users.findOne(query);
            return user;
        } catch (err) {
            console.error(`Error fetching user: ${err.message}`);
            throw err; // Re-throw the error to propagate it
        }
    }
}

const dbClient = new DBClient();
export default dbClient;
