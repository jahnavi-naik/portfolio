import {fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

function renderPieChart(projectsGiven) {
    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year
    );
    
    let newData = newRolledData.map(([year, count]) => {
      return { value: count, label: year };
    });
    
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let newArcs = newArcData.map((d) => arcGenerator(d));
  
    let svg = d3.select('svg');
    svg.selectAll('path').remove(); 
    
    let legend = d3.select('.legend');
    legend.selectAll('li').remove(); 
    
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
  
    newArcs.forEach((arc, idx) => {
      svg.append('path')
        .attr('d', arc)
        .attr('fill', colors(idx));
    });
  
    newData.forEach((d, idx) => {
      legend.append('li')
        .attr('style', `--color:${colors(idx)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

renderPieChart(projects);

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
    let query = event.target.value;
    let filteredProjects = projects.filter((project) => project.title.includes(query));
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});

// let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// let rolledData = d3.rollups(
//   projects,
//   (v) => v.length,
//   (d) => d.year,
// );

// let data = rolledData.map(([year, count]) => {
//     return { value: count, label: year };
// });

// let sliceGenerator = d3.pie().value((d) => d.value);
// let arcData = sliceGenerator(data);
// let arcs = arcData.map((d) => arcGenerator(d));

// arcs.forEach(arc => {
//     d3.select('svg').append('path').attr('d', arc);
// })

// let colors = d3.scaleOrdinal(d3.schemeTableau10);

// arcs.forEach((arc, idx) => {
//     d3.select('svg')
//       .append('path')
//       .attr('d', arc)
//       .attr('fill', colors(idx))
// })

// let legend = d3.select('.legend');

// data.forEach((d, idx) => {
//     legend.append('li')
//           .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
//           .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
// })

// let query = '';
// let searchInput = document.querySelector('.searchBar');

// searchInput.addEventListener('change', (event) => {
//     // update query value
//     query = event.target.value;
//     // TODO: filter the projects
//     let filteredProjects = projects.filter((project) => project.title.includes(query));
//     // TODO: render updated projects!
//     renderProjects(filteredProjects, projectsContainer);
// });