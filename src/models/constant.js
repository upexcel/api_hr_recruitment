export default function() {
    const constant = {
        tagType: {
            default: "Default",
            manual: "Manual",
            automatic: "Automatic",
            genuine: "Genuine Applicant"
        },
        userType: {
            admin: "Admin",
            guest: "Guest",
            hr: "Hr",
        },
        smtp: {
            subject: "Smtp test",
            from: "noreply@excellencetechnologies.in",
            html: "Smtp test successfully",
            text: "Template",
            passwordMessage: 'New Password Generated'
        },
        automatic_mail_subject: "Revert Information",
        automatic_mail_subject_match: "Re: Revert Information"
    };
    return constant;
}
