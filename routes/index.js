var fs = require('fs');
var dir = require('node-dir');
var path = require('path');
var moment = require('moment');
var musicmetadata = require('musicmetadata');
exports.index = function(req, res){
  var path = 'public/sounds';
  dir.paths(path, function(err, result) {
    if (err) throw err;
    //strip the root path from the files
    parseFiles(result.files,function(err,final){
      res.render('index', { title: 'Soundboard', sounds: final });
    });

  });
};


function parseFiles(paths, cb) {
  var counter = paths.length;
  var errored = false;
  var sounds = [];
  paths.forEach(function (myFile, index) {
    fs.stat(myFile, function(err, stats) {
      if (!err) {
        if(stats.isFile()){
          //remove root dir!
          var pth = path.parse(myFile);
          var parser = musicmetadata(fs.createReadStream(myFile), {duration: true, fileSize: stats.size}, function (err, metadata) {
            //console.log(err);
            //console.log(metadata);
            if (!err) {
              var sound = {};
              var moment_sec = moment().startOf('day').seconds(metadata.duration).format('mm:ss');
              if (metadata.picture.length > 0){
                fs.writeFileSync('public/pictures/' + pth.name + '.' + metadata.picture[0].format, metadata.picture[0].data);
                sound.picture = 'pictures/' + pth.name + '.' + metadata.picture[0].format;
              }
              sound.name = pth.name.replace(/_/g, ' ');
              sound.path = myFile.substring('public/sounds/'.length);
              sound.duration = moment_sec;
              console.log(sound);
              sounds.push(sound);
            } else {
              //console.log(err);
              sounds.push({
                "path": myFile.substring('public/sounds/'.length),
                "name": pth.name.replace(/_/g, ' ')
              });
            }
            if (--counter === 0) {
              cb(null, sounds);
            }
          });
        }
      }
    });
  });
}
