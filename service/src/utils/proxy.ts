import { updateImageLimit } from '../datasource/user'

export async function userResDecoratorForImage(proxyRes, proxyResData, userReq, userRes) {
  const data = JSON.parse(proxyResData.toString('utf8'))
  if (/\/mjapi\/mj\/task\/\d+\/fetch/.test(userReq.originalUrl)
      && data.status === 'SUCCESS'
      && userRes.user
      && userRes.user.role === 'user') {
    const { imageLimit, id } = userRes.user
    await updateImageLimit(id, imageLimit > 0 ? imageLimit - 1 : 0)
  }
  else if (/openapi\/v1\/images\/generations/.test(userReq.originalUrl)
      && data.data && data.data[0] && data.data[0].url
      && userRes.user
      && userRes.user.role === 'user'
  ) {
    const { imageLimit, id } = userRes.user
    await updateImageLimit(id, imageLimit > 0 ? imageLimit - 1 : 0)
  }

  return proxyResData
}
