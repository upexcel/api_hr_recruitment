import express from 'express'
import BaseAPIController from './BaseAPIController'
import MailProvider from '../providers/MailProvider'
import db from '../db'

export class FetchController extends BaseAPIController {
    /* Get INBOX data */
  fetch = (req, res, next) => {
    req.email.find({ tag_id: { $in: [req.body.tag_id] } }).skip((req.body.page - 1) * 21).limit(21).exec(function (err, data) {
      if (err) {
        next(err)
      } else {
        res.json({ data: data })
      }
    })
  }

  assignTag = (req, res, next) => {
    MailProvider.assignTag(req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
              this._db.Tag.tag(req.body.tag_id)
                    .then((data) => {
                      if (data.status) {
                        req.email.findOneAndUpdate({
                          '_id': req.body.mongo_id
                        }, {
                          '$push': {
                            'tag_id': req.body.tag_id
                          }
                        }).exec(function (err, data) {
                          if (err) {
                            next(new Error(err))
                          } else {
                            res.json({ data: data })
                          }
                        })
                      } else {
                        next(new Error('invalid tag id'))
                      }
                    })
                    .catch(this.handleErrorResponse.bind(null, res))
            })
            .catch(this.handleErrorResponse.bind(null, res))
  }
}

const controller = new FetchController()
export default controller
