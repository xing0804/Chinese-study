// pages/home/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    from: 'tourist',
    swiperArr: [
      'cloud://chinese-cloud-0g4likhsc3e76daa.6368-chinese-cloud-0g4likhsc3e76daa-1317509893/banner/banner1.png',
      'cloud://chinese-cloud-0g4likhsc3e76daa.6368-chinese-cloud-0g4likhsc3e76daa-1317509893/banner/banner1.png'
    ],
    menuList: [
      {
        imgUrl: 'cloud://chinese-cloud-0g4likhsc3e76daa.6368-chinese-cloud-0g4likhsc3e76daa-1317509893/icon/fuxi2.png',
        pageUrl: '/pages/reviewList/index',
        title: '复习',
        code: 'review'
      },
      {
        imgUrl: 'cloud://chinese-cloud-0g4likhsc3e76daa.6368-chinese-cloud-0g4likhsc3e76daa-1317509893/icon/beisong2.png',
        pageUrl: '/pages/reciteList/index',
        title: '背诵',
        code: 'recite'
      },
      {
        imgUrl: 'cloud://chinese-cloud-0g4likhsc3e76daa.6368-chinese-cloud-0g4likhsc3e76daa-1317509893/icon/xuexi2.png',
        pageUrl: '/pages/deepLearn/index',
        title: '深入学习',
        code: 'deep'
      }
    ]
  },

  navigatorToPage(e) {
    if (this.data.from === 'tourist') {
      // if是复习页面，游客点击进入只可以看原文的列表
      if (e.currentTarget.dataset.code === 'review') {
        wx.navigateTo({
          url: '/pages/visitorList/index'
        })
        return;
      } else {
        wx.showModal({
          title: '提示',
          content: '使用该功能需要先登录会员',
          success (res) {
            if (res.confirm) {
              wx.redirectTo({
                url: '/pages/login/index',
              })
            }
          }
        })
        return;
      }
    } else {
      // 背诵页面使用switchTab跳转
      if (e.currentTarget.dataset.pageurl === '/pages/reciteList/index') {
        wx.switchTab({
          url: e.currentTarget.dataset.pageurl,
        })
      } else {
        wx.navigateTo({
          url: e.currentTarget.dataset.pageurl,
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 判断缓存是否有用户信息
    const userInfo = wx.getStorageSync('loginInfo')
    let from = (userInfo === '' ? 'tourist' : 'member')
    this.setData({
      from: from
    })
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