var Bot = require('bot');
var Promise = require('bluebird');
var bot = new Bot('vu4wxtdi', 'arena', 'http://52.8.116.125:9000');
Bot.prototype.botBrain = function() {
  return new Promise(function(resolve, reject) {
    _this = bot;
    var hesby;
    for(i=1;i<=4;i++) {
      if(bot.yourBot.id !== i && bot.data.game.heroes[i-1].name === 'hesby') {
        hesby = [bot['bot'+i].pos.x, bot['bot'+i].pos.y]
      }
    }
    console.log('Hesby is at', hesby)
    bot.goDir = bot.findPath([bot.yourBot.pos.x, bot.yourBot.pos.y], hesby) || 'stay'
    resolve();
  });
}
bot.runGame();