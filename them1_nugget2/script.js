// Chargement des données
let data;
fetch('data.json')
  .then(response => response.json())
  .then(jsonData => {
    data = jsonData;
    initVisualization();
  })
  .catch(error => console.error('Erreur:', error));

// Initialisation
function initVisualization() {
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = d3.select("#graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    // Ajout d'une timeline en bas du graphique
const timelineData = [
  { year: "1950", event: "Naissance de l'ANI", level: "ani" },
  { year: "2000", event: "IA Multi-tâches", level: "multi-task" },
  { year: "2016", event: "AlphaGo (IA Adaptative)", level: "adaptive" },
  { year: "2023", event: "AutoGPT (IA Agentique)", level: "agentic" },
  { year: "2030?", event: "AGI (Hypothétique)", level: "agi" },
  { year: "2040?", event: "ASI (Spéculatif)", level: "asi" }
];

const timeline = svg.append("g")
  .attr("class", "timeline")
  .attr("transform", `translate(0,${height + 60})`);

const timelineScale = d3.scaleLinear()
  .domain([0, timelineData.length - 1])
  .range([0, width]);

timeline.selectAll(".timeline-event")
  .data(timelineData)
  .enter()
  .append("g")
  .attr("class", "timeline-event")
  .attr("transform", (d, i) => `translate(${timelineScale(i)}, 0)`)
  .each(function(d) {
    const eventGroup = d3.select(this);

    // Ligne verticale
    eventGroup.append("line")
      .attr("y1", -20)
      .attr("y2", 20)
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1);

    // Cercle pour l'événement
    eventGroup.append("circle")
      .attr("r", 6)
      .attr("fill", data.levels.find(l => l.id === d.level).color)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Année
    eventGroup.append("text")
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .style("font-size", "0.8rem")
      .text(d.year);

    // Événement
    eventGroup.append("text")
      .attr("y", 55)
      .attr("text-anchor", "middle")
      .style("font-size", "0.7rem")
      .style("font-weight", "500")
      .text(d.event);
  });

  // Échelles
  const xScale = d3.scaleLinear().domain([0, 6]).range([0, width]);
  const yScale = d3.scaleLinear().domain([0, 6]).range([height, 0]);

  // Axes
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).ticks(6).tickSize(-height).tickPadding(10));

  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale).ticks(6).tickSize(-width).tickPadding(10));

  // Labels des axes
  svg.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .style("text-anchor", "middle")
    .style("font-weight", "600")
    .text("Niveau d'Expertise");

  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -50)
    .style("text-anchor", "middle")
    .style("font-weight", "600")
    .text("Niveau d'Autonomie");

  // Légende pour l'état 2024
  const legend = d3.select(".graph-legend");
  data.dimensions.etat.labels.forEach((label, i) => {
    const item = legend.append("div")
      .attr("class", "legend-item");

    item.append("div")
      .attr("class", "legend-color")
      .style("background-color", d3.interpolatePlasma(i / (data.dimensions.etat.labels.length - 1)));

    item.append("div")
      .text(label);
  });

  // Tooltip
  const tooltip = d3.select("#tooltip");

  // Dessin des nœuds
  function updateNodes() {
    svg.selectAll(".node").remove();

    const nodes = svg.selectAll(".node")
      .data(data.levels)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${xScale(d.expertise)}, ${yScale(d.autonomie)})`)
      .on("mouseenter", (event, d) => {
        tooltip.style("opacity", 1)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 20) + "px");

        d3.select("#tooltip-title").text(d.name);
        d3.select("#tooltip-subtitle").text(`Niveau ${d.expertise}/6`);
        d3.select("#tooltip-description").text(d.description);
        d3.select("#tooltip-examples").text(d.examples.join(', '));
        d3.select("#tooltip-limitations").text(d.limitations.join(', '));
        d3.select("#tooltip-enjeux").text(d.enjeux.join(', '));
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 20) + "px");
      });

    // Carte du nœud (design moderne)
    nodes.append("rect")
      .attr("class", "node-card")
      .attr("x", -40)
      .attr("y", -30)
      .attr("width", 80)
      .attr("height", 50)
      .attr("rx", 8)
      .attr("ry", 8)
      .style("fill", (d, i) => d3.interpolatePlasma(i / data.levels.length))
      .style("stroke", (d) => d.color);

    // Texte du nœud
    nodes.append("text")
      .attr("class", "node-text")
      .attr("dy", -40)
      .style("text-anchor", "middle")
      .style("font-weight", "600")
      .text(d => d.id.toUpperCase());

    // Cercle central (pour le style)
    nodes.append("circle")
      .attr("r", 8)
      .style("fill", "white")
      .style("stroke", (d) => d.color)
      .style("stroke-width", 3);
  }

  // Filtres
  document.querySelectorAll('input[name="dimension"]').forEach(checkbox => {
    checkbox.addEventListener('change', updateNodes);
  });

  document.getElementById('reset-filters').addEventListener('click', () => {
    document.querySelectorAll('input[name="dimension"]').forEach(checkbox => {
      checkbox.checked = true;
    });
    updateNodes();
  });

  // Initialisation
  updateNodes();
}