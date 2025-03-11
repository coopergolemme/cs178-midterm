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
  console.log(column, min, max);
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

function draw_scatter(data, svg, scale) {
  console.log("Drawing scatterplot", scale);

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

  let dots = svg
    .append("g")
    .selectAll(".dot")
    .data(data)
    .join("circle")
    .attr("class", "dot")
    .attr("cx", (d) => xScale_scatter(d[x_axis]))
    .attr("cy", (d) => yScale_scatter(d[y_axis]))
    .attr("r", 3)
    .attr("stroke", "Black")
    .attr("stroke-width", 1)
    .attr("fill", "red");

  //x-axis label
  // svg
  //   .append("text")
  //   .attr("class", plot_name + "-xlabel")
  //   .attr("text-anchor", "middle")
  //   .attr("x", width / 2)
  //   .attr("y", height + margin.bottom - 5)
  //   .text(x_axis);


  // // //y-axis label
  // svg
  //   .append("text")
  //   .attr("class", plot_name + "-ylabel")
  //   .attr("text-anchor", "middle")
  //   .attr("transform", "rotate(-90)")
  //   .attr("x", -height / 2)
  //   .attr("y", -margin.left + 15)
  //   .text(y_axis);

  // facet label
  // const facet_name = document.getElementById("facetDropdown").value;
  // const facet_value = svg.attr("id");
  // svg.append("text")
    // .attr("class", plot_name + "-title")
    // .attr("text-anchor", "middle")
    // .attr("x", width / 2)
    // .attr("y", -margin.top / 2)
    // .style("font-size", "16px")
    // .style("font-weight", "bold")
    // .text(facet + ": " + facet_value);
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

  console.log(x_axis);
  console.log(y_axis);

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

  // redraw the scatterplot
  draw_scatter(scatter_data_1, svg_1, scale);
  draw_scatter(scatter_data_2, svg_2, scale);
}

function update(scatter1_svg, scatter2_svg, scatter_scale) {
  console.log("Updating...");
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
    console.log("Results:", results);
    update_scatter(
      results["scatter_data_1"],
      scatter1_svg,
      results["scatter_data_2"],
      scatter2_svg,
      results["scatter_ranges"]
    );
  });
}
