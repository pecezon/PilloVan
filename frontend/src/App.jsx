import "./App.css";
import Onboarding from "./pages/Onboarding";
import Landing from "./pages/Landing";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import OnboardingRoute from "./auth/OnboardingRoute";
import Homepage from "./pages/Homepage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingRoute>
              <Onboarding />
            </OnboardingRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Homepage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
