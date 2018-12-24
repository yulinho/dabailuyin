//index.js
const app = getApp()
const innerAudioContext = wx.createInnerAudioContext();

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    voices: [],
    recordlist: [],
    recordFlag: false
  },

  onShareAppMessage: function(res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      title: '大白录音',
      path: '/pages/record/record?id=123'
    }
  },
  onShow: function() {
    var that = this

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
      })
    } else if (this.data.canIUse) {
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

    wx.login({
      success: function(res) {
        wx.request({
          url: '接口1',
          data: {
            code: res.code
          },
          method: 'GET',
          success: function(res) {
            wx.setStorage({
              key: 'open_id',
              data: res.data,
            })
            wx.request({
              url: '接口2',
              headers: {
                'Content-Type': 'application/json'
              },
              data: {
                open_id: res.data
              },
              success: function(res) {
                if (res.statusCode == 200) {
                  if (res.data.length > 0) {
                    that.setData({
                      list: res.data,
                      recordFlag: false
                    })
                  } else {
                    that.setData({
                      list: res.data,
                      recordFlag: true
                    })
                  }
                } else {
                  wx.showToast({
                    title: '加载失败',
                    icon: 'fail',
                    duration: 2000
                  })
                }

              },
              fail: function(res) {}
            })
          }
        })
      }
    })

  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  delete: function(e) {
    var file_dir = e.currentTarget.dataset.key;
    var that = this;
    wx.showModal({
      title: '确认',
      content: '删除这条录音吗',
      success: function(res) {
        if (res.confirm) {
          wx.getStorage({
            key: 'open_id',
            success: function(res) {
              const id = res.data;
              wx.request({
                url: '接口3',
                headers: {
                  'Content-Type': 'application/json'
                },
                data: {
                  open_id: id,
                  file_dir: file_dir
                },
                success: function(res) {
                  if (res.statusCode == 200) {
                    wx.showToast({
                      title: res.data.message,
                      icon: 'succes',
                      duration: 2000
                    })
                    wx.request({
                      url: '接口2',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      data: {
                        open_id: id
                      },
                      success: function(res) {
                        if (res.statusCode == 200) {
                          if (res.data.length > 0) {
                            that.setData({
                              list: res.data,
                              recordFlag: false
                            })
                          } else {
                            that.setData({
                              list: res.data,
                              recordFlag: true
                            })
                          }
                        } else {

                        }
                      },
                      fail: function(res) {}
                    })
                  } else {}
                },
                fail: function(res) {}
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  addRecord: function() {
    wx.switchTab({
      url: '/pages/record/record',
    })
  },
  help: function() {
    wx.navigateTo({
      url: '/pages/help/help',
    })
  }

})