var currColor = 1;
document.addEventListener('DOMContentLoaded', function() {
  const id = document.querySelector('#data').dataset.id;
  const month = parseInt(document.querySelector('#data').dataset.month);
  const year = parseInt(document.querySelector('#data').dataset.year);
  fetch(`/buckets/${id}?month=${month}&year=${year}`)
  .then(data => data.json())
  .then(data => {
    // either call DO WITH DATA or ADD BUCKET SECTION, but not both, beacuse the second is called within the first
    if (data[0] == 'Empty') {
      fetch('/available_months')
      .then(availableMonths => availableMonths.json())
      .then(availableMonths => offerMonths(availableMonths));
      addBucketSection();
    } else if (data[0].buckets.length == 0) {
      fetch('/available_months')
      .then(availableMonths => availableMonths.json())
      .then(availableMonths => offerMonths(availableMonths));
      doWithData(data);
      addBucketSection(data[0].income);
    }
    else {
      doWithData(data);
      addBucketSection(data[0].income);
    }
      loadCalendar();
      addSubmitButton();
      showAllAsCurrency();
    // unhide initial layout
      monthTitle(month, year);
    document.querySelectorAll('.hideInitial').forEach( hiddenElement => {
      hiddenElement.classList.remove("hideInitial");
    })
  })
})
function addBucketSection(income, section) {
    // console.log(`section ${section}`);
    let incomeSection = document.createElement('div');
    incomeSection.className = 'bucket income input-group mb-3';
    let incomeSpan = document.createElement('span');
    incomeSpan.className = 'bucketName input-group-text';
    incomeSpan.innerHTML = 'Income:';
    let incomeInput = document.createElement('input');
    incomeInput.className = 'form-control colorZero';
    // console.log(`income received in addBucketSection is ${income}`);
    incomeInput.value = isNaN(parseInt(income))? 0 : income;
    incomeInput.type = 'text';
    incomeInput.onmouseover = function() {randomColors(this)};
    incomeInput.onmouseout = function() {backToWhite(this)};
    incomeInput.onfocus = function() {showAsInteger(this)};
    incomeInput.onblur = function() {showAsCurrency(this)};
    incomeSection = document.querySelector('.bucketz').insertBefore(incomeSection, document.querySelector('.bucket'));
    incomeSection.appendChild(incomeSpan);
    incomeSection.appendChild(incomeInput);
    // add bucket button
    let addBucketSection = document.createElement('div');
    addBucketSection.id = 'addBucketSection';
    addBucketSection.className = 'input-group mb-3'
    let addBucketName = document.createElement("input");
    addBucketName.type = 'text';
    addBucketName.id = 'addBucketName';
    addBucketName.className = 'addBucketName form-control colorZero'; 
    addBucketName.placeholder = 'New bucket';
    addBucketName.onmouseover = function() {randomColors(this)};
    addBucketName.onmouseout = function() {backToWhite(this)};
    let addBucketButton = document.createElement('button');
    addBucketButton.id = 'addBucket';
    addBucketButton.className = 'btn btn-outline-secondary';
    addBucketButton.innerHTML = 'Add bucket';
    // addBucketButton.onclick = addBucket;
    addBucketSection.appendChild(addBucketName);
    addBucketSection.appendChild(addBucketButton);
    addBucketSection = document.querySelector('.bucketz').insertBefore(
      addBucketSection,  document.querySelector('#submit')
      ); 
    let answer = document.querySelector('.answer');
    hideSection(addBucketName, addBucketButton);
    document.querySelectorAll('.bucket').forEach(bucket => {
      // showAsCurrency(bucket.querySelector('input[type="text"]'));
      // console.log(bucket.querySelector('input[type="text"]'));
      // console.log(bucket.querySelector('input[type="text"]'));
    });
}
function hideSection(text, button) {
  // console.log(text);
  text.style.display = 'none';
  button.innerHTML = '+';
  button.removeEventListener('click', addBucket);
  button.onclick = function(self) {
    // console.log(button);
    button.onclick = button.blur();
    button.innerHTML = 'Add bucket';
    text.style.display = 'block';
    text.parentElement.animate([
     { width: '200px', opacity: 0 },
     { width: '100%', opacity: 1}
    ], {
      duration: 300,
      iterations: 1,
      easing: 'ease-in-out'
     })
    button.addEventListener('click', addBucket);
  };
}

