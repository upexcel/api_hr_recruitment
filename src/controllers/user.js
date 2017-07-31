import BaseAPIController from "./BaseAPIController";
import UserProvider from "../providers/UserProvider.js";
import constant from "../models/constant";

export class UserController extends BaseAPIController {

    /* Controller for User Register  */
    create = (req, res) => {
        UserProvider.create(this._db.User, req.checkBody, req.body, req.getValidationResult())
            .then((user) => {
                if ((user.user_type == constant().userType.admin || user.user_type == constant().userType.hr || user.user_type == constant().userType.guest) && (req.user.id)) {
                    this._db.User.create(user)
                        .then((data) => {
                            res.json({
                                data
                            })
                        }, (err) => {
                            throw new Error(res.json(400, {
                                message: err
                            }));
                        })
                } else {
                    throw new Error(res.json(400, {
                        message: "Invalid User Type"
                    }))
                }
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }


    /* Controller for User Login  */
    login = (req, res) => {
        let login = UserProvider.login(this._db.User, req.body);
        this._db.User.login(login)
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
    }
}

const controller = new UserController();
export default controller;