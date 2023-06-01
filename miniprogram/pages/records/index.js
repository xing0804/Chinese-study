// pages/records/records.js
import Toast from '@vant/weapp/toast/toast';
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 'recite',
    userInfo: null,
    disorderNew: null,
    disorderHigh: null,
    orderList: [], // 顺序版记录
    reciteList: [],
    isShowRecite: false,
    isShowOrder: false,
    isShowDisorder: false
  },

  // 获取背诵记录
  getReciteList() {
    const _this = this;
    db.collection('reciteRecord').where({
      open_id: _this.data.userInfo.open_id
    }).get().then(res => {
      if (res.data.length === 0) {
        Toast('当前还没有记录');
        _this.setData({
          isShowRecite: true
        });
        return;
      }
      _this.setData({
        reciteList: res.data,
        isShowRecite: false
      })
    })
  },

  // 获取顺序版数据
  getOrderList() {
    const _this = this;
    db.collection('orderRecord').where({
      open_id: _this.data.userInfo.open_id
    }).get().then(res => {
      console.log('顺序记录', res);
      if(res.data.length === 0) {
        Toast('当前还没有记录');
        if (res.data.length === 0) {
          _this.setData({
            isShowOrder: true
          })
        }
        return;
      }
      _this.setData({
        isShowOrder: false
      })
      // 获取对应题目的所有题数目
      res.data.forEach(ele => {
        db.collection('orderList').where({
          poem_id: ele.poem_id
        }).count().then(c => {
          ele['total'] = c.total;
          let list = _this.data.orderList;
          list.push(ele)
          _this.setData({
            orderList: list
          })
        });
      })
    })
  },

  // 获取乱序版数据
  getDisorderInfo() {
    const _this = this;
    db.collection('disorderRecord').where({
      open_id: _this.data.userInfo.open_id
    }).get().then(res => {
      if(res.data.length === 0) {
        Toast('当前还没有记录');
        if (res.data.length === 0) {
          _this.setData({
            isShowDisorder: true
          })
        }
        return;
      }
      res.data.sort((val1, val2) => {
        let a = val1.score;
        let b = val2.score;
        return a > b ? 1 : a < b? -1 : 0
      });
      _this.setData({
        disorderHigh: res.data[1],
        disorderNew: res.data[0],
        isShowDisorder: false
      })
    })
  },

  // tab切换事件
  tabChange(val) {
    const _this = this;
    switch(val.detail.name) {
      case 'recite':
        _this.getReciteList();
        break;
      case 'order':
        _this.setData({
          orderList: []
        })
        _this.getOrderList();
        break;
      case 'disorder':
        _this.getDisorderInfo();
        break;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取用户信息
    const userInfo = wx.getStorageSync('loginInfo');
    this.setData({
      userInfo: userInfo
    });
    this.getReciteList();
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