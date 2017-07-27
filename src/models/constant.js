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
        automatic_mail_subject_match: "Re: Revert Information",
        shedule_for: ['first_round', 'second_round', 'third_round'],
        first_round_slots: ['10:30', '11:00', '11:30', '12:00', '12:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:30'],
        second_round_slots: ['10:30', '12:00', '01:30'],
        third_round_slots: ['03:00', '04:00'],
        push_notification_message: 'Your Interview Is Sheduled For',
        limit_for_email_fetch: 5,
    };
    return constant;
}