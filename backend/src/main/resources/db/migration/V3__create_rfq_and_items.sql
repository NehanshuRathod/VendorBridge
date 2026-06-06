-- V3: Create RFQ, RFQ items, RFQ attachments, RFQ vendor assignments
CREATE TABLE rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_number VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    deadline TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_rfq_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE rfq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity NUMERIC(15, 3) NOT NULL,
    unit VARCHAR(50),
    estimated_unit_price NUMERIC(15, 2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_rfq_item_rfq FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE
);

CREATE TABLE rfq_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_key VARCHAR(500) NOT NULL,
    content_type VARCHAR(255),
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_rfq_attachment_rfq FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE
);

CREATE TABLE rfq_vendor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL,
    vendor_id UUID NOT NULL,
    invited_at TIMESTAMP NOT NULL DEFAULT NOW(),
    responded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_rfq_vendor_rfq FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE,
    CONSTRAINT fk_rfq_vendor_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    CONSTRAINT uq_rfq_vendor UNIQUE (rfq_id, vendor_id)
);

CREATE INDEX idx_rfqs_status ON rfqs(status);
CREATE INDEX idx_rfqs_created_by ON rfqs(created_by);
CREATE INDEX idx_rfq_items_rfq_id ON rfq_items(rfq_id);
CREATE INDEX idx_rfq_attachments_rfq_id ON rfq_attachments(rfq_id);
CREATE INDEX idx_rfq_vendor_assignments_rfq_id ON rfq_vendor_assignments(rfq_id);
CREATE INDEX idx_rfq_vendor_assignments_vendor_id ON rfq_vendor_assignments(vendor_id);
