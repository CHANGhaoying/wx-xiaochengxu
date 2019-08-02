// pages/booklet/wordbook/wordbook.js
import { HTTP } from '../../../utils/http.js'
let http = new HTTP()
import getToken from '../../../utils/getToken.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nav: ["已学习", "错题本", "收藏"],
    wordClass: ['普通词','同义词','一词多义','熟词僻义'],
    type: 1,
    nav_code: 0,
    wordsHide: true,
    stageHide: true,
    wData: [],//阶段目录数据
    code: NaN,
    groupCode:NaN,
    wordsData: {},
    wordsList: [],//单词列表数据
    stageIndex: 0,
    kongCode: true,
    stage: '',//默认阶段
    scrollTop:0,
    err: '',
    page:1,//错题本的分页页数
    index:0,//被点中的错题单词下标
    bottom: false,//底部没有更多了提示
  },
  //获取信息列表数据
  getList(url, stage) {
    getToken(tk => {
      http.request({
        url: "activity/" + url,
        data: {
          stage: stage,
        },
        token: tk,
        success: res => {
          console.log(res)
          if (res.data.error_code == 50000) {//没有数据时
            this.setData({
              wData: [],//阶段目录数据
              kongCode: false,
            })
          }
          else {//有数据
            this.setData({
              wData: res.data,//阶段目录数据
            })
            this.getWords(url, res.data[0].stage)
          }

        }
      })
    })
  },
  //获取阶段下单词信息
  getWords(url, stage) {
    let url2 = url == 'already' ? 'detail' : url == 'error' ? 'list' : 'info';
    getToken(tk => {
      http.request({
        url: "activity/" + url2,
        data: {
          stage: stage,//默认第一个阶段,
        },
        token: tk,
        success: res => {
          console.log(res)
          if(res.data.word){
            this.setData({
              wordsList: res.data.word,//单词列表数据
              wordsData: res.data.data,
              wordsHide: false,
            })
          }else{
            this.setData({
              kongCode: false,
              wordsHide: false,
            })
          }
        }
      })
    })
  },
  //已学习 错题本 收藏 切换
  tapNav(e) {
    wx.pageScrollTo({//页面回到顶部  
      scrollTop: 0
    })
    let { id } = e.currentTarget.dataset
    let url = id == 0 ? 'already' : 'collection';
    if (id == this.data.nav_code) {
      this.setData({
        wordsHide: !this.data.wordsHide,//单词列表 阶段列表 切换
        stageHide: this.data.wordsHide,
      })
    }else{
      this.setData({
        nav_code: id,
        wordsHide: true,
        stageHide: true,
        code: NaN,
        groupCode: NaN,
        stageIndex: 0,
        kongCode: true,
        wData: [],//阶段页面数据清空
        wordsList: [],//单词页面数据清空，页面恢复空白
        wordsData: {},
      });
      if (id != 1){//非错题本
        this.getList(url);//获取信息列表数据，并单词页面数据
        this.setData({
          type:1,//错题本下拉菜单初始化为普通词选中
          page: 1,
          bottom: false,
        })
      }else{//错题本
        this.getErrWords();
        this.setData({
          err: true,//记录是错题本的状态
        })
      }
    }
  },
  getErrWords(page){//获取错题本单词数据方法
    getToken(tk => {
      http.request({
        url: "activity/list",
        data: {
          type: this.data.type,
          page: page,
        },
        token: tk,
        success: res => {
          console.log(res)
          this.setData({
            wordsHide: false,
            stageHide: true,
          })
          if (res.data.word && this.data.wordsList.length > 0){//如果上拉分页请求有数据
            this.setData({
              page:this.data.page+1,
            })
          };
          let arr;
          if(res.data.word){
            arr = this.data.wordsList.concat(res.data.word);
          } else if (this.data.wordsList.length>0){
            arr = this.data.wordsList;
            this.setData({
              bottom: true,
            })
          };
          if (arr) {
            let { wordClass,type} = this.data
            this.setData({
              wordsData: { stage_name: wordClass[type-1]},
              wordsList: arr,//错题本单词列表数据
              kongCode: true,//空隐藏
            })
          } else {
            this.setData({
              kongCode: false,//空显示
            })
          }
        }
      })
    })
  },
  tapWC(e){//切换 普通词 同义词 一词多义 熟词僻义
    let {type}=e.target.dataset
    this.setData({
      type:type,
      code:NaN,
      groupCode: NaN,
      wordsList:[],
      bottom: false,
    })
    this.getErrWords()
  },
  //阶段切换（大小咖）
  stage(e) {
    // console.log(e.target.dataset.stage)
    this.setData({
      stageIndex: e.target.dataset.id
    })
  },
  //单词列表页面筛选显示
  wordsFilt(e) {
    let n = this.data.nav_code;
    let { stage, group } = e.currentTarget.dataset.msg;
    let url = n == 0 ? 'activity/detail' :'activity/info';
    getToken(tk => {
      http.request({
        url: url,
        token: tk,
        data: {
          stage: stage,
          group: group,
        },
        success: res => {
          console.log(res)
          this.setData({
            wordsHide: false,//显示单词列表 隐藏阶段列表
            stageHide: true,
            wordsList: res.data.word,//单词列表数据
            wordsData: res.data.data,
            code:NaN,
            groupCode: NaN,
          })
        }
      })
    })
    wx.pageScrollTo({//页面回到顶部
      scrollTop: 0
    })
  },


  //点击查看词意展开
  pull(e) {
    // console.log(e)
    let { id,group,index } = e.currentTarget.dataset;
    this.setData({
      code: id,//展开词意
      groupCode:group,
      index: index,
      bottom: false,
    })
    let that = this;
    var obj = wx.createSelectorQuery();//元素查询 获取某元素信息的对象
    obj.select('#scroll' + id).boundingClientRect(function (rect) {//获取
      // console.log(rect)
      wx.pageScrollTo({
        scrollTop: rect.top + that.data.scrollTop - 65,
      })
    }).exec();
  },
  //词意展示收起
  shut() {
    this.setData({
      code: NaN,
      groupCode: NaN,
    })
  },

  //播放音频
  play(e) {
    // console.log(e)
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = true
    innerAudioContext.src = e.target.dataset.src || e.detail;
  },
  toStudy(e){
    getApp().globalData.errData = this.data.wordsList;//把错题单词数据赋值给全局变量
    let {index,page}= this.data;
    wx.navigateTo({
      url: '../../remember/remember?err=1&page='+page+'&index='+index,
    })
  },

  //收藏页取消收藏时的移除
  remove(e) {
    if(this.data.nav_code==2){//收藏页面时
    let { wid } = e.target.dataset
    //前端删除某个单词
    let newList = this.data.wordsList.filter(item => {
      return item.wid != wid
    });
    //console.log(newList)
    if (newList.length == 0) {
      this.getList('collection');
      
      this.setData({
        code: NaN,
        groupCode: NaN,
      })
      return
    }
    this.setData({
      wordsList: newList,
      code:NaN,
      groupCode: NaN,
    })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.err)this.setData({
      err: options.err
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  // 页面滚动
  onPageScroll(e) {
    this.setData({
      scrollTop: e.scrollTop
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      stageHide: true,//下拉菜单 隐藏（初始化）
      code:NaN,
      groupCode: NaN,
      page:1,
      wordsList:[],
      bottom: false,
    })
    if (this.data.err) {
      this.getErrWords()//获取信息列表数据
      this.setData({
        nav_code: 1,
        kongCode: true,
      })
    }else {
      this.getList('already')//获取信息列表数据
      this.setData({
        url: 'already',
        nav_code: 0,
        kongCode: true,
      })
    }
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
    let {page,nav_code,bottom,code} = this.data;
    if(nav_code==1 && !bottom && !code){
      this.getErrWords(page+1)
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