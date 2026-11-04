import Login from "./components/Login";
import Home from "./components/Home";
import Onboarding from "./components/Onboarding";
import RefProgram from "./components/RefProgram";
import Dashboard from "./components/Dashboard";
import Logout from "./components/Logout";
import RefLead from "./components/RefLead";
import RefRegister from "./components/RefRegister";
import RefLink from "./components/RefLink";
import Validate from "./components/Validate";
import SetPassword from "./components/SetPassword";
import ForgotPassword from "./components/ForgotPassword";
import AdminDashboard from "./components/AdminDashboard";

const AppRoutes = [
    {
        index: true,
        element: <Home />
    },
    {
        path: '/dashboard',
        element: <Dashboard />
    },
    {
        path: '/admin/dashboard',
        element: <AdminDashboard />
    },
    {
        path: '/refer',
        element: <RefLead />
    },
    {
        path: '/program/:ident',
        element: <RefProgram />
    },
    {
        path: '/register/:ident',
        element: <RefRegister />
    },
    {
        path: '/r/:ident',
        element: <RefLink />
    },
    {
        path: '/onboarding/:ident',
        element: <Onboarding />
    },
    {
        path: '/my/verify-email/:code',
        element: <Validate />
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />
    },
    {
        path: '/reset-password/:code',
        element: <SetPassword />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/logout',
        element: <Logout />
    }
];

export default AppRoutes;
