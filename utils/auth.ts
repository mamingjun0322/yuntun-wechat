/**
 * 认证工具类
 */

/**
 * 保存 token
 */
export const setToken = (token: string): void => {
  wx.setStorageSync('token', token)
}

/**
 * 获取 token
 */
export const getToken = (): string => {
  return wx.getStorageSync('token') || ''
}

/**
 * 删除 token
 */
export const removeToken = (): void => {
  wx.removeStorageSync('token')
}

/**
 * 保存用户信息
 */
export const setUserInfo = (userInfo: any): void => {
  wx.setStorageSync('userInfo', userInfo)
}

/**
 * 获取用户信息
 */
export const getUserInfo = (): any => {
  return wx.getStorageSync('userInfo') || null
}

/**
 * 删除用户信息
 */
export const removeUserInfo = (): void => {
  wx.removeStorageSync('userInfo')
}

/**
 * 检查是否登录
 */
export const isLogin = (): boolean => {
  return !!getToken()
}

/**
 * 清除所有登录信息
 */
export const clearAuth = (): void => {
  removeToken()
  removeUserInfo()
}

/**
 * 登录检查（用于需要登录的页面）
 * 未登录时直接跳转到登录页，不显示提示
 */
export const checkLogin = (): boolean => {
  if (!isLogin()) {
    console.log('未登录，跳转到登录页')
    wx.reLaunch({
      url: '/pages/login/login'
    })
    return false
  }
  return true
}

/**
 * 强制登录检查（直接跳转到登录页）
 * 用于页面 onLoad 时的检查
 */
export const requireLogin = (): boolean => {
  if (!isLogin()) {
    console.log('未登录，跳转到登录页')
    wx.reLaunch({
      url: '/pages/login/login'
    })
    return false
  }
  return true
}

