import { get } from '@/utils/request'

export function getUserList<T = any>(
  page: number,
) {
  return get<T>({
    url: '/admin/user/list',
    data: { page },
  })
}
