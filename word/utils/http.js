import config from '../config.js';
const tips = {

}

class HTTP {
  request(params) {
    // if(!params.method) {
    //   params.method = "GET"//默认为GET方式
    // }
    // console.log(config.api_base_url + config.appKey + params.url)
    wx.request({
      url: config.api_base_url + config.appKey + params.url,//相同部分和不同的部分拼接
      method: "POST",//默认都为POST
      data: params.data,
      header: {
        "content-type": 'application/json',
        //'appkey': config.appKey, //config.js文件中其它相同部分,如果有
        "token" : params.token
      },
      success: res => {
        params.success(res)
      },
      complete: () => {
        wx.hideLoading()
      }
    })
    wx.showLoading({
      title: '努力加载中...',
    })
    
  }
}

export { HTTP }