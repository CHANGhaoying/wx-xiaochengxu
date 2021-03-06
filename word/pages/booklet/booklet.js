// pages/booklet/booklet.js

import { HTTP } from '../../utils/http.js'
let http = new HTTP()
import getToken from '../../utils/getToken.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },
  module(e){
    // console.log(e)
    if(e.target.dataset.code == 3){
      wx.navigateTo({
        url: '../sentence/note/note',
      })
    }else{
      wx.navigateTo({
        url: 'wordbook/wordbook',
      })
    }
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