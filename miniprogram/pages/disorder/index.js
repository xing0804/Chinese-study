// pages/disorder/index.js
const db = wx.cloud.database();
import Notify from '@vant/weapp/notify/notify';
import Toast from '@vant/weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null, // 用户信息
    currentQues: null, // 当前题目
    questions: [],
    answer1: '',
    answer2: '',
    answer3: '',
    showDialog: false,
    closeOrConfirm: 'close',
    usedNums: [], // 已经使用过的序号
    questionTotal: 0, // 题目个数
    currentOrderNum: 0, // 当前题目序号
    score: 0
  },

  /**
   * 格式化日期
   * @param {}} max 
   */
  formatDate() {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1 // 月份从 0 开始计数，需要加 1
    const day = today.getDate()

    return year + '-' + month + '-' + day // 拼接成字符串形式，如 "2023-5-8"

  },

  /**
   * 从0到一个指定数生成一个随机整数，并且第二次生成的数不能和之前的一样
   * @param {*} max 最大值
   */
  getRandomInt(max) {
    if (this.data.usedNums && this.data.usedNums.length === this.data.questionTotal) {
      Notify({ type: 'warning', message: '已经是最后一道题', duration: 1000 });
      // Toast({
      //   type: 'fail',
      //   message: '已经是最后一道题',
      //   duration: 2000
      // });
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
    // 存储在Storage中
    let usedObj = {
      data: usedNums,
      date: this.formatDate()
    }
    wx.setStorageSync('disorderUsedNums', usedObj);

    return randomInt;
  },

  async getQuestionNum() {
    const res = await db.collection('disorderList').count();
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
    // if (this.data.usedNums[this.data.usedNums.length - 1] === random && this.data.usedNums.length === this.data.questionTotal) {
    //   return;
    // }
    const response = await db.collection('disorderList').where({
      order_num: random
    }).get();
    this.setData({
      questions: response.data[0].questions,
      currentOrderNum: random,
      currentQues: response.data[0]
    })
  },

  /**
   * input change事件
   * @param {*} e Object 当前元素
   */
  onChangeContent(e) {
    const num = e.target.dataset.number;
    const answer = {};
    answer['answer' + num] = e.detail;
    this.setData(answer);
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

  // 更新记录库分数
  updateScore(currScore) {
    const _this = this
    // 判断缓存有几条，如果有两条及以上（说明今天的数据库已经更新过了），就直接update数据库
    const storage = wx.getStorageSync('submitedQuestons');
    if (storage.data.length >= 2) {
      const _ = db.command;
      db.collection('disorderRecord').where({
        date: _this.getDate(),
        // date: '2023-05-25',
        open_id: _this.data.userInfo.open_id
      }).update({
        data: {
          // 表示指示数据库将字段自增 currScore
          score: _.inc(currScore)
        },
        success: function(res) {
          console.log('更新成功', res.data)
        }
      });
      return;
    }
    db.collection('disorderRecord').where({
      open_id: _this.data.userInfo.open_id
    }).get().then(res => {
      console.log(res, '用户记录');
      if (res.data.length === 0 || res.data.length === 1) { // 用户没有记录（第一次使用）或者只用过一天
        // 新增记录
        db.collection('disorderRecord').add({
          data: {
            open_id: _this.data.userInfo.open_id,
            score: currScore,
            date: _this.getDate()
            // date: '2023-05-25',
          }
        })
      } else if (res.data.length >= 2) { // 超过两天，从今天开始，比较两个大的那一个
        res.data.sort((val1, val2) => {
          let a = val1.score;
          let b = val2.score;
          return a > b ? 1 : a < b? -1 : 0
        });
        const delId = res.data[0]._id;
        db.collection('disorderRecord').doc(delId).remove().then(res => {
          console.log('删除成功', res);
          // 新增记录
          db.collection('disorderRecord').add({
            data: {
              open_id: _this.data.userInfo.open_id,
              score: currScore,
              date: _this.getDate()
              // date: '2023-05-25',
            }
          })
        })
      }
    })
  },

  // 匹配中英文逗号并全部转换未中文逗号
  replaceStr(str) {
    let reg = /,|，/g; // 匹配中英文逗号的正则表达式，g表示全局匹配
    return str.replace(reg, "，"); // 将所有中英文逗号替换成中文逗号
  },

  /**
   * 提交按钮点击事件
   */
  submitAnswer() {
    const _this = this;
    // 获取用户信息
    const userInfo = wx.getStorageSync('loginInfo');
    if (!userInfo) {
      Notify({ type: 'warning', message: '请先进行登录', duration: 2000 });
      return;
    }
    _this.setData({
      userInfo: userInfo
    })
    // 存储记录
    let submitedQuestons = wx.getStorageSync('submitedQuestons');
    // 判断在缓存中是否存在这道题（今天是否做过）
    if (submitedQuestons && submitedQuestons.time === _this.getDate() && submitedQuestons.data.some(ele => _this.data.currentQues._id === ele._id)) {
      Notify({ type: 'warning', message: '这道题今日已经做过了哟！', duration: 2000 });
      return;
    }
    // 存储到缓存中
    if (!submitedQuestons || submitedQuestons.time !== _this.getDate()) {
      submitedQuestons = {
        time: _this.getDate(),
        // time: '2023-05-25',
        data: [_this.data.currentQues]
      }
    } else {
      submitedQuestons.data.push(_this.data.currentQues);
    }
    wx.setStorageSync('submitedQuestons', submitedQuestons);

    // return;
    // 判断答案是否正确（全对）
    if (this.data.questions.every((ele, index) => this.replaceStr(ele.answer) === this.replaceStr(this.data['answer' + (index + 1)]))) {
      this.setData({
        showDialog: true
      });
      // 将分数更新到数据库
      _this.updateScore(6);
    } else {
      let score = 0;
      const correctAnswerArr = _this.data.currentQues.questions.map(ele => _this.replaceStr(ele.answer));
      const youAnswerArr = [
        _this.replaceStr(_this.data.answer1),
        _this.replaceStr(_this.data.answer2),
        _this.replaceStr(_this.data.answer3)
      ];

      const correctAnswerScoreArr = [];
      correctAnswerArr.forEach(ele => {
        const arr = ele.split('，');
        correctAnswerScoreArr.push(...arr);
      })

      const youAnswerScoreArr = [];
      youAnswerArr.forEach(ele => {
        const arr = ele.split('，');
        youAnswerScoreArr.push(...arr);
      })

      correctAnswerScoreArr.forEach(ele => {
        youAnswerScoreArr.some(i => i === ele) && score++
      })

      this.setData({
        score: score
      })
      const youAnswer = `${_this.data.answer1}\n${_this.data.answer2}\n${_this.data.answer3}`;
      let correctAnswer = correctAnswerArr.join('\n');
      // 将分数更新到数据库
      _this.updateScore(score);
      // wx.navigateTo({
      //   url: `/pages/disorderError/index?yourAnswer=${this.data.answer1}\n${this.data.answer2}\n${this.data.answer3}&currentOrderNum=${this.data.currentOrderNum}`,
      // })
      wx.navigateTo({
        url: `/pages/disorderError/index?score=${score}&correctAnswer=${correctAnswer}&youAnswer=${youAnswer}&currentOrderNum=${_this.data.currentOrderNum}`,
      })
    }
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
      answer1: '',
      answer2: '',
      answer3: ''
    });
    // 请求数据，跳转当前页面
    db.collection('disorderList').where({
      order_num: this.data.usedNums[index - 1]
    }).get().then(res => {
      console.log(res, 'res');
      if (res.data.length < 1) {
        Notify({ type: 'warning', message: '暂无数据' });
        return;
      }
      this.setData({
        questions: res.data[0].questions,
        currentQues: res.data[0]
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
      db.collection('disorderList').where({
        order_num: this.data.usedNums[index + 1]
      }).get().then(res => {
        if (res.data.length < 1) {
          Notify({ type: 'warning', message: '暂无数据' });
          return;
        }
        this.setData({
          questions: res.data[0].questions,
          currentQues: res.data[0],
          currentOrderNum: this.data.usedNums[index + 1],
          // 清空表单
          answer1: '',
          answer2: '',
          answer3: ''
        })
      });
    } else {
      this.getQuestions();
    }
    // 当前题号加一
    // this.setData({
    //   currQuestionId: this.data.currQuestionId + 1,
    // });

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 判断时间，设置已经使用过的序号
    let todayDate = this.formatDate();
    let storaegUsedObj = wx.getStorageSync('disorderUsedNums');
    // 如果不存在（第一次使用）或者日期不是今天，重置usedObj
    if (!storaegUsedObj || storaegUsedObj.date !== todayDate) {
      let usedObj = {
        data: [],
        date: todayDate
      }
      wx.setStorageSync('disorderUsedNums', usedObj);
      this.setData({
        usedNums: []
      })
    } else {
      this.setData({
        usedNums: storaegUsedObj.data
      })
    }
    // 获取初始化题目
    if (options.currentOrderNum) {
      this.setData({
        currentOrderNum: parseInt(options.currentOrderNum)
      })
      this.goNextQuestion()
    } else {
      this.getQuestions();
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