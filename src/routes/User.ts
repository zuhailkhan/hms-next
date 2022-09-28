import express from 'express'
import controller from '../controllers/User'
import extractJWT from '../middlewares/extractJWT'

const app = express.Router()
app.get('/validate', extractJWT, controller.validate)
app.post('/registerUser', controller.register)
app.post('/login', controller.login)
app.post('/update', controller.update)

export default app