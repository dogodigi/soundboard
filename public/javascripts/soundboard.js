var soundboard = soundboard || {};
soundboard.main = (function(window,document) {
  var _sounds = [];
  var _instances = {};

  var _saveSounds = function() {
    $('li').each(function() {
      var name = $(this).text();
      var $this = $(this);
      var index = $this.data("sound-index");
      var path = $this.data("sound-path");
      createjs.Sound.registerSound("/sounds/" + path, index);
      _instances[index] = createjs.Sound.createInstance(index);
      _instances[index].addEventListener('complete',
        createjs.proxy(function() {
          console.log("finished playing");
          $this.removeClass("alert-warning alert-danger alert-success");
          $this.children(".glyphicon")
            .removeClass("glyphicon-play glyphicon-pause")
            .addClass("glyphicon-stop");
      }, this));
    });
  };

  var _bindClicks = function() {
    $('li').on('click', function() {
      var $this = $(this);
      var index = $this.data("sound-index");
      if (!_instances[index].playState ||
        _instances[index].playState === createjs.Sound.PLAY_FINISHED) {
        console.log("start play");
        //not playing, start play
				_instances[index].play();
        //trackTime(name);
        $this.removeClass("alert-warning alert-danger")
          .addClass("alert-success");
        $this.children(".glyphicon")
          .removeClass("glyphicon-stop glyphicon-pause")
          .addClass("glyphicon-play");
				return;
			}
			if (_instances[index].paused) {
        //if pause, then resume play
        console.log("resume from pause");
        _instances[index].play();
        //trackTime(name);
        $this.removeClass("alert-warning alert-danger")
          .addClass("alert-success");
        $this.children(".glyphicon")
          .removeClass("glyphicon-stop glyphicon-pause")
          .addClass("glyphicon-play");
			} else {
        //if playing then pause
        console.log("pausing");
        _instances[index].paused = true;
        $this
          .removeClass("alert-success alert-warning")
          .addClass("alert-danger");
        $this.children(".glyphicon")
          .removeClass("glyphicon-stop glyphicon-play")
          .addClass("glyphicon-pause");
		  }
    });
    $('#filter').keyup(function () {
        var filter = $("#filter").val();
        $('.bs-glyphicons-list').each(function() {
            $(this).find(".glyphicon-class:not(:contains('" + filter + "'))").parent().hide();
            $(this).find(".glyphicon-class:contains('" + filter + "')").parent().show();
        });

    });
  };
  function trackTime(name) {
    setInterval(function (event) {
      instance = _instances[name];
		  console.log(instance.getPosition());
      console.log(instance.getDuration());
    }, 30);
	}

  var self = {
    init: function() {
      _saveSounds();
      _bindClicks();
    }
  };
  return self;
})(this,this.document);

$(document).ready(function() {
  soundboard.main.init();
});
