// pages/sentence/note/note.js
import { HTTP } from '../../../utils/http.js';
let http = new HTTP();
import getToken from '../../../utils/getToken.js';
let page = 1;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nav: ['已学习','收藏'],
    navCode: 0,
    openCode: NaN,
    col: 2,
    sList:[],
    bottom: false,
    kongHide: true,
    scrollTop:0,
  },
  tapNav(e){
    page=1;
    let { index } = e.currentTarget.dataset
    this.setData({
        navCode: index,
        openCode: NaN,
        sList: [],
    });
    let url = index == 0 ? 'activity/asen' : 'activity/csen';
    this.getList(url);
  },
  openSentence(e){
    let {col, index, sid} = e.currentTarget.dataset
    this.setData({
      openCode: index,
      col:col,
    });
    let that = this;
    var obj = wx.createSelectorQuery();//元素查询 获取某元素信息的对象
    obj.select('#scroll'+sid).boundingClientRect(function (rect) {//获取
      // console.log(rect.top)
      wx.pageScrollTo({
        scrollTop: rect.top + that.data.scrollTop - 60
      })
    }).exec();
  },
  closeSentence(e) {
    this.setData({
      openCode: NaN,
    })
  },
  //收藏
  collect(e) {
    let { stage, group, sentence_id, is_collection } = e.target.dataset.msg
    let is_col = this.data.col == 1 ? 2 : 1;
    getToken(tk => {
      http.request({
        url: 'learned/sc',//收藏
        token: tk,
        data: {
          group: group,
          stage: stage,
          sentence_id: sentence_id,
          is_collection: is_col,
        },
        success: res => {
          // console.log(res)
          if (res.statusCode == 200 && this.data.navCode == 1){
            this.setData({
              openCode: NaN,
              sList: [],
            });
            this.getList('activity/csen');
          }
        }
      })
    })
    this.setData({
      col: this.data.col == 2 ? 1 : 2,
    })
  },
  getList(url){
    this.setData({
      kongHide:true,
      bottom: false,
    })
    getToken(tk => {
      http.request({
        url: url,
        token: tk,
        data: {
          page:page || 1,
        },
        success: res => {
          console.log(res)
          if(res.data.data.length>0){
            let arr = this.data.sList.concat(res.data.data)
            this.setData({
              sList: arr
            })
          }else{
            page=false;
          };
          if (this.data.sList.length > 0 && res.data.data.length == 0){
            this.setData({
              bottom: true
            })
          } else if (this.data.sList.length == 0){
            this.setData({
              kongHide: false,
            })
          }
        }
      })
    })
  },
  // 页面滚动
  onPageScroll(e){
    this.setData({
      scrollTop: e.scrollTop
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
    this.getList('activity/asen');//已学习
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
    if(page && !this.data.openCode){
      page++;
      let url = this.data.navCode == 0 ? 'activity/asen' : 'activity/csen';
      this.getList(url);
    }
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
  }
})