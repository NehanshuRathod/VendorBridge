-- V8: Create notifications and audit logs
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    message TEXT,
    reference_id VARCHAR(255),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name VARCHAR(255),
    entity_id VARCHAR(255),
    action VARCHAR(255),
    performed_by VARCHAR(255),
    old_values TEXT,
    new_values TEXT,
    timestamp TIMESTAMP,
    ip_address VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_audit_logs_entity_name ON audit_logs(entity_name);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
