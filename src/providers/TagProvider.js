import * as BaseProvider from "./BaseProvider";
import util from "util";

/* Provider for User Registration */
const save = (model, type, validate, body, validationResult) => {
	return new Promise((resolve, reject) => {
		if(type == "Manual"){
			validate("title", "Title cannot be empty").notEmpty();
			validate("color", "color cannot be empty").notEmpty();
		}else if(type == "Automatic"){
			validate("title", "Title cannot be empty").notEmpty();
			validate("color", "color cannot be empty").notEmpty();
			validate("email", "email cannot be empty").notEmpty();
			validate("subject", "subject cannot be empty").notEmpty();
			validate("to", "Title cannot be empty").notEmpty();
			validate("from", "color cannot be empty").notEmpty();
		}else {
			reject("Invalid Type");
		}
		validationResult.then(function(result) {
			if (!result.isEmpty()) {
				reject(util.inspect(result.array()));
				return;
			} else {
				body.type = type;
				resolve(body);
			}
		});
	});
};
export default {
	BaseProvider,
	save
};
