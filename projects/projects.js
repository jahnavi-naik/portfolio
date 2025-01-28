import { fetchJSON, renderProjects } from '../portfolio/global.js';
const projects = await fetchJSON('../portfolio/lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');
