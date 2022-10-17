import mongoose, { Document, Schema } from 'mongoose'

interface IInventory {  
    name: string,
    type: string,
}

interface IInventoryModel extends IInventory, Document {}

const InventorySchema: Schema = new Schema({
    name: { type:String, required: true},
    type: { type:String, required:true}
}, { collection: 'Inventory'})

export default mongoose.model<IInventoryModel>( 'Inventory', InventorySchema)

export { IInventoryModel }