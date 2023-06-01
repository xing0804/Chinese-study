// pages/reciteRate/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '君子曰：学不可以已。\n青，取之于蓝，而青于蓝；冰，水为之，而寒于水。',
    score: 100,
    comment: '',
    commentArr: {
      100: '同学你太棒了!',
      90: '同学你非常不错，继续努力!',
      80: '同学你很不错，但还需要继续加强!',
      60: '同学，你出错较多，需要继续背诵直到正确!',
      0: '同学，你大约还没背熟吧，我等着你再来!'
    }
  },

  getComment() {
    const _this = this;
    if (_this.data.score === 100) {
      _this.setData({
        comment: _this.data.commentArr[100]
      })
    } else if (_this.data.score < 100 && _this.data.score >= 90) {
      _this.setData({
        comment: _this.data.commentArr[90]
      })
    } else if (_this.data.score < 90 && _this.data.score >= 80) {
      _this.setData({
        comment: _this.data.commentArr[80]
      })
    } else if (_this.data.score < 80 && _this.data.score >= 60) {
      _this.setData({
        comment: _this.data.commentArr[60]
      })
    } else if (_this.data.score < 60 && _this.data.score >= 0) {
      _this.setData({
        comment: _this.data.commentArr[0]
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      score: options.score,
      content: options.content
    });
    this.getComment(); // 提示信息
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