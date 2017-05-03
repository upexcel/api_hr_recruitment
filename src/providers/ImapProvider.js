import crypto from 'crypto';
import * as BaseProvider from './BaseProvider';

/* Provider for User Registration */
const save = (model, body, access) => {
    return new Promise((resolve, reject) => {
        if (body.email == '' && body.password == '' && body.smtp_server == '' && body.port == '') {
            reject("All fields are required")
        } else if (body.email == '') {
            reject("Email is Required");
        } else if (body.smtp_server == '') {
            reject("smtp_server is Required")
        } else if (!body.type) {
            reject("Type is Required")
        } else if (body.password == '') {
            reject(" Password is Required")
        } else if (body.server_port == '') {
            reject(" Port is Required")
        } else {
            if (access) {
                resolve(body)
            } else {
                reject("You are Not authorized")
            }
        }
    })
};

const Imap = (access) => {
    return new Promise((resolve, reject) => {
        if (access) {
            resolve()
        } else {
            reject("You are Not authorized")
        }
    })
};
export default {
    ...BaseProvider,
    save,
    Imap
};
