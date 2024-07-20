//----------------------------------------------------------- JSON INPUT OUTPUT
Array.prototype.createJSON = function (parent,child) {
	var data,childrenNumber;	
	if (child===undefined || parent===undefined){
		data = prompt("Name of the root:","");
	} else {
		data = prompt("Name of the child "+(child+1)+" in layer "+ parent +":","");
	}
	childrenNumber = prompt("Number for child in "+data+" :", "0");
	if (isNaN(Number(childrenNumber))) {
		childrenNumber=0;
		}
	var l = [];
	for(var i=0;i<childrenNumber;++i){
		l.createJSON(data,i)
		}
	this.push({data:data,children:l});
	return(this);
}

Array.prototype.downloadJSON = function(fileName) {
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(this)], {type: "application/json"});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    return(this);
}
//----------------------------------------------------------- TextWrap
//
// Usage in d3 
//		.append("text")
//		.attr("x",10)
//		.attr("y",10)
//		.call(BTTextWrap,wmax,hmax)
//
//
function BTTextWrap(text, width, height) {
  text.each(function() {
    let text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      x = text.attr("x"),
      y = text.attr("y"),
      fontsize = text.attr("font-size"),
      dy = 1.1,
      tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        if((lineNumber+2)*fontsize*lineHeight<height){
	        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    }
  });
}


//----------------------------------------------------------- flowerFactory
function flowerFactory(){
	var	color="red",
		outlineColor="blue",
		backgroundColor="lightblue",
		interval = 100;

	function flower(selection,
					tag="flower",
					attrColor=flower.color(),
					attrOutlineColor=flower.outlineColor(),
					attrBackgroundColor=flower.backgroundColor())
	{
		selection.each(function(data,i,sel){
			var path = d3.select(sel[i]).selectAll("path."+tag).data([data]);		
			path.enter()
				.append("path").attr("class",tag)
					.attr("transform",(d)=>flower.transformData(d.x,d.y,d.angle))
				.merge(path)
					.transition().duration(flower.interval()).ease(d3.easeLinear)
					.attr("transform",(d)=>flower.transformData(d.x,d.y,d.angle))
					.attr("d",(d)=>flower.pathData(d.size))
					.attr("fill",attrColor)
					.attr("stroke",attrOutlineColor)
			path.exit()
					.transition().duration(flower.interval()).ease(d3.easeLinear)
					.attr("fill",attrBackgroundColor)
					.attr("stroke",attrBackgroundColor)
					.remove()
		});
	}

	flower.interval = function(value) {
		if(!arguments.length){return(interval);} else{interval=value}
		return(flower);
	}

	flower.color = function(value) {
		if(!arguments.length){return(color);} else{color=value}
		return(flower);
	}

	flower.outlineColor = function(value) {
		if(!arguments.length){return(outlineColor);} else{outlineColor=value}
		return(flower);
	}

	flower.backgroundColor = function(value) {
		if(!arguments.length){return(backgroundColor);} else{backgroundColor=value}
		return(flower);
	}

	flower.pathData = function(r){
		function a(a,b){return("a "+r+","+r+" 0,1,1 "+a+","+b)}
		return(["m "+(-r)+",0",a(r,-r),a(r,r),a(-r,r),a(-r,-r),a(0,1)])
	}

	flower.transformData = function(x,y,angle){
		return("translate("+x+","+y+") rotate("+angle+")")
	}

	return(flower);
}

