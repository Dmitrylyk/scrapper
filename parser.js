const { JSDOM } = require('jsdom');
const request = require('request');

const url = 'http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx';
var schedules =  {};


function formatOutput(schedual, weeks=[1,2]){
    let formatedSchedual = "Розклад:\n";
    if (weeks.includes(1)){
      formatedSchedual += "\nТиждень #1\n";
      for (const day in schedual['week 1']){
        formatedSchedual += '\n' + day.toString() + '\n';
        for (const time in schedual['week 1'][day]){
          formatedSchedual += time.toString() + ': ';
          formatedSchedual += schedual['week 1'][day][time].toString();
          formatedSchedual += '\n';
        }
      }
    }
    if (weeks.includes(2)){
      formatedSchedual += "\nТиждень #2\n";
      for (const day in schedual['week 2']){
        formatedSchedual += '\n' + day.toString() + '\n';
        for (const time in schedual['week 2'][day]){
          formatedSchedual += time.toString() + ': ';
          formatedSchedual += schedual['week 2'][day][time].toString();
          formatedSchedual += '\n';
        }
      }
    }
    return formatedSchedual;
}



function parseWeek(allTr) {
  const week = {};
  const days = {};
  let time = undefined;

  for (let i = 0; i < allTr.length; i++) {
    const allTd = allTr[i].querySelectorAll('td');
    for (let j = 0; j < allTd.length; j++) {
      const td = allTd[j];
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



function parseText(url) {
    return JSDOM.fromURL(url).then(dom => {

      const firstWeek = dom.window.document
        .getElementById('ctl00_MainContent_FirstScheduleTable');
      const secondWeek = dom.window.document
        .getElementById('ctl00_MainContent_SecondScheduleTable');

      const allTrFirstWeek = firstWeek.querySelectorAll('tr');
      const allTrSecondWeek = secondWeek.querySelectorAll('tr');
      // tr[0] - day of week
      // tr[1] td[0] - time
      // const schedules = {};
      const week1 = parseWeek(allTrFirstWeek);
      const week2 = parseWeek(allTrSecondWeek);
      console.log(week1,week2);
      schedules['week 1'] = week1;
      schedules['week 2'] = week2;
    //  console.log(schedules);

      //return schedules;
      const result = formatOutput(schedules)
      console.log(result);

        return new Promise(resolve => {
            resolve(result);
        })
    })
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

        return new Promise(resolve=>{
            request.post({
                url: url,
                form: form
            }, (err, res)=>{
                resolve(`http://rozklad.kpi.ua${res.headers.location}`)
            });
        });
    });
};

const parse = function parse(group){
    return getGroupUrl(url, group).then(groupUrl=>{
            return parseText(groupUrl)
        },
        error=>{
            throw (error)
        })
};

module.exports = { parse };

/*
const start = function start(groupID) {
  return getGroupURL(URL, groupID).then(groupUrl => {
    return parse(groupUrl)
  },
  error => {
    throw (error)
  });
};

function getWeekData (id, document) {
    if(document.getElementById(id) === null || document.getElementById(id).getElementsByTagName('tr') === null){
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
        const first = getWeekData('ctl00_MainContent_FirstScheduleTable', document);
        const second = getWeekData('ctl00_MainContent_SecondScheduleTable', document);
        const week = {
            1: 'monday',
            2: 'tuesday',
            3: 'wednesday',
            4: 'thursday',
            5: 'friday',
            6: 'saturday'
        };

        let firstWeek = {};
        let secondWeek = {};
        Object.keys(first).forEach(row=>{
            if(row>0) {
                const firstRow = getRowData(first[row]);
                const secondRow = getRowData(second[row]);

                Object.keys(week).forEach(day=>{
                    if (firstWeek[week[day]] === undefined) {
                        firstWeek[week[day]] = [];
                        secondWeek[week[day]] = [];
                    }
                    try {
                        let temp = {};
                        const firstLength = firstRow[day].getElementsByTagName('a').length;
                        const secondLength = secondRow[day].getElementsByTagName('a').length;

                        temp.number = row;
                        temp.name = firstRow[day].getElementsByTagName('a')[0].innerHTML;
                        temp.teacher = firstRow[day].getElementsByTagName('a')[1].innerHTML;
                        temp.classroom = firstRow[day].getElementsByTagName('a')[firstLength-1].innerHTML;
                        firstWeek[week[day]].push(temp);

                        temp.name = secondRow[day].getElementsByTagName('a')[0].innerHTML;
                        temp.teacher = secondRow[day].getElementsByTagName('a')[1].innerHTML;
                        temp.classroom = secondRow[day].getElementsByTagName('a')[secondLength-1].innerHTML;
                        secondWeek[week[day]].push(temp);
                    }
                    catch(err){
                        //
                    }
                });
            }
        });
        const result = '=================\nFIRST WEEK\n=================\n\n' +formatData(firstWeek)+
            '\n=================\nSECOND WEEK\n=================\n\n' + formatData(secondWeek);
        return new Promise(resolve => {
            resolve(result);
        })
    })
}

function formatData(data) {
    let result = '';
    Object.keys(data).forEach(day=>{
        result += '--------------------\n' + day +'\n--------------------\n\n';
        Object.keys(data[day]).forEach(lesson=>{
            result += data[day][lesson].number + '.' + data[day][lesson].name + '\n';
            result += 'Teacher: ' + data[day][lesson].teacher + '\n';
            result += 'Classroom: ' + data[day][lesson].classroom + '\n\n' ;
        });
    });
    return result;
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
      (err, res) => {
        resolve(`http://rozklad.kpi.ua${res.headers.location}`)
      });
    });
  });
};

module.exports = {start};
*/
