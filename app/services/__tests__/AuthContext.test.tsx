import React from 'react';
import { render, act } from 'react-test-renderer';
import { AuthProvider, useAuth } from '../AuthContext';
import api from '../api';

// Mock the API service
jest.mock('../api', () => ({
  get: jest.fn(),
  defaults: {
    headers: {
      common: {},
    },
  },
}));

// Test component to consume the hook
const TestComponent = () => {
  const { user, isLoading, login, logout } = useAuth();

  return (
    <div
      testID="test-component"
      data-user={user ? user.name : 'none'}
      data-loading={isLoading ? 'true' : 'false'}
      onLogin={() => login('testuser', 'password123')}
      onLogout={logout}
    >
      {user ? `Logged in as ${user.name}` : 'Not logged in'}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides an initial unauthenticated state', () => {
    const root = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    ).root;

    const component = root.findByProps({ testID: 'test-component' });
    expect(component.props['data-user']).toBe('none');
    expect(component.props['data-loading']).toBe('false');
  });

  it('handles successful login', async () => {
    // Setup mock successful response
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      },
    });

    const root = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    ).root;

    const component = root.findByProps({ testID: 'test-component' });

    await act(async () => {
      await component.props.onLogin();
    });

    expect(api.get).toHaveBeenCalledWith('/auth/me', expect.any(Object));
    expect(component.props['data-user']).toBe('Test User');
    expect(api.defaults.headers.common['Authorization']).toContain('Basic');
  });

  it('handles failed login', async () => {
    // Setup mock failed response
    (api.get as jest.Mock).mockRejectedValueOnce({
      response: { status: 401, data: 'Unauthorized' },
    });

    const root = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    ).root;

    const component = root.findByProps({ testID: 'test-component' });

    await act(async () => {
      try {
        await component.props.onLogin();
      } catch (e: any) {
        expect(e.message).toBe('Invalid username or password');
      }
    });

    expect(component.props['data-user']).toBe('none');
  });

  it('handles logout correctly', async () => {
    // First, login
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { id: 1, name: 'Test User' },
    });

    const root = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    ).root;

    const component = root.findByProps({ testID: 'test-component' });

    await act(async () => {
      await component.props.onLogin();
    });

    expect(component.props['data-user']).toBe('Test User');

    // Then, logout
    await act(async () => {
      component.props.onLogout();
    });

    expect(component.props['data-user']).toBe('none');
    expect(api.defaults.headers.common['Authorization']).toBeUndefined();
  });
});
