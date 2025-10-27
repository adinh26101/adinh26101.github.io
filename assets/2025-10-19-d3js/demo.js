// Dữ liệu mẫu
var data = [
  {Country: "USA", Sales: 4800000},
  {Country: "China", Sales: 4200000},
  {Country: "Japan", Sales: 3100000},
  {Country: "Germany", Sales: 2900000},
  {Country: "India", Sales: 2500000},
  {Country: "UK", Sales: 2200000}
];

var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

function makeSvg(target) {
  return d3.select(target)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

/* 1️⃣ STATIC CHART */
var svg1 = makeSvg("#chart-static");
var x1 = d3.scaleBand().range([0, width]).domain(data.map(d => d.Country)).padding(0.2);
var y1 = d3.scaleLinear().domain([0, 5000000]).range([height, 0]);
svg1.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x1(d.Country))
    .attr("y", d => y1(d.Sales))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - y1(d.Sales))
    .attr("fill", "gray");

/* 2️⃣ ATTRIBUTE & STYLING */
var svg2 = makeSvg("#chart-attr");
var x2 = d3.scaleBand().range([0, width]).domain(data.map(d => d.Country)).padding(0.2);
var y2 = d3.scaleLinear().domain([0, 5000000]).range([height, 0]);
svg2.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x2));
svg2.append("g").call(d3.axisLeft(y2));
svg2.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x2(d.Country))
    .attr("y", d => y2(d.Sales))
    .attr("width", x2.bandwidth())
    .attr("height", d => height - y2(d.Sales))
    .attr("fill", "#69b3a2")
    .attr("stroke", "black");

/* 3️⃣ HOVER: sáng bar & show value */
var svg3 = makeSvg("#chart-hover");
var x3 = d3.scaleBand().range([0, width]).domain(data.map(d => d.Country)).padding(0.2);
var y3 = d3.scaleLinear().domain([0, 5000000]).range([height, 0]);

svg3.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x3));
svg3.append("g").call(d3.axisLeft(y3));

// thêm label text (ẩn ban đầu)
// tạo text labels
var labels = svg3.selectAll(".label")
  .data(data)
  .enter()
  .append("text")
  .attr("x", d => x3(d.Country) + x3.bandwidth()/2)
  .attr("y", d => y3(d.Sales) - 5)
  .attr("text-anchor", "middle")
  .attr("fill", "#000")
  .style("font-size", "10px")
  .text(""); // ban đầu rỗng

svg3.selectAll("rect")
  .data(data)
  .enter()
  .append("rect")
  .attr("x", d => x3(d.Country))
  .attr("y", d => y3(d.Sales))
  .attr("width", x3.bandwidth())
  .attr("height", d => height - y3(d.Sales))
  .attr("fill", "#4CAF50")
  .on("mouseover", function(d, i) {
      d3.select(this).attr("fill", "#2E7D32");
      labels.filter((l, j) => i === j)
            .text("$" + d.Sales.toLocaleString());
  })
  .on("mouseout", function(d, i) {
      d3.select(this).attr("fill", "#4CAF50");
      labels.filter((l, j) => i === j)
            .text("");
  });

/* 4️⃣ ANIMATION với nút Replay */
var svg4 = makeSvg("#chart-anim");
var x4 = d3.scaleBand().range([0, width]).domain(data.map(d => d.Country)).padding(0.2);
var y4 = d3.scaleLinear().domain([0, 5000000]).range([height, 0]);
svg4.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x4));
svg4.append("g").call(d3.axisLeft(y4));

// hàm vẽ animation
function drawAnimation() {
  // xóa rect cũ
  svg4.selectAll("rect").remove();

  // thêm rect mới với animation
  svg4.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x4(d.Country))
      .attr("y", y4(0))
      .attr("width", x4.bandwidth())
      .attr("height", height - y4(0))
      .attr("fill", "#2196F3")
      .transition()
      .duration(800)
      .attr("y", d => y4(d.Sales))
      .attr("height", d => height - y4(d.Sales))
      .delay((d,i) => i * 200);
}

// vẽ lần đầu
drawAnimation();

// thêm nút Replay
d3.select("#chart-anim")
  .append("button")
  .text("Replay")
  .style("margin-top", "10px")
  .on("click", drawAnimation);
