// app.ts
/// <reference path="./global.d.ts" />
import { isLogin } from './utils/auth'

App<IAppOption>({
  globalData: {
    userInfo: null,
    orderType: 1, // 1-堂食 2-外卖
    statusBarHeight: 0,
    tableNo: '' // 扫码获取的桌位号
  },
  
  onLaunch(options) {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.statusBarHeight = systemInfo.statusBarHeight || 0
    
    // 获取订单类型
    const savedOrderType = wx.getStorageSync('orderType')
    if (savedOrderType) {
      this.globalData.orderType = savedOrderType
    }

    // 处理扫码进入场景
    this.handleScanScene(options)

    // 强制登录检查
    if (!isLogin()) {
      console.log('未登录，跳转到登录页')
      // 延迟跳转，确保页面加载完成
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/login/login'
        })
      }, 300)
    } else {
      console.log('已登录，用户ID:', wx.getStorageSync('userId'))
    }
  },
  
  onShow(options) {
    console.log('App Show')
    // 处理扫码进入场景
    this.handleScanScene(options)
  },
  
  onHide() {
    console.log('App Hide')
  },

  /**
   * 处理扫码场景
   * 支持场景值携带桌位号
   */
  handleScanScene(options: WechatMiniprogram.App.LaunchShowOption) {
    console.log('启动场景:', options)
    
    // 扫描小程序码进入
    // scene 为 1047(扫描小程序码) 或 1048(长按识别小程序码) 或 1049(手机相册选取小程序码)
    if (options.scene === 1047 || options.scene === 1048 || options.scene === 1049) {
      // 从 query 中获取参数
      const query = options.query || {}
      
      // 方式1: 直接从 query 获取桌位号
      if (query.tableNo) {
        this.globalData.tableNo = query.tableNo as string
        wx.setStorageSync('tableNo', query.tableNo)
        console.log('扫码获取桌位号:', query.tableNo)
      }
      
      // 方式2: 从 scene 参数解析（适用于小程序码携带参数的情况）
      if (query.scene) {
        const sceneStr = decodeURIComponent(query.scene as string)
        console.log('scene参数:', sceneStr)
        
        // 解析 scene 参数，格式如: tableNo=A01 或 t=A01
        const params = this.parseSceneParams(sceneStr)
        if (params.tableNo) {
          this.globalData.tableNo = params.tableNo
          wx.setStorageSync('tableNo', params.tableNo)
          console.log('从scene解析桌位号:', params.tableNo)
        } else if (params.t) {
          // 简写参数
          this.globalData.tableNo = params.t
          wx.setStorageSync('tableNo', params.t)
          console.log('从scene解析桌位号(简写):', params.t)
        }
      }
    }
    
    // 从其他地方进入，检查是否有存储的桌位号
    const savedTableNo = wx.getStorageSync('tableNo')
    if (savedTableNo && !this.globalData.tableNo) {
      this.globalData.tableNo = savedTableNo
    }
  },

  /**
   * 解析 scene 参数
   * @param sceneStr scene字符串，格式如: tableNo=A01 或 t=A01
   */
  parseSceneParams(sceneStr: string): Record<string, string> {
    const params: Record<string, string> = {}
    
    // 支持多种分隔符: & 或 ,
    const pairs = sceneStr.split(/[&,]/)
    
    pairs.forEach(pair => {
      const [key, value] = pair.split('=')
      if (key && value) {
        params[key.trim()] = value.trim()
      }
    })
    
    return params
  }
})

