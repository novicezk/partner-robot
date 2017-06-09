//app.js
App({
  onLaunch: function () {
    wx.getSetting({
      success(res) {
        if (!res['scope.record']) {
          wx.authorize({
            scope: 'scope.record'
          })
        }
        if (!res['scope.userInfo']) {
          wx.authorize({
            scope: 'scope.userInfo'
          })
        }
      }
    })
    wx.login({
      success: function (data) {
        wx.getUserInfo({
          success: function (res) {
            wx.setStorage({
              key: 'userInfo',
              data: res.userInfo,
            })
          }
        })
        wx.request({
          method: 'GET',
          url: 'https://homolo.top/getOpenid/' + data.code,
          success: function (res) {
            wx.setStorage({
              key: 'openid',
              data: res.data,
            })
          }
        });
      }
    })
  }
})