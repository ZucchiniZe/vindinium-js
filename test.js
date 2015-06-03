var _ = require('lodash')
var colors = require('colors')
var Vind = require('bot');
var Promise = require('bluebird');
var Machine = require('machine')

_.deepEq = function(arr1, arr2) {
  _.each(arr1, (ar1) => {
    _.each(arr2, (ar2) => {
      return _.eq(ar1, ar2)
    })
  })
}

// KEYS
// Hesby: gcvuyehx
// /bin/rm -rf *: j4fkjjlu
// /bin/rm -rf /: adr7zzu6

var vind = new Vind('u6jqlhgk', 'training', 'http://vindinium.org');
// var vind = new Vind('adr7zzu6', 'training', 'http://52.8.116.125:9000');

/**
Behavior tree illustration for debugging purposes
                                 +-------------------+
                                 | Bot Decision Tree |
                                 +-------------------+
                                           |
               +---------------------------+--------------------------+
               |                                                      v
               v                                                +-----------+
         +----------+                                           | isHealthy |
         | inCombat |                                           +-----------+
         +----------+                                                 |
               |                                                      |
               |                         +----------------+-----------+-------+--------------------+
       +-------+------+                  |                |                   |                    |
       |              |                  |                |                   |                    |
       v              v                  v                v                   v                    v
 +-----------+   +---------+       +----------+   +--------------+   +----------------+   +-----------------+
 |shouldFight|   |shouldRun|       |shouldMine|   |shouldSeekMine|   |shouldSeekCombat|   |shouldDrinkAnyway|
 +-----------+   +---------+       +----------+   +--------------+   +----------------+   +-----------------+
*/

function Bot(bot) {
  this.bot = bot
  this.self = bot.yourBot
  this.pos = [bot.yourBot.pos.x, bot.yourBot.pos.y];
  this.dir = '';

  this.enemyBots = [];
  for(let i=1;i<=4;i++) {
    if(bot.yourBot.id !== i && !bot.data.game.heroes[i-1].crashed) this.enemyBots.push(bot['bot'+i])
  }

  this.enemyBotsPos = []
  for(let i=1;i<=4;i++) {
    if(bot.yourBot.id !== i) this.enemyBotsPos.push([bot['bot'+i].pos.x, bot['bot'+i].pos.y])
  }

  this.enemyMines = [];
  for(let i=1;i<=4;i++) {
    if(bot.yourBot.id !== i) this.enemyMines.push(bot['bot'+i+'mines'])
  }
  this.enemyMines = _.flatten(this.enemyMines)

  this.allMines = [];
  this.allMines = bot.freeMines.concat(this.enemyMines)

  this.mineCount = this.allMines.length
  for(let i=1;i<=4;i++) {
    this.mineCount += bot['bot'+i].mineCount
  }

  this.mineOwnage = (bot.yourBot.mineCount / this.mineCount) * 100
}

Bot.prototype = {
  closest: function(place) {
    var close;
    if(typeof place === 'string') {
      close = bot[place][0];
      for(let i=0;i<bot[place].length;i++) {
        if(bot.findDistance(this.pos, close) > bot.findDistance(this.pos, bot[place][i])) {
          close = bot[place][i];
        }
      }
    } else if(place instanceof Array && typeof place[0][0] !== 'undefined') {
      close = place[0];
      for(let i=0;i<place.length;i++) {
        if(bot.findDistance(this.pos, close) > bot.findDistance(this.pos, place[i])) {
          close = place[i];
        }
      }
    }
    return close
  },
  find_closest: function(dist1, dist2) {
    if(dist1 === undefined || dist1.length == 0) {
      return dist2
    } else if(dist2 === undefined || dist2.length == 0) {
      return dist1
    } else {
      if(bot.findDistance(this.pos, closest(dist1)) > bot.findDistance(this.pos, closest(dist2))) {
        return dist1
      } else if(bot.findDistance(this.pos, closest(dist1)) < bot.findDistance(this.pos, closest(dist2))) {
        return dist2
      }
    }
  },
  move_to: function(place) {
    if(!(place instanceof Array) && typeof place[0] == 'undefined' && typeof place[0][0] == 'undefined') {
      console.log(`Moving (${this.pos}) ==> (${place})`)
      return bot.findPath(this.pos, place)
    } else {
      console.log(`Moving (${this.pos}) ==> (${closest(place)})`)
      return bot.findPath(this.pos, closest(place));
    }
  },
  botWithMostMines: function() {
    var allbots = []
    for(let i=1;i<=4;i++) {
      if(i!==4 && (bot['bot'+i].mineCount / this.mineCount)*100 >= 35) {
        allbots.push(i)
      }
    }
    if(allbots.length === 0) {
      return closest(this.enemyBotsPos)
    }
    return [bot['bot'+allbots[allbots.length-1]].pos.x, bot['bot'+allbots[allbots.length-1]].pos.y]
  },
  enemyMineCountHighe: function() {
    for(let i=4;i<=4;i++) {
      if(bot.yourBot.mineCount < bot['bot'+i].mineCount) {
        return true
      }
    }
    return false
  }
}

Bot.states = {
  idle: function() {
    console.log('random direction')
    bot.goDir = ['north', 'south', 'east', 'west'][Math.floor(Math.random() * 4)];
  },
  inCombat: function() {
    return _.deepEq(this.bot.getNeighbors(this.pos), this.enemyBotsPos)
  },
  combat: function() {},
  shouldFight: function() {
    return this.self.life <= 40
  },
  fight: function() {
    this.dir = move_to(closest(this.enemyBotsPos))
  },
  shouldRun: function() {
    return this.self.life >= 40
  },
  run: function() {
    // implement running code
    return false
  },
  isHealthy: function() {
    return this.self.life >= 40
  },
  healthy: function() {},
  shouldMine: function() {
    // TODO: maybe add a function to check if mine is within radius of mines
    return this.mineOwnage <= 30
  },
  mine: function() {
    this.dir = move_to(find_closest(bot.freeMines, enemyMines))
  },
  shouldSeekCombat: function() {
    return this.mineOwnage >= 35
  },
  seekCombat: function() {
    this.dir = move_to(botWithMostMines())
  },
  shouldDrinkAnyway: function() {
    return this.self.life <= 75 && _.contains(this.bot.getNeighbors(pos), closest('taverns'))
  },
  drinkAnyway: function() {
    this.dir = move_to(closest('taverns'))
  },
  isUnHealthy: function() {
    return this.self.life <= 50
  },
  unhealthy: function() {},
  shouldDrink: function() {
    return this.self.life <= 50
  },
  drink: function() {
    this.dir = move_to(closest('taverns'))
  }
}

Vind.prototype.botBrain = function() {
  return new Promise(function(resolve, reject) {

    var tree = require('./tree.json')
    var bot = new Bot(vind);
    var machine = new Machine();

    bot.state = machine.generateTree(tree, bot, Bot.states)

    bot.state = bot.state.tick();

    console.log('Running Task:', colors.green(bot.state.identifier))
    console.log('Moving:', colors.magenta(bot.dir))

    bot.goDir = bot.dir;

    resolve();
  });
}
vind.runGame();