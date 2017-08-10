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
        shedule_for: [
            { value: 'first_round', text: "First Round", info: "First round is written test.Which will be divided in two section, first section is objective and second section is subjective questions.Once you clear both these section then there would be HR round." },
            { value: 'second_round', text: "Second Round", info: "Second round is a Machine Test which contain 5 questions. you have to run code and apply logic as per question requirement." },
            { value: 'third_round', text: "Third Round", info: "Third round is a Technical Interview & Logical reasoning Round in this your technical knowledge and reasoning ability would be tested" }
        ],
        first_round_slots: ['10:30 am', '11:00 am', '11:30 am', '12:00 pm', '12:30 pm', '01:00 pm', '01:30 pm', '02:00 pm', '02:30 pm', '03:00 pm', '03:30 pm', '04:30 pm'],
        second_round_slots: ['10:30 am', '12:00 pm', '01:30 pm'],
        third_round_slots: ['03:00 pm', '04:00 pm'],
        push_notification_message: 'Interview Scheduled',
        old_emails_fetch_days_count: 5,
        registration_message: " <br> your registration_id is:-",
        ignored_api_log_list: ["/email/fetch/", "/email/countEmail", "/email/mailAttachment/", "/variable/get/", "/imap/get", "/smtp/get/", "/template/get/", "/tag/get/", "/systemVariable/get/", "/app_get_candidate"]
    };
    return constant;
}