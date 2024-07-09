  function loadFile() {
    var input = document.getElementById('fileInput');
    var reader = new FileReader();
      reader.onload = function(){
        var data = JSON.parse(reader.result);
        show(data);
      };
    reader.readAsText(input.files[0]);
  }


  function show(dataArray){
    diameter = parseInt(document.getElementById("diameterInput").value);
    mainColor = document.getElementById("colorPicker").value;
    angle = document.getElementById("angleInput").value;
    beta = document.getElementById("betaInput").value;
    fontSize = document.getElementById("fontSize").value;

    radius = diameter / 2,
    innerRadius = radius - 120;

    var cluster = d3.cluster()
        .size([angle, innerRadius]);


    var line = d3.radialLine()
        .curve(d3.curveBundle.beta(beta/100))
        .radius(function(d) { return d.y; })
        .angle(function(d) { return d.x / 180 * Math.PI; });


    d3.select("#Graph").select("svg").remove();

    var svg = d3.select("#Graph").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
      .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");

    var link = svg.append("g").selectAll(".link"),
        node = svg.append("g").selectAll(".node");

    // d3.json(dataFile, function(error, classes) {
    //   if (error) throw error;

      var root = packageHierarchy(dataArray);
      cluster(root);
      link = link
        .data(packageImports(root.leaves()))
        .enter().append("path")
          .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
          .attr("stroke-width",function(d){return(d.strength/20)})
          .attr("stroke-opacity",function(d){return(d.strength/100)})
        .attr("stroke",mainColor)
          .attr("fill","none")
          .attr("d", line);

      node = node
        .data(root.leaves())
        .enter().append("text")
        .attr("font-weight", "normal")
        .attr("stroke",function(d){if(d.data.color){return(d.data.color)}else {return('black')}})
        .attr("stroke-width","0.1px")
        .attr("font", `5px sans-serif`)
        .attr("font-size", `${fontSize}px`)
          .attr("dy", "0.31em")
          .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
          .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
          .text(function(d) { return d.data.key; });
    // });  
}


// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes) {
  var map = {};

  function find(name, data) {
    var node = map[name], i;
    if (!node) {
      node = map[name] = data || {name: name, children: []};
      if (name.length) {
        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
        node.parent.children.push(node);
        node.key = name.substring(i + 1);
      }
    }
    return node;
  }

  classes.forEach(function(d) {
    find(d.name, d);
  });

  return d3.hierarchy(map[""]);
}

// Return a list of imports for the given array of nodes.
function packageImports(nodes) {
  var map = {},
      imports = [];

  // Compute a map from name to node.
  nodes.forEach(function(d) {
    map[d.data.name] = d;
  });

  // For each import, construct a link from the source to target node.
  nodes.forEach(function(d) {
    if (d.data.imports) d.data.imports.forEach(function(i,k) {
        let e = map[d.data.name].path(map[i])
        e.strength = d.data.strength[k]
      imports.push(e);
    });
  });
  return imports;
}

function downloadSVGAsPNG() {
    let file = document.getElementById('fileInput').files[0];
    let pngFile = 'chart.png'

    if(file){
        pngFile = file.name.replace(/\.\w+$/, '.png');
    } 
    // Get the SVG element from the page
    var svgElement = document.querySelector('svg');

    // Create a new canvas element
    var canvas = document.createElement('canvas');
    var svg = new XMLSerializer().serializeToString(svgElement);
    var svgBlob = new Blob([svg], {type:"image/svg+xml;charset=utf-8"});
    var url = URL.createObjectURL(svgBlob);

    // Create a new image to render the SVG to the canvas
    var img = new Image();
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Get the data URL representation of the canvas (PNG)
      var dataURL = canvas.toDataURL('image/png');

      // Create a link to download the PNG file
      var downloadLink = document.createElement('a');
      downloadLink.download = pngFile;
      downloadLink.href = dataURL;
      downloadLink.innerHTML = 'Download PNG';
      document.body.appendChild(downloadLink);

      // Simulate a click on the download link to start the download
      downloadLink.click();
    };
    img.src = url;
  }
