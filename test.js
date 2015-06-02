var _ = require('lodash')
var colors = require('colors')
var Bot = require('bot');
var PF = require('pathfinding');
// KEYS
// Hesby: gcvuyehx
// /bin/rm -rf *: j4fkjjlu
// /bin/rm -rf /: adr7zzu6

// var bot = new Bot('u6jqlhgk', 'training', 'http://vindinium.org');
var bot = new Bot('adr7zzu6', 'training', 'http://52.8.116.125:9000');

var goDir;
var Promise = require('bluebird');
Bot.prototype.botBrain = function() {
  return new Promise(function(resolve, reject) {
    var dir;
    var pos = [bot.yourBot.pos.x, bot.yourBot.pos.y];

    //    _          _                         _
    //   /_\   _____(_)__ _ _ _  _ __  ___ _ _| |_ ___
    //  / _ \ (_-<_-< / _` | ' \| '  \/ -_) ' \  _(_-<
    // /_/ \_\/__/__/_\__, |_||_|_|_|_\___|_||_\__/__/
    //                |___/
    //
    // Where arrays with things are initialized

    var enemyBots = [];
    for(let i=1;i<=4;i++) {
      if(bot.yourBot.id !== i && !bot.data.game.heroes[i-1].crashed) enemyBots.push(bot['bot'+i])
    }

    var enemyBotsPos = []
    for(let i=1;i<=4;i++) {
      if(bot.yourBot.id !== i) enemyBotsPos.push([bot['bot'+i].pos.x, bot['bot'+i].pos.y])
    }

    var enemyMines = [];
    for(let i=1;i<=4;i++) {
      if(bot.yourBot.id !== i) enemyMines.push(bot['bot'+i+'mines'])
    }
    enemyMines = _.flatten(enemyMines)

    var allMines = [];
    allMines = bot.freeMines.concat(enemyMines)

    var mineCount = allMines.length
    for(let i=1;i<=4;i++) {
      mineCount += bot['bot'+i].mineCount
    }

    var mineOwnage = (bot.yourBot.mineCount / mineCount) * 100

    function botWithMostMines() {
      var allbots = []
      for(let i=1;i<=4;i++) {
        if(i!==4 && bot['bot'+i].mineCount > bot['bot'+(i+1)].mineCount) {
          allbots.push(i)
        }
      }
      if(allbots.length === 0) {
        return false
      }
      return [bot['bot'+allbots[allbots.length-1]].pos.x, bot['bot'+allbots[allbots.length-1]].pos.y]
    }

    var bot_name = 'mine';

    if(bot_name === 'mine') {

      //  _  _     _
      // | || |___| |_ __  ___ _ _ ___
      // | __ / -_) | '_ \/ -_) '_(_-<
      // |_||_\___|_| .__/\___|_| /__/
      //          |_|
      //
      // Helper functions to easily move around

      function closest(place) {
        var close;
        if(typeof place === 'string') {
          close = bot[place][0];
          for(let i=0;i<bot[place].length;i++) {
            if(bot.findDistance(pos, close) > bot.findDistance(pos, bot[place][i])) {
              close = bot[place][i];
            }
          }
        } else if(place instanceof Array && typeof place[0][0] !== 'undefined') {
          close = place[0];
          for(let i=0;i<place.length;i++) {
            if(bot.findDistance(pos, close) > bot.findDistance(pos, place[i])) {
              close = place[i];
            }
          }
        }
        return close
      }

      function find_closest(dist1, dist2) {
        if(dist1 === undefined || dist1.length == 0) {
          return dist2
        } else if(dist2 === undefined || dist2.length == 0) {
          return dist1
        } else {
          if(bot.findDistance(pos, closest(dist1)) > bot.findDistance(pos, closest(dist2))) {
            return dist1
          } else if(bot.findDistance(pos, closest(dist1)) < bot.findDistance(pos, closest(dist2))) {
            return dist2
          }
        }
      }

      function move_to(place) {
        if(!(place[0] instanceof Array) && typeof place[0][0] == 'undefined') {
          console.log(`Moving (${pos}) --> (${place})`)
          return bot.findPath(pos, place)
        } else {
          console.log(`Moving (${pos}) --> (${closest(place)})`)
          return bot.findPath(pos, closest(place));
        }
      }

      var task = 'all mines';

      //  ___             _ _ _   _
      // / __|___ _ _  __| (_) |_(_)___ _ _  ___
      // | (__/ _ \ ' \/ _` | |  _| / _ \ ' \(_-<
      // \___\___/_||_\__,_|_|\__|_\___/_||_/__/
      //
      // Where the initial conditions are run

      if(mineOwnage <= 15) task = 'all mines'
      if(botWithMostMines()) task = 'kill with most mines'
      if(mineOwnage >= 25) task = 'kill others'
      if(bot.yourBot.life <= 40) task = 'heal' // Always have last so it overrules all other conditionals

      //  _____        _
      // |_   _|_ _ __| |__ ___
      //  | |/ _` (_-< / /(_-<
      //  |_|\__,_/__/_\_\/__/
      //
      // Where the tasks runs

      if(task === 'all mines') {
        dir = move_to(find_closest(bot.freeMines, enemyMines))
      } else if(task === 'heal') {
        dir = move_to('taverns');
      } else if(task === 'kill with most mines') {
        dir = move_to(botWithMostMines())
      } else if(task === 'kill others') {
        dir = move_to(enemyBotsPos)
      }

      if(dir === 'none') {
        console.log('random direction')
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