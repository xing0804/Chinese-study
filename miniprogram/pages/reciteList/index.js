// pages/recite/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  // 监听tab栏切换
  onTabItemTap(val) {
    // 判断如果用户没有登录，提示
    const userInfo = wx.getStorageSync('loginInfo');
    if (userInfo === '') {
      wx.showModal({
        title: '提示',
        content: '使用该功能需要先登录会员',
        success (res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/login/index',
            })
          } else if (res.cancel) {
            wx.switchTab({
              url: '/pages/home/index',
            })
          }
        }
      })
    }
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