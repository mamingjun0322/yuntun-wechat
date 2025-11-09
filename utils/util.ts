/**
 * 通用工具函数
 */

/**
 * 格式化价格（分转元）
 */
export const formatPrice = (price: number): string => {
  return (price / 100).toFixed(2)
}

/**
 * 格式化时间
 */
export const formatTime = (date: string | Date): string => {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

/**
 * 格式化日期
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * 节流函数
 */
export const throttle = (fn: Function, delay: number = 500) => {
  let timer: number | null = null
  return function(this: any, ...args: any[]) {
    if (timer) return
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 防抖函数
 */
export const debounce = (fn: Function, delay: number = 500) => {
  let timer: number | null = null
  return function(this: any, ...args: any[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 图片地址处理
 */
export const handleImageUrl = (url: string): string => {
  if (!url) return ''
  // 如果是完整的URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // 否则拼接BASE_URL
  return 'http://localhost:8080' + url
}

/**
 * 订单状态文本
 */
export const getOrderStatusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    1: '待支付',
    2: '制作中',
    3: '配送中',
    4: '已完成',
    5: '已取消'
  }
  return statusMap[status] || '未知状态'
}

/**
 * 订单类型文本
 */
export const getOrderTypeText = (type: number): string => {
  const typeMap: Record<number, string> = {
    1: '堂食',
    2: '外卖'
  }
  return typeMap[type] || '未知类型'
}

/**
 * 订单状态图标
 */
export const getOrderStatusIcon = (status: number): string => {
  const iconMap: Record<number, string> = {
    1: '⏰',
    2: '👨‍🍳',
    3: '🚚',
    4: '✅',
    5: '❌'
  }
  return iconMap[status] || '📋'
}

