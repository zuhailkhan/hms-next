import mongoose, { Document, Schema } from 'mongoose'
import IUser from '../interfaces/User'

interface IUserModel extends IUser, Document {}

const UserSchema : Schema = new Schema({
    name: { type:String, required: true},
    username: { type:String, required: true, unique: true},
    email: { type:String, required: true, unique: true},
    password: { type:String, required: true},
    mobileno: { type:String, required: true, unique: true },
    role: { type:Object, required: true, default: {id: 1, name: 'user'}},
    refreshToken: {type: String, required: true }
},{
    collection: 'users'
} )

export default mongoose.model<IUserModel>('User', UserSchema)

export { IUserModel }