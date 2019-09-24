 /*global d3 */

 d3.csv(
  "data/MetSculpturesMenWom.csv"
 ).then(data => {
  //  console.log(data)
  //  data[0].Dimensions

  // *** create variable to store column header names for reference
  var headerNames = d3.keys(data[0]);
  //  console.log(headerNames);


  // *** create variable to hold original dimensions data
  for (var i = 0; i < data.length; i++) {
   var sculptureDimension = data[i].Dimensions
   //  console.log(sculptureDimension);

   // *** regular expression to match the height in cm (pattern for most of the dimension entries)
   var regexCm = /(?<=\(\s?)(\d*\.?\d*)([^\s?cm])/g;
   var foundCm = sculptureDimension.match(regexCm);

   if (foundCm) {
    foundCm = foundCm[0];
    if (foundCm[0].match(/[a-zA-Z]+/)) {
     foundCm = foundCm[1];
    }
    foundCm = parseInt(foundCm);
    //  console.log(foundCm)
   }
   foundCm = parseInt(foundCm)


   data[i].height = foundCm;
   //  console.log(data[i].height);


   //  console.log(found);

   // *** not all entries match the same pattern above, log all those that don't match
   if (foundCm === null) {
    //  console.log(data[i].Dimensions);

    // *** for those that match the '33-1/2' pattern - split on the first whitespace to return this string (still need to address additional inch patterns)
    var foundIn = sculptureDimension.split(' ')[1];
    //  console.log(foundIn);

    // *** if follows '33-1/2' pattern (does not return undefined), then split again on '-'
    if (foundIn != undefined) {

     var foundInSplit = foundIn.split('-');

     // *** create another regex to recognize if array element in position 1 (where fraction is stored) contains a digit, if this is true and is also not undefined then replace fraction with an array split on '/'
     var digit = /\d+/;
     if (digit.test(foundInSplit[1]) && foundInSplit != undefined) {
      foundInSplit.splice(1, 1, foundInSplit[1].split('/'));
      //  console.log(foundInSplit);

      // *** replace sub array in position 1 of foundInSplit array with a decimal (numerator in pos 0 of sub array / denominator in pos 1 of sub array)
      foundInSplit.splice(1, 1, foundInSplit[1][0] / foundInSplit[1][1]);
      //  console.log(foundInSplit);

      // convert string of digits in pos 0 of foundInSplit array to integers
      foundInSplit.splice(0, 1, parseInt(foundInSplit[0], 10));
      //  console.log(foundInSplit);

      // add integer and decimal to form one inch value
      foundInSplit.splice(0, 2, foundInSplit[0] + foundInSplit[1]);
      //  console.log(foundInSplit);

      // create var to hold converted height from inches to cm
      var cmConverted = foundInSplit[0] * 2.54;
      //  console.log(cmConverted);

      data[i].height = cmConverted;
      //  console.log(data[i].height);
     }
    }
   }
  }




  //  *** create variable to hold gender tag data
  for (var i = 0; i < data.length; i++) {
   var sculptureGender = data[i].Tags
   //  console.log(sculptureGender);

   // *** create regex for men and women tags
   var regexMen = /Men\s?/g;
   var regexWomen = /Women\s?/g;

   // *** create variable to hold scultpures that have both men and women tags
   if (sculptureGender.match(regexMen) && sculptureGender.match(regexWomen)) {
    //  console.log(sculptureGender);
    var menAndWomen = sculptureGender;
    //  console.log(menAndWomen);
    data[i].gender = 'b'
   }
   else {
    // *** create variable to hold sculptures that have a single gender tag
    var singleGender = sculptureGender
    //  console.log(singleGender);
   }
   // *** create variable for sculptures with men tag only
   if (regexMen.test(singleGender)) {
    //  console.log(singleGender);
    var men = singleGender;
    //  console.log(men);
    data[i].gender = 'm'
   }
   // *** create variable for sculptures with women tag only
   if (regexWomen.test(singleGender)) {
    //  console.log(singleGender);
    var women = singleGender;
    //  console.log(women);
    data[i].gender = 'w'
   }
   //  console.log(data[i].gender);

  }




  //  *** create variable to hold end date
  for (var i = 0; i < data.length; i++) {
   var sculptureEndDate = data[i]["Object End Date"];
   //  console.log(sculptureEndDate);

   sculptureEndDate = parseInt(sculptureEndDate, 10)
   //  console.log(sculptureEndDate);

   data[i].endDate = sculptureEndDate;
  }

  var sculpturesHeightGenderDate = [];

  for (var i = 0; i < data.length; i++) {
   var sculpture = data[i]
   if (!isNaN(sculpture.height) && sculpture.gender && sculpture.endDate) {
    sculpturesHeightGenderDate.push(sculpture)
   }
  }

  console.log(sculpturesHeightGenderDate);

  // *** begin drawing:

  var width = 1200
  var height = 800
  var plotWidth = 950
  var plotHeight = 460
  var padding = 45
  const colorValue = sculpturesHeightGenderDate => sculpturesHeightGenderDate.gender;
  const colorLabel = 'Gender';
  const colorScale = d3.scaleOrdinal()
   .range(d3.schemeCategory10);

  var svg = d3.select('body')
   .append('svg')
   .attr('width', width)
   .attr('height', height)
   .append('g')
   .attr("transform", "translate(100,110)");

  var div = d3.select("body").append("div")
   .attr("class", "tooltip")
   .style("opacity", 0);

  var xScale = d3.scaleLinear()
   .domain([
    d3.min([0, d3.min(sculpturesHeightGenderDate, function(d) { return d.endDate })]),
    d3.max([0, d3.max(sculpturesHeightGenderDate, function(d) { return d.endDate })])
   ])
   .range([0, plotWidth])

  var yScale = d3.scaleLinear()
   .domain([
    d3.min([0, d3.min(sculpturesHeightGenderDate, function(d) { return d.height })]),
    d3.max([0, d3.max(sculpturesHeightGenderDate, function(d) { return d.height })])
   ])
   .range([plotHeight, 0])

  var circles = svg.selectAll('circle')
   .data(sculpturesHeightGenderDate)
   .enter()
   .append('circle')
   .attr('cx', function(d) { return xScale(d.endDate) })
   .attr('cy', function(d) { return yScale(d.height) })
   .attr('gender', function(d) { return d.gender })
   .attr('object-title', function(d) { return d.Title; })
   .attr('fill', function(d) {
    var color = '';
    if (d.gender == 'm') {
     color = 'Tan';
    }
    else if (d.gender == 'b') {
     color = 'Black';
    }
    else {
     color = 'OrangeRed';
    }
    return color;
   })
   .attr('fill-opacity', 0.6)
   .attr('r', '3')
   .on('mouseover', function(d, i) {
    console.log("mouseover on", this);
    d3.select(this)
     .transition()
     .duration(100)
     .attr('r', 10)
     .attr('stroke', 'black');
    div.html(`<b>Title:</b> ${d.Title}<br/><br/><b>Medium:</b> ${d.Medium}<br/><br/><b>Height:</b> ${d.height} cm<br/><br/><b>Date:</b> ${d.endDate}<br/><br/><b>Culture:</b> ${d.Culture}<br/><br/><b>Department:</b> ${d.Department}`)
     .style("opacity", 1)
     .style("left", (d3.event.pageX) + "px")
     .style("top", (d3.event.pageY - 28) + "px");
   })
   .on('mouseout', function(d, i) {
    console.log("mouseout", this);
    d3.select(this)
     .transition()
     .duration(100)
     .attr('r', 2.5)
     .attr('stroke', 'none');
    div.html('')
     .style("opacity", 0)
     .style("left", "0px")
     .style("top", "0px");
   });

  var xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format("0"));

  var yAxis = d3.axisLeft().scale(yScale).tickFormat(d3.format("0"));

  //x axis
  svg.append("g")
   .attr("class", "axis")
   .attr("transform", "translate(0, 465)")
   .call(xAxis);

  //y axis
  svg.append("g")
   .attr("class", "axis")
   // .style("font", "8px times")
   .attr("transform", "translate(-5, 0)")
   .call(yAxis);

  // x axis label
  svg.append("text")
   .attr("transform", "translate(" + plotWidth / 2 + ", 510)")
   .style("text-anchor", "middle")
   .attr("class", "labels")
   .text("Year (BC < 0 < AD)")
   .attr("fill", "DimGray");

  // y axis label
  svg.append("text")
   .style("text-anchor", "middle")
   .attr("class", "labels")
   .text("Height (cm)")
   .attr("transform", "translate(-60, " + plotHeight / 2 + ") rotate(-90)")
   .attr("fill", "DimGray");

  // chart title
  svg.append("text")
   .attr("transform", "translate(" + plotWidth / 2 + ", 0)")
   .style("text-anchor", "middle")
   .attr("class", "charttitle")
   .text("Met Sculptures: Height vs. Year of Completion")
   .attr("fill", "DimGray");

 });






 // *** template for final array
 //  var sculpturesWithHeight = [];

 //  for (var i = 0; i < data.length; i++) {
 //      var sculpture = data[i]
 //      if (!isNaN(sculpture.height)) {
 //          sculpturesWithHeight.push(sculpture)
 //      }
 //  }


 //  sculpturesWithHeight = data.filter(sculpture => !isNaN(sculpture.height))
 //  console.log(sculpturesWithHeight)
 