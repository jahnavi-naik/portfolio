import {fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../projects.json');
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
    
    let selectedIndex = -1;
    let svg = d3.select('svg');
    svg.selectAll('path').remove(); 
    
    let legend = d3.select('.legend');
    legend.selectAll('li').remove(); 
    
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
  
    newArcs.forEach((arc, idx) => {
      svg.append('path')
        .attr('d', arc)
        .attr('fill', colors(idx))
        .on('click', () => {
          selectedIndex = selectedIndex === idx ? -1 : idx;

          if (selectedIndex === -1) {
            renderProjects(projects, projectsContainer, 'h2');
          } else {
            let selectedYear = newData[selectedIndex].label;
            let filteredProjects = projects.filter(
                (project) => project.year === selectedYear
            );
            renderProjects(filteredProjects, projectsContainer, 'h2');
          }
          
          svg
            .selectAll('path')
            .attr('class', (_, idx) => (
              idx === selectedIndex ? 'selected' : ''
            ));
          legend
          .selectAll('li')
          .attr('class', (_, idx) => (
            idx === selectedIndex ? 'selected' : ''
          ));
        });
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