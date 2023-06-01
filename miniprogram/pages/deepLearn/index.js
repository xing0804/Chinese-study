// pages/deepLearn/index.js
const db = wx.cloud.database();
import Toast from '@vant/weapp/toast/toast';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pagesUrl: { // 跳转链接
      order: '/pages/orderList/index',
      disorder: '/pages/disorder/index',
      newword: '/pages/newWord/index'
    },
    userInfo: {}, // 用户信息
  },

  /**
   * 页面跳转
   */
  goPage(e) {
    const _this = this;
    // 获取用户信息，判断是否是svip
    const loginInfo = wx.getStorageSync('loginInfo');
    db.collection('user').where({
      open_id: loginInfo.open_id
    }).get().then(res => {
      if (res.data.length === 0) {
        Toast('用户不存在');
      } else {
        _this.setData({
          userInfo: res.data[0]
        });
        // 如果是乱序版并且没有支付
        if (this.data.pagesUrl[e.currentTarget.dataset.flag] === '/pages/disorder/index' && !_this.data.userInfo.is_svip) {
          wx.navigateTo({
            url: '/pages/pay/index',
          })
        } else {
          wx.navigateTo({
            url: this.data.pagesUrl[e.currentTarget.dataset.flag],
          })
        }
      }
    })
  },

  /**
   * 情景式默写，暂未开放
   */
  goNoOpen() {
    wx.navigateTo({
      url: '/pages/noOpen/index',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})