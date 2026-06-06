import requests

base_url = 'http://localhost:8080/api/v1/auth'
register_payload = {
    'email': 'e2e_test_user@vendorbridge.com',
    'password': 'Admin@123!2',
    'fullName': 'E2E Test User'
}

print('Register payload:', register_payload)
register_resp = requests.post(f'{base_url}/register', json=register_payload)
print('REGISTER', register_resp.status_code)
print(register_resp.text)

if register_resp.status_code == 200:
    login_payload = {
        'email': register_payload['email'],
        'password': register_payload['password']
    }
    login_resp = requests.post(f'{base_url}/login', json=login_payload)
    print('LOGIN', login_resp.status_code)
    print(login_resp.text)
else:
    print('Register failed, skipping login test')
