import os
import requests
from flask import render_template
from app_essentials.utils import Utils

def send_email(recipient, subject, temp=None, message="", sender="no-reply", sender_name="PANSON joieria", recipient_name=None, internal_recipient=False, **kwargs):
	mail_server = "panson.joieria.com"
	with open(os.environ["MAILGUN_KEY"]) as f:
		mailgun_key = f.read()

	if internal_recipient:
		recipient = recipient+"@"+mail_server

	if recipient_name is None:
		recipient_name = recipient.split("@")[0]

	data = {"from": "{} <{}@{}>".format(sender_name, sender, mail_server),
				"to": "{} <{}>".format(recipient_name,recipient),
				"subject": "{}".format(subject)}
	if temp is None:
		data["text"] = message
	else:
		kwargs["recipient"] = recipient
		kwargs["recipient_name"] = recipient_name
		kwargs["subject"] = subject
		kwargs["message"] = message
		kwargs["sender"] = sender
		kwargs["sender_name"] = sender_name
		kwargs["mail_server"] = mail_server
		template = render_template(temp+".html", utils= Utils(), **kwargs)
		data["html"] = template

	m = requests.post(
		"https://api.eu.mailgun.net/v3/mail.iainvisa.com/messages",
		auth=("api", mailgun_key),
		data=data)
	return str(m)