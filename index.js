var h = require('hyperscript')
var SuggestBox = require('suggest-box')
var fs = require('fs')

function copy (o) {
  var b = {}
  for(var k in o)
    b[k] = o[k]
  return b
}

exports.gives = {
  compose: {
    text: true,
    insert: true,
    context: true
  }
}

exports.needs = {
  compose: {
    //context adds to the meta object
    //for example, recipients and channel
    context: 'map',
    //insert is able to add to the textarea,
    //for example, inserting blobs, links, etc
    insert: 'map',

    //possibly modify the content after writing.
    post: 'reduce'
  },
  //suggest hooks into compose while typing i.e. "@user"
  //brings up auto suggest for user names starting with "user"
  suggest: 'first'
}

exports.create = function (api) {
  document.head.appendChild(
    h('style', {textContent: fs.readFileSync(__dirname+'/style.css')})
  )
  return {
    compose: {
      text: function (meta, context, onSave) {
        var ta = h('textarea.compose__textarea')

        var button
        var container = h('div.compose',
          h('div.compose__context', api.compose.context(meta, context)),
          ta,
          h('div.compose__actions',
            h('div.compose__insert', api.compose.insert(ta, meta, context)),
            button = h('button', 'publish', {
              onclick: function () {
                var content = copy(meta)
                content.text = ta.value
                content = api.compose.post(content, context)
                //have a confirm pop up,
                //then call a write method (async) which calls back
                //if successful (clear text area) or if error/cancel
                //(keep it the same)
                button.disabled = true
                onSave(content, context, function (err, msg) {
                  button.disabled = false
                  if(!err) ta.value = ''
                  if(err) alert(err.message)
                })
              }
            })
          )
        )

        SuggestBox(ta, function (word, cb) {
          var fn = api.suggest(word)
          if(!fn) return cb()
          fn(word, cb)
        })

        return container
      },
      //include default insert, compose, suggest
      insert: function () {},
      context: function () {},
    },
    suggest: function () {}
  }
}



