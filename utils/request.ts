/**
 * 网络请求封装
 */
import { BASE_URL } from '../config/api'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
  showLoading?: boolean
  loadingText?: string
}

interface ResponseData<T = any> {
  code: number
  msg: string
  data: T
}

/**
 * 过滤掉值为 undefined 的参数
 */
const filterUndefined = (obj: any): any => {
  if (!obj) return obj
  
  const result: any = {}
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * 统一请求方法
 */
export const request = <T = any>(options: RequestOptions): Promise<ResponseData<T>> => {
  const { url, method = 'GET', data = {}, header = {}, showLoading = false, loadingText = '加载中...' } = options

  // 过滤掉 undefined 参数
  const filteredData = filterUndefined(data)

  // 显示加载提示
  if (showLoading) {
    wx.showLoading({ title: loadingText, mask: true })
  }

  // 获取 token
  const token = wx.getStorageSync('token') || ''

  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method,
      data: filteredData,
      header: {
        'Content-Type': 'application/json',
        'token': token,
        ...header
      },
      success: (res: any) => {
        if (showLoading) {
          wx.hideLoading()
        }

        if (res.statusCode === 200) {
          const result = res.data as ResponseData<T>
          // 兼容后端返回 code: 0 或 code: 200
          if (result.code === 200) {
            resolve(result)
          } else {
            // 业务错误
            wx.showToast({
              title: result.msg || '请求失败',
              icon: 'none',
              duration: 2000
            })
            reject(result)
          }
        } else {
          // HTTP 错误
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        if (showLoading) {
          wx.hideLoading()
        }
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

/**
 * GET 请求
 */
export const get = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<ResponseData<T>> => {
  return request<T>({ url, method: 'GET', data, ...options })
}

/**
 * POST 请求
 */
export const post = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<ResponseData<T>> => {
  return request<T>({ url, method: 'POST', data, ...options })
}

/**
 * PUT 请求
 */
export const put = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<ResponseData<T>> => {
  return request<T>({ url, method: 'PUT', data, ...options })
}

/**
 * DELETE 请求
 */
export const del = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<ResponseData<T>> => {
  return request<T>({ url, method: 'DELETE', data, ...options })
}

/**
 * 文件上传
 */
export const uploadFile = (filePath: string): Promise<ResponseData<{ url: string }>> => {
  const token = wx.getStorageSync('token') || ''

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: BASE_URL + '/common/upload',
      filePath,
      name: 'file',
      header: {
        'token': token
      },
      success: (res) => {
        const data = JSON.parse(res.data) as ResponseData<{ url: string }>
        if (data.code === 0) {
          resolve(data)
        } else {
          wx.showToast({
            title: data.msg || '上传失败',
            icon: 'none'
          })
          reject(data)
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

