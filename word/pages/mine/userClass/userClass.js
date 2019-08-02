// pages/mine/userClass/userClass.js
import { HTTP } from '../../../utils/http.js'
let http = new HTTP()
import getToken from '../../../utils/getToken.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myclass:[],
    msg: '',
  },
  toClass(e) {
    let { class_id } = e.currentTarget.dataset
    let classId = wx.getStorageSync('class_id');
    let moduleCode = wx.getStorageSync("moduleCode");
    let url;
    if (classId == class_id) {
      url = moduleCode ? '../../myclass/myclass?' : '../../stage/stage?fromHome=1&';
    } else {
      url = '../../stage/stage?fromHome=1&';
    }
    // console.log(class_id, moduleCode, classId)
    wx.navigateTo({
      url: url + 'class_id=' + class_id,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    getToken(tk => {
      http.request({
        url: 'personal/class',
        token: tk,
        success: res => {
          console.log(res)
          if (res.data.msg){
            this.setData({
              msg: '您还未加入任何班级',
              myclass: [],
            })
          }else{
            this.setData({
              myclass: res.data,
              msg: '',
            })
          }
        }
      })
    })
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
      imageUrl: "../../../img/share.jpg",
      path: '/pages/home2/home2',
    }
  },
})