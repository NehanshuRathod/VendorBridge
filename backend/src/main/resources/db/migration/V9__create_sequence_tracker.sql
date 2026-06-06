-- V9: Create sequence tracker table for auto-number generation
CREATE TABLE sequence_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_type VARCHAR(50) NOT NULL UNIQUE,
    current_year INTEGER NOT NULL,
    current_value BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Initialize sequences
INSERT INTO sequence_tracker (sequence_type, current_year, current_value) VALUES
    ('RFQ', EXTRACT(YEAR FROM NOW())::INTEGER, 0),
    ('QUOTATION', EXTRACT(YEAR FROM NOW())::INTEGER, 0),
    ('PURCHASE_ORDER', EXTRACT(YEAR FROM NOW())::INTEGER, 0),
    ('INVOICE', EXTRACT(YEAR FROM NOW())::INTEGER, 0);
