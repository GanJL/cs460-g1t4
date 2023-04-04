import React, { useState } from 'react'
import { Button } from 'react-bootstrap';
import HourlyChart from './Charts/HourlyChart';
import MinuteChart from './Charts/MinuteChart';
import '../App.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const ChartData = () => {
  const [duration, setDuration] = useState('mins');
  const [chartType, setChartType] = useState('MS');

  return (
    <div>
      <div className='sectionTitleBox'>
        <div className='sectionTitle'>
          Chart
        </div>
      </div>
      <Container>
        <Row>
          <Col className="buttonBox" sm={4}>
            <Button
              variant="primary"
              onClick={() => { setDuration('hour') }}
              disabled={duration == 'hour'}
              className="chartButton">
              Hour
            </Button>
            <Button
              variant="primary"
              onClick={() => { setDuration('mins') }}
              disabled={duration == 'mins'}
              className="chartButton">
              Minutes
            </Button>
          </Col>
          <Col className="buttonBox">
            <Button
              variant="warning"
              onClick={() => { setChartType('MS') }}
              className="chartButton">
              Moisture / Sunlight
            </Button>
            <Button
              variant="success"
              onClick={() => { setChartType('TH') }}
              className="chartButton">
              Temp / Humidity
            </Button>
            <Button
              variant="info"
              onClick={() => { setChartType('R') }}
              className="chartButton">
              Reservoir
            </Button>
          </Col>
        </Row>
        <Row>
          <Col className="">
            {
              duration == 'hour' ?
                chartType == 'MS' ?
                  <HourlyChart type='MS' />
                  : chartType == 'TH' ?
                    <HourlyChart type='TH' />
                    : <HourlyChart type='R' />
                : chartType == 'MS' ?
                  <MinuteChart type='MS' />
                  : chartType == 'TH' ?
                    <MinuteChart type='TH' />
                    : <MinuteChart type='R' />
            }
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default ChartData