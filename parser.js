'use strict'

const request = require('request');
const { JSDOM } = require('jsdom');

const URL = 'http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx';


const start = function start(groupID) {
  return getGroupUrl(URL, groupID).then(groupURL => {
    return parse(groupURL)
  },
  error => throw (error);
  );
};
