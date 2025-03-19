let data = [];
let commits = [];
let selectedCommits = [];
let commitProgress = 100;
let timeScale = d3.scaleTime([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)], [0, 100]);
let commitMaxTime = timeScale.invert(commitProgress);

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
}

//console.log(commits)

function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;

        let ret = {
            id: commit,
            url: 'https://github.com/YOUR_REPO/commit/' + commit,
            author,
            date,
            time,
            timezone,
            datetime,
            hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
            totalLines: lines.length,
        };

        Object.defineProperty(ret, 'lines', {
            value: lines,
            enumerable: true,
            configurable: true,
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

let xScale = null;
let yScale = null;

function createScatterplot() {
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

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

    xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();

    yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.bottom, usableArea.top]);
    const dots = svg.append('g').attr('class', 'dots');

    const gridlines = svg
        .append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`);

    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([5, 20]);

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
        .data(sortedCommits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines))
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7)
        .on('mouseenter', (event, commit) => {
            d3.select(event.currentTarget).style('fill-opacity', 1).classed('selected', true);
            updateTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on('mouseleave', () => {
            d3.select(event.currentTarget).style('fill-opacity', 0.7).classed('selected', false);
            updateTooltipContent({}); 
            updateTooltipVisibility(false);
        });
}

let brushSelection = null;

// function brushed(event) {
//     console.log(event);
//     brushSelection = event.selection;
//     updateSelection();
//     updateSelectionCount();
//     updateLanguageBreakdown()
// }

function brushed(evt) {
    let brushSelection = evt.selection;
    selectedCommits = !brushSelection
      ? []
      : commits.filter((commit) => {
          let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
          let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
          let x = xScale(commit.date);
          let y = yScale(commit.hourFrac);
  
          return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
        });
    
    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
  }

function isCommitSelected(commit) {
    return selectedCommits.includes(commit);
}

// function isCommitSelected(commit) {
//     if (!brushSelection) {
//         return false;
//     }

//     const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
//     const max = { x: brushSelection[1][0], y: brushSelection[1][1] };
//     const x = xScale(commit.date);
//     const y = yScale(commit.hourFrac);

//     return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
// }

function updateSelection() {
    d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

// function updateSelectionCount() {
//     const selectedCommits = brushSelection
//         ? commits.filter(isCommitSelected)
//         : [];
    
//     const countElement = document.getElementById('selection-count');
//     countElement.textContent = `${
//         selectedCommits.length || 'No'
//     } commits selected`;
    
//     return selectedCommits;
// }
function updateSelectionCount() {
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
    
    return selectedCommits;
}

function brushSelector() {
    const svg = document.querySelector('svg');
    d3.select(svg).call(d3.brush().on('start brush end', brushed));

    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
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

function updateLanguageBreakdown() {
    // const selectedCommits = brushSelection
    //   ? commits.filter(isCommitSelected)
    //   : [];
    // const container = document.getElementById('language-breakdown');
  
    // if (selectedCommits.length === 0) {
    //   container.innerHTML = '';
    //   return;
    // }
    // const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    // const lines = requiredCommits.flatMap((d) => d.lines);

    const container = document.getElementById('language-breakdown');

    if (selectedCommits.length === 0) {
        container.innerHTML = '';
        return;
    }
  
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type
    );
  
    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
    return breakdown;
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    createScatterplot();

    const selectedTime = d3.select('#selectedTime');
    selectedTime.textContent = timeScale.invert(commitProgress).toLocaleString();

    brushSelector();
});
