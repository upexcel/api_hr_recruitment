import BaseAPIController from "./BaseAPIController";
import AccountProvider from "../providers/AccountProvider";

export class AccountController extends BaseAPIController {
    /*forgot password*/
    forgot_password = (req, res, next) => {
        this._db.User.findOne({ where: { email: req.params.email } })
            .then((user) => {
                if (user) {
                    this._db.User.forgotPassword(req.params.email)
                        .then((response) => {
                            res.json(response)
                        }, (err) => {
                            throw new Error(err)
                        })
                } else {
                    next(new Error("Email Id Not Found"));
                }
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /*update password*/
    update_password = (req, res, next) => {
        AccountProvider.updatePassword(req.checkBody, req.body, req.getValidationResult())
            .then((body) => {
                this._db.User.update({ password: body.new_password }, { where: { email: req.params.email, password: body.old_password } })
                    .then((user) => {
                        if (user && user[0]) {
                            res.json({ message: 'password updated successfully' });
                        } else {
                            next(new Error("Data not Found"));
                        }
                    }, (err) => {
                        this.handleErrorResponse.bind(null, err)
                    })
            }).catch(this.handleErrorResponse.bind(null, res));
    }
}

const controller = new AccountController();
export default controller;
