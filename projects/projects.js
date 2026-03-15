import {fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

// Search removed: projects page no longer uses a search input.