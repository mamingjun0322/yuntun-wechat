// pages/payment/webview.ts
Page({
  data: {
    paymentUrl: '' // 收款码图片地址
  },

  onLoad(options: any) {
    if (options.url) {
      const paymentUrl = decodeURIComponent(options.url)
      console.log('收款码图片地址:', paymentUrl)
      if (paymentUrl && paymentUrl.trim()) {
        this.setData({ paymentUrl })
      } else {
        // URL为空，显示空状态
        this.setData({ paymentUrl: '' })
      }
    } else {
      // 没有URL参数，显示空状态
      this.setData({ paymentUrl: '' })
    }
  },

  // 图片加载失败
  onImageError(e: any) {
    console.error('收款码图片加载失败:', e)
    wx.showToast({
      title: '图片加载失败',
      icon: 'none'
    })
    this.setData({ paymentUrl: '' })
  },

  // 重新加载
  retryLoad() {
    // 返回上一页，让用户重新提交订单
    wx.navigateBack()
  },

  // 保存图片到相册
  saveImage() {
    if (!this.data.paymentUrl) {
      wx.showToast({
        title: '图片加载中',
        icon: 'none'
      })
      return
    }

    wx.downloadFile({
      url: this.data.paymentUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.showToast({
                title: '保存成功',
                icon: 'success'
              })
            },
            fail: () => {
              wx.showToast({
                title: '保存失败',
                icon: 'none'
              })
            }
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        })
      }
    })
  }
})

