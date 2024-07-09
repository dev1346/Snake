function loadFile() {
    let reader = new FileReader();
    reader.onload = function(event) {
        var data = JSON.parse(event.target.result);
        init();
        setInterval(function() {move(data);}, 100);
    };
    reader.readAsText(document.getElementById('fileInput').files[0]);
}

function init() {
    let svg = d3.select("#field").append("svg")
        .attr("width", 500)
        .attr("height", 500);
    let canvas = svg.append("g");
}
function draw(data) {
    let circles = d3.select("svg").selectAll("circle")
        .data(data.positions)
    .enter()
        .append("circle")
    .exit()
        .remove()
    
    circles = d3.selectAll("circle")
        .transition().duration(100).ease(d3.easeLinear)
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return 500-d.y; })
        .attr("r", 5)

}

function move(data) {
    if(Math.random() < 0.3) {
        let newElement = {
            x: Math.random() * 200 + 200,
            y: Math.random() * 200 + 200
        };
        data.positions.push(newElement);
    }
    data.positions.forEach(element => {
        element.x += Math.random() * 40 - 20;
        element.y += Math.random() * 40 - 20;

        element.x = Math.max(0, Math.min(element.x, 400));
        element.y = Math.max(0, Math.min(element.y, 400));
    });
    draw(data);
}