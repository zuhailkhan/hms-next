import express from 'express'
import controller from '../controllers/User'
import authValidator from '../middlewares/authValidator'

const app = express.Router()
app.post('/register', controller.register)
app.post('/login', controller.login)
app.post('/update/:id', authValidator, controller.update)
app.post('/updatePassword/:id',authValidator,  controller.updatePassword)
app.get('/getusersList', authValidator, controller.getUsersList)
app.get('/logout', controller.logout)

export default app