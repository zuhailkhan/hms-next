import express from 'express';
import controller from '../controllers/Worker'
import extractJWT from '../middlewares/extractJWT'

const app = express.Router()

app.post('/register', controller.register)
app.post('/login', controller.login)
app.post('/update/:id', controller.update)

export default app