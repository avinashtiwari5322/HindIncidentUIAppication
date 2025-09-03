import "./App.css";
import SidebarNavbar from "./Components/Sidebar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/UserPages/HomePage2";
import AssignPage from "./Pages/UserPages/AssignPage";
import About from "./Pages/AdminPages/Approval";
import IncidentDetails from "./Pages/UserPages/incidentPage.jsx";
import AssignIncidentDetails from "./Pages/UserPages/IncidentDetails.jsx";
import Login from "./Pages/Login";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import RCApage from "./Pages/UserPages/HomepageNew";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* All routes with Sidebar */}
          <Route element={<SidebarNavbar />}>
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/about" element={<About />} />
              <Route path="/assign" element={<AssignPage />} />
              <Route path="/incident-details" element={<AssignIncidentDetails />} />
              <Route path="/incident-details/:incidentId" element={<AssignIncidentDetails />} />
              <Route path="/assign" element={require('./Pages/UserPages/AssignPage').default ? require('./Pages/UserPages/AssignPage').default : require('./Pages/UserPages/AssignPage.jsx').default} />
              {/* Add more protected routes here */}
            </Route>
            <Route element={<ProtectedRoute />}>
             <Route path="/incident/:id" element={<IncidentDetails />} />
              {/* Add more protected routes here */}
            </Route>

              <Route element={<ProtectedRoute />}>
             <Route path="/RCApage/:id" element={<RCApage/>} />
              {/* Add more protected routes here */}
            </Route>
            {/* Public route with sidebar */}
            <Route path="/home" element={<Home />} />
          </Route>
          
          {/* Public route without sidebar */}
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
