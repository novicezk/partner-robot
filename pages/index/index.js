//index.js
var util = require('../../utils/util')
const app = getApp()
const host = app.globalData.host
Page({
  data: {
    messages: [],
    isSpeech: false,
    emijs: ['不高兴', '乖', '亲亲', '冷漠', '切~', '勉强', '吃惊', '吐舌', '呵呵', '呼~', '咦', '哈哈', '哭', '喷', '委屈', '开心', '得意', '怒', '恶心', '惊哭', '惊讶', '汗', '滑稽', '狂汗', '生气', '疑问', '真棒', '睡觉', '笑眼', '萌萌哒', '鄙视', '阴险', '黑线'],
    scrollHeight: 0,
    toView: '',
    windowHeight: 0,
    windowWidth: 0,
    pxToRpx: 2,
    msg: '',
    emotionBox: false,
    emotions: [],
    speechText: '按住 说话',
    changeImageUrl: host + '/static/images/voice.png',
    speechIcon: host + '/static/images/speech0.png',
    defaultSpeechIcon: host + '/static/images/speech0.png',
    emotionIcon: host + '/static/images/emotion.png',
    playingSpeech: ''
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
    var that = this
    let emotions = []
    let emijs = that.data.emijs
    for (let i = 0; i < emijs.length; i++) {
      emotions.push({
        src: host + '/static/emoji/' + emijs[i] + '.png',
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
          windowHeight: res.windowHeight,
          pxToRpx: 750 / res.screenWidth,
          scrollHeight: (res.windowHeight - 50) * 750 / res.screenWidth
        })
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: '伙伴小Q',
      path: '/pages/index/index'
    }
  },
  emotionBtn() {
    if (this.data.emotionBox) {
      this.setData({
        emotionBox: false,
        scrollHeight: (this.data.windowHeight - 50) * this.data.pxToRpx
      })
    } else {
      this.setData({
        emotionBox: true,
        scrollHeight: (this.data.windowHeight - 285) * this.data.pxToRpx
      })
      if (this.data.isSpeech) {
        this.setData({
          isSpeech: false,
          changeImageUrl: host + '/static/images/voice.png'
        });
      }
    }
  }, changeType: function () {
    if (this.data.isSpeech) {
      this.setData({
        isSpeech: false,
        changeImageUrl: host + '/static/images/voice.png'
      });
    } else {
      this.setData({
        isSpeech: true,
        changeImageUrl: host + '/static/images/keyinput.png',
        emotionBox: false,
        scrollHeight: (this.data.windowHeight - 50) * this.data.pxToRpx
      });
    }
  },
  send: function () {
    var that = this;
    let msg = this.data.msg
    let contents = util.getContents(msg)
    let id = 'id_' + Date.parse(new Date()) / 1000;
    let data = { id: id, contents: contents, me: true, avatar: wx.getStorageSync('userInfo').avatarUrl, speech: false }
    let messages = this.data.messages
    messages.push(data)
    this.setData({
      messages: messages,
      msg: ''
    })
    this.setData({
      toView: id
    })
    wx.request({
      url: host + '/wx/robot',
      method: 'POST',
      data: { 'info': msg, 'userid': wx.getStorageSync('openid'), 'username': wx.getStorageSync('userInfo').nickName },
      header: {
        "content-type": "application/json"
      },
      success: function (res) {
        if (res.statusCode == 200) {
          let answer = res.data.text;
          let contents = util.getContents(answer, res.data.url)
          let id = 'id_' + Date.parse(new Date()) / 1000;
          let data = { id: id, contents: contents, me: false, avatar: host + '/static/images/robot.jpg', speech: false }
          let messages = that.data.messages
          messages.push(data)
          that.setData({
            messages: messages
          })
          that.setData({
            toView: id
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
        let id = 'id_' + Date.parse(new Date()) / 1000;
        let data = { id: id, me: true, avatar: wx.getStorageSync('userInfo').avatarUrl, speech: true, seconds: seconds, filePath: tempFilePath }
        let messages = that.data.messages
        messages.push(data)
        that.setData({
          messages: messages
        });
        that.setData({
          toView: id
        })
        let nickName = wx.getStorageSync('userInfo').nickName;
        if (!nickName) nickName = 'null';
        wx.uploadFile({
          url: host + '/wx/uploadSilk',
          filePath: tempFilePath,
          name: 'file',
          formData: {
            'userid': wx.getStorageSync('openid'),
            'username': wx.getStorageSync('userInfo').nickName
          },
          success: function (res) {
            let resData = JSON.parse(res.data);
            if (resData.code == 102) {
              let answer = resData.text;
              let contents = util.getContents(answer)
              let id = 'id_' + Date.parse(new Date()) / 1000;
              let data = { id: id, contents: contents, me: false, avatar: host + '/static/images/robot.jpg', speech: false }
              let messages = that.data.messages
              messages.push(data)
              that.setData({
                messages: messages
              })
              that.setData({
                toView: id
              })
            } else if (resData.code == 101) {
              var isFirst = true;
              wx.playBackgroundAudio({
                dataUrl: host + '/static/' + resData.text
              });
              wx.onBackgroundAudioPlay(function () {
                wx.getBackgroundAudioPlayerState({
                  success: function (res) {
                    if (!isFirst) {
                      return;
                    }
                    isFirst = false;
                    let duration = res.duration;
                    wx.stopBackgroundAudio();
                    let id = 'id_' + Date.parse(new Date()) / 1000;
                    let data = { id: id, me: false, avatar: host + '/static/images/robot.jpg', speech: true, seconds: duration == 0 ? 1 : duration, filePath: host + '/static/' + resData.text }
                    let messages = that.data.messages
                    messages.push(data)
                    that.setData({
                      messages: messages
                    });
                    that.setData({
                      toView: id
                    })
                  }
                })
              });
            }
          },
          fail: function (err) {
            console.log(err)
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
        speechIcon: host + '/static/images/speech' + num % 3 + '.png'
      });
      num++;
    }, 500);
    wx.playVoice({
      filePath: filePath,
      complete: function () {
        clearInterval(interval);
        that.setData({
          speechIcon: host + '/static/images/speech0.png',
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
        speechIcon: host + '/static/images/speech' + num % 3 + '.png'
      });
      num++;
    }, 500);
    wx.playBackgroundAudio({
      dataUrl: filePath
    });
    wx.onBackgroundAudioStop(function () {
      clearInterval(interval);
      that.setData({
        speechIcon: host + '/static/images/speech0.png',
        playingSpeech: ''
      });
    })
  }
})

