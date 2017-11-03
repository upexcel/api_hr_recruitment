import BaseAPIController from "./BaseAPIController";

export class SlackController extends BaseAPIController {
    /*add info*/
    addInfo = (req, res, next) => {
        this._db.Slack.create(req.body).then((response) => {
            this.handleSuccessResponse(req, res, next, response)
        })
    }

    /*get channel list*/
    getChannelList = (req, res, next) => {
        this._db.Slack.getChannelList(req.params.account_id)
            .then((channelList) => {
                this.handleSuccessResponse(req, res, next, channelList)
            })
    }

    /*Update SlackInfo*/

    update = (req, res, next) => {
        this._db.Slack.update(req.body, { where: { id: req.params.account_id } }).then((response) => {
            this.handleSuccessResponse(req, res, next, { status: 1, message: "Slack Info is Updated" })
        })
    }
}

const controller = new SlackController();
export default controller;