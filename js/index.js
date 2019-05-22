
const dataEdu = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';

const dataCounty = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';


colors =['#7fc97f','#beaed4','#fdc086','#ffff99','#386cb0','#f0027f','#bf5b17','#666666'];

promise = []; promise.push(dataCounty,dataEdu);
const width = 1200,height= 600;

const margin = [60,40,60,120];

const svg = d3.select('#root').append('svg')
              .attr('width',width)
              .attr('height',height);
const map = d3.select('svg')
              .append('g')
              .attr('width',width)
              .attr('height',height)
              .attr('transform',`translate(${margin[0] + 40},120)`);
let tooltip = d3.select('body')
              .append('div')
              .attr('id','tooltip')
              .classed('chart-tooltip',true)
              .classed('hidden',true);

 console.clear();


Promise.all(promise.map(v=>fetch(v).then(res=>res.json()))).then(data=>{
   
  let county =  topojson.feature(data[0],data[0].objects.counties).features;
  
  let edu = data[1]
  

  const title = svg.append('text')
                   .text('United States Educational Attainment')
                   .attr('id','title')
                   .attr('x',width / 2)
                   .attr('y',margin[0])
                   .attr('text-anchor','middle')
                   .style('font-size','2rem')
                   .style('font-weight',700);
  const subtitle = svg.append('text')
                      .text('Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)')
                      .attr('id','description')
                      .attr('x',width / 2)
                      .attr('y',margin[0]+margin[1])
                      .attr('text-anchor','middle')
                      .style('font-size','1rem');
  
  const legend = svg.append('g')
                .attr('id','legend')
                .attr('transform',`translate(${width / 2 + 100},130)`);
  legend.selectAll('rect')
        .data(colors).enter()
        .append('rect')
        .attr('width',36)
        .attr('height',11)
        .attr('x',(d,i)=>(36 * i) + i)
        .attr('fill',(d,i)=>colors[i]);
  legend.selectAll('g')
        .data(colors).enter()
        .append('g')
        .attr('transform',(d,i)=>`translate(${36 * i+ i-.5})`)
        .append('line')
        .attr('stroke','#000')
        .attr('y1',17);
  legend.selectAll('g')
        .append('text')
        .attr('x',-10)
        .attr('y',25)
        .text((d,i)=>{
        let v = [3,12,21,30,39,48,57,66];
        return `${v[i]}%`;
  })
        .style('font-size',12);
  
  let colorScale = d3.scaleQuantile()
  .domain(d3.extent(edu,(d)=> d.bachelorsOrHigher)) 
  .range(colors);
  
   map.selectAll('path')
    .data(county)
    .enter()
    .append('path')
    .attr('fill', (d)=>{
     let result = edu.find(obj =>obj.fips === d.id);
     return colorScale(result.bachelorsOrHigher);
   })
    .attr('d', d3.geoPath())
    .on('mouseover',(d)=>{
     let result = edu.find(obj =>obj.fips === d.id);
     tooltip.html(`
         <div>${result['area_name']}, ${result['state']}, ${result['bachelorsOrHigher']}%</div>

     `);
     tooltip.classed('hidden',false)
           .style('left',d3.event.pageX + 'px')
           .style('top',d3.event.pageY + 'px');
   })
   .on('mouseout',d=>tooltip.classed('hidden',true));
    
  
  
  
  map.append('path')
     .datum(topojson.mesh(data[0],data[0].objects.states,(a,b)=> a!==b))
     .attr('class','states')
     .attr('d',d3.geoPath());
  
});