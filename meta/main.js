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
