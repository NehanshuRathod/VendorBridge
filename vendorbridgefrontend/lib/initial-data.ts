import { Vendor, Rfq, Quotation, PurchaseOrder, Invoice, ActivityLog, Notification } from "./types";

export const initialVendors: Vendor[] = [
  {
    id: "VND-201",
    name: "Apex Digital Solutions Ltd",
    category: "IT Hardware & Networks",
    contactName: "Rajesh K. Verma",
    email: "procurement@apexdigital.com",
    phone: "+91 98101 23412",
    gstNo: "27AAPCA8421K1ZA",
    rating: 4.8,
    status: "Active",
    joinedDate: "2025-01-10T11:20:00Z"
  },
  {
    id: "VND-202",
    name: "ZenOffice Outfitters Inc",
    category: "Office Furniture",
    contactName: "Sarah Jenkins & Sons",
    email: "bids@zenoffice.com",
    phone: "+1 (555) 0192-342",
    gstNo: "27AABCM4592L2ZB",
    rating: 4.3,
    status: "Active",
    joinedDate: "2025-02-15T09:45:00Z"
  },
  {
    id: "VND-203",
    name: "Sigma Logistics & Services",
    category: "Logistics & Moving",
    contactName: "Amitabh Shah",
    email: "contracts@sigmalogistics.co.in",
    phone: "+91 22 2490 8820",
    gstNo: "27AACCS9992J1ZC",
    rating: 3.9,
    status: "Active",
    joinedDate: "2025-03-01T14:15:00Z"
  },
  {
    id: "VND-204",
    name: "Integra Tech Supplies",
    category: "IT Hardware & Networks",
    contactName: "Chen Wu",
    email: "global-bids@integrasolutions.com",
    phone: "+852 9012 8731",
    gstNo: "27AADDT1234M1ZD",
    rating: 4.5,
    status: "Pending", // Needs admin approval to activate
    joinedDate: "2026-06-01T08:00:00Z"
  },
  {
    id: "VND-205",
    name: "Lumina Electrical Corp",
    category: "Breakroom & Maintenance",
    contactName: "Diana Ross",
    email: "support@luminasupplies.net",
    phone: "+1 (555) 4492-901",
    gstNo: "27AAELC5678B1ZK",
    rating: 2.5, // Low rated vendor
    status: "Blocked", // Admin blocked vendor
    joinedDate: "2025-04-22T10:30:00Z"
  }
];

export const initialRfqs: Rfq[] = [
  {
    id: "RFQ-1024",
    title: "Executive Ergonomic Office Chairs",
    item: "Commercial Grade Office Chairs with Lumbar Support",
    quantity: 35,
    category: "Office Furniture",
    deadline: "2026-06-20",
    description: "Looking for premium mesh-back ergonomic chairs with dynamic 3D armrests, full tilt control, and aluminum cast base for regional corporate office headquarters.",
    assignedVendors: ["VND-202", "VND-203"],
    status: "Bids Received",
    createdAt: "2026-06-02T10:00:00Z",
    selectedQuotationId: null,
    creator: "Sanjay Kumar"
  },
  {
    id: "RFQ-1025",
    title: "Enterprise Core Network Switches",
    item: "Managed Layer-3 Managed Switches (48-Port POE)",
    quantity: 12,
    category: "IT Hardware & Networks",
    deadline: "2026-06-25",
    description: "Require L3 switches supporting 10G SFP+ uplinks, 802.3at PoE+, and stackable design. Must include 3-year enterprise hardware replace warranty.",
    assignedVendors: ["VND-201", "VND-204"],
    status: "Bidding Open",
    createdAt: "2026-06-05T09:12:00Z",
    selectedQuotationId: null,
    creator: "Sanjay Kumar"
  },
  {
    id: "RFQ-1023",
    title: "High-End Laptops for Engineering Team",
    item: "Developer Workstation Laptops (32GB RAM, 1TB SSD)",
    quantity: 15,
    category: "IT Hardware & Networks",
    deadline: "2026-06-02",
    description: "Standard developer setups supporting multi-core virtualization. Metal-bodied, high thermal efficiency limit, minimum 16-inch display.",
    assignedVendors: ["VND-201", "VND-204"],
    status: "Completed",
    createdAt: "2026-05-20T14:30:00Z",
    selectedQuotationId: "QT-303",
    creator: "Sanjay Kumar"
  }
];

