//动画
let tm;//声明定时器
function anim(_this) {
  let next = true;
  if (_this){
  //定时器 tm 赋值
  tm = setInterval(function () {
    let animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })
    if (next) {
      animation.scale(1.5).rotate(3).step()
      next = !next;
    } else {
      animation.scale(1.1).rotate(-3).step()
      next = !next;
    }
    _this.setData({
      animationData: animation.export()
    })
    }, 500);
  }
  else{
    //清除定时器
    clearInterval(tm)
  }
};
export default anim;//导出