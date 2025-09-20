import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Instructor from "./pages/Instructor";
import Admin from "./pages/Admin";
import Parent from "./pages/Parent";
import AdminPanel from "./pages/AdminPanel";
import { AdminEmailGuard } from "./components/app/AdminEmailGuard";
import Discussions from "./pages/Discussions";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Auth from "./pages/Auth";
import StudyGroups from "./pages/StudyGroups";
import Gamification from "./pages/Gamification";
import CalendarPage from "./pages/Calendar";
import ContactTeachersPage from "./pages/ContactTeachers";
import AdminTeachersPage from "./pages/AdminTeachers";
import ProfilePage from "./pages/Profile";
import { Layout } from "./components/app/Layout";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/app/ProtectedRoute";
import { RoleRedirect } from "./components/app/RoleRedirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/home" element={<RoleRedirect />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={["student"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor"
                element={
                  <ProtectedRoute roles={["instructor", "admin"]}>
                    <Instructor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-panel"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminEmailGuard allowedEmail="eedupugantil@gmail.com">
                      <AdminPanel />
                    </AdminEmailGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent"
                element={
                  <ProtectedRoute roles={["parent", "admin"]}>
                    <Parent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/discussions"
                element={
                  <ProtectedRoute roles={["student"]}>
                    <Discussions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/study-groups"
                element={
                  <ProtectedRoute roles={["student"]}>
                    <StudyGroups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gamification"
                element={
                  <ProtectedRoute roles={["student"]}>
                    <Gamification />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute roles={["student"]}>
                    <CalendarPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contact-teachers"
                element={
                  <ProtectedRoute roles={["student"]}>
                    <ContactTeachersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/teachers"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminTeachersPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/profile" element={<ProfilePage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
