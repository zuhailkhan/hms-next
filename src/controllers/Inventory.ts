import { Request, Response, NextFunction } from 'express'
import Logging from '../library/Logging'
import Inventory from '../models/Inventory'


const addItem = (req: Request, res: Response, next: NextFunction) => {

    let { name, type } = req.body 

    if(!name || !type) return res.status(409).json({ error: "Invalid Parameters"})

    Inventory.findOne({name})
        .then((inv => {
            if(inv && inv.type == type){
                Logging.error("item with the same name & type already exists")
                return res.status(409).json({status: true, message: "Item with the same name & type already exists"})
            }

            let newItem = new Inventory({
                name,
                type
            })

            newItem.save()
            .then(() => {
                Logging.info(`Item added successfully`)
                return res.status(200).json({status: true, message: "Item added successfully"})
            })
            .catch(err => {
                Logging.error(`Error: \n ${err}`)
                return res.status(500).json({status: true, message:"Server Error"})
            })


        }))
        .catch(error => {
            Logging.error(`Error: \n ${error}`)
            return res.status(500).json({status: false, message: "Server Error"})
        })

}

const deleteItem = (req: Request, res: Response, next: NextFunction) => {

    let id = req.params.id

    Inventory.findByIdAndDelete(id)
    .then((item) => {
        Logging.info(`Item Deleted: \n ${item}`)
        return res.status(200).json({status: true, message:`Item Deleted successfully`, item})
    })
    .catch((err) => {
        Logging.error(`Error: \n ${err}`)
        return res.json({status: false, message:"Error", err})
    })

}

const listItems = (req: Request, res: Response, next: NextFunction) => {

    let { type } = req.body

    if(!type){
        Inventory.find({})
            .then((items) => {
                
                Logging.info(`List: \t ${items}`)
                return res.status(200).json({ status: true, items})
            })
            .catch((err) => {
                Logging.error(err)
                return res.status(500).json({ status:false, error: err})
            })
    }


    if(type) {
        Inventory.find({type})
        .then((items) => {

            if(items.length){
                Logging.info(`List: \t ${items}`)
                return res.status(200).json({ status: true, items})
            }

            if(!items.length){
                Logging.info(`items with Category: ${type} does not exist`)
                res.status(404).json({ status:false, message:`Items with Category: ${type} does not exist`})
            }
        })
        .catch(err => {
            Logging.error(err)
            return res.status(500).json({ status:false, error: err})
        })
    }

}

export default { addItem, deleteItem, listItems}