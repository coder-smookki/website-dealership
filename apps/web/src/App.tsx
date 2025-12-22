import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';

// Public pages
import Home from './pages/public/Home';
import CarDetails from './pages/public/CarDetails';
import Contacts from './pages/public/Contacts';

// Owner pages
import OwnerLogin from './pages/owner/OwnerLogin';
import OwnerRegister from './pages/owner/OwnerRegister';
import MyCars from './pages/owner/MyCars';
import OwnerCarCreate from './pages/owner/CarCreate';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import CarsList from './pages/admin/CarsList';
import AdminCarCreate from './pages/admin/CarCreate';
import CarEdit from './pages/admin/CarEdit';
import Leads from './pages/admin/Leads';
import Settings from './pages/admin/Settings';
import Users from './pages/admin/Users';
import Moderation from './pages/admin/Moderation';

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/cars/:id" element={<CarDetails />} />
        <Route path="/contacts" element={<Contacts />} />

        {/* Owner */}
        <Route path="/account/register" element={<OwnerRegister />} />
        <Route path="/account/login" element={<OwnerLogin />} />
        <Route path="/account/cars" element={<MyCars />} />
        <Route path="/account/cars/new" element={<OwnerCarCreate />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/cars" element={<CarsList />} />
        <Route path="/admin/cars/new" element={<AdminCarCreate />} />
        <Route path="/admin/cars/:id/edit" element={<CarEdit />} />
        <Route path="/admin/leads" element={<Leads />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/moderation" element={<Moderation />} />
      </Routes>
    </Layout>
  );
}

export default App;

