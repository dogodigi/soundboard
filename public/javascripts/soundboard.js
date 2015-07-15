var soundboard = soundboard || {};
soundboard.main = (function(window,document) {
  var _sounds = [];
  var _instances = {};

  var _saveSounds = function() {
    $('li').each(function() {
      var name = $(this).text();
      var $this = $(this);
      var index = $this.find(".soundcard-buttons").data("sound-index");
      var path = $this.find(".soundcard-buttons").data("sound-path");
      createjs.Sound.registerSound("/sounds/" + path, index);
      _instances[index] = createjs.Sound.createInstance(index);
      _instances[index].addEventListener('complete',
        createjs.proxy(function() {
          console.log("finished playing");
          $this.find(".sound-play").removeClass("alert-warning alert-danger alert-success");
          $this.find(".sound-play").children(".glyphicon")
            .removeClass("glyphicon-stop glyphicon-pause")
            .addClass("glyphicon-play");
      }, this));
    });
  };

  var _bindClicks = function() {
    $('.sound-loop').on('click', function() {
      var $this = $(this);
      var index = $this.parent().data("sound-index");
      //disable the button once the loop is set
      if (!_instances[index].playState ||
        _instances[index].playState === createjs.Sound.PLAY_FINISHED) {
          var ppc = new createjs.PlayPropsConfig().set({loop: -1})
          $this.prop('disabled', true);
          $this.removeClass("alert-warning alert-success").addClass("alert-danger");
          _instances[index].play(ppc);
          $this.parent().find(".sound-play").children(".glyphicon")
            .removeClass("glyphicon-play glyphicon-pause")
            .addClass("glyphicon-stop");
      }
    });
    $('.sound-play').on('click', function() {
      var $this = $(this);
      var index = $this.parent().data("sound-index");
      if (!_instances[index].playState ||
        _instances[index].playState === createjs.Sound.PLAY_FINISHED) {
        console.log("start play");
        //not playing, start play
        var ppc = new createjs.PlayPropsConfig().set({loop: 0})
				_instances[index].play(ppc);
        //trackTime(name);
        $this.removeClass("alert-warning alert-danger")
          .addClass("alert-success");
        $this.children(".glyphicon")
          .removeClass("glyphicon-play glyphicon-pause")
          .addClass("glyphicon-stop");
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
        console.log("stop");
        _instances[index].stop();
        $this
          .removeClass("alert-success alert-warning alert-danger")
        $this.children(".glyphicon")
          .removeClass("glyphicon-pause glyphicon-stop")
          .addClass("glyphicon-play");
		  }
    });
    $('#filter').keyup(function () {
        var filter = $("#filter").val();
        $('.soundul').each(function() {
            $(this).find(".panel-body:not(:contains('" + filter + "'))").parent().parent().hide();
            $(this).find(".panel-body:contains('" + filter + "')").parent().parent().show();
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

$(".btn").mouseup(function(){
    $(this).blur();
})
$(document).ready(function() {
  soundboard.main.init();
});
