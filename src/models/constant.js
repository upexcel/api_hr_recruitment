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
        shedule_for: [{ value: 'first_round', text: "First Round" }, { value: 'second_round', text: "Second Round" }, { value: 'third_round', text: "Third Round" }],
        first_round_slots: ['10:30 am', '11:00 am', '11:30 am', '12:00 pm', '12:30 pm', '01:00 pm', '01:30 pm', '02:00 pm', '02:30 pm', '03:00 pm', '03:30 pm', '04:30 pm'],
        second_round_slots: ['10:30 am', '12:00 pm', '01:30 pm'],
        third_round_slots: ['03:00 pm', '04:00 pm'],
        push_notification_message: 'Your Interview Is Sheduled For',
        old_emails_fetch_days_count: 5,
    };
    return constant;
}