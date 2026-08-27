import { User } from 'oidc-client-ts';
import { getAxiosErrorMessage, httpClient } from '../api/httpClient';

export interface AppSession {
  id: string;
  user: Record<string, unknown>;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
}

export async function createAppSession(oidcUser: User) {
  try {
    const response = await httpClient.post('/api/session', {
      idToken: oidcUser.id_token,
      user: {
        sub: oidcUser.profile.sub,
        name: oidcUser.profile.name || oidcUser.profile.preferred_username,
        email: oidcUser.profile.email,
        role: oidcUser.profile.role || oidcUser.profile.roles,
      },
    }, {
      headers: {
        Authorization: `Bearer ${oidcUser.access_token}`,
      },
    });

    return response.data as { success: true; session: AppSession };
  } catch (err) {
    throw new Error(`Cannot create app session: ${getAxiosErrorMessage(err).message}`);
  }
}

export async function clearAppSession() {
  await httpClient.delete('/api/session').catch(() => undefined);
}
