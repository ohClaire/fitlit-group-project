// Import styles:
import './css/styles.css';
import './images/quick-mode.png';
import './images/water.png';
import './images/zzz.png';
import './images/down-button.png';
import './images/fitlit-logo.png';

// Import local files:
import { fetchData, postData } from './apiCalls.js';
import UserRepository from './UserRepository';
import User from './User';
import Hydration from './Hydration';
import Sleep from './Sleep';
import Activity from './Activity';

// Import third party libraries
import { charts, destroyCharts } from './charts.js';
import dayjs from 'dayjs';

// Query Selectors
const greeting = document.querySelector('.greeting');
let friendsList = document.querySelector('.friends-list');
const fullName = document.querySelector('.full-name');
const userAddress = document.querySelector('.user-address');
const userEmail = document.querySelector('.user-email');
const stepGoal = document.querySelector('.step-goal');
const sleepAverages = document.querySelector('.sleep-averages');
const userInfoButton = document.querySelector('.down-button');
const dropDownBox = document.querySelector('.drop-down');
const addWaterButton = document.querySelector('#waterButton');
const addSleepButton = document.querySelector('#sleepButton');
const addActivityButton = document.querySelector('#activityButton');
const hydrationFormPopup = document.querySelector('.hydration-form-popup');
const sleepFormPopup = document.querySelector('.sleep-form-popup');
const activityFormPopup = document.querySelector('.activity-form-popup');
const calenderForWeek = document.querySelector('#calendarStart');
const closeHydrate = document.querySelector('#close-hydration-form');
const closeSleep = document.querySelector('#close-sleep-form');
const closeActivity = document.querySelector('#close-activity-form');
const updateAllCharts = document.querySelector('#updateCharts');

// Global variables
let userData;
let sleepData;
let hydrationData;
let currentUser;
let hydration;
let sleep;
let activity;
let allUsers;
let activityData;
let lastHydrationEntry;
let lastSleepEntry;
let lastActivityEntry;
let lastWeekHydration;
let lastWeekSleep;
let lastWeekActivity;
let chosenDate;

// API data
function fetchAllData() {
  Promise.all([
    fetchData('users', 'userData'),
    fetchData('sleep', 'sleepData'),
    fetchData('hydration', 'hydrationData'),
    fetchData('activity', 'activityData'),
  ]).then((data) => {
      userData = data[0],
      sleepData = data[1],
      hydrationData = data[2],
      activityData = data[3];

    currentUser = new User(userData[Math.floor(Math.random() * userData.length)]);
    hydration = new Hydration(currentUser.id, hydrationData);
    sleep = new Sleep(currentUser.id, sleepData);
    activity = new Activity(currentUser, activityData)
    allUsers = new UserRepository(userData);

    //grab last date this user made an entry
    lastHydrationEntry = hydration.ounces[hydration.ounces.length - 1].date;
    lastSleepEntry = sleep.sleepDataPerUser[sleep.sleepDataPerUser.length - 1].date;
    lastActivityEntry = activity.usersActivity[activity.usersActivity.length - 1].date;

    lastWeekHydration = hydration.ounces[hydration.ounces.length - 7].date;
    lastWeekSleep =  sleep.sleepDataPerUser[sleep.sleepDataPerUser.length - 7].date;
    lastWeekActivity =activity.usersActivity[activity.usersActivity.length - 7].date;
    
    loadUserInfo()
  });
}

// Event Listeners

window.addEventListener('load', fetchAllData);



userInfoButton.addEventListener('click', showUserDetails);
addWaterButton.addEventListener('click', userInputHydrationForm);
addSleepButton.addEventListener('click', userInputSleepForm);
addActivityButton.addEventListener('click', userInputActivityForm);
calenderForWeek.addEventListener('change', changeWeeklyData);
closeHydrate.addEventListener('click', closeHydrationForm);
closeSleep.addEventListener('click', closeSleepForm);
closeActivity.addEventListener('click', closeActivityForm);
updateAllCharts.addEventListener('click', renderUpdatedCharts);
friendsList.addEventListener('click', loadFriendData)
// Helper Functions

// DOM Functions
function loadUserInfo() {
  renderGreeting();
  renderFriendsList();
  renderProfile();
  renderSleepAverages();

  charts.renderOuncesByWeek(hydration, lastWeekHydration);
  charts.renderOuncesPerDay(hydration, lastHydrationEntry);
  charts.renderSleepChartByDay(sleep, lastSleepEntry);
  charts.renderSleepChartByWeek(sleep, lastWeekSleep);
  charts.renderNumStepsByWeek(activity, lastWeekActivity);
  charts.renderMinutesActiveByWeek(activity, lastWeekActivity);
  charts.renderFlightsClimbedByWeek(activity, lastWeekActivity);
  charts.renderMilesPerDay(activity, lastActivityEntry)
  charts.renderNumStepsPerDay(activity, lastActivityEntry);
  charts.renderMinutesActivePerDay(activity, lastActivityEntry);
  charts.renderFlightsClimbedPerDay(activity, lastActivityEntry);
};


