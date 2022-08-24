import { Strategy, ExtractJwt } from "passport-jwt";
import keys from './keys'
import {db} from '../db'
const secret = keys.secretKey

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret
}

export default (passport: any) => {
    console.log('Hello')
    passport.use(
        new Strategy(options, async (jwtPayKill: any, done: any)=> {
            await db.collection('users').findOne({ _id: jwtPayKill._id })
            .then((user:any)=> {
                if(user) return done(null, user)
                else return done(null, false)
            })
            .catch((err) => {
                console.log(err)
            })
        })
    )
}