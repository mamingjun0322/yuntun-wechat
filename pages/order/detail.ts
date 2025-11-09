// pages/order/detail.ts
/// <reference path="../../global.d.ts" />
import { get, put } from '../../utils/request'
import { API } from '../../config/api'
import { handleImageUrl, getOrderStatusText, getOrderTypeText } from '../../utils/util'
import { requireLogin } from '../../utils/auth'

Page({
  data: {
    id: 0,
    order: {} as any
  },

  onLoad(options: any) {
    // 检查登录
    if (!requireLogin()) {
      return
    }

    if (options.id) {
      this.setData({ id: options.id })
      this.loadOrderDetail()
    }
  },

  /**
   * 加载订单详情
   */
  async loadOrderDetail() {
    try {
      wx.showLoading({ title: '加载中...' })

      const res = await get(`${API.ORDER_DETAIL}/${this.data.id}`)

      // 兼容 code: 200 和 code: 0
      if (res.code === 200 || res.code === 0) {
        this.setData({ order: res.data })
      }
    } catch (error) {
      console.error('加载订单详情失败', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 拨打电话
   */
  makePhoneCall(e: any) {
    const phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },

  /**
   * 复制订单号
   */
  copyOrderNo() {
    wx.setClipboardData({
      data: this.data.order.orderNo,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        })
      }
    })
  },

  /**
   * 去支付
   */
  async goPay() {
    try {
      const res = await get(`${API.PAY_INFO}/${this.data.id}`)
      
      if (res.code === 0) {
        // 显示支付信息
        wx.showModal({
          title: '支付信息',
          content: `支付金额：¥${(res.data.amount / 100).toFixed(2)}\n支付方式：${res.data.paymentType}`,
          confirmText: '确认支付',
          success: async (modalRes) => {
            if (modalRes.confirm) {
              // 确认支付
              await put(`${API.PAY_CONFIRM}/${this.data.id}`)
              
              wx.showToast({
                title: '支付成功',
                icon: 'success'
              })

              // 刷新订单详情
              setTimeout(() => {
                this.loadOrderDetail()
              }, 1500)
            }
          }
        })
      }
    } catch (error) {
      console.error('获取支付信息失败', error)
    }
  },

  /**
   * 取消订单
   */
  cancelOrder() {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '取消中...' })

            await put(`${API.ORDER_CANCEL}/${this.data.id}`, {
              reason: '用户取消'
            })

            wx.showToast({
              title: '已取消',
              icon: 'success'
            })

            // 刷新订单详情
            setTimeout(() => {
              this.loadOrderDetail()
            }, 1500)
          } catch (error) {
            console.error('取消订单失败', error)
          } finally {
            wx.hideLoading()
          }
        }
      }
    })
  },

  /**
   * 确认收货
   */
  confirmReceipt() {
    wx.showModal({
      title: '确认收货',
      content: '确认已收到商品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '确认中...' })

            // 更新订单状态为已完成
            await put(`${API.ORDER_STATUS}/${this.data.id}`, {
              status: 4
            })

            wx.showToast({
              title: '已确认',
              icon: 'success'
            })

            // 刷新订单详情
            setTimeout(() => {
              this.loadOrderDetail()
            }, 1500)
          } catch (error) {
            console.error('确认收货失败', error)
          } finally {
            wx.hideLoading()
          }
        }
      }
    })
  },

  /**
   * 去评价
   */
  goComment() {
    wx.showToast({
      title: '评价功能开发中',
      icon: 'none'
    })
  },

  /**
   * 再来一单
   */
  orderAgain() {
    const cart = wx.getStorageSync('cart') || []
    
    this.data.order.goodsList.forEach((item: any) => {
      const existIndex = cart.findIndex((cartItem: any) => cartItem.id === item.id)
      if (existIndex > -1) {
        cart[existIndex].quantity += item.quantity
      } else {
        cart.push({
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          specs: item.specs || {},
          stock: 999
        })
      }
    })

    wx.setStorageSync('cart', cart)

    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    })

    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }, 1500)
  },

  handleImageUrl,
  getOrderStatusText,
  getOrderTypeText
})

