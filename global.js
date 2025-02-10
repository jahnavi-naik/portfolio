console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const ARE_WE_HOME = document.documentElement.classList.contains('home');

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/index.html', title: 'Projects' },
    { url: 'resume/index.html', title: 'Resume' },
    { url: 'contact/index.html', title: 'Contact'},
    {url: 'meta/index.html', title: 'Meta'}, 
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
            <option value="light dark">Automatic</option>
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

export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);

      if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      const data = await response.json();
      return data;

  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
      throw error;
  }
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';
  const projectsTitle = document.querySelector('.projects-title');
  if (projectsTitle) {
      projectsTitle.textContent = `${project.length} Projects`;
  }
  
  project.forEach((project1) => {
    const article = document.createElement('article');
    article.innerHTML = `
      <h3>${project1.title} (${project1.year})</h3>
      <img src="${project1.image}" alt="${project1.title}">
      <p>${project1.description}</p>
    `;
    containerElement.appendChild(article);
  });

}
export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}