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

import {
  SunlightFormat,
  MoistureFormat,
  ReservoirFormat
} from '../../Constants';

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



const MinuteChart = ({ type }) => {
  const [labels, setLabels] = useState([]);
  const [moisture, setMoisture] = useState([]);
  const [sunlight, setSunlight] = useState([]);
  const [temperature, setTemperature] = useState([]);
  const [humidity, setHumidity] = useState([]);
  const [reservoir, setReservoir] = useState([]);
  const [maxY, setMaxY] = useState(0);
  const [minY, setMinY] = useState(0);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [minutes, setMinutes] = useState([]);

  const generateLabels = () => {
    const items = [];
    new Array(24).fill().forEach((acc, index) => {
      items.push(moment({ hour: index }).format('h:mm A'));
      items.push(moment({ hour: index, minute: 15 }).format('h:mm A'));
      items.push(moment({ hour: index, minute: 30 }).format('h:mm A'));
      items.push(moment({ hour: index, minute: 45 }).format('h:mm A'));
    })
    return items;
  }

  const generateMinutes = () => {
    const list = []
    new Array(24).fill().forEach((acc, index) => {
      list.push(moment({ hour: index }).format('H:mm'));
      list.push(moment({ hour: index, minute: 15 }).format('H:mm'));
      list.push(moment({ hour: index, minute: 30 }).format('H:mm'));
      list.push(moment({ hour: index, minute: 45 }).format('H:mm'));
    })
    setMinutes(list)
  }

  const processData = (data) => {
    const reversedData = data.reverse()
    const moisture = [];
    const sunlight = [];
    const temperature = [];
    const humidity = [];
    const reservoir = [];

    const today = moment().format('DD-MM-YYYY');
    minutes.map((min) => {
      var minHour = min.split(":")[0]
      if (minHour < 10) {
        minHour = `0${minHour}`
      }
      var minMinute = min.split(":")[1]
   

      const filtered = reversedData.filter((item) => {
        const date = item[1].split(" ")[0]
        const minute = item[1].split(" ")[1].split(":")[1]
        const hour = item[1].split(" ")[1].split(":")[0]
        return hour == minHour && minute == minMinute && date == today
      })



      if (filtered.length > 0) {
        if (type == 'MS') {
          moisture.push(MoistureFormat(JSON.parse(filtered[0][2])));
          sunlight.push(SunlightFormat(JSON.parse(filtered[0][5])));
        }
        else if (type == 'TH') {
          temperature.push(JSON.parse(filtered[0][3]));
          humidity.push(JSON.parse(filtered[0][4]));
        }
        else {
          reservoir.push(ReservoirFormat(JSON.parse(filtered[0][6])));
        }
      }
      else {
        if (type == 'MS') {
          moisture.push(null);
          sunlight.push(null);
        }
        else if (type == 'TH') {
          temperature.push(null);
          humidity.push(null);
        }
        else {
          reservoir.push(null);
        }
      }
    })
    if (type == 'MS') {
      setMoisture(moisture);
      setSunlight(sunlight);
      setMaxY(Math.floor(Math.max(...moisture, ...sunlight)));
      setMinY(Math.floor(Math.min(...moisture, ...sunlight)));
    }
    else if (type == 'TH') {
      setTemperature(temperature);
      setHumidity(humidity);
      setMaxY(Math.floor(Math.max(...temperature, ...humidity)));
      setMinY(Math.floor(Math.min(...temperature, ...humidity)));
    }
    else {
      setReservoir(reservoir);
      setMaxY(Math.floor(Math.max(...reservoir)));
      setMinY(Math.floor(Math.min(...reservoir)));
    }

  }
  const options = type !== 'R' ? {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: type == 'MS' ? 'Moisture Level vs Sunlight Level (30 Minutes)' : 'Temperature Level vs Humidity Level (30 Minutes)',
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 24,
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: -10,
        max: 100,
        stepSize: 1,
        title: {
          display: true,
          text: type == 'MS' ? 'Moisture Level %' : 'Temperature Level %',
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: -10,
        max: 100,
        stepSize: 1,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: type == 'MS' ? 'Sunlight Level %' : 'Humidity Level %',
        }
      },
    },
  } :
    {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      stacked: false,
      plugins: {
        title: {
          display: true,
          text: 'Reservoir Level (30 Minutes)',
        },
      },
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxTicksLimit: 24,
          },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          min: -10,
          max: 100,
          stepSize: 1,
          title: {
            display: true,
            text: 'Reservoir Level %',
          }
        },
      },
    };

  const chartdata = type !== 'R' ? {
    labels,
    datasets: [
      {
        label: type == 'MS' ? 'Moisture Level %' : 'Temperature Level %',
        data: type == 'MS' ? moisture : temperature,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
      },
      {
        label: type == 'MS' ? 'Sunlight Level %' : 'Humidity Level %',
        data: type == 'MS' ? sunlight : humidity,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y1',
      },
    ],
  } :
    {
      labels,
      datasets: [
        {
          label: 'Reservoir Level %',
          data: reservoir,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          yAxisID: 'y',
        },
      ],
    }
    ;

  const getData = async () => {

    try {
      const res = await fetch("http://192.168.68.64:8088/getalldata")
      const result = await res.json()
      setData(result.data)
      setError(false)
    } catch (err) {
      setError(true)
    }

  }

  useEffect(() => {
    getData();
    // calls api every 1 minute
    setInterval(getData, 1 * 60 * 1000);
  }, [type])


  useEffect(() => {
    setLabels(generateLabels());
    generateMinutes()
    if (data != []) {
      processData(data);
    }
  }, [data])

  return (
    <>
      {error ? <div>
        <h3>ERROR &rarr;</h3>
        <p>Could not connect to server</p>
      </div> :
        <div>
          <Line options={options} data={chartdata} />
        </div>

      }
    </>
  )

}

export default MinuteChart