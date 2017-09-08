import BaseAPIController from "./BaseAPIController";
import dashboard_service from "../service/dashboard";

export class DashboardController extends BaseAPIController {
    getDashboard = (req, res, next) => {
        dashboard_service.dashboard(this._db, req).then((response) => {
                res.json(response)
            })
            .catch(this.handleErrorResponse.bind(null, res))
    }
}

const controller = new DashboardController();
export default controller;