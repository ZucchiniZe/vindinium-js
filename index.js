var Bot = require('smt-bot');
var PF = Bot.pathfinding;
var Promise = Bot.promise;
var bot = new Bot('key', 'location', 'url');

// var bot = new Bot('YOUR_KEY_HERE', 'arena', 'http://24.6.28.217:9000'); //Put your bot's code here and change training to Arena when you want to fight others.
var goDir;
Bot.prototype.botBrain = function() {
  return new Promise(function(resolve, reject) {
    _this = bot;
    /* Write your bot below Here */
    /* Set `bot.goDir` in the direction you want to go */  //<--- In this case, set myDir to what you want and it will set bot.goDir to that at the end.

    /*                                      *
     * This Code is global data!            *
     *                                      */

    // Set myDir to what you want and it will set bot.goDir to that direction at the end.  Unless it is "none"
    var myDir;
    var myPos = [bot.yourBot.pos.x, bot.yourBot.pos.y];

    var enemyBots = [];
    if(bot.yourBot.id != 1) enemyBots.push(bot.bot1);
    if(bot.yourBot.id != 2) enemyBots.push(bot.bot2);
    if(bot.yourBot.id != 3) enemyBots.push(bot.bot3);
    if(bot.yourBot.id != 4) enemyBots.push(bot.bot4);

    /*                                      *
     * This Code Decides WHAT to do         *
     *                                      */
    var task;
    task = "freemines";

    /*                                      *
     * This Code Determines HOW to do it    *
     *                                      */

    // This Code find the nearest freemine and sets myDir toward that direction //
    if(task === "freemines") {
      var closestMine = bot.freeMines[0];
      for(i = 0; i < bot.freeMines.length; i++) {
        if(bot.findDistance(myPos, closestMine) > bot.findDistance(myPos, bot.freeMines[i])) {
          closestMine = bot.freeMines[i];
        }
      }
      console.log("Claiming a Free Mine!");
      myDir = bot.findPath(myPos, closestMine);
    }

    /*                                                                                                                              *
     * This Code Sets your direction based on myDir.  If you are trying to go to a place that you can't reach, you move randomly.   *
     * Otherwise you move in the direction set by your code.                                                                        */
    if(myDir === "none") {
      console.log("Going Random!");
      var rand = Math.floor(Math.random() * 4);
      var dirs = ["north", "south", "east", "west"];
      bot.goDir = dirs[rand];
    } else {
      bot.goDir = myDir;
    }



    /* DON'T REMOVE ANTYTHING BELOW THIS LINE */
    resolve();
  });
}
bot.runGame();