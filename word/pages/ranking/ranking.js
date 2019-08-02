                           // pages/ranking/ranking.js
import { HTTP } from '../../utils/http.js'
let http = new HTTP()
import getToken from '../../utils/getToken.js'
Page({     
  /**
   * 页面的初始数据
   */
  data: {
    arr: ['今日榜单','历史榜单'],
    mine: null,
    icode: 0,
    list: [],
    num: 10,
    imgFlag: true,
    imgH: 0, //预览区高
    imgW: 0,//预览区宽
    canvasH: 0, //canvas高
    canvasW:0, 
    canvasUrl: '',//生成的canvas路径
    avatarUrl:'',//用户头像
    bgUrl: '',//画布背景图片
  },
  //获取数据公用方法
  getData(url) {
    console.log(url)
    getToken(tk => {
      http.request({
        url: 'top/'+url,//今日榜单
        token: tk,
        success: res => {
          console.log(res.data)
          

          if (res.data.data.length !== 0) {//有数据
            //console.log(res.data.data)
            this.setData({
              list: res.data.data,
              mine: res.data.mine || null,
              num: 10,
            });

            wx.downloadFile({//下载画布图片到本地
              url: "https://apiwx.yanxian.org/static/img/canvas1.png",//服务器上图片
              success: res => {
                this.setData({
                  bgUrl: res.tempFilePath,
                })


                this.data.mine && //如果有mine数据再执行
                wx.downloadFile({//下载网络头像到本地
                  url: this.data.mine.avatar_url,
                  success: res => {
                    this.setData({
                      avatarUrl: res.tempFilePath,
                    })
                    wx.getSystemInfo({
                      success: res => {
                        let { windowHeight, windowWidth } = res;//设备宽高
                        wx.getImageInfo({
                          src: 'https://apiwx.yanxian.org/static/img/canvas1.png',
                          success: res => {
                            let { width, height } = res;//原图片宽高
                            /*画布操作*/
                            const ctx = wx.createCanvasContext('myCanvas');
                            //宽高与画布宽高一样↓
                            ctx.drawImage(this.data.bgUrl, 0, 0, width, height);
                            let { mine } = this.data
                          
                            ctx.save()//保存当前的绘图上下文。
                            ctx.beginPath()//开始创建一个路径
                            //画一个圆形裁剪区域
                            ctx.arc(115, 795, 45, 0, 2 * Math.PI, false)
                            ctx.clip()//裁剪
                            //头像
                            ctx.drawImage(this.data.avatarUrl, 70, 750, 90, 90);
                            ctx.restore()//恢复之前保存的绘图上下文
                            ctx.setFontSize(28)
                            ctx.setFillStyle('#333')
                            //昵称
                            ctx.fillText(mine.nick_name, 200, 810)
                                
                            let strW = this.data.icode ? mine.all_learned_number + '' : mine.today_learned_number + ''
                            //↑今日或历史单词数↑
                            let strD = mine.learned_days + ''//天数
                            let lenW = strW.length
                            let lenD = strD.length
                            let leftW = (548 - lenW * 38)//文字位置随长度移动
                            let leftD = (238 - lenD  * 38)
                            let txt = "我在《社科赛斯背单词》小程序坚持" + strD+"天学习,"
                            let txt2 = "掌握" + strW +"个单词。"
                            ctx.fillText(txt, 70, 900)
                            ctx.fillText(txt2, 70, 950)
                            ctx.setFontSize(80)
                            ctx.fillText(strW, leftW, 425)//单词数
                            ctx.fillText(strD, leftD, 425)//天数
                            ctx.setFontSize(30)
                            ctx.setFillStyle("#555")
                            let one = mine.daily_quotations.substr(0,15)
                            let two = mine.daily_quotations.substr(15, 100)
                            ctx.fillText(one,152, 550)//语录
                            two && ctx.fillText(two, 152, 594)//语录
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
            })

          }
          let className = res.data.mine && res.data.mine.class_name;
          wx.setNavigationBarTitle({//动态改变页头标题
            title: className + '排行榜'
          })
        
        }
      })
    })
  },
  //今日榜单历史榜单切换
  tapNav(e) { 
    wx.pageScrollTo({
      scrollTop: 0,//返回顶部
    })
    let i = e.currentTarget.dataset.index
    this.setData({
      icode: i,
      list: [],
      num: 10,
    })
    let url = i == 0 ? 'today' : 'history'
    console.log(i,url,this.data.list,this.data.num)
    this.getData(url)
  },

  //分享 展示画布
  share() {
    this.setData({
      imgFlag: false,
    });
    wx.canvasToTempFilePath({//获取canvas生成的图片路径
      x: 0,//指定的画布区域的左上角横坐标
      y: 0,
      width: this.data.canvasW,//指定的画布区域的宽度
      height: this.data.canvasH,
      destWidth: this.data.canvasW,//输出的图片的宽度
      destHeight: this.data.canvasH,
      canvasId: 'myCanvas',
      success: res => {
        console.log(res);
        this.setData({
          canvasUrl: res.tempFilePath
        })
      },
    })
    
  },
  //保存画出的分享图片
  save() {
    console.log(this.data.canvasUrl)
    wx.saveImageToPhotosAlbum({
      filePath: this.data.canvasUrl,//canvas图片路径
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
                imgFlag: true,
              })
            }
          }
        })
      },      
    })
    
  },
  
  //* 生命周期函数--监听页面加载
  onLoad: function (options) {
    this.getData('today')
  },
  //获取滚动条位置信息
  // onPageScroll: e => {
  //   console.log(e)
  // },
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
    setTimeout(()=>{
      this.setData({
        num: this.data.num + 10
      })
      if (this.data.num >= this.data.list.length && this.data.list.length > 0) {
        this.setData({
          num: this.data.list.length
        })
      }
    },300)
    console.log(this.data.icode, this.data.num)
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