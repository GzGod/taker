// main.js
const axios = require('axios');
const { ethers } = require('ethers');
const fs = require('fs');

// 使用动态导入解决chalk的ESM问题
let chalk;
(async () => {
  chalk = (await import('chalk')).default;

  // 从banner.js
  const banner = `
               ╔═╗╔═╦╗─╔╦═══╦═══╦═══╦═══╗
               ╚╗╚╝╔╣║─║║╔══╣╔═╗║╔═╗║╔═╗║
               ─╚╗╔╝║║─║║╚══╣║─╚╣║─║║║─║║
               ─╔╝╚╗║║─║║╔══╣║╔═╣╚═╝║║─║║
               ╔╝╔╗╚╣╚═╝║╚══╣╚╩═║╔═╗║╚═╝║
               ╚═╝╚═╩═══╩═══╩═══╩╝─╚╩═══╝
               我的gihub：github.com/Gzgod
               我的推特：推特雪糕战神@Hy78516012                  \n`;

  // 从logger.js
  const logger = {
      log: (level, message, value = '') => {
          const now = new Date().toLocaleString();

          const colors = {
              info: chalk.green,
              warn: chalk.yellow,
              error: chalk.red,
              success: chalk.blue,
              debug: chalk.magenta,
          };

          const color = colors[level] || chalk.white;
          const levelTag = `[ ${level.toUpperCase()} ]`;
          const timestamp = `[ ${now} ]`;

          const formattedMessage = `${chalk.green("[ Taker-Mine ]")} ${chalk.cyanBright(timestamp)} ${color(levelTag)} ${message}`;

          let formattedValue = ` ${chalk.green(value)}`;
          if (level === 'error') {
              formattedValue = ` ${chalk.red(value)}`;
          } else if (level === 'warn') {
              formattedValue = ` ${chalk.yellow(value)}`;
          }
          if (typeof value === 'object') {
              const valueColor = level === 'error' ? chalk.red : chalk.green;
              formattedValue = ` ${valueColor(JSON.stringify(value))}`;
          }

          console.log(`${formattedMessage}${formattedValue}`);
      },

      info: (message, value = '') => logger.log('info', message, value),
      warn: (message, value = '') => logger.log('warn', message, value),
      error: (message, value = '') => logger.log('error', message, value),
      success: (message, value = '') => logger.log('success', message, value),
      debug: (message, value = '') => logger.log('debug', message, value),
  };

  // 从contract.js
  const provider = new ethers.JsonRpcProvider('https://rpc-mainnet.taker.xyz/');
  const contractAddress = '0xB3eFE5105b835E5Dd9D206445Dbd66DF24b912AB';
  const contractABI = [
      "function active() external"
  ];

  async function 激活挖矿(privateKey) {
      const wallet = new ethers.Wallet(privateKey, provider);
      const contract = new ethers.Contract(contractAddress, contractABI, wallet);
      try {
          const tx = await contract.active();
          await tx.wait();
          logger.info('激活挖矿已确认, 交易哈希:', tx.hash);
          return tx.hash;
      } catch (error) {
          logger.error('激活挖矿错误:', error);
          return null;
      }
  }

  function 读取钱包() {
      if (fs.existsSync("wallets.json")) {
          const data = fs.readFileSync("wallets.json");
          return JSON.parse(data);
      } else {
          logger.error("在 wallets.json 中未找到钱包。程序退出...");
          process.exit(1);
      }
  }

  const API = 'https://lightmining-api.taker.xyz/';
  const axiosInstance = axios.create({
      baseURL: API,
  });

  const 获取 = async (url, token) => {
      return await axiosInstance.get(url, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
  };

  const 发布 = async (url, data, config = {}) => {
      return await axiosInstance.post(url, data, config);
  };

  const 延迟 = (s) => {
      return new Promise((resolve) => setTimeout(resolve, s * 1000));
  };

  async function 签名消息(message, privateKey) {
      const wallet = new ethers.Wallet(privateKey);
      try {
          const signature = await wallet.signMessage(message);
          return signature;
      } catch (error) {
          logger.error("签名消息时出错:", error);
          return null;
      }
  }

  const 获取用户信息 = async (token, retries = 3) => {
      try {
          const response = await 获取('user/getUserInfo', token);
          return response.data;
      }
      catch (error) {
          if (retries > 0) {
              logger.error("获取用户数据失败:", error.message);
              logger.warn(`重试中... (剩余 ${retries - 1} 次尝试)`);
              await 延迟(3);
              return await 获取用户信息(token, retries - 1);
          } else {
              logger.error("多次重试后获取用户数据失败:", error.message);
              return null;
          }
      }
  };

  const 获取随机数 = async (walletAddress, retries = 3) => {
      try {
          const res = await 发布(`wallet/generateNonce`, { walletAddress });
          return res.data;
      } catch (error) {
          if (retries > 0) {
              logger.error("获取随机数失败:", error.message);
              logger.warn(`重试中... (剩余 ${retries - 1} 次尝试)`);
              await 延迟(3);
              return await 获取随机数(walletAddress, retries - 1);
          } else {
              logger.error("多次重试后获取随机数失败:", error.message);
              return null;
          }
      }
  };

  const 登录 = async (address, message, signature, retries = 3) => {
      try {
          const res = await 发布(`wallet/login`, {
              address,
              invitationCode: "EJ0D5",
              message,
              signature,
          });
          return res.data.data;
      } catch (error) {
          if (retries > 0) {
              logger.error("登录失败:", error.message);
              logger.warn(`重试中... (剩余 ${retries - 1} 次尝试)`);
              await 延迟(3);
              return await 登录(address, message, signature, retries - 1);
          } else {
              logger.error("多次重试后登录失败:", error.message);
              return null;
          }
      }
  };

  const 获取矿工状态 = async (token, retries = 3) => {
      try {
          const response = await 获取('assignment/totalMiningTime', token);
          return response.data;
      }
      catch (error) {
          if (retries > 0) {
              logger.error("获取用户挖矿数据失败:", error.message);
              logger.warn(`重试中... (剩余 ${retries - 1} 次尝试)`);
              await 延迟(3);
              return await 获取矿工状态(token, retries - 1);
          } else {
              logger.error("多次重试后获取用户挖矿数据失败:", error.message);
              return null;
          }
      }
  };

  const 开始挖矿 = async (token, retries = 3) => {
      try {
          const res = await 发布(
              `assignment/startMining`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
          );
          return res.data;
      } catch (error) {
          if (retries > 0) {
              logger.error("开始挖矿失败:", error.message);
              logger.warn(`重试中... (剩余 ${retries - 1} 次尝试)`);
              await 延迟(3);
              return await 开始挖矿(token, retries - 1);
          } else {
              logger.error("多次重试后开始挖矿失败:", error.message);
              return null;
          }
      }
  };

  const 主程序 = async () => {
      logger.info(banner)
      const wallets = 读取钱包();
      if (wallets.length === 0) {
          logger.error('', "在 wallets.json 文件中未找到钱包 - 程序退出。");
          process.exit(1);
      }

      while (true) {
          logger.warn('', ` === 服务器可能暂时不可用，程序可能运行较慢 - 请耐心等待 ===`);
          logger.info(`开始处理所有钱包:`, wallets.length);

          for (const wallet of wallets) {
              const nonceData = await 获取随机数(wallet.address);
              if (!nonceData || !nonceData.data || !nonceData.data.nonce) {
                  logger.error(`未能为钱包检索随机数: ${wallet.address}`);
                  continue;
              }

              const nonce = nonceData.data.nonce;
              const signature = await 签名消息(nonce, wallet.privateKey);
              if (!signature) {
                  logger.error(`为钱包签名消息失败: ${wallet.address}`);
                  continue;
              }
              logger.info(`尝试为钱包登录: ${wallet.address}`);
              const loginResponse = await 登录(wallet.address, nonce, signature);
              if (!loginResponse || !loginResponse.token) {
                  logger.error(`为钱包登录失败: ${wallet.address}`);
                  continue;
              } else {
                  logger.info(`登录成功...`);
              }

              logger.info(`尝试检查用户信息...`);
              const userData = await 获取用户信息(loginResponse.token);
              if (userData && userData.data) {
                  const { userId, twName, totalReward } = userData.data;
                  logger.info(`用户信息:`, { userId, twName, totalReward });
                  if (!twName) {
                      logger.error('', `这个钱包 (${wallet.address}) 未绑定 Twitter/X，跳过...`);
                      continue;
                  }
              } else {
                  logger.error(`未能获取钱包的用户数据: ${wallet.address}`);
              }

              logger.info('尝试检查用户矿工状态...')
              const minerStatus = await 获取矿工状态(loginResponse.token);
              if (minerStatus && minerStatus.data) {
                  const lastMiningTime = minerStatus.data?.lastMiningTime || 0;
                  const nextMiningTime = lastMiningTime + 24 * 60 * 60;
                  const nextDate = new Date(nextMiningTime * 1000);
                  const dateNow = new Date();

                  logger.info(`上次挖矿时间:`, new Date(lastMiningTime * 1000).toLocaleString());
                  if (dateNow > nextDate) {
                      logger.info(`尝试为钱包开始挖矿: ${wallet.address}`);
                      const mineResponse = await 开始挖矿(loginResponse.token);
                      logger.info('挖矿响应:', mineResponse)
                      if (mineResponse) {
                          logger.info(`尝试为钱包激活链上挖矿: ${wallet.address}`);
                          const isMiningSuccess = await 激活挖矿(wallet.privateKey)
                          if (!isMiningSuccess) {
                              logger.error(`钱包今天已经开始挖矿或没有足够的taker余额`);
                          }
                      } else {
                          logger.error(`为钱包开始挖矿失败: ${wallet.address}`);
                      }
                  } else {
                      logger.warn(`已经开始挖矿，下次挖矿时间为:`, nextDate.toLocaleString());
                  }
              }
          }

          logger.info("所有钱包已处理，冷却1小时后再次检查...");
          await 延迟(60 * 60); // 1小时延迟
      }
  };

  // 执行主程序
  try {
      await 主程序();
  } catch (error) {
      logger.error("在运行主程序时发生错误:", error);
  }
})();
