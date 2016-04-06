(function (document, window) {
    'use strict';
    var common, that;
    common = {
        initialize: function () {
            that = this;
            that.connected = false;
            that.typing = false;
            that.lastTypingTime = '';
            that.FADE_TIME = 150; // ms
            that.TYPING_TIMER_LENGTH = 400; // ms
            that.COLORS = [
                '#e21400', '#91580f', '#f8a700', '#f78b00',
                '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
                '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
            ];
            that.socket = io.connect('http://localhost:3000/');

            that.reciveChatMessage();

            $('#enterUser').click(function () {
                that.UserConnected();
            });

            $('form').submit(function () {
                that.sendChatMessage();
            });

            $('#m').on('input',function () {
                that.updateTyping();
            });

            that.typingMessage();
            that.removeTypingMessage();

            that.UserDisconnected();
        },
        UserConnected: function () {
            if ($('#name').val() != '') {
                that.userName = $('#name').val();
                $('#user').hide();
                $('#chat').show();
                that.socket.emit('user joined', {
                    msg: that.userName + ' has joined',
                    username: that.userName
                });
                that.connected = true;
            } else {
                alert('Please Enter Your name');
            }
        },
        UserDisconnected:function () {
            that.socket.on('user left',function (data) {
                console.log(data.username);
                var msg = data.username+' left';
                $('#messages').append($('<li>').text(msg));
            });
        },
        sendChatMessage: function () {
            that.msg1 = that.userName + ': ' + $('#m').val();
            that.socket.emit('chat message', {msg: that.msg1});
            $('#m').val('');
        },
        reciveChatMessage: function () {
            that.socket.on('chat message', function (msg) {
                $('#messages').append($('<li>').text(msg));
            });
        },
        updateTyping: function () {
            if(that.connected){
                if(!that.typing){
                    that.typing = true;
                    that.socket.emit('typing');
                }
                that.lastTypingTime = (new Date()).getTime();

                setTimeout(function () {
                    var typingTimer = (new Date()).getTime();
                    var timeDiff = typingTimer - that.lastTypingTime;
                    if(timeDiff >= that.TYPING_TIMER_LENGTH && that.typing){
                        that.socket.emit('stop typing');
                        that.typing = false;
                    }
                },that.TYPING_TIMER_LENGTH);
            }
        },
        typingMessage:function () {
            that.socket.on('typing', function (data) {
                var msg = data.username+' typing...';
                $('#messages').append($('<li>').text(msg));
            });
        },
        removeTypingMessage: function () {
            that.socket.on('stop typing', function (data) {
                var msg = data.username+' typing...';
                $('#messages li').filter(function (i) {
                    var id = $(this)[0].innerHTML == msg;
                    if(id){
                        $(this)[0].remove();
                    }
                });
            });
        }
    };
    window.onload = function () {
        common.initialize();
    };
})(document, window);