import React from 'react';
import { 
  FileCheck, 
  CheckCircle, 
  Send, 
  UserPlus 
} from 'lucide-react';

const Activity = () => {
  return (
    <div className="activity-page animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="mb-0">Procurement audit trail</p>
        </div>
      </div>

      <div className="glass-panel max-w-4xl">
        <div className="flex gap-4 mb-8 border-b pb-4">
          <button className="badge badge-primary">All</button>
          <button className="badge" style={{background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)'}}>RFQ</button>
          <button className="badge" style={{background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)'}}>Approvals</button>
          <button className="badge" style={{background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)'}}>Invoices</button>
          <button className="badge" style={{background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)'}}>Vendors</button>
        </div>

        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-icon bg-primary-light text-primary">
              <FileCheck size={16} />
            </div>
            <div className="timeline-content">
              <h4>Quotation selected</h4>
              <p>Infra supplies pvt ltd selected for office furniture Q2</p>
              <span className="time">23 May 2025, 9:15 PM</span>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-icon bg-warning-light text-warning">
              <CheckCircle size={16} />
            </div>
            <div className="timeline-content">
              <h4>Approval pending</h4>
              <p>PO-2024 awaiting L2 approval by Priya Shah</p>
              <span className="time">22 May 2025, 09:15 AM</span>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-icon bg-success-light text-success">
              <Send size={16} />
            </div>
            <div className="timeline-content">
              <h4>RFQ published</h4>
              <p>Office furniture Q2 sent to 3 vendors</p>
              <span className="time">19 May 2025, 10:00 AM</span>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-icon bg-secondary-light text-secondary">
              <UserPlus size={16} />
            </div>
            <div className="timeline-content">
              <h4>Vendor added</h4>
              <p>FastLog transport registered and pending verification</p>
              <span className="time">18 May 2025, 3:20 PM</span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-dark rounded border border-dashed text-center">
          <p className="text-sm text-muted mb-0">
            <strong>Audit logs are immutable.</strong> These entries are write-once, with no edit or delete permissions.
          </p>
        </div>
      </div>

      <style>{`
        .max-w-4xl { max-width: 56rem; }
        .border-b { border-bottom: 1px solid var(--border-color); }
        .pb-4 { padding-bottom: 1rem; }
        
        .timeline {
          position: relative;
          padding-left: 2rem;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 11px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--border-color);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 2rem;
        }

        .timeline-item:last-child {
          margin-bottom: 0;
        }

        .timeline-icon {
          position: absolute;
          left: -2rem;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateX(-50%);
          z-index: 2;
          box-shadow: 0 0 0 4px var(--bg-card);
        }

        .bg-secondary-light { background-color: rgba(139, 92, 246, 0.1); }
        .text-secondary { color: var(--secondary); }

        .timeline-content h4 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        .timeline-content p {
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          color: var(--text-main);
        }

        .timeline-content .time {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .bg-dark { background-color: rgba(15, 23, 42, 0.5); }
        .rounded { border-radius: 0.5rem; }
        .border-dashed { border-style: dashed; }
      `}</style>
    </div>
  );
};

export default Activity;
