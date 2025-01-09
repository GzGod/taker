# Taker Bot 自动激活每日挖矿

![横幅](image.png)

## 使用前提

- 使用新钱包在这里注册: [https://taker.xyz](https://earn.taker.xyz?start=EJ0D5)
- 绑定 X/Twitter，否则您无法开始挖矿
- 必须获得水龙头奖励（0.001 TAKER）才可以用脚本

## 需求

- **Node.js**: 确保您已安装 Node.js。
- **npm**: 确保您已安装 npm。
- **Taker 余额**: 确保您的 Taker 钱包中有余额。

## 设置

1. 克隆此仓库：
   ```bash
   git clone https://github.com/GzGOd/taker.git
   cd taker
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 在 `wallets.json` 中按照格式填写：
   ```bash
   nano wallets.json
   ```
4. 运行脚本：
   ```bash
   npm run start
   ```
