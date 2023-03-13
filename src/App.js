import logo from './logo.svg';
import './App.css';
import LiveData from './components/LiveData';
import ChartData from './components/ChartData';
import { useEffect, useState } from 'react'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MoistureFormat, MoistureFormat2, ReservoirFormat } from './Constants';
import Form from 'react-bootstrap/Form';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import RangeSlider from 'react-bootstrap-range-slider';
import { Button } from 'react-bootstrap';
import { Spinner } from 'react-bootstrap';
import waterPlant from './images/watering-plants.png';

function App() {

  const [reservoir, setReservoir] = useState(0.0);
  const [threshold, setThreshold] = useState(70.0);
  const [autoVolume, setAutoVolume] = useState(50.0);
  const [manualVolume, setManualVolume] = useState(50.0);
  const [manualLoading, setManualLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoToggle, setAutoToggle] = useState(false);


  useEffect(() => {
    getAutoWateringValues()
  },[])
  const getReservoir = (data) => {
    setReservoir(data)
  }
  const volumeToSeconds = (volume) => {
    return volume / 30;
  }

  const SecondsToVolume = (seconds) => {
    return seconds * 30;
  }

  const getAutoWateringValues = () => {
    fetch(
      `http://192.168.68.61:8087/get_auto_watering`, { method: 'GET'}
    ) 
      .then(res => res.json())
      .then(data => {
        console.log(data.data[0]);
        setThreshold(MoistureFormat(data.data[0][1]))
        setAutoVolume(SecondsToVolume(data.data[0][2]))
        setAutoToggle(data.data[0][3] == 1 ? true : false)

      })
  }
  const manualWaterSubmit = () => {
    setManualLoading(true)
    fetch(
      `http://192.168.68.61:8087/manual_water_plant`, { method: 'POST', body: JSON.stringify({ "duration": volumeToSeconds(manualVolume) }) }
    )
      .then(res => res.json())
      .then(data => {
        console.log(data.status);
        if (data.status == 200) {
          setManualLoading(false)
        }
      })
  }

  const autoWaterSubmit = () => {
    setAutoLoading(true)
    console.log(MoistureFormat2(threshold));
    fetch(
      `http://192.168.68.61:8087/update_auto_watering`, { method: 'PUT', body: JSON.stringify({ "threshold": MoistureFormat2(threshold), "duration" : volumeToSeconds(autoVolume), "auto": autoToggle }) }
    )
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data.status == 200) {
          setTimeout(() => {
            setAutoLoading(false)
          }, 1000)
        }
      })
  }

  return (
    <div className="App">
      <Container>
        <Row>
          <Col sm={8} className="sectionBorder">
            <div className='livechart'>
              <LiveData getReservoir={getReservoir} />
            </div>
          </Col>
          <Col className="sectionBorder">
            <div className='sectionTitleBox'>
              <div className='sectionTitle'>
                Reservoir
              </div>
            </div>
            <div className='liveDataContainer'>
              <div className='liveDataBox reservoir'>
                <h3 className='liveDataLabel'>Water Level</h3>
                <div className='liveDataReading'>{ReservoirFormat(reservoir)} <span className='suffix'>%</span></div>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col sm={8} className="sectionBorder">
            <div className='chartdata'>
              <ChartData />
            </div>
          </Col>
          <Col className="sectionBorder settings">
            <div className='sectionTitleBox'>
              <div className='sectionTitle'>
                Settings
              </div>
            </div>
            <div className='liveDataContainer settings'>
              <div className='settingsBox autoWatering'>
                <div className='sectionSubtitleBox'>
                  <div className='settingsTitle'>
                    Auto-Watering
                  </div>
                </div>
                <Container>
                  <Row className='formBox'>
                    <Form.Label column="sm" lg={4}>
                      Moisture Threshold (%)
                    </Form.Label>
                    <Col>
                      {/* <Form.Control size="sm" type="text" placeholder="Small text" /> */}
                      <RangeSlider
                        value={threshold}
                        onChange={changeEvent => setThreshold(changeEvent.target.value)}
                      />
                    </Col>
                    <Col xs="3">
                      <Form.Control value={threshold} onChange={changeEvent => setThreshold(changeEvent.target.value)} />
                    </Col>
                  </Row>
                  <Row className='formBox'>
                    <Form.Label column="sm" lg={4}>
                      Volume (ml)
                    </Form.Label>
                    <Col>
                      {/* <Form.Control size="sm" type="text" placeholder="Small text" /> */}
                      <RangeSlider
                        value={autoVolume}
                        onChange={changeEvent => setAutoVolume(changeEvent.target.value)}
                        min={50}
                        max={300}
                      />
                    </Col>
                    <Col xs={"3"}>
                      <Form.Control value={autoVolume} onChange={changeEvent => setAutoVolume(changeEvent.target.value)} />
                    </Col>
                  </Row>
                  <Row className='formBox'>
                    <Form.Label column="sm" lg={4}>
                      On/Off
                    </Form.Label>
                    <Col >
                      <Form.Check
                        type="switch"
                        id="custom-switch"
                        className='switch'
                        checked={autoToggle}
                        onChange={() => setAutoToggle(!autoToggle)}
                      />
                    </Col>
                    <Col className='p-0 text-end pe-3'>
                      <Button
                        variant="primary"
                        className="chartButton settingsSave"
                        onClick={() => autoWaterSubmit()}>
                        {autoLoading ? <Spinner animation="border" role="status" size='sm'>
                          <span className="visually-hidden">Loading...</span>
                        </Spinner> : 'Save'}
                      </Button>
                    </Col>
                  </Row>
                  <div className='timestamp'>Changes will be effective in the next minute.</div>

                </Container>

              </div>
              <div className='settingsBox manualWatering'>
                <div className='sectionSubtitleBox'>
                  <div className='settingsTitle'>
                    Manual-Watering
                  </div>
                </div>
                <Container>
                  <Row className='formBox'>
                    <Form.Label column="sm" lg={4}>
                      Volume (ml)
                    </Form.Label>
                    <Col>
                      {/* <Form.Control size="sm" type="text" placeholder="Small text" /> */}
                      <RangeSlider
                        value={manualVolume}
                        onChange={changeEvent => setManualVolume(changeEvent.target.value)}
                        min={50}
                        max={300}
                      />
                    </Col>
                    <Col xs="3">
                      <Form.Control value={manualVolume} onChange={changeEvent => setManualVolume(changeEvent.target.value)} />
                    </Col>
                  </Row>
                  <Row>
                    <Col className='p-3'>
                      <Button
                        variant="outline-success"
                        className="chartButton waterPlant"
                        onClick={() => manualWaterSubmit()}
                      >
                        {manualLoading ? <Spinner animation="border" role="status" >
                          <span className="visually-hidden">Loading...</span>
                        </Spinner> : <img src={waterPlant} className="waterIcon"></img>}
                      </Button>
                    </Col>
                  </Row>
                </Container>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

    </div>
  );
}

export default App;
