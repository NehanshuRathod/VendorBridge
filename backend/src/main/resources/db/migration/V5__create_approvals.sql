-- V5: Create approval requests
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id VARCHAR(255) NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    requested_by_id UUID NOT NULL,
    approver_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    comments TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_approval_requested_by FOREIGN KEY (requested_by_id) REFERENCES users(id),
    CONSTRAINT fk_approval_approver FOREIGN KEY (approver_id) REFERENCES users(id)
);

CREATE INDEX idx_approval_requests_ref ON approval_requests(reference_id, reference_type);
CREATE INDEX idx_approval_requests_approver ON approval_requests(approver_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
CREATE INDEX idx_approval_requests_requested_by ON approval_requests(requested_by_id);
