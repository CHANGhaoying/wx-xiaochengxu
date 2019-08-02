// components/word-show/word-show.js
import { HTTP } from '../../utils/http.js'
let http = new HTTP()
import getToken from '../../utils/getToken.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: Object,
    col:Number,
    navcode:Number,
  },

  /**
   * 组件的初始数据
   */
  data: {
    letters: ["A", "B", "C", "D"],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    play(e) {//播放
      console.log(e.target.dataset.src)
      this.triggerEvent('play', e.target.dataset.src)
    },
    
    shut(){//关闭词意展示
      this.triggerEvent('shut')
    },
    //收藏
    collect(e) {
      let { stage, group, wid } = this.data.data;
      // console.log(stage, group, wid)
      let is_col = this.data.col == 1 ? 2 : 1;
      getToken(tk => {
        http.request({
          url: 'learned/collection',
          token: tk,
          data: {
            group: group,
            stage: stage,
            word_id: wid,
            is_collection: is_col,
          },
          success: res => {
            this.triggerEvent('remove')
            console.log(res)
          }
        })
      })
      if(this.data.navcode!=2){//排除收藏页取消收藏的情况
        this.setData({
          col: is_col
        })
      }
    },
    
  }
})
