var Bot = require('bot');
var PF = require('pathfinding');
// var bot = new Bot('5i3misix', 'training', 'http://vindinium.org'); //Put your bot's code here and change training to Arena when you want to fight others.
var bot = new Bot('vu4wxtdi', 'arena', 'http://52.8.116.125:9000'); //Put your bot's code here and change training to Arena when you want to fight others.
var goDir;
var Promise = require('bluebird');
Bot.prototype.botBrain = function() {
    return new Promise(function(resolve, reject) {
        _this = bot;
        //////* Write your bot below Here *//////
        //////* Set `myDir` in the direction you want to go and then bot.goDir is set to myDir at the bottom *////////


        /*                                      *
         * This Code is global data!            *
         *                                      */
        // Set myDir to what you want and it will set bot.goDir to that direction at the end.  Unless it is "none"
        var myDir;
        var myPos = [bot.yourBot.pos.x, bot.yourBot.pos.y];
        // Grabs all Enemy bots in an Array and then removes those that cannot be reached this round.
        var enemyBots = [];
        if(bot.yourBot.id != 1 && !bot.data.game.heroes[0].crashed) enemyBots.push(bot.bot1);
        if(bot.yourBot.id != 2 && !bot.data.game.heroes[1].crashed) enemyBots.push(bot.bot2);
        if(bot.yourBot.id != 3 && !bot.data.game.heroes[2].crashed) enemyBots.push(bot.bot3);
        if(bot.yourBot.id != 4 && !bot.data.game.heroes[3].crashed) enemyBots.push(bot.bot4);
        console.log("the bots: " + enemyBots);


        // Determines the index of the closest enemy
        var closestEnemyIndex = 0;
        for(i = 0; i < enemyBots.length; i++) {
            if(bot.findDistance(myPos, [enemyBots[closestEnemyIndex].pos.x, enemyBots[closestEnemyIndex].pos.y]) > bot.findDistance(myPos, [enemyBots[i].pos.x, enemyBots[i].pos.y])) {
                closestEnemyIndex = i;
            }
        }
        // Determines the index of the richest enemy
        var richestEnemyIndex = 0;
        for(i = 0; i < enemyBots.length; i++) {
            if(enemyBots[richestEnemyIndex].gold < enemyBots[i].gold) {
                richestEnemyIndex = i;
            }
        }
        // Determines the position of the nearest tavern
        var closestTavern = bot.taverns[0];
        for(i = 0; i < bot.taverns.length; i++) {
            if(bot.findDistance(myPos, closestTavern) > bot.findDistance(myPos, bot.taverns[i])) {
                closestMine = bot.taverns[i];
            }
        }


        for(i = 0; i < enemyBots.length; i++) {
            if(bot.findPath(myPos, [enemyBots[i].pos.x, enemyBots[i].pos.y]) === "none") {
                var tempIndex = enemyBots.indexOf(enemyBots[i]);
                enemyBots.splice(tempIndex, 1);
            }
        }
        // Grabs all mines that are not mine and removes those that cannot be reached this round.
        var wantedMines = [];
        wantedMines = wantedMines.concat(bot.freeMines);
        if(bot.yourBot.id != 1) wantedMines = wantedMines.concat(bot.bot1mines);
        if(bot.yourBot.id != 2) wantedMines = wantedMines.concat(bot.bot2mines);
        if(bot.yourBot.id != 3) wantedMines = wantedMines.concat(bot.bot3mines);
        if(bot.yourBot.id != 4) wantedMines = wantedMines.concat(bot.bot4mines);
        console.log("not my mines: " + wantedMines);
        for(i = 0; i < wantedMines.length; i++) {
            if(bot.findPath(myPos, wantedMines[i]) === "none") {
                var tempIndex = wantedMines.indexOf(wantedMines[i]);
                wantedMines.splice(tempIndex, 1);
            }
        }
        // Removes all taverns that cannot be reached this round.
        for(i = 0; i < bot.taverns.length; i++) {
            if(bot.findPath(myPos, bot.taverns[i]) === "none") {
                var tempIndex = bot.taverns[i];
                bot.taverns.splice(tempIndex, 1);
            }
        }
        /*                                      *
         * Functions for Checking stuff out     *
         *                                      */


        /*                                      *
         * This Code Decides WHAT to do         *
         *                                      */
        var greed = 0;
        var anger = 0;
        var fear = 0;
        // Determine your Greed! //
        greed += 105;
        if(enemyBots[richestEnemyIndex].gold - bot.yourBot.gold > 100) {} else {
            greed += enemyBots[richestEnemyIndex].gold - bot.yourBot.gold;
        }
        // Determine Your Fear! //
        fear += 138 - bot.yourBot.life //+ bot.findDistance(myPos, closestTavern) - (2 * bot.data.game.board.size)
        if(bot.findDistance(myPos, closestTavern) < 4) {
            fear += 10;
        }
        if(bot.yourBot.gold < 2) fear = 0;
        // Determine your Anger!! //
        anger += 160 - Math.floor(bot.findDistance(myPos, [enemyBots[closestEnemyIndex].pos.x, enemyBots[closestEnemyIndex].pos.y]) / (2 * bot.data.game.board.size) * 100) - Math.floor(bot.findDistance(myPos, [enemyBots[richestEnemyIndex].pos.x, enemyBots[richestEnemyIndex].pos.y]) / (2 * bot.data.game.board.size) * 100)
        if(bot.findDistance(myPos, [enemyBots[closestEnemyIndex].pos.x, enemyBots[closestEnemyIndex].pos.y]) < 4 && enemyBots[closestEnemyIndex].life > bot.yourBot.life) {
            fear += 10;
        }


        /*                                      *
         * This Code Determines HOW to do it    *
         *                                      */
        console.log("Greed! " + greed + "| Anger! " + anger + "|fear! " + fear);
        // This Code find the nearest freemine and sets myDir toward that direction //
        if(fear >= anger && fear >= greed) {
            console.log("Run Away!!!!");
            myDir = bot.findPath(myPos, closestTavern);
        } else if(anger >= greed && anger >= fear) {
            var closestBotIndex = 0;
            for(i = 0; i < enemyBots.length; i++) {
                if(bot.findDistance(myPos, [enemyBots[closestBotIndex].pos.x, enemyBots[closestBotIndex].pos.y]) > bot.findDistance(myPos, [enemyBots[i].pos.x, enemyBots[i].pos.y])) {
                    closestBotIndex = i;
                }
            }
            console.log("FIGHT FIGTH FIGHT!");
            myDir = bot.findPath(myPos, [enemyBots[closestBotIndex].pos.x, enemyBots[closestBotIndex].pos.y]);
        } else if(bot.yourBot.life < 25) {
            console.log("I should probably not die");
            myDir = bot.findPath(myPos, closestTavern);
        } else {
            var closestMine = wantedMines[0];
            for(i = 0; i < wantedMines.length; i++) {
                if(bot.findDistance(myPos, closestMine) > bot.findDistance(myPos, wantedMines[i])) {
                    closestMine = wantedMines[i];
                }
            }
            console.log("Claiming a mine!!");
            myDir = bot.findPath(myPos, closestMine);
        }
        /*                                                                                                                              *
         * This Code Sets your direction based on myDir.  If you are trying to go to a place that you can't reach, you move randomly.   *
         * Otherwise you move in the direction set by your code.  Feel free to change this code if you want.                            */
        if(myDir === "none") {
            console.log("Going Random!");
            var rand = Math.floor(Math.random() * 4);
            var dirs = ["north", "south", "east", "west"];
            bot.goDir = dirs[rand];
        } else {
            bot.goDir = myDir;
        }
        ///////////* DON'T REMOVE ANTYTHING BELOW THIS LINE *//////////////
        resolve();
    });
}
bot.runGame();