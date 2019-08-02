// pages/remember/remember.js

import { HTTP } from '../../utils/http.js'
let http = new HTTP()
import getToken from '../../utils/getToken.js';
let ctrl = 0;
let optsArr = [];//答案数组
Page({
  //页面的初始数据
  data: {
    hide: false,
    list: null,
    i: 0,
    rate: '',
    dataId: NaN,
    col: 2,//是否收藏
    disabled: false,//按钮是否禁用
    nextDisabled: false,
    url:'',//跳转结算页再点下一组跳学习页面用的路径
    ctrlCode: 1,//答题1秒延迟执行判断值
    type: NaN,
    useropts: [],
    moduleCode:NaN,
    class_id:NaN,
    err:'',//来自错题本的判断值
    page: 1,//错题本分页的页数
  },
  //选择答案
  answer(e) {//1、普通类型；2、同义词；3、一词多义；4、熟词僻义
    let { answer, id } = e.target.dataset
    let find = optsArr.some(item => {
      return item == id
    })
    if (this.data.type != 4) {//非熟词僻义(单选)
      if (optsArr.length == 0) optsArr.push(id)
      this.setData({
        disabled: true,
        ctrlCode: 1,
      })
    }else{
      if (!find && optsArr.length < 2) optsArr.push(id)
      if (optsArr.length >= 2){
         this.setData({
          ctrlCode: 1,
        })
      }else {
        this.setData({
          ctrlCode: 0,
        });
        setTimeout(()=>{
          if(optsArr.length==1){
            wx.showModal({
              title: '提示信息',
              content: '这是双选题，再选一个 ~',
              showCancel: false,
            })
          }
        },3000)
      }
    };
    this.setData({
      useropts: optsArr,
    });
    if(this.data.ctrlCode == 1) {
      setTimeout(()=> {
        this.setData({
          hide: true
        })
      },1000)
    }
  },
  //下一个
  next() {
    optsArr=[];//初始化
    ctrl ++;
    let {useropts} = this.data;
    this.setData({
      disabled: false,//答题按钮取消禁用
      nextDisabled: true,//禁用下一个
      useropts: [],//答题按钮初始化
    });
    let { group,stage,wid } = this.data.list[this.data.i];
    if (useropts.length==0 || ctrl != 1) {//连续暴击答题或下一个按钮
      ctrl = 0;//控制器归0
      this.setData({
        hide: false,//显示答题页
        ctrlCode: 0,//阻止800毫秒延迟执行
        nextDisabled: false,//取消禁用下一个
      })
      return;
    }
    getToken(tk=>{
      http.request({
        url: 'learned/click',//传递学习记录
        token: tk,
        data: {
          group: group,
          stage: stage,
          word_id: wid,
          useropt: useropts,
          class_id: this.data.class_id || getApp().globalData.myclassID,
        },
        success: res => {
          console.log(res)
          ctrl=0;//控制器归0
          let {i,list} = this.data;//解构单词数据列表下标 和列表
          this.setData({
            nextDisabled: false,//取消禁用下一个
            hide: false,//显示答题页隐藏‘下一个’页
          });
          if(this.data.err){//学习错题本内容
            if(i>=list.length-1){//最后一个
              http.request({
                url:'activity/list',//错题本接口下一页
                token:tk,
                data:{
                  type: this.data.type,
                  page: this.data.page+1,
                },
                success: res=>{
                  console.log(res)
                  if (res.data.word){
                    this.setData({
                      page: this.data.page + 1,
                      list: res.data.word,
                      i: 0,
                    });
                  }else{
                    this.goHome('这一波错题已练完')
                  }
                }
              })
            }else{
              this.setData({
                i: i + 1,
                col: list[i + 1].is_collection,//收藏
              })
            }
            return
          }
          // 以下是正常学习↓
          if (res.statusCode==200){
            if (list[i].son.currentNumber >= list.count) {//学完
              wx.redirectTo({//去结算页
                url: '../result/result?groupId=' + list[0].group + '&stageId=' + list[0].stage +'&moduleCode='+this.data.moduleCode,
              })
            }else{//没学完 继续下一个
              this.setData({
                i: i+1,
                rate: Math.round(list[i+1].son.currentNumber / list.count * 100) + '%',
                col: list[i+1].is_collection,//收藏
              })
            }
          }else{
            this.setData({
              rate: Math.round(list[i].son.currentNumber / list.count * 100) + '%',
              col: list[i].is_collection,//收藏
            })
          }
        }
      })
    })
  
  },
  //收藏
  collect(e){
    let { stage, group, wid} = e.target.dataset.msg
    let is_col = this.data.col == 1 ? 2 : 1;
    getToken(tk=>{
      http.request({
        url: 'learned/collection',
        token: tk,
        data:{
          group: group,
          stage: stage,
          word_id: wid,
          is_collection: is_col,
        },
        success: res => {
          console.log(res)
        }
      })
    })
    this.setData({
      col: is_col,
    })
  },
  //播放
  play(e) {
    console.log(e)
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = true;//播放
    innerAudioContext.src = e.target.dataset.src || e.detail;
  },
  //提示返回
  goHome(str){
    wx.showModal({
      title: '温馨提示',
      content: str,
      showCancel: false,
      success: res => {
        wx.navigateBack();//返回上一页
      }
    })
  },

  //* 生命周期函数--监听页面加载 
  onLoad: function (options) {
    // console.log(options)
    let dataSet = res => {
      this.setData({
        list: res.data,
        rate: Math.round(res.data[0].son.currentNumber / res.data.count * 100) + '%',
        col: res.data[0].is_collection
      })
    };
    
    let { errData } = getApp().globalData;//错题本单词数据
    if (options.err){//来自错题本
      console.log(errData)
      this.setData({
        list: errData,
        err: true,
        type: errData[0].type,
        col: errData[0].is_collection,
        page: Number(options.page),
        i: Number(options.index),
      })
      return
    }
    //以下是正常学习↓
    this.setData({
      moduleCode: options.moduleCode,
      class_id: options.class_id,
    });
    getToken(tk => {
      http.request({
        url: options.msg,
        token: tk,
        data: {
          group: options.groupId || '',
          class_id: options.class_id,
          stage: options.stageId || '',
          module_code: options.moduleCode,//list接口
        },
        success: res => {
          console.log(res);
          if (res.data.msg) {
            this.goHome(res.data.msg)
          }else {
            dataSet(res)
          }
          this.setData({
            type: res.data[0].type
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
    optsArr = [];//初始化optsArr
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