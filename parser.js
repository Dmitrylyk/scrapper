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
  const week = {
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
  };

  const firstByTr = first.querySelectorAll('tr');
  const secondByTr = second.querySelectorAll('tr');



  let firstWeek = {};
  let secondWeek = {};

  
  })
}


function formatData(data) {
  let result = '';
  Object.keys(data).forEach(day => {
    result += '--------------------\n' + day +'\n--------------------\n\n';

    Object.keys(data[day]).forEach(lesson => {
      result += data[day][lesson].number + '.' + data[day][lesson].name + '\n';
      result += 'Teacher: ' + data[day][lesson].teacher + '\n';
      result += 'Classroom: ' + data[day][lesson].classroom + '\n\n' ;
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
