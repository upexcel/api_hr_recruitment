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
            hr: "HR",
        },
        smtp: {
            subject: "Smtp test",
            from: "noreply@excellencetechnologies.in",
            html: "Smtp test successfully",
            text: "Template",
            passwordMessage: 'New Password Generated'
        },
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
        ignored_api_log_list: ["/get/slackInfo","/email/inbox/", "/dashboard", "/email/fetch/", "/email/countEmail", "/email/mailAttachment/", "/variable/get/", "/imap/get", "/smtp/get/", "/template/get/", "/tag/get/", "/systemVariable/get/", "/app_get_candidate", "/user/log", "/get/email/logs", "/search/email/logs", "/get/shedule"],
        office_location: { long: 28.5960769, lat: 77.3277893 },
        app_hr_contact_email: "saurabhk_etech@excellencetechnologies.in",
        app_hr_contact_number: "+91-9811065469",
        tag_type: ["Default", "Manual", "Automatic"],
        user_type: ["Admin", "Guest", "HR"],
        app_custom_link: "<br><br>https://etech.app.link/6xHFkza9eG?%24deeplink_path=",
        months_list: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        user: "By Cron",
        selected: "Selected",
        reminder: "Reminder Email, Your Interview is Scheduled On",
        pending_work: "pending_candidate",
        not_replied: "not_replied",
        add_html_suffix_email_tracking: '<img src="https://www.google-analytics.com/collect?v=1',
        selectedCandidate: 'selected_candidate',
        sendToAll: 'send_to_all',
        app_name:"ExcellenceHrRecruit",
        campaign_name:"seenReply",
        campaign_source:"ExcellenceTechnosoftPvtLtd",
        slack_message: "Interview is Scheduled for !!",
        admin_mail:"sumit@excellencetechnologies.in",
        user_icon: "http://picasaweb.google.com/data/entry/api/user/"
    };
    return constant;
}