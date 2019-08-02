// pages/myclock/myclock.js
import { HTTP } from '../../../utils/http.js'
let http = new HTTP()
import getToken from '../../../utils/getToken.js';
let page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    msg:'',
    zanArr: [],
    formFlag: false,//评论输入框隐藏
    place: '',//评论框的placeholder
    commentValue: '',//评论内容分
    post_id: '',//打卡帖子id
    parent_id: '',//回复给谁的id
    flag: false,
  },

  zan(e) {//点赞
    let { id } = e.currentTarget.dataset;
    let { zanArr, list } = this.data;
    let some = zanArr.some(i => {
      return i == id;
    })
    let { name } = wx.getStorageSync('userData');
    let tl = list.map(i => {
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
      list: tl,
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
              this.data.list.map(i => {
                if (i.id == res.data.post_id) {
                  i.comment.push(res.data)
                }
                return i;
              });
            this.setData({
              list: list,
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let params, url;
    if (options.flag) {//新消息
      // console.log(getApp().globalData.news)
      let { news } = getApp().globalData;
      if(news.length==0){
        this.setData({ msg:'您还没有最新消息'});
        return;
      }
      this.setData({ flag: true, })
      let arr = news.map(item => {
        return item.post_id
      })
      let obj = new Set(arr);//去重
      let array = Array.from(obj);//转数组
      let str = array.join();//转字符串
      params = { post_ids: str };
      url = 'personal/read';
    } else {//我的打卡
      params = { page: 1, size: 20 };
      url = 'personal/punch';
    };
    getToken(tk => {
      http.request({
        url: url,
        token: tk,
        data:params,
        success: res => {
          console.log(res)
          getApp().globalData.news = [];
          wx.removeTabBarBadge({
            index: 2,
          })
          if (res.data.data.length == 0) {
            this.setData({
              msg: "您还没有打卡记录",
              list: '',
            })
          } else {
            let arr = [];
            res.data.data.forEach(i => {
              if (i.zan_status == 1) arr.push(i.id)
            })
            this.setData({
              zanArr: arr,
              list: res.data.data,
              msg: '',
            })
          }
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
    if(page && !this.data.flag){
      page ++;
      getToken(tk => {
        http.request({
          url: 'personal/punch',//我的打卡
          token: tk,
          data: {
            size: 20,
            page: page,
          },
          success: res => {
            console.log(res.data)
            let aRR = res.data.data;
            let { zanArr, list } = this.data
            aRR.forEach(i => {
              if (i.zan_status == 1) zanArr.push(i.id)
            })
            if (aRR.length == 0) {
              page = false;
              this.setData({
                bottom: true,
              })
            }
            this.setData({
              list: list.concat(aRR),
              zanArr: zanArr,
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
      imageUrl: "../../../img/share.jpg",
      path: '/pages/home2/home2',
    }
  }
})