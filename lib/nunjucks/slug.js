module.exports = slug

function slug(content, language) {
  var lang = language || 'en'
  if (lang === 'zh' || lang === 'ja') {
    return content
  }

  if (!content) {
    return content
  }

  var spacesToDashes = content.split(' ').join('-').toLowerCase()
  var removeChars = spacesToDashes.replace(/[^a-zA-Z0-9\- ]/g, '')
  return removeChars
}
