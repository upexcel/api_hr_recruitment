import express from 'express';
import BaseAPIController from './BaseAPIController';
import UserProvider from '../providers/UserProvider.js';
import LoginProvider from '../providers/UserProvider.js';
import db from '../db';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';

export class UserController extends BaseAPIController {

    /* Controller for User Register  */
    create = (req, res, next) => {
        let groupid;
        if (req.body.password == req.body.confirm_password) {
            const user = UserProvider.create(this._db.User, req.body);
            delete user.confirm_password;
            this._db.User.create(user)
                .then((data) => {
                    if (data) {
                        res.json({
                            status: 1,
                            message: "User Successfully Added"
                        })
                    } else {
                        throw new Error("Somthing Happend Wrong")
                    }
                })
                .catch(this.handleErrorResponse.bind(null, res));
        } else {
            console.log("invalid password")
        }
    }

    /* Controller for User Login  */
    userLogin = (req, res) => {
        let login = LoginProvider.login(this._db.User, req.body);
        this._db.User.login(login)
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
    }
}

const controller = new UserController();
export default controller;


// if (!user) {
//                     throw new Error("Invalid Login Details");
//                 } else {
//                     let token = jwt.sign({
//                         token: user.id
//                     }, "secret_key", {
//                         expiresIn: 60 * 60
//                     });
//                     res.json({
//                         status: 1,
//                         token: token
//                     })
//                 }