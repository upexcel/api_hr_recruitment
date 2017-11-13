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
                            this.handleSuccessResponse(req, res, next, response)
                        }, (err) => {
                            next(res.status(400).send({ message: err }))
                        })
                } else {
                    this.handleSuccessResponse(req, res, next, { message: "If email exists, new password will be send to your email !!" })
                }
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /*update password*/
    update_password = (req, res, next) => {
        AccountProvider.updatePassword(req.checkBody, req.body, req.getValidationResult())
            .then((body) => {
                this._db.User.update({ password: body.new_password }, { where: { id: req.user.id, password: body.old_password } })
                    .then((user) => {
                        if (user && user[0]) {
                            this.handleSuccessResponse(req, res, next, { message: 'password updated successfully' });
                        } else {
                            next(res.status(400).send({ message: "Incorrect Old password" }))
                        }
                    }, (err) => {
                        this.handleErrorResponse.bind(null, err)
                    })
            }).catch(this.handleErrorResponse.bind(null, res));
    }
}

const controller = new AccountController();
export default controller;