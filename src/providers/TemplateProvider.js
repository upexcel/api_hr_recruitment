import * as BaseProvider from "./BaseProvider";
import util from "util";

/* Provider for User Registration */
const save = (model, validate, body, validationResult) => new Promise((resolve, reject) => {
	validate("templateName", "Template Name cannot be empty").notEmpty();
	validate("subject", "Subject cannot be empty").notEmpty();
	validate("body", "Body cannot be empty").notEmpty();
	validationResult.then((result) => {
		if (!result.isEmpty()) {
			reject(util.inspect(result.array()));
		} else {
			resolve(body);
		}
	});
});


export default {
	...BaseProvider,
	save,
};
