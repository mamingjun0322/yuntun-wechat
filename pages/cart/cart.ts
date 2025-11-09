// pages/cart/cart.ts
/// <reference path="../../global.d.ts" />
import { handleImageUrl } from '../../utils/util'
import { checkLogin } from '../../utils/auth'

const app = getApp<IAppOption>()

Page({
  data: {
    cartList: [] as any[],
    allSelected: false,
    totalPrice: 0,
    totalQuantity: 0
  },

  onShow() {
    this.loadCart()
  },

  /**
   * 加载购物车
   */
  loadCart() {
    const cart = wx.getStorageSync('cart') || []
    
    // 添加选中状态
    const cartList = cart.map((item: any) => ({
      ...item,
      selected: item.selected !== false // 默认选中
    }))

    this.setData({ cartList }, () => {
      this.calculateTotal()
      this.checkAllSelected()
    })
  },

  /**
   * 保存购物车
   */
  saveCart() {
    wx.setStorageSync('cart', this.data.cartList)
  },

  /**
   * 选择/取消选择商品
   */
  toggleSelect(e: any) {
    const index = e.currentTarget.dataset.index
    const cartList = [...this.data.cartList]
    cartList[index].selected = !cartList[index].selected

    this.setData({ cartList }, () => {
      this.saveCart()
      this.calculateTotal()
      this.checkAllSelected()
    })
  },

  /**
   * 全选/取消全选
   */
  toggleSelectAll() {
    const allSelected = !this.data.allSelected
    const cartList = this.data.cartList.map(item => ({
      ...item,
      selected: allSelected
    }))

    this.setData({ 
      cartList,
      allSelected 
    }, () => {
      this.saveCart()
      this.calculateTotal()
    })
  },

  /**
   * 检查是否全选
   */
  checkAllSelected() {
    const allSelected = this.data.cartList.length > 0 && 
                       this.data.cartList.every(item => item.selected)
    this.setData({ allSelected })
  },

  /**
   * 计算总价
   */
  calculateTotal() {
    let totalPrice = 0
    let totalQuantity = 0

    this.data.cartList.forEach(item => {
      if (item.selected) {
        totalPrice += item.price * item.quantity
        totalQuantity += item.quantity
      }
    })

    this.setData({
      totalPrice,
      totalQuantity
    })
  },

  /**
   * 减少数量
   */
  decreaseQuantity(e: any) {
    const index = e.currentTarget.dataset.index
    const cartList = [...this.data.cartList]

    if (cartList[index].quantity > 1) {
      cartList[index].quantity--
      this.setData({ cartList }, () => {
        this.saveCart()
        this.calculateTotal()
      })
    } else {
      // 数量为1时，询问是否删除
      wx.showModal({
        title: '提示',
        content: '是否删除该商品？',
        success: (res) => {
          if (res.confirm) {
            this.deleteItem(index)
          }
        }
      })
    }
  },

  /**
   * 增加数量
   */
  increaseQuantity(e: any) {
    const index = e.currentTarget.dataset.index
    const cartList = [...this.data.cartList]
    const item = cartList[index]

    if (item.quantity < item.stock) {
      item.quantity++
      this.setData({ cartList }, () => {
        this.saveCart()
        this.calculateTotal()
      })
    } else {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      })
    }
  },

  /**
   * 删除商品
   */
  deleteItem(index: number) {
    const cartList = [...this.data.cartList]
    cartList.splice(index, 1)
    
    this.setData({ cartList }, () => {
      this.saveCart()
      this.calculateTotal()
      this.checkAllSelected()
      
      wx.showToast({
        title: '已删除',
        icon: 'success'
      })
    })
  },

  /**
   * 清空购物车
   */
  clearCart() {
    if (this.data.cartList.length === 0) {
      return
    }

    wx.showModal({
      title: '提示',
      content: '确定清空购物车吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            cartList: [],
            allSelected: false,
            totalPrice: 0,
            totalQuantity: 0
          }, () => {
            this.saveCart()
            wx.showToast({
              title: '已清空',
              icon: 'success'
            })
          })
        }
      }
    })
  },

  /**
   * 去结算
   */
  checkout() {
    if (!checkLogin()) {
      return
    }

    if (this.data.totalQuantity === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      return
    }

    // 获取选中的商品
    const selectedGoods = this.data.cartList.filter(item => item.selected)

    // 保存到临时数据
    wx.setStorageSync('checkoutGoods', selectedGoods)

    // 跳转到订单确认页
    wx.navigateTo({
      url: '/pages/order/confirm'
    })
  },

  handleImageUrl
})

