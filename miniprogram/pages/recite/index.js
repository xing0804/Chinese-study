// pages/recite/index.js
const db = wx.cloud.database();
const recorderManager = wx.getRecorderManager();
const OPTIONS = {
  duration: 600000, // 指定录音的时长 ms
  frameSize: 5, // 指定当录音大小达到5KB时触发onFrameRecorded
  sampleRate: 16000, // 采样率
  numberOfChannels: 1, // 录音通道数
  encodeBitRate: 96000, // 编码码率
  format: 'pcm' // 音频格式
}
var fileSize, tempFilePath

var socketTask

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null, // 当前用户信息
    poem_id: '', // 当前诗词id
    poemInfo: null, // 当前诗词信息
    reciteContent: '',
    isAnimation: false, // 动画开启标识
    reciteFlag: 0, // 背诵标识
    reciteBtnText: ['开始背诵', '结束背诵', '提交'],
    token: '',
    content: '',
    textDis: '',
    value: '',
    valueEn: '',
    text: ''
  },

  /**
 * 调用百度ai获取应用token
 * @param {*} e 
 */
  getToken() {
    const ACCESS_KEY = 'ZUaN6zxkOzuig2WRI1bgXHOL';
    const ACCESS_SECRET = 'DP2V8gZNg0DAaopViEVST8IMfjUhwm2r';
    const _this = this;

    wx.request({
      url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${ACCESS_KEY}&client_secret=${ACCESS_SECRET}`,
      method: "POST",
      success: (res) => {
        // console.log(res);
        wx.setStorage({
          data: res.data.access_token,
          key: "access_token",
        });
        wx.setStorage({ // token有效期30天 2592000000
          data: new Date().getTime() + 2592000000,
          key: 'expires_in'
        });
        _this.setData({
          token: res.data.access_token
        });
      }
    });
  },

  // 开始录音
  touchStart() {
    wx.authorize({
      scope: 'scope.record',
      success() {
        console.log('录音授权成功');
        recorderManager.start(OPTIONS);
        recorderManager.onStart(() => {
          console.log('recorder start');
        })
      },
      fail() {
        console.log('录音失败');
      }
    })
  },

  // 停止录音
  touchEnd() {
    const _this = this;
    recorderManager.stop();
    recorderManager.onStop((res) => {
      console.log('文件路径==', res);
      tempFilePath = res.tempFilePath;
      // 获取文件长度
      wx.getFileSystemManager().getFileInfo({
        filePath: tempFilePath,
        success: function (res) {
          fileSize = res.size;
          console.log('文件长度', res);
          _this.shibie();
        },
        fail: (res) => {
          console.log('读取文件长度错误', res);
        }
      })
    })
  },

  // 识别
  shibie() {
    const _this = this;
    wx.getFileSystemManager().readFile({
      filePath: tempFilePath,
      encoding: 'base64',
      success: (res) => {
        wx.showLoading({
          title: '识别中',
        })
        wx.request({
          url: `https://vop.baidu.com/server_api`,
          method: "POST",
          data: {
            token: _this.data.token,
            cuid: '804_3158',
            format: 'pcm',
            rate: 16000,
            channel: 1,
            speech: res.data,
            len: fileSize
          },
          header: { "Content-Type": "application/json" },
          success: (res) => {
            wx.hideLoading();
            console.log(res, '识别res');
            if (res.data.result == '') {
              wx.showModal({
                title: '提示',
                content: '听不清楚，请重新说一遍',
                showCancel: false
              });
              return;
            }
            // wx.showModal({
            //   title: '提示',
            //   content: res.data.err_msg,
            // })
            if (res.data.err_msg.indexOf('error') > -1) {
              wx.showToast({
                title: '识别失败',
              });
              return;
            }
            console.log('识别成功==', res.data);
            _this.setData({
              content: res.data.result[0],
              reciteContent: _this.data.reciteContent + res.data.result[0]
            })
          },
          fail: (res) => {
            wx.hideLoading();
            console.log('语音识别失败', res);
          }
        })
      }
    })
  },

  // 小程序录音回调
  handleReocrd() {
    let _this = this
    recorderManager.onFrameRecorded(function (res) {
      console.log(res, '到达5k触发onFrameRecorded');
      // _this.touchEnd()
      // let data = res.frameBuffer
    })
    recorderManager.onInterruptionBegin(function (res) {
      console.log('录音中断')
    })
    recorderManager.onStop(function (res) {
      console.log('录音停止')
    })
  },

  /**
   * 输入框改变事件
   */
  onChangeContent(e) {
    this.setData({
      reciteContent: e.detail
    })
  },

  // 匹配
  levenshtein(str1, str2) {
    // 计算两个字符串长度
    const len1 = str1.length;
    const len2 = str2.length;
    // 创建装载数组
    const dif = [];
    for (let i = 0; i < len1 + 1; i++) {
      dif.push(new Array(len2 + 1));
    }
    // 赋初始值
    for (let i = 0; i <= len1; i++) {
      dif[i][0] = i;
    }
    for (let i = 0; i <= len2; i++) {
      dif[0][i] = i;
    }
    // 计算两个字符串是否一样
    const ch1 = str1.split('');
    const ch2 = str2.split('');
    let temp;
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (ch1[i - 1] == ch2[j - 1]) {
          temp = 0;
        } else {
          temp = 1;
        }
        // 取最小值
        const temp1 = dif[i - 1][j - 1] + temp;
        const temp2 = dif[i][j - 1] + 1;
        const temp3 = dif[i - 1][j] + 1;

        dif[i][j] = Math.min(temp1, temp2, temp3);
      }
    }
    // 计算相似度
    const similarity = 1 - dif[len1][len2] / Math.max(str1.length, str2.length);
    return (similarity * 100).toFixed(2);
  },

  /**
   * 开始背诵点击事件
   */
  beginRecite() {
    const _this = this;
    if (this.data.reciteFlag === 0) { // 没开始背诵
      this.setData({
        reciteFlag: 1,
        isAnimation: true
      })
      // this.touchStart();
      _this.linkSocket();
    } else if (this.data.reciteFlag === 1) { // 开始背诵中
      this.setData({
        reciteFlag: 2,
        isAnimation: false
      })
      // this.touchEnd();
      _this.wsStop();
    } else { // 背诵完毕准备提交
      console.log(_this.data.reciteContent, 'reciteContent');
      const score = _this.levenshtein(_this.data.poemInfo.all_content, _this.data.reciteContent);
      // 判断该用户是否背诵过该篇
      db.collection('reciteRecord').where({
        open_id: _this.data.userInfo.open_id,
        poem_id: _this.data.poem_id
      }).get().then(res => {
        if (res.data.length === 0) { // 不存在记录，直接新增
          db.collection('reciteRecord').add({
            data: {
              open_id: _this.data.userInfo.open_id,
              poem_id: _this.data.poem_id,
              score: score,
              poem_name: _this.data.poemInfo.name
            }
          }).then(res => {
            console.log('添加成功', res);
            // 跳转至得分页面
            wx.navigateTo({
              url: '../reciteRate/index?score=' + score + '&content=' + _this.data.poemInfo.all_content,
            })
          })
        } else { // 更新数据
          db.collection('reciteRecord').where({
            open_id: _this.data.userInfo.open_id,
            poem_id: _this.data.poem_id
          }).update({
            data: {
              score: score
            }
          }).then(res => {
            console.log('更新成功', res);
            // 跳转至得分页面
            wx.navigateTo({
              url: '../reciteRate/index?score=' + score + '&content=' + _this.data.poemInfo.all_content,
            })
          })
        }
      })

    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options, 'options');
    const _this = this;
    // 获取当前诗词信息
    db.collection('poemList').where({
      poem_id: options.poemId
    }).get().then(res => {
      _this.setData({
        poemInfo: res.data[0]
      })
    })
    // 获取用户信息
    _this.setData({
      userInfo: wx.getStorageSync('loginInfo'),
      poem_id: options.poemId
    })
    // 判断是不是有有效的token
    wx.getStorage({
      key: 'expires_in',
      success(res) {
        console.log('缓存中有token');
        console.log('token失效时间', res.data);
        const newT = new Date().getTime();
        if (newT > parseInt(res.data)) {
          _this.getToken();
        } else {
          console.log('获取本地的token');
          _this.setData({
            token: wx.getStorageSync('access_token')
          });
        }
      },
      fail() {
        console.log('缓存中没有token');
        _this.getToken();
      }
    });
    // _this.handleReocrd();
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
    // this.handleReocrd();
    let _this = this
    recorderManager.onFrameRecorded(function (res) {
      let data = res.frameBuffer
      _this.wsSend(data)
    })

    recorderManager.onInterruptionBegin(function (res) {
      console.log('录音中断')
      _this.wsStopForAcc()
    })

    recorderManager.onStop(function (res) {
      console.log('录音停止')
    })
  },

  // 使用websocket建立连接
  linkSocket() {
    const _this = this;
    wx.authorize({
      scope: 'scope.record',
      success() {
        console.log('录音授权成功');
        
        wx.showLoading({
          title: '识别中...',
        });
        recorderManager.start(OPTIONS);
        // 建立websocket连接
    let sn = new Date().getTime();
    wx.connectSocket({
      url: 'wss://vop.baidu.com/realtime_asr?sn=' + sn + 'wyx',
      protocols: ['websocket'],
      success: (res) => {
        console.log('websocket连接成功');
        _this.initEventHandle();
      },
      fail: () => {
        console.log('websocket连接失败');
      }
    })
        recorderManager.onStart(() => {
          console.log('recorder start');
        })
      },
      fail() {
        console.log('录音失败');
      }
    })
  },

  // 监听websocket返回的数据
  initEventHandle() {
    let _this = this
    wx.onSocketMessage((res) => {
      let result = JSON.parse(res.data.replace('\n', ''));
      console.log(result, 'ressocket');
      // 错误信息提示
      if (res.err_no === -3005) {
        wx.showToast({
          title: '同学，说的不太清除哦！',
        })
        return;
      }
      if (result.type === 'MID_TEXT' || result.type === 'FIN_TEXT') {
        _this.setData({
          reciteContent:  result.result
        })
      }
      return;
      if (result.type == 'MID_TEXT') {
        // _this.tran(result.result, 'value');
        _this.setData({
          textDis: 'none',
          value: result.result,
          reciteContent:  result.result
        })
      }
      if (result.type == 'FIN_TEXT') {
        let value = _this.data.text
        let tranStr = value + result.result
        // _this.tran(tranStr, 'text')
        _this.setData({
          value: '',
          valueEn: '',
          textDis: 'block',
          text: tranStr,
          reciteContent:  result.result
        })
      }
    });
    wx.onSocketOpen(function ()  {
      console.log('WebSocket连接打开');
      //发送数据帧
      _this.wsStart();
    })

    wx.onSocketError(function () {
      console.log('WebSocket连接打开失败')
    })

    wx.onSocketClose(function () {
      console.log('WebSocket 已关闭！')
    })
  },

  // 发送开始帧
  wsStart() {
    let config = {
      type: "START",
      data: {
        appid: 33931986, // 百度实时语音识别appid
        appkey: "ZUaN6zxkOzuig2WRI1bgXHOL", // 百度实时语音识别key
        dev_pid: 15372,
        cuid: "wyx-8844",
        format: "pcm",
        sample: 16000
      }
    }
    wx.sendSocketMessage({
      data: JSON.stringify(config),
      success(res) {
        console.log('发送开始帧成功')
      }
    })
  },

  // 发送数据帧
  wsSend(data) {
    wx.sendSocketMessage({
      data: data,
      success(res) {
        console.log('发送数据帧成功')
      }
    })
  },

  // 录音结束手动停止发送结束帧
  wsStop() {
    let _this = this
    // _this.stop()
    let config = {
      type: "FINISH"
    }
    wx.hideLoading()
    recorderManager.stop()
    wx.sendSocketMessage({
      data: JSON.stringify(config),
      success(res) {
        console.log('录音结束发送结束帧成功');
        wx.closeSocket(); // 关闭socket连接
      }
    })
  },

  // 录音中断发送结束帧
  wsStopForAcc() {
    let _this = this
    // this.setData({
    //   click: true,
    // })
    let config = {
      type: "FINISH"
    }
    wx.sendSocketMessage({
      data: JSON.stringify(config),
      success(res) {
        wx.hideLoading()
        console.log('录音中断发送结束帧成功')
      }
    })
  }
})
