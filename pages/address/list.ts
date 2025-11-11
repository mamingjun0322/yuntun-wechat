// pages/address/list.ts
/// <reference path="../../global.d.ts" />
import { get, put, del } from '../../utils/request'
import { API } from '../../config/api'
import { checkLogin } from '../../utils/auth'

Page({
  data: {
    addressList: [] as any[],
    isSelectMode: false // 是否选择地址模式（从订单页进入）
  },

  onLoad(options: any) {
    if (!checkLogin()) {
      return
    }

    // 如果是选择地址模式
    if (options.select) {
      this.setData({ isSelectMode: true })
    }

    this.loadAddressList()
  },

  onShow() {
    // 每次显示时刷新列表
    if (checkLogin()) {
      this.loadAddressList()
    }
  },

  /**
   * 加载地址列表
   */
  async loadAddressList() {
    try {
      wx.showLoading({ title: '加载中...' })

      const res = await get(API.ADDRESS_LIST)

      // 兼容 code: 0 和 code: 200
      if (res.code === 0 || res.code === 200) {
        this.setData({ addressList: res.data || [] })
      } else {
        console.error('加载地址列表失败：', res)
        wx.showToast({
          title: res.msg || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载地址列表失败', error)
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 选择地址（选择模式）
   */
  selectAddress(e: any) {
    if (!this.data.isSelectMode) return

    const index = e.currentTarget.dataset.index
    const address = this.data.addressList[index]

    // 保存选中的地址
    wx.setStorageSync('selectedAddress', address)

    // 返回上一页
    wx.navigateBack()
  },

  /**
   * 编辑地址
   */
  editAddress(e: any) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/address/edit?id=${id}`
    })
  },

  /**
   * 添加地址
   */
  addAddress() {
    wx.navigateTo({
      url: '/pages/address/edit'
    })
  },

  /**
   * 删除地址
   */
  deleteAddress(e: any) {
    const id = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index

    wx.showModal({
      title: '提示',
      content: '确定要删除该地址吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...' })

            await del(`${API.ADDRESS_DELETE}/${id}`)

            wx.showToast({
              title: '已删除',
              icon: 'success'
            })

            // 刷新列表
            this.loadAddressList()
          } catch (error) {
            console.error('删除地址失败', error)
          } finally {
            wx.hideLoading()
          }
        }
      }
    })
  },

  /**
   * 设置默认地址
   */
  async setDefaultAddress(e: any) {
    const id = e.currentTarget.dataset.id

    try {
      wx.showLoading({ title: '设置中...' })

      await put(`${API.ADDRESS_SET_DEFAULT}/${id}`)

      wx.showToast({
        title: '已设置',
        icon: 'success'
      })

      // 刷新列表
      this.loadAddressList()
    } catch (error) {
      console.error('设置默认地址失败', error)
    } finally {
      wx.hideLoading()
    }
  }
})

