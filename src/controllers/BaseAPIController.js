import db from '../db';
import errorHandler from '../lib/util';
export default class BaseAPIController {
  constructor() {
    this._db = db;
  }

  handleErrorResponse(res, err) {
    res.status(400).send(errorHandler(err));
  }

  handleSuccessResponse(res) {
    res.json({
      status: 'SUCCESS',
    });
  }
}
