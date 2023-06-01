const ACCESS_KEY = 'ZUaN6zxkOzuig2WRI1bgXHOL';
const ACCESS_SECRET = 'DP2V8gZNg0DAaopViEVST8IMfjUhwm2r';

// 获取token
export function getToken(){
  wx.request({
    url: `https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=${ACCESS_KEY}&client_secret=${ACCESS_SECRET}`,
    method: "POST",
    success: (res)=>{
      // console.log(res);
      wx.setStorage({
        data: res.data.access_token,
        key: "access_token",
      });
      wx.setStorage({ // token有效期30天 2592000000
        data: new Date().getTime() + 2592000000,
        key: 'expires_in'
      })
    }
  });
}

// 语音识别
export function soundReco(data){
  let token = wx.getStorageSync("access_token");
  if(!token){
    getToken();
  }
  return new Promise((resolve, regest)=>{
    wx.request({
      url: `https://vop.baidu.com/server_api?dev_pid=1537&cuid=155236miniapp&token=${token}`,
      method: "POST",
      data: data,
      header: {"Content-Type": "audio/pcm;rate=16000"},
      success: (res)=>{
        resolve(res.data.result[0]);
      },
      fail: regest
    })
  });
}

