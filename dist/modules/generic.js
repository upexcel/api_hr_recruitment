"use strict";

var _ = require("lodash");
module.exports = {
    Genuine_Applicant: function Genuine_Applicant(subject) {
        var Genuine_Applicant = "";
        var match = subject.match(/Re:/g);
        if (_.size(match)) {
            Genuine_Applicant = true;
        } else {
            Genuine_Applicant = false;
        }
        return Genuine_Applicant;
    }
};
//# sourceMappingURL=generic.js.map