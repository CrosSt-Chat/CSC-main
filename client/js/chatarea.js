function pushMessage(args) {
  // Message container
  var messageEl = document.createElement('div');

  if (
    typeof (myNick) === 'string' && (
      args.text.match(new RegExp('@' + myNick + '\\b', "gi")) ||
      ((args.type === "whisper" || args.type === "invite") && args.from)
    )
  ) {
    notify();
  }

  messageEl.classList.add('message');

  if (myNick.length > 0 && args.nick == myNick) {
    messageEl.classList.add('me');
  } else if (args.nick == '!') {
    messageEl.classList.add('warn');
  } else if (args.nick == '*') {
    messageEl.classList.add('info');
  } else if (args.admin) {
    messageEl.classList.add('admin');
  } else if (args.member) {
    messageEl.classList.add('member');
  }

  // Nickname
  var nickSpanEl = document.createElement('span');
  nickSpanEl.classList.add('nick');
  messageEl.appendChild(nickSpanEl);

  if (args.trip) {
    var tripEl = document.createElement('span');
    tripEl.textContent = args.trip + " ";
    tripEl.classList.add('trip');
    nickSpanEl.appendChild(tripEl);
  }

  if (args.nick) {
    var nickLinkEl = document.createElement('a');
    nickLinkEl.textContent = args.nick;

    nickLinkEl.onclick = function () {
      // Temporary quick banning
      if ( $('#chatinput').value.trim() == '#ban') {
        // Ban a user though a message
        if( args.type == 'chat') {
          send({ cmd: 'ban', nick: args.nick });
          return;
        }

        // Ban a user though a whisper
        if( args.type == 'whisper' && args.nick.startsWith('【收到私聊】 ')) {
          send({ cmd: 'ban', nick: args.from });
          return;
        }

        // Ban a user though an invite
        if( args.type == 'invite') {
          send({ cmd: 'ban', nick: args.from });
          return;
        }

        // Ban a user though a online notice
        if( args.type == 'join') {
          send({ cmd: 'ban', nick: args.user });
          return;
        }

        return;
      }

      // Reply to a whisper or info is meaningless
      if ( args.type == 'whisper' || args.nick == '*' || args.nick == '!' ) {
        insertAtCursor( args.text );
        $('#chat-input').focus();
        return;
      }

      let replyText = '';
      let originalText = args.text;
      let overlongText = false;
      
      // Cut overlong text
      if ( originalText.length > 350 ) {
        replyText = originalText.slice(0, 350);
        overlongText = true;
      }

      // Add nickname
      if ( args.trip ) {
        replyText = '>' + args.trip + ' ' + args.nick + '：\n';
      } else {
        replyText = '>' + args.nick + '：\n';
      }

      // Split text by line
      originalText = originalText.split('\n');

      // Cut overlong lines
      if ( originalText.length >= 8 ) {
        originalText = originalText.slice(0, 8);
        overlongText = true;
      }

      for ( let replyLine of originalText ) {
        // Cut third replied text
        if ( !replyLine.startsWith('>>')) {
          replyText += '>' + replyLine + '\n';
        }
      }

      // Add elipsis if text is cutted
      if ( overlongText ) {
        replyText += '>……\n';
      }
      replyText += '\n';

      // Add mention when reply to others
      if ( args.nick != myNick ) {
        replyText += '@' + args.nick + ' ';
      }

      // Insert reply text
      replyText += $('#chatinput').value;

      $('#chatinput').value = '';
      insertAtCursor( replyText );
      $('#chatinput').focus();
    }

    // Mention someone when right-clicking
    nickLinkEl.oncontextmenu = function ( e ) {
      // Reply to a whisper or info is meaningless
      if ( args.type == 'whisper' || args.nick == '*' || args.nick == '!' ) {
        return true;
      } else {
        e.preventDefault();
        insertAtCursor( '@' + args.nick + ' ' );
        $('#chatinput').focus();
        return false;
      }
    }

    var date = new Date(args.time || Date.now());
    nickLinkEl.title = date.toLocaleString();
    nickSpanEl.appendChild(nickLinkEl);
  }

  // Text
  var textEl = document.createElement('p');
  textEl.classList.add('text');
  textEl.innerHTML = md.render(args.text);

  messageEl.appendChild(textEl);

  // Scroll to bottom
  var atBottom = isAtBottom();
  $('#messages').appendChild(messageEl);
  if (atBottom) {
    window.scrollTo(0, document.body.scrollHeight);
  }

  if (args.trip != "/Time/") {
    unread += 1;
  }
  
  updateTitle();
}

