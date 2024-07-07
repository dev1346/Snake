var appConfig = {
		width: window.innerWidth,
		height: window.innerHeight,
		infoHeight: 30	
	}

var envConfig = {
		colorDay: "lightgreen",
		colorNight: "black",
		timeDayNight: 20000,
		timeStep: 100,
		time: 0
	}

var targetConfig = {
		maxAge: 100000,
		maxNumber: 60,
		jumpSize: 0,
		birthRate: 0.03,	// per seconds
		youngSize: 1,
		midageSize: 15,
		feedPortion: 1000,
		idNumber: 0
	}

var snakeConfig = {
		maxAge: 40000,
		matureAge: 6000,
		maxNumber: 20,
		birthRate: 0.1,		// per seconds
		youngSize: 1,
		midageSize: 15,
		jumpSize: 15,
		jointNumber: 10,
		tailNumber: 3,
		bedroomSize: 10,
		idNumber:0
	};


function init() {
	appConfig.width = window.innerWidth;
	appConfig.height = window.innerHeight;

	var targets = [];
	var snakes = [];
	var canvas = d3.select("body").append("svg").attr("width",appConfig.width).attr("height",appConfig.height)
				.style("background",envConfig.colorDay)
				.on("touchstart",touchHandle).on("mouseup",mouseHandle)
	var info = canvas.append("text")
				.attr("class","info")
				.attr("x",10).attr("y",appConfig.infoHeight).attr("font-size",appConfig.infoHeight*0.8)


	setInterval(()=>{
		snakes = updateSnakesModel(snakes,targets);
		targets = updateTargetsModel(targets);

		renderSnakes(canvas,snakes,targets)
		renderTargets(canvas,targets);

		envConfig.time += envConfig.timeStep;
		canvas.style("background",scaleDayNightLight(Math.sin(envConfig.time/envConfig.timeDayNight)))
		},envConfig.timeStep);

	setInterval(()=>{
			if(snakes.length==0){addToSnakes(snakes);}
			if(snakes.length==1){addToSnakes(snakes);snakes[1].gender=!snakes[0].gender}
			if(snakes.length>=snakeConfig.maxNumber){snakes.forEach((d)=>d.age*=1.1)}
			if(targets.length>=targetConfig.maxNumber){targets.forEach((d)=>d.age*=1.1)}
		}
	,2500);


	function mouseHandle(){
		d3.event.preventDefault();
		d3.event.stopPropagation();
		var d = d3.mouse(this)
		if(snakes.length==0){
			addToSnakes(snakes,event.clientX,event.clientY);
		} else {
			addToTargets(targets,event.clientX,event.clientY);
		}
	}
	function touchHandle(){
		d3.event.preventDefault();
		d3.event.stopPropagation();
		var d = d3.touches(this)
		if(snakes.length==0){
			d.forEach((t)=>{addToSnakes(snakes,t[0],t[1]);})
		} else {
			d.forEach((t)=>{addToTargets(targets,t[0],t[1]);})
		}
	}
}

function snakeInfo(l){
	if(l>1)
		{return(l+" snakes")}
	else
		{return(l+" snake")}
}

function activity(){

	return(scaleDayNightActivity(Math.sin(envConfig.time/envConfig.timeDayNight)))
}

//******************************************************* Scales
var scaleSnakeAgeSize=d3.scaleSequential().domain([0,snakeConfig.maxAge]).interpolator((x)=>snakeConfig.youngSize+(snakeConfig.midageSize-snakeConfig.youngSize)*4*(x-x*x))
var scaleSnakeAgeJump = d3.scaleLinear().domain([0,snakeConfig.maxAge]).range([0,7]).clamp(true)
var scaleSnakeTailSize = d3.scaleQuantize().domain([0,4]).range([1,0.6,0.5,0.3,0.2])
var scaleAgeColorHeadMale = d3.scaleLinear().domain([0,snakeConfig.maxAge]).range(["white","blue"]);
var scaleAgeColorHeadFemale = d3.scaleLinear().domain([0,snakeConfig.maxAge]).range(["white","red"]);
var scaleAgeColorBody = d3.scaleLinear().domain([0,snakeConfig.maxAge]).range(["yellow","darkgray"]);
var scaleDayNightLight = d3.scaleLinear().domain([-1,1]).range([envConfig.colorNight,envConfig.colorDay]);
var scaleDayNightActivity = d3.scaleLinear().domain([-1,1]).range([0,1]);

