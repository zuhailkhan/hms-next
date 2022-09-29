import mongoose, { Document, Schema } from 'mongoose'

interface IWorker {  
    name: string,
    username: string,
    email: string,
    password: string,
}

interface IWorkerModel extends IWorker, Document {
    mobileno: number
}

const WorkerSchema: Schema = new Schema({
    name: { type:String, required: true},
    username: { type:String, required: true, unique: true},
    email: { type:String, required: true, unique: true},
    password: { type:String, required: true},
    mobileno: { type:String, required: true}
}, { collection: 'workers'})

export default mongoose.model<IWorkerModel>('Worker', WorkerSchema)