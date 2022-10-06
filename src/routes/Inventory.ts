import express from 'express';
import controller from '../controllers/Inventory'

const app = express.Router()

app.post('/list', controller.listItems)
app.post('/add', controller.addItem)
app.delete('/remove/:id', controller.deleteItem)

export default app