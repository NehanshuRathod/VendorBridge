import bcrypt
h = b"$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
for pwd in ['Admin@1234', 'Admin@123', 'Admin@123!', 'password', 'admin', 'Admin@12345']:
    try:
        print(pwd, bcrypt.checkpw(pwd.encode('utf-8'), h))
    except Exception as e:
        print(pwd, 'ERROR', type(e).__name__, e)
