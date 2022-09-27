import express from 'express'
import controller from '../controllers/User'

const app = express.Router()

app.get('/get', controller.getAll)
app.post('/registerUser', controller.registerUser)

export default app