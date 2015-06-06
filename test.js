var _ = require('lodash')
var colors = require('colors')
var Vind = require('bot');
var Promise = require('bluebird');

_.deepEq = function(arr1, arr2) {
  var ret_value = false
  _.each(arr1, (ar1) => {
    _.each(arr2, (ar2) => {
      if(_.eq(ar1, ar2)) ret_value = true
    })
  })
  return ret_value
}

// KEYS
// Hesby: gcvuyehx
// /bin/rm -rf *: j4fkjjlu
// /bin/rm -rf /: adr7zzu6
// Alex: ae1hmp6f
// Polish Fury: rz2jsbrq
// Scapegoat: iopmwjz5

// var vind = new Vind('yh3zgrye', 'training', 'http://vindinium.org');
var vind = new Vind('adr7zzu6', 'training', 'http://52.8.116.125:9000');

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

// Initialize the main object with this items
function Bot(bot) {
  this.state = null
  this.bot = bot
  this.self = bot.yourBot
  this.pos = [bot.yourBot.pos.x, bot.yourBot.pos.y];
  this.dir = '';
  this.self.spawnPos = [this.self.spawnPos.x, this.self.spawnPos.y]

  this.enemyBots = [];
  for(let i=1;i<=4;i++) {
    if(bot.yourBot.id !== i && !bot.data.game.heroes[i-1].crashed) this.enemyBots.push(bot['bot'+i])
  }

  this.enemyBotsPos = []
  for(let i=1;i<=4;i++) {
    if(bot.yourBot.id !== i && !bot.data.game.heroes[i-1].crashed) this.enemyBotsPos.push([bot['bot'+i].pos.x, bot['bot'+i].pos.y])
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

  // Find the closest location within array of locations
  this.closest = function(place) {
    var close;
    if(place instanceof Array && place.length !== 0 && typeof place[0][0] == 'undefined') {
      return place
    }
    close = place[0];
    for(let i=0;i<place.length;i++) {
      if(this.bot.findDistance(this.pos, close) > this.bot.findDistance(this.pos, place[i])) {
        close = place[i];
      }
    }
    return close
  }

  // Move to a place according to coordinates
  this.move_to = function(place) {
    var close;
    // console.log('move_to', typeof place, place)
    if(place instanceof Array && typeof place[0][0] == 'undefined') {
      console.log(`Moving (${colors.red(this.pos)}) ==> (${colors.green(place)})`)
      return this.bot.findPath(this.pos, place)
    } else {
      var close = this.closest(place)
      console.log(`Moving (${colors.red(this.pos)}) ==> (${colors.green(place)})`)
      return this.bot.findPath(this.pos, place)
    }
  }
}

Bot.prototype = {
  // Find the bot with the most mines
  botWithMostMines: function() {
    var allbots = []
    for(let i=1;i<=4;i++) {
      if(i!==4 && (this.bot['bot'+i].mineCount / this.mineCount)*100 >= 35) {
        allbots.push(i)
      }
    }
    if(allbots.length === 0) {
      return this.closest(this.enemyBotsPos)
    }
    var mostMinesPos = [this.bot['bot'+allbots[allbots.length-1]].pos.x, this.bot['bot'+allbots[allbots.length-1]].pos.y]
    if(_.eq(mostMinesPos, this.pos)) {
      return this.closest(this.enemyBotsPos)
    }
  },
  // If enemy minecount is higher
  enemyMineCountHigher: function() {
    for(let i=4;i<=4;i++) {
      if(this.bot.yourBot.mineCount < this.bot['bot'+i].mineCount) {
        return true
      }
    }
    return false
  },
  // Check if coordinate is within set radius
  within: function(place, dist) {
    return (Number(this.bot.findDistance(this.pos, place)) >= Number(dist))
  }
}

Bot.states = {
  // Check if in combat
  inCombat: function() {
    return _.deepEq(this.bot.getNeighbors(), this.enemyBotsPos)
  },
  shouldFight: function() {
    return this.self.life <= 40
  },
  fight: function() {
    this.dir = this.move_to(this.closest(this.enemyBotsPos))
  },
  shouldRun: function() {
    return this.self.life >= 40
  },
  run: function() {
    // TODO: implement running code
    this.dir = this.move_to(this.self.spawnPos)
  },
  isHealthy: function() {
    return this.self.life >= 50
  },
  shouldMine: function() {
    return this.mineOwnage <= 30
  },
  mine: function() {
    this.dir = this.move_to(this.closest(this.allMines))
  },
  shouldSeekCombat: function() {
    return this.mineOwnage >= 35
  },
  seekCombat: function() {
    this.dir = this.move_to(this.botWithMostMines())
  },
  shouldDrinkAnyway: function() {
    return this.self.life <= 85 && _.contains(this.bot.getNeighbors(), closest(this.bot.taverns))
  },
  drinkAnyway: function() {
    this.dir = this.move_to(this.closest(this.bot.taverns))
  },
  isUnHealthy: function() {
    return this.self.life <= 50
  },
  shouldDrink: function() {
    return this.self.life <= 50
  },
  drink: function() {
    this.dir = this.move_to(this.closest(this.bot.taverns))
  }
}

Vind.prototype.botBrain = function() {
  return new Promise(function(resolve, reject) {

    var bot = new Bot(vind);

    bot.state = new (require('machine'))().generateTree(require('./tree.json'), bot, Bot.states)

    bot.state = bot.state.tick();
    bot.state = bot.state.tick();
    bot.state = bot.state.tick();

    console.log('Running Behavior:', colors.green(bot.state.identifier))
    console.log('Moving:', colors.magenta(bot.dir))

    vind.goDir = bot.dir

    resolve();
  });
}
vind.runGame();