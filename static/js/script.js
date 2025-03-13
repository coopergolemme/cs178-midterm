function draw_svg(container_id, margin, width, height) {
  svg = d3
    .select("#" + container_id)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("background-color", "#dbdad7")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  return svg;
}

function draw_xaxis(plot_name, svg, height, scale) {
  svg
    .append("g")
    .attr("class", plot_name + "-xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(scale).tickSize(0));

  // label
  svg
    .append("text")
    .attr("class", plot_name + "-xlabel")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 5)
    .text(document.getElementById("xAxisDropdown").value);
}

function draw_yaxis(plot_name, svg, scale) {
  svg
    .append("g")
    .attr("class", plot_name + "-yaxis")
    .call(d3.axisLeft(scale));

  // label
  svg
    .append("text")
    .attr("class", plot_name + "-ylabel")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 15)
    .text(document.getElementById("yAxisDropdown").value);
}

function draw_axis(plot_name, axis, svg, height, domain, range, discrete) {
  if (discrete) {
    var scale = d3.scaleBand().domain(domain).range(range).padding([1]);
  } else {
    var scale = d3.scaleLinear().domain(domain).range(range);
  }
  if (axis == "x") {
    draw_xaxis(plot_name, svg, height, scale);
  } else if (axis == "y") {
    draw_yaxis(plot_name, svg, scale);
  }
  return scale;
}

function draw_axes(
  plot_name,
  svg,
  width,
  height,
  domainx,
  domainy,
  x_discrete
) {
  var x_scale = draw_axis(
    plot_name,
    "x",
    svg,
    height,
    domainx,
    [0, width],
    x_discrete
  );
  var y_scale = draw_axis(
    plot_name,
    "y",
    svg,
    height,
    domainy,
    [height, 0],
    false
  );
  //print x_scale, y_scale

  return { x: x_scale, y: y_scale };
}

function draw_slider(
  column,
  min,
  max,
  scatter1_svg,
  scatter2_svg,
  scatter_scale
) {
  slider = document.getElementById(column + "-slider");

  noUiSlider.create(slider, {
    start: [min, max],
    connect: false,
    tooltips: true,
    step: 1,
    range: { min: min, max: max },
  });

  slider.noUiSlider.on("change", function () {
    update(scatter1_svg, scatter2_svg, scatter_scale);
  });
}

function draw_legend(minStudents, maxStudents, colorScale) {
  let legendDiv = d3.select("#legend");
  legendDiv.html("");

  let legendSvg = legendDiv
    .append("svg")
    // .attr("transform", "translate(375, 0)")
    .attr("width", 200)
    .attr("height", 50);

  // Define a gradient in SVG
  let defs = legendSvg.append("defs");
  let linearGradient = defs
    .append("linearGradient")
    .attr("id", "legendGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  linearGradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colorScale.range()[0]);

  linearGradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colorScale.range()[1]);

  // gradient bar
  legendSvg
    .append("rect")
    .attr("x", 20)
    .attr("y", 20)
    .attr("width", 160)
    .attr("height", 15)
    .style("fill", "url(#legendGradient)");

  // min and max labels
  legendSvg
    .append("text")
    .attr("x", 15)
    .attr("y", 45)
    .style("font-size", "12px")
    .text(minStudents);

  legendSvg
    .append("text")
    .attr("x", 190)
    .attr("y", 45)
    .style("font-size", "12px")
    .attr("text-anchor", "end")
    .text(maxStudents);
}

function draw_scatter(data, svg, scale) {
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "lightgray")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("visibility", "hidden");

  scatter_scale = draw_axes(
    "scatter",
    svg,
    width,
    height,
    scale.slice(0, 2),
    scale.slice(2),
    false
  );

  //scatter_ranges = [min_x,max_x,min_y,max_y]
  xScale_scatter = scatter_scale["x"];
  yScale_scatter = scatter_scale["y"];

  x_axis = document.getElementById("xAxisDropdown").value;
  y_axis = document.getElementById("yAxisDropdown").value;

  const colorScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.student_count)])
    //.range(["steelblue", "darkred"]);
    .range(["#F4FB56", "#E0060A"]);

  let dots = svg
    .append("g")
    .selectAll(".dot")
    .data(data)
    .join("circle")
    .attr("class", "dot")
    .attr("cx", (d) => xScale_scatter(d[x_axis]))
    .attr("cy", (d) => yScale_scatter(d[y_axis]))
    .attr("r", 4)
    .attr("stroke", "Black")
    .attr("stroke-width", 1)
    .attr("fill", (d) => colorScale(d.student_count))
    .on("mouseover", (event, d) => {
      tooltip
        .style("visibility", "visible")
        .html(
          `${x_axis}: ${d[x_axis]}<br>${y_axis}: ${d[y_axis]}<br>Number of Students: ${d.student_count}`
        );
      d3.select(event.currentTarget).transition().duration(100).attr("r", 8);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("top", event.pageY - 20 + "px")
        .style("left", event.pageX + 10 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
      d3.select(event.currentTarget).transition().duration(100).attr("r", 4);
    });

  const minStudents = d3.min(data, (d) => d.student_count);
  const maxStudents = d3.max(data, (d) => d.student_count);

  return { colorScale, minStudents, maxStudents };
}

