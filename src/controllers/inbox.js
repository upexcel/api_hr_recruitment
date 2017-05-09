import express from 'express';
import BaseAPIController from './BaseAPIController';
import ImapProvider from '../providers/ImapProvider';
import db from '../db';

export class InboxController extends BaseAPIController {

    /*Get INBOX data*/
    getInbox = (req, res, next) => {
        req.email.find().skip((req.params.page - 1) * 21).limit(21).exec(function(err, data) {
            if (err) {
                req.err = "invalid page"
                next(req.err);
            } else {
                res.json({ data: data });
            }
        });
    }

    /*Get UID data*/
    getUid = (req, res, next) => {
        req.email.findOne({ uid: parseInt(req.params.uid) }, function(err, data) {
            if (err) {
                req.err = "Invalid UID";
                next(req.err);
            } else {
                res.json({ data: data });
            }
        })
    }


}

const controller = new InboxController();
export default controller;
