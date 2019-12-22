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
      // TODO regex check 
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