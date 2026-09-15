import { PaystackCallback } from "@/components/payments/paystack-callback";

export default async function PaystackCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const reference =
    (typeof params.reference === "string" && params.reference) ||
    (typeof params.trxref === "string" && params.trxref) ||
    null;

  return <PaystackCallback reference={reference} />;
}