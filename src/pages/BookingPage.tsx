import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { Icon, Spinner } from '../ui';

type Booking = { firstName: string; jobTitle?: string; booked: string | null; slots: string[] };

const dayKey = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

export function BookingPage() {
  const { token = '' } = useParams();
  const [data, setData] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const [picked, setPicked] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    api.get<Booking>(`/public/booking/${token}`).then(setData).catch((e: Error) => setError(e.message));
  }, [token]);

  const book = async () => {
    setSaving(true);
    setError('');
    try {
      await api.post(`/public/booking/${token}`, { slot: picked });
      setDone(picked);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not book that time');
    } finally {
      setSaving(false);
    }
  };

  const booked = done || data?.booked;
  const days = (data?.slots || []).reduce<Record<string, string[]>>((acc, s) => ({ ...acc, [dayKey(s)]: [...(acc[dayKey(s)] || []), s] }), {});

  return (
    <div className="booking">
      <div className="booking-card">
        {!data && !error && <div className="loading center"><Spinner /> Loading</div>}
        {error && !data && <div className="error-text">{error}</div>}

        {data && booked && (
          <div className="booked">
            <span className="big-check"><Icon name="check" size={28} /></span>
            <h2>You are booked in</h2>
            <p>
              {new Date(booked).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
              <br />
              A confirmation will follow from the recruiting team.
            </p>
          </div>
        )}

        {data && !booked && (
          <>
            <h2>Hi {data.firstName}, pick a time to talk</h2>
            <p className="muted">A short intro chat about the {data.jobTitle} role. Times are shown in your local time zone.</p>
            <div className="days">
              {Object.entries(days).map(([day, slots]) => (
                <div key={day} className="day-col">
                  <b>{day}</b>
                  <div className="slots">
                    {slots.map((s) => (
                      <button key={s} className={`slot ${picked === s ? 'on' : ''}`} onClick={() => setPicked(s)}>{timeOf(s)}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {error && <div className="error-text">{error}</div>}
            <button className="btn primary block" disabled={!picked || saving} onClick={book}>
              {saving ? <Spinner /> : <Icon name="check" />} Confirm this time
            </button>
          </>
        )}
      </div>
    </div>
  );
}
