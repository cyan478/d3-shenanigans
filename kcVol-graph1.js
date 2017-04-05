d3.select("input[value=\"2017\"]").property("checked", true);

var svg1 = d3.select("body")
  .append("svg")
  .append("g")

svg1.append("g")
  .attr("class", "slices");
svg1.append("g")
  .attr("class", "labelName");
svg1.append("g")
  .attr("class", "labelValue");
svg1.append("g")
  .attr("class", "lines");


var width = 960,
    height = 450,
  radius = Math.min(width, height) / 2;

var pie = d3.layout.pie()
  .sort(null)
  .value(function(d) {
    return d.value;
  });

var arc = d3.svg.arc()
  .outerRadius(radius * 0.8)
  .innerRadius(radius * 0.4);

var outerArc = d3.svg.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9);

var legendRectSize = (radius * 0.05);
var legendSpacing = radius * 0.02;


var div = d3.select("body").append("div").attr("class", "toolTip");

svg1.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var colorRange = d3.scale.ordinal()
  .domain(["Freshmen", "Sophomores", "Juniors","Seniors"])
  .range(["#77c1dd", "#2e70c9", "#289ab8", "#004b7c"]);

ds2014 = [
    {label:"Freshmen", value:84}, 
        {label:"Sophomores", value:92}, 
        {label:"Juniors", value:145},
        {label:"Seniors", value:40},
        ];

ds2015 = [
    {label:"Freshmen", value:86}, 
        {label:"Sophomores", value:79}, 
        {label:"Juniors", value:83},
        {label:"Seniors", value:71},
        ];

ds2016 = [
    {label:"Freshmen", value:59}, 
        {label:"Sophomores", value:76}, 
        {label:"Juniors", value:63},
        {label:"Seniors", value:46},
        ];

ds2017 = [
    {label:"Freshmen", value:85}, 
        {label:"Sophomores", value:106}, 
        {label:"Juniors", value:86},
        {label:"Seniors", value:39},
        ];

change(ds2017);

d3.selectAll(".kc")
  .on("change", selectDataset);
  
function selectDataset()
{
  var value = this.value;
  if (value == "2014")
  {
    change(ds2014);
  }
  else if (value == "2015")
  {
    change(ds2015);
  }
  else if (value == "2016")
  {
    change(ds2016);
  }
    else if (value == "2017")
  {
    change(ds2017);
  }
}
function change(data) {

  /* ------- PIE SLICES -------*/
  var slice = svg1.select(".slices").selectAll("path.slice")
        .data(pie(data), function(d){ return d.data.label });

    slice.enter()
        .insert("path")
        .style("fill", function(d) { return colorRange(d.data.label); })
        .attr("class", "slice");

    slice
        .transition().duration(1000)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
        })
    slice
        .on("mousemove", function(d){
            div.style("left", d3.event.pageX+10+"px");
            div.style("top", d3.event.pageY-25+"px");
            div.style("display", "inline-block");
            div.html((d.data.label)+"<br>"+(d.data.value));
        });
    slice
        .on("mouseout", function(d){
            div.style("display", "none");
        });

    slice.exit()
        .remove();

    var legend = svg1.selectAll('.legend')
        .data(colorRange.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset =  height * colorRange.domain().length / 2;
            var horz = -3 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', colorRange)
        .style('stroke', colorRange);

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return d; });

    /* ------- TEXT LABELS -------*/

    var text = svg1.select(".labelName").selectAll("text")
        .data(pie(data), function(d){ return d.data.label });

    text.enter()
        .append("text")
        .attr("dy", ".35em")
        .text(function(d) {
            return (d.data.label+": "+d.value);
        });

    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text
        .transition().duration(1000)
        .attrTween("transform", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return "translate("+ pos +")";
            };
        })
        .styleTween("text-anchor", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start":"end";
            };
        })
        .text(function(d) {
            return (d.data.label+": "+d.value);
        });


    text.exit()
        .remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = svg1.select(".lines").selectAll("polyline")
        .data(pie(data), function(d){ return d.data.label });

    polyline.enter()
        .append("polyline");

    polyline.transition().duration(1000)
        .attrTween("points", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };
        });

    polyline.exit()
        .remove();
};
