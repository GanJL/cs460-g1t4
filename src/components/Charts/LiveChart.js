import React, { useEffect, useState } from 'react'
import { io } from "socket.io-client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';


ChartJS.register(
  // CategoryScale,
  // LinearScale,
  // PointElement,
  // LineElement,
  // Title,
  // Tooltip,
  // Legend,
  // TimeScale,
);

const test = []

const LiveChart = ({ getdata }) => {
  const [data, setData] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const options = {
    plugins: {
      streaming: {
        frameRate: 120  
      }
    },
    scales: {
      x: {
        type: 'realtime',
        duration: 40000,
        refresh: 1000,
        delay: 2000,
        realtime: {
          onRefresh: chart => {
            var current = test;
            current.push({
                  x: Date.now(),
                  y: Math.random()
            })
            // maybe can set state for this whichever is smoother
            // setData(current)
            chart.data.datasets[0].data = current;
            console.log(data.length);
          }
        }
      },
      y: {
        // type: 'linear',
        // display: true,
        // position: 'left',
        // min: 0,
        max: 1,
        // stepSize: 1,
        beginAtZero: true,
      },
    },
  };
  // useEffect(() => {
  //   const socket = io("http://192.168.68.63:8089/", {
  //     transports: ["websocket"],
  //     cors: {
  //       origin: "http://localhost:3000/",
  //     },
  //   });
  //   console.log(socket);
  //   socket.on("data", (data) => {
  //     setMessages([...messages, data.data]);
  //   });
  // }, [socket, messages]);
  
  const chartdata = {
    datasets: [
      {
        label: "Dataset 1",
        data: [],
        label: 'Moisture Level %',
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
      },
    ],
  };

  useEffect(() => {

  }, [getdata])
  return (
    <div>
      {/* <Line options={options} data={chartdata} /> */}
    </div>
  )
}

export default LiveChart