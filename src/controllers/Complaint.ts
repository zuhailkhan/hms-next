import { Request, Response, NextFunction} from 'express';
import Logging from '../library/Logging';
import Complaint from '../models/Complaint'
import mongoose from 'mongoose'

const create = (req: Request, res: Response, next: NextFunction) => {

    let { title, userid, type, description, timeslot } = req.body

    // check if complaint of same type and same timeslot is assigned by same user

    Complaint.find({ registeredBy: userid })
    .then(complaintsByUser => {

        if(complaintsByUser.length){
            complaintsByUser.forEach(complaint => {
                if(complaint.timeSlot === timeslot && complaint.status) {
                    Logging.error(`Timeslot Occupied`)
                    return res.status(400).json({ 
                        status: false,
                        message: `Timeslot already occupied by the user`
                    })
                }

                if(complaint.type == type && complaint.status) {
                    complaint.populate({
                        path: 'type',
                        select: 'name type'
                    })
                    .then(()=> {
                        Logging.error(`Complaint regarding a ${complaint.type.type} already registered`)
                        return res.status(400).json({
                            status: false, 
                            message: `Complaint of type: ${complaint.type.type} already registered`    
                        })
                    })
                    
                }

                else {
                    let newComplaint = new Complaint({
                        title,
                        time: new Date().getTime(),
                        registeredBy: userid,
                        type: type,
                        otp: Math.floor(100000 + Math.random() * 900000),
                        description,
                        timeSlot: timeslot
                    })

                    newComplaint
                    .save()
                    .then((q) => {
                        Logging.info(`Complaint Registered: ${q}`)
                        return res.status(200).json({message: "Complaint registered successfully"})
                    })
                }
            })
        }

        // testing foreign key / mongoose populate() - done

        if(!complaintsByUser.length){

            let newComplaint = new Complaint({
                title,
                time: new Date().getTime(),
                registeredBy: userid,
                type: type,
                otp: Math.floor(100000 + Math.random() * 900000),
                description,
                timeSlot: timeslot
            })

            newComplaint
            .save()
            .then((q) => {
                Logging.info(`Complaint Registered: ${q}`)
                return res.status(200).json({message: "Complaint registered successfully"})
            })

        }
    })
    .catch(error => {
        Logging.error(`Error occured: \n ${error}`)
        return res.status(500).json({ message: `Internal Server Error: ${error.message}`})
    })

}
const assign = (req: Request, res: Response, next: NextFunction) => {

    let {complaintID, Assignee } = req.body

    Complaint.findById(complaintID)
    .then(complaint => {

        if(complaint && !complaint.status) {
            Logging.error(`Complaint already resolved`)
            return res.status(400).json({
                status: false,
                message: `Complaint already resolved`
            })
        }

        if(complaint && !complaint.registeredTo){

            Worker.findById(Assignee)
            .then(worker => {
                if(worker){
                    complaint.registeredTo = worker._id
                    complaint.cost = 1000

                    complaint.save()
                    .then(() => {
                        Logging.info(`Complaint assigned successfully`)
                        return res.status(200).json({ 
                            status: true,
                            message: `Complaint assigned successfully`
                        })
                    })
                    .catch(err => {
                        Logging.error(`Error: ${err}`)
                        return res.status(500).json({ 
                            status: false,
                            message: err.message
                        })
                    })
                }
            })
            .catch(err => {
                Logging.error(`Error: ${err}`)
                return res.status(200).json({
                    status:false,
                    message: `Error: ${err.message}`
                })
            })


            
        }

        if(complaint && complaint.registeredTo){
            complaint.populate({
                path: 'registeredTo', 
                select: 'username'
            })
            .then(() => {
                Logging.error(`Complaint is already assigned to ${complaint.registeredTo.username}`)
                return res.status(409).json({
                    status: false,
                    message: `Complaint is already assigned to ${complaint.registeredTo.username}`
                })
            })
        }

        if(!complaint){
            Logging.error(`Complaint does not exist`)
            return res.status(400).json({
                status: false,
                message: `Complaint does not exist`
            })
        }
    })
    .catch(err => {
        Logging.error(`Error: ${err}`)
        return res.status(500).json({
            status: false,
            message: `Internal Server Error`
        })
    })

}
const resolve = (req: Request, res: Response, next: NextFunction) => {

    let { complaintID, otp, workerID } = req.body

    Complaint.findById(complaintID)
    .then(complaint => {
        if(!complaint){
            Logging.error(`Complaint not found`)
            return res.status(400).json({ 
                status: false,
                message: `Complaint not found`
            })
        }
        
        if(complaint){
            
            Worker.findById(workerID)
            .then(worker => {
                if(!worker){
                    Logging.error(`Worker not found`)
                    return res.status(400).json({ 
                        status:false, 
                        message: `Worker not found`
                    })
                }

                else if(worker && complaint.otp === parseInt(otp)){
                    // Had to add status field to complaint Schema. need to update all the controllers to match this change

                    complaint.set({
                        status: false
                    })

                    complaint.save()
                    .then(() => {
                        Logging.info(`Complaint updated`)
                        return res.status(200).json({
                            status: true,
                            message: `Complaint updated`
                        })
                    })
                    .catch((err) => {
                        Logging.error(err)
                        return res.status(500).json({ status:false, error: err})
                    })
                }

                else if(worker && complaint.otp !== otp){
                    Logging.error(`Complaint OTP does not match`)
                    return res.status(409).json({
                        status: false,
                        message:  `Complaint OTP does not match`
                    })
                }
            })

        }
        
    })
    .catch(err => {
        Logging.error(`Error: ${err}`)
        return res.status(500).json({ 
            status: false,
            message: `Error: ${err}`
        })
    })

}
const unassign = (req: Request, res: Response, next: NextFunction) => {

    let id = req.params.id

    Complaint.findById(id)
    .then(complaint => {
        if(!complaint){
            Logging.error(`Complaint not Found`)
            return res.status(400).json({ 
                status:false,
                message: `Complaint not found`
            })
        }

        if(complaint && !complaint.status){
            Logging.info(`Complaint already resolved`)
            return res.status(400).json({
                status: false,
                message: `Complaint already resolved`
            })
        }

        if(complaint && complaint.status){

            complaint.set('registeredTo', undefined)
            complaint.set('cost', undefined)

            complaint.save()
            .then(() =>{
                Logging.info(`Complaint unassigned successfully`)
                return res.status(200).json({ 
                    status: true, message: `Complaint unassigned successfully`
                })
            })
            .catch(err => {
                Logging.error(`Error: ${err}`)
                return res.status(500).json({
                    status: false,
                    error: err.message
                })
            })
        }
    })
    .catch(err => {
        Logging.error(`Error: ${err}`)
        return res.status(500).json({ 
            status: false,
            error: err
        })
    })

}
const getHistory = (req: Request, res: Response, next: NextFunction) => {

    Complaint.find({})
    .then(complaints => {
        if(!complaints.length){
            Logging.error(`Error: Complaints list is empty`)
            return res.status(409).json({
                status: false,
                complaints: []
            })
        }

        if(complaints.length){
            Logging.info(`success`)
            return res.status(200).json({
                status: true,
                complaints: complaints
            })
        }
    })

}

export default { create, assign, resolve, unassign, getHistory }


