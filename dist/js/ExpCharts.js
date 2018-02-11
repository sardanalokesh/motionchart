var exp = {};

exp.charts = {};
exp.controls = {};;(function() {

	exp.axis = axis;

	/*********************************
		options = {
			type: // string 'x' or 'y'
			chartContainer: // container object
			scale: // d3 axis scale
			labelText: // string
			labelOffset: //number
			tickFormat: // d3 format
			gridlines: // boolean
			ticks: // number
		}
	************************************/

	function axis(options) {
		var self = this;
		self.type = options.type;
		self.chartContainer = options.chartContainer;
		self.labelText = options.labelText;
		self.labelOffset = options.labelOffset;
		self.scale = options.scale;
		self.tickFormat = options.tickFormat;
		self.gridlines = options.gridlines || false;
		self.ticks = options.ticks || 5;
		self.axisG = null;
		self.axis = null;

		//axis type can be either "x" or "y"
		if (self.type != "x" && self.type != "y") {
			throw new Error("Axis type can be either 'x' or 'y'");
		}

		var chartArea = self.chartContainer.getChartArea();
		self.axisG = chartArea.append("g")
	        .attr("class", self.type == 'x' ? "x axis" : "y axis");
	    if (self.type == 'x')
	        self.axisG.attr("transform", "translate(0," + self.chartContainer.getHeight() + ")");
	    self.axisLabel = self.axisG.append("text")
	        .style("text-anchor", "middle")
	        .attr("transform", getAxisTranslation(self.type))
	        .attr("class", "label")
	        .text(self.labelText);
	    self.axis = d3.svg.axis().scale(self.scale).orient(getAxisOrientation(self.type))
	        .ticks(self.ticks)
	        .innerTickSize(getInnerTickSize())
	        .outerTickSize(0)
	        .tickFormat(self.tickFormat);

	    function getAxisTranslation(type) {
			var translation;
			if (type == 'x')
				translation = "translate(" + (self.chartContainer.getWidth() / 2) + "," + self.labelOffset + ")";
			else if (type == 'y')
				translation = "translate(-" + self.labelOffset + "," + (self.chartContainer.getHeight() / 2) + ") rotate(-90)";
			return translation;
		}

		function getAxisOrientation(type) {
			return type == 'x' ? "bottom" : "left";
		}

		function getInnerTickSize() {
			if (self.gridlines) {
				if (self.type == 'x')
					return -1*self.chartContainer.getHeight();
				else
					return -1*self.chartContainer.getWidth();
			}
			return 0;
		}
	}

	axis.prototype.load = function() {
		this.axisG.call(this.axis);
	};

})();;(function() {
	
	exp.container = container;

	function container(svgSelector, width, height, margin) {
		this.svgSelector = svgSelector;
		this.width = width;
		this.height = height;
		this.margin = margin;
		var svg = d3.select(this.svgSelector)
		    .attr("width", width)
		    .attr("height", height);
		var clipPath = svg.append("defs").append("clipPath")
					    .attr("id", "clip")
					  	.append("rect")
					    .attr("width", this.width - margin.left - margin.right)
					    .attr("height", this.height - margin.top - margin.bottom);
		this.chartArea = svg.append("g")
			.attr("height", this.getHeight())
			.attr("width", this.getWidth())
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	}

	container.prototype.getHeight = function() {
		return this.height - this.margin.top  - this.margin.bottom;
	};

	container.prototype.getWidth = function() {
		return this.width - this.margin.left - this.margin.right;
	};

	container.prototype.getChartArea = function() {
		return this.chartArea;
	};
})();;(function() {
	
	exp.line = line;

	/****************************

	options = {
		chartArea:
		xCallback:
		yCallback:
		xGuidelines:
		yGuidelines:
		xScale:
		yScale:
	}
	******************************/

	function line(options) {
	  this.chartArea = options.chartArea;
	  this.xCallback = options.xCallback;
	  this.yCallback = options.yCallback;
	  this.xScale = options.xScale;
	  this.yScale = options.yScale;
	  this.xGuidelines = options.xGuidelines || false;
	  this.yGuidelines = options.yGuidelines || false;
	  this.color = "#0000ff"; //default color blue if nothing specified in series
	  this.id = "0";

      this.path = this.chartArea.append("path")
        .attr("class", "chart-line");
      this.ln = d3.svg.line()
        .x(options.xCallback)
        .y(options.yCallback);

      //make formats configurable
      var tooltipOptions = {
      	chartArea: this.chartArea, 
      	xFormat: d3.time.format("%B %d, %Y"), 
      	yFormat: d3.format(","),
      	color: this.color
      };
      this.tooltip = new exp.tooltip(tooltipOptions);
	}

	line.prototype.load = function(xExtent, yExtent, series) {
		
		var self = this;
		if (series) {
			self.data = series.data;
			self.color = series.color;
			self.id = series.id;
		}

		/* line */
		self.path
			.attr("d", self.ln(self.data))
			.style("stroke", self.color);

		/* set tooltip color */
		self.tooltip.setColor(self.color);

		//remove all points before next rendering
		//TODO: find if any other efficient way to achieve this using d3
		self.chartArea.selectAll(".line-point.line" + self.id).remove();

		/* line points */
		var dots = self.chartArea.selectAll("dot")
          .data(self.data);
        dots.enter().append("g")
        	.style("opacity", 0)
            .attr("class", "line-point line" + self.id)
            .attr("fill", self.color)
          	.on("mouseover", function(d) {
          		var isMarker = d3.event.target.getAttribute("class") == "marker";
          		if (!isMarker)
          			return;
          		var transitionTime = 200;
                
                //show line point
                d3.select(this)
                    .transition()
                    .duration(transitionTime)
                    .style("opacity", 1);
                
                //show tooltip
                var x = parseFloat(d3.select(this).select("circle").attr("cx")) + 5;
                var y = parseFloat(d3.select(this).select("circle").attr("cy")) + 5;
                var xNodeText = d3.select(this).data()[0].x;
                var yNodeText = d3.select(this).data()[0].y;

                self.tooltip.render(x, y, xNodeText, yNodeText, transitionTime);
            })
            .on("mouseout", function(d) {
            	var isMarker = d3.event.target.getAttribute("class") == "marker";
          		if (!isMarker)
          			return;
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 0);
                self.tooltip.hide();
            });

        dots.append("circle")
            .attr("r", 5)
            .attr("class", "marker")
            .attr("cx", self.xCallback)
            .attr("cy", self.yCallback);

        /* x guideline */
        if (self.xGuidelines) {
			dots.append("line")
	            .attr("class", "guideline")
	            .attr("x1", self.xCallback)
	            .attr("y1", self.yScale(yExtent[0]) )
	            .attr("x2", self.xCallback)
	            .attr("y2", self.yScale(yExtent[1]) );
        }

        /* y guideline */
        if (self.yGuidelines) {
	        dots.append("line")
	            .attr("class", "guideline")
	            .attr("x1", self.xScale(xExtent[0]))
	            .attr("y1", self.yCallback )
	            .attr("x2", self.xScale(xExtent[1]))
	            .attr("y2", self.yCallback );
        }

		/*var totalLength = this.path.node().getTotalLength();
	    this.path
	      .attr("stroke-dasharray", totalLength + " " + totalLength)
	      .attr("stroke-dashoffset", totalLength)
	      .transition()
	        .duration(3000)
	        .ease("linear")
	        .attr("stroke-dashoffset", 0);*/
	};

})();;(function() {

  exp.charts.motionChart = chart;

  /*****************************************
    options: {
      width: //number
      height: //number
      margin: {
        left: //number
        top: //number
        right: //number
        bottom: //number
      }
      xAxisLabelText: //string
      xAxisLabelOffset: //number
      yAxisLabelText: //string
      yAxisLabelOffset: //number
      windowSize: //number of days

    }

    series: [{
      data: []
      color: //string
    }]
  ******************************************/

  /*default values*/
  var OUTER_WIDTH = 500, OUTER_HEIGHT = 320, MARGIN_LEFT = 70, MARGIN_TOP = 10, MARGIN_RIGHT = 15, MARGIN_BOTTOM = 100,
  XAXIS_LABEL_OFFSET = 48, YAXIS_LABEL_OFFSET = 40, WINDOW_SIZE = 5;
  var X_COLUMN = "x", Y_COLUMN = "y";


  function chart(svgSelector, options, series) {

      /* Reading values from options */
      var outerWidth = options.width || OUTER_WIDTH;
      var outerHeight = options.height || OUTER_HEIGHT;
      var margin = options.margin || { left: MARGIN_LEFT, top: MARGIN_TOP, right: MARGIN_RIGHT, bottom: MARGIN_BOTTOM };
      var xAxisLabelText = options.xAxisLabelText;
      var xAxisLabelOffset = options.xAxisLabelOffset || XAXIS_LABEL_OFFSET;
      var yAxisLabelText = options.yAxisLabelText;
      var yAxisLabelOffset = options.yAxisLabelOffset || YAXIS_LABEL_OFFSET;
      var windowSize = options.windowSize || WINDOW_SIZE;

      var xColumn = options.xColumn || X_COLUMN;
      var yColumn = options.yColumn || Y_COLUMN;

      var innerWidth  = outerWidth  - margin.left - margin.right;
      var innerHeight = outerHeight - margin.top  - margin.bottom;

      /* scales */
      var xScale = d3.time.scale().range([0, innerWidth]);
      var yScale = d3.scale.linear().range([innerHeight, 0]);
      var playerScale = d3.time.scale().range([0, innerWidth]);

      /* chart container */
      var chartContainer = new exp.container(svgSelector, outerWidth, outerHeight, margin);
      var chartArea = chartContainer.getChartArea();
      
      /* x axis */
      var xAxisOptions = {
        type: "x",
        chartContainer: chartContainer,
        scale: xScale,
        labelText: xAxisLabelText,
        labelOffset: xAxisLabelOffset,
        tickFormat: d3.time.format("%d %b")
      };
      var xAxis = new exp.axis(xAxisOptions);

      /* y axis */
      var yAxisOptions = {
        type: 'y',
        chartContainer: chartContainer,
        scale: yScale,
        labelText: yAxisLabelText,
        labelOffset: yAxisLabelOffset,
        tickFormat: d3.format(".3s"),
        gridlines: true
      };
      var yAxis = new exp.axis(yAxisOptions);

      /* line */
      var lineOptions = {
        chartArea: chartArea,
        xCallback: function(d) { return xScale(d[xColumn]);},
        yCallback: function(d) { return yScale(d[yColumn]);},
        xScale: xScale,
        yScale: yScale,
        xGuidelines: true
      };
      var lines = [];
      for (var i = 0; i < series.length; i++) {
        lines.push(new exp.line(lineOptions));
      }

      /* player */
      var playerOptions = {
        chartContainer: chartContainer,
        scale: playerScale,
        labelText: "Date",
        tickFormat: d3.time.format("%d %b"),
        windowSize: windowSize,
        xAxisScale: xScale,
        xAxis: xAxis,
        lines: lines
      };
      var player = new exp.controls.player(playerOptions);

      function render(series){
        var xCallback = function(d) { return d[xColumn]; };
        var yCallback = function(d) { return d[yColumn]; };

        var minX, maxX, minY, maxY, localXExtent, localYExtent, s, data;
        for (s in series) {
          data = series[s].data;
          localXExtent = d3.extent(data, xCallback);
          if (!minX || localXExtent[0].getTime() < minX.getTime())
            minX = localXExtent[0];
          if (!maxX || localXExtent[1].getTime() > maxX.getTime())
            maxX = localXExtent[1];
          localYExtent = d3.extent(data, yCallback);
          if (!minY || localYExtent[0] < minY)
            minY = localYExtent[0];
          if (!maxY || localYExtent[1] > maxY)
            maxY = localYExtent[1];
        }

        var xExtent = [minX, maxX];
        var yExtent = [minY, maxY];
        
        var minDate = new Date(xExtent[0]);
        var maxDate = new Date(xExtent[0]);
        maxDate.setDate(maxDate.getDate() + windowSize);
        xScale.domain([minDate, maxDate]);
        
        var maxPlayerDate = new Date(xExtent[1]);
        maxPlayerDate.setDate(maxPlayerDate.getDate() - windowSize);
        var playerExtent = [minDate, maxPlayerDate];
        playerScale.domain(playerExtent);
        
        yScale.domain(yExtent);

        xAxis.load();
        yAxis.load();
        player.load(playerExtent, xExtent, yExtent);

        //load lines
        for (s in series) {
          series[s].id = s;
          lines[s].load(xExtent, yExtent, series[s]);
        }

      }

      render(series);
  }

})();
;(function() {
	
	exp.controls.player = player;

	/****************************
		options = {
			chartContainer: //container object
			scale: //d3 scale
			labelText: //string
			ticks: //number
			tickFormat: // d3 format
			windowSize: //number of days
			xAxisScale: //d3 scale
			xAxis: //axis object
			lines: // Array of line object
			speed: // duration of whole animation

		}
	*****************************/
	var AXIS_MARGIN_TOP = 70, LABEL_OFFSET = 48;

	function player(options) {
	  var self = this;
	  self.chartContainer = options.chartContainer;
	  self.scale = options.scale;
	  self.labelText = options.labelText || "";
	  self.ticks = options.ticks || 9;
	  self.tickFormat = options.tickFormat;
	  self.windowSize = options.windowSize;
	  self.xAxisScale = options.xAxisScale;
	  self.xAxis = options.xAxis;
	  self.lines = options.lines;
	  self.speed = options.speed || 20000;
	  self.axisExtent = null;
	  self.xExtent = null;
	  self.yExtent = null;

	  var chartArea = self.chartContainer.getChartArea();
	  var paused = true;
      var ended = false;

      //prevent slider from going beyond its extremes
      self.scale.clamp(true);

	  /* axis */
      self.axisG = chartArea.append("g")
        .attr("class", "player axis")
        .attr("transform", "translate(0," + (self.chartContainer.getHeight() + AXIS_MARGIN_TOP) + ")");
      var axisLabel = self.axisG.append("text")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + (self.chartContainer.getWidth() / 2) + "," + LABEL_OFFSET + ")")
        .attr("class", "label")
        .text(self.labelText);
      self.axis = d3.svg.axis().scale(self.scale).orient("bottom")
        .ticks(self.ticks)
        .outerTickSize(0)
        .tickFormat(self.tickFormat);

      /* play/pause button */
      var playPauseG = chartArea.append("g")
        .attr("class", "play-pause")
        .attr("transform", "translate("+ -50 + "," + (self.chartContainer.getHeight() + 55) + ")");
      playPauseG.append("rect")
        .attr("width", 30)
        .attr("height", 30);
      var playPauseText = playPauseG.append('text')
        .attr('font-family', 'FontAwesome')
        .attr('font-size', 15 )
        .attr('x', 8)
        .attr('y', 20);
      playPauseG.on("click", togglePlayPause);
      setPlayButtonText();

      /* slider */
      self.brush = d3.svg.brush()
      	  .extent([self.scale.invert(0), self.scale.invert(0)])
          .x(self.scale)
          .on("brush", brushed);

      var slider = chartArea.append("g")
          .attr("class", "slider")
          .call(self.brush);

      slider.selectAll(".extent,.resize")
          .remove();

      //brush action should happen only in slider area
      slider.select(".background")
          .attr("height", 30)
          .attr("transform", "translate(0," + (self.chartContainer.getHeight() + 55) + ")");

      var handle = slider.append("circle")
          .attr("class", "handle")
          .attr("transform", "translate(0," + (self.chartContainer.getHeight() + 70) + ")")
          .attr("r", 9);

      function brushed() {
            var value = self.brush.extent()[0];
            //console.log(new Date(value));

            //end the transition on we reach the end of the slider
            if(value == self.axisExtent[1].getTime())
                ended = true;
            setPlayButtonText();
            var isManuallyMoved = d3.event.sourceEvent && d3.event.sourceEvent.constructor == MouseEvent && d3.event.sourceEvent.type != "click";
            if (isManuallyMoved) {
              value = self.scale.invert(d3.mouse(this)[0]);
              self.brush.extent([value, value]);
            }
            handle
               .attr("cx", self.scale(value));
            var minDate = value;
            var maxDate = new Date(minDate);
            maxDate.setDate(maxDate.getDate() + self.windowSize);
            self.xAxisScale.domain([minDate, maxDate]);
            self.xAxis.load();
            for (var i in self.lines) {
            	self.lines[i].load(self.xExtent, self.yExtent);
            }
      }

      function togglePlayPause() {
            paused = !paused;
            if (ended) {
              ended = !ended;
              reset();
              return;
            }
            var newExtent = [self.axisExtent[1], self.axisExtent[1]];
            var extent = self.brush.extent();
            if (!paused) {
                slider.transition()
                   .ease("linear")
                   .duration(function() {
                        //time of transition is linearly proportional to x-axis distance remaining
                        return self.speed*((self.axisExtent[1] - self.brush.extent()[0])/(self.axisExtent[1] - self.axisExtent[0]));
                   })
                   .each("interrupt", function() {
                        paused = true;
                        setPlayButtonText();
                   })
                   .call(self.brush.extent(newExtent))
                   .tween("brush", function() {
                     var i = d3.interpolate(extent, newExtent);
                     return function(t) {
                        slider.call(self.brush.extent(i(t)));
                        slider.call(self.brush.event);
                      };
                   });
            } else {
                slider.transition().duration(0)
                	.call(self.brush.extent(self.brush.extent()));
            }
      }

      function reset() {
        slider.call(self.brush.extent([self.axisExtent[0], self.axisExtent[0]]))
              .call(self.brush.event);
      }

      function setPlayButtonText() {
            if (ended)
                playPauseText.text('\uf01e');
            else
                playPauseText.text(function(d) { return paused ? '\uf04b' : '\uf04c'; });
      }


	}

	player.prototype.load = function(axisExtent, xExtent, yExtent) {

		this.axisG.call(this.axis);
		this.axisG
            .select(".domain")
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "bar");
        this.axisExtent = axisExtent;
        this.xExtent = xExtent;
        this.yExtent = yExtent;

        var initBrushExtent = [this.axisExtent[0], this.axisExtent[0]];
        this.brush.extent(initBrushExtent);
	};

	player.prototype.getScale = function() {
		return this.scale;
	};

})();;(function() {
	
	exp.tooltip = tooltip;

	/**********************
		options = {
			chartArea:
			xFormat: //d3 format
			yFormat: //d3 format
			color: //string
		}
	***********************/

	function tooltip(options) {
		var self = this;
		self.chartArea = options.chartArea;
		self.xFormat = options.xFormat;
		self.yFormat = options.yFormat;
		self.color = options.color;

		self.container = self.chartArea.append("g")
			.style("opacity", 0)
			.attr("class", "tooltip");
		self.container.append("rect")
			.attr("height", 50)
			.attr("width", 150)
			.style("stroke", self.color);
		self.xNode = self.container.append("text")
						 .attr("x", 10)
						 .attr("y", 15)
						 .attr("class", "x-node")
						 .style("fill", self.color);
		self.yNode = self.container.append("text")
						 .attr("x", 10)
						 .attr("y", 40)
						 .attr("class", "y-node");

		self.container.on("mouseout", function() {
			self.hide();
		});

	}

	tooltip.prototype.render = function(x, y, xNodeText, yNodeText, transitionTime) {
		xNodeText = this.xFormat(xNodeText);
		yNodeText = this.yFormat(yNodeText);
		this.xNode.text(xNodeText);
		this.yNode.text(yNodeText);
		this.container
			.attr("transform", "translate(" + x +"," + y + ")")
			.transition()
			.duration(transitionTime || 200)
			.style("opacity", 1);
	};

	tooltip.prototype.hide = function() {
		this.container
			.style("opacity", 0);
	};

	tooltip.prototype.setColor = function(color) {
		this.color = color;
		this.container.select("rect")
			.style("stroke", this.color);
		this.xNode
			.style("fill", this.color);

	};

})();