//Extracts the minimum/maximum values for each slider
function get_params() {
  var internships = [0, 0];
  var projects = [0, 0];
  var aptitude = [0, 0];
  var soft_skills = [0, 0];
  var ssc_marks = [0, 0];
  var hsc_marks = [0, 0];

  const internship_slider =
    document.getElementById("Internships-slider").noUiSlider;
  internships = [internship_slider.get()[0], internship_slider.get()[1]];

  const projects_slider = document.getElementById("Projects-slider").noUiSlider;
  projects = [projects_slider.get()[0], projects_slider.get()[1]];

  const aptitude_slider = document.getElementById(
    "AptitudeTestScore-slider"
  ).noUiSlider;
  aptitude = [aptitude_slider.get()[0], aptitude_slider.get()[1]];

  const soft_skills_slider = document.getElementById(
    "SoftSkillsRating-slider"
  ).noUiSlider;
  soft_skills = [soft_skills_slider.get()[0], soft_skills_slider.get()[1]];

  const ssc_marks_slider =
    document.getElementById("SSC_Marks-slider").noUiSlider;
  ssc_marks = [ssc_marks_slider.get()[0], ssc_marks_slider.get()[1]];

  const hsc_marks_slider =
    document.getElementById("HSC_Marks-slider").noUiSlider;
  hsc_marks = [hsc_marks_slider.get()[0], hsc_marks_slider.get()[1]];

  const facet = document.getElementById("facetDropdown").value;

  const x_axis = document.getElementById("xAxisDropdown").value;
  const y_axis = document.getElementById("yAxisDropdown").value;

  let selected_options_EA = [];
  document
    .querySelectorAll("input.checkboxExtracurricular:checked")
    .forEach((checkbox) => {
      selected_options_EA.push(checkbox.value);
    });

  let selected_options_PT = [];
  document
    .querySelectorAll("input.checkboxPlacement:checked")
    .forEach((checkbox) => {
      selected_options_PT.push(checkbox.value);
    });

  return {
    filter_values: {
      Internships: internships,
      Projects: projects,
      AptitudeTestScore: aptitude,
      SoftSkillsRating: soft_skills,
      SSC_Marks: ssc_marks,
      HSC_Marks: hsc_marks,
    },
    selected_options_EA: selected_options_EA,
    selected_options_PT: selected_options_PT,
    x_axis: x_axis,
    y_axis: y_axis,
    facet: facet,
  };
}

// Removes the old data points and redraws the scatterplot
function update_scatter(scatter_data_1, svg_1, scatter_data_2, svg_2, scale) {
  // removes the old data points, axes, labels
  svg_1.selectAll(".dot").remove();
  svg_2.selectAll(".dot").remove();
  svg_1.selectAll(".scatter-xaxis").remove();
  svg_2.selectAll(".scatter-xaxis").remove();
  svg_1.selectAll(".scatter-yaxis").remove();
  svg_2.selectAll(".scatter-yaxis").remove();
  svg_1.selectAll(".scatter-xlabel").remove();
  svg_2.selectAll(".scatter-xlabel").remove();
  svg_1.selectAll(".scatter-ylabel").remove();
  svg_2.selectAll(".scatter-ylabel").remove();
  svg_1.selectAll(".scatter-title").remove();
  svg_2.selectAll(".scatter-title").remove();

  // redraw the scatterplot
  // draw_scatter(scatter_data_1, svg_1, scale);
  // draw_scatter(scatter_data_2, svg_2, scale);
  let scatter1 = draw_scatter(scatter_data_1, svg_1, scale);
  let scatter2 = draw_scatter(scatter_data_2, svg_2, scale);

  const minStudents = Math.min(
    scatter1.minStudents ?? scatter2.minStudents,
    scatter2.minStudents ?? scatter1.minStudents
  );
  const maxStudents = Math.max(
    scatter1.maxStudents ?? scatter2.maxStudents,
    scatter2.maxStudents ?? scatter1.maxStudents
  );

  draw_legend(minStudents, maxStudents, scatter1.colorScale);

  //facet title
  const binary_dict = {
    PlacementStatus: ["Placed", "NotPlaced"],
    ExtracurricularActivities: ["Yes", "No"],
    PlacementTraining: ["Yes", "No"],
  };

  draw_title(binary_dict, svg_1, 0);
  draw_title(binary_dict, svg_2, 1);
}

function draw_title(binary_dict, svg, graph_num) {
  const facet_name = document.getElementById("facetDropdown").value;

  let facet_value;
  if (graph_num == 0) {
    facet_value = binary_dict[facet_name][1];
  } else if (graph_num == 1) {
    facet_value = binary_dict[facet_name][0];
  }

  svg
    .append("text")
    .attr("class", "scatter-title")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(facet_name + ": " + facet_value);
}

function update(scatter1_svg, scatter2_svg, scatter_scale) {
  params = get_params();
  fetch("/update", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(params),
    cache: "no-cache",
    headers: new Headers({
      "content-type": "application/json",
    }),
  }).then(async function (response) {
    var results = JSON.parse(JSON.stringify(await response.json()));

    update_scatter(
      results["scatter_data_1"],
      scatter1_svg,
      results["scatter_data_2"],
      scatter2_svg,
      results["scatter_ranges"]
    );
  });
}
