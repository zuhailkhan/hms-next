import { NextFunction, Request, Response } from 'express'
import User from '../models/User'
import bcrypt from 'bcryptjs'
import Logging from '../library/Logging'
import {config} from '../config/config'
import jwt from 'jsonwebtoken'
import roles from '../config/roles'


const register = async (req: Request, res: Response) => {

    let { name, username, email, password, type, mobileno } = req.body

    await User.find({ $or: [{username}, {email}, {mobileno}]})
        .then(user => {
            if(user.length) {
                user.map(x => {
                    if(x.username == username) {
                        return res.status(403).json({
                            status: false,
                            message: "username already exists"
                        })
                    }

                    if(x.email == email) {
                        return res.status(403).json({
                            status: false,
                            message: "email already exists"
                        })
                    }

                    if(x.mobileno == mobileno) {
                        return res.status(403).json({
                            status: false,
                            message: "mobile number is already registered"
                        })
                    }
                })
            }
            bcrypt.hash(password, 10, (error, hash) => {
                if(error) {
                    return res.status(500).json({
                        status: false, 
                        message: 'Internal Error, Registration Failed',
                        Error: error.message
                    })
                }

                if(hash) {
                    let role = roles.find(r => r.id === type)
                    if(!role) {
                        Logging.error(`Invalid Role: ${type}`)
                        return res.status(401).json({ 
                            status: false, 
                            message: "Invalid role in the request"
                        })
                    }

                    interface Tokens {
                        accessToken: string,
                        refreshToken: string
                    }

                    let getTokens = new Promise<Tokens>((resolve, reject) => {
                        jwt.sign({ username, email, mobileno, role }, config.keyChain.accessKey, {expiresIn: "60s"}, (atErr, accessToken) => {
                            if(atErr) {
                                Logging.error(atErr)
                                reject(atErr)
                                return res.status(500).json({
                                    status: false,
                                    message: "Internal Error",
                                    Error: atErr.message
                                })
                            }
    
                            if(accessToken) {
                                jwt.sign({accessToken, username}, config.keyChain.refreshKey, {expiresIn:"1d"}, (rtErr, refreshToken) => {
                                    if(rtErr) {
                                        Logging.error(rtErr)
                                        reject(rtErr)
                                        return res.status(500).json({
                                            status: false,
                                            message: "Internal Error",
                                            Error: rtErr.message
                                        })
                                    }
                                    if(refreshToken) {
                                        res.cookie('jwt', refreshToken, {httpOnly: true, secure: true, sameSite: 'none', maxAge: 86400000 })
                                        resolve({accessToken, refreshToken})
                                    }
                                } )
                            }
                        })
                    })

                    getTokens
                    .then(({accessToken, refreshToken}) => {
                        let nUser = new User({
                            name,
                            username,
                            password: hash,
                            email,
                            role,
                            refreshToken,
                            mobileno
                        })
                        
                        nUser.save()
                            .then((val)=>{
                                Logging.info(`Successfully registered ${val.username}`)
                                return res.status(200).json({
                                    status: true,
                                    message: `Successfully registered ${val.username}`,
                                    token: `Bearer ${accessToken}`,
                                })
                            })
                            .catch(err => {
                                Logging.error(`An Error Occured while saving: ${err}`)
                                return res.status(500).json({
                                    status: false,
                                    message: "Internal Error",
                                    Error: err.message
                                })
                            })
                    })


                }
            })

        })
        .catch(error => {
            Logging.error(`Invalid Query`)
            return res.status(401).json({
                status: false,
                message: 'Invalid Query',
                Error: error.message
            })
        })
    /* End Controller */
}

const login = async (req: Request, res: Response) => {

    let { username, email, mobileno, password } = req.body

    await User.find({$or: [{username}, {email}, {mobileno} ]})
    .then(user => {
        if(!user.length){
            return res.status(400).json({err: "User Not Found"})
        }
        if(user.length) {

            bcrypt.compare(password, user[0].password, (err, result) => {
                if(err){
                    // error handling
                    Logging.error(err)
                    return res.status(500).json({
                        status:false,
                        message: "Internal Error",
                        Error: err.message
                    })
                }
                if(result){
                    Logging.info('login successful')
                    // return res.status(200).json({ message: 'Login successfully'})
                    // pass jwt here
                    jwt.sign(
                        {   
                            username : user[0].username, 
                            email : user[0].email,
                            mobileno: user[0].mobileno,
                            role : user[0].role,
                        },
                        config.keyChain.accessKey,
                        {expiresIn:"60s"},
                        (err, token)=> {
                            if(err) {
                                Logging.error(err)
                            }
                            if(token){
                                Logging.info(user[0]._id)
                                
                                jwt.sign(
                                    {
                                        userId: user[0]._id,
                                        accessToken : `Bearer ${token}`
                                    },
                                    config.keyChain.refreshKey,
                                    {expiresIn: "1d"},
                                    (err, refreshToken) => {
                                        if(err) {
                                            Logging.error('Signing token failed')
                                            return res.status(500).json({
                                                status: false,
                                                message: err.message
                                            })
                                        }

                                        if(refreshToken) {
                                            res.cookie('refreshToken', refreshToken, {httpOnly: true, maxAge: 86400000 , sameSite: 'none'})
                                            res.cookie('accessToken', token, {httpOnly: true, maxAge: 320000})
                                            user[0].refreshToken = refreshToken
                                            user[0].save()
                                            res.status(200).json({ 
                                                status: true,
                                                accessToken : `Bearer ${token}`,
                                                username: user[0].username,
                                                email: user[0].email
                                            })
                                        }
                                    }
                                )
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

const update = async (req: Request, res: Response) => {
    let { email, name, mobileno } = req.body
    let id = req.params.id

    await User.findById(id)
    .then(user => {
        if(user){

            type Payload = { name: string, email: string, mobileno: string}
            let preload: Payload = { name, email, mobileno }
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

const updatePassword = async (req: Request, res: Response) => {
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
                        bcrypt.hash(newpassword, 10, (hashError, hash) => {
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
                    }
                })


            }

            return res.status(404).json({message: "User not found"})
        })
        .catch(err => {
            Logging.error(`Query Error: ${req}`)
            return res.status(500).json({
                status: false,
                message: "Query Error",
                Error: err
            })
        })
}

const getUsersList = async (req: Request, res: Response) => {
    
    return User.find()
    .then((users) => {
        if(!users.length) {
            return res.status(201).json({
                status: false,
                message: 'No users found'
            })
        }
        return res.status(200).json({
            status: true,
            UsersList: users
        })
    })
    .catch((err) => {
        return res.status(500).json({
            status: false,
            Error: err
        })
    })
}


export default {  register, login, update, updatePassword, getUsersList } 