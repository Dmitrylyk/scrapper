const { JSDOM } = require('jsdom');
const request = require('request');

const url = 'http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx';

const start = function start(groupID) {
  return getGroupUrl(url, groupID).then(groupUrl => {
    return parse(groupUrl)
  },
  error => {
    throw (error)
  })
};


function getWeekData (id, document) {
  if (document.getElementById(id) === null || document.getElementById(id).getElementsByTagName('tr') === null) {
    throw "Error";
  }

  return document.getElementById(id).getElementsByTagName('tr');
}


function getRowData (document) {
  if (document.getElementsByTagName('td') === null) {
    throw "Error";
  }

  return document.getElementsByTagName('td');
}


function parse(url) {
  return JSDOM.fromURL(url).then(dom => {
  const document = dom.window.document;
  const first = dom.window.document.getElementById('ctl00_MainContent_FirstScheduleTable');
  const second = dom.window.document.getElementById('ctl00_MainContent_SecondScheduleTable');

  const firstByTr = first.querySelectorAll('tr');
  const secondByTr = second.querySelectorAll('tr');



  let firstWeek = parseWeek(firstByTr);
  let secondWeek = parseWeek(secondByTr);

  const result = '=================\n**FIRST WEEK**\n=================\n\n' +formatData(firstWeek)+
                 '\n=================\n**SECOND WEEK**\n=================\n\n' + formatData(secondWeek);

  return new Promise(resolve => {
    resolve(result);
  })
  })
}

function parseWeek(weekByTr) {
  const week = {};
  const days = {};
  let time = undefined;

  for (let i = 0; i < weekByTr.length; i++) {
    const weekByTd = weekByTr[i].querySelectorAll('td');
    for (let j = 0; j < weekByTd.length; j++) {
      const td = weekByTd[j];
      if (i === 0) {
        if (td.textContent.trim() === '') {
          continue;
        }
        week[td.textContent.trim()] = {};
        days[j] = td.textContent.trim();
      } else {
        if (j === 0) {
          for (const day in week) {
            week[day][td.textContent.trim().slice(1)] = '';
          }
          time = td.textContent.trim().slice(1);
        } else {
          if (td.textContent.trim() === '') {
            delete week[days[j]][time];
          } else {
            week[days[j]][time] = td.textContent.trim();
          }
        }
      }
    }
  }

  return week;
}

function formatData(data) {
  let result = '';
  Object.keys(data).forEach(day => {
    result += '--------------------\n' + day +'\n--------------------\n\n';

    Object.keys(data[day]).forEach(lesson => {
      result += data[day][lesson].time + ': ' + data[day][lesson].name + '\n';
      result += data[day][lesson].teacher + '\n';
      result += data[day][lesson].classroom + '\n\n' ;
    });
  });

  return result;
}

const getGroupUrl = function getGroupUrl(url, group) {
  return JSDOM.fromURL(url).then(dom => {
    const document = dom.window.document;
    const formElement = document.getElementById('aspnetForm');
    const hiddenInputs = formElement.querySelectorAll('input[type="hidden"]');

    const form = {
      ctl00$MainContent$ctl00$txtboxGroup: group,
      ctl00$MainContent$ctl00$btnShowSchedule: "Розклад занять"
    };

    [...hiddenInputs].forEach(elem =>{ elem.value ? form[elem.name] = elem.value : console.log("Error")});

    return new Promise(resolve => {
      request.post({
        url: url,
        form: form
      },
      (err, res) => {
        resolve(`http://rozklad.kpi.ua${res.headers.location}`)
      });
    });
  });
};

module.exports = {start};
