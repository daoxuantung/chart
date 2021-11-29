import { useRef, useLayoutEffect } from "react";
import "./App.css";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { XYChart } from "@amcharts/amcharts4/charts";

am4core.useTheme(am4themes_animated);
am4core.addLicense("ch-custom-attribution");

function App() {
  const chartRef = useRef<XYChart>();

  useLayoutEffect(() => {
    (async () => {
      let chart = am4core.create("chart", am4charts.XYChart);
      chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

      chart.paddingRight = 30;
      chart.dateFormatter.dateFormat = "yyyy-MM-dd";
      chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";

      let colorSet = new am4core.ColorSet();
      colorSet.saturation = 0.4;

      const res = await fetch("https://my-db-chart.herokuapp.com/charts");

      const data = await res.json();

      chart.data = data;

      let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "category";
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.inversed = true;

      let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.minGridDistance = 70;
      dateAxis.baseInterval = { count: 1, timeUnit: "day" };
      // dateAxis.max = new Date(2018, 0, 1, 24, 0, 0, 0).getTime();
      dateAxis.strictMinMax = true;
      dateAxis.renderer.tooltipLocation = 0;

      let series1 = chart.series.push(new am4charts.ColumnSeries());
      series1.columns.template.height = am4core.percent(70);
      series1.columns.template.tooltipText =
        "{task}: [bold]{openDateX}[/] - [bold]{dateX}[/]";

      series1.dataFields.openDateX = "start";
      series1.dataFields.dateX = "end";
      series1.dataFields.categoryY = "category";
      series1.columns.template.propertyFields.fill = "color"; // get color from data
      series1.columns.template.propertyFields.stroke = "color";
      series1.columns.template.strokeOpacity = 1;

      let scrollbarX = new am4core.Scrollbar();
      scrollbarX.orientation = "horizontal";
      chart.scrollbarX = scrollbarX;
      chartRef.current = chart;

      return () => {
        chart.dispose();
      };
    })();
  }, []);

  return <div id="chart" style={{ width: "100%", height: "500px" }}></div>;
}
export default App;
