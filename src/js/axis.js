(function() {

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

})();