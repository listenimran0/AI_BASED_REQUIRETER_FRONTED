import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { BookingPage } from './pages/BookingPage';
import { ChatPage } from './pages/ChatPage';
import { DashboardPage } from './pages/DashboardPage';
import { JobPage } from './pages/JobPage';

export default function App() {
  return (
    <Routes>
      <Route path="/book/:token" element={<BookingPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<ChatPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/jobs/:id" element={<JobPage />} />
      </Route>
    </Routes>
  );
}
