var soundboard = soundboard || {};

/**
 * Soundboard layouts contain layouts defined for shortcuts
 * Currently contains only qwerty layout. Can be expanded to
 * f.i. azerty
 */
soundboard.layout = {
  "qwerty" : [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
    "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
    "a", "s", "d", "f", "g", "h", "j", "k", "l", ";",
    "z", "x", "c", "v", "b", "n", "m", ",", "."
    // slash cannot be used in firefox, "/"
  ]
};

soundboard.main = (function(window,document) {
  var _sounds = [];
  var _instances = {};

  /**
   * Adds all the sounds available as soundcards
   */
  var _saveSounds = function() {
    $('#soundcards > li').each(function() {
      var name = $(this).text();
      var $this = $(this);
      var index = $this.find(".soundcard-buttons").data("sound-index");
      var path = $this.find(".soundcard-buttons").data("sound-path");
      createjs.Sound.registerSound("/sounds/" + path, index);
      _instances[index] = createjs.Sound.createInstance(index);

      addShortcut($this.find(".soundcard-buttons"),index);

      _instances[index].addEventListener('complete',
        createjs.proxy(function() {
          $this.find(".sound-play").removeClass("alert-warning alert-danger alert-success");
          $this.find(".sound-play").children(".glyphicon")
            .removeClass("glyphicon-stop glyphicon-pause")
            .addClass("glyphicon-play");
      }, this));
    });
  };

  /**
   * Button bindings
   */
  var _bindClicks = function() {

    /**
     * Loop button
     */
    $('.sound-loop').on('click', function() {
      var $this = $(this);
      // Collect data from the click event
      var index = $this.parent().data("sound-index");

      // Check if this instance is not playing
      if (!_instances[index].playState ||
        _instances[index].playState === createjs.Sound.PLAY_FINISHED) {
          // SoundJS logic
          var ppc = new createjs.PlayPropsConfig().set({loop: -1});
          _instances[index].play(ppc);
          trackTime(index, $this.parent());

          // Cosmetics
          $this.prop('disabled', true);
          $this.removeClass("alert-warning alert-success").addClass("alert-danger");
          $this.parent().find(".sound-play").children(".glyphicon")
            .removeClass("glyphicon-play glyphicon-pause")
            .addClass("glyphicon-stop");

      }
    });

    /**
     * Play button.
     *
     * Play button is stop when playing.
     */
    $('.sound-play').on('click', function() {
      var $this = $(this);
      // Collect data from the click event
      var index = $this.parent().data("sound-index");

      // Check if this instance is not playing
      if (!_instances[index].playState ||
        _instances[index].playState === createjs.Sound.PLAY_FINISHED) {
        // SoundJS logic
        var ppc = new createjs.PlayPropsConfig().set({loop: 0});
				_instances[index].play(ppc);
        trackTime(index, $this.parent());

        // Cosmetics
        $this.removeClass("alert-warning alert-danger")
          .addClass("alert-success");
        $this.children(".glyphicon")
          .removeClass("glyphicon-play glyphicon-pause")
          .addClass("glyphicon-stop");
			} else if (_instances[index].paused) {
        // SoundJS logic
        _instances[index].play();
        trackTime(index, $this.parent());

        // Cosmetics
        $this.removeClass("alert-warning alert-danger")
          .addClass("alert-success");
        $this.children(".glyphicon")
          .removeClass("glyphicon-stop glyphicon-pause")
          .addClass("glyphicon-play");
			} else {
        // SoundJS logic
        _instances[index].stop();

        // Cosmetics
        $this.parent().find('.sound-loop')
          .prop('disabled', false)
          .removeClass("alert-warning alert-success alert-danger");
        $this.removeClass("alert-success alert-warning alert-danger");
        $this.children(".glyphicon")
          .removeClass("glyphicon-pause glyphicon-stop")
          .addClass("glyphicon-play");
		  }
    });

    /**
     * Filter input.
     *
     * Checks to see if the track label in a soundcard matches user input.
     * hides all the divs that do not match and only shows matching divs.
     */
    $('#soundboard-filter').keyup(function () {
        var filter = $("#soundboard-filter").val();
        $('#soundcards').each(function() {
            $(this).find(".panel-body:not(:contains('" + filter + "'))").parent().parent().hide();
            $(this).find(".panel-body:contains('" + filter + "')").parent().parent().show();
        });

    });

    /**
     * Mouseup event on buttons
     */
    $(".btn").mouseup(function(){
        $(this).blur();
    });
  };

  /**
   * Helper functions
   */

   /**
    * Add a shortcut to the track from the soundboard.layout
    * Currently takes the qwerty keyboard layout.
    *
    * If the index number is to high to fit the layout,
    * No shortcut is set.
    */
   function addShortcut(parent, index){
     //check if the index exists in the layout, if so, add a shortcut button
     if(soundboard.layout.qwerty[index]){
       var shortcutbutton = $('<button/>');
       shortcutbutton
         .addClass('btn btn-default sound-shortcut')
         .prop('title', 'shortcut')
         .prop('disabled', true);
       shortcutbutton.html('<span class="shortcut">' + soundboard.layout.qwerty[index] + '</span>');
       parent.append(shortcutbutton);
       Mousetrap.bind(soundboard.layout.qwerty[index], function(e){
         parent.find('.sound-play').click();
         console.log(e);
       });
     }
   }

   /**
    * Convert Milliseconds into readable mm:ss label
    */
   function convertMS(ms) {
    if (ms < 0) {
      return "00:00";
    }
    var d, h, m, s;
    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;
    d = Math.floor(h / 24);
    h = h % 24;
    pad = pad = function(n){ return n < 10 ? '0' + n : n; };
    ms = parseInt(ms % 1000);
    return [pad(m), pad(s)].join(':');
  }

  /**
   * Animate a progressbar to show the remaining time of a track.
   * Reset when track reaches end.
   */
  function trackTime(index, soundcard) {
    var ivID;
    var progressbar = $(soundcard).parent().parent().find(".progress-bar");
    var progresslabel = $(soundcard).parent().parent().find(".progress-label");
    progressbar.show();
    ivID = setInterval(function (event) {
      instance = _instances[index];
      var min = 0;
		  var current = instance.getPosition();
      var max = parseInt(instance.getDuration());
      progresslabel.html(convertMS(max - current));
      var pos = parseInt(100 - ((current/max) * 100));
      switch(true) {
        case (pos < 21):
          progressbar
            .removeClass("progress-bar-success progress-bar-warning")
            .addClass("progress-bar-danger");
          break;
        case (pos > 20 && pos < 51):
          progressbar
            .removeClass("progress-bar-success progress-bar-danger")
            .addClass("progress-bar-warning");
          break;
        case (pos > 50):
          progressbar
            .removeClass("progress-bar-warning progress-bar-danger")
            .addClass("progress-bar-success");
          break;
      }
      progressbar.css( "width", pos + "%");
      if(pos === 100){
        clearInterval(ivID);
        progresslabel.html(convertMS(max));
        progressbar
          .removeClass("progress-bar-warning progress-bar-danger progress-bar-success");
      }
    }, 30);
	}

  /**
   * Initialize the application
   */
  var self = {
    init: function() {
      _saveSounds();
      _bindClicks();
    }
  };
  return self;
})(this,this.document);

/**
 * Start the application __main__
 */
$(document).ready(function() {
  soundboard.main.init();
  $('.sortable').sortable();

});
