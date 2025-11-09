// pages/order/list.ts
/// <reference path="../../global.d.ts" />
import { get, put } from '../../utils/request'
import { API } from '../../config/api'
import { handleImageUrl, getOrderStatusText } from '../../utils/util'
import { checkLogin } from '../../utils/auth'

Page({
  data: {
    tabs: [
      { status: 0, name: '全部' },
      { status: 1, name: '待支付' },
      { status: 2, name: '制作中' },
      { status: 3, name: '配送中' },
      { status: 4, name: '已完成' },
      { status: 5, name: '已取消' }
    ],
    currentTab: 0,
    orderList: [] as any[],
    page: 1,
    pageSize: 10,
    loading: false,
    noMore: false
  },

  onLoad(options: any) {
    if (!checkLogin()) {
      return
    }

    // 如果有传入状态参数，切换到对应tab
    if (options.status) {
      const tabIndex = this.data.tabs.findIndex(tab => tab.status === Number(options.status))
      if (tabIndex > -1) {
        this.setData({ currentTab: tabIndex })
      }
    }

    this.loadOrders()
  },

  onShow() {
    // 每次显示时刷新列表
    if (checkLogin()) {
      this.setData({ page: 1, noMore: false })
      this.loadOrders()
    }
  },

  onReachBottom() {
    if (!this.data.loading && !this.data.noMore) {
      this.setData({ page: this.data.page + 1 })
      this.loadOrders()
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1, noMore: false })
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 切换Tab
   */
  switchTab(e: any) {
    const index = e.currentTarget.dataset.index
    this.setData({
      currentTab: index,
      page: 1,
      noMore: false,
      orderList: []
    })
    this.loadOrders()
  },

  /**
   * 加载订单列表
   */
  async loadOrders() {
    if (this.data.loading) return

    try {
      this.setData({ loading: true })

      const currentTab = this.data.tabs[this.data.currentTab]
      const params: any = {
        page: this.data.page,
        pageSize: this.data.pageSize
      }

      // 只有非全部时才传 status 参数
      if (currentTab.status !== 0) {
        params.status = currentTab.status
      }

      const res = await get(API.ORDER_LIST, params)

      // 兼容 code: 200 和 code: 0
      if (res.code === 200 || res.code === 0) {
        const list = res.data.records || []
        
        this.setData({
          orderList: this.data.page === 1 ? list : [...this.data.orderList, ...list],
          noMore: list.length < this.data.pageSize
        })
      }
    } catch (error) {
      console.error('加载订单列表失败', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 跳转订单详情
   */
  goOrderDetail(e: any) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/order/detail?id=${id}`
    })
  },

  /**
   * 去支付
   */
  goPay(e: any) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: '跳转支付',
      icon: 'none'
    })
    // TODO: 实现支付功能
  },

  /**
   * 取消订单
   */
  cancelOrder(e: any) {
    const id = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index

    wx.showModal({
      title: '提示',
      content: '确定要取消订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '取消中...' })

            await put(`${API.ORDER_CANCEL}/${id}`, {
              reason: '用户取消'
            })

            wx.showToast({
              title: '已取消',
              icon: 'success'
            })

            // 刷新列表
            this.setData({ page: 1, noMore: false })
            this.loadOrders()
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
   * 再来一单
   */
  orderAgain(e: any) {
    const order = e.currentTarget.dataset.order
    
    // 将订单商品加入购物车
    const cart = wx.getStorageSync('cart') || []
    
    order.goodsList.forEach((item: any) => {
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
  getOrderStatusText
})

