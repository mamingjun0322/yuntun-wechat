// pages/payment/webview.ts
Page({
  data: {
    paymentUrl: ''
  },

  onLoad(options: any) {
    if (options.url) {
      const paymentUrl = decodeURIComponent(options.url)
      console.log('支付链接:', paymentUrl)
      this.setData({ paymentUrl })
    } else {
      wx.showToast({
        title: '支付链接无效',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  }
})

