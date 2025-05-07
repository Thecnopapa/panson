import json
import random
import string
import hmac
import base64
import hashlib
import time
import requests

base_url = 'https://sandboxapi.rapyd.net'
secret_key = 'rsk_8c50432a8b9fd06b567d2d0c9cc9decdda04f0fede16d97e7db59a2bb8aaee05de86ee17d36e92c6'  # Never transmit the secret key by itself.
access_key = 'rak_02B7AE2171F42040158F'  # The access key received from Rapyd.


# salt: randomly generated for each request.
def generate_salt(length=12):
    return ''.join(random.sample(string.ascii_letters + string.digits, length))


# Current Unix time (seconds).
def get_unix_time(days=0, hours=0, minutes=0, seconds=0):
    return int(time.time())


def update_timestamp_salt_sig(http_method, path, body):
    if path.startswith('http'):
        path = path[path.find(f'/v1'):]
    salt = generate_salt()
    timestamp = get_unix_time()
    to_sign = (http_method, path, salt, str(timestamp), access_key, secret_key, body)

    h = hmac.new(secret_key.encode('utf-8'), ''.join(to_sign).encode('utf-8'), hashlib.sha256)
    signature = base64.urlsafe_b64encode(str.encode(h.hexdigest()))
    return salt, timestamp, signature


def current_sig_headers(salt, timestamp, signature):
    sig_headers = {'access_key': access_key,
                   'salt': salt,
                   'timestamp': str(timestamp),
                   'signature': signature,
                   'idempotency': str(get_unix_time()) + salt}
    return sig_headers


# http_method = get|put|post|delete - must be lowercase
# path = Portion after the base URL.
# body = JSON body with no whitespace except in strings.
def pre_call(http_method, path, body=None):
    str_body = json.dumps(body, separators=(',', ':'), ensure_ascii=False) if body else ''
    salt, timestamp, signature = update_timestamp_salt_sig(http_method=http_method, path=path, body=str_body)
    return str_body.encode('utf-8'), salt, timestamp, signature


def create_headers(http_method, url, body=None):
    body, salt, timestamp, signature = pre_call(http_method=http_method, path=url, body=body)
    return body, current_sig_headers(salt, timestamp, signature)


def make_request(method, path, body=''):
    body, headers = create_headers(method, base_url + path, body)  # JSON body goes here. Always empty string for GET;
    headers['content-type'] = 'application/json'
    if method == 'get':
        response = requests.get(base_url + path, headers=headers)
    elif method == 'put':
        response = requests.put(base_url + path, data=body, headers=headers)
    elif method == 'delete':
        response = requests.delete(base_url + path, data=body, headers=headers)
    else:
        response = requests.post(base_url + path, data=body, headers=headers)

    if response.status_code != 200:
        raise TypeError(response, method, base_url + path)
    return json.loads(response.content)


from pprint import pprint


#response = make_request(method='get', path='/v1/data/countries')

#pprint(response)



checkout_page = {
    "amount": 100,
    "complete_payment_url": "http://example.com/complete",
    "country": "ESP",
    "currency": "EUR",
    "customer": "cus_9761efaa881b6edeab25e9fbfec1ddf5",
    "error_payment_url": "http://example.com/error",
    "merchant_reference_id": "0912-2021",
    "language": "en",
    "metadata": {
        "merchant_defined": True
    },
    "expiration": 1632027189,
    "payment_method_types_include": [
        "sg_grabpay_ewallet"
    ]
}
#result = make_request(method='post', path='/v1/checkout', body=checkout_page)
#pprint(result)

curl_line = ("curl -X post https://sandboxapi.rapyd.net/v1/checkout "+
 "-H 'access_key: {}' ".format(access_key) +
 "-H 'Content-Type: application/json' "+
 "-H 'idempotency: {}' ".format("a") +
 "-H 'salt: your-random-string-here' "+
 "-H 'signature: your-calculated-signature-here' "+
 "-H 'timestamp: your-unix-timestamp-here' ")


'''
 "-d '{"amount": 100,
    "complete_payment_url": "http://example.com/complete",
    "country": "SG",
    "currency": "SGD",
    "customer": "cus_9761efaa881b6edeab25e9fbfec1ddf5",
    "error_payment_url": "http://example.com/error",
    "merchant_reference_id": "0912-2021",
    "language": "en",
    "metadata": {
        "merchant_defined": true
    },
    "payment_method_types_include": [
        "sg_grabpay_ewallet"
    ],
    "expiration": 1632027189
}
'''

print(curl_line)



result = make_request(method='get', path='https://checkout.rapyd.net/demo?ctaText=pay&buttonColor=%23000000&selectedCategories=card%2Cbank%2Ccash%2Cewallet&showTaxesAndFees=true&showCartItems=true&showFx=true&showBillingAddress=true&language=en-US&previewApplePay=true&previewGooglePay=true')
pprint(result)