//app.js
import { HTTP } from 'utils/http.js'
const http = new HTTP();
import config from 'config.js';
import getToken from 'utils/getToken.js';
const { api_base_url, appKey } = config;
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    });
    //加入 新版本检测更新 提示用户
    if (wx.canIUse('getUpdateManager')) {//版本是否支持
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {//获取新版本信息
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {//下载好新版本
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，请重启应用。',
              showCancel:false,
              success: function (res) {
                if (res.confirm) {
                  updateManager.applyUpdate()//启用新版本
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {// 新版本下载失败
            wx.showModal({
              title: '新版本提示',
              content: '新版本自动升级失败，请您删除当前小程序，重新搜索打开'
            })
          })
        }
      })
    } else {//升级微信版本
      wx.showModal({
        title: '提示信息',
        content: '当前微信版本过低，无法使用自动更新小程序功能，请升级到最新微信版本。'
      })
    };
    wx.setInnerAudioOption({//音频播放设置项
      obeyMuteSwitch: false,// 是否遵循系统静音开关，默认为 true。当此参数为 false 时，即使用户打开了静音开关，也能继续发出声音。
      //全局生效
    })
  },
  globalData: {
    userInfo:null,
    shareTitle: '每日一练，考研英语速学！！！',
    errData:null,
    myclassID:NaN,
    news:[],
  },
  // getNews:true,
  // fn(num){
  //   getToken(tk => {
  //     if(!tk)return;
  //     wx.request({
  //       url: api_base_url + appKey + 'personal/msg',
  //       header: {
  //         "content-type": 'application/json',
  //         "token": tk,
  //       },
  //       data: {
  //         request_number: num,
  //       },
  //       method: 'POST',
  //       success: res => {
  //         console.log(res)
  //         if (res.statusCode == 200) {
  //           wx.setTabBarBadge({//显示红点数字
  //             index: 2,
  //             text: res.data.length + '',
  //           });
  //           this.globalData.news = res.data;
  //         };
  //         if(res.statusCode != 201 && this.getNews){
  //           this.fn()
  //         }
  //       },
  //       fail: res => {
  //         console.log(res)
  //         this.fn()
  //       }
  //     })
  //   })
  // },
  onShow() {//生命周期回调——监听小程序启动或切前台。
    // this.fn(1);
  },
  onHide() {//生命周期回调——监听小程序切后台。
    // this.fn(2);
    // this.getNews = false;
  }
})