// pages/login/index.js
const db = wx.cloud.database();
const DB = wx.cloud.database().collection("user");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginImg: 'cloud://chinese-cloud-0g4likhsc3e76daa.6368-chinese-cloud-0g4likhsc3e76daa-1317509893/icon/loginBanner.png',
    loginInfo: {
      open_id: '',
      nickName: '',
      avatarUrl: ''
    },
    loginCode: '',
    envId: ''
  },

  /**
   * 游客登陆
   */
  handleNavigateToTest() {
    wx.switchTab({
      // url: '/pages/visitorList/index'
      url: '/pages/home/index'
    })
  },

  /**
   * 会员登录
   */
  handleNavigateToHome() {
    const _this = this;
    let loginInfo = null;
    wx.login({
      success(res) {
        if (res.code) {
          _this.setData({
            loginCode: res.code
          })
        };
        wx.showModal({
          title: '微信提示',
          content: '微信授权登陆',
          cancelText: '拒绝',
          confirmText: '同意',
          success(res) {
            if (res.confirm) { // 同意
              // 调用小程序获取用户信息接口
              wx.getUserProfile({
                desc: '用于完善会员资料', // 生命获取用户个人信息后得用途
                lang: 'zh_CN',
                success(info) {
                  loginInfo = {
                    avatarUrl: info.userInfo.avatarUrl,
                    nickName: info.userInfo.nickName
                  };
                  // 获取openId
                  wx.cloud.callFunction({
                    name: 'quickstartFunctions',
                    config: {
                      env: _this.data.envId
                    },
                    data: {
                      type: 'getOpenId'
                    }
                  }).then(resp => {
                    const openId = resp.result.userInfo.openId;
                    loginInfo['open_id'] = openId;
                    _this.setData({
                      loginInfo: loginInfo
                    });
                    // 将用户信息保存在localStorage中
                    wx.setStorage({
                      key: 'loginInfo',
                      data: loginInfo
                    });
                    // 查询用户是否存在，如果存在跳过，不存在，添加
                    db.collection('user').get().then(res => {
                      if(res.data.length <= 0) {
                        db.collection('user').add({
                          data: {
                            open_id: openId,
                            wx_avatar: loginInfo.avatarUrl,
                            wx_name: loginInfo.nickName,
                            is_svip: false,
                            _createTime: new Date().getTime(),
                            _updateTime: new Date().getTime()
                          }
                        }).then(res => {
                          console.log(res, '添加成功');
                        })
                      }
                    })
                    // 跳转首页
                    wx.switchTab({
                      url: '/pages/home/index'
                    })
                  })
                }
              })
            } else if (res.cancel) {
              wx.showModal({
                title: '提示',
                content: '同意授权才可以进行会员登陆哟！'
              })
            }
          }
        })
      },
      fail(e) {
        wx.showToast({
          title: '网络异常',
          duration: 2000
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      envId: options.envId
    });

    // 判断是否登录/本地缓存是否存在
    wx.getStorage({
      key: 'loginInfo'
    }).then(res => {
      if (res.data) {
        // 用户已经登录，直接跳转
        wx.switchTab({
          url: '/pages/home/index'
        })
      }
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