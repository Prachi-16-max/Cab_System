let problem = {
  A: { B: 5, C: 7 },
  B: { A: 5, D: 15, E: 20 },
  C: { A: 7, E: 30 },
  D: { B: 15, F: 20 },
  F: { D: 20, E: 10 },
  E: { C: 35, B: 20, F: 10 },
};
let totalCostGlobal = 0;

const URI = "http://localhost:3000";

const form = document.querySelector("form");
const start = document.getElementById("startNodeSelect");
const end = document.getElementById("endNodeSelect");
const bookCab = document.querySelector(".bookCabBtn");
const submitBtn = document.querySelector(".submitBtn");

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  problem = JSON.parse($("#problemJSON").val());

  const cabSelect = $("#cabSelect").val();

  calculate(start.value, end.value, cabSelect);
});

bookCab.addEventListener("click", (e) => 
{
  e.preventDefault ()
  const email = document.getElementById("email").value;
  const name = document.getElementById("name").value;
  const data = {
    name,
    email,
    src: start.value,
    destination: end.value,
    cabType: $("#cabSelect").val(),
    cost: totalCostGlobal,
  };

  bookNow(data);
});

form.onchange = resetBookCab;

function resetBookCab() {
  document.getElementById("cost").textContent = "";
  bookCab.classList.remove("active");
}

function calculate(start, end, cabSelect) {
  renderGraph();

  const costt = 100;

  const solutions = solveDijkstras(problem, start);

  const solutionHTML = $("#solutions");
  solutionHTML.html("");
  solutionHTML.append(`<b>Dijstra's</b> From '${start}' to<br>`);
  //display solutions
  solutionHTML.append(
    " -> " +
      end +
      ": [" +
      solutions[end].join(", ") +
      "]   (dist:" +
      solutions[end].dist +
      ")<br>"
  );
  solutionHTML.append(`With Cab : '${cabSelect}' with Cost: ${costt} + `);
  solutionHTML.append("(dist:" + solutions[end].dist + ")<br>");
  const totalCost = document.querySelector("#cost");
  totalCostGlobal = costt + solutions[end].dist;
  totalCost.textContent = `Rs ${costt + solutions[end].dist}`;
  bookCab.classList.add("active");
}

function solveDijkstras(graph, s) {
  var solutions = {};
  solutions[s] = [];
  solutions[s].dist = 0;

  while (true) {
    var parent = null;
    var nearest = null;
    var dist = Infinity;

    //for each existing solution
    for (var n in solutions) {
      if (!solutions[n]) continue;
      var ndist = solutions[n].dist;
      var adj = graph[n];
      //for each of its adjacent nodes...
      for (var a in adj) {
        //without a solution already...
        if (solutions[a]) continue;
        //choose nearest node with lowest *total* cost
        var d = adj[a] + ndist;
        if (d < dist) {
          //reference parent
          parent = solutions[n];
          nearest = a;
          dist = d;
        }
      }
    }

    //no more solutions
    if (dist === Infinity) {
      break;
    }

    //extend parent's solution path
    solutions[nearest] = parent.concat(nearest);
    //extend parent's cost
    solutions[nearest].dist = dist;
  }

  return solutions;
}

function renderStartNodeSelect() {
  const startNodeSelect = $("#startNodeSelect");
  const nodes = Object.keys(JSON.parse($("#problemJSON").val()));
  html = "";

  for (node of nodes) {
    html += `<option value="${node}">${node}</option>`;
  }

  startNodeSelect.html(html);
}

