let greeting = document.querySelector(".greeting")
let greetingStr = document.querySelector(".greeting").innerText;
let greetingArr = greetingStr.split('');
let output0 = greetingArr.map( (el, i) => {
  el = `<span style='color: ${getRandomColor()}'>${el}</span>`
  return el;
})
greeting.innerHTML = output0.join('');

let greetingShort = document.querySelector(".greeting.short");
let greetingShortStr = document.querySelector(".greeting.short").innerText;
let greetingShortArr = greetingShortStr.split('')
let output = greetingShortArr.map( (el, i) => {
  el = `<span style='color: ${getRandomColor()}'>${el}</span>`
  return el;
})
greetingShort.innerHTML = output.join('');

let projectsTaglineShort = document.querySelector(".projects-tagline.short")
let projectsTaglineShortStr = projectsTaglineShort.innerText;
let projectsTaglineShortArr = projectsTaglineShortStr.split('');
let output2 = projectsTaglineShortArr.map ( (el, i) => {
  if(i % 2 == 0) {
  el = `<span class="up" style='color: ${getRandomColor()}'>${el}</span>`
  }
  else {
    el = `<span class="down" style='color: ${getRandomColor()}'>${el}</span>`
  }
  return el;

})
projectsTaglineShort.innerHTML = output2.join('')

let projectTagline = document.querySelector('.projects-tagline');
let projectTaglineStr = document.querySelector('.projects-tagline').innerText
let projectTaglineArr = projectTaglineStr.split('')
let output4 = projectTaglineArr.map( (el, i) => {
  if(i % 2 == 0) {
    el = `<span class="up" style='color: ${getRandomColor()}'>${el}</span>`
  }
  else {
    el = `<span class="down" style='color: ${getRandomColor()}'>${el}</span>`
  }
  return el;
})
projectTagline.innerHTML = output4.join('')

function toggleDarkLight() {
  const body = document.getElementById("body");
  let currentClass = body.className;
  body.className = currentClass == "dark-mode" ? "light-mode" : "dark-mode";
}
document.getElementById('toggle').addEventListener('click', function() {
  toggleDarkLight();
  document.getElementById('lol').style.color = getRandomColor();

});

let contactTitleShort = document.querySelector(".contact-title.short");
let contactTitleShortStr =contactTitleShort.innerText;
let contactShortArr = contactTitleShortStr.split('');
let output3 = contactShortArr.map ( (el, i) => {
  el = `<span class="down" style='color: ${getRandomColor()}'>${el}</span>`
  return el;

})
contactTitleShort.innerHTML = output3.join('')

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}



// setTimeout(function () {spans.forEach(span => setInterval( () => {
//   span.style.color = getRandomColor()
// ,20000}))}, 5000);

// CSS Animation of the project
//inserts spans and class of either up or down on each letter for


// function([string1, string2],target id,[color1,color2])
consoleText(['Contact Me.', 'Get In Touch.', 'Let\'s build something.', 'Hire me!'], 'text',[getRandomColor(), getRandomColor(), getRandomColor()]);

function consoleText(words, id, colors) {
  if (colors === undefined) colors = ['#fff'];
  let visible = true;
  let con = document.getElementById('console');
  let letterCount = 1;
  let x = 1;
  let waiting = false;
  let target = document.getElementById(id)
  target.setAttribute('style', 'color:' + colors[0])
  window.setInterval(function() {

    if (letterCount === 0 && waiting === false) {
      waiting = true;
      target.innerHTML = words[0].substring(0, letterCount)
      window.setTimeout(function() {
        let usedColor = colors.shift();
        colors.push(usedColor);
        let usedWord = words.shift();
        words.push(usedWord);
        x = 1;
        target.setAttribute('style', 'color:' + colors[0])
        letterCount += x;
        waiting = false;
      }, 1000)
    } else if (letterCount === words[0].length + 1 && waiting === false) {
      waiting = true;
      window.setTimeout(function() {
        x = -1;
        letterCount += x;
        waiting = false;
      }, 1000)
    } else if (waiting === false) {
      target.innerHTML = words[0].substring(0, letterCount)
      letterCount += x;
    }
  }, 120)
  window.setInterval(function() {
    if (visible === true) {
      con.className = 'console-underscore hidden'
      visible = false;

    } else {
      con.className = 'console-underscore'

      visible = true;
    }
  }, 400)
}
