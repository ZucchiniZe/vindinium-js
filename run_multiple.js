var argv = require('minimist')(process.argv.slice(2));
var spawn = require('child_process').spawn;
var bots = [];

var name = argv._[0] || 'scapegoat'
var run_n_times = argv.t || 2;

for(var i = 0; i < run_n_times; i++) {
  var child = spawn('./node_modules/babel/bin/babel-node', [name]);
  child.stderr.on('data', function(buffer){console.log(buffer.toString())})
  bots.push(child);
}

console.log('%s %s %s been run', run_n_times, name, run_n_times == 1 ? 'bot has' : 'bots have')

process.on('SIGINT', function() {
  for(var i = 0; i < bots.length; i++) {
    var bot = bots[i];
    bot.kill();
  }
  console.log('Closed all the bots')
});