//******************************************************************************* SNAKE

//********************************************************************** SNAKE RENDER
function renderSnakes(selection,snakes,targets){
	var a = selection.selectAll("g.snake").data(snakes,(d)=>d.counter)
			a.enter().append("g").attr("class","snake")
			a.exit().remove()

	var b =	a.selectAll("circle.body").data((d)=>{return(getSnakeBody(d))})
			b.enter().append("circle").attr("class","body")
				.attr("stroke","black")
				.attr("cx",(d)=>d.x)
				.attr("cy",(d)=>d.y)	
				.merge(b)
					.attr("fill",(d)=>d.color)
					.attr("r",(d)=>d.r)
					.transition().duration(envConfig.timeStep).ease(d3.easeLinear)
					.attr("cx",(d)=>d.x)
					.attr("cy",(d)=>d.y)	
			b.exit().remove()

	var c = selection.selectAll("path.snake").data(snakes,(d)=>d.counter)
			c.enter().append("path").attr("class","snake")
				.attr("stroke-width",2)
				.attr("fill","none")
				.merge(c)
					.transition().duration(envConfig.timeStep).ease(d3.easeLinear)
					.attr("stroke",(d)=>{
						if(d.mature && d.gender){return("darkred")}
						else if(d.mature && !d.gender){return("darkblue")}
						else {return("black")}
						})
					.attr("d",(d)=>{return(d3.line().curve(d3.curveNatural)(getSnakeTail(d)))})
	 		c.exit().remove()
}
//********************************************************************** SNAKE MODEL
function addToSnakes(ss,x=Math.random()*appConfig.width,y=Math.random()*appConfig.height){
	ss.push(createSnake(x,y,snakeConfig.jointNumber))
	return(ss)
}

function createSnake(x,y,nJoints){
	var body = [];
	for(var i=0;i<nJoints;++i){
		body.push({x:radiusSnakeTail(i,0),y:0})
	}
	snakeConfig.idNumber+=1;
	return({
		head:{x:x,y:y},
		body:body,
		size:scaleSnakeAgeSize(0),
		age:0,
		counter:snakeConfig.idNumber,
		target:null,
		status:"alive",												// alive,eating,dead
		gender:(Math.random()>0.5),									// male=false,female=true
		mature:false,												// false,true
		heading:{dx:0,dy:0,teta:0}
	});
}

function moveSnake(s,x,y){
	var dx = s.head.x - x, dy = s.head.y - y;
	dx += s.body[0].x/2;
	dy += s.body[0].y/2;
	s.body.unshift({x:dx,y:dy});
	s.body.pop();
	s.head = {x:x,y:y}
}
//********************************************************************** SNAKE UTILITIS
function getSnakeBody(s){				// Get snake tail for rendering circles
	var res = [{x:s.head.x,y:s.head.y,color:scaleAgeColorHeadMale(s.age),r:radiusSnakeTail(0,s.age)}];
	if(s.gender){
		res = [{x:s.head.x,y:s.head.y,color:scaleAgeColorHeadFemale(s.age),r:radiusSnakeTail(0,s.age)}];
	}
	for(var i=0;i<s.body.length;++i){
		var last = res[res.length-1];
		res.push({x:s.body[i].x+last.x,y:s.body[i].y+last.y,color:scaleAgeColorBody(s.age),r:radiusSnakeTail(i+1,s.age)});
	}
	return(res.splice(0,s.body.length-snakeConfig.tailNumber));
}

