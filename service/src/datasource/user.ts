import { getInstance } from './instance'
import { User } from './entity/User'

export async function getUserByToken(token: string) {
  const dataSource = await getInstance()
  return dataSource.manager.findOneBy(User, { token })
}

interface ListParams {
  page: number
  pageSize: number
}
export async function getList(params: ListParams) {
  const dataSource = await getInstance()
  const rows = await dataSource
    .createQueryBuilder()
    .select('user')
    .from(User, 'user')
    .limit(params.pageSize)
    .offset((params.page - 1) * params.pageSize)
    .getMany()
  const total = await dataSource
    .createQueryBuilder()
    .select('user')
    .from(User, 'user')
    .getCount()
  return { rows, total }
}

interface UserParams {
  id?: number
  token: string
  imageLimit: number
  name: string
}
export async function updateUser(params: UserParams) {
  const dataSource = await getInstance()
  let data
  if (params.id > 0) {
    data = await dataSource
      .createQueryBuilder()
      .update(User)
      .set({ token: params.token, imageLimit: params.imageLimit, name: params.name })
      .where('id = :id', { id: params.id })
      .execute()
  }
  else {
    data = await dataSource
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        { ...params, id: null, imageUsed: 0 },
      ])
      .execute()
  }
  return data
}

export async function deleteUser(id: number) {
  const dataSource = await getInstance()
  await dataSource
    .createQueryBuilder()
    .delete()
    .from(User)
    .where('id = :id', { id })
    .execute()
}

export async function updateImageLimit(id: number, imageLimit: number, imageUsed: number) {
  const dataSource = await getInstance()
  await dataSource
    .createQueryBuilder()
    .update(User)
    .set({ imageLimit, imageUsed })
    .where('id = :id', { id })
    .execute()
}
