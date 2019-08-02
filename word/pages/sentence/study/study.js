// pages/sentence/study/study.js
import { HTTP } from '../../../utils/http.js';
let http = new HTTP();
import getToken from '../../../utils/getToken.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sentence: [],
    sentenceUnfold: false,
    userTranslation:'',
    val:'',
    col: 2,
    list:[],
    i:0,
    rate: '',
    nextDisabled: false,
    moduleCode:NaN,
    class_id: NaN,
  },
  bindFormSubmit(e) {//提交
    // console.log(e.detail.value)
    let { txt } = e.detail.value;
    if (!txt.replace(/\s+/g, "")) {//正则去空
      wx.showModal({
        title: '提示信息',
        content: '请输入有效内容',
        showCancel: false,
      })
      return;
    };
    let str = this.data.list[this.data.i].son.long_sentence;
    let arr = str.split(' ');
    this.setData({
      sentence: arr,
      sentenceUnfold: true,
      userTranslation: txt,
    })
  },
  
  next() {//下一个 
    this.setData({
      nextDisabled: true,//禁用下一个
    });
    let { group,wid,stage,id } = this.data.list[this.data.i];
    getToken(tk=>{
      http.request({
        url: 'learned/sentence',
        token: tk,
        data: {
          class_id: this.data.class_id,
          group: group,
          stage: stage,
          sentence_id:wid,
          translation: this.data.userTranslation,
        },
        success: res=>{
          console.log(res)
          this.setData({nextDisabled: false});
          let { i, list} = this.data;
          if (res.statusCode == 200) {
            if (list[i].son.currentNumber >= list.count) {//学完
              wx.redirectTo({//去结算页
                url: '../../result/result?groupId=' + list[0].group + '&stageId=' + list[0].stage+'&moduleCode='+this.data.moduleCode,
              })
            }else {//没学完 继续下一个
              this.setData({
                i: i + 1,
                rate: Math.round(list[i + 1].son.currentNumber / list.count * 100) + '%',
                col: list[i + 1].is_collection,//收藏
                sentenceUnfold: false,
                val: '',//清空文本框
              })
            }
          }else{
            this.setData({
              sentenceUnfold: false,
              val: '',//清空文本框
            })
          }
        }
      })
    })
    
  },
  //收藏
  collect(e) {
    // console.log(e)
    let { stage, group, wid, is_collection } = e.target.dataset.msg
    let is_col = this.data.col == 1 ? 2 : 1;
    getToken(tk => {
      http.request({
        url: 'learned/sc',
        token: tk,
        data: {
          group: group,
          stage: stage,
          sentence_id: wid,
          is_collection: is_col,
        },
        success: res => {
          console.log(res)
        }
      })
    })
    this.setData({
      col: this.data.col == 2 ? 1 : 2,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      moduleCode: options.moduleCode,
      class_id: options.class_id,
    });
    getToken(tk => {
      http.request({
        url: options.msg,
        token: tk,
        data: {
          class_id: options.class_id,
          module_code: options.moduleCode,
          group: options.groupId,
          stage: options.stageId,
        },
        success: res => {
          console.log(res)
          this.setData({
            list: res.data,
            rate: Math.round(res.data[0].son.currentNumber / res.data.count * 100) + '%',
            col: res.data[0].is_collection,
          })
        }
      })
    })
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
      imageUrl: "../../../img/share.jpg",
      path: '/pages/home2/home2',
    }
  },
  
})
/*
1. 主语，下划线，字体加粗； 
2. 谓语，波浪线，字体加粗 
3. 宾语，同主语（分为2种情况，宾语或者间接宾语、直接宾语）  
4. 定语，（） 
5. 状语[]  
6. 补语<>
7. 同位语 虚线
*/