function getSnakeTail(s){					// Get snake tail for rendering path
	var res = [[s.head.x,s.head.y]];
	for(var i=0;i<s.body.length;++i){
		var last = res[res.length-1];
		res.push([s.body[i].x+last[0],s.body[i].y+last[1]]);
	}
	return(res.splice(s.body.length-snakeConfig.tailNumber-1));	
}

function radiusSnakeTail(joint,age){

	return(scaleSnakeAgeSize(age)*scaleSnakeTailSize(joint))
}
//******************************************************* Snakes
function updateSnakesModel(ss,ts){
	var active = activity();
	ss.forEach((s)=>{
		updateSnakeTarget(s,ts)
		updateSnakeStatus(s)
		//**************************** Revival as target
		if(s.status=="dead"){  											
			getSnakeBody(s).forEach((d)=>{addToTargets(ts,d.x,d.y)})
		} else {
			//**************************** Seek & escape partner when no other target is defined
			if((s.heading.dx==0) && (s.heading.dy==0)){
				if(s.gender){
					ss.forEach((male)=>{
								if((!male.gender)&&(male.mature)){
									s.heading = headingSnakeAwaySnake(male,s)
								}				
					})
				} else {
					if(s.mature){
							ss.forEach((fem)=>{
								if((fem.gender)&&(fem.mature)){
									s.heading = headingSnakeToSnake(fem,s)
								}				
							})
					}
				}
			}				
			//**************************** Move
			var x = s.head.x + (scaleSnakeAgeJump(s.age)*(1-2*Math.random()) + s.heading.dx)*active;
			var y = s.head.y + (scaleSnakeAgeJump(s.age)*(1-2*Math.random()) + s.heading.dy)*active;
			if(x>=appConfig.width || x<=0){x = 2*s.head.x - x}
			if(y>=appConfig.height || y<=0){y = 2*s.head.y - y}
			moveSnake(s,x,y)

			//**************************** Aging
			s.age += envConfig.timeStep*active;
			if(s.age>snakeConfig.matureAge){s.mature=true;}
			//**************************** Eating
			if(s.status=="eating"){	
				if(s.age>(1+Math.random())*snakeConfig.maxAge/4)
					s.age -= targetConfig.feedPortion;
				if(s.target.age<targetConfig.maxAge/2){s.target.age=targetConfig.maxAge-s.target.age}
				s.target.age += targetConfig.feedPortion;
				s.target.attacks +=1;
			}
			//**************************** Giving birth				
			if((s.gender) && (s.mature) && (Math.random()*1000<snakeConfig.birthRate*envConfig.timeStep*active)){
				var marriage = false;
				ss.forEach((m)=>{
								if((!m.gender)&&(m.mature)){
									if(distance(m.head,s.head)<scaleSnakeAgeSize(m.age)+scaleSnakeAgeSize(s.age))
										marriage = true;
								}				
							})
				if(marriage)
					{
					addToSnakes(ss,s.head.x,s.head.y)
					s.age += targetConfig.feedPortion;
					}
			}
		}	
	})
	return(ss.filter((d)=>{return(d.status!="dead")}).slice());
}

