import BaseAPIController from "./BaseAPIController";
import UserProvider from "../providers/UserProvider.js";
import LoginProvider from "../providers/UserProvider.js";

export class UserController extends BaseAPIController {

    /* Controller for User Register  */
    create = (req, res) => {
        UserProvider.create(this._db.User, req.checkBody, req.body, req.getValidationResult())
            .then((user) => {
                this._db.User.create(user)
                    .then(res.json.bind(res))
                    .catch(this.handleErrorResponse.bind(null, res));
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Controller for User Login  */
    login = (req, res) => {
        let login = LoginProvider.login(this._db.User, req.body);
        this._db.User.login(login)
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
    }
}

const controller = new UserController();
export default controller;
