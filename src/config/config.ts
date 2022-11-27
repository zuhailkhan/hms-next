import dotenv from 'dotenv'

dotenv.config()

const MONGO_USERNAME = process.env.MONGO_USERNAME || ''
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || ''
const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.brymq.mongodb.net/hmsbeta`
const ACCESS_SECRET = process.env.SECRET || 'encrypted-keystring'
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'encrypted-keystring'
const PORT = process.env.PORT || 9000

export const config = {
    mongo: {
        url: MONGO_URL
    },
    server : {
        port: PORT,
    },
    keyChain: { 
        accessKey: ACCESS_SECRET,
        refreshKey: REFRESH_SECRET
    }
}