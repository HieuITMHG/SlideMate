import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Loader from './components/Loader';
import { ToastContainer } from "react-toastify";

// Lazy load pages and components
const Layout = lazy(() => import('./pages/Layout'));
const Save = lazy(() => import('./pages/Save'));
const Home = lazy(() => import('./pages/Home'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyMailPage'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const VerifiedSuccess = lazy(() => import('./pages/VerifiedSuccess'));
const MaterialUpload = lazy(() => import('./pages/MaterialUpload'));
const MaterialDetail = lazy(() => import('./pages/MaterialDetail'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ChangePass = lazy(() => import('./pages/ChangePass'));

// admin page
const AdminLayout = lazy(() => import ('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminReportsManagementPage = lazy(() => import ('./pages/admin/AdminReportsManagementPage'));
const AdminUsersManagementPage = lazy(() => import ('./pages/admin/AdminUsersManagementPage'));
const AdminCategoriesManagementPage = lazy(() => import ('./pages/admin/AdminCategoriesManagementPage'));
const AdminStatisticsPage = lazy(() => import ('./pages/admin/AdminStatisticsPage'));

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/success-verify-email" element={<VerifiedSuccess />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<Layout />}>
          <Route path="/save" index element={ <Save/>} />
          <Route index element={<Home />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/change-passwork"
            element={
                <ChangePass/>
            }
          />

          <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <MaterialUpload />
            </ProtectedRoute>
          }
          />
          <Route path="/material/:id" element={<MaterialDetail />} />
        </Route>
        
        
        {/* Admin pages */}
        <Route path = "/admin" element = {<AdminLayout/>}>
          <Route index element = {<AdminDashboard/>}/>
          <Route path ="reports" element = {<AdminReportsManagementPage/>}/>
          <Route path = "users" element = {<AdminUsersManagementPage/>}/>
          <Route path = "categories" element = {<AdminCategoriesManagementPage/>}/>
          <Route path = "statistics" element = {<AdminStatisticsPage/>}/>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
