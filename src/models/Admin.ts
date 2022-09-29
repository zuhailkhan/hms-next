import mongoose, { Document, Schema } from 'mongoose'

interface IAdmin {  
    name: string,
    username: string,
    email: string,
    password: string
}

interface IAdminModel extends IAdmin, Document {}

const AdminSchema: Schema = new Schema({
    name: { type:String, required: true },
    username: { type:String, required:true, unique: true },
    email: { type:String, required:true, unique: true},
    password: { type:String, required:true,}
}, { collection: 'admin'})

export default mongoose.model<IAdminModel>( 'Admin', AdminSchema )