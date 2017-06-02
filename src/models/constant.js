export default function() {
    const constant = {
        tagType: {
            default: "Default",
            manual: "Manual",
            automatic: "Automatic",
        },
        userType: {
            admin: "Admin",
            guest: "Guest",
            hr: "HR",
        },
        smtp: {
            subject: "Smtp test",
            from: "noreply@excellencetechnologies.in",
            html: "Smtp test successfully",
            text: "Template"
        }
    };
    return constant;
}
