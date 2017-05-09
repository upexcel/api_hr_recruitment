import express from 'express';
import BaseAPIController from './BaseAPIController';
import ImapProvider from '../providers/ImapProvider';
import db from '../db';

export class FetchController extends BaseAPIController {

    /*Get INBOX data*/
    fetch = (req, res, next) => {

        req.email.find({tag_id: {$in:[req.body.tag_id]}}).skip((req.body.page - 1) * 21).exec(function(err, data) {
            if (err) {
               next(new Error(err));
            } else {
                res.json({ data: data });
            }
        });
    }

        count_email = (req, res, next) => {
              req.email.aggregate([
        {
            // $group: {

            //     _id: '$tag_id', //$website is the column name in collection
            //     count_products: {$sum: 1},
            //      $unwind: '$tag_id',
            //     // cond: {
            //     //         $in: ['$tag_id', ['2']]
            //     //     }
            // }
            $group: {_id: '$tag_id', sum: {$sum: 1}}
        }
    ], function (err, result) {
        if (err) {
            res.json({error: 1, message: err, data: {'websites': []}});
            next(err);
        } else {
            // var websites = [];
            // _.each(result, function (data) {
            //     var obj = {};
            //     obj.name = data._id;
            //     obj.count_products = data.count_products;
            //     websites.push(obj);
            // })
            res.json({data: result});
        }
    });
        // req.email.aggregate([{$group:{_id:"$website",count_products:{$sum: 1}}}].exec(function(err, data) {
        //     if (err) {
        //        next(new Error(err));
        //     } else {
        //         res.json({ data: data });
        //     }
        // });
    }

        assignTag = (req, res, next) => {
            this._db.Tag.tag(req.body.tag_id)
                .then((data)=>{
                    if(data.status){
                        
                        req.email.findOneAndUpdate({ "_id": req.body.mongo_id},{"$push": { "tag_id": req.body.tag_id }}).exec(function(err,data){
            if (err) {
               next(new Error(err));
            } else {
                res.json({ data: data });
            }
        }); 
                    }else{
                        next(new Error('invalid tag id'));
                    }
                })
       
    }

    fetch_by_tag = (req, res, next) => {
        this._db.Tag.tag(req.body.tag_id)
        .then((data)=>{
            if(data.status){
 req.email.find({tag_id: {$in:[req.body.tag_id]}}).skip((req.body.page - 1) * 21).exec(function(err, data) {
            if (err) {
               next(new Error(err));
            } else {
                res.json({ data: data });
            }
        });
            }else{
              next(new Error(err));  
            }
        })
       
    }

}

const controller = new FetchController();
export default controller;
