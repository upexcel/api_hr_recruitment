import BaseAPIController from "./BaseAPIController";
import UserProvider from "../providers/UserProvider.js";
import constant from "../models/constant";

export class UserController extends BaseAPIController {

    /* Controller for User Register  */
    create = (req, res, next) => {
        UserProvider.create(this._db.User, req.checkBody, req.body, req.getValidationResult())
            .then((user) => {
                let user_type = user.user_type;
                let allowed_role = constant().userType;
                if ((user_type == allowed_role.admin || user_type == allowed_role.hr || user_type == allowed_role.guest) && (req.user.id)) {
                    this._db.User.create(user)
                        .then((data) => {
                            this.handleSuccessResponse(req, res, next, data)
                        }, (err) => {
                            throw new Error(res.json(400, {
                                error: 1,
                                message: err,
                                data: []
                            }));
                        })
                } else {
                    throw new Error(res.json(400, {
                        error: 1,
                        message: "Invalid User Type",
                        data: []
                    }))
                }
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }


    /* Controller for User Login  */
    login = (req, res, next) => {
        let login = UserProvider.login(this._db.User, req.body);
        this._db.User.login(login)
            .then((data) => { this.handleSuccessResponse(req, res, next, data) })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /*controller for user list*/
    list = (req, res, next) => {
        this._db.User.userFindAll(req.user, req.params.page, req.params.limit)
            .then((data) => { this.handleSuccessResponse(req, res, next, { error: 0, message: "success", data: data }) })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /*Controller for user delete*/
    deleteUser = (req, res, next) => {
        this._db.User.userDelete(req.user, req.params.id)
            .then((data) => { this.handleSuccessResponse(req, res, next, { error: 0, message: "success", data: data }) })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /*Find Id result*/
    idResult = (req, res, next, id) => {
        this.getById(req, res, this._db.User, id, next)
    }

    logs = (req, res, next) => {
        let email = req.params.email_id;
        this._db.User.logs(req.user_activity, email)
            .then((data) => {
                if (data.length)
                    this.handleSuccessResponse(req, res, next, { error: 0, message: "success", data: data })
                else
                    this.handleSuccessResponse(req, res, next, { error: 0, message: "No Logs Found", data: data })
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }
}

const controller = new UserController();
export default controller;