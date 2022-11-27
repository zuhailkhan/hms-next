import express from 'express';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';
import UserRoute from './routes/User'
import InventoryRoute from './routes/Inventory'
import ComplaintRoute from './routes/Complaint'

const router = express()

// connect to mongo
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority'} )
    .then(() => {
        Logging.info('Connected to Database')
        StartServer()
    })
    .catch((err) => Logging.error(err));

const StartServer = () => {
    router.use((req, res, next) => {
        Logging.info(`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`)

        res.on('finish', () => {
            Logging.info(`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]  - Status: [${res.statusCode}]`)
        });

        next();
    });
    

    router.use(express.urlencoded({ extended: true }))
    router.use(express.json())

    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5173')
        res.header('Access-Control-Allow-Headers', 'Origin, x-Requested-With, Content-Type, Accept, Authorization')
        res.header('Access-Control-Allow-Credentials', 'true')

        if(req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({ message: 'true'})
        }

        next();
    })

    // route Handlers

    router.use('/user', UserRoute)
    router.use('/inventory', InventoryRoute)
    router.use('/complaint', ComplaintRoute)

    /* HealthCheck */

    router.get('/ping', (req, res, next)=> {
        return res.status(200).json({ message: 'pong'})
    })

    // error handling

    router.use((req, res, next) => {
        const err = new Error('Not Found')
        Logging.error(err)

        return res.status(404).json({
            message: 'Not Found'
        })
    })

    router.listen(config.server.port, () => {
        Logging.info(`Server Listening on PORT: [${config.server.port}]`)
    })
}