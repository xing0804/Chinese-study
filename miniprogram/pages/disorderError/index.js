// pages/disorderError/index.js
const db = wx.cloud.database();
import Toast from '@vant/weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentOrderNum: 0,
    score: 0,
    youAnswer: '（1）暴霜露，展荆棘，以有尺寸之地\n（2）同是天涯沦落人\n（3）人间四月芳菲尽，山寺桃花始盛开',
    correctAnswer: '（1）暴霜露，展荆棘，以有尺寸之地\n（2）同是天涯沦落人\n（3）人间四月芳菲尽，山寺桃花始盛开'
  },

  /**
   * 结束练习
   */
  endExercise() {
    wx.redirectTo({
      url: '/pages/deepLearn/index'
    })
  },

  /**
   * 下一题
   */
  nextQuestion() {
    wx.redirectTo({
      url: '/pages/disorder/index?currentOrderNum=' + this.data.currentOrderNum
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options, 'options');
    this.setData({
      score: options.score,
      correctAnswer: options.correctAnswer,
      youAnswer: options.youAnswer,
      currentOrderNum: options.currentOrderNum
    })
    /*this.setData({
      youAnswer: options.yourAnswer,
      currentOrderNum: options.currentOrderNum
    });
    db.collection('disorderList').where({
      order_num: parseInt(options.currentOrderNum)
    }).get().then(res => {
      if (res.data.length === 0) {
        Toast('暂无数据');
      }
      let correctAnswer = '';
      res.data[0].questions.forEach(ele => {
        correctAnswer += ele.answer;
        correctAnswer += '\n'
      })
      let score = 0;
      const correctAnswerArr = correctAnswer.replace('\n', ',').split(',')
      const youAnswerArr = options.yourAnswer.replace('\n', ',').split(',');
      console.log(youAnswerArr, 'answerArr');
      correctAnswerArr.forEach(ele => {
        youAnswerArr.some(i => i === ele) && score++
      })
      this.setData({
        correctAnswer: correctAnswer,
        score: score
      })
    })*/
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