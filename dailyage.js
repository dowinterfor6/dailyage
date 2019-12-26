const weeklies = require('./data/weeklies.json');
const dailies = require('./data/dailies.json');
const inGame = require('./data/inGame.json');

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

      let outputInformation;

      if (msg.content.match(redDragonKeep)) {
        outputInformation = dataReducer("Red Dragon's Keep");
        msg.channel.send(outputInformation);
      } else if (msg.content.match(kadum)) {
        outputInformation = dataReducer("Kadum");
        msg.channel.send(outputInformation);
      } else if (msg.content.match(fishFest)) {
        outputInformation = dataReducer("Mirage Isle Fish Fest");
        msg.channel.send(outputInformation);
      } else if (msg.content.match(abyssal)) {
        outputInformation = dataReducer("Abyssal Attack");
        msg.channel.send(outputInformation);
      } else if (msg.content.match(archepassReset)) {
        outputInformation = dataReducer("Archepass Reset");
        msg.channel.send(outputInformation);
      } else if (msg.content.match(castleSiege)) {
        outputInformation = dataReducer("Castle Siege");
        msg.channel.send(outputInformation);
      } else if (msg.content.match(halcy)) {
        outputInformation = dataReducer("Golden Plains Battle");
        msg.channel.send(outputInformation);
      } else if (msg.content.match(hiramCity)) {
        outputInformation = dataReducer("The Fall of Hiram City");
        msg.channel.send(outputInformation);
      } else if (msg.content.match(delphShip)) {
        outputInformation = dataReducer("Delphinad Ghost Ships");
        msg.channel.send(outputInformation);
      } else if (msg.content.match(lusca)) {
        outputInformation = dataReducer("Lusca Awakening");
        msg.channel.send(outputInformation);
      } else if (msg.content.match(reset)) {
        outputInformation = dataReducer("Daily Reset");
        msg.channel.send(outputInformation);
      } else if (msg.content.match(unknownCommand)) {
        msg.channel.send("Pls send halp");
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
            let formattedTime = formatTime(hour);
            if (Object.keys(this.state[day]).includes(formattedTime)) {
              this.state[day][formattedTime].push(eventName);
            } else {
              this.state[day][formattedTime] = [eventName];
            }
          }
        }
      } else if (type === "Daily") {
        for (let hour of event["Times"]) {
          let formattedTime = formatTime(hour);
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
}

const formatTime = inputHour => {
  let formattedDate = '';

  let hour = Math.floor(inputHour);
  let minutes = 60 * (inputHour % hour);

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

const dataReducer = eventName => {
  if (weeklies[eventName]) {
    return formatData(weeklies[eventName], "Weekly");
  } else if (dailies[eventName]) {
    return formatData(dailies[eventName], "Daily");
  } else if (inGame[eventName]) {
    return formatData(inGame[eventName], "InGame");
  };
  console.log("There's an error with the reducer!");
};

const formatData = (event, type) => {
  let output = `\n${event["Name"]}\`\`\``;
  let timesDisplay = [];

  switch (type) {
    case "Weekly":
      for (let [day, times] of Object.entries(event["Times"])) {
        let weeklyTimes = times.map(time => formatTime(time));
        timesDisplay.push(day + " - " + weeklyTimes.join(', '));
      }
      break;
    case "Daily":
      let dailyTimes = event["Times"].map(time => formatTime(time));
      timesDisplay.push('Daily - ' + dailyTimes.join(', '));
      break;
    case "InGame":
      // TODO
      break;
  }

  let nextEventTime = findNextEvent(event, type);

  return output + timesDisplay.join('\n') + '\`\`\`\n' + `Next ${event["Name"]} in ` + nextEventTime;
}

const findNextEvent = (event, type) => {
  let nextEventDetail = [], 
    nextEventTimeArr, 
    nextEventTimeDifference, 
    nextEventHour, 
    nextEventMinute,
    daysDiff,
    hoursDiff,
    minutesDiff;
  let currentDate = new Date();
  let currentHour = currentDate.getUTCHours() + (currentDate.getUTCMinutes() / 60);
  let currentDay = currentDate.getUTCDay();

  switch(type) {
    case "Weekly":
      let daysArr = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      let tryNextDay = currentDay;

      nextEventTimeArr = event["Times"][daysArr[currentDay]];

      if (nextEventTimeArr && nextEventTimeArr.filter(time => time > currentHour).length > 0) {
        nextEventTimeDifference = nextEventTimeArr[0] - currentHour;
      } else {
        tryNextDay++;
        while (!event["Times"][daysArr[tryNextDay % 7]]) {
          tryNextDay++;
        };
        nextEventTimeDifference = (currentHour > event["Times"][daysArr[tryNextDay % 7]][0]) ? (24 - currentHour + event["Times"][daysArr[tryNextDay % 7]][0]) : (event["Times"][daysArr[tryNextDay % 7]][0] - currentHour);
      }

      nextEventHour = Math.floor(nextEventTimeDifference);
      nextEventMinute = (nextEventTimeDifference - nextEventHour) * 60;

      daysDiff = tryNextDay - currentDay;
      hoursDiff = nextEventHour;
      minutesDiff = Math.round(nextEventMinute);

      if (daysDiff) {
        nextEventDetail.push(formatTimePlurals(daysDiff, 'day'));
      } else if (hoursDiff) {
        nextEventDetail.push(formatTimePlurals(hoursDiff, 'hour'));
      } else if (minutesDiff) {
        nextEventDetail.push(formatTimePlurals(minutesDiff, 'minute'))
      };

      return nextEventDetail.join(' ');
    case "Daily":
      nextEventTimeArr = event["Times"].filter(time => time > currentHour);

      if (nextEventTimeArr.length === 0) {
        nextEventTimeDifference = 24 - currentHour + event["Times"][0];
      } else {
        nextEventTimeDifference = event["Times"][0] - currentHour;
      }

      nextEventHour = Math.floor(nextEventTimeDifference);
      nextEventMinute = (nextEventTimeDifference - nextEventHour) * 60;
      nextEventDetail.push(formatTimePlurals(nextEventHour, 'hour'));
      nextEventDetail.push(formatTimePlurals(Math.round(nextEventMinute), 'minute'))
      return nextEventDetail.join(' ');
    case "InGame":
      break;
  }
}

const formatTimePlurals = (value, unit) => {
  switch(value) {
    case 1:
      return value + ' ' + unit;
    case 0:
      return '';
    default:
      return value + ' ' + unit + 's';
  };
}