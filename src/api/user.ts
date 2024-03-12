import { get, post } from '@/utils/request'

export function getUserList<T = any>(
  page: number,
) {
  return get<T>({
    url: '/admin/user/list',
    data: { page },
  })
}

interface UserType {
  id: number
  name: string
  token: string
  imageLimit: number
}

export function updateUser<T = any>(
  data: UserType,
) {
  return post<T>({
    url: '/admin/user/update',
    data,
  })
}

export function deleteUser(id: number) {
  return post({
    url: '/admin/user/delete',
    data: { id },
  })
}
