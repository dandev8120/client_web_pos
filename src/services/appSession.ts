import { User } from 'oidc-client-ts';

export interface AppSession {
  id: string;
  user: Record<string, unknown>;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
}

export async function createAppSession(oidcUser: User) {
  const response = await fetch('/api/session', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${oidcUser.access_token}`,
    },
    body: JSON.stringify({
      idToken: oidcUser.id_token,
      user: {
        sub: oidcUser.profile.sub,
        name: oidcUser.profile.name || oidcUser.profile.preferred_username,
        email: oidcUser.profile.email,
        role: oidcUser.profile.role || oidcUser.profile.roles,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Cannot create app session: ${response.status}`);
  }

  return response.json() as Promise<{ success: true; session: AppSession }>;
}

export async function clearAppSession() {
  await fetch('/api/session', {
    method: 'DELETE',
    credentials: 'include',
  }).catch(() => undefined);
}
