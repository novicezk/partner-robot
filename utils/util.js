var emijs = ['不高兴', '乖', '亲亲', '冷漠', '切~', '勉强', '吃惊', '吐舌', '呵呵', '呼~', '咦', '哈哈', '哭', '喷', '委屈', '开心', '得意', '怒', '恶心', '惊哭', '惊讶', '汗', '滑稽', '狂汗', '生气', '疑问', '真棒', '睡觉', '笑眼', '萌萌哒', '鄙视', '阴险', '黑线']
const host = getApp().globalData.host
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
    let emij = arr[i].substring(1, arr[i].length - 1);
    if (emijs.indexOf(emij) != -1) {
      let str = msg.substring(0, msg.indexOf(arr[i]));
      if (str) {
        contents.push({
          type: 'text',
          text: insertStrOnceSize(str, '\n', 15)
        })
      }
      contents.push({
        type: 'image',
        url: host +'/static/emoji/' + emij + '.png'
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

module.exports = {
  formatTime: formatTime,
  getContents: getContents
}
