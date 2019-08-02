// pages/home2/home2.js
import { HTTP } from '../../utils/http.js'
let http = new HTTP()
import getToken from '../../utils/getToken.js'
let page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneCover: false,//绑定手机号
    allowCover: true,//授权页面
    phoneNum: NaN,
    verificationCode: "",
    isbindPhone: false,//获取短信验证码操作,默认无
    codeTxt: '获取短信验证码',

    navTitle:['今日打卡','排行榜'],
    indexCode:0,
    tapControlTop: 0,//tap-control 选项卡导航条的顶部高
    scrollTop: -1,//滚动高度
    overflow: 'visible',//页面超出属性
    cityCover: true,//分校城市遮罩显示 隐藏
    cityList:[],//分校城市
    defaultCity:'',//页面默认城市
    classList:[],//该分校所有班级
    todayMsg: '',//今日打卡为空提示
    todayList:[],//今日打卡
    rankingHide: true,//排行榜隐藏
    rankingList: [],
    cityId:'',//分校城市
    bottom: false,//没有更多时底部提示
    zanArr:[],//如果已赞id存入数组
    formFlag: false,//评论输入框隐藏
    place:'',//评论框的placeholder
    commentValue:'',//评论内容分
    post_id:'',//打卡帖子id
    parent_id:'',//回复给谁的id
  },
  //授权-允许
  allow(e) {//button-getUserInfo获取用户信息
    wx.showTabBar();//显示TabBar
    console.log('用户授权了', e.detail.userInfo)
    this.setData({
      allowCover: false,
    })
    //解构 昵称 头像
    let { nickName, avatarUrl } = e.detail.userInfo;
    console.log(nickName)
    wx.setStorage({//(异步)本地缓存 用户昵称和头像
      key: 'userData',
      data: { name: nickName, url: avatarUrl },
    })

    wx.login({
      success: res => {
        let { code } = res
        http.request({
          url: 'token/user',//新用户初次获取token
          data: {
            nick_name: nickName,
            avatar_url: avatarUrl,
            code: code,
          },
          success: res => {
            console.log(res.data)
            if (res.data.token) {
              wx.setStorage({//(异步)本地缓存token值
                key: 'tk_info',
                data: {
                  tk: res.data.token,
                  tk_timestamp: new Date().getTime(),
                }
              })
              this.getData(res.data.token);//调用 分校 今日打卡 排行榜 接口
              this.getClass();//所有班级接口
              if (res.data.mobile_bind == 2) {//未来绑定过
                this.setData({
                  phoneCover: true,
                })
                wx.hideTabBar();//隐藏tabBar
              };
              // getApp().fn(1);//连接新消息实时提醒接口
            }
          }
        })
      }
    })
  },

  //手机号输入
  iptNum(e) {
    this.setData({
      phoneNum: e.detail.value,
    })
  },
  //验证码输入
  iptCode(e) {
    this.setData({
      verificationCode: e.detail.value,
    })
  },
  //获取短信验证码
  verify() {
    this.setData({
      verificationCode: '',//清空验证码框
    })
    console.log(this.data)
    let { phoneNum } = this.data
    let reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;//正则匹配手机号
    if (reg.test(phoneNum)) {//手机号有效
      http.request({
        url: "sms/mobile",//获取短信验证码
        data: {
          mobile: phoneNum,
        },
        success: res => {
          console.log(res)
          if(res.data.sta == 1001){
            wx.showModal({
              title: '提示信息',
              content: res.data.message,
              showCancel:false,
            })
            return;
          }
          else{
            wx.showToast({
              title: '验证码已发送',
              icon: ''
            })
          }
          
          this.setData({
            isbindPhone: true,//点击过获取短信验证码按钮了
          })
          //倒计时60s
          let that = this
          let n = 60
          let tm = setInterval(function () {
            if (n <= 1) {
              clearInterval(tm)
              that.setData({
                codeTxt: '获取短信验证码'
              })
            }
            else {
              that.setData({
                codeTxt: `${n -= 1}s`
              })
            }
          }, 1000)//   倒计时60s
        }
      })
    }
    else {
      wx.showModal({
        title: '错误提示',
        content: '请输入有效手机号',
      })
    }
  },

  //确定绑定手机号
  bindphone() {
    let { verificationCode,
      isbindPhone,
      phoneNum } = this.data
    getToken(tk => {
      if (!isbindPhone) {//未进行获取短信操作
        wx.showModal({
          title: '错误提示',
          content: '请先获取短信验证码',
        })
      }
      else if (verificationCode === "") {
        wx.showModal({
          title: '错误提示',
          content: '请输入验证码',
        })
      }
      else {
        http.request({
          url: "sms/bind",
          data: {
            mobile: phoneNum,
            code: verificationCode,
          },
          token: tk,
          success: res => {
            console.log(res)
            if (res.data.code === 200) {
              wx.showToast({
                title: '绑定成功',
              });
              this.setData({
                phoneCover: false,//隐藏绑定手机号弹框
              });
              wx.showTabBar();//显示TabBar
            }
            else {
              wx.showModal({
                title: '错误提示',
                content: '验证码有误，请核对',
              })
            }
          }
        })
      }
    })
  },

  //分校城市遮罩显示
  showCity() {
    // getApp().fn(2);
    // getApp().getNews = false;
    wx.hideTabBar();//隐藏tabBar
    this.setData({
      overflow: 'hidden',//页面超出部分隐藏
      cityCover: false,//分校城市遮罩显示
    })
  },
  //分校城市遮罩隐藏
  hideCity() {
    wx.showTabBar();//显示tabBar
    this.setData({
      overflow: 'visible',//页面超出部分显示
      cityCover: true,//分校城市遮罩隐藏
    })
  },
  tapNav(e) {
    let { index } = e.target.dataset;
    this.setData({
      indexCode: index,
      rankingHide: index == 1 ? false : true,
    })
  },
  //选择分校城市
  selectCity(e) {
    let { city, unid } = e.target.dataset
    page=1;
    this.setData({
      defaultCity: city,
      cityId: unid,
      bottom:false,
    });
    this.hideCity();
    this.getClass(unid);//获取某分校班级
    getToken(tk=>{//选择分校城市,切换对应分校的打卡情况
      this.getData(tk,true)
    })
  },

