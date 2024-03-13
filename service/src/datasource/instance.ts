import { DataSource } from 'typeorm'
import { User } from './entity/User'

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './data/sqlite.db',
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
})

let instance

export async function getInstance() {
  if (instance)
    return instance

  return new Promise((resolve) => {
    AppDataSource.initialize().then(async () => {
      // console.log('Inserting a new user into the database...')
      // const user = new User()
      // user.name = 'Tim'
      // user.imageLimit = 20
      // user.token = '1111-2222'
      // await AppDataSource.manager.save(user)
      instance = AppDataSource
      resolve(AppDataSource)
    }).catch((err) => {
      process.exit(0)
    })
  })
}
