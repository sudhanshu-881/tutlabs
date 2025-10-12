import type { Role } from '../../types';

const PENDING_ROLE_KEY = 'pendingRole';

export function setPendingRole(role: Role) {
  try {
    localStorage.setItem(PENDING_ROLE_KEY, role);
  } catch {
    // ignore
  }
}

export function getPendingRole(): Role | null {
  try {
    const v = localStorage.getItem(PENDING_ROLE_KEY);
    return v === 'student' || v === 'tutor' ? (v as Role) : null;
  } catch {
    return null;
  }
}

export function clearPendingRole() {
  try {
    localStorage.removeItem(PENDING_ROLE_KEY);
  } catch {
    // ignore
  }
}
