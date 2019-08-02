// pages/myclass/myclass.js
import { HTTP } from '../../utils/http.js'
let http = new HTTP()
import getToken from '../../utils/getToken.js'
let page = 1;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tapControlTop: 0,//tap-control 选项卡导航条的顶部高
    scrollTop:-1,//滚动高度
    navTitle:['今日打卡','今日榜单','历史榜单'],
    indexCode: 0,
    Info:[],//页面信息
    status:NaN,//状态
    classId: NaN,
   
    todayList:[],//今日打卡
    rankingList: [],
    errorMsg: '',//提示信息
    moduleCode: NaN,
    stranger: '',//是不是本班学员

    bottom: false,//没有更多时底部提示
    zanArr: [],//如果已赞id存入数组
    formFlag: false,//评论输入框隐藏
    place: '',//评论框的placeholder
    commentValue: '',//评论内容
    post_id: '',//打卡帖子id
    parent_id: '',//回复给谁的id
  },
  tapNav(e) {
    let { index } = e.target.dataset
    this.setData({
      indexCode: index,
    })
    if(index == 0) {
      this.todayClock()
    }else if(index != 0 && this.data.status == 1){
      getToken(tk => {
        http.request({
          url: 'circle/ranking',//班级榜单 今日 历史
          token: tk,
          data: {
            class_id: this.data.classId,
            is_today: index,
            module_code: this.data.moduleCode,
          },
          success: res => {
            console.log(res)
            if(res.data.msg){
              this.setData({
                errorMsg: res.data.msg,
              })
            }
            else{
              this.setData({
                rankingList: res.data,
                errorMsg:'',
              })
            }
          }
        });
      });
    }else if(index != 0 && this.data.status != 1){
      this.setData({
        errorMsg: '您还不是该班级成员。'
      })
    }
  },
  //今日打卡请求
  todayClock() {
    page = 1;
    this.setData({
      bottom: false,
    })
    getToken(tk=>{
      http.request({
        url: 'circle/today_punch',//班级页面今日打卡
        token: tk,
        data: { 
          class_id: this.data.classId,
          page: 1,
          size: 10,
        },
        success: res => {
          console.log(res)
          if (res.data.data.length == 0) {
            this.setData({
              errorMsg: '今日还没有人打卡',
            })
          }else{
            let arr = [];
            res.data.data.forEach(i => {
              if (i.zan_status == 1) arr.push(i.id)
            })
            this.setData({
              todayList: res.data.data,//今日打卡
              errorMsg: '',
              zanArr:arr,
            })
          }
        }
      })
    })
  },