function randomColors(node) {
  let originalClass = node.className.split(' ');
  originalClass.pop();
  originalClass = originalClass.join(' ');
  let colorArrayTwo = ['colorOne', 'colorTwo', 'colorThree', 'colorFour', 'colorFive', 'colorSix'];
  node.className = `${originalClass} ${colorArrayTwo[currColor]}`;
  currColor = (currColor + 1) % colorArrayTwo.length;
  // console.log(originalClass);
}
function backToWhite(node) {
  let originalClass = node.className.split(' ');
  originalClass.pop();
  originalClass = originalClass.join(' ');
  node.className = `${originalClass} colorZero`;
  // console.log(originalClass);
}

function doWithData(data) {
  // console.log(data);
  let bucketContent = '';
  // bucketContent +=  (
  
  // `<div class="bucket income input-group mb-3"><span class="bucketName input-group-text">Income:</span>
  //     <input type="text" class="form-control colorZero" value="${data[0].income}" onmouseover="randomColors(this)" onmouseout="backToWhite(this)">
  //     <button class="removeBucket btn btn-outline-secondary" type="button">Remove bucket</button>
  // </div>`

  // ); 
  data[0].buckets.forEach(bucket => {
    // console.log(bucket.name);
    bucketContent +=  (
    
    `<div class="bucket input-group mb-3"><span class="bucketName input-group-text">${bucket.name}:</span>
        <input class="form-control colorZero" type="text" min="0.00" step="1" placeholder="$0.00" value="${bucket.amount}" onmouseover="randomColors(this)" onmouseout="backToWhite(this)" onfocus="showAsInteger(this)" onblur="showAsCurrency(this)">
        <button class="removeBucket btn btn-outline-secondary" type="button">Remove bucket</button>
    </div>`

    ); 
  })
  // bucketContent += (`
  //   <button class="btn btn-primary" type="button" value="Submit" id="submit">Submit</button>
  // `);
  document.querySelector('.bucketz').innerHTML = bucketContent;
  // const submitButton = document.querySelector('#submit');
  // submitButton.onclick = submit;
  // adds remove bucket event listener to initial buckets
  document.querySelectorAll('.removeBucket').forEach(thing => {
    thing.addEventListener('click', () => { removeBucket(thing.parentElement)});
  })
  // addBucketSection(data[0].income);
}
function addSubmitButton(message) {
  // console.log(`function called by ${message}`)
  let submitButton = document.createElement('button');
  submitButton.className = 'btn btn-primary';
  submitButton.type = 'button';
  submitButton.innerHTML = 'Enter';
  submitButton.id = 'submit';
  submitButton.onclick = submit;
  submitButton = document.querySelector('.bucketz').appendChild(submitButton); 
  // console.log(submitButton);
  let answerSection = document.querySelector('.answer');
  if (answerSection == null) {
    answerSection = document.createElement('p');
    answerSection.className = 'answer';
  }
  answerSection = document.querySelector('.bucketz').appendChild(answerSection);
}
function submit() {
    let total = 0;
    let newValue = 'unset';
    document.querySelectorAll('.bucket').forEach(bucket => {
      // if bucket is income, subract rather than add value.
      // if there is no income bucket, set hasIncome to false so it can be set to 0 in the postMonth function
      // console.log(bucket);
      if (bucket.className.split(' ').indexOf('income') > 0) {
        newValue = parseInt(
          bucket.querySelector('input').value.replace(/[^0-9]+/g,"")
        );
        total = isNaN(newValue) ? total : total + newValue;
      // else, add value
      } else {
        newValue = parseInt(
          bucket.querySelector('input').value.replace(/[^0-9]+/g,"")
        );
        total = isNaN(newValue) ? total :total - newValue;
      }
    })
    let overUnder = (total > 0)? 'under' : 'over';
    total = Math.abs(total);     
    let answer = document.querySelector('.answer');
    answer.className = answer.className.split(' ')[0] + ' ' + overUnder;
    answer.innerHTML = `${total.toLocaleString()} ${overUnder} budget.`;

    postMonth();
 }
