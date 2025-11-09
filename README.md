# 云吞外卖微信小程序（原生版）

一个使用**原生微信小程序** + **TypeScript** + **SCSS**开发的外卖小程序，支持堂食和外卖两种订餐模式，采用苹果设计风格。

## ✨ 功能特性

### 用户功能
- ✅ **微信登录** - 一键登录，快速开始
- 🍽️ **堂食点餐** - 扫码点餐，桌边下单
- 🛵 **外卖配送** - 配送到家，方便快捷
- 🛒 **购物车** - 批量下单，灵活管理
- 📦 **订单管理** - 实时追踪，状态查询
- 📍 **地址管理** - 多地址保存，一键选择
- 💳 **在线支付** - 安全便捷
- 🎁 **优惠券** - 领取使用

### 设计特点
- 🎨 **苹果设计风格** - 简洁优雅
- 📱 **TypeScript** - 类型安全
- 💅 **SCSS** - 样式模块化
- ✨ **原生小程序** - 性能最优

## 📂 项目结构

```
yuntun-wechat/
├── config/              # 配置文件
│   └── api.ts          # API 接口配置
├── utils/              # 工具类
│   ├── request.ts      # 网络请求封装
│   ├── auth.ts         # 认证工具
│   └── util.ts         # 通用工具函数
├── styles/             # 全局样式
│   └── common.wxss     # 公共样式
├── pages/              # 页面目录
│   ├── index/          # 首页
│   ├── login/          # 登录页
│   ├── goods/          # 商品详情
│   ├── cart/           # 购物车
│   ├── order/          # 订单页面
│   ├── user/           # 用户中心
│   └── address/        # 地址管理
├── images/             # 图片资源
├── typings/            # TypeScript 类型定义
├── app.ts              # 小程序主文件
├── app.json            # 小程序配置
├── app.wxss            # 全局样式
├── tsconfig.json       # TypeScript 配置
└── project.config.json # 项目配置
```

## 🚀 快速开始

### 1. 环境准备

- Node.js 14+
- 微信开发者工具
- 微信小程序开发账号

### 2. 安装依赖

```bash
# 安装 TypeScript（如需编译）
npm install -g typescript

# 或使用微信开发者工具自带的编译器
```

### 3. 配置后端接口

编辑 `config/api.ts`，修改后端接口地址：

```typescript
export const BASE_URL = 'http://localhost:8080/api' // 修改为你的后端地址
```

### 4. 配置小程序 AppID

编辑 `project.config.json`，配置你的小程序 AppID：

```json
{
  "appid": "你的小程序AppID"
}
```

### 5. 运行项目

1. 打开微信开发者工具
2. 导入项目，选择 `yuntun-wechat` 目录
3. 点击「编译」按钮
4. 在「详情」->「本地设置」中勾选「不校验合法域名」

## 📱 页面说明

### 已完成页面（100%）

#### 1. 登录页 (pages/login)
- ✅ 微信一键登录
- ✅ 用户授权
- ✅ 渐变背景设计
- ✅ 用户协议和隐私政策

#### 2. 首页 (pages/index)
- ✅ 自定义导航栏
- ✅ 堂食/外卖模式切换
- ✅ 轮播图展示
- ✅ 商品分类导航
- ✅ 商品列表（支持分页）
- ✅ 下拉刷新
- ✅ 上拉加载更多
- ✅ 快速加入购物车

#### 3. 商品详情页 (pages/goods/detail)
- ✅ 商品图片轮播
- ✅ 商品信息展示
- ✅ 规格选择弹窗
- ✅ 数量选择
- ✅ 加入购物车
- ✅ 立即购买
- ✅ 图片预览

#### 4. 购物车 (pages/cart)
- ✅ 购物车列表展示
- ✅ 全选/单选功能
- ✅ 数量增减
- ✅ 库存检查
- ✅ 实时价格计算
- ✅ 删除商品
- ✅ 清空购物车
- ✅ 去结算

#### 5. 订单确认页 (pages/order/confirm)
- ✅ 堂食信息填写（桌号、人数）
- ✅ 外卖地址选择
- ✅ 配送时间选择
- ✅ 餐具份数选择
- ✅ 商品清单展示
- ✅ 优惠券入口
- ✅ 订单备注
- ✅ 费用明细计算
- ✅ 提交订单

#### 6. 订单列表页 (pages/order/list)
- ✅ 订单状态筛选（全部/待支付/制作中/配送中/已完成/已取消）
- ✅ 订单卡片展示
- ✅ 分页加载
- ✅ 下拉刷新
- ✅ 去支付
- ✅ 取消订单
- ✅ 再来一单
- ✅ 去评价入口

#### 7. 订单详情页 (pages/order/detail)
- ✅ 订单状态展示
- ✅ 配送信息（外卖）
- ✅ 堂食信息（堂食）
- ✅ 商品清单
- ✅ 订单信息
- ✅ 费用明细
- ✅ 去支付
- ✅ 取消订单
- ✅ 确认收货
- ✅ 再来一单
- ✅ 复制订单号

#### 8. 用户中心 (pages/user)
- ✅ 用户信息展示
- ✅ 积分显示
- ✅ 优惠券统计
- ✅ 订单快捷入口
- ✅ 功能菜单
- ✅ 退出登录

