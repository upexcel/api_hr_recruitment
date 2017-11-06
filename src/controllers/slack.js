import BaseAPIController from "./BaseAPIController";

export class SlackController extends BaseAPIController {
    /*add info*/
    addInfo = (req, res, next) => {
        this._db.Slack.getChannelList(req.body)
            .then((response) => {
                this._db.Slack.create(req.body).then((response) => {
                    this.handleSuccessResponse(req, res, next, response)
                })
            }).catch(this.handleErrorResponse.bind(null, res))
    }

    /*get channel list*/
    // getChannelList = (req, res, next) => {
    //     this._db.Slack.getChannelList(req.params.account_id)
    //         .then((channelList) => {
    //             this.handleSuccessResponse(req, res, next, channelList)
    //         })
    // }

    /*Update SlackInfo*/

    update = (req, res, next) => {
        this._db.Slack.update(req.body, { where: { id: req.params.account_id } }).then((response) => {
            this.handleSuccessResponse(req, res, next, { status: 1, message: "Slack Info is Updated" })
        })
    }

    /*get slack data*/
    getSlackData = (req, res, next) => {
        this._db.Slack.slackData().then((response) => {
            this.handleSuccessResponse(req, res, next, response)
        })
    }

    /*get slack data by id*/
    getSlackDataByid = (req, res, next) => {
        this._db.Slack.findOne({ where: { id: req.params.slack_id } }).then((response) => {
            if (response)
                this.handleSuccessResponse(req, res, next, { data: response })
            else
                this.handleSuccessResponse(req, res, next, { data: null })
        }).catch(this.handleErrorResponse.bind(null, res))
    }

    /*deleteSlackInfo*/
    deleteSlackInfo = (req, res, next) => {
        this._db.Slack.destroy({ where: { id: req.params.slack_id } }).then((response) => {
            this.handleSuccessResponse(req, res, next, { message: "success" })
        })
    }
}

const controller = new SlackController();
export default controller;