function renderGreeting() {
  const userFirstName = currentUser.name.split(' ')[0];
  greeting.innerHTML = `Hello, ${userFirstName}!`;
};

function renderFriendsList() {
  friendsList.innerHTML = `Click on one of ${currentUser.name.split(' ')[0]}'s friends to view their profile`
  const friendNames = userData.filter((user) => {
    if (currentUser.userFriends.includes(user.id)) {
      return user.name;
    }
  });

  return friendNames.forEach((friend) => {
    
    friendsList.innerHTML += `<button class="friend">${friend.name}</button>`;
  });
}

function renderProfile() {
  fullName.innerHTML = `${currentUser.name}`;

  stepGoal.innerText += ` ${currentUser.dailyStepGoal}
  Average Step Goal: ${allUsers.getAverageStepGoal()}`;
}

function renderSleepAverages() {
  sleepAverages.innerText = `Your Average Hours of Sleep: ${sleep.getAvgSleepData(
    'hoursSlept',
    true
  )}
  Average Sleep Quality for all users: ${sleep.getAvgSleepData(
    'sleepQuality',
    false
  )}`;
}

function showUserDetails() {
  dropDownBox.classList.toggle('hidden');
  userAddress.innerText = `${currentUser.email}`;
  userEmail.innerText = `${currentUser.address}`;
}

function userInputHydrationForm() {
  hydrationFormPopup.classList.remove('hidden');
}

function userInputSleepForm() {
  sleepFormPopup.classList.remove('hidden');
}

function userInputActivityForm() {
  activityFormPopup.classList.remove('hidden');
}

hydrationFormPopup.addEventListener('submit', (event) => {
  console.log(event);
  event.preventDefault();
  const formData = new FormData(event.target);
  console.log(formData);
  const newHydrationData = {
    userID: currentUser.id,
    date: formData.get('date'),
    numOunces: parseInt(formData.get('ounces')),
  };

  if (
    newHydrationData.userID &&
    newHydrationData.date &&
    newHydrationData.numOunces
  ) {
    postData('http://localhost:3001/api/v1/hydration', newHydrationData);
  } else {
    return 'Invalid data';
  }
  event.target.reset();
});

sleepFormPopup.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const newSleepData = {  
    userID: currentUser.id,
    date: formData.get('date'),
    hoursSlept: parseInt(formData.get('hours')),
    sleepQuality: parseInt(formData.get('quality'))
  };
  
  if (
    newSleepData.userID &&
    newSleepData.date &&
    newSleepData.hoursSlept &&
    newSleepData.sleepQuality
  ) {
    postData('http://localhost:3001/api/v1/sleep', newSleepData);
  } else {
    return 'Invalid data';
  }
  event.target.reset();
});

function closeHydrationForm() {
  hydrationFormPopup.classList.add('hidden');
}
function closeSleepForm() {
  sleepFormPopup.classList.add('hidden');
}
function closeActivityForm() {
  activityFormPopup.classList.add('hidden');
}

function changeWeeklyData(event) {
  return (chosenDate = dayjs(event.target.value)
    .format()
    .slice(0, 10)
    .split('-')
    .join('/'));
}

function renderUpdatedCharts() {
  destroyCharts();
  Promise.all([
    fetchData('users', 'userData'),
    fetchData('sleep', 'sleepData'),
    fetchData('hydration', 'hydrationData'),
    fetchData('activity', 'activityData'),
  ])
    .then((data) => {
      loadConditions(data)
      
    });
};
function loadConditions(data) {
  userData = data[0],
  sleepData = data[1],
  hydrationData = data[2],
  activityData = data[3];
  hydration = new Hydration(currentUser.id, hydrationData);
  sleep = new Sleep(currentUser.id, sleepData);
  allUsers = new UserRepository(userData);

  if (!hydration.ounces.find((data) => data.date == chosenDate) && !sleep.sleepDataPerUser.find((entry) => entry.date === chosenDate)) {
    alert ('no data at all!!')
    return 'no data at all!!'
  }
  
  if (!hydration.ounces.find((data) => data.date == chosenDate)) {
    alert ('no hydration data!!!')
    charts.renderSleepChartByDay(sleep, chosenDate);
    charts.renderSleepChartByWeek(sleep, chosenDate);
  } 
  
  if (!sleep.sleepDataPerUser.find((entry) => entry.date === chosenDate)) {
    alert ('no sleep Data!!!')
    charts.renderOuncesByWeek(hydration, chosenDate);
    charts.renderOuncesPerDay(hydration, chosenDate);
  } 
}
function loadFriendData(event) {
  currentUser = new User(allUsers.users.find((user) => user.name === event.target.innerText))
  

  destroyCharts()
  friendsList.innerHTML = `Click on one of ${currentUser.name.split(' ')[0]}'s friends to view their profile`
  loadUserInfo()



}

