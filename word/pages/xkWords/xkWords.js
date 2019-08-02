// pages/xkWords/xkWords.js

import { HTTP } from '../../utils/http.js'
let http = new HTTP()
import getToken from '../../utils/getToken.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    rate: "50%",
    dat: [],
    stageId: '',
    moduleCode: NaN,
    class_id:'',
  },
  //单词本(错题本)
  toBooklet() {
    wx.setStorageSync('err', true);//本地缓存err
    wx.navigateTo({
      url: '../booklet/wordbook/wordbook?err=1'
    })
    
  },
  //重来
  again(e){
    let { stageId, class_id, moduleCode } = this.data;
    let url = moduleCode == 3 ? '../sentence/study/study' : '../remember/remember'
    let {groupid} = e.target.dataset
    wx.navigateTo({
      url: url + '?msg=settlement/again&groupId=' + groupid + '&stageId=' + stageId + '&class_id=' + class_id + '&moduleCode=' + moduleCode,
    });
    wx.setStorage({
      key: 'moduleCode',
      data: moduleCode,
    });
    wx.setStorage({
      key: 'class_id',
      data: class_id,
    });
  },
  //开始学习，跳转到背单词页面
  toStudy() {
    let { class_id, moduleCode } = this.data;
    let url = moduleCode == 3 ? '../sentence/study/study' : '../remember/remember'
    wx.navigateTo({
      url: url+'?msg=learned/list&class_id='+class_id+'&moduleCode='+moduleCode,
    });
    wx.setStorage({
      key: 'moduleCode',
      data: moduleCode,
    });
    wx.setStorage({
      key: 'class_id',
      data: class_id,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      stageId: options.id,
      moduleCode: options.mcode,
      class_id: options.class_id,
    })
    // console.log(options)
  },

  //生命周期函数--监听页面初次渲染完成
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // console.log(this.data.stageId)
    getToken(tk => {
      http.request({
        url: 'stage/detail',//获取阶段基本信息
        token: tk,
        data: { 
          stage: this.data.stageId,
          class_id: this.data.class_id,
        },
        success: res => {
          console.log(res)
          wx.setNavigationBarTitle({//动态改变页头标题
            title: res.data.stage_name
          });
          this.setData({
            dat: res.data,
          })
          //console.log(res.data.stage_name.substr(0,2))
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
      imageUrl: "../../img/share.jpg",
      path: '/pages/home2/home2',
    }
  }
})