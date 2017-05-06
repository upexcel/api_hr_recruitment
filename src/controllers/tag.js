import express from 'express';
import BaseAPIController from './BaseAPIController';
import TagProvider from '../providers/TagProvider';
import db from '../db';
import tag from '../models/constant';

export class ImapController extends BaseAPIController {

    /* Controller for Save Imap Data  */
    save = (req, res, next) => {
        TagProvider.save(this._db.Imap, req.params.type, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Tag.create(data)
                    .then(res.json.bind(res))
                    .catch(this.handleErrorResponse.bind(null, res))
            })
            .catch(this.handleErrorResponse.bind(null, res))
    }

    /*Get Imapp data using id*/
    idTagResult = (req, res, next, tagId) => {
        this.getById(req, this._db.Tag, tagId, next)
    }

    /*Imap data Update*/
    update = (req, res, next) => {
        TagProvider.save(this._db.Imap, req.params.type, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Tag.update(data, { where: { id: req.params.tagId } })
                    .then(res.json.bind(res))
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /*Imap data delete */

    deleteTag = (req, res, next) => {
      if(req.params.type == tag().tagType.automatic || req.params.type == Tag.tagType.Manual){
        this._db.Tag.destroy({ where: { id: req.params.tagId } })
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
      }else{
        next(new Error("Invalid Type"))
      }
    }

    /*Get Imap data*/
    getTag = (req, res, next) => {
      if(req.params.type == tag().tagType.automatic || req.params.type == tag().tagType.Manual || req.params.type == tag().tagType.default){
        this._db.Tag.findAll({ offset: (req.params.page - 1) * 10, limit: 10, where : { type: req.params.type } })
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
      }else{
        next(new Error("Invalid Type"))
      }
    }

    /*Get tag by id*/
    getTagById = (req, res, next) => {
      if(req.params.type == tag().tagType.automatic || req.params.type == tag().tagType.Manual || req.params.type == tag().tagType.default){
        this._db.Tag.findOne({ where : { id: req.result.id, type: req.params.type } })
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
      }else{
        next(new Error("Invalid Type"))
      }
    }
}

const controller = new ImapController();
export default controller;
