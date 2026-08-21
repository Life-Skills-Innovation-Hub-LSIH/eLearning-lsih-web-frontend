export { AuthSplitLayout } from "./components/AuthSplitLayout";
export { LoginForm } from "./components/LoginForm";
export { RegisterForm } from "./components/RegisterForm";
export { RequireAuth } from "./components/RequireAuth";
export { AuthProvider, useAuth, useCourseAccess } from "./context/auth-context";
export { homePathForRole } from "./lib/static-users";
export {
  changePasswordWithApi,
  fetchCurrentUser,
  loginWithApi,
  logoutWithApi,
  mapAuthUser,
  registerWithApi,
} from "./api/auth-api";
export type { ApiUser, AuthSessionResponse } from "./api/auth-api";
