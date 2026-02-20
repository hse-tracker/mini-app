const TOKEN_KEY = 'initial_token';

export function useAuth() {
  const isAuthenticated = () => {
    return !!localStorage.getItem(TOKEN_KEY);
  };

  const setToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  };

  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    window.location.reload();
  };

  return {
    isAuthenticated,
    setToken,
    getToken,
    logout
  };
}
