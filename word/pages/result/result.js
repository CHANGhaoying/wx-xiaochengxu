// pages/result/result.js

import { HTTP } from '../../utils/http.js';
let http = new HTTP();
import getToken from '../../utils/getToken.js';
 
Page({
  /**
   * 页面的初始数据
   */
  data: {
    dat: {},
    avatarUrl: '',
    close: true,
    canvasFlag: true,
    canvasH: 0,
    canvasW: 0,
    imgH: 0,//预览区高
    imgW: 0,//预览区宽
    canvasUrl: '',//生成的canvas路径
    groupId: '',
    stageId:'',
    bgUrl: '',//画布背景图

    place1: '#社科背单词# 今天学习了',
    place2: '，继续加油！',
    clock: false,
    textLength:0,//输入文本长度
    moduleCode: NaN,
  },

  go(str){
    let class_id = wx.getStorageSync('class_id')
    let { stageId, groupId, moduleCode } = this.data
    let url = moduleCode == 3 ? '../sentence/study/study' : '../remember/remember'
    wx.redirectTo({
      url: url + str + '&stageId=' + stageId + '&groupId=' + groupId + '&class_id=' + class_id + '&moduleCode=' + moduleCode,
    })
  },
 //下一组 
  nextGroup() {
    this.go('?msg=settlement/next')
  },
  //重新来过
  again() {
    this.go('?msg=settlement/again')
  },
  //分享战绩
  share() {
    this.setData({
      canvasFlag: false,
    })
    wx.canvasToTempFilePath({//获取canvas生成的图片路径
      x: 0,//指定的画布区域的左上角横坐标
      y: 0,
      width: this.data.canvasW,//指定的画布区域的宽度
      height: this.data.canvasH,
      destWidth: this.data.canvasW,//输出的图片的宽度
      destHeight: this.data.canvasH,
      canvasId: 'myCanvas',
      success: res => {
        //console.log(res);
        this.setData({
          canvasUrl: res.tempFilePath
        })
      },
    })

  },
  //保存
  save() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.canvasUrl,//图片路径
      success:res => {
        console.log(res)
        wx.showModal({
          content: '图片已保存到相册，赶紧晒一下吧~',
          showCancel: false,
          confirmText: '好的',
          success: res => {
              if (res.confirm) {
              console.log('用户点击确定');
              /* 该隐藏的隐藏 */
              this.setData({
                canvasFlag: true,
              })
            }
          }
        })
      },
    })
  },
  open() {//打开恭喜进阶
    this.setData({
      close: false,
    })
  },
  close() {//关闭恭喜进阶
    this.setData({
      close: true,
    })
  },
  closeCanvas() {//关闭海报
    this.setData({
      canvasFlag: true,
    });
    let { groupId, stageId } = this.data;
    this.getInfo(stageId,groupId,true)//更新数据
  },
  btnAnim(_this) {
    let next = true;
    if (true) {
      //定时器 tm 赋值
      var tm = setInterval(function () {
        let animation = wx.createAnimation({
          duration: 500,
          timingFunction: 'linear',
        })
        if (next) {
          animation.scale(0.95).step()
          next = !next;
        } else {
          animation.scale(1).step()
          next = !next;
        }
        _this.setData({
          animationData: animation.export()
        })
      }, 700);
    }
    else {
      //清除定时器
      clearInterval(tm)
    }
  },
  //显示打卡
  clock(){
    wx.pageScrollTo({
      scrollTop: 0,//返回顶部
    });
    this.setData({
      clock: true,
      //textLength: this.data.textLengthValue,
    })
  },
  closeClock() {//关闭打卡页
    this.setData({
      clock: false,
    });
  },
  //提交打卡
  bindFormSubmit(e){
    let val = e.detail.value.textarea;//文本域内容
    let {groupId,stageId} = this.data;
    
    if(!val.replace(/\s+/g, "")) {//正则去空
      wx.showModal({
        title: '提示信息',
        content: '请输入有效内容',
        showCancel: false,
      })
      return;
    }
    let class_id = wx.getStorageSync('class_id');
    getToken(tk=>{
      http.request({
        url:'settlement/post',
        token:tk,
        data:{
          content:val,
          stage: stageId,
          group: groupId,
          class_id: class_id
        },
        success: res => {
          console.log(res);
          res.statusCode == 200 && this.getInfo(stageId, groupId, true);
          this.share();
          this.setData({
            clock:false,
          })
        }
      })
    })
  },

  clock_ipt(e) {
    this.setData({
      textLength: e.detail.value.length,
    })
  },

