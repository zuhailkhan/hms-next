import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { config } from '../config/config'


const extractJWT = (req: Request, res: Response, next: NextFunction) => {

    let token = req.headers.authorization?.split('Bearer ').pop()

    if(!token) {
        return res.status(401).json({
            message: 'Auth Header not found'
        })
    }

    if(token) {
        jwt.verify(token, config.server.secret, (error, decoded)=> {
            if(error) {
                return res.status(404).json({
                    message: 'error in token verification',
                    error
                })
            }

            res.locals.jwt = decoded

            next()
        })
    }

    else {
        
        return res.status(401).json({ message: 'Unauthorized'})
    }


}

export default extractJWT