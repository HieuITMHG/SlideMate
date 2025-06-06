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
      </Routes>
    </Suspense>
  );
}

export default App;
