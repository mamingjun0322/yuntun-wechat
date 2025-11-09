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
    menuList: [
      {
        icon: '📋',
        name: '我的订单',
        path: '/pages/order/list'
      },
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
        path: ''
      },
      {
        icon: '👤',
        name: '个人资料',
        path: ''
      },
      {
        icon: '💬',
        name: '联系客服',
        path: ''
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
    
    // 已登录，加载用户信息
    this.loadUserInfo()
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    try {
      const res = await get(API.USER_INFO)
      // 兼容 code: 200 和 code: 0
      if (res.code === 200 || res.code === 0) {
        this.setData({ userInfo: res.data })
        // 更新全局用户信息
        app.globalData.userInfo = res.data
      }
    } catch (error) {
      console.error('加载用户信息失败', error)
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
    wx.navigateTo({
      url: `/pages/order/list?status=${status}`
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
   * 完善用户资料
   */
  async editProfile() {
    try {
      // 获取用户信息授权
      const profileRes = await wx.getUserProfile({
        desc: '用于完善用户资料'
      })
      
      const userProfile = profileRes.userInfo
      
      // 调用后端更新接口
      const res = await put(API.USER_INFO, {
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
  },

  handleImageUrl
})

