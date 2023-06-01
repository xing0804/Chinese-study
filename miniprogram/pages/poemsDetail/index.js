// pages/visitorPoems/index.js
import Dialog from '@vant/weapp/dialog/dialog';
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    testContent: `<text>sss</text>`,
    currentPoemId: '',
    details: {
      title: '《劝学》（节选）',
      author: '荀子',
      content: '君子曰：学不可以已。\n 青，取之于蓝，而青于蓝；冰，水为之，而寒于水。木直中绳，輮以为轮，其曲中规。虽有槁暴，不复挺者，輮使之然也。故木受绳则直，金就砺则利，君子博学而日参省乎己，则知明而行无过矣。\n 吾尝终日而思矣，不如须臾之所学也；吾尝跂而望矣，不如登高之博见也。登高而招，臂非加长也，而见者远；顺风而呼，声非加疾也，而闻者彰。假舆马者，非利足也，而致千里；假舟楫者，非能水也，而绝江河。君子生非异也，善假于物也。',
      translate: '      君子说：学习是不可以停止的。靛青，是从蓝草里提取的，然而却比蓝草的颜色更青；冰，是水凝结而成的，然而却比水更寒冷。木材笔直，合乎墨线，但是(用火萃取）使它弯曲成车轮，（那么）木材的弯度（就）合乎（圆到）如圆规画的一般的标准了，即使又被风吹日晒而干枯了，（木材）也不会再挺直，用火萃取使它成为这样的。所以木材经墨线比量过就变得笔直，金属制的刀剑拿到磨刀石上去磨就能变得锋利，君子广博地学习，并且每天检验反省自己，那么他就会智慧明理并且行为没有过错了。'
    },
    poemContent: '',
    textArr: [
      {
        text: '君子曰：学不',
        isnote: false,
        note: '',
        noteId: '9999'
      },
      {
        text: '可以',
        isnote: true,
        note: '可以把',
        noteId: '1'
      },
      {
        text: '已',
        isnote: true,
        note: '已经可以了',
        noteId: '2'
      }
    ],
    noteList: [
      {
        poemId: '1',
        noteId: '1',
        text: '荀子',
        note: '荀子：（约公元前313年—公元前238年），名况，字卿（一说时人相尊而号为卿）。思想家、哲学家、教育家，儒家学派的代表人物，先秦时代百家争鸣的集大成者'
      },
      {
        poemId: '1',
        noteId: '2',
        text: '荀子',
        note: '荀子：（约公元前313年—公元前238年），名况，字卿（一说时人相尊而号为卿）。思想家、哲学家、教育家，儒家学派的代表人物，先秦时代百家争鸣的集大成者'
      }
    ]
  },

  /**
   * 获取详情
   * @param {*} poemId 
   */
  getDetails(poemId) {
    const _this = this;
    db.collection("poemList").where({
      "poem_id": poemId
    }).get().then(res => {
      if (res.data.length === 0) {
        console.log('详情获取失败');
        return;
      }
      _this.setData({
        details: res.data[0],
        poemContent: res.data[0].content
      });
      // 获取对应古文的注释
      _this.getNotes(poemId).then(() => {
        let content = _this.data.details.content;
        let contentArr = [];
        // _this.data.noteList.forEach(ele => {
          // const face = new RegExp(`\\[[${ele.note_id}]\]`);
        // })
        content = content.replace(/\[(\d+)\]/g, (match, p1) => {
          return "$[" + p1 + "]";
        });
        contentArr = content.split(/\$(\[\d+\])/);
        contentArr = contentArr.map(item => {
          let tempObj = {};
          if (/(\[\d+\])/.test(item)) {
            const result = _this.data.noteList.filter(i => `[${i.note_id}]` === item)[0];
            tempObj.text = result.original;
            tempObj.noteId = result.note_id;
            tempObj.isnote = true;
          } else {
            tempObj.text = item;
            tempObj.noteId = '9999';
            tempObj.isnote = false;
          }
          return tempObj;
        })
        _this.setData({
          textArr: contentArr
        })
        // const query = wx.createSelectorQuery(); //创建对象
        // query.select('#poemContent')
        // const query = document.getElementById('#poemContent');
        // query.appendChild(content);
      });
    })
  },

  /**
   * 获取该篇诗对应所有注释
   */
  getNotes(poemId) {
    return new Promise((resolve, reject) => {
      db.collection("note").where({
        poem_id: poemId
      }).get().then(res => {
        console.log(res, 'noteList');
        this.setData({
          noteList: res.data
        })
        resolve();
      }).catch(err => {
        reject();
      })
    })
  },

  /**
   * 弹框显示
   * @param {}} e 
   */
  showNote(e) {
    console.log(e.currentTarget.dataset.noteid, 'e');
    const _this = this;
    const currNote = _this.data.noteList.filter(ele => ele.note_id === e.currentTarget.dataset.noteid)[0];
    console.log(currNote, 'currNote');
    Dialog.alert({
      message: currNote.note,
      messageAlign: 'left',
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options, 'poo');
    this.getDetails(options.poemId);
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