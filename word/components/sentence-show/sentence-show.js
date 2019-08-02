// components/sentence-show/sentence-show.js
import { HTTP } from '../../utils/http.js'
let http = new HTTP()
import getToken from '../../utils/getToken.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    sentence: Array,
    userTranslation: String,
    col: Number,
    son: Object,
  },

  /**
   * 组件的初始数据
   */
  data: {
    wordIndex: NaN,
    cover: false,
    height: '',//推拉窗动态高
    firstTop: '',//推拉窗原始顶高
    firstH: '',//推拉窗的原始高
    h: '',//每次touchStart时的高
    wordData:[],
    get_word: 'a',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    none(){
      return;
    },
    collect(e){
      this.setData({
        col: this.data.col == 2 ? 1 : 2,
      })
    },
    //播放
    play(e) {
      console.log(e)
      let {src} = e.target.dataset
      const innerAudioContext = wx.createInnerAudioContext()
      innerAudioContext.autoplay = true;//播放
      innerAudioContext.src = src;

    },
    next(e) {//下一个
      this.triggerEvent('next')
    },
    collect(e){//收藏
      this.triggerEvent('collect')
    },
    getWord(e) {//长按取词
      let { word, index } = e.target.dataset;
      let filter = /[,,.,0-9]/g;//匹配,和.及数字
      let word1 = word.replace(filter, '');//过滤逗号句号
      let word2 = word1.toLowerCase();//大写转小写
      this.setData({
        wordIndex: index,
        cover: true,
        wordData: [],//清空
        get_word: word2,
      })
      //获取推拉窗的初始信息
      var obj = wx.createSelectorQuery().in(this);//元素查询 获取某元素信息的对象,自定义组件加.in(this)
      let that = this
      obj.select('.sash-window').boundingClientRect(function (rect) {//获取
        that.setData({
          firstTop: rect.top,//推拉窗原始高
          firstH: rect.height,//推拉窗的原始高
        })
      }).exec();
      if(word2){
        getToken(tk=>{
          http.request({
            url: 'learned/search',//单词搜索
            token: tk,
            data: { english_word: word2},
            success: res=>{
              // console.log(res.data)
              this.setData({
                wordData: res.data,
              })
            }
          })
        })
      }
    },
    //开始拖拽
    start(e) {
      let that = this
      var obj = wx.createSelectorQuery().in(this);//元素查询 获取某元素信息的对象,自定义组件加.in(this)
      obj.select('.sash-window').boundingClientRect(function (rect) {//获取
        that.setData({
          h: rect.height,
        })
      }).exec();
      this.setData({
        startY: e.touches[0].clientY,
      })
    },
    // 拖拽
    move(e) {
      let y = e.touches[0].clientY;
      let fallY = this.data.startY - y;//落差
      if (y > 80 && y <= this.data.firstTop) {
        this.setData({
          height: this.data.h + fallY,
        })
      } else {
        if (y <= 80) {
          this.setData({
            height: this.data.h + this.data.startY - 80,
          })
        } else {
          this.setData({
            height: this.data.firstH,
          })
        }
      }
    },
    close() {
      this.setData({
        cover: false,
        height: this.data.firstH,
        wordIndex: NaN,
      })
    }
  }
})
