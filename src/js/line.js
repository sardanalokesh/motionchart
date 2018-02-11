(function() {
	
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

})();