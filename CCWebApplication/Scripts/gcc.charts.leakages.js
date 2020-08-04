$.getJSON(leakageResult, function (data) {
    var chartData = data;
    var height = 300;
    var width = 300;

    var arcRadius1 = [
        { inner: 0.6, outer: 1 },
        { inner: 0.65, outer: 0.95 },
        { inner: 0.70, outer: 0.90},
        { inner: 0.75, outer: 0.85 },
        { inner: 0.80, outer: 0.80 }
    ];

    nv.addGraph(function () {
        var chart = nv.models.pieChart()
            .x(function (d) { return d.key })
            .y(function (d) { return d.y })
            .width(width)
            .height(height)
            .arcsRadius(arcRadius1)
            .showTooltipPercent(true);

        //make it a half circle
        //chart.pie
        //    .startAngle(function (d) { return d.startAngle / 2 - Math.PI / 2 })
        //    .endAngle(function (d) { return d.endAngle / 2 - Math.PI / 2 });

        d3.select("#leakageArea")
            .datum(chartData)
            .transition().duration(1200)
            .attr('width', width)
            .attr('height', height)
            .call(chart);

        // update chart data values randomly
        setInterval(function () {
            chartData[0].y = Math.floor(Math.random() * 10);
            chartData[1].y = Math.floor(Math.random() * 10);
            chart.update();
        }, 4000);

        return chart;
    });

    nv.addGraph(function () {
        var chart = nv.models.pieChart()
            .x(function (d) { return d.key })
            .y(function (d) { return d.y })
            //.labelThreshold(.08)
            //.showLabels(false)
            .color(d3.scale.category20().range().slice(8))
            .growOnHover(true)
            .arcsRadius(arcRadius1)
            .labelType('value')
            .width(width)
            .donut(true)
            .height(height);

        // make it a half circle
        //chart.pie
        //    .startAngle(function (d) { return d.startAngle / 2 - Math.PI / 2 })
        //    .endAngle(function (d) { return d.endAngle / 2 - Math.PI / 2 });

        // MAKES LABELS OUTSIDE OF PIE/DONUT
        //chart.pie.donutLabelsOutside(true).donut(true);

        // LISTEN TO CLICK EVENTS ON SLICES OF THE PIE/DONUT
        // chart.pie.dispatch.on('elementClick', function() {
        //     code...
        // });

        // chart.pie.dispatch.on('chartClick', function() {
        //     code...
        // });

        // LISTEN TO DOUBLECLICK EVENTS ON SLICES OF THE PIE/DONUT
        // chart.pie.dispatch.on('elementDblClick', function() {
        //     code...
        // });

        // LISTEN TO THE renderEnd EVENT OF THE PIE/DONUT
        // chart.pie.dispatch.on('renderEnd', function() {
        //     code...
        // });

        // OTHER EVENTS DISPATCHED BY THE PIE INCLUDE: elementMouseover, elementMouseout, elementMousemove

        d3.select("#leakageType")
            .datum(chartData)
            .transition().duration(1200)
            .attr('width', width)
            .attr('height', height)
            .call(chart);

        // disable and enable some of the sections
        var is_disabled = false;
        setInterval(function () {
            chart.dispatch.changeState({ disabled: { 2: !is_disabled, 4: !is_disabled } });
            is_disabled = !is_disabled;
        }, 3000);

        return chart;
    });
});
$.getJSON(leakageHistogram, function (data) {
    var historicalBarChart = [
        {
            key: "Cumulative Return",
            values: data
        }
    ];
    nv.addGraph(function () {
        var chart = nv.models.discreteBarChart()
                .x(function (d) { return d.label })
                .y(function (d) { return d.value })
                .staggerLabels(true)
                //.staggerLabels(historicalBarChart[0].values.length > 8)
                .showValues(true)
                .duration(250)
        ;

        d3.select('#histogramChart svg')
            .datum(historicalBarChart)
            .call(chart);

        nv.utils.windowResize(chart.update);
        return chart;
    });
});
$.getJSON(leakageAreaHistogram, function (data) {
    var historicalBarChart = [
        {
            key: "Cumulative Return",
            values: data
        }
    ];
    nv.addGraph(function () {
        var chart = nv.models.discreteBarChart()
                .x(function (d) { return d.label })
                .y(function (d) { return d.value })
                .staggerLabels(true)
                //.staggerLabels(historicalBarChart[0].values.length > 8)
                .showValues(true)
                .duration(250)
        ;

        d3.select('#townshipsChart svg')
            .datum(historicalBarChart)
            .call(chart);

        nv.utils.windowResize(chart.update);
        return chart;
    });
});
$.getJSON(leakageResult, function (data) {
    var arcRadius2 = [
        { inner: 0.9, outer: 1 },
        { inner: 0.5, outer: 1 },
        { inner: 0.3, outer: 1 },
        { inner: 0.6, outer: 1 },
        { inner: 0.2, outer: 1 }
    ];

    var height = 300;
    var width = 300;

    nv.addGraph(function () {
        var chart = nv.models.pieChart()
            .x(function (d) { return d.key })
            .y(function (d) { return d.y })
            .donut(true)
            .width(width)
            .height(height)
            .arcsRadius(arcRadius2)
            .donutLabelsOutside(true)
            .labelSunbeamLayout(true)
            .id('donut2'); // allow custom CSS for this one svg

        d3.select("#leakageGraph")
            .datum(data)
            .transition().duration(1200)
            .attr('width', width)
            .attr('height', height)
            .call(chart);

        return chart;

    });
});
$.getJSON(leakageResult, function (data) {
    var arcRadius3 = [
        { inner: 0, outer: 1 },
        { inner: 0, outer: 0.8 },
        { inner: 0, outer: 0.7 },
        { inner: 0, outer: 0.6 },
        { inner: 0, outer: 0.5 }
    ];

    var height = 300;
    var width = 300;


    nv.addGraph(function () {
        var chart = nv.models.pieChart()
            .x(function (d) { return d.key })
            .y(function (d) { return d.y })
            .donut(true)
            .showLabels(true)
            .width(width)
            .height(height)
            .arcsRadius(arcRadius3)
            .donutLabelsOutside(true)
            .id('donut3'); // allow custom CSS for this one svg

        d3.select("#teama")
            .datum(data)
            .transition().duration(1200)
            .attr('width', width)
            .attr('height', height)
            .call(chart);

        return chart;

    });
});