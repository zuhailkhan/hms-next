import express from 'express';
import controller from '../controllers/Complaint'

const app = express.Router()

app.post('/create', controller.create) // add middleware for authentication & authorization
app.post('/assign', controller.assign)
app.post('/resolve', controller.resolve)
app.post('/unassign/:id', controller.unassign)
app.get('/getHistory', controller.getHistory)

export default app