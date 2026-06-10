// Chargement des données
let data;
fetch('data.json')
  .then(response => response.json())
  .then(jsonData => {
    data = jsonData;
    initVisualization();
  })
  .catch(error => console.error('Erreur de chargement des données:', error));

// Initialisation de la visualisation
function initVisualization() {
  // Configuration du graphique
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = d3.select("#graph-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("role", "graphics-document")
    .attr("aria-labelledby", "graph-title")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Échelles
  const xScale = d3.scaleLinear()
    .domain([0, 6])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, 6])
    .range([height, 0]);

  // Axes
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).ticks(6));

  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale).ticks(6));

  // Labels des axes
  svg.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .style("text-anchor", "middle")
    .text("Niveau d'Expertise");

  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -40)
    .style("text-anchor", "middle")
    .text("Niveau d'Autonomie");

  // Légende pour l'état en 2024
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 200}, 20)`);

  data.dimensions.etat.labels.forEach((label, i) => {
    legend.append("rect")
      .attr("x", 0)
      .attr("y", i * 20)
      .attr("width", 15)
      .attr("height", 15)
      .attr("stroke-dasharray", i === 0 ? "2,2" : i === 1 ? "2,2" : i === 2 ? "5,3" : "1,1")
      .attr("stroke", "#7726b1")
      .attr("fill", "none");

    legend.append("text")
      .attr("x", 20)
      .attr("y", i * 20 + 12)
      .text(label)
      .style("font-size", "10px");
  });

  // Dessin des points
  updateVisualization();

  // Fonction de mise à jour
  function updateVisualization() {
    svg.selectAll(".ia-node").remove();

    const selectedDimensions = [];
    document.querySelectorAll('input[name="dimension"]:checked').forEach(checkbox => {
      selectedDimensions.push(checkbox.value);
    });

    data.levels.forEach(level => {
      const node = svg.append("g")
        .attr("class", "ia-node")
        .attr("id", `node-${level.id}`)
        .attr("transform", `translate(${xScale(level.expertise)}, ${yScale(level.autonomie)})`)
        .attr("role", "button")
        .attr("tabindex", "0")
        .attr("aria-label", `Détails sur ${level.name}`)
        .on("click", () => showDetails(level))
        .on("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            showDetails(level);
          }
        });

      // Cercle principal
      node.append("circle")
        .attr("r", 10)
        .attr("fill", level.color)
        .attr("stroke", "#333")
        .attr("stroke-width", 2)
        .attr("class", `node-etat-${data.dimensions.etat.labels[level.etat].toLowerCase().replace(/ /g, '-')}`);

      // Label
      node.append("text")
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .text(level.id.toUpperCase())
        .style("font-size", "10px")
        .style("font-weight", "bold");

      // Info-bulle basique (pour accessibilité)
      node.append("title")
        .text(`${level.name}: ${level.description}`);
    });
  }

  // Gestion des filtres
  document.querySelectorAll('input[name="dimension"]').forEach(checkbox => {
    checkbox.addEventListener('change', updateVisualization);
  });

  document.getElementById('reset-filters').addEventListener('click', () => {
    document.querySelectorAll('input[name="dimension"]').forEach(checkbox => {
      checkbox.checked = true;
    });
    updateVisualization();
  });

  // Modale pour les détails
  function showDetails(level) {
    const modal = document.getElementById('details-modal');
    document.getElementById('modal-title').textContent = level.name;
    document.getElementById('modal-description').textContent = level.description;

    const detailsList = document.getElementById('modal-details');
    detailsList.innerHTML = '';

    const fields = [
      { label: "Exemples", value: level.examples.join(', ') },
      { label: "Limitations", value: level.limitations.join(', ') },
      { label: "Enjeux", value: level.enjeux.join(', ') },
      { label: "Niveau d'expertise", value: level.expertise + "/6" },
      { label: "Niveau d'autonomie", value: level.autonomie + "/6" },
      { label: "État en 2024", value: data.dimensions.etat.labels[level.etat] }
    ];

    fields.forEach(field => {
      const dt = document.createElement('dt');
      dt.textContent = field.label;
      const dd = document.createElement('dd');
      dd.textContent = field.value;
      detailsList.appendChild(dt);
      detailsList.appendChild(dd);
    });

    modal.showModal();
  }

  // Fermeture de la modale
  document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('details-modal').close();
  });

  // Accessibilité clavier pour la modale
  document.getElementById('details-modal').addEventListener('keydown', (event) => {
    if (event.key === "Escape") {
      document.getElementById('details-modal').close();
    }
  });
}