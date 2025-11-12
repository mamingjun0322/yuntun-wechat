// pages/user/user.ts
/// <reference path="../../global.d.ts" />
import { get, put } from '../../utils/request'
import { API } from '../../config/api'
import { handleImageUrl } from '../../utils/util'
import { requireLogin, getUserInfo, clearAuth } from '../../utils/auth'

const app = getApp<IAppOption>()

Page({
  data: {
    userInfo: null as any,
    orderStats: {
      pending: 0,      // 待支付
      processing: 0,   // 制作中
      delivering: 0,   // 配送中
      completed: 0     // 已完成
    },
    menuList: [
      {
        icon: '📍',
        name: '地址管理',
        path: '/pages/address/list'
      },
      {
        icon: '🎁',
        name: '优惠券',
        path: ''
      },
      {
        icon: '⭐',
        name: '积分明细',
        path: '/pages/points/points'
      },
      {
        icon: '👤',
        name: '个人资料',
        path: ''
      },
      {
        icon: '💬',
        name: '联系客服',
        path: '/pages/service/service'
      },
      {
        icon: '⚙️',
        name: '设置',
        path: ''
      }
    ]
  },

  onShow() {
    // 强制登录检查
    if (!requireLogin()) {
      return
    }
    
    // 已登录，加载用户信息和订单统计
    this.loadUserInfo()
    this.loadOrderStats()
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    try {
      const res = await get(API.USER_INFO)
      // 兼容 code: 200 和 code: 0
      if (res.code === 200 || res.code === 0) {
        const userInfo = res.data
        // 处理头像URL
        if (userInfo.avatar) {
          userInfo.avatar = handleImageUrl(userInfo.avatar)
        }
        this.setData({ userInfo })
        // 更新全局用户信息
        app.globalData.userInfo = userInfo
      }
    } catch (error) {
      console.error('加载用户信息失败', error)
    }
  },

  /**
   * 加载订单统计
   */
  async loadOrderStats() {
    try {
      const res = await get(API.ORDER_LIST, { page: 1, pageSize: 100 })
      if (res.code === 200 || res.code === 0) {
        const orders = res.data.records || []
        
        // 统计各状态订单数量
        const stats = {
          pending: 0,
          processing: 0,
          delivering: 0,
          completed: 0
        }
        
        orders.forEach((order: any) => {
          switch (order.status) {
            case 1: stats.pending++; break
            case 2: stats.processing++; break
            case 3: stats.delivering++; break
            case 4: stats.completed++; break
          }
        })
        
        this.setData({ orderStats: stats })
      }
    } catch (error) {
      console.error('加载订单统计失败', error)
    }
  },

  /**
   * 跳转登录
   */
  goLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  /**
   * 跳转订单列表（按状态）
   */
  goOrderList(e: any) {
    const status = e.currentTarget.dataset.status
    const statusNum = Number(status)
    
    // 订单列表是 TabBar 页面，使用 switchTab 跳转
    // 注意：switchTab 不支持传参，需要使用全局变量或缓存
    if (statusNum > 0) {
      // 如果有指定状态（1-5），先缓存状态
      wx.setStorageSync('orderListStatus', statusNum)
    } else {
      // 查看全部（status=0），清除缓存状态
      wx.removeStorageSync('orderListStatus')
    }
    
    wx.switchTab({
      url: '/pages/order/list'
    })
  },

  /**
   * 跳转菜单页面
   */
  goMenuPage(e: any) {
    const index = e.currentTarget.dataset.index
    const menu = this.data.menuList[index]

    if (!menu.path) {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: menu.path
    })
  },

  /**
   * 跳转到积分明细
   */
  goPoints() {
    wx.navigateTo({
      url: '/pages/points/points'
    })
  },

  /**
   * 跳转到优惠券
   */
  goCoupons() {
    wx.showToast({
      title: '优惠券功能开发中',
      icon: 'none'
    })
  },

  /**
   * 完善用户资料
   */
  async editProfile() {
    try {
      // 获取用户信息授权
      const profileRes = await wx.getUserProfile({
        desc: '用于完善用户资料'
      })
      
      const userProfile = profileRes.userInfo
      
      // 调用后端更新接口 - 修正为正确的API路径
      const res = await put(API.USER_UPDATE, {
        nickname: userProfile.nickName,
        avatar: userProfile.avatarUrl
      })
      
      if (res.code === 200 || res.code === 0) {
        wx.showToast({
          title: '资料更新成功',
          icon: 'success'
        })
        
        // 重新加载用户信息
        this.loadUserInfo()
      }
    } catch (error) {
      console.log('用户取消授权', error)
    }
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          clearAuth()
          
          this.setData({ userInfo: null })
          app.globalData.userInfo = null

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })

              setTimeout(() => {
            wx.reLaunch({
              url: '/pages/index/index'
            })
          }, 1500)
        }
      }
    })
  }
})

