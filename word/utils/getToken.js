import { HTTP } from './http.js'
let http = new HTTP()
let getToken = function(callback,name,url){
  //let tk = wx.getStorageSync('token')
  let { tk_timestamp, tk } = wx.getStorageSync('tk_info')//获取本地token时间戳和token
  let newStamp = new Date().getTime()//最新时间
  function log(name,url) { //封装log方法获取token
      wx.login({
        success: res => {
          let { code } = res
          http.request({
            url: 'token/user',
            data: {
              nick_name: name,
              avatar_url: url,
              code: code,
            },
            success: res => {
              wx.setStorage({//(异步)本地缓存新的token时间戳
                key: 'tk_info',
                data: {
                  tk: res.data.token,
                  tk_timestamp: new Date().getTime(),
                },
              });
              console.log(res.data)
              callback(res.data.token)//回调 
            }, 
          })
        }
      })
  }

  if (tk_timestamp && tk) {//时间戳和token都有
    if (newStamp - tk_timestamp < 7200000){//不超过俩小时
      callback(tk)//回调
      //console.log('token有效')
    }
    else {//超过俩小时
      let { name, url } = wx.getStorageSync('userData')
      log(name, url)//重新获取token
      console.log('token过期', name, url)
    }
  }
  else {//如果token不存在
    if(name && url) {//如果传递name,url值，即为初次授权触发
      log(name,url)//获取token
      console.log('初次获取token')
    }
    else{//未知错误，抛出false
      callback(false)//回调
      console.log(false)
    }
  }
}
export default getToken