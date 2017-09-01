var globalData = getApp().globalData
const host = globalData.host
var emojis = globalData.emojis
var emojisEn = globalData.emojisEn

function formatTime(time) {
  const date = new Date(time)
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function insertStrOnceSize(content, str, size) {
  if (content.length <= size) return content;
  return content.substring(0, size) + "\n" + insertStrOnceSize(content.substring(15, content.length), '\n', size);
}

function getContents(msg, url) {
  let contents = []
  if (url) {
    contents.push({
      type: 'text',
      text: msg + "\n" + insertStrOnceSize(url, '\n', 15)
    })
    return contents;
  }
  let arr = msg.match(/\[[^\[\]]+\]/g);
  for (let i in arr) {
    let emoji = arr[i].substring(1, arr[i].length - 1);
    let index = emojis.indexOf(emoji);
    if (index != -1) {
      let str = msg.substring(0, msg.indexOf(arr[i]));
      if (str) {
        contents.push({
          type: 'text',
          text: insertStrOnceSize(str, '\n', 15)
        })
      }
      contents.push({
        type: 'image',
        url: '/emoji/' + emojisEn.slice(index, index + 1)[0] + '.png'
      })
      msg = msg.substring(msg.indexOf(arr[i]) + arr[i].length, msg.length)
    }
  }
  if (msg) {
    contents.push({
      type: 'text',
      text: insertStrOnceSize(msg, '\n', 15)
    })
  }
  return contents
}

function getEmojiEn(emoji) {
  let index = emojis.indexOf(emoji);
  return emojisEn.slice(index, index + 1)[0];
}

module.exports = {
  formatTime: formatTime,
  getContents: getContents,
  getEmojiEn: getEmojiEn
}
