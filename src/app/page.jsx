'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.devops.cstad.edu.kh';
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'production';

export default function HomePage() {
  const [tasks, setTasks] = useState([]);
  const [backendInfo, setBackendInfo] = useState(null);
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('CSTAD Student');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, infoRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/tasks`),
        fetch(`${API_URL}/api/v1/info`),
      ]);
      if (!tasksRes.ok) throw new Error(`Backend tasks HTTP ${tasksRes.status}`);
      const tasksData = await tasksRes.json();
      setTasks(tasksData);
      if (infoRes.ok) {
        setBackendInfo(await infoRes.json());
      }
    } catch (err) {
      setError(`Unable to reach Backend API (${API_URL}): ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), owner: owner.trim() || 'CSTAD', status: 'DEPLOYED' }),
      });
      if (!res.ok) throw new Error(`Create failed (${res.status})`);
      setTitle('');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteTask(id) {
    try {
      const res = await fetch(`${API_URL}/api/v1/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '28px' }}>
        <span
          style={{
            display: 'inline-block',
            backgroundColor: '#1d4ed8',
            color: '#e0f2fe',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          CSTAD • Instructor: Mr. Ing Muyleang
        </span>
        <h1 style={{ fontSize: '32px', margin: '12px 0 8px' }}>
          CSTAD DevOps Final Project
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Next.js Frontend + Spring Boot 3 Backend + PostgreSQL on Kubespray Kubernetes with Jenkins, Nexus, Helm, ArgoCD &amp; Cert-Manager
        </p>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div style={cardStyle}>
          <div style={labelStyle}>Environment</div>
          <div style={valueStyle}>{APP_ENV.toUpperCase()}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Backend API Endpoint</div>
          <div style={{ ...valueStyle, fontSize: '14px', wordBreak: 'break-all' }}>{API_URL}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Backend Pod / Host</div>
          <div style={valueStyle}>{backendInfo?.hostname || 'Connecting...'}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Database Status</div>
          <div style={{ ...valueStyle, color: backendInfo ? '#4ade80' : '#facc15' }}>
            {backendInfo?.database || 'Checking...'}
          </div>
        </div>
      </section>

      <section style={{ ...cardStyle, marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0, fontSize: '20px' }}>Add Deployment Task (Persisted in PostgreSQL)</h2>
        <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Task title (e.g., Verify ArgoCD Nexus Helm Sync)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ ...inputStyle, flex: '2 1 260px' }}
          />
          <input
            type="text"
            placeholder="Owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            style={{ ...inputStyle, flex: '1 1 160px' }}
          />
          <button type="submit" style={buttonStyle}>
            Add Task
          </button>
        </form>
      </section>

      <section style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Deployment Tasks ({tasks.length})</h2>
          <button onClick={loadData} style={{ ...buttonStyle, backgroundColor: '#334155' }}>
            Refresh
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#7f1d1d', color: '#fecaca', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading tasks from Spring Boot &amp; PostgreSQL...</p>
        ) : tasks.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No tasks found. Add your first task above!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px' }}>
            {tasks.map((task) => (
              <li
                key={task.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#0f172a',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{task.title}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Owner: {task.owner} • Status: {task.status}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

const cardStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '16px',
};

const labelStyle = {
  fontSize: '12px',
  color: '#94a3b8',
  marginBottom: '6px',
};

const valueStyle = {
  fontSize: '18px',
  fontWeight: 700,
};

const inputStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #475569',
  backgroundColor: '#0f172a',
  color: '#f8fafc',
};

const buttonStyle = {
  padding: '10px 18px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#2563eb',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
};