function renderGraph() {
  $("#graph").html("");

  var w = 500;
  var h = 500;
  var linkDistance = 200;

  var colors = d3.scale.category10();

  function getEdges(problem) {
    let result = [];
    let keys = Object.keys(problem);
    for (sourceNode of keys) {
      for (targetNode of Object.keys(problem[sourceNode])) {
        result.push({
          source: keys.indexOf(sourceNode),
          target: keys.indexOf(targetNode),
          weight: problem[sourceNode][targetNode],
        });
      }
    }
    return result;
  }

  function getNodes(problem) {
    let result = [];
    for (sourceNode of Object.keys(problem)) {
      result.push({ name: sourceNode });
    }
    return result;
  }

  var dataset = {
    nodes: getNodes(problem),
    edges: getEdges(problem),
  };

  var svg = d3.select("#graph").append("svg").attr({ width: w, height: h });

  var force = d3.layout
    .force()
    .nodes(dataset.nodes)
    .links(dataset.edges)
    .size([w, h])
    .linkDistance([linkDistance])
    .charge([-500])
    .theta(0.1)
    .gravity(0.05)
    .start();

  var edges = svg
    .selectAll("line")
    .data(dataset.edges)
    .enter()
    .append("line")
    .attr("id", function (d, i) {
      return "edge" + i;
    })
    .attr("marker-end", "url(#arrowhead)")
    .style("stroke", "#ccc")
    .style("pointer-events", "none");

  var nodes = svg
    .selectAll("circle")
    .data(dataset.nodes)
    .enter()
    .append("circle")
    .attr({ r: 15 })
    .style("fill", function (d, i) {
      return colors(i);
    })
    .call(force.drag);

  var nodelabels = svg
    .selectAll(".nodelabel")
    .data(dataset.nodes)
    .enter()
    .append("text")
    .attr({
      x: function (d) {
        return d.x;
      },
      y: function (d) {
        return d.y;
      },
      class: "nodelabel",
      stroke: "black",
    })
    .text(function (d) {
      return d.name;
    });

  var edgepaths = svg
    .selectAll(".edgepath")
    .data(dataset.edges)
    .enter()
    .append("path")
    .attr({
      d: function (d) {
        return (
          "M " +
          d.source.x +
          " " +
          d.source.y +
          " L " +
          d.target.x +
          " " +
          d.target.y
        );
      },
      class: "edgepath",
      "fill-opacity": 0,
      "stroke-opacity": 0,
      fill: "blue",
      stroke: "red",
      id: function (d, i) {
        return "edgepath" + i;
      },
    })
    .style("pointer-events", "none");

  var edgelabels = svg
    .selectAll(".edgelabel")
    .data(dataset.edges)
    .enter()
    .append("text")
    .style("pointer-events", "none")
    .attr({
      class: "edgelabel",
      id: function (d, i) {
        return "edgelabel" + i;
      },
      dx: 80,
      dy: 0,
      "font-size": 10,
      fill: "#aaa",
    });

  edgelabels
    .append("textPath")
    .attr("xlink:href", function (d, i) {
      return "#edgepath" + i;
    })
    .style("pointer-events", "none")
    .text(function (d, i) {
      return dataset.edges[i].weight;
    });

  svg
    .append("defs")
    .append("marker")
    .attr({
      id: "arrowhead",
      viewBox: "-0 -5 10 10",
      refX: 25,
      refY: 0,
      orient: "auto",
      markerWidth: 10,
      markerHeight: 10,
      xoverflow: "visible",
    })
    .append("svg:path")
    .attr("d", "M 0,-5 L 10 ,0 L 0,5")
    .attr("fill", "#ccc")
    .attr("stroke", "#ccc");

  force.on("tick", function () {
    edges.attr({
      x1: function (d) {
        return d.source.x;
      },
      y1: function (d) {
        return d.source.y;
      },
      x2: function (d) {
        return d.target.x;
      },
      y2: function (d) {
        return d.target.y;
      },
    });

    nodes.attr({
      cx: function (d) {
        return d.x;
      },
      cy: function (d) {
        return d.y;
      },
    });

    nodelabels
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y;
      });

    edgepaths.attr("d", function (d) {
      var path =
        "M " +
        d.source.x +
        " " +
        d.source.y +
        " L " +
        d.target.x +
        " " +
        d.target.y;
      return path;
    });

    edgelabels.attr("transform", function (d, i) {
      if (d.target.x < d.source.x) {
        bbox = this.getBBox();
        rx = bbox.x + bbox.width / 2;
        ry = bbox.y + bbox.height / 2;
        return "rotate(180 " + rx + " " + ry + ")";
      } else {
        return "rotate(0)";
      }
    });
  });
}

async function bookNow(data) {
  bookCab.textContent = "Booking...";
  bookCab.disabled = true;
  submitBtn.disabled = true;

  try {
    const response = await axios.post(
      URI + "/sendMail",
      {
        data,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status === 200) {
      bookCab.textContent = "Book Cab";
      alert("Your cab has been booked. Please check your email.");
      document.getElementById("email").value = "";
      document.getElementById("name").value = "";
      resetBookCab();
      bookCab.disabled = false;
      submitBtn.disabled = false;
    } else {
      bookCab.textContent = "Book Cab";
      alert("There is some issue while booking you cab.");
      bookCab.disabled = false;
      submitBtn.disabled = false;
    }
  } catch (error) {
    bookCab.textContent = "Book Cab";
    alert("There is some issue while booking you cab.");
    bookCab.disabled = false;
    submitBtn.disabled = false;
  }
}
