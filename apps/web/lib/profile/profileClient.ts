import { UserDTO } from '@repo/models';
import apiFetch from '../api';

export async function updateProfile(userId: string, data: Partial<UserDTO>) {
  const res = await apiFetch(`/user/${userId}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res || res.ok === false) {
    throw new Error(res.message ?? 'Profile update failed');
  }

  return {
    ...res,
    skills:
      typeof res.skills === 'string' ? JSON.parse(res.skills) : res.skills,
  } as UserDTO;
}

export async function updateSkills(userId: string, skills: string[]) {
  return updateProfile(userId, { skills } as Partial<UserDTO>);
}

export async function updatePassword(
  id: string,
  oldPassword: string,
  newPassword: string,
) {
  const res = await apiFetch(`/user/${id}/change-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!res || res.ok === false) {
    throw new Error(res.message ?? 'Failed to update password');
  }
}

export async function deleteProfile(id: string) {
  const res = await apiFetch(`/user/${id}`, {
    method: 'DELETE',
  });

  if (!res || res.ok === false) {
    throw new Error(res.message ?? 'User deletion failed');
  }
}

export async function getUserById(id: string): Promise<UserDTO> {
  const res = await apiFetch(`/user/${id}`, {
    method: 'GET',
  });

  if (!res || res.ok === false) {
    throw new Error(res.message ?? 'Failed to fetch user');
  }

  return {
    ...res,
    skills:
      typeof res.skills === 'string' ? JSON.parse(res.skills) : res.skills,
  } as UserDTO;
}

const profileClient = {
  deleteProfile,
  updateProfile,
  updatePassword,
  updateSkills,
  getUserById,
};

export default profileClient;
