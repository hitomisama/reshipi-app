import { create } from 'zustand'

type BudgetState = {
  budget: number
  setBudget: (amount: number) => void
}

export const useBudgetStore = create<BudgetState>((set) => ({
  budget: 0,
  setBudget: (amount) => set({ budget: amount }),
}));