import mongoose, { Document, Schema } from 'mongoose'

interface IUser {
    name: string,
    username: string,
    email: string,
    password: string
}

interface IUserModel extends IUser, Document {}

const UserSchema : Schema = new Schema({
    name: { type:String, required: true},
    username: { type:String, required: true},
    email: { type:String, required: true},
    password: { type:String, required: true}
},{
    collection: 'users'
} )

export default mongoose.model<IUserModel>('User', UserSchema)