//页面操作判断(不是老师的情况下)
  juage(url) {
    let { status } = this.data;
    if (status == 0){
      wx.showModal({
        title: '提示信息',
        content: '您还不是该班级成员。',
        showCancel: false,
      })
    }else{
      wx.navigateTo({
        url: url+'class_id='+this.data.classId,
      })
    }
  },
  //开始学习，跳转到背单词页面
  toStudy() {
    let str = this.data.moduleCode == 3 ? '../sentence/study/study':'../remember/remember'
    this.juage(str + '?msg=learned/list&moduleCode=' + this.data.moduleCode + '&')
  },
  //跳转到学习阶段(词汇阶段)
  toStage() {
    this.juage('../stage/stage?')
  },

  zan(e) {//点赞
    let { id } = e.currentTarget.dataset;
    let { zanArr, todayList } = this.data;
    let some = zanArr.some(i => {
      return i == id;
    })
    let { name } = wx.getStorageSync('userData');
    let tl = todayList.map(i => {
      if (i.id == id) {
        if (some) {
          i.zan_count--;
          i.zan_people = i.zan_people.filter(item => {
            return item.nick_name != name
          })
        } else {
          i.zan_count++;
          i.zan_people.push({ nick_name: name })
        }
      }
      return i;
    })
    if (some) {
      zanArr = zanArr.filter(i => {
        return i != id;
      })
    } else {
      zanArr.push(id)
    }
    this.setData({
      zanArr: zanArr,
      todayList: tl,
    });
    getToken(tk => {
      http.request({
        url: 'home/zan',//点赞
        token: tk,
        data: { id: id },
        success: res => {
          console.log(res)
        }
      })
    })
  },
  comment(e) {//点击评论
    let { id } = e.currentTarget.dataset;
    this.setData({
      formFlag: true,
      place: '评论',
      post_id: id,
    })
  },
  reply(e) {//点击回复某人
    let { msg } = e.currentTarget.dataset;
    this.setData({
      formFlag: true,
      place: '回复 ' + msg.nick_name,
      post_id: msg.post_id,
      parent_id: msg.id,
    })
  },
  iptCom(e) {//评论/回复输入
    this.setData({
      commentValue: e.detail.value,
    })
  },
  blur() {//失焦
    setTimeout(() => {
      this.setData({
        formFlag: false,//延时隐藏输入框
        commentValue: '', post_id: '', parent_id: '',//清空
      })
    }, 300)
  },
  subCom() {//提交评论/回复
    let { commentValue, post_id, parent_id } = this.data
    if (commentValue.replace(/\s+/g, "")) {
      getToken(tk => {
        http.request({
          url: 'home/comment',
          token: tk,
          data: {
            post_id: post_id,
            content: commentValue,
            parent_id: parent_id || '0',
          },
          success: res => {
            console.log(res)
            let list =
              this.data.todayList.map(i => {
                if (i.id == res.data.post_id) {
                  i.comment.push(res.data)
                }
                return i;
              });
            this.setData({
              todayList: list,
            })
          }
        })
      })
    } else {
      wx.showModal({
        title: '提示信息',
        content: '请输入有效内容',
        showCancel: false,
      })
    };

  },
  getClassInfo(){
    getToken(tk => {
      http.request({
        url: 'circle/info',//班级页面信息
        token: tk,
        data: {
          class_id: this.data.classId,
          module_code: this.data.stranger || this.data.moduleCode,
        },
        success: res => {
          console.log(res)
          this.setData({
            Info: res.data,//班级及用户信息
            status: res.data.status,//状态
          })
        }
      });
    }) 
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    let moduleCode = wx.getStorageSync('moduleCode');
    this.setData({
      classId:options.class_id,
      moduleCode: moduleCode,
    })
    if(options.stranger){//非本班成员
      this.setData({
        stranger: options.stranger,
      })
    }
    
    let that = this;
    var obj = wx.createSelectorQuery();//元素查询 获取某元素信息的对象
    //console.log(obj.select('.tap-control'))
    obj.select('.tap-control').boundingClientRect(function (rect) {//获取
      //console.log(rect.top)
      that.setData({
        tapControlTop: rect.top,//tap-control 选项卡导航条的顶部高
      })
    }).exec();
    this.getClassInfo();
    this.todayClock();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

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
    this.getClassInfo();
    this.todayClock();
    setTimeout(function () {
      // 不加这个方法真机下拉会一直处于刷新状态，无法复位
      wx.stopPullDownRefresh()
    }, 1500)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (page && this.data.indexCode == 0) {
      page++;
      getToken(tk => {
        http.request({
          url: 'circle/today_punch',//今日打卡
          token: tk,
          data: {
            size: 10,
            page: page,
            class_id: this.data.classId,
          },
          success: res => {
            console.log(res.data)
            let aRR = res.data.data;
            if (aRR.length == 0) {
              page = false;
              this.setData({
                bottom: true,
              })
            }
            let arr = this.data.todayList;
            this.setData({
              todayList: arr.concat(aRR)
            })
          }
        });
      })
    }
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
  },
  // 页面滚动
  onPageScroll: function (e) {
    this.setData({
      scrollTop: e.scrollTop,//滚动高度
    })
  }
})