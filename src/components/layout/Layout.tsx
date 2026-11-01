import { NavLink, Outlet } from 'react-router-dom';
import { jobsApi } from '@/api';
import { useLive } from '@/hooks/useLive';
import type { Job } from '@/types';
import { Icon } from '@/components/ui';

export function Layout() {
  const { data: jobs } = useLive(() => jobsApi.listJobs(), { entities: ['job', 'activity'] }, []);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="logo">R</span>
          <div>
            <b>Recruiter AI</b>
            <span>Hiring co-worker</span>
          </div>
        </div>

        <nav>
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon name="chat" /> Chat
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon name="chart" /> Dashboard
          </NavLink>
        </nav>

        <div className="side-title">Jobs</div>
        <div className="side-jobs">
          {jobs?.length ? (
            jobs.map((job) => (
              <NavLink key={job.id} to={`/jobs/${job.id}`} className={({ isActive }) => `job-link ${isActive ? 'active' : ''}`}>
                {job.title}
              </NavLink>
            ))
          ) : (
            <span className="muted small pad">Jobs you create in the chat show up here.</span>
          )}
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
