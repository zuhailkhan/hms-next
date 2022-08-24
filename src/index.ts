import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import passport1 from 'passport'
import {connect} from './db'
import passport  from './config/passport'
const app : express.Application = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))

// passport initialize
app.use(passport1.initialize())
passport(passport1)


// Import Routes 
import users from './routes/api/users'
app.use('/api/users', users)

const PORT: Number = process.env.PORT && parseInt(process.env.PORT) || 3000

connect()

app.listen(PORT, ()=> {
    console.log(`Server running on PORT : ${PORT}`)
    console.log('---------------------------')
})