function offerMonths(data) {
  // initializes array of full length calendar months
  var calendarMonths = [0, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  // creates a number of elements: 
      // section -> label - select dropdown -> options
  let offerSection = document.createElement('section');
  offerSection.id = 'offerSection';
  let offerLabel = document.createElement('label');
  offerLabel.innerHTML = 'Populate values from another month:';
  let offerSelection = document.createElement('select');
  offerSelection.id = 'selections';
  offerSection = document.querySelector('.container').insertBefore(offerSection, document.querySelector('.bucketz'));
  offerSection.appendChild(offerLabel);
  offerSection.appendChild(offerSelection);
  // populate site with month choice
  document.getElementById('selections').onchange = populate;
  let option = document.createElement('option');
  option.value = "Select Month";
  option.innerHTML = "Select Month";
  option.disabled = 'disabled';
  option.selected = 'selected';
  offerSelection.appendChild(option);
  for (data of data) {
    const month = data[0];
    const year = data[1];
    let option = document.createElement('option');
    option.value = `${calendarMonths[month]}, ${year}`;
    option.innerHTML = `${calendarMonths[month]}, ${year}`;
    option.dataset.month = `${month}`;
    option.dataset.year = `${year}`;
    offerSelection.appendChild(option);
  }
}

function populate() {
  let e = document.getElementById('selections');
  const id = document.querySelector('#data').dataset.id;
  const month = parseInt(e.options[e.selectedIndex].dataset.month);
  const year = parseInt(e.options[e.selectedIndex].dataset.year);
  // console.log(month);
  // console.log(year);
  // year = parseInt(e.options[e.selectedIndex].dataset.year);
  fetch(`/buckets/${id}?month=${month}&year=${year}`)
  .then(data => data.json())
  .then(data => {
      doWithData(data);
      addBucketSection(data[0].income);
      addSubmitButton();
  });
}
function addBucket() {
  let bucketName = document.querySelector('#addBucketName').value;
  bucketName = bucketName.length > 0 ? bucketName : 'Additional Expense';
  // console.log(bucketName.length);
  let newBucket = document.createElement('div');
  newBucket.className = 'bucket input-group mb-3';
  let newBucketContent = (
    `<span class="bucketName input-group-text">${bucketName}:</span>
        <input type="text" placeholder="$0.00" class="form-control colorZero" onmouseover="randomColors(this)" onmouseout="backToWhite(this)" onfocus="showAsInteger(this)" onblur="showAsCurrency(this)">
        <button class="removeBucket btn btn-outline-secondary" type="button" onclick="{removeBucket(this.parentElement)}">Remove bucket</button>
  `);
  
  newBucket = document.querySelector('.bucketz').insertBefore(
    newBucket, document.querySelector('#addBucketSection') 
    );
  newBucket.innerHTML = newBucketContent;
  document.querySelector('#addBucketName').value = '';
  let addBucketText = document.querySelector('#addBucketSection').querySelector('input');
  let addBucketButton = document.querySelector('#addBucketSection').querySelector('button');
  hideSection(addBucketText, addBucketButton);
}


function removeBucket(node) {
  node.animate([
    { opacity: 1, marginTop: 0, offset: 0},
    { opacity: 0, marginTop: 0, offset: 0.5},
    { opacity: 0, marginTop: '-54px', offset: 1}
  ], {
    duration: 600,
    iterations: 1,
    easing: 'ease-in-out'
    });
  setTimeout(function() {node.remove()}, 600);
}

    
function postMonth() {
  const month = parseInt(document.querySelector('#data').dataset.month);
  const year = parseInt(document.querySelector('#data').dataset.year);
  // gather buckets and post
  let buckets = document.querySelectorAll('.bucket');
  var bucketList = [];
  buckets.forEach(bucket => {
    let name = bucket.querySelector('.bucketName').innerHTML;
    // console.log("name1: " + name);
    let amount = bucket.querySelector('input').value.trim().replace(/[^0-9]+/g,"");
    // cuts off the colon and any whitespace from the innerHTML of div
    name = name.substring(0,name.length-1);
    // console.log("name2: " + name);
    let newBucket = {name: name, amount: amount};
    bucketList.push(newBucket);
  })
  
  // post buckets
  fetch('/buckets', {
    method: 'POST', 
    credentials: 'same-origin',
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      buckets: bucketList,
      month: month,
      year: year,
    })
  })
}

