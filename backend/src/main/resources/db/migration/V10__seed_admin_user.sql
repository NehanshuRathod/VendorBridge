-- V10: Seed default admin user
-- Password: Admin@1234 (BCrypt hash)
INSERT INTO users (id, email, password_hash, full_name, role, active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin@vendorbridge.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'System Administrator',
    'ADMIN',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;