export const initialQuotations: Quotation[] = [
  {
    id: "QT-301",
    rfqId: "RFQ-1024",
    vendorId: "VND-202",
    vendorName: "ZenOffice Outfitters Inc",
    unitPrice: 195.00,
    taxRate: 18, // 18% GST (Standard on office furniture)
    deliveryDays: 5,
    notes: "Offering our ultra-comfortable 'Pro-Ergo' series. Full multi-year warranty included, complete package delivery and onsite structure setup.",
    terms: "5 Year structural warranty. Replacement shipping processed within 48h.",
    status: "Shortlisted",
    submittedAt: "2026-06-03T15:20:00Z"
  },
  {
    id: "QT-302",
    rfqId: "RFQ-1024",
    vendorId: "VND-203",
    vendorName: "Sigma Logistics & Services",
    unitPrice: 225.00,
    taxRate: 18,
    deliveryDays: 3,
    notes: "Providing ergonomic furniture from partnered manufacturer with expedited 72-hour delivery window. Best for tight project deadlines.",
    terms: "2 Year manufacturer warranty. Delivery-only, client handles unboxing & building.",
    status: "Submitted",
    submittedAt: "2026-06-04T11:10:00Z"
  },
  {
    id: "QT-303",
    rfqId: "RFQ-1023",
    vendorId: "VND-201",
    vendorName: "Apex Digital Solutions Ltd",
    unitPrice: 1450.00,
    taxRate: 18,
    deliveryDays: 4,
    notes: "Premium developer workstations with global support contract. Pricing includes advanced pre-configured engineering OS builds.",
    terms: "3 Year parts and dynamic services cover. On-premise technician check.",
    status: "Approved",
    submittedAt: "2026-05-24T10:15:00Z"
  }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-501",
    rfqId: "RFQ-1023",
    quotationId: "QT-303",
    vendorId: "VND-201",
    vendorName: "Apex Digital Solutions Ltd",
    item: "Developer Workstation Laptops (32GB RAM, 1TB SSD)",
    quantity: 15,
    unitPrice: 1450.00,
    taxRate: 18,
    totalAmount: 25665.00, // (15 * 1450) * 1.18
    status: "Issued",
    createdAt: "2026-05-28T16:30:00Z",
    approverRemarks: "All engineering requests are pre-approved under budget line IT-9014. Expedite dispatch."
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: "INV-801",
    poId: "PO-501",
    rfqId: "RFQ-1023",
    vendorId: "VND-201",
    vendorName: "Apex Digital Solutions Ltd",
    item: "Developer Workstation Laptops (32GB RAM, 1TB SSD)",
    quantity: 15,
    unitPrice: 1450.00,
    taxRate: 18,
    baseAmount: 21750.00,
    cgst: 1957.50, // 9% of baseAmount
    sgst: 1957.50, // 9% of baseAmount
    totalTax: 3915.00,
    grandTotal: 25665.00,
    status: "Paid",
    createdAt: "2026-05-30T09:00:00Z",
    invoiceDate: "2026-05-30"
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: "LOG-001",
    timestamp: "2026-05-20T14:30:00Z",
    userId: "USR-01",
    userName: "Sanjay Kumar",
    role: "Procurement",
    action: "RFQ Created",
    details: "Created RFQ-1023 for 'High-End Laptops for Engineering Team' with 15 Workstations"
  },
  {
    id: "LOG-002",
    timestamp: "2026-05-24T10:15:00Z",
    userId: "VND-201",
    userName: "Rajesh K. Verma",
    role: "Vendor",
    action: "Quotation Submitted",
    details: "Submitted Quote QT-303 under RFQ-1023 at unit rate $1450.00 with 3 Year support terms."
  },
  {
    id: "LOG-003",
    timestamp: "2026-05-26T12:00:00Z",
    userId: "USR-01",
    userName: "Sanjay Kumar",
    role: "Procurement",
    action: "Quotation Shorthanded",
    details: "Shortlisted QT-303 and submitted bidding packet to executive manager for signoff."
  },
  {
    id: "LOG-004",
    timestamp: "2026-05-28T16:28:00Z",
    userId: "USR-03",
    userName: "Meera Patel",
    role: "Approver",
    action: "Quotation Approved",
    details: "Approved Quote QT-303. Notes: budget verified under IT-9014"
  },
  {
    id: "LOG-005",
    timestamp: "2026-05-28T16:30:00Z",
    userId: "USR-01",
    userName: "Sanjay Kumar",
    role: "Procurement",
    action: "Purchase Order Issued",
    details: "Purchase Order PO-501 officially generated and issued to Apex Digital Solutions Ltd."
  },
  {
    id: "LOG-006",
    timestamp: "2026-05-30T10:20:00Z",
    userId: "VND-201",
    userName: "Rajesh K. Verma",
    role: "Vendor",
    action: "Invoice Raised",
    details: "Issued Invoice INV-801 for PO-501 of total $25,665.00 with split 9% CGST and 9% SGST."
  },
  {
    id: "LOG-007",
    timestamp: "2026-06-01T15:00:00Z",
    userId: "USR-01",
    userName: "Sanjay Kumar",
    role: "Procurement",
    action: "Invoice Paid",
    details: "Cleared dues on Invoice INV-801. Finance settlement reference ID: WIRE-09231-G"
  },
  {
    id: "LOG-008",
    timestamp: "2026-06-02T10:00:00Z",
    userId: "USR-01",
    userName: "Sanjay Kumar",
    role: "Procurement",
    action: "RFQ Created",
    details: "Created pending RFQ-1024 for 'Executive Ergonomic Office Chairs' targeting premium vendors."
  }
];

export const initialNotifications: Notification[] = [
  {
    id: "NOT-1",
    title: "New Quotations Received",
    message: "Two suppliers have updated bids for RFQ-1024 (Executive Ergonomic Chairs)",
    role: "Procurement",
    timestamp: "2026-06-04T12:00:00Z",
    read: false
  },
  {
    id: "NOT-2",
    title: "Pending Purchase Authorization",
    message: "Sanjay Verma submitted RFQ-1024 Selection Packet to you for budget approval",
    role: "Approver",
    timestamp: "2026-06-04T12:05:00Z",
    read: false
  },
  {
    id: "NOT-3",
    title: "Urgent RFQ Target Invite",
    message: "Procurement invited Apex Digital to quote under Core Networks Switches (RFQ-1025)",
    role: "Vendor",
    timestamp: "2026-06-05T09:15:00Z",
    read: false
  }
];
