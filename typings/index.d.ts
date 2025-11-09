/// <reference types="miniprogram-api-typings" />

// 全局对象声明
declare const wx: WechatMiniprogram.Wx
declare const App: WechatMiniprogram.App.Constructor
declare const Page: WechatMiniprogram.Page.Constructor
declare const Component: WechatMiniprogram.Component.Constructor
declare const getApp: WechatMiniprogram.GetApp
declare const getCurrentPages: WechatMiniprogram.GetCurrentPages
declare const getRegExp: WechatMiniprogram.GetRegExp

// IAppOption 接口定义
interface IAppOption {
  globalData: {
    userInfo: any
    orderType: number // 1-堂食 2-外卖
    statusBarHeight: number
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback
}
