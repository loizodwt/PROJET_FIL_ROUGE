const BASE_URL = '/api';

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error(err.error || 'Erreur'), { status: res.status });
  }

  if (res.status === 204) return null;
  return res.json();
}

async function requestForm(method, path, formData, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error(err.error || 'Erreur'), { status: res.status });
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path, token) => request('GET', path, null, token),
  post: (path, body, token) => request('POST', path, body, token),
  put: (path, body, token) => request('PUT', path, body, token),
  delete: (path, token) => request('DELETE', path, null, token),
  postForm: (path, formData, token) => requestForm('POST', path, formData, token),
  putForm: (path, formData, token) => requestForm('PUT', path, formData, token),
};
