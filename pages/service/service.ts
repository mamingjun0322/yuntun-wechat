// pages/service/service.ts
/// <reference path="../../global.d.ts" />
import { get, post } from '../../utils/request'
import { API } from '../../config/api'
import { checkLogin } from '../../utils/auth'

Page({
  data: {
    faqList: [] as any[],
    messageList: [] as any[],
    inputMessage: '',
    scrollToView: '',
    page: 1,
    pageSize: 20,
    loading: false,
    noMore: false,
    // 发送限制配置
    config: {
      dailyLimit: 10,
      todaySent: 0,
      remaining: 10,
      sendInterval: 10,
      lastSendTime: null
    }
  },

  onLoad() {
    if (!checkLogin()) {
      return
    }

    this.loadConfig()
    this.loadFaqList()
    this.loadMessageList()
  },

  /**
   * 加载客服配置
   */
  async loadConfig() {
    try {
      const res = await get(API.SERVICE_CONFIG)
      
      if (res.code === 0 || res.code === 200) {
        this.setData({ config: res.data })
      }
    } catch (error) {
      console.error('加载客服配置失败', error)
    }
  },

  /**
   * 加载常见问题列表
   */
  async loadFaqList() {
    try {
      const res = await get(API.FAQ_LIST)

      if (res.code === 0 || res.code === 200) {
        const list = (res.data || []).map((item: any) => ({
          ...item,
          expanded: false
        }))
        this.setData({ faqList: list })
      }
    } catch (error) {
      console.error('加载常见问题失败', error)
    }
  },

  /**
   * 加载消息列表
   */
  async loadMessageList() {
    if (this.data.loading || this.data.noMore) return

    try {
      this.setData({ loading: true })

      const res = await get(API.SERVICE_MESSAGE_LIST, {
        page: this.data.page,
        pageSize: this.data.pageSize
      })

      if (res.code === 0 || res.code === 200) {
        const list = res.data.records || []
        
        this.setData({
          messageList: this.data.page === 1 ? list : [...this.data.messageList, ...list],
          noMore: list.length < this.data.pageSize
        })

        // 滚动到最新消息
        if (list.length > 0) {
          const lastId = list[list.length - 1].id
          this.setData({ scrollToView: `msg-${lastId}` })
        }
      }
    } catch (error) {
      console.error('加载消息列表失败', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 展开/收起常见问题
   */
  toggleFaq(e: any) {
    const index = e.currentTarget.dataset.index
    const faqList = this.data.faqList
    faqList[index].expanded = !faqList[index].expanded
    this.setData({ faqList })
  },

  /**
   * 输入消息
   */
  inputMessage(e: any) {
    this.setData({ inputMessage: e.detail.value })
  },

  /**
   * 发送消息
   */
  async sendMessage() {
    const message = this.data.inputMessage.trim()
    
    if (!message) {
      wx.showToast({
        title: '请输入消息内容',
        icon: 'none'
      })
      return
    }

    // 检查每日发送限制
    if (this.data.config.remaining <= 0) {
      wx.showModal({
        title: '发送限制',
        content: `今日发送次数已达上限（${this.data.config.dailyLimit}条），请明天再试`,
        showCancel: false
      })
      return
    }

    // 检查发送间隔
    if (this.data.config.lastSendTime) {
      const lastTime = new Date(this.data.config.lastSendTime).getTime()
      const now = new Date().getTime()
      const seconds = Math.floor((now - lastTime) / 1000)
      
      if (seconds < this.data.config.sendInterval) {
        wx.showToast({
          title: `请${this.data.config.sendInterval - seconds}秒后再试`,
          icon: 'none'
        })
        return
      }
    }

    try {
      wx.showLoading({ title: '发送中...' })

      const res = await post(API.SERVICE_SEND_MESSAGE, {
        content: message
      })

      if (res.code === 0 || res.code === 200) {
        // 清空输入框
        this.setData({ inputMessage: '' })

        // 添加消息到列表（乐观更新）
        const newMessage = {
          id: Date.now(),
          content: message,
          type: 1,
          createTime: this.formatTime(new Date())
        }
        
        const messageList = [...this.data.messageList, newMessage]
        this.setData({ 
          messageList,
          scrollToView: `msg-${newMessage.id}`
        })

        wx.showToast({
          title: '发送成功',
          icon: 'success'
        })

        // 刷新配置信息
        this.loadConfig()

        // 延迟刷新列表（获取服务器数据）
        setTimeout(() => {
          this.setData({ page: 1, noMore: false })
          this.loadMessageList()
        }, 1000)
      }
    } catch (error: any) {
      console.error('发送消息失败', error)
      
      // 显示后端返回的错误信息
      const errorMsg = error?.msg || error?.message || '发送失败'
      wx.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
      })
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 格式化时间
   */
  formatTime(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const second = String(date.getSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (!this.data.loading && !this.data.noMore) {
      this.setData({ page: this.data.page + 1 })
      this.loadMessageList()
    }
  }
})
