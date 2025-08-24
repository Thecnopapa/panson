import os
import requests


def send_email(recipient, subject, message=None, sender="no-reply", recipient_name="", sender_name="PANSON"):
    with open(os.environ["MAILGUN_KEY"]) as f:
        mailgun_key = f.read()
    m = requests.post(
  		"https://api.eu.mailgun.net/v3/mail.iainvisa.com/messages",
  		auth=("api", mailgun_key),
  		data={"from": "{} <{}@mail.iainvisa.com>".format(sender_name, sender),
			"to": "Iain Visa <{}>".format(recipient),
  			"subject": "{}".format(subject),
  			"text": "{}".format(message),})
    return m