import {
  useRef,
  useLayoutEffect,
  useState,
  forwardRef,
  LegacyRef,
} from "react";
import DatePicker from "react-datepicker";
import { getYear } from "date-fns";
import range from "lodash/range";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { XYChart } from "@amcharts/amcharts4/charts";

import "react-datepicker/dist/react-datepicker.css";
import "./App.css";

am4core.useTheme(am4themes_animated);
am4core.addLicense("ch-custom-attribution");

function App() {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [date, setDate] = useState<{ startDate?: Date; endDate?: Date }>({
    startDate: undefined,
    endDate: undefined,
  });
  const chartRef = useRef<XYChart>();
  const years = range(1990, getYear(new Date()) + 1, 1);

  useLayoutEffect(() => {
    chartRef.current = (<div>Loading</div>) as any;
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
      dateAxis.max = date.endDate?.getTime();
      dateAxis.min = date.startDate?.getTime();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const ChangeStartDateInput = forwardRef(
    ({ value, onClick }: { value?: Date; onClick?: () => void }, ref) => (
      <button
        className="custom-input"
        onClick={onClick}
        ref={ref as unknown as LegacyRef<HTMLButtonElement>}
      >
        {value}
      </button>
    )
  );

  const ChangeEndDateInput = forwardRef(
    ({ value, onClick }: { value?: Date; onClick?: () => void }, ref: any) => (
      <button
        className="custom-input"
        onClick={onClick}
        ref={ref as unknown as LegacyRef<HTMLButtonElement>}
      >
        {value}
      </button>
    )
  );

  return (
    <div>
      <div id="chart" className="chart"></div>
      <div className="datepicker-box">
        <div className="datepicker-box__title">From:</div>
        <DatePicker
          customInput={<ChangeStartDateInput />}
          calendarClassName="datepicker-box__calendar"
          selectsStart
          dateFormat="MM/yyyy"
          showMonthYearPicker
          renderCustomHeader={({
            date,
            changeYear,
            decreaseYear,
            increaseYear,
            prevYearButtonDisabled,
            nextYearButtonDisabled,
          }) => (
            <div
              style={{
                margin: 10,
                display: "flex",
                justifyContent: "space-between",
                paddingLeft: 18,
                paddingRight: 18,
              }}
            >
              <button
                onClick={decreaseYear}
                disabled={prevYearButtonDisabled}
                style={{ color: "#fff" }}
              >
                {"<"}
              </button>
              <select
                style={{ width: "60px", outline: "none", cursor: "pointer" }}
                value={getYear(date)}
                onChange={({ target: { value } }) =>
                  changeYear(parseInt(value))
                }
              >
                {years.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (getYear(date) < 2021) increaseYear();
                }}
                disabled={getYear(date) === 2021}
                style={{ color: "#fff" }}
              >
                {">"}
              </button>
            </div>
          )}
          selected={startDate}
          onChange={(date) => setStartDate(date as Date)}
        />
        <div className="datepicker-box__title">To:</div>
        <DatePicker
          customInput={<ChangeEndDateInput />}
          calendarClassName="datepicker-box__calendar"
          selectsEnd
          dateFormat="MM/yyyy"
          showMonthYearPicker
          renderCustomHeader={({
            date,
            changeYear,
            decreaseYear,
            increaseYear,
            prevYearButtonDisabled,
            nextYearButtonDisabled,
          }) => (
            <div
              style={{
                margin: 10,
                display: "flex",
                justifyContent: "space-between",
                paddingLeft: 18,
                paddingRight: 18,
              }}
            >
              <button
                onClick={() => decreaseYear}
                disabled={prevYearButtonDisabled}
                style={{ color: "#fff" }}
              >
                {"<"}
              </button>
              <select
                style={{ width: "60px", outline: "none", cursor: "pointer" }}
                value={getYear(date)}
                onChange={({ target: { value } }) =>
                  changeYear(parseInt(value))
                }
              >
                {years.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (getYear(date) < 2021) increaseYear();
                }}
                disabled={getYear(date) === 2021}
                style={{ color: "#fff" }}
              >
                {">"}
              </button>
            </div>
          )}
          selected={endDate}
          onChange={(date) => setEndDate(date as Date)}
        />
        <button
          className="custom-input custom-input--submit"
          onClick={() => setDate({ endDate, startDate })}
        >
          Apply
        </button>
        <button
          className="custom-input custom-input--submit"
          onClick={() => setDate({})}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
export default App;