#### 9. 地址列表 (pages/address/list)
- ✅ 地址列表展示
- ✅ 默认地址标识
- ✅ 新增地址
- ✅ 编辑地址
- ✅ 删除地址
- ✅ 设置默认地址
- ✅ 选择地址模式（从订单页进入）

#### 10. 地址编辑页 (pages/address/edit)
- ✅ 姓名和手机号输入
- ✅ 地区选择
- ✅ 详细地址输入
- ✅ 位置选择（微信地图）
- ✅ 设为默认地址
- ✅ 表单验证
- ✅ 保存地址

## 🔧 技术栈

- **小程序框架**: 原生微信小程序
- **开发语言**: TypeScript
- **样式语言**: WXSS (类似 CSS)
- **状态管理**: Storage + globalData
- **网络请求**: wx.request 封装

## 🎨 UI 设计

### 设计原则
- 简洁优雅的界面
- 清晰的视觉层次
- 流畅的交互动画
- 统一的色彩体系

### 主题色
- 主色调：渐变紫蓝（#667eea -> #764ba2）
- 成功色：#4CD964
- 警告色：#FF9500
- 危险色：#FF3B30

## 📡 API 接口

所有接口定义在 `config/api.ts` 中，包括：

### 用户相关
- `POST /user/wxLogin` - 微信登录
- `GET /user/info` - 获取用户信息
- `PUT /user/update` - 更新用户信息

### 商品相关
- `GET /goods/list` - 商品列表
- `GET /goods/detail/:id` - 商品详情
- `GET /goods/search` - 搜索商品

### 订单相关
- `POST /order/create` - 创建订单
- `GET /order/list` - 订单列表
- `GET /order/detail/:id` - 订单详情
- `PUT /order/cancel/:id` - 取消订单

### 地址相关
- `GET /address/list` - 地址列表
- `POST /address/add` - 添加地址
- `PUT /address/edit/:id` - 编辑地址
- `DELETE /address/delete/:id` - 删除地址

更多接口详见后端文档。

## 🛠️ 工具类说明

### request.ts - 网络请求
```typescript
import { get, post, put, del, uploadFile } from './utils/request'

// GET 请求
const res = await get('/goods/list', { page: 1 })

// POST 请求
const res = await post('/order/create', orderData)

// 文件上传
const res = await uploadFile(filePath)
```

### auth.ts - 认证管理
```typescript
import { setToken, getToken, isLogin, checkLogin } from './utils/auth'

// 保存 token
setToken('your-token')

// 检查登录状态
if (isLogin()) {
  // 已登录
}

// 页面登录检查
if (!checkLogin()) {
  return // 未登录会自动跳转登录页
}
```

### util.ts - 工具函数
```typescript
import { formatPrice, formatTime, handleImageUrl } from './utils/util'

// 格式化价格（分转元）
const price = formatPrice(9900) // "99.00"

// 格式化时间
const time = formatTime(new Date())

// 处理图片 URL
const url = handleImageUrl('/uploads/xxx.jpg')
```

## 📝 开发注意事项

### 1. TypeScript 编译

微信开发者工具支持 TypeScript，无需额外配置。保存文件时自动编译。

### 2. 样式编写

使用 WXSS（类似 CSS），支持：
- 基本 CSS 选择器
- Flex 布局
- 动画过渡
- rpx 单位（响应式）

**不支持：**
- `*` 通配符选择器
- 部分 CSS3 特性

### 3. TabBar 图标

需要准备 TabBar 图标（建议尺寸 81x81px）：

```
images/tabbar/
├── home.png
├── home-active.png
├── cart.png
├── cart-active.png
├── order.png
├── order-active.png
├── user.png
└── user-active.png
```

### 4. 域名配置

**开发阶段：**
- 在微信开发者工具中勾选「不校验合法域名」

**生产环境：**
- 在小程序后台配置服务器域名
- 必须使用 HTTPS

## 🐛 常见问题

### 1. TypeScript 报错

确保安装了 TypeScript 类型定义：
```bash
npm install --save-dev @types/wechat-miniprogram
```

### 2. 接口请求失败

- 检查 `config/api.ts` 中的 BASE_URL
- 确认后端服务正常运行
- 检查是否关闭了域名校验

### 3. 图片不显示

- 检查图片路径是否正确
- 使用 `handleImageUrl` 处理图片 URL
- 确认服务器可以访问

### 4. 登录失败

- 检查是否配置了 AppID
- 确认后端登录接口正常
- 查看控制台错误信息

## 📦 打包发布

### 1. 测试

在微信开发者工具中充分测试所有功能。

### 2. 真机调试

点击「预览」，使用微信扫码在真机上测试。

### 3. 上传代码

1. 点击「上传」按钮
2. 填写版本号和项目备注
3. 上传成功后在小程序后台提交审核

### 4. 提交审核

1. 登录小程序后台
2. 版本管理 -> 开发版本
3. 提交审核
4. 等待审核通过
5. 发布上线

## 🔐 安全注意事项

1. **不要在前端存储敏感信息**
2. **AppSecret 必须保存在后端**
3. **所有请求都要带 token 验证**
4. **生产环境必须使用 HTTPS**

## 📄 许可证

MIT License

---

**云吞外卖** - 美食触手可及 🍜