function updateSnakeStatus(s){
	if(s.age>snakeConfig.maxAge){
		s.status = "dead";
	} else {
		if(s.target==null){
			s.status = "alive";
			s.heading = {dx:0,dy:0};
		} else {
			var xx = s.target.x-s.head.x
			var yy = s.target.y-s.head.y
			var dist=distance(s.target,s.head)
			if(dist>snakeConfig.jumpSize*1.2){
				s.heading = {dx:2*scaleSnakeAgeJump(s.age)*xx/dist,dy:2*scaleSnakeAgeJump(s.age)*yy/dist};
				s.status = "alive"
			} else {
				s.heading = {dx:0,dy:0};
				s.status = "eating"
			}
		}	
	}
}
function headingSnakeToSnake(s1,s2){
	var xx = s1.head.x-s2.head.x
	var yy = s1.head.y-s2.head.y
	var dist=distance(s1.head,s2.head)
	if(dist>snakeConfig.bedroomSize){
		return({dx:2*scaleSnakeAgeJump(s1.age)*xx/dist,dy:2*scaleSnakeAgeJump(s1.age)*yy/dist});
	} 
	return({dx:0,dy:0})
}
function headingSnakeAwaySnake(s1,s2){
	var xx = s1.head.x-s2.head.x
	var yy = s1.head.y-s2.head.y
	var dist=distance(s1.head,s2.head)
	if(dist>snakeConfig.bedroomSize){
		return({dx:-50*scaleSnakeAgeJump(s1.age)*xx/dist/dist,dy:-50*scaleSnakeAgeJump(s1.age)*yy/dist/dist});
	} 
	return({dx:0,dy:0})
}
function updateSnakeTarget(s,ts){
	dist = ts.map((d)=>{
				return({tar:d,dist:(d.x-s.head.x)*(d.x-s.head.x)+(d.y-s.head.y)*(d.y-s.head.y)}
				)})
		dist.sort((d1,d2)=>(d1.dist-d2.dist))

		if(dist.length>0){
			s.target = dist[0].tar;
			if(dist.length>1 && s.status!="eating"){
				if(dist[0].tar.attacks>dist[1].tar.attacks+5){
					s.target = dist[1].tar;
				}
			}
		} else {
			s.target = null;		
	}		
}

function distance(a,b){
	return(Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y)))
}
//******************************************************************************* TARGET
var scaleTagetAgeSize=d3.scaleSequential().domain([0,targetConfig.maxAge]).interpolator((x)=>targetConfig.youngSize+(targetConfig.midageSize-targetConfig.youngSize)*4*(x-x*x)).clamp(true)
var scaleTargetAttackOpacity=d3.scaleLinear().domain([0,5]).range([1,0])
var scaleTargetAttackColor=d3.scaleLinear().domain([0,2]).range(["red","darkred","black"])

var garden = flowerFactory().backgroundColor(envConfig.colorDay).interval(envConfig.timeStep);
//********************************************************************** TARGET RENDER

function renderTargets(selection,ts) {
	var a = selection.selectAll("g.target").data(ts,(d)=>d.counter)
			.call(garden,"target",(d)=>d.color,(d)=>d3.schemePaired[Math.floor(Math.random()*12)])
		a.enter()
			.append("g").attr("class","target")

		a.exit()
			.remove()
}

//********************************************************************** TARGET MODEL
function addToTargets(ts,x=Math.random()*appConfig.width,y=Math.random()*appConfig.height,age=0){
	var t = {
		x:x,
		y:y,
		size:scaleTagetAgeSize(0),
		angle:0,
		age:age,
		counter:targetConfig.idNumber,
		attacks:0,
		color:d3.interpolateRainbow(Math.random())
	};
	ts.push(t);
	targetConfig.idNumber +=1;
	return(ts)
}
//********************************************************************** TARGET UPDATES
function updateTargetsModel(ts){
	var active = activity()
	ts.forEach((t)=>{
		//**************************** Update color
		if(t.attacks>0){
			t.attacks-=1;
			t.color=(scaleTargetAttackColor(t.attacks))
			t.color=d3.hsl(t.color)
			t.color.opacity=scaleTargetAttackOpacity(t.attacks)
		} else {
			//**************************** Update position
			var x = t.x + targetConfig.jumpSize*(1-2*Math.random());
			var y = t.y + targetConfig.jumpSize*(1-2*Math.random());
			if(x>=appConfig.width || x<=0){x = 2*t.x - x}
			if(y>=appConfig.height || y<=0){y = 2*t.y - y}
			t.x = x;
			t.y = y;
			t.angle = active * t.age * (1-2*Math.random())/300;
		}
		//**************************** Update age & size
		t.age += envConfig.timeStep*active;
		t.size = scaleTagetAgeSize(t.age);
	})
	//**************************** Birth
	if(Math.random()*1000<targetConfig.birthRate*envConfig.timeStep){	
		addToTargets(ts)
	}
	//**************************** Death & return survivals
	return(ts.filter((d)=>{return(d.age<targetConfig.maxAge)}).slice());
}





