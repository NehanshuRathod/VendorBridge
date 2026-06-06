export interface Vendor {
  id: string;
  name: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  gstNo: string;
  rating: number;
  status: "Active" | "Pending" | "Blocked";
  joinedDate: string;
}

export interface Rfq {
  id: string; // RFQ-XXXX
  title: string;
  item: string;
  quantity: number;
  category: string;
  deadline: string;
  description: string;
  assignedVendors: string[]; // Vendor IDs
  status: "Bidding Open" | "Bids Received" | "Under Review" | "Pending Approval" | "Approved" | "PO Generated" | "Completed";
  createdAt: string;
  selectedQuotationId: string | null;
  creator: string;
}

export interface Quotation {
  id: string; // QT-XXXX
  rfqId: string;
  vendorId: string;
  vendorName: string;
  unitPrice: number;
  taxRate: number; // e.g. 18 for 18%
  deliveryDays: number;
  notes: string;
  terms: string;
  status: "Submitted" | "Shortlisted" | "Selected" | "Rejected" | "Approved";
  submittedAt: string;
}

export interface PurchaseOrder {
  id: string; // PO-XXXX
  rfqId: string;
  quotationId: string;
  vendorId: string;
  vendorName: string;
  item: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalAmount: number;
  status: "Issued" | "Acknowledged" | "Delivered";
  createdAt: string;
  approverRemarks?: string;
}

export interface Invoice {
  id: string; // INV-XXXX
  poId: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  item: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  baseAmount: number;
  cgst: number; // Central GST (half of taxRate)
  sgst: number; // State GST (half of taxRate)
  totalTax: number;
  grandTotal: number;
  status: "Unpaid" | "Paid" | "Overdue";
  createdAt: string;
  invoiceDate: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: "Procurement" | "Vendor" | "Approver" | "Admin";
  action: string;
  details: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  role: "Procurement" | "Vendor" | "Approver" | "Admin" | "All";
  timestamp: string;
  read: boolean;
}

export type UserRole = "Procurement" | "Vendor" | "Approver" | "Admin";
