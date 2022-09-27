import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import User from '../models/User'
import bcrypt from 'bcryptjs'
import Logging from '../library/Logging'

const registerUser = async (req: Request, res: Response, next: NextFunction) => {

    let { name, username, email, password } = req.body
    let usernameExists = false, emailExists = false

    
    await User.find({username})
    .then(user => {
        if(user.length){
            usernameExists = true
            return res.status(409).json({message: `username already registered`})
        }
    })

    if(!usernameExists) {
        await User.find({email})
        .then(user => {
            if(user.length){
                emailExists = true
                return res.status(200).json({message: `email already registered`})
            }
        })
    }


    if(usernameExists || emailExists) return
    else {
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
                .then(usr => {
                    return res.status(201).json({message: "User Created Successfully"})
                })
                .catch(err => {
                    Logging.error(err)
                    res.status(500).json({err})
                })
    
            })
        })
    }
}

const getAll = async (req: Request, res: Response, next: NextFunction) => {

    return User.find()
        .then((users) => {
            if(!users.length) {
                return res.status(201).json({
                    message: 'No users found'
                })
            }
            return res.status(200).json({users})
        })
        .catch((err) => {
            return res.status(500).json({err})
        })


}

export default { getAll, registerUser }