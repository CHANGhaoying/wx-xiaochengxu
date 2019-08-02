// pages/mine/mine.js
//"navigationStyle": "custom"
import { HTTP } from '../../utils/http.js'
let http = new HTTP()
import getToken from '../../utils/getToken.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //btn: {},//胶囊按钮顶高
    dat:null,
    num: 0,
  },
  myclock(){//我的打卡
    wx.navigateTo({
      url: `myclock/myclock`,
    })
  },
  none(){
    wx.showModal({
      title: '提示信息',
      content: '该功能尚未开放，敬请期待',
      showCancel:false,
    })
  },
  toH5page() {//研线课堂
    wx.navigateTo({
      url: 'h5/h5',
      success: function(res) {
        // console.log(res)
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  toUserClass(){//我的班级
    wx.navigateTo({
      url: 'userClass/userClass',
      success: function (res) {
        // console.log(res)
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  toBook(){//学习记录
    wx.navigateTo({
      url: 'book/book',
      success: function (res) {
        // console.log(res)
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  // readNews(){//读取新消息
  //   wx.navigateTo({
  //     url: `myclock/myclock?flag=1`,
  //   })
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getToken(tk => {
      http.request({
        url: 'personal/info',//传递学习记录
        token: tk,
        success: res => {
          console.log(res)
          this.setData({
            dat: res.data,
          })
        }
      })
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // var btn = wx.getMenuButtonBoundingClientRect()
    // console.log(btn)
    // this.setData({
    //   btn: btn,//胶囊按钮信息
    // })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      num: getApp().globalData.news.length,
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: getApp().globalData.shareTitle,
      imageUrl: "../../img/share.jpg",
      path: '/pages/home2/home2',
    }
  }
})