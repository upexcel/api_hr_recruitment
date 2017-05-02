import crypto from 'crypto';
import * as BaseProvider from './BaseProvider';

/* Provider for User Registration */
const create = (model, body) => {
    var date = new Date();
    let password = crypto.createHash('sha256').update(body.password).digest('base64');
    return {...body, ... { password } };
};

/* Provider for User login */
const login = (model, body, salt) => {
    let password = crypto.createHash('sha256').update(body.password).digest('base64');
    return {...body, ... { password } };
};
export default {
    ...BaseProvider,
    create,
    login,
};
