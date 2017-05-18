import * as BaseProvider from "./BaseProvider";
import util from "util";
import tag from "../models/constant";

/* Provider for User Registration */
const save = (model, type, validate, body, validationResult) => {
	return new Promise((resolve, reject) => {
		if (type === tag().tagType.manual) {
			validate("title", "Title cannot be empty").notEmpty();
			validate("color", "color cannot be empty").notEmpty();
		} else if (type === tag().tagType.automatic) {
			validate("title", "Title cannot be empty").notEmpty();
			validate("color", "color cannot be empty").notEmpty();
		} else {
			reject("Invalid Type");
		}
		validationResult.then(function(result) {
			if (!result.isEmpty()) {
				reject(util.inspect(result.array()));
			} else {
				body.type = type;
				resolve(body);
			}

		});

	});
};
export default {
	BaseProvider,
	save,
};
