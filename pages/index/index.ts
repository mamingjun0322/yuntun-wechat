// pages/index/index.ts
/// <reference path="../../global.d.ts" />
import { get } from '../../utils/request'
import { API } from '../../config/api'
import { handleImageUrl } from '../../utils/util'
import { checkLogin } from '../../utils/auth'

const app = getApp<IAppOption>()

interface GoodsItem {
  id: number
  name: string
  image: string
  price: number
  originalPrice?: number
  description: string
  sales: number
  stock: number
  tag?: string
}

interface CategoryItem {
  id: number
  name: string
  sort: number
}

Page({
  data: {
    statusBarHeight: 0,
    shopInfo: {} as any,
    bannerList: [] as any[],
    categoryList: [] as CategoryItem[],
    currentCategory: 0, // 当前选中的分类，0表示全部
    goodsList: [] as GoodsItem[],
    page: 1,
    pageSize: 20,
    loading: false,
    noMore: false,
    // 购物车相关
    showCart: false,
    cartList: [] as any[],
    cartAllSelected: false,
    cartTotalPrice: 0,
    cartTotalQuantity: 0
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight
    })

    this.loadData()
    this.loadCart()
  },

  onShow() {
    // 每次显示页面时刷新购物车
    this.loadCart()
  },

  onReachBottom() {
    if (!this.data.loading && !this.data.noMore) {
      this.setData({ page: this.data.page + 1 })
      this.loadGoods()
    }
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      noMore: false
    })
    this.loadData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 加载所有数据
   */
  async loadData() {
    await Promise.all([
      this.loadShopInfo(),
      this.loadBanners(),
      this.loadCategories(),
      this.loadGoods()
    ])
  },


  /**
   * 加载店铺信息
   */
  async loadShopInfo() {
    try {
      const res = await get(API.SHOP_INFO)
      // 兼容 code: 200 和 code: 0
      if (res.code === 200 || res.code === 0) {
        this.setData({ shopInfo: res.data })
      }
    } catch (error) {
      console.error('加载店铺信息失败', error)
    }
  },

  /**
   * 加载轮播图
   */
  async loadBanners() {
    try {
      const res = await get(API.SHOP_BANNER)
      // 兼容 code: 200 和 code: 0
      if (res.code === 200 || res.code === 0) {
        this.setData({ bannerList: res.data || [] })
      }
    } catch (error) {
      console.error('加载轮播图失败', error)
      // 使用空数组，避免页面崩溃
      this.setData({ bannerList: [] })
    }
  },

  /**
   * 加载分类
   */
  async loadCategories() {
    try {
      const res = await get(API.CATEGORY_LIST)
      // 兼容 code: 200 和 code: 0
      if (res.code === 200 || res.code === 0) {
        this.setData({ categoryList: res.data || [] })
      }
    } catch (error) {
      console.error('加载分类失败', error)
      // 使用空数组，避免页面崩溃
      this.setData({ categoryList: [] })
    }
  },

  /**
   * 选择分类
   */
  selectCategory(e: any) {
    const categoryId = e.currentTarget.dataset.id
    this.setData({
      currentCategory: categoryId,
      page: 1,
      noMore: false,
      goodsList: []
    })
    this.loadGoods()
  },

  /**
   * 加载商品列表
   */
  async loadGoods() {
    if (this.data.loading) return

    try {
      this.setData({ loading: true })

      const params: any = {
        page: this.data.page,
        pageSize: this.data.pageSize
      }

      if (this.data.currentCategory !== 0) {
        params.categoryId = this.data.currentCategory
      }

      const res = await get(API.GOODS_LIST, params)

      // 兼容 code: 200 和 code: 0
      if (res.code === 200 || res.code === 0) {
        const list = res.data.records || []
        
        // 同步购物车数量到商品列表
        const goodsListWithCart = this.syncCartQuantity(list)
        
        this.setData({
          goodsList: this.data.page === 1 ? goodsListWithCart : [...this.data.goodsList, ...goodsListWithCart],
          noMore: list.length < this.data.pageSize
        })
      }
    } catch (error) {
      console.error('加载商品列表失败', error)
      // 首次加载失败时显示空数组
      if (this.data.page === 1) {
        this.setData({ goodsList: [] })
      }
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 同步购物车数量到商品列表
   */
  syncCartQuantity(goodsList: any[]) {
    const cart = wx.getStorageSync('cart') || []
    
    return goodsList.map(goods => {
      // 计算该商品在购物车中的总数量
      const cartQuantity = cart
        .filter((item: any) => item.id === goods.id)
        .reduce((sum: number, item: any) => sum + item.quantity, 0)
      
      return {
        ...goods,
        cartQuantity
      }
    })
  },

  /**
   * 刷新商品列表的购物车数量
   */
  refreshGoodsCartQuantity() {
    const goodsList = this.syncCartQuantity(this.data.goodsList)
    this.setData({ goodsList })
  },

  /**
   * 添加到购物车
   */
  addToCart(e: any) {
    // 检查登录
    if (!checkLogin()) {
      return
    }

    const goods = e.currentTarget.dataset.goods
    
    // 获取购物车数据
    let cart: any[] = wx.getStorageSync('cart') || []
    
    // 查找是否已存在
    const index = cart.findIndex(item => item.id === goods.id)
    
    if (index > -1) {
      cart[index].quantity++
    } else {
      cart.push({
        ...goods,
        quantity: 1,
        selected: true
      })
    }
    
    // 保存购物车
    wx.setStorageSync('cart', cart)
    
    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 1500
    })

    // 刷新购物车和商品列表数量
    this.loadCart()
    this.refreshGoodsCartQuantity()
  },

  /**
   * 减少商品数量
   */
  decreaseGoods(e: any) {
    // 检查登录
    if (!checkLogin()) {
      return
    }

    const goodsId = e.currentTarget.dataset.id
    
    // 获取购物车
    let cart: any[] = wx.getStorageSync('cart') || []
    
    // 查找商品
    const index = cart.findIndex(item => item.id === goodsId)
    
    if (index > -1) {
      if (cart[index].quantity > 1) {
        // 减少数量
        cart[index].quantity--
        wx.setStorageSync('cart', cart)
        
        // 刷新购物车和商品列表
        this.loadCart()
        this.refreshGoodsCartQuantity()
      } else {
        // 数量为1时，删除商品
        cart.splice(index, 1)
        wx.setStorageSync('cart', cart)
        
        // 刷新购物车和商品列表
        this.loadCart()
        this.refreshGoodsCartQuantity()
      }
    }
  },

  /**
   * 增加商品数量
   */
  increaseGoods(e: any) {
    // 检查登录
    if (!checkLogin()) {
      return
    }

    const goodsId = e.currentTarget.dataset.id
    
    // 获取购物车
    let cart: any[] = wx.getStorageSync('cart') || []
    
    // 查找商品
    const index = cart.findIndex(item => item.id === goodsId)
    
    if (index > -1) {
      // 检查库存
      const goods = this.data.goodsList.find(item => item.id === goodsId)
      if (goods && cart[index].quantity < goods.stock) {
        cart[index].quantity++
        wx.setStorageSync('cart', cart)
        
        // 刷新购物车和商品列表
        this.loadCart()
        this.refreshGoodsCartQuantity()
      } else {
        wx.showToast({
          title: '库存不足',
          icon: 'none'
        })
      }
    }
  },

  /**
   * 跳转到商品详情
   */
  goGoodsDetail(e: any) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/goods/detail?id=${id}`
    })
  },

  /**
   * 跳转到搜索页
   */
  goSearch() {
    wx.showToast({
      title: '搜索功能开发中',
      icon: 'none'
    })
  },

  /**
   * 轮播图点击事件
   */
  onBannerTap(e: any) {
    const url = e.currentTarget.dataset.url
    
    if (!url) {
      console.log('轮播图未配置跳转链接')
      return
    }

    // 判断是否是商品详情页
    if (url.startsWith('/pages/goods/detail')) {
      // 小程序内部路由跳转
      wx.navigateTo({
        url: url,
        fail: (err) => {
          console.error('跳转失败:', err)
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          })
        }
      })
    } else if (url.startsWith('/pages/')) {
      // 其他小程序内部页面
      wx.navigateTo({
        url: url,
        fail: (err) => {
          // 如果是 tabBar 页面，使用 switchTab
          wx.switchTab({
            url: url,
            fail: () => {
              console.error('跳转失败:', err)
              wx.showToast({
                title: '页面跳转失败',
                icon: 'none'
              })
            }
          })
        }
      })
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      // 外部链接，复制到剪贴板
      wx.setClipboardData({
        data: url,
        success: () => {
          wx.showToast({
            title: '链接已复制',
            icon: 'success'
          })
        }
      })
    } else {
      console.log('不支持的链接格式:', url)
    }
  },

  // ==================== 购物车相关方法 ====================

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
      this.calculateCartTotal()
      this.checkCartAllSelected()
    })
  },

  /**
   * 保存购物车
   */
  saveCart() {
    wx.setStorageSync('cart', this.data.cartList)
  },

  /**
   * 显示购物车抽屉
   */
  showCartDrawer() {
    // 检查登录
    if (!checkLogin()) {
      return
    }

    this.setData({ showCart: true })
  },

  /**
   * 隐藏购物车抽屉
   */
  hideCartDrawer() {
    this.setData({ showCart: false })
  },

  /**
   * 选择/取消选择商品
   */
  toggleCartSelect(e: any) {
    const index = e.currentTarget.dataset.index
    const cartList = [...this.data.cartList]
    cartList[index].selected = !cartList[index].selected

    this.setData({ cartList }, () => {
      this.saveCart()
      this.calculateCartTotal()
      this.checkCartAllSelected()
    })
  },

  /**
   * 全选/取消全选
   */
  toggleCartSelectAll() {
    const cartAllSelected = !this.data.cartAllSelected
    const cartList = this.data.cartList.map(item => ({
      ...item,
      selected: cartAllSelected
    }))

    this.setData({ 
      cartList,
      cartAllSelected 
    }, () => {
      this.saveCart()
      this.calculateCartTotal()
    })
  },

  /**
   * 检查是否全选
   */
  checkCartAllSelected() {
    const cartAllSelected = this.data.cartList.length > 0 && 
                           this.data.cartList.every(item => item.selected)
    this.setData({ cartAllSelected })
  },

  /**
   * 计算总价
   */
  calculateCartTotal() {
    let cartTotalPrice = 0
    let cartTotalQuantity = 0

    this.data.cartList.forEach(item => {
      if (item.selected) {
        cartTotalPrice += item.price * item.quantity
        cartTotalQuantity += item.quantity
      }
    })

    this.setData({
      cartTotalPrice,
      cartTotalQuantity
    })
  },

  /**
   * 减少数量
   */
  decreaseCartQuantity(e: any) {
    const index = e.currentTarget.dataset.index
    const cartList = [...this.data.cartList]

    if (cartList[index].quantity > 1) {
      cartList[index].quantity--
      this.setData({ cartList }, () => {
        this.saveCart()
        this.calculateCartTotal()
      })
    } else {
      // 数量为1时，询问是否删除
      wx.showModal({
        title: '提示',
        content: '是否删除该商品？',
        success: (res) => {
          if (res.confirm) {
            this.deleteCartItem(index)
          }
        }
      })
    }
  },

  /**
   * 增加数量
   */
  increaseCartQuantity(e: any) {
    const index = e.currentTarget.dataset.index
    const cartList = [...this.data.cartList]
    const item = cartList[index]

    if (item.quantity < item.stock) {
      item.quantity++
      this.setData({ cartList }, () => {
        this.saveCart()
        this.calculateCartTotal()
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
  deleteCartItem(index: number) {
    const cartList = [...this.data.cartList]
    cartList.splice(index, 1)
    
    this.setData({ cartList }, () => {
      this.saveCart()
      this.calculateCartTotal()
      this.checkCartAllSelected()
      
      if (cartList.length === 0) {
        this.hideCartDrawer()
      }
    })
  },

  /**
   * 清空购物车
   */
  clearCart() {
    wx.showModal({
      title: '提示',
      content: '确定要清空购物车吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ 
            cartList: [],
            cartTotalPrice: 0,
            cartTotalQuantity: 0,
            cartAllSelected: false
          }, () => {
            this.saveCart()
            this.hideCartDrawer()
          })
          
          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 结算
   */
  cartCheckout() {
    // 检查登录
    if (!checkLogin()) {
      return
    }

    const selectedGoods = this.data.cartList.filter(item => item.selected)
    
    if (selectedGoods.length === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      return
    }

    // 保存选中的商品到storage
    wx.setStorageSync('checkoutGoods', selectedGoods)

    // 跳转到订单确认页
    wx.navigateTo({
      url: '/pages/order/confirm'
    })
  },

  /**
   * 处理图片URL
   */
  handleImageUrl
})

