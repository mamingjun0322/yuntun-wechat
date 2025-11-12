// pages/search/search.ts
/// <reference path="../../global.d.ts" />
import { get } from '../../utils/request'
import { API } from '../../config/api'
import { handleImageUrl } from '../../utils/util'

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
}

Page({
  data: {
    statusBarHeight: 0,
    keyword: '', // 搜索关键词
    autoFocus: true, // 自动聚焦
    searchHistory: [] as string[], // 搜索历史
    hotKeywords: ['云吞', '饺子', '面条', '炒饭', '套餐'], // 热门搜索词
    goodsList: [] as GoodsItem[], // 商品列表
    total: 0, // 总数
    page: 1,
    pageSize: 20,
    loading: false,
    noMore: false,
    hasSearched: false // 是否已经搜索过
  },

  onLoad(options: any) {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight
    })

    // 加载搜索历史
    this.loadSearchHistory()

    // 如果有传入的关键词，直接搜索
    if (options.keyword) {
      this.setData({ 
        keyword: options.keyword,
        autoFocus: false 
      })
      this.doSearch()
    }
  },

  onReachBottom() {
    if (!this.data.loading && !this.data.noMore && this.data.hasSearched) {
      this.setData({ page: this.data.page + 1 })
      this.doSearch(true)
    }
  },

  /**
   * 输入框内容变化
   */
  onInputChange(e: any) {
    this.setData({
      keyword: e.detail.value
    })
  },

  /**
   * 点击搜索或回车
   */
  onSearch() {
    const keyword = this.data.keyword.trim()
    if (!keyword) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      })
      return
    }

    // 重置分页
    this.setData({
      page: 1,
      noMore: false,
      goodsList: []
    })

    this.doSearch()
    this.saveSearchHistory(keyword)
  },

  /**
   * 执行搜索
   */
  async doSearch(loadMore: boolean = false) {
    const { keyword, page, pageSize, loading } = this.data

    if (!keyword.trim()) return
    if (loading) return

    this.setData({ loading: true, hasSearched: true })

    try {
      const res = await get(API.GOODS_SEARCH, {
        keyword: keyword.trim(),
        page,
        pageSize
      })

      if (res.code === 200 || res.code === 0) {
        const data = res.data || {}
        const records = data.records || []
        
        // 处理图片URL
        records.forEach((item: GoodsItem) => {
          item.image = handleImageUrl(item.image)
        })

        this.setData({
          goodsList: loadMore ? [...this.data.goodsList, ...records] : records,
          total: data.total || 0,
          noMore: records.length < pageSize,
          loading: false
        })
      } else {
        throw new Error(res.msg || '搜索失败')
      }
    } catch (error: any) {
      console.error('搜索商品失败:', error)
      wx.showToast({
        title: error.msg || error.message || '搜索失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  /**
   * 清空输入框
   */
  onClearInput() {
    this.setData({
      keyword: '',
      goodsList: [],
      hasSearched: false
    })
  },

  /**
   * 取消搜索，返回上一页
   */
  onCancel() {
    wx.navigateBack()
  },

  /**
   * 点击搜索历史
   */
  onHistoryTap(e: any) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({
      keyword,
      page: 1,
      noMore: false,
      goodsList: []
    })
    this.doSearch()
  },

  /**
   * 点击热门关键词
   */
  onHotKeywordTap(e: any) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({
      keyword,
      page: 1,
      noMore: false,
      goodsList: []
    })
    this.doSearch()
    this.saveSearchHistory(keyword)
  },

  /**
   * 加载搜索历史
   */
  loadSearchHistory() {
    try {
      const history = wx.getStorageSync('search_history') || []
      this.setData({ searchHistory: history })
    } catch (error) {
      console.error('加载搜索历史失败:', error)
    }
  },

  /**
   * 保存搜索历史
   */
  saveSearchHistory(keyword: string) {
    try {
      let history = wx.getStorageSync('search_history') || []
      
      // 去重：移除已存在的相同关键词
      history = history.filter((item: string) => item !== keyword)
      
      // 添加到开头
      history.unshift(keyword)
      
      // 最多保存10条
      if (history.length > 10) {
        history = history.slice(0, 10)
      }
      
      wx.setStorageSync('search_history', history)
      this.setData({ searchHistory: history })
    } catch (error) {
      console.error('保存搜索历史失败:', error)
    }
  },

  /**
   * 清空搜索历史
   */
  onClearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('search_history')
            this.setData({ searchHistory: [] })
            wx.showToast({
              title: '已清空',
              icon: 'success'
            })
          } catch (error) {
            console.error('清空搜索历史失败:', error)
          }
        }
      }
    })
  },

  /**
   * 跳转商品详情
   */
  goGoodsDetail(e: any) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/goods/detail?id=${id}`
    })
  }
})
