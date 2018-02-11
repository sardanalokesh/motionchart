(function() {

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
