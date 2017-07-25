import BaseAPIController from "./BaseAPIController";
import CandidateDeviceProvider from "../providers/candidate_device";

export class DeviceController extends BaseAPIController {
    save = (req, res, next) => {
        CandidateDeviceProvider.save(req.checkBody, req.body, req.getValidationResult())
            .then((body) => {
                this._db.Candidate_device.create(body)
                    .then((data) => {
                        res.json({ error: 0, message: 'sucess', data: data })
                    }, (err) => {
                        throw new Error(res.json({
                            error: 1,
                            message: err,
                            data: []
                        }));
                    })
            }).catch((err) => { res.json({ error: 1, message: err, data: [] }) });
    }
}

const controller = new DeviceController();
export default controller;