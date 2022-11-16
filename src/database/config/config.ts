import { config } from 'dotenv';

config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.dfrar.mongodb.net/test_db`;


const PORT = process.env.PORT ? Number(process.env.PORT) : 1337;

export const dbConfig = {
    mongo: {
        username: MONGO_USERNAME,
        password: MONGO_PASSWORD,
        url: MONGO_URL
    },
    server: {
        port: PORT
    }
};
