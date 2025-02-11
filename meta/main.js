let data = [];
let commits = [];

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));

    displayStats()
    createScatterplot() 

}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

//console.log(commits)

function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        // Each 'lines' array contains all lines modified in this commit
        // All lines in a commit have the same author, date, etc.
        // So we can get this information from the first line
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;

  
        // What information should we return about this commit?
        let ret = {
            id: commit,
            url: 'https://github.com/YOUR_REPO/commit/' + commit,
            author,
            date,
            time,
            timezone,
            datetime,
            // Calculate hour as a decimal for time analysis
            // e.g., 2:30 PM = 14.5
            hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
            // How many lines were modified?
            totalLines: lines.length,
        };

        Object.defineProperty(ret, 'lines', {
            value: lines,
            enumerable: false, // Hide from console output
            configurable: false,
            writable: false
        });

        return ret;
      });
}

function displayStats() {
    // Process commits first
    processCommits();
  
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    // Add total commits
    dl.append('dt').text('commits');
    dl.append('dd').text(commits.length);

    // Add number of files
    dl.append('dt').text('Files');
    dl.append('dd').text(new Set(data.map(d => d.file)).size);
  
    // Add total LOC
    dl.append('dt').text('total loc');
    dl.append('dd').text(data.length);

    // Add maximum depth
    dl.append('dt').text('Max depth');
    dl.append('dd').text(d3.max(data, d => d.depth));

    // Add longest line
    dl.append('dt').text('Longest line');
    dl.append('dd').text(d3.max(data, d => d.length === d3.max(data, d => d.length) ? d : null).line);

    // Add maximum lines in a file
    dl.append('dt').text('Max lines');
    dl.append('dd').text(d3.max(data, d => d.length));
  
}

function createScatterplot() {
    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

    const yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.bottom, usableArea.top]);
    const dots = svg.append('g').attr('class', 'dots');

    const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

    svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

    dots
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .on('mouseenter', (event, commit) => {
        updateTooltipContent(commit);
        updateTooltipVisibility(true);
         updateTooltipPosition(event);
    })
    .on('mouseleave', () => {
        updateTooltipContent({}); 
        updateTooltipVisibility(false);
    });
}

function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });

    time.textContent = commit.time;
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}

document.addEventListener('DOMContentLoaded', () => {
    updateTooltipVisibility(false);
});
