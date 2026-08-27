import { AuthProviderProps } from "react-oidc-context";
import { WebStorageStateStore, User } from "oidc-client-ts";

const authority = import.meta.env.VITE_OIDC_AUTHORITY || "https://identityserver.bitisgroup.vn";
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID || "sso_portal_v2_web_client_client_id_prod";
const scope = import.meta.env.VITE_OIDC_SCOPE || "openid email profile roles";
const responseType = import.meta.env.VITE_OIDC_RESPONSE_TYPE || "code";
const callbackPath = import.meta.env.VITE_OIDC_CALLBACK_PATH || "/signin-oidc";
const signoutCallbackPath = import.meta.env.VITE_OIDC_SIGNOUT_CALLBACK_PATH || "/signout-callback-oidc";

// Dynamic origin calculation for smooth execution in both localhost:44374 and Cloud environment
const getOrigin = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return import.meta.env.VITE_APP_ORIGIN;
};

export const oidcConfig: AuthProviderProps = {
  authority,
  client_id: clientId,
  redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI || `${getOrigin()}${callbackPath}`,
  post_logout_redirect_uri: import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI || `${getOrigin()}${signoutCallbackPath}`,
  scope,
  response_type: responseType,
  automaticSilentRenew: false,
  loadUserInfo: true,
  monitorSession: false,
  userStore: new WebStorageStateStore({ store: typeof window !== 'undefined' ? window.localStorage : undefined }),
  metadata: {
    issuer: authority,
    authorization_endpoint: `${authority}/connect/authorize`,
    token_endpoint: `${getOrigin()}/oidc-proxy/connect/token`,
    userinfo_endpoint: `${getOrigin()}/oidc-proxy/connect/userinfo`,
    end_session_endpoint: `${authority}/connect/endsession`,
    jwks_uri: `${getOrigin()}/oidc-proxy/.well-known/openid-configuration/jwks`,
    revocation_endpoint: `${getOrigin()}/oidc-proxy/connect/revocation`,
  }
};

export function extractOidcUser(oidcUser: User | null | undefined) {
  if (!oidcUser || oidcUser.expired) return null;

  const profile = (oidcUser.profile || {}) as Record<string, any>;
  const nameClaim = import.meta.env.VITE_OIDC_NAME_CLAIM || 'name';
  const roleClaim = import.meta.env.VITE_OIDC_ROLE_CLAIM || 'role';

  const name = String(profile[nameClaim] || profile.preferred_username || profile.nickname || profile.email || 'OIDC User');
  const email = String(profile.email || '');
  
  let roles: string[] = [];
  const rawRole = profile[roleClaim] || profile.roles;
  if (Array.isArray(rawRole)) {
    roles = rawRole.map(String);
  } else if (typeof rawRole === 'string') {
    roles = [rawRole];
  } else {
    roles = ['USER'];
  }

  return {
    name,
    email,
    role: roles[0] || 'USER',
    roles,
    token: oidcUser.access_token,
    isExpired: oidcUser.expired
  };
}
