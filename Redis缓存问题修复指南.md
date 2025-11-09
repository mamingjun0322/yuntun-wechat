# 🔧 Redis 缓存反序列化问题修复指南

## 🔍 问题现象

### 错误信息
```
Could not read JSON: Unexpected token (START_ARRAY), expected VALUE_STRING
```

### 影响接口
- `/api/category/list` - 分类列表 ❌
- `/api/shop/banner` - 轮播图列表 ❌

### 影响范围
小程序首页无法加载分类和轮播图数据

---

## ✅ 解决方案

### 方案 1：清除 Redis 缓存（推荐）⭐

这是**最简单快速**的解决方法！

#### Windows 系统

1. **打开命令提示符（CMD）**
   ```cmd
   # 进入 Redis 安装目录（根据实际路径调整）
   cd C:\Program Files\Redis
   
   # 连接 Redis
   redis-cli.exe
   
   # 清除所有缓存
   FLUSHDB
   
   # 退出
   exit
   ```

2. **或者清除特定 key**
   ```cmd
   redis-cli.exe
   DEL category:list
   DEL banner:list
   DEL shop:info
   exit
   ```

#### Linux/Mac 系统

```bash
# 连接 Redis
redis-cli

# 清除所有缓存
FLUSHDB

# 或清除特定 key
DEL category:list
DEL banner:list

# 退出
exit
```

#### 使用 Redis 桌面管理工具

如果你安装了 Redis 桌面管理工具（如 Another Redis Desktop Manager、RedisInsight）：

1. 打开工具连接到 Redis
2. 找到 `category:list` 和 `banner:list` 这两个 key
3. 右键删除

---

### 方案 2：重启后端服务

1. **停止后端应用**
   - 在 IDEA 中点击停止按钮
   - 或者 `Ctrl + F2`

2. **清除 Redis（执行方案 1）**

3. **重新启动后端应用**
   - 点击运行按钮
   - 或者 `Shift + F10`

---

### 方案 3：修改后端代码（如果问题持续）

如果清除缓存后问题仍然存在，可能需要修改 Redis 序列化配置。

#### 找到 `RedisConfig.java`

在 `yuntun-java/src/main/java/com/tsuki/yuntun/java/config/RedisConfig.java`

#### 检查并修改配置

```java
@Configuration
public class RedisConfig {
    
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        
        // 使用 StringRedisSerializer 作为 key 的序列化器
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        
        // 使用 Jackson2JsonRedisSerializer 作为 value 的序列化器
        Jackson2JsonRedisSerializer<Object> serializer = 
            new Jackson2JsonRedisSerializer<>(Object.class);
            
        ObjectMapper mapper = new ObjectMapper();
        mapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        
        // 关键：禁用类型信息（推荐）
        // mapper.activateDefaultTyping(...) // 注释掉这行
        
        serializer.setObjectMapper(mapper);
        
        template.setValueSerializer(serializer);
        template.setHashValueSerializer(serializer);
        
        template.afterPropertiesSet();
        return template;
    }
}
```

---

## 🚀 完整操作步骤

### 步骤 1：清除 Redis 缓存

```bash
redis-cli
FLUSHDB
exit
```

### 步骤 2：重启后端

在 IDEA 中：
1. 停止运行 ⏹️
2. 重新运行 ▶️

### 步骤 3：测试小程序

1. **清除小程序缓存**
   - 微信开发者工具 → 清缓存 → 全部清除

2. **重新编译**
   - 点击"编译"按钮

3. **刷新首页**
   - 下拉刷新
   - 应该能正常看到分类和轮播图了

---

## 📊 问题原因分析

### 为什么会出现这个错误？

1. **序列化格式不匹配**
   - Redis 中存储的数据格式与当前代码期望的不同
   - 可能是之前用不同的序列化器存储的

2. **Jackson 类型信息**
   - `activateDefaultTyping` 会在 JSON 中添加类型信息
   - 如果配置改变但缓存未清除，会导致反序列化失败

3. **数据结构变化**
   - 如果修改了 VO 类的结构但缓存未更新

---

## ✅ 前端优化

已在前端添加了更好的错误处理：

### 优化内容

1. **兼容多种返回码**
   ```typescript
   // 兼容 code: 200 和 code: 0
   if (res.code === 200 || res.code === 0) {
     // 处理数据
   }
   ```

2. **错误时返回空数组**
   ```typescript
   catch (error) {
     console.error('加载失败', error)
     // 避免页面崩溃
     this.setData({ bannerList: [] })
   }
   ```

3. **优雅降级**
   - 即使后端出错，首页也不会白屏
   - 会显示空的分类和轮播图区域
   - 商品列表仍然可以正常加载

---

## 🎯 验证修复

### 检查后端日志

修复后，后端日志应该**不再出现**这样的错误：
```
❌ Could not read JSON: Unexpected token (START_ARRAY)
```

### 检查小程序

1. **首页能正常显示**
   - ✅ 轮播图正常显示
   - ✅ 分类列表正常显示
   - ✅ 商品列表正常显示

2. **下拉刷新正常**
   - ✅ 可以刷新数据
   - ✅ 没有报错提示

---

## 🔐 预防措施

### 1. 清除缓存时机

遇到以下情况时应清除 Redis 缓存：
- 修改了 VO 类的结构
- 修改了 Redis 序列化配置
- 数据格式发生变化
- 遇到序列化/反序列化错误

### 2. 配置建议

**推荐的 Redis 配置：**
- Key: `StringRedisSerializer`
- Value: `GenericJackson2JsonRedisSerializer`（更灵活）
- 或者: `Jackson2JsonRedisSerializer`（不启用类型信息）

### 3. 缓存策略

考虑添加缓存版本号：
```java
String cacheKey = "category:list:v1";  // 添加版本号
```

版本变化时自动失效旧缓存。

---

## 💡 总结

### 问题
- Redis 缓存数据格式与代码期望不匹配
- 导致反序列化失败

### 解决方案
1. ✅ **立即执行**：清除 Redis 缓存（推荐）
2. ✅ **根本解决**：调整 Redis 序列化配置
3. ✅ **前端优化**：添加错误处理和降级方案

### 执行命令
```bash
# 最简单的解决方法（30秒搞定）
redis-cli
FLUSHDB
exit

# 然后重启后端
```

---

## 📞 还有问题？

如果按照以上步骤操作后问题仍然存在：

1. 检查 Redis 是否正在运行
   ```bash
   redis-cli ping
   # 应该返回 PONG
   ```

2. 检查后端配置
   - `application.yml` 中的 Redis 配置是否正确

3. 查看完整的后端错误日志
   - 确认具体是哪个序列化器出了问题

---

**🎉 现在去执行 `redis-cli` → `FLUSHDB` → 重启后端 → 重新编译小程序！**