//获取结算页信息
  getInfo(stageId, groupId,flag){
    let class_id = wx.getStorageSync('class_id');
    getToken(tk => {
      http.request({
        url: 'settlement/info',//结算信息 
        token: tk,
        data: {
          stage: stageId,
          group: groupId,
          class_id: class_id,
        },
        success: res => {
          console.log(res)
          this.setData({
            dat: res.data,
          })
          if(!flag){
            res.data.medal_data && this.open();//如果晋级&&打开恭喜进阶

            // 结构相关数据信息
            let { nick_name,
              group_name,
              stage_name,
              class_true_rate,
              true_rate,
              punch_days,
              sentence_number,
              type
            } = this.data.dat
            let code = type == 5 ? 3 : 2;
            let canvasImgSrc = 'https://apiwx.yanxian.org/static/img/canvas' + code +'.png';
            wx.downloadFile({//下载画布背景图片到本地
              url: canvasImgSrc,
              success: res => {
                //console.log(res)
                this.setData({
                  bgUrl: res.tempFilePath,
                })
                wx.downloadFile({//下载网络头像到本地
                  url: this.data.dat.avatar_url,
                  success: res => {
                    //console.log(res.tempFilePath);
                    this.setData({
                      avatarUrl: res.tempFilePath,
                    })
                    wx.getSystemInfo({//获取设备信息
                      success: res => {
                        //console.log(res)
                        let { windowHeight, windowWidth } = res;//设备宽高
                        wx.getImageInfo({//获取图片信息
                          src: canvasImgSrc,//服务器上图片
                          success: res => {
                            //console.log(res)
                            let { width, height } = res;//原图片宽高
                            //console.log(windowHeight, windowWidth, width, height)
                            /*画布操作*/
                            const ctx = wx.createCanvasContext('myCanvas');
                            //宽高与画布宽高一样
                            ctx.drawImage(this.data.bgUrl, 0, 0, width, height);
                            ctx.save()//保存当前的绘图上下文。
                            ctx.beginPath()//开始创建一个路径
                            //画一个圆形裁剪区域
                            ctx.arc(385, 335, 95, 0, 2 * Math.PI, false)
                            ctx.clip()//裁剪
                            
                            //头像
                            ctx.drawImage(this.data.avatarUrl, 290, 240, 190, 190);
                            ctx.restore()//恢复之前保存的绘图上下文
                            ctx.setFontSize(28)
                            ctx.setFillStyle('#474747')
                            //昵称
                            ctx.setTextAlign('center');
                            ctx.fillText(nick_name, 375, 480);

                            ctx.setTextAlign('left');//恢复靠左，以免影响其它文字
                            ctx.setFillStyle('#000')
                            ctx.setFontSize(35)
                            ctx.fillText(stage_name + group_name + '单词', 85, 220)
                            ctx.setFontSize(46)
                            ctx.fillText('坚持学习' + punch_days + '天', 250, 580)
                            if(type == 5){//长难句
                              ctx.setFillStyle('#474747')
                              ctx.setTextAlign('center');
                              ctx.setFontSize(36)
                              ctx.fillText('长难句已学 ' + sentence_number + ' 句', 375, 835)
                            }else{//词汇
                              ctx.setFontSize(55)
                              ctx.fillText(true_rate, 125, 885)
                              ctx.fillText(class_true_rate, 430, 885)
                            }
                            ctx.draw()
                            this.setData({
                              //预览框高是图高，图高是图片原高*(设备宽/图片原宽)的90%
                              imgH: height * windowWidth / width * 0.88,
                              imgW: windowWidth * 0.88,//预览区宽即设备视口宽的90% 
                              canvasH: height, //canvas高为原图高
                              canvasW: width, //canvas宽为原图宽
                            })
                          }
                        })
                      },
                    })
                  }
                })

              }
            })//下载画布背景图片到本地end,内部canvas生成 ↑
           
          }
        }
      })
    });
  },
  //* 生命期函数--监听页面加载
  onLoad: function (options) {
    console.log(options)
    this.setData({
      groupId: options.groupId,//传回学习页面
      stageId: options.stageId,
      moduleCode: options.moduleCode,
    });
    this.getInfo(options.stageId, options.groupId)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.btnAnim(this)
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
  onShareAppMessage: function (res) {
    return {
      title: getApp().globalData.shareTitle,
      imageUrl: "../../img/share.jpg",
      path: '/pages/home2/home2',
    }
  }
})