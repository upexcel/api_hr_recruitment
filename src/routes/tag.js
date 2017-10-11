import tag from "../controllers/tag";
import auth from "../middleware/auth";

export default (app) => {
    /* Route for tag save  */
    app.route("/tag/add/:type").post(auth.requiresAdminOrHr, tag.save);

    /* Route for tag update  */
    app.route("/tag/update/:type/:tagId").put(auth.requiresAdminOrHr, tag.update);

    /* Route for tag Delete */
    app.route("/tag/delete/:type/:tagId").delete(auth.requiresAdminOrHr, tag.deleteTag);

    /* Route for fetch tag Data */
    app.route("/tag/get/:type/:page/:limit").get(auth.requiresAdminOrHr, tag.getTag);

    /* Route for fetch all tag data */
    app.route("/tag/get").get(auth.requiresAdminOrHr, tag.getAllTag);

    /* Route for fetch tag by id */
    app.route("/tag/getbyid/:type/:tagId").get(auth.requiresAdminOrHr, tag.getTagById);

    /*Get shedules*/
    app.route("/get/shedule").get(auth.requiresAdminOrHr, tag.getShedule);

    /*set priority of job profile*/
    app.route("/update/priority").put(auth.requiresAdminOrHr, tag.updatePriority);

    app.param("tagId", tag.idResult);

    return app;
};