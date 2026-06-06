-- V4: Create quotations and quotation items
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number VARCHAR(20) NOT NULL UNIQUE,
    rfq_id UUID NOT NULL,
    vendor_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    total_amount NUMERIC(15, 2),
    delivery_days INTEGER,
    valid_until DATE,
    notes TEXT,
    submitted_at TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_quotation_rfq FOREIGN KEY (rfq_id) REFERENCES rfqs(id),
    CONSTRAINT fk_quotation_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL,
    rfq_item_id UUID,
    unit_price NUMERIC(15, 2) NOT NULL,
    quantity NUMERIC(15, 3) NOT NULL,
    total_price NUMERIC(15, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_quotation_item_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    CONSTRAINT fk_quotation_item_rfq_item FOREIGN KEY (rfq_item_id) REFERENCES rfq_items(id)
);

CREATE INDEX idx_quotations_rfq_id ON quotations(rfq_id);
CREATE INDEX idx_quotations_vendor_id ON quotations(vendor_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotation_items_quotation_id ON quotation_items(quotation_id);
