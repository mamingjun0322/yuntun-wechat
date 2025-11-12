/**
 * API 配置文件
 * 根据后端 OpenAPI 文档配置
 */

// ⚠️ 重要：小程序调试时需要修改为你的局域网IP或服务器IP
// 开发环境-本地：http://localhost:8080/api（仅Web端可用）
// 开发环境-小程序：http://192.168.x.x:8080/api（替换为你的局域网IP）
// 生产环境：http://8.138.228.113:8080/api（服务器IP）

// 基础URL - 请根据实际情况修改
export const BASE_URL = 'http://localhost:8080/api'  // 请修改为你的IP

// 图片URL基础地址（用于处理相对路径）
export const IMAGE_BASE_URL = 'http://localhost:8080'  // 请修改为你的IP

/**
 * API 接口配置
 */
export const API = {
  // ==================== 用户相关 ====================
  
  // 微信登录
  WX_LOGIN: '/user/wxLogin',
  
  // 获取用户信息
  USER_INFO: '/user/info',
  
  // 更新用户信息
  USER_UPDATE: '/user/update',
  
  // 获取用户积分
  USER_POINTS: '/user/points',
  
  // 获取积分明细
  POINTS_HISTORY: '/user/points/history',
  
  // 签到
  USER_SIGN_IN: '/user/signIn',

  // ==================== 店铺相关 ====================
  
  // 获取店铺信息
  SHOP_INFO: '/shop/info',
  
  // 获取轮播图
  SHOP_BANNER: '/shop/banner',
  
  // 获取通知列表
  NOTICE_LIST: '/notice/list',

  // ==================== 商品相关 ====================
  
  // 商品列表
  GOODS_LIST: '/goods/list',
  
  // 商品详情
  GOODS_DETAIL: '/goods/detail',
  
  // 搜索商品
  GOODS_SEARCH: '/goods/search',
  
  // 分类列表
  CATEGORY_LIST: '/category/list',

  // ==================== 订单相关 ====================
  
  // 创建订单
  ORDER_CREATE: '/order/create',
  
  // 订单列表
  ORDER_LIST: '/order/list',
  
  // 订单详情
  ORDER_DETAIL: '/order/detail',
  
  // 取消订单
  ORDER_CANCEL: '/order/cancel',
  
  // 更新订单状态
  ORDER_STATUS: '/order/status',

  // ==================== 支付相关 ====================
  
  // 获取支付信息
  PAY_INFO: '/pay/info',
  
  // 确认支付
  PAY_CONFIRM: '/pay/confirm',

  // ==================== 地址相关 ====================
  
  // 地址列表
  ADDRESS_LIST: '/address/list',
  
  // 地址详情
  ADDRESS_DETAIL: '/address/detail',
  
  // 添加地址
  ADDRESS_ADD: '/address/add',
  
  // 编辑地址
  ADDRESS_EDIT: '/address/edit',
  
  // 删除地址
  ADDRESS_DELETE: '/address/delete',
  
  // 设置默认地址
  ADDRESS_SET_DEFAULT: '/address/setDefault',

  // ==================== 优惠券相关 ====================
  
  // 优惠券列表
  COUPON_LIST: '/coupon/list',
  
  // 可用优惠券
  COUPON_AVAILABLE: '/coupon/available',

  // ==================== 配置相关 ====================
  
  // 获取配送配置
  CONFIG_DELIVERY: '/config/delivery',
  
  // 获取打包费配置
  CONFIG_PACKING: '/config/packing',

  // ==================== 文件上传 ====================
  
  // 上传图片
  UPLOAD_IMAGE: '/upload/image',

  // ==================== 客服相关 ====================
  
  // 发送消息
  SERVICE_SEND_MESSAGE: '/customerService/sendMessage',
  
  // 消息列表
  SERVICE_MESSAGE_LIST: '/customerService/messageList',
  
  // 常见问题列表
  FAQ_LIST: '/customerService/faqList',
  
  // 标记消息为已读
  SERVICE_MARK_READ: '/customerService/markAsRead',
  
  // 获取客服配置
  SERVICE_CONFIG: '/customerService/config'
}

/**
 * 获取完整的URL
 */
export const getFullUrl = (path: string): string => {
  return BASE_URL + path
}
