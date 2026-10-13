import { Auth0Provider } from '@auth0/nextjs-auth0';
import { vi } from 'vitest';

export const mockUser = {
  email: 'foo@example.com',
  email_verified: true,
  name: 'foo',
  nickname: 'foo',
  picture: 'foo.jpg',
  sub: '1',
  updated_at: null
};

export const withAuth0Provider = ({ user, profileUrl } = {}) => {
  if (user) {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(user),
    });
  }
  return props => <Auth0Provider {...props} user={user} profileUrl={profileUrl} />;
};
