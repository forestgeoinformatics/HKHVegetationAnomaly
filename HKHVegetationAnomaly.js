/**
 * UI Pattern Template
 *
 * This script is a template for organizing code into distinct sections
 * to improve readability/maintainability:
 *   Model, Components, Composition, Styling, Behaviors, Initialization
 *
 * @author Tyler Erickson (tylere@google.com)
 * @author Justin Braaten (braaten@google.com)
 */



/*******************************************************************************
 * Model *
 *
 * A section to define information about the data being presented in your
 * app.
 *
 * Guidelines: Use this section to import assets and define information that
 * are used to parameterize data-dependant widgets and control style and
 * behavior on UI interactions.
 ******************************************************************************/
// Model
var m = {};

m.boundary = ee.FeatureCollection("users/akshaypaygude/HKH");
m.collection = ee.ImageCollection("MODIS/061/MYD13A1");
m.centroidPoint = ee.Geometry.Point(87.094, 31.397);





/*******************************************************************************
 * Components *
 *
 * A section to define the widgets that will compose your app.
 *
 * Guidelines:
 * 1. Except for static text and constraints, accept default values;
 *    initialize others in the initialization section.
 * 2. Limit composition of widgets to those belonging to an inseparable unit
 *    (i.e. a group of widgets that would make no sense out of order).
 ******************************************************************************/
// Composition
var c={};


c.info = {};
c.info.titleLabel = ui.Label("Hindu-Kush Himalayas Vegetation Anomaly");
c.info.aboutLabel = ui.Label("This application retrieves vegetation anomaly for Hindu-Kush Himalayas using five year reference from 2001 to 2005." +
" This application code is for demonstration purpose only.");
c.info.panel = ui.Panel([c.info.titleLabel, c.info.aboutLabel]);


// Define chart panel
c.chart = {};
c.chart.shownButton = ui.Button('Hide chart');
c.chart.container = ui.Panel();  // will hold the dynamically generated chart. 
c.chart.chartPanel = ui.Panel([c.chart.shownButton, c.chart.container]);


c.mainPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {width: '500px'}
});
c.map = ui.Map();




/*******************************************************************************
 * Composition *
 * 
 * A section to compose the app i.e. add child widgets and widget groups to
 * first-level parent components like control panels and maps.
 * 
 * Guidelines: There is a gradient between components and composition. There
 * are no hard guidelines here; use this section to help conceptually break up
 * the composition of complicated apps with many widgets and widget groups.
 ******************************************************************************/



c.mainPanel.add(c.info.panel);
c.map.add(c.chart.chartPanel);

ui.root.clear();
ui.root.add(c.mainPanel);
ui.root.add(c.map);




/*******************************************************************************
 * Styling *
 * 
 * A section to define and set widget style properties.
 * 
 * Guidelines:
 * 1. At the top, define styles for widget "classes" i.e. styles that might be
 *    applied to several widgets, like text styles or margin styles.
 * 2. Set "inline" style properties for single-use styles.
 * 3. You can add multiple styles to widgets, add "inline" style followed by
 *    "class" styles. If multiple styles need to be set on the same widget, do
 *    it consecutively to maintain order.
 ******************************************************************************/
//Style
// Define CSS-like class style properties for widgets; reusable styles.
var s = {};

s.opacityWhiteMed = {
  backgroundColor: 'rgba(255, 255, 255, 0.5)'
};
s.titleText = {
  fontSize: '20px',
  fontWeight: 'bold'
};
s.aboutText = {
  fontSize: '13px',
  color: '505050'
};
s.widgetTitle = {
  fontSize: '15px',
  fontWeight: 'bold',
  margin: '8px 8px 0px 8px',
  color: '383838'
};
s.bigTopMargin = {
  margin: '24px 8px 8px 8px'
};
s.mainPanel = {
  width: '275px',
  padding: '0px'
};
s.crosshair = {
  cursor: 'crosshair'
};
s.chartPanel = {
  position: 'bottom-right',
  shown: false
};


c.info.titleLabel.style().set(s.titleText);
c.info.titleLabel.style().set(s.bigTopMargin);
c.info.aboutLabel.style().set(s.aboutText);
c.mainPanel.style().set(s.mainPanel);
c.chart.chartPanel.style().set(s.chartPanel);
c.chart.chartPanel.style().set(s.opacityWhiteMed);
c.chart.shownButton.style().set({margin: '0px 0px',});
c.map.style().set(s.crosshair);
c.map.setOptions('HYBRID');



/*******************************************************************************
 * Behaviors *
 * 
 * A section to define app behavior on UI activity.
 * 
 * Guidelines:
 * 1. At the top, define helper functions and functions that will be used as
 *    callbacks for multiple events.
 * 2. For single-use callbacks, define them just prior to assignment. If multiple
 *    callbacks are required for a widget, add them consecutively to maintain
 *    order; single-use followed by multi-use.
 * 3. As much as possible, include callbacks that update URL parameters.
 ******************************************************************************/
