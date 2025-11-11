// pages/goods/detail.ts
/// <reference path="../../global.d.ts" />
import { get } from '../../utils/request'
import { API } from '../../config/api'
import { handleImageUrl } from '../../utils/util'
import { checkLogin } from '../../utils/auth'

Page({
  data: {
    id: 0,
    goods: {} as any,
    images: [] as string[],
    currentImageIndex: 0,
    showSpecModal: false,
    selectedSpecs: {} as any,
    quantity: 1,
    currentAction: 'addCart' // 当前操作：addCart 或 buyNow
  },

  onLoad(options: any) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadGoodsDetail()
    }
  },

  /**
   * 加载商品详情
   */
  async loadGoodsDetail() {
    try {
      wx.showLoading({ title: '加载中...' })
      
      const res = await get(`${API.GOODS_DETAIL}/${this.data.id}`)
      
      // 兼容 code: 200 和 code: 0
      if (res.code === 200 || res.code === 0) {
        const goods = res.data
        
        // 处理图片URL
        const images = (goods.images || []).map((img: string) => handleImageUrl(img))
        
        this.setData({
          goods: {
            ...goods,
            images: images
          },
          images: images
        })
      }
    } catch (error) {
      console.error('加载商品详情失败', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 图片切换
   */
  onImageChange(e: any) {
    this.setData({
      currentImageIndex: e.detail.current
    })
  },

  /**
   * 显示规格选择弹窗
   */
  showSpecModal(e: any) {
    // 检查登录
    if (!checkLogin()) {
      return
    }

    const action = e.currentTarget.dataset.action || 'addCart'
    this.setData({ 
      showSpecModal: true,
      currentAction: action
    })
  },

  /**
   * 关闭规格选择弹窗
   */
  hideSpecModal() {
    this.setData({ showSpecModal: false })
  },

  /**
   * 选择规格
   */
  selectSpec(e: any) {
    const { name, option } = e.currentTarget.dataset
    const selectedSpecs = { ...this.data.selectedSpecs }
    selectedSpecs[name] = option
    this.setData({ selectedSpecs })
  },

  /**
   * 减少数量
   */
  decreaseQuantity() {
    if (this.data.quantity > 1) {
      this.setData({ quantity: this.data.quantity - 1 })
    }
  },

  /**
   * 增加数量
   */
  increaseQuantity() {
    if (this.data.quantity < this.data.goods.stock) {
      this.setData({ quantity: this.data.quantity + 1 })
    } else {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      })
    }
  },

  /**
   * 加入购物车
   */
  addToCart() {
    const { goods, quantity, selectedSpecs } = this.data

    // 检查规格是否选择完整
    if (goods.hasSpecs && goods.specsList && goods.specsList.length > 0) {
      if (Object.keys(selectedSpecs).length !== goods.specsList.length) {
        wx.showToast({
          title: '请选择完整规格',
          icon: 'none'
        })
        return
      }
    }

    // 获取购物车
    let cart: any[] = wx.getStorageSync('cart') || []

    // 查找是否已存在相同商品和规格
    const cartItem = {
      id: goods.id,
      name: goods.name,
      image: goods.images?.[0] || '',
      price: goods.price,
      quantity,
      specs: selectedSpecs,
      stock: goods.stock
    }

    const existIndex = cart.findIndex(item => {
      return item.id === goods.id && 
             JSON.stringify(item.specs) === JSON.stringify(selectedSpecs)
    })

    if (existIndex > -1) {
      cart[existIndex].quantity += quantity
    } else {
      cart.push(cartItem)
    }

    wx.setStorageSync('cart', cart)

    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    })

    this.hideSpecModal()
    this.setData({
      quantity: 1,
      selectedSpecs: {}
    })
  },

  /**
   * 确认规格选择
   */
  confirmSpec(e: any) {
    const action = e.currentTarget.dataset.action
    
    if (action === 'buyNow') {
      this.buyNow()
    } else {
      this.addToCart()
    }
  },

  /**
   * 立即购买
   */
  buyNow() {
    const { goods, quantity, selectedSpecs } = this.data

    // 检查规格是否选择完整
    if (goods.hasSpecs && goods.specsList && goods.specsList.length > 0) {
      if (Object.keys(selectedSpecs).length !== goods.specsList.length) {
        wx.showToast({
          title: '请选择完整规格',
          icon: 'none'
        })
        return
      }
    }

    // 直接结算这一个商品
    const checkoutGoods = [{
      id: goods.id,
      name: goods.name,
      image: goods.images?.[0] || '',
      price: goods.price,
      quantity,
      specs: selectedSpecs,
      stock: goods.stock,
      selected: true
    }]

    wx.setStorageSync('checkoutGoods', checkoutGoods)

    wx.navigateTo({
      url: '/pages/order/confirm'
    })

    this.hideSpecModal()
    this.setData({
      quantity: 1,
      selectedSpecs: {}
    })
  },

  /**
   * 预览图片
   */
  previewImage(e: any) {
    const current = e.currentTarget.dataset.url
    wx.previewImage({
      current,
      urls: this.data.images.map(img => handleImageUrl(img))
    })
  },

  /**
   * 返回首页
   */
  goBack() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})

