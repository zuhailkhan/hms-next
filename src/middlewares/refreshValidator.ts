import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { config } from '../config/config'
import Logging from '../library/Logging'

const refreshKeyValidator = (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.cookies.jwt)
    let refreshToken = req.cookies.jwt

    if(!refreshToken){
        return res.status(403).json({
            status: false,
            message: "Unauthorized"
        })
    }
 
    jwt.verify(refreshToken, config.keyChain.refreshKey, {}, (error, decoded) => {
        if(error){ 
            Logging.error(error)
            return res.status(403).json({
                status: false,
                message: 'Unauthorized',
            })
        }
        if(decoded) {
            Logging.warn(decoded)
            req.cookies.jwt = ''
            next()
        }
    })
}

export default refreshKeyValidator