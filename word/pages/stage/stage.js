// pages/stage/stage.js

import { HTTP } from '../../utils/http.js'
let http = new HTTP()
import getToken from '../../utils/getToken.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    moduleFlag: '',
    moduleCode: NaN,
    moduleList:[],
    list: [],
    class_id:'',
    kongMsg:'',
    fromHome:'',//是否来自首页
  },

  //跳转到某咖页面
  toXKwords(e){
    // console.log(e)
    let { id } = e.currentTarget.dataset;
    // console.log(id)
    wx.navigateTo({
      url: `../xkWords/xkWords?id=${id}&mcode=${this.data.moduleCode}&class_id=${this.data.class_id}`,
    })
  },
  
  module(e){//选择模块
    // console.log(e.currentTarget.dataset)
    let { stage } = e.currentTarget.dataset;
    this.setData({
      moduleFlag: true,
      moduleCode: stage,
    })
    getToken(tk => {
      http.request({
        url: 'stage/all',
        token: tk,
        data: {
          class_id: this.data.class_id,
          stage: stage,
        },
        success: res => {
          console.log(res)
          this.setData({
            list: res.data.data,
          })
        }
       });
    })
  },
  toStudy(){
    wx.setStorage({
      key: 'moduleCode',
      data: this.data.moduleCode,
    });
    wx.setStorage({
      key: 'class_id',
      data: this.data.class_id,
    });
    if(this.data.fromHome){//来自首页
      wx.redirectTo({
        url: '../myclass/myclass?class_id=' + this.data.class_id + '&moduleCode=' + this.data.moduleCode,
      })
    }else{
      wx.navigateBack({
        delta: 1,
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  //  console.log(options)
    if (options.fromHome){
     this.setData({
       fromHome: options.fromHome,
     })
    };
    this.setData({
      class_id: options.class_id,
    });
    getToken(tk => {
      http.request({
        url: 'circle/module',//获取阶段全部信息
        token: tk,
        data: {
          class_id: this.data.class_id,
        },
        success: res => {
          console.log(res)
          this.setData({
            moduleList: res.data,
          })
        }
      });
    });
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