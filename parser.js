'use strict'

const request = require('request');
const { JSDOM } = require('jsdom');

const URL = 'http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx';


const start = function start(groupID) {
  return getGroupURL(URL, groupID).then(groupURL => {
    return parse(groupURL)
  },
  error => throw (error);
  );
};

function parse(groupURL) {
  result = 'test msg';
  return new Promise(resolve => resolve(result));
}

const getGroupURL = function getGroupURL(groupID) {
  return JSDOM.fromURL(URL).then(dom => {
    const document = dom.window.document;
    const formElement = document.getElementById('aspnetForm');
    const hiddenInputs = formElement.querySelectorAll('input[type="hidden"]');

    const form = {
      ctl00$MainContent$ctl00$txtboxGroup: group,
      ctl00$MainContent$ctl00$btnShowSchedule: "Розклад занять"
    };

    [...hiddenInputs].forEach(elem => {
      form[elem.name] = elem.value;
    });

    return new Promise(resolve => {
      request.post({
        url: URL,
        form: form
      },
      (err, res) => resolve(`http://rozklad.kpi.ua${res.headers.location}`);
      );
    });
  });
};
