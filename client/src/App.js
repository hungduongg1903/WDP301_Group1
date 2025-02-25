import { Navigate, Route, Routes } from "react-router-dom";
// import FloatingShape from "./components/FloatingShape";

import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CourtDetails from "./sections/@dashboard/court/CourtDetails";
import LoadingSpinner from "./components/LoadingSpinner";

import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import DashboardAppPage from "./sections/@dashboard/app/DashboardAppPage";
import CourtPage from "./sections/@dashboard/court/CourtPage";
import LibraryApp from "./layouts/dashboard";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  console.log(isAuthenticated, user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.isVerified) {
    // Check if user exists first
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

// redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && !user.isVerified) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { isCheckingAuth, checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <div className="min-h-screen">
      {!isAuthenticated ? ( // Kiểm tra trạng thái đăng nhập
        <div className="bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center min-h-screen">
          <Routes>
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LibraryApp />
              </ProtectedRoute>
            }
          >
            {/* <Route index element={<CourtPage />} />
            <Route path=":id" element={<CourtDetails />} /> */}
          </Route>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <LibraryApp />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/dashboard2" element={<LibraryApp />} /> */}
          <Route
            path="/courts"
            element={
              <ProtectedRoute>
                <LibraryApp />
              </ProtectedRoute>
            }
          >
            <Route index element={<CourtPage />} />
          </Route>

          <Route path="/verify-email" element={<EmailVerificationPage />} />

          <Route
            path="/reset-password/:token"
            element={
              <RedirectAuthenticatedUser>
                <ResetPasswordPage />
              </RedirectAuthenticatedUser>
            }
          />

          <Route
            path="/courts/:id"
            element={
              <ProtectedRoute>
                <LibraryApp />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <ProtectedRoute>
                  <CourtDetails />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* catch all routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
      <Toaster />
    </div>
  );
}

export default App;
