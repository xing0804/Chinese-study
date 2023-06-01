// pages/user/index.js
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}, // 用户信息
    avatarUrl: '',
    schedule: 0, // 当前进度
    level: '青铜', // 当前 段位
    levelArr: [
      {
        label: '书生',
        value: 0
      },
      {
        label: '秀才',
        value: 25
      },
      {
        label: '举人',
        value: 50
      },
      {
        label: '探花',
        value: 70
      },
      {
        label: '榜眼',
        value: 90
      },
      {
        label: '状元',
        value: 100
      }
    ]
  },

  getLoginInfo() {
    const _this = this;
    wx.getStorage({
      key: 'loginInfo'
    }).then(res => {
      _this.setData({
        userInfo: res.data
      });
      _this.getSchedule();
    })
  },

  onChooseAvatar(e) {
    console.log(e.detail);
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl,
    })
  },

  // 获取已背诵进度，计算总体进度
  getSchedule() {
    const _this = this;
    db.collection('reciteRecord').where({
      open_id: _this.data.userInfo.open_id
    }).get().then(res => {
      if(res.data.length === 0) {
        _this.setData({
          schedule: 0.00,
          level: '书生'
        });
        return;
      }
      // 开始计算，使用总体分数加起来/总分（6000）
      let score = 0; // 当前进度分数
      res.data.forEach(ele => {
        score += parseFloat(ele.score)
      });
      const schedule = score/6000 * 100; // 当前进度
      let level = ''
      // 计算当前段位
      const levelArr = _this.data.levelArr;
      for (let i = 1; i < levelArr.length; i++) {
        if (schedule < levelArr[i].value && schedule >= levelArr[i-1].value) {
          level = levelArr[i].label;
          break;
        }
      }
      console.log(level, 'level');
      _this.setData({
        schedule: schedule.toFixed(2),
        level: level
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getLoginInfo();
  },

  // 监听tab栏切换
  onTabItemTap(val) {
    // 判断如果用户没有登录，提示
    const userInfo = wx.getStorageSync('loginInfo');
    if (userInfo === '') {
      wx.showModal({
        title: '提示',
        content: '请进行登录',
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