// Import styles:
import './css/styles.css';
import './images/icons8-plus-67.png';
import './images/icons8-high-voltage-48.png';
import './images/icons8-water-96.png';
import './images/icons8-zzz-96.png';

// Import local files:
import fetchData from './apiCalls.js';
import UserRepository from './UserRepository';
import User from './User';
import Hydration from './Hydration';
import Sleep from './Sleep';
import Chart from 'chart.js/auto';

// Import third party libraries:

// Query Selectors
const greeting = document.querySelector('.greeting');
const friendsList = document.querySelector('#friendsList');
const fullName = document.querySelector('.full-name');
const userAddress = document.querySelector('.user-address');
const userEmail = document.querySelector('.user-email');
const stepGoal = document.querySelector('.step-goal');


// Global variables
let userData;
let sleepData;
let hydrationData;
let currentUser;
let hydration;
let sleep;
let allUsers;


// API data
function fetchAllData() {
  Promise.all([fetchData('users', 'userData'), fetchData('sleep', 'sleepData'), fetchData('hydration', 'hydrationData'),])
  .then(data => {
    userData = data[0],
    sleepData = data[1],
    hydrationData = data[2],
    currentUser = new User(userData[Math.floor(Math.random() * userData.length)]);
    hydration = new Hydration(currentUser.id, hydrationData);
    sleep = new Sleep(currentUser.id, sleepData);
    allUsers = new UserRepository(userData);
    
    loadUserInfo();
  });
}

// Event Listeners
window.addEventListener('load', fetchAllData);

// Helper Functions

// DOM Functions
function loadUserInfo() {
  renderGreeting();
  renderFriendsList();
  renderProfile();
  renderOuncesPerDay('2020/01/22');
  // renderSleepChartByWeek('2019/06/15','2019/06/21', 'hoursSlept');
  renderSleepChartByDay('2019/06/15', 'hoursSlept');
//   renderDailySteps();
  renderOuncesPerWeek(194, 201);

};

function renderGreeting() {
  const userFirstName = currentUser.name.split(' ')[0];
  greeting.innerHTML = `Hello, ${userFirstName}!`;
};

function renderFriendsList() {
  const friendNames = userData
  .filter(user => {
    if(currentUser.userFriends.includes(user.id)) {
      return user.name;
    }
  });
  return friendNames.forEach(friend => {
    friendsList.innerHTML += 
    `<button class="friend">${friend.name}</button>`;
  }); 
};

function renderProfile() {
  fullName.innerText = `${currentUser.name}`;
  userAddress.innerText = `${currentUser.email}`;
  userEmail.innerText = `${currentUser.address}`;
  stepGoal.innerText += `${currentUser.dailyStepGoal}`;
};

function renderOuncesPerDay(date) {
    let hydrate = document.getElementById('hydrate');
    const dailyOunces = hydration.ouncesPerDay(date);
    hydrate.innerText = `${date}: ${dailyOunces}`; 
};


function renderSleepChartByWeek(start, end, type) {
  const weeklyData = sleep.getDailySleepByWeek(start, end, type);
  const sleepWeekCanvas = new Chart('sleepCanvasByWeek', {
    type: 'bar', // bar, horizontal, pie, line, doughnut, radar, polarArea
    data: {
      labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
      datasets: [{
        label: 'Hours of Sleep Per Week',
        data: weeklyData,
        fill: true,
        backgroundColor: "#128FC8",
        borderColor: "#128FC8",
      }]
    },
  });
};

function renderSleepChartByDay(date, type) {
  const day = sleep.getSleepDataByGivenDay(date, type);
  const max = 12-day; 

  const sleepDayCanvas = new Chart('sleepCanvasByDay', {
    type: 'bar',
    data: {
      labels: [''],
      datasets: [{
        label: 'Hours Slept by Day',
        data: [day],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor:'rgb(255, 99, 132)',
        borderWidth: 1,
      },
      {
        label: 'Maximum Sleep',
        data: [max],
        backgroundColor: 'rgba(177, 99, 255, 0.2)',
        borderColor:'rgb(229, 99, 255)',
        borderWidth: 1,
      }]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          beginAtZero: true,
        }
      }
    }
  });
};

// function renderDailySteps() {
//   let avg;
//   const activity = new Chart('stepsByDay', {
//     type: 'doughnut', 
//     data: {
//       labels: ['step goal', ''],
//       datasets: 
//       [{
//         data: [day, avg],
//       }]
//     },
//   });
// };
function renderOuncesPerWeek(date1, date2) {
    let weeklyWins = document.getElementById('weekly-wins');
    const weeklyOunces = hydration.getDailyOuncesByWeek(date1, date2);
    weeklyWins.innerText += `This week's water intake:
    Day 1: ${weeklyOunces[0]} ounces
    Day 2: ${weeklyOunces[1]} ounces
    Day 3: ${weeklyOunces[2]} ounces
    Day 4: ${weeklyOunces[3]} ounces
    Day 5: ${weeklyOunces[4]} ounces
    Day 6: ${weeklyOunces[5]} ounces
    Day 7: ${weeklyOunces[6]} ounces`;
};
