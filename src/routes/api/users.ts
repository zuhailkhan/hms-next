import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {db} from '../../db'
import keys from '../../config/keys'

/**
 * @method POST
 * @route  api/users/register
 * @access Public
 */


const router = express.Router()

router.post('/register', async (req, res)=>{
    let { 
        username,
        password,
        confirm_password,
        email,
        name
    } = req.body

    if(password !== confirm_password){
        return res.status(400).json({
            error: 'password do not match'
        })
    }

    await db.collection('users').findOne({username})
    .then((user: any)=>{
        if(user){
            console.log(typeof user)
            return res.status(400).json({
                error:' username already exists'
            })
        }
    })

    await db.collection('users').findOne({email})
    .then((user: any)=> {
        if(user){
            console.log('email', user)
            return res.status(400).json({
                error: 'email already exists'
            })
        }
    })
    
    // create user
    let newUser = {
        name,
        username,
        email,
        password,
    }
    // encrypt password and save to db on callback
    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(newUser.password, salt, async (err, hash) =>{
            if(err) throw err
            else {
                newUser.password = hash
                await db.collection('users').insertOne(newUser)
                .then((user: Object) => {
                    console.log('save',user)
                    return res.status(400).json({
                        msg: 'User created successfully'
                    })
                })
            }
        })
    })
})

/**
 * @method POST
 * @route api/users/login
 * @access Public
 */

router.post('/login', async (req, res)=>{
    let {username, password} = req.body
    let isUserName: boolean = username.split('.').pop() == 'com' ? false : true
    let userIdentifier: Object = isUserName ? { username } : { email: username }
    username && await db.collection('users').findOne(userIdentifier)
    .then((user: any) => {
        if(!user){
            console.log('user not found, check your email/username')
            return res.status(400).json({
                err: 'user not found, check your email/username'
            })
        }

        bcrypt.compare(password, user.password).then((isMatch: boolean) => {
            if(isMatch){
                let load: Object = {
                    id: user._id,
                    name: user.name,
                    usernam: user.username,
                    email: user.email,
                }

                // jwt sign here

                jwt.sign(load, keys.secretKey, {expiresIn: '6h'} as jwt.SignOptions, (err, token) => {
                    if(err) throw err
                    
                    res.status(200).json({
                        status: true,
                        ...load,
                        token: `Bearer ${token}`,
                        msg: 'Login Success'
                    })
                })
            }
            else {
                return res.status(400).json({
                    status: false,
                    msg: 'Password is incorrect'
                })
            }
        })
    })
})

export default router