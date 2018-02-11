(function() {
	
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

})();