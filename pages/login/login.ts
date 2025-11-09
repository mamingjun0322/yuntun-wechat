// pages/login/login.ts
/// <reference path="../../global.d.ts" />
import { post } from '../../utils/request'
import { API } from '../../config/api'
import { setToken, setUserInfo } from '../../utils/auth'

Page({
  data: {
    loading: false
  },

  /**
   * 微信登录
   */
  async wxLogin() {
    if (this.data.loading) return

    try {
      this.setData({ loading: true })

      // 1. 获取微信登录code
      const loginRes = await wx.login()
      if (!loginRes.code) {
        wx.showToast({
          title: '获取登录凭证失败',
          icon: 'none'
        })
        return
      }

      // 2. 调用后端登录接口（不强制要求授权用户信息）
      const loginData = {
        code: loginRes.code,
        nickName: '',  // 昵称和头像可以后续在用户中心完善
        avatar: ''
      }

      const res = await post(API.WX_LOGIN, loginData)

      // 判断登录是否成功（兼容 code: 0 和 code: 200）
      if (res.code === 0 || res.code === 200) {
        // 保存token和用户信息
        setToken(res.data.token)
        setUserInfo(res.data.userInfo)

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })

        // 延迟跳转
        setTimeout(() => {
          const pages = getCurrentPages()
          if (pages.length > 1) {
            wx.navigateBack()
          } else {
            wx.switchTab({
              url: '/pages/index/index'
            })
          }
        }, 1000)
      }
    } catch (error) {
      console.error('登录失败', error)
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 显示用户协议
   */
  showAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '这里是用户协议的内容...',
      showCancel: false
    })
  },

  /**
   * 显示隐私政策
   */
  showPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '这里是隐私政策的内容...',
      showCancel: false
    })
  }
})

