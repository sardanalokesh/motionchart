(function() {
	
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
})();