import imap from '../controllers/imap';
import auth from '../middleware/auth';

export default (app) => {
    /* Route for imap save  */
    app.route('/imap/save').post(auth.requiresLogin, imap.save);

    /* Route for imap update  */
    app.route('/imap/update/:id').put(auth.requiresLogin, imap.update);

    /*Route for imap Delete */
    app.route('/imap/delete/:id').delete(auth.requiresLogin, imap.deleteImap);

    /*Route for fetch Imap Data*/
    app.route('/imap/get/:page').get(auth.requiresLogin, imap.getImap);

    app.param('id', imap.getByID)

    return app;
};
