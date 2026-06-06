-- V6: Create purchase orders
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(20) NOT NULL UNIQUE,
    quotation_id UUID NOT NULL,
    vendor_id UUID NOT NULL,
    rfq_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'GENERATED',
    total_amount NUMERIC(15, 2) NOT NULL,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(15, 2) NOT NULL,
    delivery_address TEXT,
    expected_delivery_date DATE,
    version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_po_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id),
    CONSTRAINT fk_po_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    CONSTRAINT fk_po_rfq FOREIGN KEY (rfq_id) REFERENCES rfqs(id)
);

CREATE INDEX idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_rfq_id ON purchase_orders(rfq_id);
CREATE INDEX idx_purchase_orders_quotation_id ON purchase_orders(quotation_id);
