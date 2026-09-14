import type { PointPackage, PointTransaction, PointWallet } from "@/types";

export const pointPackages: PointPackage[] = [
  {
    id: "pp_100",
    points: 100,
    price: 1000,
  },
  {
    id: "pp_500",
    points: 500,
    price: 4500,
    popular: true,
    bonus: 50,
  },
  {
    id: "pp_1000",
    points: 1000,
    price: 8000,
    bonus: 150,
  },
  {
    id: "pp_2500",
    points: 2500,
    price: 17500,
    bonus: 500,
  },
];

export const currentWallet: PointWallet = {
  userId: "u_me",
  balance: 1250,
  lifetimePoints: 2400,
  transactions: [
    {
      id: "pt_1",
      userId: "u_me",
      type: "purchase",
      amount: 500,
      description: "Purchased 500 points package",
      createdAt: "2026-08-10T12:00:00",
      reference: "PAY-8K2JN4",
      status: "success",
    },
    {
      id: "pt_2",
      userId: "u_me",
      type: "unlock",
      amount: -50,
      description: "Unlocked \"The Forbidden Forest\" — The Last Kingdom S1E2",
      createdAt: "2026-08-15T20:00:00",
      status: "success",
    },
    {
      id: "pt_3",
      userId: "u_me",
      type: "bonus",
      amount: 50,
      description: "Purchase bonus",
      createdAt: "2026-08-10T12:01:00",
      status: "success",
    },
    {
      id: "pt_4",
      userId: "u_me",
      type: "unlock",
      amount: -50,
      description: "Unlocked \"The Gilded Drum\" — Ghosts of the Ashanti S1E2",
      createdAt: "2026-08-20T09:00:00",
      status: "success",
    },
    {
      id: "pt_5",
      userId: "u_me",
      type: "unlock",
      amount: -100,
      description: "Unlocked \"The Ascension\" — The Last Kingdom S1E6",
      createdAt: "2026-09-03T20:00:00",
      status: "success",
    },
    {
      id: "pt_6",
      userId: "u_me",
      type: "purchase",
      amount: 1000,
      description: "Purchased 1,000 points package",
      createdAt: "2026-09-05T15:30:00",
      reference: "PAY-G3MX7R",
      status: "success",
    },
    {
      id: "pt_7",
      userId: "u_me",
      type: "bonus",
      amount: 150,
      description: "Purchase bonus",
      createdAt: "2026-09-05T15:31:00",
      status: "success",
    },
    {
      id: "pt_8",
      userId: "u_me",
      type: "bonus",
      amount: 150,
      description: "Welcome bonus",
      createdAt: "2026-09-01T08:00:00",
      status: "success",
    },
  ],
};

// Creator earnings example (for Chief Uwa)
export const creatorEarnings = {
  availableBalance: 84250,
  pendingBalance: 17500,
  totalEarnings: 1284000,
  withdrawableBalance: 84250,
  totalPointsEarned: 684000,
  withdrawalHistory: [
    {
      id: "w_1",
      creatorId: "c_chiefuwa",
      amount: 250000,
      bankName: "Access Bank",
      accountNumber: "0123456789",
      accountName: "Chinedu Uwadiegwu",
      status: "completed" as const,
      createdAt: "2026-07-02T10:00:00",
      processedAt: "2026-07-03T14:00:00",
    },
    {
      id: "w_2",
      creatorId: "c_chiefuwa",
      amount: 120500,
      bankName: "Access Bank",
      accountNumber: "0123456789",
      accountName: "Chinedu Uwadiegwu",
      status: "processing" as const,
      createdAt: "2026-09-07T10:00:00",
    },
  ],
};

// Example unlocks for creator earnings chart
export const earningsByMonth = [
  { label: "May", value: 82000 },
  { label: "Jun", value: 115000 },
  { label: "Jul", value: 98000 },
  { label: "Aug", value: 148000 },
  { label: "Sep", value: 192000 },
  { label: "Oct", value: 178000 },
  { label: "Nov", value: 214000 },
  { label: "Dec", value: 246000 },
];