import { Request, Response, NextFunction } from 'express'
import Logging from '../library/Logging'
import Admin from '../models/Admin'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {config} from '../config/config'


const validate = (req: Request, res: Response, next: NextFunction) =>  {

    Logging.info(`Admin Logged in on ${new Date().toLocaleString()}`)

    return res.status(200).json({
        status: true, 
        message: "Authorized"
    })

}

// const register = (req: Request, res: Response, next: NextFunction) => {

//     let {} = req.body

//     // register only possible if mailed keystring is provided 

// }


const login = (req: Request, res: Response, next: NextFunction) => {

    let {email, username, password} = req.body

    Object.keys(req.body).forEach(key => {
        if(!req.body[key]){
            return res.status(401).json({
                message: "Invalid Request"
            })
        }
    })

    Admin.findOne({ $or: [{ username }, { email }]})
        .then(admin => {

            if(admin){
                bcrypt.compare(password, admin.password, (error, success) => {
                    if(error){
                        Logging.error(`Login attempt failed for ${username}`)
                        return res.status(404).json({message: "Invalid Password"})
                    }

                    if(success){
                        jwt.sign({username, email}, config.server.secret, {expiresIn: "6h"}, (error, token) => {
                            if(error){
                                Logging.error(`Server Error: ${error}`)
                                return res.status(500).json({message: "Internal Server Error"})
                            }

                            if(token){

                                Logging.info(admin._id)
                                return res.status(200).json({
                                    username: admin.username,
                                    email: admin.email,
                                    token: `Bearer ${token}`,
                                    status: true
                                })
                            }
                        })
                    }
                })
            }

        })
        .catch(error => {
            Logging.error(error)
            return res.status(404).json({Error: "Query Error"})
        })
}

const update = (req: Request, res: Response, next: NextFunction) => {
    let id = req.params.id

    let { email, name  } = req.body

    Admin.findById(id)
        .then(admin => {
            if(admin){
                type Payload = { name: string, email: string}
                let preload: Payload = { name, email }
                let payload: any = {}

                Object.keys(preload).forEach(k => {
                    if(preload[k as keyof typeof preload]){
                        payload[k] = preload[k as keyof typeof preload]
                    }
                })

                admin.set(payload)
                    .save()
                    .then(() => {
                        return res.status(200).json({message:"updated successfully"})
                    })
                    .catch(error => {
                        return res.status(404).json({message: "Server Error"})
                    })
            }
            Logging.error(`Not Found`)
            return res.status(404).json({message: "Not Found"})
        })
        .catch(err => {
            Logging.error(`Query Error: ${err}`)
            return res.status(500).json({Error: "Query Error"})    
        })
}

const updatePassword = (req: Request, res: Response, next: NextFunction) => {
    let id = req.params.id

    let { oldpassword, newpassword, newpassword2 } = req.body

    if(newpassword !== newpassword2){
        return res.status(401).json({message: "Passwords must match"})
    }

    Admin.findById(id)
        .then(admin => {
            if(admin){
                
                bcrypt.compare(oldpassword, admin.password, (err, result)=> {
                    if(err) {
                        Logging.error(`Password Reset Attempt Failed for ${admin.username}, Error -> ${err}`)
                        return res.status(409).json({message: "Old password is incorrect"})
                    }

                    if(result){
                        bcrypt.genSalt(10, (err, salt)=>{

                            if(err){
                                Logging.error(`Salting error: ${err}`)
                                return res.status(500)
                            }

                            bcrypt.hash(newpassword, salt, (err, hash) =>{
                                if(err) {
                                    Logging.error(`Hashing error: ${err}`)
                                    return res.status(500)
                                }

                                if(hash){

                                    admin.set({
                                        password: hash
                                    })
                                    .save()
                                    .then(()=>{
                                        Logging.info(`Password reset successfully`)
                                        return res.status(200).json({message: "Password reset successfully"})
                                    })
                                    .catch(err => { 
                                        Logging.error(`Password Reset Attempt Failed: ${err}`)
                                        return res.status(500).json({message: "Query Error"})
                                    })


                                }
                            })
                        })
                    }
                })
                
            }

            Logging.error("Not Found")
            return res.status(404).json({message: "Not Found"})
        })
        .catch(err => {
            Logging.error(`Query Error: ${err}`)
            return res.status(500).json({
                message: "Query Error"
            })
        })
}



export default { validate, login, update, updatePassword }