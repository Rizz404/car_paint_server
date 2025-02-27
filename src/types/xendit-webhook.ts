import { PaymentReusability, PaymentMethodType } from "@prisma/client";
import {
  EWalletChannelCode,
  VirtualAccountChannelCode,
} from "xendit-node/payment_request/models";

export enum XenditPaymentStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
  SETTLED = "SETTLED",
  EXPIRED = "EXPIRED",
  ACTIVE = "ACTIVE",
  STOPPED = "STOPPED",
}

type PaymentMethodstatus =
  | "UNPAID"
  | "PAID"
  | "SETTLED"
  | "EXPIRED"
  | "ACTIVE"
  | "STOPPED";

type PaymentRequestStatus = "SUCCEEDED" | "EXPIRED" | "ACTIVE" | "STOPPED";

export interface XenditInvoiceWebhookPayload {
  id: string;
  external_id: string;
  user_id: string;
  is_high: boolean;
  payment_method: string;
  status: PaymentMethodstatus;
  merchant_name: string;
  amount: number;
  paid_amount: number;
  bank_code: string;
  paid_at: Date;
  payer_email: string;
  description: string;
  adjusted_received_amount: number;
  fees_paid_amount: number;
  updated: Date;
  created: Date;
  currency: string;
  payment_channel: string;
  payment_destination: string;
}

export type XenditPaymentRequestWebhookPayload = {
  event: string;
  business_id: string;
  created: Date;
  data: {
    id: string;
    amount: number;
    country: string;
    created: Date;
    currency: string;
    payment_request_id: string;
    reference_id: string;
    status: PaymentRequestStatus;
    customer_id: string | null;
    description: string | null;
    payment_method: {
      id: string;
      type: PaymentMethodType;
      reusability: PaymentReusability;
      status: string;
      over_the_counter?: {
        channel_code: string;
        channel_properties: {
          customer_name: string;
          expires_at: Date;
          payment_code: string;
        };
      };
      metadata: Record<string, string>;
      direct_debit: null;
      ewallet: {
        account: {
          name: string | null;
          balance: string | null;
          point_balance: string | null;
          account_details: string | null;
        };
        channel_code: EWalletChannelCode;
        channel_properties: {
          mobile_number: string;
          failure_return_url: string;
          success_return_url: string;
        };
      };
      qr_code: null;
      virtual_account: {
        amount: number;
        currency: "IDR";
        channel_code: VirtualAccountChannelCode;
        channel_properties: {
          expires_at: Date;
          customer_name: string;
          virtual_account_number: number;
        };
      };
      created: Date;
      updated: Date;
    };
    metadata: Record<string, string>;
    payment_detail: null;
    failure_code: null;
    channel_properties: null;
    updated: Date;
  };
};
