// pages/class/class.js

import { HTTP } from '../../utils/http.js'
let http = new HTTP()
import getToken from '../../utils/getToken.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classList:{},//班级学员列表
    classInfo: {},//班级信息
    stageList: [],//阶段和组目录
    stageId: "",
    stageIndex: 1,//默认学员部分第一阶段
    flag: false,
  },
  //切换选组页面
  tapFlag() {
    this.setData({
      flag: !this.data.flag,
    })
  },
  //阶段
  tapStage(e) {
    this.setData({
      stageId: e.target.dataset.id,
      stageIndex: e.target.dataset.index,
    })
  },
  //筛选
  filt(e) {
    let groupId = e.target.dataset.id
    let { stageId } = this.data
    this.getList(stageId, groupId);
    this.setData({
      flag: false,
    })
  },
  //排序
  sort(e) {
    //this.getList("", "",sortCode);//后台排序
    this.setData({
      classList: this.data.classList.reverse(),//前台排序
    })
    wx.pageScrollTo({//页面回顶部
         scrollTop: 0
    })
  },
  //获取数据
  getList(stage, group, sort) {
    let class_id = wx.getStorageSync('class_id');
    console.log(class_id)
    getToken(tk => {
      http.request({
        url: 'teacher/status',//班级信息
        token: tk,
        data: {
          stage: stage || '',
          group: group || '',
          sort: sort || '',
          class_id :class_id,
        },
        success: res => {
          console.log(res)
          this.setData({
            classList: res.data.data,
            classInfo: res.data,
          });
          wx.setNavigationBarTitle({//动态改变页头标题
            title: res.data.class_name
          });
        }
      })
    });
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
    this.getList();
    getToken(tk => {
      http.request({
        url: 'teacher/screen',//筛选用的阶段和分组目录
        token: tk,
        success: res => {
          console.log(res)
          this.setData({
            stageList: res.data,
            stageId: res.data[1].id,//默认学员部分第一阶段res.data[1]的id，0是公共部分
          });
          
        }
      })
    })
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
      title: '每日一练，考研英语速学！！！',
      imageUrl: "../../img/share.jpg",
      path: '/pages/home2/home2',
    }
  }
})