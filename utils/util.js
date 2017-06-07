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

function getContents(msg) {
  let contents = []
  let t = ''
  let lastToken = ''
  for (let i = 0; i < msg.length; i++) {
    if (lastToken == '' && msg[i] == '[') {
      if (t) {
        contents.push({
          type: 'text',
          text: t
        })
      }
      t = ''
      lastToken = '['
    } else if (msg[i] == ']' && lastToken == '[') {
      contents.push({
        type: 'image',
        url: 'https://homolo.top/emij/' + t + '.png'
      })
      t = ''
      lastToken = ''
    } else {
      t += msg[i]
    }
  }
  if (t)
    contents.push({
      type: 'text',
      text: t
    })
  return contents
}

module.exports = {
  formatTime: formatTime,
  getContents: getContents
}
