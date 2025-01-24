console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// const navLinks = $$("nav a");

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );

//   if (currentLink) {
//     // or if (currentLink !== undefined)
//     currentLink.classList.add('current');
//   }

const ARE_WE_HOME = document.documentElement.classList.contains('home');

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/index.html', title: 'Projects' },
    { url: 'resume/index.html', title: 'Resume' },
    { url: 'contact/index.html', title: 'Contact'},
    { url: 'https://github.com/jahnavi-naik', title: 'Github' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    
    url = !ARE_WE_HOME && !url.startsWith('http') ? '/portfolio/'  + url : url;

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }
      
    if (a.host !== location.host) {
        a.target = "_blank";
    }
    nav.append(a);
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <div id="color-scheme-container">
        <label for="color-scheme">Theme:
          <select id="color-scheme" name="color-scheme">
            <option value="auto">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
    `
);

const select = document.querySelector('#color-scheme'); 

if ("colorScheme" in localStorage) {
    const savedColorScheme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', savedColorScheme);
    select.value = savedColorScheme; 
}

select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);

    localStorage.colorScheme = event.target.value;
});


const form = document.getElementById('contactForm');

form?.addEventListener('submit', (event) => {
    event.preventDefault();
  
    const data = new FormData(form);
  
    let mailtoURL = form.action + '?';
  
    for (let [name, value] of data) {
      mailtoURL += `${encodeURIComponent(name)}=${encodeURIComponent(value)}&`;
    }
    mailtoURL = mailtoURL.slice(0, -1);
    location.href = mailtoURL;
});
