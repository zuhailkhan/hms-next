import {MongoClient, MongoClientOptions, Db} from 'mongodb'
import keys from './config/keys'

const defDb : string = 'hmsbeta'

const client = new MongoClient(keys.mongoURI, {useUnifiedTopology: true} as MongoClientOptions)

export let db: Db

export const connect = async (DbName: string = defDb) => {
    const conn = await client.connect()
    db = conn.db(DbName)
    return client
}




