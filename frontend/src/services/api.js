const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Handle API errors
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
};

// Activities API
export const getActivities = async () => {
  const response = await fetch(`${API_URL}/api/activities`);
  return handleResponse(response);
};

export const getActivity = async (id) => {
  const response = await fetch(`${API_URL}/api/activities/${id}`);
  return handleResponse(response);
};

export const createActivity = async (activity) => {
  const response = await fetch(`${API_URL}/api/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activity),
  });
  return handleResponse(response);
};

export const updateActivity = async (id, activity) => {
  const response = await fetch(`${API_URL}/api/activities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activity),
  });
  return handleResponse(response);
};

export const deleteActivity = async (id) => {
  const response = await fetch(`${API_URL}/api/activities/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

// Chat API
export const sendChatMessage = async (message) => {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return handleResponse(response);
};
