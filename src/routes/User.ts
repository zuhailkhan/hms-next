import express from 'express'
import controller from '../controllers/User'
import refreshKeyValidator from '../middlewares/refreshKeyValidator'

const app = express.Router()
app.get('/validate', refreshKeyValidator , controller.validate)
app.post('/register', controller.register)
app.post('/login', controller.login)
app.post('/update/:id', controller.update)
app.post('/updatePassword/:id', controller.updatePassword)

export default app