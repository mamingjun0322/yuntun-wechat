// pages/points/points.ts
/// <reference path="../../global.d.ts" />
import { get, post } from '../../utils/request'
import { API } from '../../config/api'
import { requireLogin } from '../../utils/auth'
import { formatTime } from '../../utils/util'

interface PointsHistoryItem {
  id: number
  title: string
  points: number
  type: number  // 1-签到 2-消费 3-退款
  time: string
}

Page({
  data: {
    totalPoints: 0,
    signInPoints: 10,  // 签到积分
    orderPointsRate: 10,  // 订单积分倍率
    hasSignedIn: false,
    historyList: [] as PointsHistoryItem[],
    page: 1,
    pageSize: 20,
    loading: false,
    noMore: false
  },

  onLoad() {
    // 强制登录检查
    if (!requireLogin()) {
      return
    }

    this.loadData()
  },

  onReachBottom() {
    if (!this.data.loading && !this.data.noMore) {
      this.setData({ page: this.data.page + 1 })
      this.loadPointsHistory(true)
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
      this.loadPointsInfo(),
      this.loadSignInStatus(),
      this.loadPointsHistory()
    ])
  },

  /**
   * 加载积分信息
   */
  async loadPointsInfo() {
    try {
      const res = await get(API.USER_POINTS)
      if (res.code === 200 || res.code === 0) {
        this.setData({
          totalPoints: res.data.points || 0
        })
      }
    } catch (error) {
      console.error('加载积分信息失败:', error)
    }
  },

  /**
   * 检查今日签到状态
   */
  async loadSignInStatus() {
    try {
      // 通过查询今日积分明细判断是否已签到
      const today = new Date().toISOString().split('T')[0]
      const res = await get(API.POINTS_HISTORY, { page: 1, pageSize: 10 })
      
      if (res.code === 200 || res.code === 0) {
        const records = res.data.records || []
        const hasSignedToday = records.some((item: any) => {
          // 检查createTime是否存在且有效
          if (!item.createTime) return false
          
          const date = new Date(item.createTime)
          // 检查日期是否有效
          if (isNaN(date.getTime())) return false
          
          const itemDate = date.toISOString().split('T')[0]
          return item.type === 1 && itemDate === today
        })
        this.setData({ hasSignedIn: hasSignedToday })
      }
    } catch (error) {
      console.error('检查签到状态失败:', error)
    }
  },

  /**
   * 加载积分明细
   */
  async loadPointsHistory(loadMore: boolean = false) {
    const { page, pageSize, loading } = this.data

    if (loading) return

    this.setData({ loading: true })

    try {
      const res = await get(API.POINTS_HISTORY, { page, pageSize })
      
      if (res.code === 200 || res.code === 0) {
        const data = res.data || {}
        const records = data.records || []
        
        // 格式化数据
        const formattedRecords = records.map((item: any) => ({
          id: item.id,
          title: item.title,
          points: item.points,
          type: item.type,
          time: this.formatDateTime(item.createTime)
        }))

        this.setData({
          historyList: loadMore 
            ? [...this.data.historyList, ...formattedRecords] 
            : formattedRecords,
          noMore: records.length < pageSize,
          loading: false
        })
      }
    } catch (error: any) {
      console.error('加载积分明细失败:', error)
      wx.showToast({
        title: error.msg || error.message || '加载失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  /**
   * 签到
   */
  async signIn() {
    if (this.data.hasSignedIn) {
      wx.showToast({
        title: '今日已签到',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({ title: '签到中...' })
      
      const res = await post(API.USER_SIGN_IN, {})
      
      wx.hideLoading()
      
      if (res.code === 200 || res.code === 0) {
        const points = res.data.points || this.data.signInPoints
        
        wx.showToast({
          title: `签到成功，获得${points}积分`,
          icon: 'success',
          duration: 2000
        })

        // 更新状态
        this.setData({
          hasSignedIn: true,
          totalPoints: this.data.totalPoints + points
        })

        // 刷新积分明细
        setTimeout(() => {
          this.setData({ page: 1, noMore: false })
          this.loadPointsHistory()
        }, 500)
      }
    } catch (error: any) {
      wx.hideLoading()
      wx.showToast({
        title: error.msg || error.message || '签到失败',
        icon: 'none',
        duration: 2000
      })
    }
  },

  /**
   * 格式化日期时间
   */
  formatDateTime(dateString: string): string {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    // 检查日期是否有效
    if (isNaN(date.getTime())) return ''
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    if (dateOnly.getTime() === today.getTime()) {
      return `今天 ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`
    } else if (dateOnly.getTime() === yesterday.getTime()) {
      return `昨天 ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`
    } else {
      return `${date.getMonth() + 1}-${date.getDate()} ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`
    }
  },

  /**
   * 补零
   */
  padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`
  }
})
