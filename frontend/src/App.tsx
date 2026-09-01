import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CopilotPage } from "./pages/CopilotPage";
import { DashboardPage } from "./pages/DashboardPage";
import { IncidentsPage } from "./pages/IncidentsPage";
import { IncidentDetailPage } from "./pages/IncidentDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { SimulatorPage } from "./pages/SimulatorPage";
import { TransactionsPage } from "./pages/TransactionsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/signup"
            element={<SignupPage />}
          />

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <DashboardPage />
              }
            />

            <Route
              path="transactions"
              element={
                <TransactionsPage />
              }
            />

            <Route
              path="incidents"
              element={
                <IncidentsPage />
              }
            />

            <Route
              path="incidents/:incidentId"
              element={
                <IncidentDetailPage />
              }
            />

            <Route
              path="copilot"
              element={
                <CopilotPage />
              }
            />

            <Route
              path="simulator"
              element={
                <SimulatorPage />
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
