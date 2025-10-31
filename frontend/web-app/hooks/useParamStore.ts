import { create } from "zustand";

type State = {
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  totalPages: number;
};

type Actions = {
  setParams: (params: Partial<State>) => void;
  reset: () => void;
};

const initialState: State = {
  pageNumber: 1,
  pageSize: 10,
  pageCount: 0,
  totalPages: 0,
};

export const useParamsStore = create<State & Actions>((set) => ({
  ...initialState,

  setParams: (params: Partial<State>) => {
    set((state) => ({
      ...state,
      ...params, // ✅ Merge everything that’s passed in
    }));
  },

  reset: () => set(initialState),
}));
