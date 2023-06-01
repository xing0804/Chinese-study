// pages/order/index.js
import Notify from '@vant/weapp/notify/notify';
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null, // 用户信息
    question: '', // 问题
    answerFlag: 0, // 回答正确与否标识 0：正确 1：错误
    answerArr: ['回答正确', '回答错误'],
    showDialog: false, // 弹框显示标识
    score: '1', // 本题得分
    youAnswer: '', // 你的答案
    correctAnswer: '', // 正确答案
    currQuestionId: 1, // 当前题号
    closeOrConfirm: 'close',
    poemId: '0', // 当前诗词id
    poemName: '', // 当前诗词的名称（主要用来存储记录）
    currentPoemRecord: {}, // 当前诗词得分记录
    questionTotal: 0, // 当前诗词的题目总数
    isShowLoading: false, // loading显示标识
  },

  /**
   * 获取当前题目
   */
  getCurrentQuestion(type) {
    const _this = this;
    _this.setData({
      isShowLoading: true
    })
    db.collection('orderList').where({
      poem_id: _this.data.poemId,
      question_id: _this.data.currQuestionId
    }).get().then(res => {
      _this.setData({
        isShowLoading: false
      })
      if (res.data.length > 0) {
        _this.setData({
          correctAnswer: res.data[0].answer,
          question: res.data[0].question
        })
      } else {
        if (type && type === 'onload') { // 如果是初始化请求不到数据，错误提示并且直接返回
          Notify({ type: 'warning', message: '数据请求错误', duration: 1000 });
          setTimeout(() => {
            wx.navigateBack(); // 返回
          }, 1000);
        }
      }
    })
  },

  /**
   * input change事件
   */
  onChangeContent(e) {
    this.setData({
      youAnswer: e.detail
    })
  },

  /**
   * 提交按钮事件
   */
  submitAnswer() {
    const _this = this;
    // 打开弹窗
    _this.setData({
      showDialog: true,
    })
    // 判断答案是否正确
    if (_this.data.youAnswer === _this.data.correctAnswer) {
      _this.setData({
        score: 1,
        answerFlag: 0
      })
      // 保存分数
      // 获取当前分数
      db.collection('orderRecord').where({
        poem_id: _this.data.poemId,
        open_id: _this.data.userInfo.open_id
      }).get().then(res => {
        if (res.data.length > 0) { // 如果之前有记录
          _this.setData({
            currentPoemRecord: res.data.map(ele => {
              if (!ele.completes.includes(_this.data.currQuestionId)) { // 如果这道题没有做过
                ele['score'] = ele.score + 1;
              }
              return ele;
            })[0]
          });
          if (!_this.data.currentPoemRecord.completes.includes(_this.data.currQuestionId)) { // 如果这道题没有做过
            _this.data.currentPoemRecord.completes.push(_this.data.currQuestionId)
            // 修改数据
            db.collection('orderRecord').doc(_this.data.currentPoemRecord._id).update({
              data: {
                score: _this.data.currentPoemRecord.score,
                completes: _this.data.currentPoemRecord.completes
              }
            }).then(res => {
              console.log(res, '修改成功');
            })
          }
        } else { // 之前没有记录
          _this.setData({
            currentPoemRecord: {
              open_id: _this.data.userInfo.open_id,
              score: 1,
              poem_id: _this.data.poemId,
              poem_name: _this.data.poemName,
              completes: [_this.data.currQuestionId]
            }
          });
          // 插入数据
          db.collection('orderRecord').add({
            data: _this.data.currentPoemRecord
          }).then(res => {
            console.log(res, '插入成功');
          })
        }
      })
    } else {
      _this.setData({
        score: 0,
        answerFlag: 1
      })
    }
  },

  /**
   * 获取当前日期
   */
  getDate() {
    const date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    month = (month > 9) ? month : ("0" + month);
    day = (day < 10) ? ("0" + day) : day;
    return year + "-" + month + "-" + day;
  },

  /**
   * 弹框关闭按钮点击事件
   */
  onCloseDialog() {
    if (this.data.closeOrConfirm === 'confirm') {
      this.setData({
        closeOrConfirm: 'close'
      })
      return;
    }
    this.setData({
      showDialog: false
    })
    // 退出练习，跳转列表页。
    wx.navigateBack();
    // wx.redirectTo({
    //   url: '/pages/orderList/index',
    // })
  },

  /**
   * 弹框确认按钮点击事件
   */
  onConfirmDialog() {
    this.setData({
      showDialog: false,
      closeOrConfirm: 'confirm'
    })
    this.goNextQuestion();
  },

  // 表单重置

  /**
   * 上一题按钮点击事件
   */
  goPrevQuestion() {
    if (this.data.currQuestionId - 1 < 1) {
      Notify({ type: 'warning', message: '当前为第一题' });
      return;
    }
    // 当前题号减一
    this.setData({
      currQuestionId: this.data.currQuestionId - 1,
      youAnswer: ''
    });
    // 请求数据，重新渲染题目
    this.getCurrentQuestion();
  },

  /**
   * 下一题按钮点击事件
   */
  goNextQuestion() {
    const _this = this;
    if (_this.data.currQuestionId + 1 > _this.data.questionTotal) {
      Notify({ type: 'warning', message: '当前为最后一题' });
      return;
    }
    // 当前题号加一
    this.setData({
      currQuestionId: this.data.currQuestionId + 1,
      youAnswer: ''
    });
    // 请求数据，重新渲染题目
    _this.getCurrentQuestion();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const _this = this;
    console.log(options, 'options');
    // 获取当前用户信息
    this.setData({
      poemId: options.poemId,
      poemName: options.poemName,
      userInfo: wx.getStorageSync('loginInfo')
    });
    this.getCurrentQuestion('onload');
    // 获取当前诗词对应题目数量
    db.collection('orderList').where({
      poem_id: _this.data.poemId
    }).count().then(res => {
      _this.setData({
        questionTotal: res.total
      })
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