import { NextFunction, Request, Response } from 'express'
import User from '../models/User'
import bcrypt from 'bcryptjs'
import Logging from '../library/Logging'
import {config} from '../config/config'
import jwt from 'jsonwebtoken'


const validate = (req: Request, res: Response, next: NextFunction) => {

    Logging.info('User Validated')

    return res.status(200).json({
        status: true,
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
    .catch(err => {
        Logging.error(`Query Error: ${req}`)
        return res.status(500).json({message: "Query Error"})
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
    .catch(err => {
        Logging.error(err)
        return res.status(404).json({Error: "Query Error"})
    })
}

const update = async (req: Request, res: Response, next: NextFunction) => {
    let { email, name } = req.body // add mobileno for user later
    let id = req.params.id

    await User.findById(id)
    .then(user => {
        if(user){

            type Payload = { name: string, email: string}
            let preload: Payload = { name, email }
            let payload: any = {}

            Object.keys(preload).forEach(k => {
                if(preload[k as keyof typeof preload]){
                    payload[k] = preload[k as keyof typeof preload]
                }
            })

            user.set(payload)

            return user
                .save()
                .then(() => res.status(201).json({ message : "user updated"}))
                .catch(err => {
                    Logging.error('Unsuccessful')
                    return res.status(500).json({ Error: "Error Occured", err})
                })
        }
        
        return res.status(404).json({message: "User not found"})
    })
    .catch(err => {
        Logging.error('Query Error')
        return res.status(500).json({ Error: "Query Error"})
    })
}

const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Reset controller
    // skip Email OTL generation
    let id = req.params.id
    let { oldpassword, newpassword, newpassword2  } = req.body

    if(newpassword !== newpassword2) {
        return res.status(401).json({ Error: "Password Mismatch"})
    }

    User.findById(id)
        .then(user => {
            if(user){

                bcrypt.compare(oldpassword, user.password, (err, result)=> {
                    if(err) {
                        Logging.error(`Password Invalid`)
                        return res.status(409).json({ message: "Password Invalid"})
                    }

                    if(result){
                        bcrypt.genSalt(10, (error, salt) => {
                            bcrypt.hash(newpassword, salt, (hashError, hash) => {
                                if(hashError) {
                                    Logging.error(`hashing Error`)
                                    return res.status(500).json({ message: "Hashing Error"})
                                }

                                if(hash) {
                                    
                                    user.set({password: hash})
                                        .save()
                                        .then(s => {
                                            Logging.info(`Password changed Successfully`)
                                            return res.status(200).json({ message: "Password changed Successfully"})
                                        })
                                        .catch(e => {
                                            Logging.error(`Error Changing Password : ${e}`)
                                            return res.status(500).json({ message: "Server Error"})
                                        })

                                }
                            })
                        })
                    }
                })


            }

            return res.status(404).json({message: "User not found"})
        })
        .catch(err => {
            Logging.error(`Query Error: ${req}`)
            return res.status(500).json({Error: "Query Error"})
        })
}

const getUsersList = async (req: Request, res: Response, next: NextFunction) => {
    
    return User.find()
    .then((users) => {
        if(!users.length) {
            return res.status(201).json({
                message: 'No users found'
            })
        }
        return res.status(200).json({
            UsersList: users
        })
    })
    .catch((err) => {
        return res.status(500).json({err})
    })
}


export default {  register, login, validate, update, updatePassword, getUsersList } 