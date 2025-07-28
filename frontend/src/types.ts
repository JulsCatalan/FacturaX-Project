export interface Invoice {
  id: number;
  user_id: number;
  provider_name: string;
  issuer_rfc: string;
  receiver_rfc: string;
  receiver_name: string;
  amount: number;
  issue_date: string;
  s3_url: string;
  status: string;
}