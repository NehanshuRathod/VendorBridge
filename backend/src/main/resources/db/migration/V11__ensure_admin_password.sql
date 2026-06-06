-- V11: Ensure default admin user has a known password
-- Password: Admin@1234
INSERT INTO users (id, email, password_hash, full_name, role, active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin@vendorbridge.com',
    '$2b$12$UYzPse.eW/h8TEAjWeQUb.su.a7sRkjzVWLtj8ycVmmbdUH.ptZD2',
    'System Administrator',
    'ADMIN',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    updated_at = NOW();
