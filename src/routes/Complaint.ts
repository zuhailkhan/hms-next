import express from 'express';
import controller from '../controllers/Complaint'

const app = express.Router()

app.post('/create', controller.create) // add middleware for authentication & authorization

export default app