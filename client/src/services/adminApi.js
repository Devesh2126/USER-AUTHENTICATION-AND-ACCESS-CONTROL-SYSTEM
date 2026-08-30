import api from './api';

export async function fetchUsers({ page = 1, limit = 20, search = '' } = {}) {
  const { data } = await api.get('/admin/users', { params: { page, limit, search } });
  return data.data;
}

export async function updateUserRole(userId, role) {
  const { data } = await api.patch(`/admin/users/${userId}/role`, { role });
  return data.data;
}

export async function updateUserStatus(userId, isActive) {
  const { data } = await api.patch(`/admin/users/${userId}/status`, { isActive });
  return data.data;
}
