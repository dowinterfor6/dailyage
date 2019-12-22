const weeklies = require('./data/weeklies.json');

const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === '!schedule') {
      let weeklyDisplay = new Display();
      let weeklyEventNames = Object.keys(weeklies);

      weeklyEventNames.forEach(eventName => {
        weeklyDisplay.add(weeklies[eventName]);
      })

      msg.reply(weeklyDisplay.print());
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

  add(event) {
    if (event["Status"]) {
      let eventName = event["Name"];
      for (let [day, hours] of Object.entries(event["Times"])) {
        for (let hour of hours) {
          // console.log(eventName + "@ " + day + "@ " + hour);
          if (Object.keys(this.state[day]).includes(hour)) {
            this.state[day][hour].push(eventName);
          } else {
            this.state[day][hour] = [eventName];
          }
        }
      }
    }
  }

  print() {
    let output = [];
    for (let [day, schedule] of Object.entries(this.state)) {      
      let scheduleDisplay = `\n${day}\`\`\``;
      for (let [time, event] of Object.entries(schedule)) {
        scheduleDisplay += time + ' ' + event.join(', ') + '\n';
      }
      scheduleDisplay += '```';

      output.push(scheduleDisplay);
    }

    return output.join('');
  }
}