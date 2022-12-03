import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { config } from "../config/config";
import Logging from "../library/Logging";
import User from "../models/User";


const authValidator = (req: Request, res: Response, next: NextFunction) => {
    // verify the accessToken cookie from request
    
    let accessToken = req.cookies.accessToken ?? req.headers.authorization?.split('Bearer ').pop()
    let refreshToken = req.cookies.refreshToken
    Logging.error(`${accessToken}`)
    Logging.warn(`${refreshToken}`)
    
    if(!accessToken) {
        Logging.error('Unauthorized')
        return res.status(403).json({
            status: false,
            message: 'Unauthorized'
        })
    }
    
    if(accessToken){
        jwt.verify(accessToken, config.keyChain.accessKey, {}, (error, accessDecoded) => {
            if(error) {
                if(!refreshToken){
                    Logging.error('No refresh token')
                    return res.status(403).json({
                        status:false,
                        message: 'invalid token, please login again'
                    })
                } 

                if(refreshToken) {
                    jwt.verify(refreshToken, config.keyChain.refreshKey, {}, (error, refreshDecoded: any) => {
                        if(error) {
                            Logging.error('Invalid refresh token')
                            return res.status(403).json({
                                status:false,
                                message: 'invalid token, please login again'
                            })
                        }

                        if(refreshDecoded) {
                            // check user's db refresh token matches current cookie refreshtoken
                            // if yes
                                // generate new access token and save it to cookies
                            // if no
                                // return error
                            let {userId} = refreshDecoded
                            User.findById(userId)
                                .then((user) => {
                                    if(user && user.refreshToken == refreshToken){
                                        jwt.sign({
                                            username: user.username,
                                            email: user.email,
                                            mobileno: user.mobileno,
                                            role: user.role
                                        }, 
                                        config.keyChain.accessKey, 
                                        {expiresIn: "60s"},
                                        (err, newToken)=> {
                                            if(err){
                                                Logging.error(err)
                                                return res.status(500).json({
                                                    status: false,
                                                    message: 'Internal Error'
                                                })
                                            }

                                            if(newToken) {
                                                res.cookie('accessToken', newToken, {httpOnly: true, maxAge: 320000})
                                                return next()
                                            }
                                        })
                                    }
                                })
                        }
                    })
                }
            }
            if(accessDecoded){
                return next();
            }
        })
    }

}

export default authValidator