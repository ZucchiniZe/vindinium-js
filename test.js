var _ = require('lodash')
var colors = require('colors')
var Bot = require('bot');
var PF = require('pathfinding');
var bot = new Bot('u6jqlhgk', 'training', 'http://vindinium.org');
// var bot = new Bot('j4fkjjlu', 'training', 'http://52.8.116.125:9000');
var goDir;
var Promise = require('bluebird');
Bot.prototype.botBrain = function() {
  return new Promise(function(resolve, reject) {
    var dir;
    var pos = [bot.yourBot.pos.x, bot.yourBot.pos.y];

    var enemyBots = [];
    for(i=1;i<=4;i++) {
      if(bot.yourBot.id !== i) enemyBots.push(bot['bot'+i])
    }

    var enemyMines = [];
    for(i=1;i<=4;i++) {
      if(bot.yourBot.id !== i) enemyMines.push(bot['bot'+i+'mines'])
    }
    enemyMines = _.flatten(enemyMines)

    var bot_name = 'mine';

    if(bot_name === 'mine') {
      function closest(place) {
        var close;
        if(typeof place === 'string') {
          close = bot[place][0];
          for(i=0;i<bot[place].length;i++) {
            if(bot.findDistance(pos, close) > bot.findDistance(pos, bot[place][i])) {
              close = bot[place][i];
            }
          }
        } else {
          close = place[0];
          for(i=0;i<place.length;i++) {
            if(bot.findDistance(pos, close) > bot.findDistance(pos, place[i])) {
              close = place[i];
            }
          }
        }
        return close
      }

      function move_to(place) {
        return bot.findPath(pos, closest(place));
      }

      var task = 'free mines';

      //  ___             _ _ _   _
      // / __|___ _ _  __| (_) |_(_)___ _ _  ___
      // | (__/ _ \ ' \/ _` | |  _| / _ \ ' \(_-<
      // \___\___/_||_\__,_|_|\__|_\___/_||_/__/
      //
      // Where the initial conditions are run

      if(bot.freeMines.length <= 0) task = 'steal mines'
      if(bot.yourBot.life <= 50) task = 'taverns' // Always have last so it overrules all other conditionals

      //  _____        _
      // |_   _|_ _ __| |__ ___
      //  | |/ _` (_-< / /(_-<
      //  |_|\__,_/__/_\_\/__/
      //
      // Where the tasks runs

      if(task === 'free mines') {
        dir = move_to('freeMines')
      } else if(task === 'steal mines') {
        dir = move_to(enemyMines)
      } else if(task === 'taverns') {
        dir = move_to('taverns');
      } else if(task === 'kill others') {
        dir = move_to(enemyBots)
      }

      if(dir === 'none') {
        bot.goDir = ['north', 'south', 'east', 'west'][Math.floor(Math.random() * 4)];
      } else {
        bot.goDir = dir;
      }
      console.log('Running Task:', colors.green(task))
    }

    resolve();
  });
}
bot.runGame();