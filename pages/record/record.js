const util = require('../../utils/util.js')
const app = getApp();
const recorderManager = wx.getRecorderManager()
recorderManager.onStart(() => {
  console.log('recorder start')
})
recorderManager.onResume(() => {
  console.log('recorder resume')
})
recorderManager.onPause(() => {
  console.log('recorder pause')
})
recorderManager.onStop((res) => {
  console.log('recorder stop', res);
  const {
    tempFilePath
  } = res;
  wx.getStorage({
    key: 'open_id',
    success: function(res) {
      console.log(res)
      wx.showToast({
        icon: 'none',
        title: '语音识别中',
      })
      const id = res.data;
      let recordTime = Date.now();
      wx.uploadFile({
        url: '接口4',
        filePath: tempFilePath,
        name: 'file',
        header: {
          "Content-Type": "multipart/form-data"
        },
        formData: {
          'open_id': id,
          record_time: recordTime
        },
        success: function(res) {
          if (res.data == 'success') {
            wx.switchTab({
              url: '/pages/index/index',
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: '没有听清楚，请再说一次',
            })
          }
        },
        fail: function(res) {
          wx.showToast({
            icon: 'none',
            title: '没有听清楚，请再说一次',
          })
        }
      })

    },
    fail: function(res) {
      console.log('fail')
    }

  })
})
recorderManager.onFrameRecorded((res) => {})

const options = {
  duration: 60000,
  sampleRate: 16000,
  numberOfChannels: 1,
  encodeBitRate: 64000,
  format: 'mp3',
  frameSize: 50
}

Page({
  data: {
    buttonTxt: '开始录音',
    isRecord: false,
    log: {},
    isRuning: false,
    remainTimeText: '00:00'
  },
  record: function() {
    var that = this;
    if (that.data.isRecord) {
      wx.setKeepScreenOn({
        keepScreenOn: false
      })
      recorderManager.stop();
      this.stopTimer();
      that.data.isRecord = false;
      that.setData({
        buttonTxt: '开始录音'
      });

    } else {
      wx.setKeepScreenOn({
        keepScreenOn: true
      })
      recorderManager.start(options);
      this.startTimer();
      that.data.isRecord = true;
      that.setData({
        buttonTxt: '停止录音'
      })
    }
  },
  updateTimer: function() {
    let log = this.data.log
    let now = Date.now()
    let remainingTime = Math.round((now - log.endTime) / 1000)
    let M = util.formatTime(Math.floor(remainingTime / (60)) % 60, 'MM')
    let S = util.formatTime(Math.floor(remainingTime) % 60, 'SS')
    if (remainingTime > 58) {
      wx.setKeepScreenOn({
        keepScreenOn: false
      })
      this.stopTimer()
      recorderManager.stop();
      this.data.isRecord = false;
      this.setData({
        buttonTxt: '开始录音'
      });
      return
    } else {
      let remainTimeText = M + ":" + S;
      this.setData({
        remainTimeText: remainTimeText
      })
    }
  },
  stopTimer: function() {
    this.timer && clearInterval(this.timer)
    this.setData({
      isRuning: false,
      remainTimeText: '00:00',
    })
  },
  startTimer: function(e) {
    let isRuning = this.data.isRuning
    let startTime = Date.now()
    if (!isRuning) {
      this.timer = setInterval((function() {
        this.updateTimer()
      }).bind(this), 1000)
    } else {
      this.stopTimer()
    }
    this.setData({
      isRuning: !isRuning,
      remainTimeText: '00:00',
    })
    this.data.log = {
      endTime: startTime
    }
    this.saveLog(this.data.log)
  },
  saveLog: function(log) {
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(log)
    wx.setStorageSync('logs', logs)
  },
  onHide: function() {
    recorderManager.stop();
    this.stopTimer();
    this.data.isRecord = false;
    this.setData({
      buttonTxt: '开始录音'
    })
  }
})