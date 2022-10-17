import mongoose, { Document, ObjectId, Schema, PopulatedDoc } from 'mongoose'
import {IInventoryModel} from './Inventory'
import {IUserModel} from './User'

interface IComplaint {
    title: string,
    time: Date,
    registeredBy: PopulatedDoc<Document<ObjectId> & IUserModel>,
    registeredTo?: PopulatedDoc<Document<ObjectId> & IUserModel>,
    type: PopulatedDoc<Document<ObjectId> & IInventoryModel>, //category id
    otp: number,
    description: string,
    timeSlot: string,
    cost: number,
    status: boolean
}

interface IComplaintModel extends IComplaint, Document {}

const ComplaintSchema: Schema = new Schema({
    title: { type:String, required: true},
    time: { type:Date, required:true},
    registeredBy: { type:Schema.Types.ObjectId, required:true, ref: 'User'},
    registeredTo: { type:Schema.Types.ObjectId, ref: 'Worker'},
    type: { type:Schema.Types.ObjectId, required:true, ref: 'Inventory'}, 
    description: { type:String },
    timeSlot: { type:String, required: true},
    cost: { type:Number},
    otp: {type: Number},
    status: { type:Boolean, required:true, default: true}
})

export default mongoose.model<IComplaintModel>('Complaint', ComplaintSchema)