//Behavior
// Handles map clicks for charting.
function drawChart(coords){
  // Get out if call to drawChart did not come from map click and the chart
  // has not been drawn previously.
  if (!coords.lon) {
    return null;
  }
  
  // Get out if the clicked point intersects invalid data.
  var point = ee.Geometry.Point([coords.lon, coords.lat]);
  var validDataTest = m.HKH_EVI.first().select('EVI').reduceRegion({
    reducer: ee.Reducer.first(),
    geometry: point,
    scale: m.HKH_EVI.first().projection().nominalScale()
  });
  if (!validDataTest.get(validDataTest.keys().get(0)).getInfo()) {
    return null;
  }
  
  // Show the chart panel if this is the first time a point is clicked.
  if (!c.chart.chartPanel.style().get('shown')) {
    c.chart.chartPanel.style().set('shown', true);
  }
  
  // Show chart if hidden; assuming user wants to see updates to chart.
  if (c.chart.shownButton.getLabel() == 'Show chart') {
    c.chart.container.style().set({shown: true});
    c.chart.shownButton.setLabel('Hide chart');
  }

  var layer = ui.Map.Layer(
    point.buffer(500), null, 'Chart region');
  c.map.layers().set(1, layer);

  // Define chart titles.
  var title = {
    title: 'Cumulative EVI anomaly over time',
    hAxis: {title: 'Time'},
    vAxis: {title: 'Cumulative EVI anomaly'},
  };

  var styleChartArea = {
    width: '600px',
    height: '255px',
    margin: '0px',
    padding: '0px'
  }; 
  
  var chart = ui.Chart.image.series(m.cumulative, point, ee.Reducer.first(), 500)
  .setOptions(title);
  
  chart.style().set(styleChartArea);

  c.chart.container.widgets().reset([chart]);
}

function showHideChart() {
  var shown = true;
  var label = 'Hide chart';
  if (c.chart.shownButton.getLabel() == 'Hide chart') {
    shown = false;
    label = 'Show chart';
  }
  c.chart.container.style().set({shown: shown});
  c.chart.shownButton.setLabel(label);
}


function createMap(){
  // Get EVI collection of Hindu-Kush Himalayas
  m.HKH_EVI = m.collection.select('EVI').map(function(image){
    return image.clip(m.boundary);
  });

  // Five years reference data for calculating anomaly
  m.reference = m.HKH_EVI.filterDate('2001-01-01', '2005-12-31')
  .sort('system:time_start', false);

  // Compute the mean of the first 10 years.
  m.meanEVI = m.reference.mean();

  // Subtract five years mean reference image from
  // 2006 - 2020 image collection for anomaly retrieval
  m.series = m.HKH_EVI.filterDate('2006-01-01', '2020-12-31').map(function(image) {
    return image.subtract(m.meanEVI).set('system:time_start', image.get('system:time_start'));
  });

  // Calculate cumulative anomalies

  // EVI anomaly timeseries calculation
  // Get the timestamp of the most first image in the collection
  m.time0 = m.HKH_EVI.first().get('system:time_start');

  // The initial value for iterate() is a list of anomaly images already processed.
  // Create zero value image for initial value of anomaly with timestamp time0
  m.first = ee.List([ee.Image(0).set('system:time_start', m.time0).select([0], ['EVI'])]);

  // Add anomly images in series starting from 'first' image
  var accumulate = function(image, list) {
    // Use get(-1) for the latest cumulative anomaly image
    var previous = ee.Image(ee.List(list).get(-1));
    // Add the current anomaly to previous one for a new cumulative anomaly image.
    var added = image.add(previous).set('system:time_start', image.get('system:time_start'));
    // Return the list
    return ee.List(list).add(added);
  };

  // Typecast iterature function return data to List
  // Create an ImageCollection of cumulative anomaly images by iterating.
  m.cumulative = ee.ImageCollection(ee.List(m.series.iterate(accumulate, m.first)));

  // Red = Net Vegetation decrease
  // Green = Net Vegetation increase
  // Black = No change
  var layer = ui.Map.Layer(m.series.sum(),
  {min:-90000, max:90000, palette: ['red', 'black', 'green']},
  'EVI anomaly');

  c.map.layers().set(0, layer);
}

c.map.onClick(drawChart);
c.chart.shownButton.onClick(showHideChart);



/*******************************************************************************
 * Initialize *
 * 
 * A section to initialize the app state on load.
 * 
 * Guidelines:
 * 1. At the top, define any helper functions.
 * 2. As much as possible, use URL params to initialize the state of the app.
 ******************************************************************************/


c.map.setCenter( 87.094, 31.397, 4);
createMap();