function loadCalendar() {
  var calendarMonths = [0, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  let monthSelectSection = document.createElement('section');
  monthSelectSection = document.querySelector('.container').appendChild(monthSelectSection);
  monthSelectSection.id = 'monthSelectSection';
  let monthSelectLabel = document.createElement('label');
  monthSelectLabel.innerHTML = 'Go to a different month';
  let monthSelection = document.createElement('select');
  monthSelection.id = 'monthSelections';
  monthSelection = document.querySelector('.container').appendChild(monthSelection);
  monthSelectSection.appendChild(monthSelectLabel);
  monthSelectSection.appendChild(monthSelection);
  document.getElementById('monthSelections').onchange = goToMonth;
  const data = document.querySelector('#data');
  const year = parseInt(data.dataset.year);
  const month = parseInt(data.dataset.month);
  let prevDate, nextDate = 0;
  if (month == 1) {
    prevDate = [12, year - 1]; 
    nextDate = [2, year]
  } else if (month == 12) { 
    prevDate = [11, year]; 
    nextDate = [1, year + 1]
  } else {
    prevDate = [month - 1, year]; 
    nextDate = [month + 1, year];
  }
  const currDate = [month, year];
  let calendar = document.createElement('div');
  let prevLink = document.createElement('div');
  let nextLink = document.createElement('div');
  calendar.id = 'calendar';
  prevLink.innerHTML = `<a href="/${prevDate[0]}/${prevDate[1]}">Previous month</a>`;
  nextLink.innerHTML = `<a href="/${nextDate[0]}/${nextDate[1]}">Next Month</a>`;

  calendar = document.querySelector('.container').appendChild(calendar);
  calendar.appendChild(prevLink);
  calendar.appendChild(nextLink);
  fetch('/available_months')
  .then(data => data.json())
  .then(months=> {
    for (item of months) {
      const month = item[0];
      const year = item[1];
      let option = document.createElement('option');
      if (parseInt(month) == parseInt(document.querySelector('#data').dataset.month)) {
        option.selected = true;
      }
      option.value = `${calendarMonths[month]}, ${year}`;
      option.innerHTML = `${calendarMonths[month]}, ${year}`;
      option.dataset.month = `${month}`;
      option.dataset.year = `${year}`;
      monthSelection.appendChild(option);
    }
  })
}
function showAsInteger(node) {
  node.value = node.value ? node.value.replace(/[^0-9]+/g,"") : ''
}
function showAsCurrency(node) {
 let newValue = parseInt(node.value.replace(/[^0-9]+/g,"")).toLocaleString();
  node.value = newValue != 'NaN' ? '$' + newValue : '';
}
function showAllAsCurrency() {
  document.querySelectorAll('.bucket').forEach(bucket => {
    showAsCurrency(bucket.querySelector('input[type="text"]'));
  })
}
function goToMonth() {
  let e = document.getElementById('monthSelections');
  const id = document.querySelector('#data').dataset.id;
  const month = parseInt(e.options[e.selectedIndex].dataset.month);
  const year = parseInt(e.options[e.selectedIndex].dataset.year);
  // console.log(month);
  // console.log(year);
  window.location.href = `/${month}/${year}`;
}
function monthTitle(month, year) {
  const calendarMonths = [0, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthtitle = `${calendarMonths[month]} ${year}`;
  let title = document.createElement('h1');
  let titleContainer = document.createElement('div');
  titleContainer.className = 'titleContainer';
  title.innerHTML = monthtitle;
  title.className = 'monthtitle';
  titleContainer = document.querySelector('.container').insertBefore(
    titleContainer, document.querySelector('.container').firstChild
  );
  titleContainer = titleContainer.appendChild(title);
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}