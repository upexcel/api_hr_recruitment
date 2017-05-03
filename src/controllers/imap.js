import express from 'express';
import BaseAPIController from './BaseAPIController';
import ImapProvider from '../providers/ImapProvider';
import db from '../db';

export class ImapController extends BaseAPIController {

    /* Controller for Save Imap Data  */
    save = (req, res, next) => {
        ImapProvider.save(this._db.Imap, req.body, req.imapAccess)
            .then((data) => {
                this._db.Imap.save(data)
                    .then(res.json.bind(res))
                    .catch(this.handleErrorResponse.bind(null, res));
            })
            .catch(this.handleErrorResponse.bind(null, res))
    }

    /*Get Imapp data using id*/
    getByID = (req, res, next, id) => {
        this._db.Imap.findById(id)
            .then((data) => {
                if (data) {
                    req.imapData = data
                    next()
                } else {
                    throw new Error("Invalid Id")
                }
            })
            .catch(this.handleErrorResponse.bind(null, res));

    }

    /*Imap data Update*/
    update = (req, res, next) => {
        ImapProvider.save(this._db.Imap, req.body, req.imapAccess)
            .then((data) => {
                this._db.Imap.update(data, { where: { id: req.params.id } })
                    .then(res.json.bind(res))
                    .catch(this.handleErrorResponse.bind(null, res));
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /*Imap data delete */

    deleteImap = (req, res, next) => {
        ImapProvider.Imap(req.imapAccess)
            .then(() => {
                this._db.Imap.destroy({ where: { id: req.params.id } })
                    .then(res.json.bind(res))
                    .catch(this.handleErrorResponse.bind(null, res));
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /*Get Imap data*/
    getImap = (req, res, next) => {
        ImapProvider.Imap(req.imapAccess)
            .then(() => {
                this._db.Imap.findAll({ offset: (req.params.page - 1) * 10, limit: 10 })
                    .then(res.json.bind(res))
                    .catch(this.handleErrorResponse.bind(null, res));
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }
}

const controller = new ImapController();
export default controller;
