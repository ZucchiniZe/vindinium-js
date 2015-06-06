var Bot = require('bot');
var Promise = require('bluebird');
var bot = new Bot('iopmwjz5', 'arena', 'http://52.8.116.125:9000');
Bot.prototype.botBrain = function() {
  return new Promise(function(resolve, reject) {
    _this = bot;
    bot.goDir = "stay"
    resolve();
  });
}
bot.runGame();