var fs = require('fs');
var dir = require('node-dir');
var path = require('path');
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
        var stat = {};
        if(stats.isFile()){
          //remove root dir!
          var pth = path.parse(myFile);
          sounds.push({
            "path": myFile.substring('public/sounds/'.length),
            "name": pth.name
          });
        }
      }
      if (--counter === 0) {
        cb(null, sounds);
      }
    });
  });
}
