import { Route, Routes, Navigate } from "react-router-dom";
import getUserPermission from "../common-lib/checkuser";
import ErrorPage from "../features/404Page/errorpage";
import AdminDashBoard from "../features/admin-dashboard/admindashboard";
import AdminTicketList from "../features/admin-ticketlist/adminTicketlist";
import AdminUsersList from "../features/admin-userslist/adminuserslist";
import Header from "../features/header/header";
import TicketDetails from "../features/Ticket/ticketDetails";
import TicketTracking from "../features/Ticket-tracking/tickettracking";
import CreateRequest from "../features/create-ticket/createTicket";
import AdminMasterTable from "../features/admin-mastertable/adminMasterTable";
import LoginPage from "../auth/login/LoginPage";
import { Myrequest } from "../features/myrequest/Myrequest";
import BasicLogin from "../auth/basiclogin/basiclogin"

const Router = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth redirectTo="/login">
              <Header />
              <AdminDashBoard />
            </RequireAuth>
          }
        />
        <Route
          path="/login"
          element={
            <LoginGuard redirectTo="/dashboard">
              <BasicLogin />
            </LoginGuard>
          }
        />

        <Route
          path="/requestlist"
          element={
            <RequireAuth redirectTo="/login">
              <Header />
              <AdminTicketList />
            </RequireAuth>
          }
        />
        <Route
          path="/myrequestlist"
          element={
            <RequireAuth redirectTo="/login">
              <Header />
              <Myrequest />
            </RequireAuth>
          }
        />
        <Route
          path="/adminuserslist"
          element={
            <RequireAuth redirectTo="/login">
              <AdminUserGuard redirectTo="/dashboard">
                <Header />
                <AdminUsersList />
              </AdminUserGuard>
            </RequireAuth>
          }
        />
        <Route
          path="/mastertable"
          element={
            <RequireAuth redirectTo="/login">
              <AdminUserGuard redirectTo="/dashboard">
                <Header />
                <AdminMasterTable />
              </AdminUserGuard>
            </RequireAuth>
          }
        />
        <Route
          path="/requestlist/requestdetails"
          element={
            <RequireAuth redirectTo="/login">
              <Header />
              <TicketDetails />
            </RequireAuth>
          }
        />
        <Route
          path="/myrequestlist/createRequest"
          element={
            <RequireAuth redirectTo="/login">
              <Header />
              <CreateRequest />
            </RequireAuth>
          }
        />

        <Route
          path="/requestlist/ticketTracking"
          element={
            <RequireAuth redirectTo="/login">
              <Header />
              <TicketTracking />
            </RequireAuth>
          }
        />

        <Route path="/*" element={<ErrorPage />} />
      </Routes>
    </>
  );
};

function RequireAuth({ children, redirectTo }) {
  let isAuthenticated = localStorage.getItem("accessToken");
  return isAuthenticated ? children : <Navigate to={redirectTo} />;
}

function LoginGuard({ children, redirectTo }) {
  let isAuthenticated = localStorage.getItem("accessToken");
  return isAuthenticated ? <Navigate to={redirectTo} /> : children;
}

function AdminUserGuard({ children, redirectTo }) {
  const data = getUserPermission();
  return data.permission.includes("ADMIN") ? (
    children
  ) : (
    <Navigate to={redirectTo} />
  );
}

export default Router;
