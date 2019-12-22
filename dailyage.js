const weeklies = require('./data/weeklies.json');
const dailies = require('./data/dailies.json');

const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

const offsetTimeCoefficient = 4;
const offsetTime = [0456, 1534];
const offset = 319/30;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  switch(msg.content) {
    case '!schedule': 
      let discordDisplay = new Display();
      let weeklyEventNames = Object.keys(weeklies);

      weeklyEventNames.forEach(eventName => {
        discordDisplay.add(weeklies[eventName], 'Weekly');
      });

      let dailyEventNames = Object.keys(dailies);

      dailyEventNames.forEach(eventName => {
        discordDisplay.add(dailies[eventName], 'Daily');
      })

      msg.channel.send(discordDisplay.show());
      break;
    case '!help':
      msg.channel.send('Use !schedule to see the schedule!');
      break;
    default: 
      let redDragonKeep = /^![r|R]ed.*[d|D]rag.*?$/;
      let kadum = /^![k|K]adum.*?$/;
      let fishFest = /^![M|m]irage.*[I|i]sle.*[F|f]ish.*[F|f]est.*?$|^![F|f]ish.*[F|f]est.*?$/;
      let abyssal = /^![A|a]byssal.*?$|![A|a][A|a].*?$/;
      let archepassReset = /^!.*[P|p]ass.*[R|r]eset.*?$/;
      let castleSiege = /^![C|c]astle.*?$/;
      let halcy = /^![H|h]alcy.*?$|![G|g]old.*[P|p]lain.*?$|![O|o]ok.*?$/;
      let hiramCity = /^![F|f]all.*[H|h]iram.*?$|![H|h]iram.*[C|c]ity.*?$/;
      let delphShip = /^![D|d]elph.*?$/;
      let lusca = /^![L|l]usca.*?$/;
      let reset = /^!.*[R|r]eset.*?$/;
      let unknownCommand = /^!.*$/;

      if (msg.content.match(redDragonKeep)) {
        msg.channel.send('Red Drag Info');
      } else if (msg.content.match(kadum)) {
        msg.channel.send('Kadum Info');
      } else if (msg.content.match(fishFest)) {
        msg.channel.send('Mirage Isle Fish Fest Info');
      } else if (msg.content.match(abyssal)) {
        msg.channel.send('Abyssal Attack Info');
      } else if (msg.content.match(archepassReset)) {
        msg.channel.send('Archepass Reset Info');
      } else if (msg.content.match(castleSiege)) {
        msg.channel.send('Castle Siege Info');
      } else if (msg.content.match(halcy)) {
        msg.channel.send('Golden Plains Battle Info');
      } else if (msg.content.match(hiramCity)) {
        msg.channel.send('The Fall of Hiram City Info');
      } else if (msg.content.match(delphShip)) {
        msg.channel.send('Delphinad Ghost Ships Info');
      } else if (msg.content.match(lusca)) {
        msg.channel.send('Lusca Awakening Info');
      } else if (msg.content.match(reset)) {
        msg.channel.send('Daily Reset Info');
      } else if (msg.content.match(unknownCommand)) {
        msg.channel.send('Unknown command pls send halp');
      };
  }   
});

client.login(auth.token);

class Display {
  constructor() {
    this.state = {
      "Mon": {},
      "Tue": {},
      "Wed": {},
      "Thu": {},
      "Fri": {},
      "Sat": {},
      "Sun": {},
    }
  }

  add(event, type) {
    if (event["Status"]) {
      let eventName = event["Name"];

      if (type === "Weekly") {
        for (let [day, hours] of Object.entries(event["Times"])) {
          for (let hour of hours) {
            let formattedTime = this.formatTime(hour);
            if (Object.keys(this.state[day]).includes(formattedTime)) {
              this.state[day][formattedTime].push(eventName);
            } else {
              this.state[day][formattedTime] = [eventName];
            }
          }
        }
      } else if (type === "Daily") {
        for (let hour of event["Times"]) {
          let formattedTime = this.formatTime(hour);
          for (let [day, hours] of Object.entries(this.state)) {
            if (Object.keys(hours).includes(formattedTime)) {
              this.state[day][formattedTime].push(eventName);
            } else {
              this.state[day][formattedTime] = [eventName];
            }
          }
        }
      } else {
        console.log('How did i get here lmao');
      }
    }
  }

  show() {
    let output = [];
    for (let [day, schedule] of Object.entries(this.state)) {      
      let scheduleDisplay = `\n${day}\`\`\``;
      for (let [time, event] of Object.entries(schedule)) {
        scheduleDisplay += time + ' ' + event.join('\n     ') + '\n';
      }
      scheduleDisplay += '```';

      output.push(scheduleDisplay);
    }

    return output.join('');
  }

  formatTime(inputHour) {
    let formattedDate = '';

    let hour = Math.floor(inputHour);
    let minutes = 60 * inputHour % hour;

    if (hour < 10) {
      formattedDate += '0' + hour;
    } else {
      formattedDate += hour;
    }

    if (minutes > 0) {
      if (minutes < 10) {
        formattedDate += '0' + minutes;
      } else {
        formattedDate += minutes;
      }
    } else {
      formattedDate += '00';
    }
    
    return formattedDate;
  }
}