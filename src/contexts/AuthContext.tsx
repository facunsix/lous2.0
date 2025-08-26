// This context has been deprecated and replaced by embedded auth logic in AuthForm
// Keeping this file to avoid build errors, but it's no longer used

export const useAuth = () => {
  throw new Error('useAuth is deprecated - auth logic is now embedded in AuthForm');
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};