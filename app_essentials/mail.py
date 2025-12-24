import os
import requests
from flask import render_template
from app_essentials.utils import Utils

def send_email(recipient, subject=None, temp=None, message="", sender="no-reply", sender_name="PANSON joieria",
               recipient_name=None, internal_recipient=False, cc=None, **kwargs):
    assert subject is not None
    mail_server = "pansonjoieria.com"
    with open(os.environ["MAILGUN_KEY"]) as f:
        mailgun_key = f.read()

    if internal_recipient:
        recipient = recipient+"@"+mail_server

    if recipient_name is None:
        recipient_name = recipient.split("@")[0]

    data = {
            "from": "{} <{}@{}>".format(sender_name, sender, mail_server),
            "to": "{} <{}>".format(recipient_name,recipient),
            "subject": "{}".format(subject),
            }
    if cc is not None:
        data["cc"] = "{} <{}@{}>".format(cc, cc, mail_server)
    if temp is None:
        data["text"] = message
    else:
        if "." not in temp:
            temp += ".html"
        kwargs["recipient"] = recipient
        kwargs["recipient_name"] = recipient_name
        kwargs["subject"] = subject
        kwargs["message"] = message
        kwargs["sender"] = sender
        kwargs["sender_name"] = sender_name
        kwargs["mail_server"] = mail_server
        template = render_template(temp, utils= Utils(), **kwargs)
        data["html"] = template

    m = requests.post(
		"https://api.eu.mailgun.net/v3/{}/messages".format(mail_server),
		auth=("api", mailgun_key),
		data=data)
    return m.status_code


def send_newsletter(mailing_list, subject="PANSON newsletter", temp="email_newsletter", message="", test=False):
    if test:
        mailing_list += ".test"
    return send_email(mailing_list, subject=subject, temp=temp, sender=mailing_list, sender_name="PANSON newsletter", message=message, internal_recipient=True)
