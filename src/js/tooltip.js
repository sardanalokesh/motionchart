(function() {
	
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