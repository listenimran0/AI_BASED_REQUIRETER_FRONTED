import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from '@/components/ui';
import { Layout } from '@/components/layout/Layout';

const named = <K extends string>(load: () => Promise<Record<K, React.ComponentType>>, key: K) => lazy(() => load().then((m) => ({ default: m[key] })));

const BookingPage = named(() => import('@/pages/BookingPage'), 'BookingPage');
const ChatPage = named(() => import('@/pages/ChatPage'), 'ChatPage');
const DashboardPage = named(() => import('@/pages/DashboardPage'), 'DashboardPage');
const JobPage = named(() => import('@/pages/JobPage'), 'JobPage');

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="card loading">
          <Spinner /> Loading
        </div>
      }
    >
      <Routes>
        <Route path="/book/:token" element={<BookingPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<ChatPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/jobs/:id" element={<JobPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
