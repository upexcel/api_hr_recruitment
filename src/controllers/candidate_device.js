import BaseAPIController from "./BaseAPIController";
import CandidateDeviceProvider from "../providers/candidate_device";

export class DeviceController extends BaseAPIController {
    save = (req, res, next) => {
        CandidateDeviceProvider.save(req.checkBody, req.body, req.getValidationResult())
            .then((body) => {
                this._db.Candidate_device.createDevice(body)
                    .then((data) => {
                        this.handleSuccessResponse(req, res, next, { error: 0, message: 'sucess', data: data })
                    }, (err) => {
                        throw new Error(res.json({
                            error: 1,
                            message: err,
                            data: []
                        }));
                    })
            }).catch((err) => { this.handleSuccessResponse(req, res, next, { error: 1, message: err, data: [] }) });
    }

    logout = (req, res, next) => {
        this._db.Candidate_device.logout(req.body.email_id, req.body.device_id)
            .then((data) => {
                this.handleSuccessResponse(req, res, next, { error: 0, message: 'sucess' })
            }, (err) => {
                throw new Error(res.json({
                    error: 1,
                    message: err,
                }));
            })
    }

    updateMobile = (req, res, next) => {
        req.email.update({ "sender_mail": req.body.email_id, "registration_id": req.body.registration_id }, { "mobile_no": req.body.mobile_no }).exec(function(err, response) {
            if (err) {
                res.json({
                    error: 1,
                    message: err,
                    data: []
                })
            } else {
                res.json({ error: 0, message: 'Mobile Number Updated' })
            }
        })
    }
}

const controller = new DeviceController();
export default controller;