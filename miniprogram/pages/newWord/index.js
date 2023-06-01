// pages/newWord/index.js
import Notify from '@vant/weapp/notify/notify';
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    question: '',
    answer: '',
    answerFlag: 0,
    answerArr: ['回答正确', '作答有误'],
    showDialog: false,
    correctAnswer: '',
    currQuestionId: 1,
    closeOrConfirm: 'close',
    usedNums: [],
    questionTotal: 0,
    currentOrderNum: 0
  },

  /**
   * 从0到一个指定数生成一个随机整数，并且第二次生成的数不能和之前的一样
   * @param {*} max 最大值
   */
  getRandomInt(max) {
    if (this.data.usedNums && this.data.usedNums.length === this.data.questionTotal) {
      Notify({ type: 'warning', message: '已经是最后一道题', duration: 1000 });
      return this.data.usedNums[this.data.usedNums.length - 1];
    }

    // 生成一个随机整数，范围从 0 到 max
    let randomInt = Math.floor(Math.random() * Math.floor(max));

    // 判断当前随机整数是否和上次生成的一样，如果一样则重新生成，直到不一样为止
    while (this.data.usedNums && this.data.usedNums.includes(randomInt)) {
      randomInt = Math.floor(Math.random() * Math.floor(max));
    }

    // 记录当前生成的随机整数，用于下一次判断
    let usedNums = this.data.usedNums || [];
    usedNums.push(randomInt);
    this.setData({
      usedNums: usedNums
    });
    return randomInt;
  },

  async getQuestionNum() {
    const res = await db.collection('newWordList').count();
    console.log(res, 'ressss');
    this.setData({
      questionTotal: res.total
    })
    let random = this.getRandomInt(parseInt(res.total));
    console.log(this.data.usedNums, random, 'random');
    return random;
  },

  /**
   * 初始化题目
   * @param {}} e 
   */
  async getQuestions() {
    const random = await this.getQuestionNum();
    const response = await db.collection('newWordList').where({
      order_num: random + 1
    }).get();
    this.setData({
      question: response.data[0].question,
      correctAnswer: response.data[0].answer,
      currentOrderNum: random,
      answer: ''
    })
  },

  /**
   * input change事件
   */
  onChangeContent(e) {
    this.setData({
      answer: e.detail
    })
  },

  /**
   * 提交按钮事件
   */
  submitAnswer() {
    console.log(this.data.answer, 'answer');
    // 判断答案是否正确（全对）
    if (this.data.answer === this.data.correctAnswer) {
      this.setData({
        showDialog: true,
        answerFlag: 0
      });
    } else {
      this.setData({
        showDialog: true,
        answerFlag: 1
      });
    }
    // 存储记录
  
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
    wx.redirectTo({
      url: '/pages/deepLearn/index',
    })
  },

  /**
   * 弹框确认按钮点击事件
   */
  onConfirmDialog() {
    this.setData({
      showDialog: false,
      currQuestionId: this.data.currQuestionId + 1,
      closeOrConfirm: 'confirm'
    });
    this.goNextQuestion();
  },

  /**
   * 上一题按钮点击事件
   */
  goPrevQuestion() {
    let index = this.data.usedNums.findIndex(ele => ele === this.data.currentOrderNum); // 当前题目的index
    console.log(index, 'index上一题');
    if (index === 0) {
      Notify({ type: 'warning', message: '当前为第一题' });
      return
    }
    // 当前题号减一
    this.setData({
      currentOrderNum: this.data.usedNums[index - 1],
      answer: '',
    });
    // 请求数据，跳转当前页面
    db.collection('newWordList').where({
      order_num: this.data.usedNums[index - 1] + 1
    }).get().then(res => {
      console.log(res, '题目');
      if (res.data.length < 1) {
        Notify({ type: 'warning', message: '暂无数据' });
        return;
      }
      this.setData({
        question: res.data[0].question,
        correctAnswer: res.data[0].answer
      })
    });
  },

  /**
   * 下一题按钮点击事件
   */
  goNextQuestion() {
    let index = this.data.usedNums.findIndex(ele => ele === this.data.currentOrderNum); // 当前题目的index
    console.log(index, '下一题');
    if ((index + 1) === this.data.questionTotal) {
      Notify({ type: 'warning', message: '当前为最后一题' });
      return
    }
    // 请求数据，跳转当前页面
    // 如果当前题目的index小于当前已经做过的题的长度-1，说明下一道题做过，否则的话就需要生成随机数并且获取数据
    if (index < this.data.usedNums.length - 1) {
      db.collection('newWordList').where({
        order_num: this.data.usedNums[index + 1] + 1
      }).get().then(res => {
        if (res.data.length < 1) {
          Notify({ type: 'warning', message: '暂无数据' });
          return;
        }
        debugger
        this.setData({
          question: res.data[0].question,
          correctAnswer: res.data[0].answer,
          currentOrderNum: this.data.usedNums[index + 1],
          // 清空表单
          answer: ''
        })
      });
    } else {
      this.getQuestions();
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getQuestions();
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