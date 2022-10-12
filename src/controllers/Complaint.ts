import { Request, Response, NextFunction} from 'express';
import Logging from '../library/Logging';
import Complaint from '../models/Complaint'

const create = (req: Request, res: Response, next: NextFunction) => {

    let { title, userid, type, description, timeslot } = req.body

    // check if complaint of same type and same timeslot is assigned by same user

    Complaint.find({ registeredBy: userid })
    .then(complaintsByUser => {
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

            newComplaint.save()
            .then((q) => {
                Logging.info(`Complaint Registered: ${q}`)
                return res.status(200)
            })

        }
    })
    .catch(error => {
        Logging.error(`Error occured: \n ${error}`)
        return res.status(500).json({ message: `Internal Server Error: ${error.message}`})
    })

}
const resolve = (req: Request, res: Response, next: NextFunction) => {}
const getHistory = (req: Request, res: Response, next: NextFunction) => {}
const assign = (req: Request, res: Response, next: NextFunction) => {}
const unassign = (req: Request, res: Response, next: NextFunction) => {}

export default { create }

