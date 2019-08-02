// pages/allow/allow.js
import {HTTP} from '../../utils/http.js'
let http = new HTTP()
import getToken from '../../utils/getToken.js'
import anim from '../../utils/animation.js'//小手动画公共方法
let newDat = new Date()
Page({
  /** 页面的初始数据*/
  data: {
    coverPhone: false,//false
    coverAllow: true,
    phoneNum: NaN,
    verificationCode: "",
    isbindPhone: false,//获取短信验证码操作,默认无
    codeTxt: '获取短信验证码',
    info: {},
    kong: [],//日期前的空格
    year: '',//new Date().getFullYear(),//年份
    month: '',//new Date().getMonth(),//月份
    days: [],//某月的总天数
    calendar: [],//存放后台时间记录
    isTeacher: true,
    animationData: {},//动画
    dianjiFlag: false,//小手隐藏
  },

  //获取日历==>渲染页面
  getDate(dat) {
    //let dat = new Date()
    let year = dat.getFullYear()
    let month = dat.getMonth()
    let date = dat.getDate()
    //获取本月+1(即下月)的上个月(即本月)最后一天(如2019-4-30)，再获取天数30
    //new Date(年,月,日).getDate() 获取某年某月某日的日期，当参数日为0时获取上个月最后一天的日期
    //那么获取当月最后一天也就是想知道当月一共有几天，就用(当年,当月+1(下月),0)来获取
    let days = new Date(year, month + 1, 0).getDate();//总天数
    //获取当前月第一天 是 周几 
    let day = new Date(year, month, 1).getDay()
    let arr = [], Arr = []
    for (let i = 1; i <= day; i++) {
      arr.push(i)
    }
    for (let i = 0; i < days; i++) {
      Arr[i] = false
    }
    this.setData({
      kong: arr,
      days: Arr,
      year: year,
      month: month,
    })
  },
  //下个月
  next() {
    newDat.setMonth(newDat.getMonth()+1); //当点击下一个月时 对当前月进行加1;
    this.getDate(newDat)
    this.handleDate(this.data)
  },
  //上个月
  prev() {
    newDat.setMonth(newDat.getMonth() - 1); //与下一月 同理 
    this.getDate(newDat)
    this.handleDate(this.data)
  },
  //那段学习单词的日子
  handleDate(data){
    let { year, month, days, calendar} = data
    calendar.forEach(item => {
      if (item.split('-')[0] == year && item.split('-')[1] == month + 1){
        let n = Number(item.split('-')[2])
        days[n-1] = true
      }
    })
    this.setData({
      days: days
    })
  },
  //授权-允许
  allow(e) {//button-getUserInfo获取用户信息
    console.log('用户授权了', e.detail.userInfo)
    this.setData({
      coverAllow: false,
      coverPhone: true,
    })
    //解构 昵称 头像
    let { nickName, avatarUrl } = e.detail.userInfo;
    console.log(nickName)
    wx.setStorage({//(异步)本地缓存 用户昵称和头像
      key: 'userData',
      data: {name: nickName, url: avatarUrl},
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
              if (res.data.token){
                wx.setStorage({//(异步)本地缓存token值
                  key: 'tk_info',
                  data: {
                    tk: res.data.token,
                    tk_timestamp: new Date().getTime(),
                  }
                })
                this.getInfo(res.data.token)//从后台获取用户信息
                if (res.data.mobile_bind == 1) {
                  this.setData({
                    coverPhone: false,
                  })
                }
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
    let{phoneNum}= this.data
    let reg = /^[1][3,4,5,7,8][0-9]{9}$/;//正则匹配手机号
    if (reg.test(phoneNum)){//手机号有效
      http.request({
        url: "sms/mobile",//获取短信验证码
        data: {
          mobile: phoneNum,
        },
        success: res => {
          console.log(res)
          wx.showToast({
            title: '验证码已发送',
            icon: ''
          })
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
    else{
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

    
    if (!isbindPhone){//未进行获取短信操作
      wx.showModal({
        title: '错误提示',
        content: '请先获取短信验证码',
      })
    }
    else if (verificationCode === ""){
      wx.showModal({
        title: '错误提示',
        content: '请输入验证码',
      })
    }
    else{
      http.request({
        url: "sms/bind",
        data: {
          mobile: phoneNum,
          code: verificationCode,
        },
        token: tk,
        success: res => {
          console.log(res)
          if(res.data.code === 200){
            wx.showToast({
              title: '绑定成功',
            });
            this.setData({
              coverPhone: false,//隐藏绑定手机号弹框
            });
            wx.setStorage({
              key: 'isbind',
              data: 'true',
            });
            getToken(tk => {//获取有效token的公用方法
              if (tk) this.getInfo(tk)//从后台获取用户信息
            })
          }
          else{
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
  //从后台获取用户信息
  getInfo(tk) {
    http.request({
      url: 'index/info',
      token: tk,
      success: res => {
         console.log(res.data)
        let { calendar } = res.data//学习过的日期数组
        this.setData({
          info: res.data,
          calendar: calendar,
        })
        calendar && this.handleDate(this.data)//处理日期记录，显示到页面日历上
        if (res.data.is_teacher == 0){
          this.setData({
            isTeacher: false,//不是学员和老师禁止学习
          })
        }
        else{
          this.setData({
            isTeacher: true,//是学员或老师
          })
        }
      }
    })
  },
  //跳转到学习阶段(词汇阶段)
  toStage() {
    let flag = this.data.info.is_teacher;//是否学员
    wx.navigateTo({
      url: `../stage/stage?teacher_student=${flag}&firstTime=${code}`
    });
    if (flag == 0){//非学员
      wx.setStorageSync("firstCode", 1)//非学员点过阶段选择了，记录到本地
    }
  },
  
  
  //开始学习，跳转到背单词页面
  toStudy(){
    let FT = wx.getStorageSync("firstCode");//获取本地是否初学信息me
    //console.log(FT)
    if (this.data.info.all_learned_number == 0 && !FT) {//从未学过,学员没有在阶段页面做任何操作,非学员也没点过阶段选择
      this.setData({
        dianjiFlag: true,//小手出现
      })
      anim(this)//小手动画走起
    }
    else {// 已经学过/或已在阶段页面有过选择/或非学员点过阶段选择了
      let code = this.data.info.record_stage
      console.log(code)
      //非学员无论选没选(code==2 || !code)直接走公共 //学员或老师code==1走学员,code==2走公共
      let url = code == 1 ? "learned/list" : "learned/common"
      wx.navigateTo({
        url: '../remember/remember?msg='+url,
      })
    }
  },
  //跳转排行榜页面
  toPhb() {
    wx.navigateTo({
      url: '../ranking/ranking',
    })
  },
  //跳转到单词本
  toBooklet() {
    wx.navigateTo({
      url: '../booklet/booklet',
    })
  },

  //跳转到班级情况
  toClass(){
    wx.navigateTo({
      url: '../class/class',
    })
  },
  //* 生命周期函数--监听页面加载
  
  onLoad: function (options) {
  
  },


  //生命周期函数--监听页面初次渲染完成
  onReady: function () {
    
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getDate(new Date())//当前时间
    let token = wx.getStorageSync('tk_info').tk
    if (token) this.setData({
      coverAllow: false,//隐藏授权页面
    })

    getToken(tk => {//获取有效token的公用方法
      if (tk){
        this.getInfo(tk)//从后台获取用户信息
      } 
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if(this.data.dianjiFlag){
      anim(false);//清除定时器，动画停止
      this.setData({
        dianjiFlag: false,//隐藏小手
      })
    } 
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