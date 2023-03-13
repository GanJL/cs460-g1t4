import React, { useEffect, useState } from 'react'
import moment from 'moment/moment';
import 'chartjs-adapter-date-fns';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);



const DailyChart = (props) => {
  const [labels, setLabels] = useState([]);
  const [moisture, setMoisture] = useState([]);
  const [sunlight, setSunlight] = useState([]);

  const generateMinutes = () => {
    const items = [];
    new Array(12*7).fill().forEach((acc, index) => {
      items.push(moment( {hour: index*2} ).format('h:mm A'));
    })
    return items;
  }
  
  const getData = (data) => {
    console.log(data.data);
    const moisture = [];
    const sunlight = [];


    const today = moment().format('YYYY/MM/DD');
    console.log(data);
    data.data.map((item) => {
      const date = item[0].split(" ")[0]
      console.log(date);
      console.log(today);
      const minute = item[0].split(" ")[1].split(":")[1]
      const hour = item[0].split(" ")[1].split(":")[0]

      if (date == today && minute == '00' && hour % 2 == 0) {
        console.log(item);
        moisture.push(item[1]);
        sunlight.push(item[4]);
      }
    })
    setMoisture(moisture.reverse());
    setSunlight(sunlight.reverse());
  }

  
  const options = {
    responsive: true,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    stacked: false,
    plugins: {
        title: {
            display: true,
            text: 'Moisture Level vs Sunlight Level (Hourly)',
        },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 7,
        },
      },
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            min: 0,
            max: 100,
            stepSize: 1,
            title: {
              display: true,
              text: 'Moisture Level %'
            }
        },
        y1: {
            type: 'linear',
            display: true,
            position: 'right',
            min: 0,
            max: 100,
            stepSize: 1,
            grid: {
                drawOnChartArea: false,
            },
            title: {
              display: true,
              text: 'Sunlight Level'
            }
        },
    },
  };

  const chartdata = {
    labels,
    datasets: [
      {
        label: 'Moisture Level %',
        data: moisture,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Sunlight Level',
        data: sunlight,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y1',
      },
    ],
  };
  useEffect(() => {
    setLabels(generateMinutes());
    getData(props);
}, [props])
    return (
        <Line options={options} data={chartdata} />
    )
}

export default DailyChart