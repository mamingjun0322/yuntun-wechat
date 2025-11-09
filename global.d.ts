// 全局类型声明文件
/// <reference types="miniprogram-api-typings" />

declare const wx: WechatMiniprogram.Wx
declare const App: WechatMiniprogram.App.Constructor
declare const Page: WechatMiniprogram.Page.Constructor
declare const Component: WechatMiniprogram.Component.Constructor
declare const getApp: WechatMiniprogram.GetApp
declare const getCurrentPages: WechatMiniprogram.GetCurrentPages
declare const getRegExp: WechatMiniprogram.GetRegExp

interface IAppOption {
  globalData: {
    userInfo: any
    orderType: number
    statusBarHeight: number
    tableNo: string // 扫码获取的桌位号
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback
  handleScanScene?(options: WechatMiniprogram.App.LaunchShowOption): void
  parseSceneParams?(sceneStr: string): Record<string, string>
}

