//index.js
var util = require('../../utils/util')
const app = getApp()
Page({
  data: {
    messages: [],
    isSpeech: false,
    emijs: ['不高兴', '乖', '亲亲', '冷漠', '切~', '勉强', '吃惊', '吐舌', '呵呵', '呼~', '咦', '哈哈', '哭', '喷', '委屈', '开心', '得意', '怒', '恶心', '惊哭', '惊讶', '汗', '滑稽', '狂汗', '生气', '疑问', '真棒', '睡觉', '笑眼', '萌萌哒', '鄙视', '阴险', '黑线'],
    animation: {},
    animation_2: {},
    tap: "tapOff",
    height: 0,
    msg: '',
    emotionBox: false,
    emotions: [],
    speechText: '按住 说话',
    changeImageUrl: 'https://homolo.top/voice.png',
    speechIcon: 'https://homolo.top/speech0.png',
    playingSpeech: ''
  },
  tapscroll(e) {
    this.setData({
      emotionBox: false,
    })
    this.animation_2.height(this.data.height - 50).step();
    this.setData({ animation_2: this.animation_2.export() })
    this.setData({
      tap: "tapOff"
    })
  },
  chooseEmotion(e) {
    this.setData({
      msg: this.data.msg + '[' + e.target.dataset.name + ']',
    })
  },
  sendMessage(e) {
    this.setData({
      msg: e.detail.value,
    })
  },
  onLoad() {
    wx.getSetting({
      success(res) {
        if (!res['scope.record']) {
          wx.authorize({
            scope: 'scope.record'
          })
        }
      }
    })
    var that = this
    let emotions = []
    let emijs = that.data.emijs
    for (let i = 0; i < emijs.length; i++) {
      emotions.push({
        src: 'https://homolo.top/emij/' + emijs[i] + '.png',
        id: i,
        name: emijs[i]
      })
    }
    this.setData({
      emotions: emotions
    })
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          height: res.windowHeight
        })
      }
    })
  },
  onReady() {
    this.animation = wx.createAnimation();
    this.animation_2 = wx.createAnimation()
  },
  onShareAppMessage: function () {
    return {
      title: '伙伴小Q',
      path: '/pages/index/index'
    }
  },
  emotionBtn() {
    this.setData({
      emotionBox: (this.data.tap == 'tapOff') ? true : false
    })
    if (this.data.tap == "tapOff") {
      this.animation_2.height(this.data.height - 200).step();
      this.setData({ animation_2: this.animation_2.export() })
      this.setData({
        tap: "tapOn"
      })
    } else {
      this.animation_2.height(this.data.height - 50).step();
      this.setData({ animation_2: this.animation_2.export() })
      this.setData({
        tap: "tapOff"
      })
    }
  }, changeType: function () {
    if (this.data.isSpeech) {
      this.setData({
        isSpeech: false,
        changeImageUrl: 'https://homolo.top/voice.png'
      });
    } else {
      this.setData({
        isSpeech: true,
        changeImageUrl: 'https://homolo.top/keyinput.jpg'
      });
    }
  },
  send: function () {
    var that = this;
    let msg = this.data.msg
    let contents = util.getContents(msg)

    let data = { contents: contents, me: true, avatar: wx.getStorageSync('userInfo').avatarUrl, speech: false }
    let messages = this.data.messages
    messages.push(data)
    this.setData({
      messages: messages,
      msg: ''
    })
    this.animation_2.height(this.data.height - 50).step();
    this.setData({ animation_2: this.animation_2.export() })
    this.setData({
      tap: "tapOff"
    })
    wx.request({
      url: 'https://homolo.top/robot',
      method: 'POST',
      data: { 'info': msg, 'userid': wx.getStorageSync('openid') },
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        if (res.statusCode == 200) {
          let answer = res.data.text;
          let contents = util.getContents(answer)
          let data = { contents: contents, me: false, avatar: 'https://homolo.top/robot.jpg', speech: false }
          let messages = that.data.messages
          messages.push(data)
          that.setData({
            messages: messages
          })
        }
      }
    })
  },
  startRecord: function () {
    var that = this;
    this.setData({
      speechText: '松开 发送'
    })
    var seconds = 0;
    var interval = setInterval(function () {
      seconds++
    }, 1000);
    wx.startRecord({
      success: function (res) {
        clearInterval(interval);
        var tempFilePath = res.tempFilePath
        seconds = seconds == 0 ? 1 : seconds;
        let data = { me: true, avatar: wx.getStorageSync('userInfo').avatarUrl, speech: true, seconds: seconds, filePath: tempFilePath }
        let messages = that.data.messages
        messages.push(data)
        that.setData({
          messages: messages
        });

        wx.uploadFile({
          url: 'https://homolo.top/upload/' + wx.getStorageSync('openid'),
          filePath: tempFilePath,
          header: {
            "Content-Type": "multipart/form-data"
          },
          name: 'file',
          success: function (res) {
            let resData = JSON.parse(res.data);
            if (resData.code == 102) {
              let answer = resData.text;
              let contents = util.getContents(answer)
              let data = { contents: contents, me: false, avatar: 'https://homolo.top/robot.jpg', speech: false }
              let messages = that.data.messages
              messages.push(data)
              that.setData({
                messages: messages
              })
            } else if (resData.code == 101) {
              var duration = 0;
              var isFirst = true;
              wx.playBackgroundAudio({
                dataUrl: 'https://homolo.top/' + resData.file
              });
              wx.onBackgroundAudioPlay(function () {
                wx.getBackgroundAudioPlayerState({
                  success: function (res) {
                    if (!isFirst) {
                      return;
                    }
                    isFirst = false;
                    duration = res.duration
                    wx.stopBackgroundAudio();
                    let data = { me: false, avatar: 'https://homolo.top/robot.jpg', speech: true, seconds: duration, filePath: 'https://homolo.top/' + resData.file }
                    let messages = that.data.messages
                    messages.push(data)
                    that.setData({
                      messages: messages
                    });
                  }
                })
              });
            }
          }
        })
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  stopRecord: function () {
    this.setData({
      speechText: '按住 说话'
    })
    wx.stopRecord();
  },
  playSpeech: function (event) {
    var that = this;
    var filePath = event.currentTarget.dataset.filepath;
    that.setData({
      playingSpeech: filePath
    });
    var num = 1;
    var interval = setInterval(function () {
      that.setData({
        speechIcon: 'https://homolo.top/speech' + num % 3 + '.png'
      });
      num++;
    }, 500);
    wx.playVoice({
      filePath: filePath,
      complete: function () {
        clearInterval(interval);
        that.setData({
          speechIcon: 'https://homolo.top/speech0.png',
          playingSpeech: ''
        });
      }
    })
  },
  playRobotSpeech: function (event) {
    var that = this;
    var filePath = event.currentTarget.dataset.filepath;
    that.setData({
      playingSpeech: filePath
    });
    var num = 1;
    var interval = setInterval(function () {
      that.setData({
        speechIcon: 'https://homolo.top/speech' + num % 3 + '.png'
      });
      num++;
    }, 500);
    wx.playBackgroundAudio({
      dataUrl: filePath
    });
    wx.onBackgroundAudioStop(function () {
      clearInterval(interval);
      that.setData({
        speechIcon: 'https://homolo.top/speech0.png',
        playingSpeech: ''
      });
    })
  }
})

