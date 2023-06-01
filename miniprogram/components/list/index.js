// pages/list/index.js
const db = wx.cloud.database();
Component({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    isShowLoading: false
  },

  /**
   * 组件的属性列表
   */
  options: {

  },
  // 属性定义
  properties: {
    type: {
      type: String,
      value: 'recite'
    }
  },

  ready() {
    this.getList();
  },

  /**
   * 组件的方法
   */
  methods: {
    // 获取列表
    getList() {
      const _this = this;
      _this.setData({
        isShowLoading: true
      })
      db.collection("poemList").get().then(res => {
        console.log(res, 'res');
        _this.setData({
          list: res.data,
          isShowLoading: false
        })
      })
    },

    // 跳转详情页
    toDetails: function(e) {
      if (this.data.type === 'visitor') {
        wx.navigateTo({
          url: '../../pages/visitorPoems/index?poemId='+e.currentTarget.dataset.id,
        })
      };
      if (this.data.type === 'review') {
        wx.navigateTo({
          url: '../../pages/poemsDetail/index?poemId='+e.currentTarget.dataset.id,
        })
      };
      if (this.data.type === 'recite') {
        wx.navigateTo({
          url: '../../pages/recite/index?poemId='+e.currentTarget.dataset.id
        })
      };
      if (this.data.type === 'order') {
        wx.navigateTo({
          url: '../../pages/order/index?poemId='+e.currentTarget.dataset.id + '&poemName=' + e.currentTarget.dataset.name,
        })
      };
    }
  }
})