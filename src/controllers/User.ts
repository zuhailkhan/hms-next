import { NextFunction, Request, Response } from 'express'
import User from '../models/User'
import bcrypt from 'bcryptjs'
import Logging from '../library/Logging'
import {config} from '../config/config'
import jwt from 'jsonwebtoken'


const validate = (req: Request, res: Response, next: NextFunction) => {

    Logging.info('User Validated')

    return res.status(200).json({
        message: 'Authorized'
    })

}

const register = async (req: Request, res: Response, next: NextFunction) => {

    let { name, username, email, password } = req.body

    await User.find({ $or: [{username}, {email}]})
    .then(user => {
        if(user.length){
            return res.status(409).json({message: `username already registered`})
        }

        if(!user.length) {
            bcrypt.genSalt(10, (err, salt) => {
                if(err) Logging.error(err)
                bcrypt.hash(password, salt, async (err, hash) => {
                    if(err) Logging.error(err)
        
                    let load = new User({
                        name,
                        username,
                        email,
                        password: hash
                    })
        
                    await load.save()
                    .then(() => {
                        return res.status(201).json({message: "User Created Successfully"})
                    })
                    .catch(err => {
                        Logging.error(err)
                        res.status(500).json({err})
                    })
        
                })
            })
        }
    })
       
}

const login = async (req: Request, res: Response, next: NextFunction) => {

    let { username, email, password} = req.body

    await User.find({$or: [{username}, {email}]})
    .then(user => {
        if(!user.length){
            return res.status(400).json({err: "User Not Found"})
        }
        if(user.length) {

            bcrypt.compare(password, user[0].password, (err, result) => {
                if(err){
                    // error handling
                    Logging.error(err)
                }
                if(result){
                    Logging.info('login successful')
                    // return res.status(200).json({ message: 'Login successfully'})
                    // pass jwt here
                    jwt.sign(
                        {   
                            "username" : user[0].username, 
                            "email" : user[0].email
                        },
                        config.server.secret,
                        {expiresIn:"6h"},
                        (err, token)=> {
                            if(err) {
                                Logging.error(err)
                            }
                            if(token){
                                Logging.info(user[0]._id)
                                res.status(200).json({ 
                                    status: true,
                                    token : `Bearer ${token}`,
                                    username: user[0].username,
                                    email: user[0].email
                                })
                            }
                        }
                    )

                } else {
                    Logging.error('Unsuccessful Login Attempt')
                    return res.status(400).json({Error: 'Invalid Password'})
                }
            })
        }
    })
    .catch(err => Logging.error(err))
}

const update = (req: Request, res: Response, next: NextFunction) => {
    let { username } = req.body
}

// const getAll = async (req: Request, res: Response, next: NextFunction) => {
    
//     return User.find()
//     .then((users) => {
//         if(!users.length) {
//             return res.status(201).json({
//                 message: 'No users found'
//             })
//         }
//         return res.status(200).json({users})
//     })
//     .catch((err) => {
//         return res.status(500).json({err})
//     })
// }


export default {  register, login, validate }