//获取分校班级
  getClass(unid) {
    getToken(tk => {
      http.request({
        url: 'home/unitclass',//班级
        token: tk,
        data: { id: unid },
        success: res => {
          // console.log(res.data)
          this.setData({
            classList: res.data,//该分校所有班级
          })
        }
      })
    })
  },
  //调用 分校 今日打卡 排行榜 接口
  getData(tk, stop) {
    page = 1;
    this.setData({
      bottom: false,
    })
    http.request({
      url: 'home/today_punch',//今日打卡
      token: tk,
      data: {
        size: 30,
        page: 1,
        id: this.data.cityId,
      },
      success: res => {
        console.log(res)
        let arr = [];
        res.data.data.forEach(i => {
          if (i.zan_status == 1) arr.push(i.id)
        })
        this.setData({
          todayList: res.data.data,
          zanArr: arr,
        })
      }
    });
    http.request({
      url: 'home/ranking',//排行榜
      token: tk,
      data: {
        id: this.data.cityId,
      },
      success: res => {
        console.log(res.data)
        this.setData({
          rankingList: res.data,
        })
      }
    });
    if (stop) return;//切换分校只执行以上今日打卡 排行榜接口更新（断点）
    http.request({
      url: 'home/school',//分校城市
      token: tk,
      success: res => {
        console.log(res.data)
        getApp().globalData.myclassID = res.data.class_id
        let unitname;
        let cid = this.data.cityId ? this.data.cityId : res.data.unid; 
        res.data.data.forEach(i=>{
          if (i.unid == cid) {
            unitname = i.unitname
          };
        })
        this.setData({
          cityList: res.data.data,
          defaultCity: unitname,
        });
        if (res.data.mobile_bind == 2){
          this.setData({
            phoneCover: true,
          });
          wx.hideTabBar();//隐藏tabBar
        }
      }
    }); 
  },
  toMyClass(e){
    let { class_id } = e.currentTarget.dataset;
    getToken(tk=>{
      http.request({
        url:'circle/verify',//验证用户是不是这个班的成员
        token: tk,
        data: { class_id: class_id},
        success: res=>{
          // console.log(res)
          let classId = wx.getStorageSync('class_id');
          let moduleCode = wx.getStorageSync("moduleCode");
          let url;
          if (!res.data.isValid){
            url = '../myclass/myclass?stranger=1&'
          }else if(classId == class_id) {
            url = moduleCode ? '../myclass/myclass?' : '../stage/stage?fromHome=1&';
          } else {
            url = '../stage/stage?fromHome=1&';
          }
          // console.log(class_id, moduleCode, classId)
          wx.navigateTo({
            url: url + 'class_id=' + class_id,
          })
        }
      })
    })
  },
  zan(e) {//点赞
    let { id } = e.currentTarget.dataset;
    let { zanArr, todayList} = this.data;
    let some = zanArr.some(i=>{
      return i == id;
    })
    let {name} = wx.getStorageSync('userData');
    let tl = todayList.map(i=>{
      if (i.id == id){
        if(some){
          i.zan_count --;
          i.zan_people = i.zan_people.filter(item=>{
            return item.nick_name != name
          })
        }else{
          i.zan_count++;
          i.zan_people.push({nick_name: name})
        }
      }
      return i;
    })
    if(some){
      zanArr = zanArr.filter(i => {
        return i != id;
      })
    }else{
      zanArr.push(id)
    }
    this.setData({
      zanArr: zanArr,
      todayList: tl,
    });
    getToken(tk=>{
      http.request({
        url:'home/zan',//点赞
        token:tk,
        data:{id:id},
        success: res=>{
          console.log(res)
        }
      })
    })
  },
  comment(e){//点击评论
    let { id } = e.currentTarget.dataset;
    this.setData({
      formFlag:true,
      place: '评论',
      post_id:id,
    })
  },
  reply(e){//点击回复某人
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
  blur(){//失焦
   setTimeout(()=>{
    this.setData({
      formFlag: false,//延时隐藏输入框
      commentValue: '', post_id: '', parent_id: '',//清空
    })
   },300) 
  },
  subCom(){//提交评论/回复
    let {commentValue,post_id,parent_id} = this.data
    if (commentValue.replace(/\s+/g, "")){
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
            this.data.todayList.map(i=>{
              if(i.id == res.data.post_id){
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
    }else{
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
    let token = wx.getStorageSync('tk_info').tk
    // console.log(token)
    if (token) {
      this.setData({
        allowCover: false,//隐藏授权页面
      })
    } else {
      wx.hideTabBar();//隐藏tabBar
    }
    this.getClass(this.data.cityId);//所有班级接口
    getToken(tk => {
      if (tk) {
        this.getData(tk);//调用 分校 今日打卡 排行榜 接口
      }
    });
    let that = this;
    var obj = wx.createSelectorQuery();//元素查询 获取某元素信息的对象
    //console.log(obj.select('.tap-control'))
    obj.select('.tap-control').boundingClientRect(function (rect) {//获取
      that.setData({
        tapControlTop: rect.top,//tap-control 选项卡导航条的顶部高
      })
    }).exec(); 
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
    getToken(tk => {
      this.getData(tk,true);//调用 分校 今日打卡 排行榜 接口
    });
    setTimeout(function () {
      // 不加这个方法真机下拉会一直处于刷新状态，无法复位
      wx.stopPullDownRefresh()
    }, 1500)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (page && this.data.indexCode == 0){
      page ++;
      getToken(tk => {
        http.request({
          url: 'home/today_punch',//今日打卡
          token: tk,
          data: {
            size: 30,
            page: page,
            id: this.data.cityId || '1',
          },
          success: res => {
            let aRR = res.data.data;
            let { zanArr, todayList} = this.data
            aRR.forEach(i => {
              if (i.zan_status == 1) zanArr.push(i.id)
            })
            console.log(res.data)
            
            if(aRR.length == 0){
              page = false;
              this.setData({
                bottom: true,
              })
            } 
            this.setData({
              todayList: todayList.concat(aRR),
              zanArr:zanArr,
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
  },
  // onTabItemTap(item) {//底栏点击切换
  //   console.log(item)
  //   console.log(item.pagePath)
  //   console.log(item.text)
  // }
})