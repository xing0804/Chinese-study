Component({
	data: {
	  selected: 0,
	  "color": "#808080",
    "selectedColor": "#03A256",
	  list: [
		{
		  "pagePath": "/pages/home/index",
		  "text": "首页",
		  "iconPath": "../images/icon/home_no.png",
		  "selectedIconPath": "../images/icon/home.png"
		},
		{
		  "pagePath": "/pages/index/index",
		  "text": "背诵",
		  "iconPath": "../images/icon/recite_no.png",
		  "selectedIconPath": "../images/icon/recite.png"
		},
		{
		  "pagePath": "/pages/user/index",
		  "text": "我的",
		  "iconPath": "../images/icon/user_no.png",
		  "selectedIconPath": "../images/icon/user.png"
		}
	  ]
	},
	attached() {
	},
	methods: {
	  switchTab(e) {
		const data = e.currentTarget.dataset
		const url = data.path
		wx.switchTab({url})
		this.setData({
		  selected: data.index
		})
	  }
	}
  })