-- V2: Create vendors table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    gst_number VARCHAR(50) UNIQUE,
    category VARCHAR(50) NOT NULL DEFAULT 'GOODS',
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
    rating NUMERIC(3, 2) DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE vendor_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    vendor_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_vendor_user_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_vendor_user_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_company_name ON vendors(company_name);
CREATE INDEX idx_vendor_users_vendor_id ON vendor_users(vendor_id);
