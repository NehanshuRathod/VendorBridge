-- V7: Create invoices and invoice line items
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(20) NOT NULL UNIQUE,
    purchase_order_id UUID NOT NULL UNIQUE,
    vendor_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'GENERATED',
    sub_total NUMERIC(15, 2) NOT NULL,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(15, 2) NOT NULL,
    invoice_date DATE,
    due_date DATE,
    generated_by_id UUID,
    pdf_file_key VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_invoice_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
    CONSTRAINT fk_invoice_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    CONSTRAINT fk_invoice_generated_by FOREIGN KEY (generated_by_id) REFERENCES users(id)
);

CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    description VARCHAR(500) NOT NULL,
    quantity NUMERIC(15, 3) NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 0,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    total_amount NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_invoice_line_item_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX idx_invoices_vendor_id ON invoices(vendor_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_purchase_order_id ON invoices(purchase_order_id);
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
