import { Request, Response, NextFunction } from "express"
import Worker from '../models/Worker'
import bcrypt from 'bcryptjs'
import Logging from "../library/Logging"
import jwt from 'jsonwebtoken'
import {config} from '../config/config'

const register = (req: Request, res: Response, next: NextFunction) => {
    let {name, username, password, email, mobileno} = req.body

    if(name && username && password && email && mobileno) {
        Worker.findOne({ $or: [{username}, {email}]})
        .then(worker => {
            if(worker) {
                return res.status(401).json({
                    message: "username or email exists already"
                })
            }

            else {

                let worker = new Worker({
                    name,
                    username,
                    email,
                    password,
                    mobileno
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt, (error, hash) => {
                        if(error) {
                            Logging.error(`Hashing Error: ${error}`)
                            return res.status(500).json({message: `Hashing Error: ${error}`})
                        }

                        else if(hash) { 
                            worker.password = hash
                        }

                        worker.save()
                            .then((result) => {3
                                console.log(result)
                                Logging.info(`User Added to DB`)
                                return res.status(200).json({ 
                                    message: "user created successfully"
                                })
                            })
                            .catch(saveErr => res.status(500).json({message : `DBERR Save Error: ${saveErr}}`}))
                    })  
                })

            }
        })
    }

    else { 
        Logging.error('Invalid and/or Missing Arguments ')
        return res.status(400).json({message: 'Invalid and/or Missing Arguments'})
    }
}

/**
 * 
 * @method POST  
 * @desc controls the user login based on the password provided in the body of the request 
 */

const login = (req: Request, res: Response, next: NextFunction) => {
    let { username, email, password} = req.body

    if((username || email) &&  password) {
        Worker.findOne({ $or: [{username}, {email}]})
            .then(worker => {
                if(worker) {
                    bcrypt.compare(password, worker.password, (err, result) => {
                        let payload = {
                            id: worker._id,
                            name: worker.name,
                            username : worker.username,
                            email: worker.email,
                            mobileno: worker.mobileno,
                        }

                        if(result) {
                            jwt.sign(
                                payload,
                                config.server.secret,
                                {expiresIn:"6h"},
                                (jwtError, token) => {
                                    if(token) {
                                        Logging.info('Worker Login success')

                                        return res.status(200).
                                        json({
                                            status: true,
                                            ...payload,
                                            token: `Bearer ${token}`
                                        })
                                    }

                                    if(jwtError) {

                                        Logging.error(`Error Signing token`)
                                        return res.status(500).json({jwtError})

                                    }
                                }

                            )
                        }

                        if(err){
                            Logging.error(`Error with Password: ${err}`)
                            return res.status(409).json({message: `Error with Password: ${err}`})
                        }
                    })
                } else {
                    return res.status(404).json({message: 'Worker not found'})
                }
            }).catch(error => {
                Logging.error(`ERROR querying DB`)
            })
    } else {
        return res.status(400).json({message: 'Invalid and/or Missing Arguments'})
    }
}

/**
 * 
 * @method POST
 * @params UID
 * @Desc Update the worker email, password, and mobile no
 */

const update = (req: Request, res: Response, next: NextFunction) => {

    let { name, email, mobileno } = req.body

    Worker.findById(req.params.id)
        .then(worker => {
            if(worker) {

                type Payload = {name?: string, email?: string, mobileno?: number}
                let load: Payload = {
                    name, email, mobileno
                }
                let payload = {} as any

                // Done // need to figure out how to update only the truthy values. also the method needs to be type checked

                Object.keys(load).forEach(k => {
                    if(load[k as keyof typeof load]) {
                        payload[k as keyof typeof load] = load[k as keyof typeof load]!
                    }
                })

                worker.set(payload).save()
                    .then(result => {
                        return res.status(200).json({
                            message: "Successfully Updated"
                        })
                    })
                    .catch(error => {
                        Logging.error(error)
                        return res.status(401).json({message: "Error saving to DB"})
                    })
            }

            else { 
                return res.status(500).json({message: "Internal Server Error"})
            }
                
            
        })
}

/**
 * @Method POST
 * @Params id
 * @desc Update the user Password
 * @mode Protected
 * @comments Must be secured with a middleware
 */

const updatePassword = (req: Request, res: Response, next: NextFunction) => {
    let id = req.params.id

    let { oldpassword, newpassword, newpassword2 } = req.body

    if(newpassword !== newpassword2) {
        return res.status(401).json({ message: "Password mismatch"})
    }

    Worker.findById(id)
        .then(worker => {
            if(worker){
                bcrypt.compare(oldpassword, worker.password, (err, result) => {
                    if(err) {
                        Logging.error(`Old Password invalid`)
                        return res.status(401).json({ message: "Old Password is incorrect"})
                    }

                    if(result) {
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newpassword, salt, (error, hash) => {
                                if(error) {
                                    return res.status(500).json({message : "Server Error"})
                                }

                                if(hash) {

                                    worker.set({password: newpassword})
                                        .save()
                                        .then(result => {
                                            Logging.info(`Password for Worker ${worker.username} changed successfully`)
                                            return res.status(200).json({message: "Password changed successfully"})
                                        })
                                        .catch(pError => {
                                            Logging.error(pError)
                                            return res.status(500).json({message: "Internal Server Error"})
                                        })
                                }
                            })
                        })
                    }
                })
            } else {
                return res.status(500).json({message: "Worker Not Found"})
            }
        })
        .catch(error => {
            Logging.error(`Unsuccessful, Unknown Error, ${error}`)
            return res.status(409).json({})
            message:"Unknown Error Occured"
        })
}


const validate = (req: Request, res: Response, next: NextFunction) => {
    
}


export default { register, login, validate, update, updatePassword }