export type Schema = {
  users: {
    id?: number;
    email: string;
    name: string;
    accountType: 'customer' | 'retailer';
    subscriptionStatus?: 'trial' | 'active' | 'expired';
    phoneNumber?: string | null;
    address?: string | null;
    lastLogin?: string | null;
    verificationStatus?: 'unverified' | 'verified';
    emailVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  
  orders: {
    id?: number;
    customerId: number;
    retailerId?: number | null;
    status?: 'received' | 'cut' | 'tempered' | 'ready';
    createdAt?: string;
    updatedAt?: string;
  };
  
  orderDetails: {
    id?: number;
    orderId: number;
    glassThickness: string;
    glassFinish: string;
    tempering: boolean;
    dfiCoating: boolean;
    width: number;
    height: number;
    quantity?: number;
    notes?: string | null;
    imageUrl?: string | null;
  };
  
  messages: {
    id?: number;
    senderId: number;
    receiverId: number;
    content: string;
    timestamp?: string;
    read?: boolean;
  };
  
  subscriptions: {
    id?: number;
    userId: number;
    plan: 'customer' | 'retailer';
    startDate?: string;
    endDate?: string | null;
    paymentMethod?: string | null;
    cardLast4?: string | null;
  };
}