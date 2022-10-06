import mongoose, { Document, ObjectId, Schema } from 'mongoose'

interface IComplaint {
    title: string,
    time: Date,
    registeredBy: ObjectId,
    registeredTo?: ObjectId,
    type: ObjectId, //category id
    otp: number,
    description: string,
    timeSlot: string,
    cost: number,
}

interface IComplaintModel extends IComplaint, Document {}

const ComplaintSchema: Schema = new Schema({
    title: { type:String, required: true},
    time: { type:Date, required:true},
    registeredBy: { type:Schema.Types.ObjectId, required:true},
    registeredTo: { type:Schema.Types.ObjectId},
    type: { type:String, required:true }, 
    description: { type:String },
    timeSlot: { type:String, required: true},
    cost: { type:Number}
})

export default mongoose.model<IComplaintModel>('Complaint', ComplaintSchema)