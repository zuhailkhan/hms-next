import cors from 'cors'
const allowedOrigins = [
    'http://localhost:9000',
    'http://127.0.0.1:5173'
]

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin!) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
    allowedHeaders: [
        'Origin', 
        'x-Requested-With',
        'Content-Type',
        'Accept', 
        'Authorization'
    ],
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    credentials: true
    
}

export default corsOptions