function pushHTML(args) {
  // Message container
  var messageEl = document.createElement('div');

  messageEl.classList.add('message');

  if (myNick && args.nick == myNick) {
    messageEl.classList.add('me');
  } else if (args.nick == '!') {
    messageEl.classList.add('warn');
  } else if (args.nick == '*') {
    messageEl.classList.add('info');
  } else if (args.admin) {
    messageEl.classList.add('admin');
  } else if (args.member) {
    messageEl.classList.add('member');
  }

  // Nickname
  var nickSpanEl = document.createElement('span');
  nickSpanEl.classList.add('nick');
  messageEl.appendChild(nickSpanEl);

  if (args.trip) {
    var tripEl = document.createElement('span');
    tripEl.textContent = args.trip + " ";
    tripEl.classList.add('trip');
    nickSpanEl.appendChild(tripEl);
  }

  if (args.nick) {
    var nickLinkEl = document.createElement('a');
    nickLinkEl.textContent = args.nick;

    var date = new Date(args.time || Date.now());
    nickLinkEl.title = date.toLocaleString();
    nickSpanEl.appendChild(nickLinkEl);
  }

  // Text
  var textEl = document.createElement('div');
  textEl.classList.add('text');
  textEl.innerHTML = args.text;

  messageEl.appendChild(textEl);

  // Scroll to bottom
  var atBottom = isAtBottom();
  $('#messages').appendChild(messageEl);
  if (atBottom) {
    window.scrollTo(0, document.body.scrollHeight);
  }
  
  updateTitle();
}

function insertAtCursor(text) {
  var input = $('#chatinput');
  var start = input.selectionStart || 0;
  var before = input.value.substr(0, start);
  var after = input.value.substr(start);

  before += text;
  input.value = before + after;
  input.selectionStart = input.selectionEnd = before.length;

  updateInputSize();
}

var windowActive = true;
var unread = 0;

window.onfocus = function () {
  windowActive = true;

  updateTitle();
}

window.onblur = function () {
  windowActive = false;
}

window.onscroll = function () {
  if (isAtBottom()) {
    updateTitle();
  }
}

function isAtBottom() {
  return (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 1);
}

function updateTitle() {
  if (windowActive && isAtBottom()) {
    unread = 0;
  }

  var title;
  if (myChannel) {
    if (myChannel.startsWith("Pri_")) {
      title = "随机生成的聊天室 - 十字街";
    }
    else {
      title = myChannel + " - 十字街";
    }
  } else {
    title = "十字街";
  }

  if (unread > 0) {
    title = '[' + unread + '] ' + title;
  }

  document.title = title;
}


$('#footer').onclick = function () {
  $('#chatinput').focus();
}

$('#chatinput').onkeydown = function (e) {
  if (e.keyCode == 13 /* ENTER */ && !e.shiftKey) {
    e.preventDefault();

    // Submit message
    if (e.target.value != '') {
      var text = e.target.value;
      e.target.value = '';

      send({ cmd: 'chat', text: text });

      lastSent[0] = text;
      lastSent.unshift("");
      lastSentPos = 0;

      updateInputSize();
    }
  } else if (e.keyCode == 38 /* UP */) {
    // Restore previous sent messages
    if (e.target.selectionStart === 0 && lastSentPos < lastSent.length - 1) {
      e.preventDefault();

      if (lastSentPos == 0) {
        lastSent[0] = e.target.value;
      }

      lastSentPos += 1;
      e.target.value = lastSent[lastSentPos];
      e.target.selectionStart = e.target.selectionEnd = e.target.value.length;

      updateInputSize();
    }
  } else if (e.keyCode == 40 /* DOWN */) {
    if (e.target.selectionStart === e.target.value.length && lastSentPos > 0) {
      e.preventDefault();

      lastSentPos -= 1;
      e.target.value = lastSent[lastSentPos];
      e.target.selectionStart = e.target.selectionEnd = 0;

      updateInputSize();
    }
  } else if (e.keyCode == 27 /* ESC */) {
    e.preventDefault();

    // Clear input field
    e.target.value = "";
    lastSentPos = 0;
    lastSent[lastSentPos] = "";

    updateInputSize();
  } else if (e.keyCode == 9 /* TAB */) {
    // Tab complete nicknames starting with @

    if (e.ctrlKey) {
      // Skip autocompletion and tab insertion if user is pressing ctrl
      // ctrl-tab is used by browsers to cycle through tabs
      return;
    }
    e.preventDefault();

    var pos = e.target.selectionStart || 0;
    var text = e.target.value;
    var index = text.lastIndexOf('@', pos);

    var autocompletedNick = false;

    if (index >= 0) {
      var stub = text.substring(index + 1, pos).toLowerCase();
      // Search for nick beginning with stub
      var nicks = onlineUsers.filter(function (nick) {
        return nick.toLowerCase().indexOf(stub) == 0
      });

      if (nicks.length > 0) {
        autocompletedNick = true;
        if (nicks.length == 1) {
          insertAtCursor(nicks[0].substr(stub.length) + " ");
        }
      }
    }

    // Since we did not insert a nick, we insert a tab character
    if (!autocompletedNick) {
      insertAtCursor('\t');
    }
  }
}

function updateInputSize() {
  var atBottom = isAtBottom();

  var input = $('#chatinput');
  input.style.height = 0;
  input.style.height = ( input.scrollHeight + 1 ) + 'px';
  document.body.style.marginBottom = $('#footer').offsetHeight + 'px';

  if (atBottom) {
    window.scrollTo(0, document.body.scrollHeight);
  }
}

$('#chatinput').oninput = function () {
  updateInputSize();
}
