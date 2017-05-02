import crypto from 'crypto';
import * as BaseProvider from './BaseProvider';

/* Provider for User Registration */
const create = (model, body) => {
    return new Promise((resolve, reject) => {
        if (body.user_name == '' && body.email == '' && body.password == '' && body.confirm_password == '') {
            reject("All fields are required")
        } else if (body.user_name == '') {
            reject("User_name is Required");
        } else if (body.email == '') {
            reject("Email is Required")
        } else if (body.confirm_password == '') {
            reject("Confirm Password is Required")
        } else if (body.password == '') {
            reject(" Password is Required")
        } else {
            if (body.password == body.confirm_password) {
                var date = new Date();
                body.password = crypto.createHash('sha256').update(body.password).digest('base64');
                resolve(body)
            } else {
                reject("Password Not Matched")

            }
        }
    })
};

/* Provider for User login */
const login = (model, body, salt) => {
    let password = crypto.createHash('sha256').update(body.password).digest('base64');
    delete body.confirm_password;
    return { ...body,
        ...{
            password
        }
    };
};
export default {
    ...BaseProvider,
    create,
    login,
};