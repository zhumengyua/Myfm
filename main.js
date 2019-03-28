var EventCenter = {
  on: function (type, handler) {
    $(document).on(type, handler)
  },
  fire: function (type, data) {
    $(document).trigger(type, data)
  }
}

//    EventCenter.on('hello', function(e,data){
//      console.log(data)
//    })

//    EventCenter.fire('hello', '你qq好')




var FooterJs = {
  init: function () {
    this.$footer = $('.footer')
    this.$ul = this.$footer.find('ul')
    this.$Toright = this.$footer.find('.Toright')
    this.$Toleft = this.$footer.find('.Toleft')
    this.$box = this.$footer.find('.box')
    this.isToEnd = false
    this.isToStart = true
    this.isAnimate = false
    //console.log(this.$footer.find('.Toright').prop("outerHTML"))
    this.bind()
    this.render()
    this.renderFooter()
    this.setStyle()
  },
  bind: function () {
    var _this = this
    $(window).resize(function () {
      _this.setStyle()
    })
    var imgWidth = _this.$box.find('li').outerWidth(true) //一个li的长度
    var rowCount = Math.floor(_this.$box.find('ul').outerWidth(true) / imgWidth) //总的ul长度/一个ul的长度，取整，算出有多少个li
    this.$Toleft.on('click', function () {
      if (_this.isAnimate) return
      var itemWidth = _this.$box.find('li').outerWidth(true)
      var rowCount = Math.floor(_this.$box.width() / itemWidth)
      if (!_this.isToStart) {
        _this.isAnimate = true
        _this.$ul.animate({
          left: '+=' + rowCount * itemWidth
        }, 400, function () {
          _this.isAnimate = false
          _this.isToEnd = false
          if (parseFloat(_this.$ul.css('left')) >= 0) {
            _this.isToStart = true
          }
        })
      }
    })
    this.$Toright.on('click', function () {
      if (_this.isAnimate) return
      var itemWidth = _this.$box.find('li').outerWidth(true)
      var rowCount = Math.floor(_this.$box.width() / itemWidth)
      if (!_this.isToEnd) {
        _this.isAnimate = true
        _this.$ul.animate({
          left: '-=' + rowCount * itemWidth
        }, 400, function () {
          _this.isAnimate = false
          _this.isToStart = false
          if (parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width'))) {
            _this.isToEnd = true
          }
        })
      }
    })
    this.$footer.on('click', 'li', function () {
      $(this).addClass('active')
        .siblings().removeClass('active')
      EventCenter.fire('select-albumn', {
        channelId: $(this).attr('data-channel-id'),
        channelName: $(this).attr('data-channel-name')
      })
    })
  },
  render() {
    var _this = this;
    $.getJSON('//jirenguapi.applinzi.com/fm/getChannels.php')
      .done(function (ret) {
        _this.renderFooter(ret.channels)
      })
      .fail(function () {
        console.log("err")
      })
  },

  renderFooter: function (channels) {
    //console.log(channels)
    var html = ''
    if (channels) {
      channels.forEach(function (channel) {
        html += '<li data-channel-id="' + channel.channel_id + '" data-channel-name="' + channel.name + '">' +
          '<div class="imgs" style="background:url(' + channel.cover_small + ');background-size: cover;"></div>' +
          '<h3>' + channel.name + '</h3>' +
          '</li>'
      })
      this.$ul.html(html)
      this.setStyle()
    }
  },

  setStyle: function () {
    var _count = this.$footer.find('li').length //几个li
    var _width = this.$footer.find('li').outerWidth(true) //一个li的长度
    this.$ul.css({
      width: _count * _width + 'px'
    })
  }
}
var Fm = {
  init: function () {
    this.$container = $('.musice-page')
    //console.log(this.$container.prop("outerHTML"))
    this.audio = new Audio()
    this.audio.autoplay = true
    this.$bg = $(".bg")
    this.$leftImage = $(".leftImage").find('figure')
    this.$rightCon = $('.rightCon')
    this.$singerName = $('.singerName')
    this.$tag = $('.tag')
    this.$btnPlay = $('.btn-play')
    this.$btnStop = $('.btn-zanting')
    this.bind()
  },
  bind: function () {
    var _this = this
    EventCenter.on('select-albumn', function (e, channelObj) {
      console
      _this.channelId = channelObj.channelId
      _this.channelName = channelObj.channelName
      _this.loadMusic()
    })
    this.$btnPlay.on('click', function () {
      _this.setPlay()
      console.log("成功")
      _this.audio.play();
    })
    this.$btnStop.on('click', function () {
      _this.$btnStop.hide()
      _this.$btnPlay.show()
      _this.audio.pause();
    })
    this.$container.find('.btn-next').on('click', function () {
      _this.loadMusic()
    })
    this.audio.addEventListener('play', function () {
      console.log('play')
      if (_this.$btnPlay.css('display') == 'inline') {
        _this.setPlay()
      }
      clearInterval(_this.statusClock)
      _this.statusClock = setInterval(function () {
        _this.updateStatus()
      }, 1000)
    })
    this.audio.addEventListener('pause', function () {
      clearInterval(_this.statusClock)
      console.log('push')
    })
    this.$container.find('.btn-like').on('click', function () {
      $(this).hide()
      _this.$container.find('.btn-like2').show()
      _this.heart=_this.heart+1  
      _this.radomHtml()
    })
    this.$container.find('.btn-like2').on('click', function () {
      $(this).hide()
      _this.$container.find('.btn-like').show()
      _this.heart=_this.heart-1  
      _this.radomHtml()
    })


  },
  loadMusic(callback) {
    var _this = this
    console.log('loadMusic..')
    $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php', {
      channel: this.channelId
    }).done(function (ret) {
      _this.song = ret['song'][0]
      _this.setMusic()
      _this.loadLyric()
    _this.radomMath()
      _this.radomHtml()
    })
  },
  loadLyric() {
    var _this = this
    console.log('loadMusic..')
    $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php', {
      sid: this.song.sid
    }).done(function (ret) {
      var lyric = ret.lyric
      var lyricObj = {}
      lyric.split('\n').forEach(function (line) {
        //[01:12:20][01:12:20] It a new day 
        var times = line.match(/\d{2}:\d{2}/g)
        //times ==['01:12:20','01:12:20']
        var str = line.replace(/\[.+?\]/g, '')
        if (Array.isArray(times)) {
          times.forEach(function (time) {
            lyricObj[time] = str
          })
        }
        _this.lyricObj = lyricObj
      })
    })
  },
  setMusic() {
    console.log('set music...')
    //play
    this.audio.src = this.song.url
    //bg
    this.$bg.css('background-image', 'url(' + this.song.picture + ')')
    //leftImage
    this.$leftImage.html("<img src=" + this.song.picture + ">")
    //name
    this.$rightCon.find('h1').html(this.song.title)
    //singerName
    this.$singerName.html(this.song.artist)
    //channels name
    this.$tag.html(Fm.channelName)
    //设置随机数
    this.$container.find('.icons')
  },
  setPlay() {
    this.$btnPlay.hide()
    this.$btnStop.show()
  },
  updateStatus() {
    var timeStr = Math.floor(this.audio.currentTime / 60)
    var second = Math.floor(this.audio.currentTime % 60) + ''
    second = second.length === 2 ? second : '0' + second
    this.$container.find('.time').html(timeStr + ':' + second)
    this.$container.find('.line').css('width', this.audio.currentTime / this.audio.duration * 100 + '%')
    console.log('uploding...')
    var lines = this.lyricObj['0' + timeStr + ':' + second]
    if (lines) {
      this.$container.find('.Lyric').text(lines)
    }
  },
  radomMath(){
    this.listen=parseInt(Math.random()*(99282-1000+1)+1000);   
    this.heart=b=parseInt(Math.random()*(92990-1000+1)+1000);   
    this.laud=parseInt(Math.random()*(99999-1000+1)+1000); 
  },
  radomHtml(){
  this.$container.find('.icons')
  .html( 
    '<li><svg class="icon" aria-hidden="true">'+
  '<use xlink:href="#icon-headset"></use>'+
     '</svg>'+this.listen+'</li>'+
'<li><svg class="icon" aria-hidden="true">'+
  '<use xlink:href="#icon-xihuan"></use>'+
     '</svg>'+this.heart+'</li>'+
'<li><svg class="icon" aria-hidden="true">'+
  '<use xlink:href="#icon-dianzan"></use>'+
     '</svg>'+this.laud+'</li>')
    },

  }

}
FooterJs.init()
Fm.init()
