import { Routes, Route } from 'react-router-dom';
import Layout from './pages/layout';
import Home from './pages/Home';
import Register from './pages/register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ViewMaterial from './pages/ViewMaterial';
import MaterialUpload from './pages/MaterialUpload';
import MaterialPreview from './pages/MaterialPreview';

function App() {
  return (
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
      <Route path="/view" element={<MaterialPreview/>}/>
      <Route path="/upload" element={<MaterialUpload />} />
    </Routes>
  );
}

export default App;