import os
import requests
from flask import render_template

def send_email(recipient, subject, temp=None, message="", sender="no-reply", sender_name="PANSON joieria", **kwargs):
	mail_server = "mail.iainvisa.com"
	with open(os.environ["MAILGUN_KEY"]) as f:
		mailgun_key = f.read()

	data = {"from": "{} <{}@{}>".format(sender_name, sender, mail_server),
				"to": "{} <{}>".format(kwargs.get("name", "Estimat client"),recipient),
				"subject": "{}".format(subject)}
	if temp is None:
		data["text"] = message
	else:
		template = render_template(temp+".html", **kwargs)
		data["html"] = template

	m = requests.post(
		"https://api.eu.mailgun.net/v3/mail.iainvisa.com/messages",
		auth=("api", mailgun_key),
		data=data)
	return str(m)