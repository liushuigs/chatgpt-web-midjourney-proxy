import type { NextFunction, Request, Response } from 'express'
import { isNotEmptyString } from '../utils/is'
import { getUserByToken } from '../datasource/user'

// 存储IP地址和错误计数的字典
const ipErrorCount = {}

// 存储被禁止登录的IP地址及禁止结束时间的字典
const bannedIPs = {}

async function validateToken(token: string) {
  const data = { role: 'user', imageLimit: 0, name: '' }
  let authed = false

  if (process.env.AUTH_SECRET_KEY === token) {
    data.role = 'admin'
    data.name = 'admin'
    data.imageLimit = 100
    authed = true
  }
  else {
    const user = await getUserByToken(token)
    if (user) {
      data.role = 'user'
      data.imageLimit = user.imageLimit
      data.name = user.name
      authed = true
    }
  }
  return { authed, data }
}

const getIp = (req: Request) => {
  if (req.header && req.header('x-forwarded-for'))
    return req.header('x-forwarded-for')
  return req.ip
}

const checkLimit = (req: Request, res: Response) => {
  if (!isNotEmptyString(process.env.AUTH_SECRET_ERROR_COUNT))
    return

  const bTime = process.env.AUTH_SECRET_ERROR_TIME ?? 10
  // 允许的最大错误次数
  const maxErrorCount = +process.env.AUTH_SECRET_ERROR_COUNT
  // 禁止登录的时间（毫秒）
  let banTime = (+bTime) * 60 * 1000 // 10分钟
  if (banTime <= 0)
    banTime = 10 * 60 * 1000

  const ipAddress = getIp(req)

  if (bannedIPs[ipAddress] && Date.now() < bannedIPs[ipAddress]) {
    const timeLeft = Math.ceil((bannedIPs[ipAddress] - Date.now()) / 1000)
    console.log('myIP ', ipAddress, ipErrorCount[ipAddress])
    // return res.status(403).send(`IP地址被禁止登录，剩余时间: ${timeLeft}秒`);
    const ts = timeLeft > 60 ? `${(timeLeft / 60).toFixed(0)}分钟` : `${timeLeft}秒`
    throw new Error(`Error: ${ipAddress} 验证次数过多，请在${ts}后重试！`)
  }
  ipErrorCount[ipAddress] = ipErrorCount[ipAddress] ? (ipErrorCount[ipAddress] + 1) : 1
  if (ipErrorCount[ipAddress] >= maxErrorCount)
    bannedIPs[ipAddress] = Date.now() + banTime
}

const clearLimit = (req: Request, res: Response) => {
  const ipAddress = getIp(req)
  bannedIPs[ipAddress] = 0
  ipErrorCount[ipAddress] = 0
}

export const verify = async (req: Request, res: Response) => {
  try {
    checkLimit(req, res)
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')
    const { data, authed } = await validateToken(token)

    if (!authed)
      throw new Error('密钥无效 | Secret key is invalid')

    clearLimit(req, res)
    res.send({ status: 'Success', message: 'Verify successfully', data })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
  if (isNotEmptyString(AUTH_SECRET_KEY)) {
    try {
      checkLimit(req, res)
      const Authorization = req.header('Authorization')
      if (!Authorization || Authorization.replace('Bearer ', '').trim() !== AUTH_SECRET_KEY.trim())
        throw new Error('Error: 无访问权限 | No access rights')

      clearLimit(req, res)
      next()
    }
    catch (error) {
      res.send({ status: 'Unauthorized', message: error.message ?? 'Please authenticate.', data: null })
    }
  }
  else {
    next()
  }
}

interface AuthParams {
  checkAdmin?: boolean
  checkImageLimit?: boolean
  checkUser?: boolean
}

const createAuth = (params: AuthParams) => async (req: Request, res: Response, next: NextFunction) => {
  const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
  if (isNotEmptyString(AUTH_SECRET_KEY)) {
    try {
      checkLimit(req, res)
      const token = (req.header('X-Ptoken') || '').trim()
      const { data, authed } = await validateToken(token)
      res.authed = authed
      res.user = data
      if (params.checkAdmin && data.role !== 'admin')
        throw new Error('Error: 无访问权限 | No access rights')
      if (params.checkUser && !authed)
        throw new Error('Error: 无访问权限 | No access rights')
      if (params.checkImageLimit && data.imageLimit < 1)
        throw new Error('No image quota')

      clearLimit(req, res)
      next()
      // throw new Error('Error: 无访问权限 | No access rights')
    }
    catch (error) {
      res.status(423)
      res.send({ code: 'token_check', message: error.message ?? 'Please authenticate.', data: null })
    }
  }
  else {
    next()
  }
}

export const authV2 = createAuth({ checkAdmin: false, checkImageLimit: true, checkUser: true })

export const authAdmin = createAuth({ checkAdmin: true, checkImageLimit: false, checkUser: true })

export const authOnly = createAuth({ checkAdmin: false, checkImageLimit: false, checkUser: false })
