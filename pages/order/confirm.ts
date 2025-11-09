// pages/order/confirm.ts
/// <reference path="../../global.d.ts" />
import { get, post } from '../../utils/request'
import { API } from '../../config/api'
import { handleImageUrl } from '../../utils/util'
import { checkLogin } from '../../utils/auth'

const app = getApp<IAppOption>()

// 防重复提交的标志（使用闭包变量，不依赖 setData）
let isSubmitting = false

Page({
  data: {
    orderType: 1, // 1-堂食 2-外卖
    // 堂食信息
    tableNo: '',
    peopleCount: 2,
    // 外卖信息
    address: null as any,
    addressList: [] as any[],
    deliveryTime: '尽快送达',
    tableware: 1,
    // 商品列表
    goodsList: [] as any[],
    // 费用
    goodsAmount: 0,
    deliveryFee: 0,
    packingFee: 0,
    couponDiscount: 0,
    totalAmount: 0,
    // 优惠券
    selectedCoupon: null as any,
    // 备注
    remark: '',
    submitting: false
  },

  onLoad(options: any) {
    if (!checkLogin()) {
      return
    }

    // 获取桌位号（优先级：URL参数 > 扫码获取 > 缓存 > 默认值0）
    let tableNo = ''
    
    // 1. 从URL参数获取（如果有）
    if (options && options.tableNo) {
      tableNo = options.tableNo
    }
    // 2. 从扫码获取的全局变量
    else if (app.globalData.tableNo) {
      tableNo = app.globalData.tableNo
    }
    // 3. 从缓存获取
    else {
      const cachedTableNo = wx.getStorageSync('tableNo')
      tableNo = cachedTableNo || ''
    }
    
    // 如果都获取不到，设置默认值为 "0"
    if (!tableNo) {
      tableNo = '0'
    }

    // 默认为堂食，用户可以在页面上选择
    this.setData({
      orderType: app.globalData.orderType || 1,
      tableNo: tableNo
    })

    this.loadData()
  },

  /**
   * 切换订单类型
   */
  switchOrderType(e: any) {
    const type = e.currentTarget.dataset.type
    
    // 如果类型没变，不需要切换
    if (type === this.data.orderType) {
      return
    }

    this.setData({ orderType: type })
    app.globalData.orderType = type
    wx.setStorageSync('orderType', type)

    // 重新加载数据
    this.loadData()
  },

  /**
   * 加载数据
   */
  async loadData() {
    // 加载商品
    const goodsList = wx.getStorageSync('checkoutGoods') || []
    if (!goodsList.length) {
      wx.showToast({
        title: '请先选择商品',
        icon: 'none'
      })
      setTimeout(() => {
        wx.switchTab({ url: '/pages/cart/cart' })
      }, 1500)
      return
    }

    this.setData({ goodsList }, () => {
      this.calculateAmount()
    })

    // 如果是外卖，加载地址和配送配置
    if (this.data.orderType === 2) {
      await this.loadAddressList()
      await this.loadDeliveryConfig()
    }
  },

  /**
   * 加载地址列表
   */
  async loadAddressList() {
    try {
      const res = await get(API.ADDRESS_LIST)
      if (res.code === 0) {
        const addressList = res.data || []
        // 获取默认地址
        const defaultAddress = addressList.find((item: any) => item.isDefault)
        this.setData({
          addressList,
          address: defaultAddress || addressList[0] || null
        }, () => {
          this.calculateAmount()
        })
      }
    } catch (error) {
      console.error('加载地址失败', error)
    }
  },

  /**
   * 加载配送配置
   */
  async loadDeliveryConfig() {
    try {
      const res = await get(API.CONFIG_DELIVERY)
      if (res.code === 0) {
        this.setData({
          deliveryFee: res.data.deliveryFee || 0,
          packingFee: res.data.packingFee || 0
        }, () => {
          this.calculateAmount()
        })
      }
    } catch (error) {
      console.error('加载配送配置失败', error)
    }
  },

  /**
   * 计算金额
   */
  calculateAmount() {
    // 计算商品总额
    let goodsAmount = 0
    this.data.goodsList.forEach(item => {
      goodsAmount += item.price * item.quantity
    })

    // 计算总额
    let totalAmount = goodsAmount

    // 外卖加上配送费和打包费
    if (this.data.orderType === 2) {
      totalAmount += this.data.deliveryFee + this.data.packingFee
    }

    // 减去优惠券
    totalAmount -= this.data.couponDiscount

    this.setData({
      goodsAmount,
      totalAmount: totalAmount > 0 ? totalAmount : 0
    })
  },

  /**
   * 输入桌号
   */
  inputTableNo(e: any) {
    this.setData({ tableNo: e.detail.value })
  },

  /**
   * 选择就餐人数
   */
  selectPeopleCount(e: any) {
    const count = e.currentTarget.dataset.count
    this.setData({ peopleCount: count })
  },

  /**
   * 选择地址
   */
  selectAddress() {
    wx.navigateTo({
      url: '/pages/address/list?select=1'
    })
  },

  /**
   * 选择配送时间
   */
  selectDeliveryTime() {
    const items = ['尽快送达', '15分钟后', '30分钟后', '1小时后']
    wx.showActionSheet({
      itemList: items,
      success: (res) => {
        this.setData({ deliveryTime: items[res.tapIndex] })
      }
    })
  },

  /**
   * 选择餐具
   */
  selectTableware(e: any) {
    const count = e.currentTarget.dataset.count
    this.setData({ tableware: count })
  },

  /**
   * 选择优惠券
   */
  selectCoupon() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  /**
   * 输入备注
   */
  inputRemark(e: any) {
    this.setData({ remark: e.detail.value })
  },

  /**
   * 提交订单
   */
  async submitOrder() {
    // 使用闭包变量防止重复提交（立即生效，不依赖 setData）
    if (isSubmitting) {
      console.log('订单正在提交中，请勿重复点击')
      return
    }

    // 验证
    if (this.data.orderType === 1 && !this.data.tableNo) {
      wx.showToast({
        title: '请输入桌号',
        icon: 'none'
      })
      return
    }

    if (this.data.orderType === 2 && !this.data.address) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      })
      return
    }

    try {
      // 立即设置标志，防止重复提交
      isSubmitting = true
      this.setData({ submitting: true })
      wx.showLoading({ title: '提交中...' })

      // 构造订单数据
      const orderData: any = {
        type: this.data.orderType,
        goodsList: this.data.goodsList.map(item => {
          // 处理规格数据
          const specs = item.specs || {}
          const specArray = Object.keys(specs).map(key => ({
            name: specs[key].name || '',
            value: specs[key].value
          }))
          
          return {
            id: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            specs: specArray
          }
        }),
        goodsAmount: this.data.goodsAmount,
        totalAmount: this.data.totalAmount,
        remark: this.data.remark
      }

      // 堂食订单
      if (this.data.orderType === 1) {
        orderData.tableNo = this.data.tableNo
        orderData.peopleCount = this.data.peopleCount
      }
      // 外卖订单
      else {
        orderData.addressId = this.data.address.id
        orderData.receiverName = this.data.address.name
        orderData.receiverPhone = this.data.address.phone
        orderData.address = `${this.data.address.region} ${this.data.address.address}`
        orderData.deliveryTime = this.data.deliveryTime
        orderData.tableware = this.data.tableware
        orderData.deliveryFee = this.data.deliveryFee
        orderData.packingFee = this.data.packingFee
      }

      // 优惠券
      if (this.data.selectedCoupon) {
        orderData.couponId = this.data.selectedCoupon.id
        orderData.couponDiscount = this.data.couponDiscount
      }

      const res = await post(API.ORDER_CREATE, orderData)

      // 兼容 code: 0 和 code: 200
      if (res.code === 0 || res.code === 200) {
        // 清空购物车中已结算的商品
        const cart = wx.getStorageSync('cart') || []
        const checkoutIds = this.data.goodsList.map(item => item.id)
        const newCart = cart.filter((item: any) => !checkoutIds.includes(item.id))
        wx.setStorageSync('cart', newCart)

        // 清空临时数据
        wx.removeStorageSync('checkoutGoods')

        wx.showToast({
          title: '下单成功',
          icon: 'success'
        })

        // 如果返回了支付链接，跳转到支付页面
        if (res.data && res.data.paymentUrl) {
          setTimeout(() => {
            // 使用 web-view 打开支付链接
            wx.navigateTo({
              url: `/pages/payment/webview?url=${encodeURIComponent(res.data.paymentUrl)}`
            })
          }, 1500)
        } else {
          // 没有支付链接，跳转到订单详情
          setTimeout(() => {
            wx.redirectTo({
              url: `/pages/order/detail?id=${res.data.orderId}`
            })
          }, 1500)
        }
      }
    } catch (error) {
      console.error('提交订单失败', error)
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
      // 重置标志，允许下次提交
      isSubmitting = false
      this.setData({ submitting: false })
    }
  },

  handleImageUrl
})

