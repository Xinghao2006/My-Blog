export interface ReceiptItem {
  name: string;
  qty: number;
  price: string;
}

export interface HiddenContentItem {
  id: string;
  type: 'image' | 'text';
  content: string;
}

export interface ReceiptData {
  dateRange: string;
  cashier: string;
  items: ReceiptItem[];
  totalLabel: string;
  totalValue: string;
  taxLabel: string;
  taxValue: string;
  // New structure for multiple items
  hiddenContent?: HiddenContentItem[];
  // Deprecated fields kept for backward compatibility during migration
  hiddenStory?: string;
  hiddenImage?: string;
}

export interface PolaroidData {
  items: HiddenContentItem[];
  date: string;
}