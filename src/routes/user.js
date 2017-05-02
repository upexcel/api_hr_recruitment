import user from '../controllers/user';
import login from '../controllers/user';

export default (app) => {
    /* Route for User Registration  */
  app.route('/user/register').post(user.create);

    /* Route for User Login  */
  app.route('/user/login').post(login.userLogin);

  return app;
};
