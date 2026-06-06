-- V12: Add missing purchase order schema fields and seed realistic demo data

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS generated_by_id UUID;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(255);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS pdf_file_key VARCHAR(500);
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_po_generated_by'
          AND table_name = 'purchase_orders'
    ) THEN
        ALTER TABLE purchase_orders ADD CONSTRAINT fk_po_generated_by FOREIGN KEY (generated_by_id) REFERENCES users(id);
    END IF;
END$$;

-- Create demo users
INSERT INTO users (id, email, password_hash, full_name, role, active, created_at, updated_at)
VALUES
    ('efbecb07-d739-47be-88bf-4dbb44783e49', 'procure@vendorbridge.com', '$2b$10$Layw9jHF5yW5YwdsMlxf.eWsaSgmcY3gGbEFe0PONZFkGmxN3EMx6', 'Procurement Officer', 'PROCUREMENT_OFFICER', true, NOW(), NOW()),
    ('9c20842f-39d7-477b-bf64-f93993a54be2', 'manager@vendorbridge.com', '$2b$10$msEiABk89mm8C33tD4JQnehZjSULiG7bJNe5O2g2WFwJ0.r4BihWi', 'Operations Manager', 'MANAGER', true, NOW(), NOW()),
    ('d53c51a4-7b97-4721-a80a-3549acc620b8', 'vendor1@vendorbridge.com', '$2b$10$0imE2x/KYqM6V29s4i72tegG50xOHPrSrrb0oJqss1YzJGMxqzbpy', 'Prime Supplies User', 'VENDOR_USER', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Seed a strong supplier profile and vendor / vendor user link
INSERT INTO vendors (id, company_name, gst_number, category, contact_name, contact_email, contact_phone, address, status, rating, created_at, updated_at)
VALUES
    ('7e7b58a1-3a5b-481a-a67e-67fc04d90ae1', 'Prime Supplies Pvt Ltd', 'GSTIN29ABCDE1234F2Z5', 'GOODS', 'Rohan Mehta', 'rohan.mehta@primesupplies.com', '+91-98765-43210', 'Block 12, Industrial Estate, Pune, Maharashtra', 'ACTIVE', 4.75, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO vendor_users (id, user_id, vendor_id, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'd53c51a4-7b97-4721-a80a-3549acc620b8', '7e7b58a1-3a5b-481a-a67e-67fc04d90ae1', NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Seed a published RFQ with items and a vendor assignment
INSERT INTO rfqs (id, rfq_number, title, description, deadline, status, created_by, created_at, updated_at)
VALUES
    ('f8479c78-cdf3-4eef-ab5c-b4b2f57a4b3e', 'RFQ-2026-001', 'Office Stationery and Electronics', 'Procurement of office stationery and electronics for new branch setup.', NOW() + INTERVAL '14 days', 'PUBLISHED', 'efbecb07-d739-47be-88bf-4dbb44783e49', NOW(), NOW())
ON CONFLICT (rfq_number) DO NOTHING;

INSERT INTO rfq_items (id, rfq_id, product_name, description, quantity, unit, estimated_unit_price, created_at, updated_at)
VALUES
    ('e3ee18a9-c86f-41ca-838f-bc50d051d6d7', 'f8479c78-cdf3-4eef-ab5c-b4b2f57a4b3e', 'Executive Office Chair', 'Ergonomic mesh-back office chair with adjustable lumbar support.', 50, 'PCS', 240.00, NOW(), NOW()),
    ('da52dd6a-2153-4ac0-a8c4-7e8b8e5980a5', 'f8479c78-cdf3-4eef-ab5c-b4b2f57a4b3e', 'Wireless Conference Headset', 'Noise-cancelling wireless headset for conference room and remote calls.', 30, 'PCS', 400.00, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO rfq_vendor_assignments (id, rfq_id, vendor_id, invited_at, responded, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'f8479c78-cdf3-4eef-ab5c-b4b2f57a4b3e', '7e7b58a1-3a5b-481a-a67e-67fc04d90ae1', NOW(), true, NOW(), NOW())
ON CONFLICT (rfq_id, vendor_id) DO NOTHING;

-- Seed a submitted quotation from the vendor
INSERT INTO quotations (id, quotation_number, rfq_id, vendor_id, status, total_amount, delivery_days, valid_until, notes, submitted_at, version, created_at, updated_at)
VALUES
    ('3acdb7a5-f36c-4418-bd4a-f84de3bee9bc', 'QTN-2026-001', 'f8479c78-cdf3-4eef-ab5c-b4b2f57a4b3e', 'd53c51a4-7b97-4721-a80a-3549acc620b8', 'SUBMITTED', 24000.00, 14, NOW() + INTERVAL '30 days', 'Vendor quotation submitted for review and selection.', NOW(), 1, NOW(), NOW())
ON CONFLICT (quotation_number) DO NOTHING;

INSERT INTO quotation_items (id, quotation_id, rfq_item_id, unit_price, quantity, total_price, notes, created_at, updated_at)
VALUES
    (gen_random_uuid(), '3acdb7a5-f36c-4418-bd4a-f84de3bee9bc', 'e3ee18a9-c86f-41ca-838f-bc50d051d6d7', 240.00, 50, 12000.00, 'Ergonomic chairs as specified.', NOW(), NOW()),
    (gen_random_uuid(), '3acdb7a5-f36c-4418-bd4a-f84de3bee9bc', 'da52dd6a-2153-4ac0-a8c4-7e8b8e5980a5', 400.00, 30, 12000.00, 'Wireless headsets for team collaboration.', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed a generated purchase order against the selected quotation
INSERT INTO purchase_orders (id, po_number, quotation_id, vendor_id, rfq_id, status, total_amount, tax_amount, grand_total, delivery_address, expected_delivery_date, delivery_date, payment_terms, notes, sent_at, generated_by_id, created_at, updated_at)
VALUES
    ('3c587d81-eda0-4f8b-b002-9a228261bd9b', 'PO-2026-001', '3acdb7a5-f36c-4418-bd4a-f84de3bee9bc', 'd53c51a4-7b97-4721-a80a-3549acc620b8', 'f8479c78-cdf3-4eef-ab5c-b4b2f57a4b3e', 'GENERATED', 24000.00, 2400.00, 26400.00, 'Vendor Warehouse, Plot 6, MIDC, Pune', NOW() + INTERVAL '21 days', NULL, 'Payment due within 30 days of delivery.', 'Approved and ready for vendor confirmation.', NOW(), 'efbecb07-d739-47be-88bf-4dbb44783e49', NOW(), NOW())
ON CONFLICT (po_number) DO NOTHING;

-- Seed a generated invoice from the vendor
INSERT INTO invoices (id, invoice_number, purchase_order_id, vendor_id, status, sub_total, tax_amount, total_amount, invoice_date, due_date, generated_by_id, pdf_file_key, created_at, updated_at)
VALUES
    ('194d7720-8acf-460f-878e-ee74f31121af', 'INV-2026-001', '3c587d81-eda0-4f8b-b002-9a228261bd9b', '7e7b58a1-3a5b-481a-a67e-67fc04d90ae1', 'GENERATED', 24000.00, 2400.00, 26400.00, NOW()::DATE, (NOW() + INTERVAL '30 days')::DATE, 'd53c51a4-7b97-4721-a80a-3549acc620b8', NULL, NOW(), NOW())
ON CONFLICT (invoice_number) DO NOTHING;

INSERT INTO invoice_line_items (id, invoice_id, description, quantity, unit_price, tax_rate, tax_amount, total_amount, created_at, updated_at)
VALUES
    (gen_random_uuid(), '194d7720-8acf-460f-878e-ee74f31121af', 'Executive Office Chair - 50 units', 50, 240.00, 10.00, 1200.00, 13200.00, NOW(), NOW()),
    (gen_random_uuid(), '194d7720-8acf-460f-878e-ee74f31121af', 'Wireless Conference Headset - 30 units', 30, 400.00, 10.00, 1200.00, 13200.00, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed a pending approval request for the purchase order
INSERT INTO approval_requests (id, reference_id, reference_type, requested_by_id, approver_id, status, comments, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'PO-2026-001', 'PURCHASE_ORDER', 'efbecb07-d739-47be-88bf-4dbb44783e49', '9c20842f-39d7-477b-bf64-f93993a54be2', 'PENDING', 'Please approve this purchase order for office setup equipment.', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
