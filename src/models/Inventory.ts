import mongoose, { Document, Schema } from 'mongoose'

interface ICategory {  
    name: string,
    type: string,
}

interface ICategoryModel extends ICategory, Document {}

const CategorySchema: Schema = new Schema({
    name: { type:String, required: true},
    type: { type:String, required:true}
}, { collection: 'inventory'})

export default mongoose.model<ICategoryModel>( 'Category', CategorySchema)