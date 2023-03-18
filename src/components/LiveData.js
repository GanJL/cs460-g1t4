import React from 'react'
import { useEffect, useState } from 'react'
import { io } from "socket.io-client";
import '../App.css';
import {
    SunlightFormat,
    MoistureFormat,
    live_data_url
} from '../Constants';

const LiveData = ({ getReservoir }) => {

    const [data, setData] = useState({
        temperature: 0.0,
        humidity: 0.0,
        timestamp: new Date().getTime(),
        moisture: 0.0,
        sunlight: 0.0,
        reservoir: 0.0
    });
    const [error, setError] = useState(true);

    useEffect(() => {

        // establish connection with server
        const socket = io(live_data_url, {
            transports: ["websocket"],
            cors: {
                origin: "http://localhost:3000/",
            },
        });

        socket.on("connect", (data) => {
            console.log(data);
        });

        socket.on("disconnect", (data) => {
            console.log(data);
        });

        // set interval to 3s to allow sensors time to update
        setInterval(() => {
            socket.emit("live_data", new Date())
        }, 3000);

        socket.on("live_data", (data) => {
            var getData = JSON.parse(data.data);
            console.log(getData)
            getReservoir(getData.reservoir)
            setData({
                temperature: getData.temperature,
                humidity: getData.humidity,
                moisture: getData.moisture,
                sunlight: getData.sunlight,
                reservoir: getData.reservoir,
                timestamp: getData.time

            });
            setError(false)
        });

        return function cleanup() {
            socket.disconnect();
        };

    }, []);

    return (
        <div>
            <div>
                <div className='sectionTitleBox'>
                    <div className='sectionTitle'>
                        Live Data
                    </div>
                </div>
                <div className='liveDataContainer'>
                    <div className='liveDataBox moisture'>
                        <h3 className='liveDataLabel'>Moisture</h3>
                        <div className='liveDataReading'>{MoistureFormat(data.moisture)} <span className='suffix'>%</span></div>
                    </div>
                    <div className='liveDataBox sunlight'>
                        <h3 className='liveDataLabel'>Sunlight</h3>
                        <div className='liveDataReading'>{SunlightFormat(data.sunlight)} <span className='suffix'>%</span></div>
                    </div>
                    <div className='liveDataBox temperature'>
                        <h3 className='liveDataLabel'>Temperature</h3>
                        <div className='liveDataReading'>{data.temperature} <span className='suffix'>°C</span></div>
                    </div>
                    <div className='liveDataBox humidity'>
                        <h3 className='liveDataLabel'>Humidity</h3>
                        <div className='liveDataReading'>{data.humidity} <span className='suffix'>%</span></div>
                    </div>
                </div>
                <div >
                    { error ? <span className='timestamp'>Error: Could not connect to server!</span> : <span className='timestamp'>Last updated: {data.timestamp}</span> }
                </div>
            </div>


        </div>
    )
}

export default LiveData