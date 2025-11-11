// pages/address/edit.ts
/// <reference path="../../global.d.ts" />
import { get, post, put } from '../../utils/request'
import { API } from '../../config/api'
import { checkLogin } from '../../utils/auth'

Page({
  data: {
    id: 0,
    name: '',
    phone: '',
    region: '',
    address: '',
    latitude: 0,
    longitude: 0,
    isDefault: false,
    isEdit: false
  },

  onLoad(options: any) {
    if (!checkLogin()) {
      return
    }

    if (options.id) {
      this.setData({ 
        id: options.id,
        isEdit: true 
      })
      this.loadAddressDetail()
    }
  },

  /**
   * 加载地址详情
   */
  async loadAddressDetail() {
    try {
      wx.showLoading({ title: '加载中...' })

      const res = await get(`${API.ADDRESS_DETAIL}/${this.data.id}`)

      // 兼容 code: 0 和 code: 200
      if (res.code === 0 || res.code === 200) {
        const data = res.data
        
        // 组合省市区为 region
        let region = ''
        if (data.province || data.city || data.district) {
          region = `${data.province || ''} ${data.city || ''} ${data.district || ''}`.trim()
        } else if (data.region) {
          region = data.region
        }
        
        this.setData({
          name: data.name || '',
          phone: data.phone || '',
          region: region,
          address: data.address || '',
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          isDefault: data.isDefault || false
        })
        
        console.log('地址详情加载成功：', this.data)
      } else {
        wx.showToast({
          title: res.msg || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载地址详情失败', error)
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 输入姓名
   */
  inputName(e: any) {
    this.setData({ name: e.detail.value })
  },

  /**
   * 输入手机号
   */
  inputPhone(e: any) {
    this.setData({ phone: e.detail.value })
  },

  /**
   * 选择地区
   */
  chooseRegion() {
    wx.showToast({
      title: '请手动输入地区',
      icon: 'none'
    })
  },

  /**
   * 输入地区
   */
  inputRegion(e: any) {
    this.setData({ region: e.detail.value })
  },

  /**
   * 输入详细地址
   */
  inputAddress(e: any) {
    this.setData({ address: e.detail.value })
  },

  /**
   * 选择位置
   */
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          address: res.address + res.name,
          latitude: res.latitude,
          longitude: res.longitude
        })
      },
      fail: (err) => {
        if (err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '提示',
            content: '需要获取您的位置信息，请到设置中开启',
            confirmText: '去设置',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting()
              }
            }
          })
        }
      }
    })
  },

  /**
   * 切换默认地址
   */
  toggleDefault(e: any) {
    this.setData({ isDefault: e.detail.value })
  },

  /**
   * 保存地址
   */
  async saveAddress() {
    // 验证
    if (!this.data.name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return
    }

    if (!this.data.phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }

    if (!/^1[3-9]\d{9}$/.test(this.data.phone)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      })
      return
    }

    if (!this.data.region) {
      wx.showToast({
        title: '请输入地区',
        icon: 'none'
      })
      return
    }

    if (!this.data.address) {
      wx.showToast({
        title: '请输入详细地址',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({ title: '保存中...' })

      // 解析省市区（简单处理，用空格分割）
      const regionParts = this.data.region.trim().split(/\s+/)
      const province = regionParts[0] || ''
      const city = regionParts[1] || ''
      const district = regionParts[2] || ''

      const addressData = {
        name: this.data.name,
        phone: this.data.phone,
        province: province,
        city: city,
        district: district,
        address: this.data.address,
        isDefault: this.data.isDefault
      }

      let res
      if (this.data.isEdit) {
        // 编辑地址
        res = await put(`${API.ADDRESS_EDIT}/${this.data.id}`, addressData)
      } else {
        // 新增地址
        res = await post(API.ADDRESS_ADD, addressData)
      }

      // 兼容不同的响应码
      if (res.code === 0 || res.code === 200) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })

        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({
          title: res.msg || '保存失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('保存地址失败', error)
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  }
})

