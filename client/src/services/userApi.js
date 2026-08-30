import api from './api';

export async function updateProfile(updates) {
  const { data } = await api.patch('/users/me', updates);
  return data.data;
}

export async function changePassword(currentPassword, newPassword) {
  const { data } = await api.patch('/users/me/password', { currentPassword, newPassword });
  return data;
}
