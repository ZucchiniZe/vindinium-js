var Bot = require('bot');
var Promise = require('bluebird');

// var bot = new Bot('rz2jsbrq', 'training', 'http://vindinium.org'); //Put your bot's code here and change training to Arena when you want to fight others.
var bot = new Bot('j4fkjjlu', 'training', 'http://52.8.116.125:9000'); //Put your bot's code here and change training to Arena when you want to fight others.

var goDir;
Bot.prototype.botBrain = function() {
  return new Promise(function(resolve, reject) {
    var myDir;
    var myPos = [bot.yourBot.pos.x, bot.yourBot.pos.y];
    var enemyBots = [];
    for(i=1;i<=4;i++) {
      if(bot.yourBot.id !== i) enemyBots.push(bot['bot'+i])
    }

    var bot_name = 'mine';

    if(bot_name === 'mine') {
      function closest(place) {
        var close = bot[place][0];
        for(i=0;i<bot[place].length;i++) {
          if(bot.findDistance(myPos, close) > bot.findDistance(myPos, bot[place][i])) {
            close = bot[place][i];
          }
        }
        return close
      }

      var task = 'free mines';

      /*   ___             _ _ _   _
       *  / __|___ _ _  __| (_) |_(_)___ _ _  ___
       * | (__/ _ \ ' \/ _` | |  _| / _ \ ' \(_-<
       *  \___\___/_||_\__,_|_|\__|_\___/_||_/__/
       *
       * Where the initial conditions are run
       */

      if(bot.yourBot.life <= 50) task = 'taverns'
      if(bot.freeMines.length >= 0) task = 'steal mines'

      /*  _____        _
       * |_   _|_ _ __| |__ ___
       *  | |/ _` (_-< / /(_-<
       *  |_|\__,_/__/_\_\/__/
       *
       * Where the tasks run
       */


      if(task === 'free mines') {
        myDir = bot.findPath(myPos, closest('freeMines'));
      } else if(task === 'steal mines') {
        myDir = bot.findPath(myPos, closest('freeMines'));
      } else if(task === 'taverns') {
        myDir = bot.findPath(myPos, closest('taverns'));
      }

      if(myDir === 'none') {
        bot.goDir = ['north', 'south', 'east', 'west'][Math.floor(Math.random() * 4)];
      } else {
        bot.goDir = myDir;
      }
    }

    resolve();
  });
}
bot.runGame();
