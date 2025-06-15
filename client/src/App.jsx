import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Loader from './components/Loader';

// Lazy load pages and components
const Layout = lazy(() => import('./pages/Layout'));
const Home = lazy(() => import('./pages/Home'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const MaterialUpload = lazy(() => import('./pages/MaterialUpload'));
const MaterialDetail = lazy(() => import('./pages/MaterialDetail'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

// Admin Pages
const AdminLayout = lazy(() => import ('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminReportsManagementPage = lazy(() => import ('./pages/admin/AdminReportsManagementPage'));
const AdminUsersManagementPage = lazy(() => import ('./pages/admin/AdminUsersManagementPage'));
const AdminCategoriesManagementPage = lazy(() => import ('./pages/admin/AdminCategoriesManagementPage'));
const AdminStatisticsPage = lazy(() => import ('./pages/admin/AdminStatisticsPage'));


function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="/material/:id" element={<MaterialDetail />} />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <MaterialUpload />
            </ProtectedRoute>
          }
        />

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
