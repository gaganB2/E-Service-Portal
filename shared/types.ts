export enum Urgency {
  EMERGENCY = 'Emergency',
  HIGH = 'High',
  NORMAL = 'Normal',
}

export enum RequestStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  DECLINED = 'Declined',
}

export interface InvoiceItem {
  description: string;
  cost: number;
}

export interface Invoice {
  items: InvoiceItem[];
  total: number;
  issuedDate: string;
}

export interface Rating {
  stars: number;
  feedback: string;
}

export interface ServiceRequest {
  id: string;
  customerId: string; // <-- UPDATED
  assignedTechnicianUid?: string | null;
  customerName: string;
  customerAvatar: string;
  serviceCategory: string;
  description: string;
  location: string;
  dateTime: string;
  urgency: Urgency;
  status: RequestStatus;
  invoice?: Invoice;
  paymentStatus: 'none' | 'pending' | 'paid';
  technicianRating?: Rating;
  customerRating?: Rating;
  photo?: string;
}

export interface TechnicianProfile {
  name: string;
  avatar: string;
  skills: string[];
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Message {
  id: string;
  senderUid: string;
  text: string;
  timestamp: any;
}

export interface Conversation {
  id: string;
  participantUids: string[];
  participantInfo: {
    [uid: string]: {
      fullName: string;
      avatarUrl: string;
    }
  };
  lastMessageText: string;
  updatedAt: any;
}