import express from 'express';
import controller from '../controllers/Worker'
import extractJWT from '../middlewares/extractJWT'

const app = express.Router()

app.get('/validate', extractJWT, controller.validate)
app.post('/register', controller.register)
app.post('/login', controller.login)
app.post('/update/:id', controller.update)
app.post('/updatePassword/:id', controller.updatePassword)

export default app