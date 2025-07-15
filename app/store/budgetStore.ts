import { create } from 'zustand';

type OCRItem = {
  item: string;
  price: number;
};

export type ExpenseRecord = {
  id: string;
  date: string;
  items: OCRItem[];
  total: number;
  image?: string;
};

type BudgetState = {
  budget: number;
  setBudget: (amount: number) => void;
  expenses: ExpenseRecord[];
  addExpense: (record: ExpenseRecord) => void;
};

export const useBudgetStore = create<BudgetState>((set) => ({
  budget: 0,
  setBudget: (amount) => set({ budget: amount }),
  expenses: [],
  addExpense: (record) => set((state) => ({ expenses: [record, ...state.expenses] })),
}));

export default useBudgetStore;