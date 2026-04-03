import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useQuizStore } from './quizStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SessionState {
  sessionToken: string | null;
  sessionExpiresAt: string | null;
}

interface SessionActions {
  /**
   * Persist a session token and sync purchasedProductIds from the server.
   *
   * mode 'merge'   — union(local, server). Use in AccessPage where
   *                  addPurchasedProduct has already run and webhook delay
   *                  may mean the server list is incomplete.
   *
   * mode 'replace' — server list overwrites local list. Use in EmailAccessForm
   *                  where the user is explicitly re-authenticating and the
   *                  server is authoritative (handles refunds).
   */
  setSession: (
    token: string,
    expiresAt: string,
    serverProductIds: string[],
    mode: 'merge' | 'replace',
  ) => void;
  /** Clear token/expiry. Does NOT touch purchasedProductIds. */
  clearSession: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const initialState: SessionState = {
  sessionToken: null,
  sessionExpiresAt: null,
};

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      ...initialState,

      setSession: (token, expiresAt, serverProductIds, mode) => {
        const quizStore = useQuizStore.getState();

        if (mode === 'replace') {
          quizStore.setProductIds(serverProductIds);
        } else {
          // merge: add each server id through the existing deduplication action
          serverProductIds.forEach((id) => quizStore.addPurchasedProduct(id));
        }

        set({ sessionToken: token, sessionExpiresAt: expiresAt });
      },

      clearSession: () => set({ sessionToken: null, sessionExpiresAt: null }),
    }),
    {
      name: 'session-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessionToken: state.sessionToken,
        sessionExpiresAt: state.sessionExpiresAt,
      }),
    },
  ),
);

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Pure function — call directly in render body.
 * Do NOT wrap in useMemo: the result depends on the current time and
 * a memoised value would not re-evaluate when the session expires.
 */
export function isSessionValid(
  token: string | null,
  expiresAt: string | null,
): boolean {
  return !!token && !!expiresAt && new Date(expiresAt) > new Date();
}
