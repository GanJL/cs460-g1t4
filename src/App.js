import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import { Button, Spinner } from 'react-bootstrap';
import TimePicker from 'react-bootstrap-time-picker';
import RangeSlider from 'react-bootstrap-range-slider';

import waterPlant from './images/watering-plants.png';
import diskette from './images/diskette.png';
import fertilizer from './images/fertilizer.png';

import { useEffect, useState } from 'react'

import LiveData from './components/LiveData';
import ChartData from './components/ChartData';
import { MoistureFormat, MoistureFormat2, ReservoirFormat, watering_url } from './Constants';


function App() {

  const [reservoir, setReservoir] = useState(0.0);

  const [autoWateringThreshold, setAutoWateringThreshold] = useState(70.0);
  const [autoWateringVolume, setAutoWateringVolume] = useState(50.0);
  const [autoWateringToggle, setAutoWateringToggle] = useState(false);

  const [manualWateringVolume, setManualWateringVolume] = useState(50.0);

  const [autoFertiliserTime, setAutoFertiliserTime] = useState(null);
  const [autoFertiliserVolume, setAutoFertiliserVolume] = useState(50.0);
  const [autoFertiliserToggle, setAutoFertiliserToggle] = useState(false);

  const [manualFertiliserVolume, setManualFertiliserVolume] = useState(50.0);

  const [manualLoading, setManualLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);

  const [autoMode, setAutoMode] = useState('Watering');

  useEffect(() => {
    getAutoWateringValues()
    getAutoFertilisingValues()
  }, [])

  const getReservoir = (data) => {
    setReservoir(data)
  }
  const volumeToSeconds = (volume) => {
    return volume / 30;
  }

  const SecondsToVolume = (seconds) => {
    return seconds * 30;
  }

  const secondsFormat = (seconds) => {
    return new Date(seconds * 1000).toISOString().slice(11, 16);   
  }

  const getAutoWateringValues = () => {
    fetch(
      `${watering_url}get_auto_watering`, { method: 'GET' }
    )
      .then(res => res.json())
      .then(data => {
        console.log(data.data[0]);
        setAutoWateringThreshold(MoistureFormat(data.data[0][1]))
        setAutoWateringVolume(SecondsToVolume(data.data[0][2]))
        setAutoWateringToggle(data.data[0][3] == 1 ? true : false)

      })
  }

  
  const getAutoFertilisingValues = () => {
    fetch(
      `${watering_url}get_auto_fertiliser`, { method: 'GET' }
    )
      .then(res => res.json())
      .then(data => {
        console.log(data.data[0]);

        setAutoFertiliserTime(data.data[0][1])
        setAutoFertiliserVolume(SecondsToVolume(data.data[0][2]))
        setAutoFertiliserToggle(data.data[0][3] == 1 ? true : false)

      })
  }

  const manualWaterSubmit = () => {
    setManualLoading(true)
    fetch(
      `${watering_url}manual_water_plant`, { method: 'POST', body: JSON.stringify({ "duration": volumeToSeconds(manualWateringVolume) }) }
    )
      .then(res => res.json())
      .then(data => {
        console.log(data.status);
        if (data.status == 200) {
          setManualLoading(false)
        }
      })
  }

  const manualFertiliserSubmit = () => {
    setManualLoading(true)
    fetch(
      `${watering_url}manual_fertiliser`, { method: 'POST', body: JSON.stringify({ "duration": volumeToSeconds(manualFertiliserVolume) }) }
    )
      .then(res => res.json())
      .then(data => {
        console.log(data.status);
        if (data.status == 200) {
          setManualLoading(false)
        }
      })
  }



  const autoSubmit = () => {
    setAutoLoading(true)
    console.log(MoistureFormat2(autoWateringThreshold));
    console.log(autoFertiliserTime);
    fetch(
      `${watering_url}/update_auto_watering`, { method: 'PUT', body: JSON.stringify({ "threshold": MoistureFormat2(autoWateringThreshold), "duration": volumeToSeconds(autoWateringVolume), "auto": autoWateringToggle }) }
    )
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data.status == 200) {

          fetch(
            `${watering_url}/update_auto_fertiliser`, { method: 'PUT', body: JSON.stringify({ "time": autoFertiliserTime, "duration": volumeToSeconds(autoFertiliserVolume), "auto": autoFertiliserToggle }) }
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
            <Row className='sectionTitleBox'>
              <Col>
                <div className='sectionTitle'>
                  Settings
                </div>
              </Col>
              <Col className='saveButtonBox'>
                <Button
                  variant="outline-primary"
                  className="chartButton settingsSave"
                  onClick={() => autoSubmit()}>
                  {autoLoading ? <Spinner animation="border" role="status" size='sm'>
                    <span className="visually-hidden">Loading...</span>
                  </Spinner> : <img src={diskette} className="saveButton" />}
                </Button>
              </Col>
            </Row>
            <div className='liveDataContainer settings'>
              <div className='settingsBox autoWatering'>
                <div className='sectionSubtitleBox'>
                  <div className='settingsTitle'>
                    Automatic
                  </div>
                  <Container>
                    <Row className='formBox'>
                      <Col className='dropdownCustom'>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-primary" id="dropdown-basic" size="sm">
                            {autoMode}
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => { setAutoMode('Fertilising') }}>Fertilising</Dropdown.Item>
                            <Dropdown.Item onClick={() => { setAutoMode('Watering') }}>Watering</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </Col>
                    </Row>
                  </Container>
                </div>
                {autoMode == 'Watering' ?
                  <Container>
                    <Row className='formBox'>
                      <Form.Label column="sm" lg={4}>
                        Moisture Threshold (%)
                      </Form.Label>
                      <Col>
                        {/* <Form.Control size="sm" type="text" placeholder="Small text" /> */}
                        <RangeSlider
                          value={autoWateringThreshold}
                          onChange={changeEvent => setAutoWateringThreshold(changeEvent.target.value)}
                        />
                      </Col>
                      <Col xs="3">
                        <Form.Control value={autoWateringThreshold} onChange={changeEvent => setAutoWateringThreshold(changeEvent.target.value)} />
                      </Col>
                    </Row>
                    <Row className='formBox'>
                      <Form.Label column="sm" lg={4}>
                        Volume (ml)
                      </Form.Label>
                      <Col>
                        {/* <Form.Control size="sm" type="text" placeholder="Small text" /> */}
                        <RangeSlider
                          value={autoWateringVolume}
                          onChange={changeEvent => setAutoWateringVolume(changeEvent.target.value)}
                          min={50}
                          max={300}
                        />
                      </Col>
                      <Col xs={"3"}>
                        <Form.Control value={autoWateringVolume} onChange={changeEvent => setAutoWateringVolume(changeEvent.target.value)} />
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
                          checked={autoWateringToggle}
                          onChange={() => setAutoWateringToggle(!autoWateringToggle)}
                        />
                      </Col>
                    </Row>

                  </Container> :
                  <Container>
                    <Row className='formBox'>
                      <Form.Label column="sm" lg={4}>
                        Set Timing
                      </Form.Label>
                      <Col className='timePickerBox'>
                        <TimePicker className='timePickerCustom' start="00:00" end="23:30" value={autoFertiliserTime} step={30} onChange={changeEvent => setAutoFertiliserTime(secondsFormat(changeEvent))}
                        />
                      </Col>
                    </Row>
                    <Row className='formBox'>
                      <Form.Label column="sm" lg={4}>
                        Volume (ml)
                      </Form.Label>
                      <Col>
                        <RangeSlider
                          value={autoFertiliserVolume}
                          onChange={changeEvent => setAutoFertiliserVolume(changeEvent.target.value)}
                          min={50}
                          max={300}
                        />
                      </Col>
                      <Col xs={"3"}>
                        <Form.Control value={autoFertiliserVolume} onChange={changeEvent => setAutoFertiliserVolume(changeEvent.target.value)} />
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
                          checked={autoFertiliserToggle}
                          onChange={() => setAutoFertiliserToggle(!autoFertiliserToggle)}
                        />
                      </Col>
                    </Row>
                  </Container>}


              </div>
              <div className='settingsBox manualWatering'>
                <div className='sectionSubtitleBox'>
                  <div className='settingsTitle'>
                    Manual
                  </div>
                </div>

                {autoMode == 'Watering' ?
                  <Container>
                    <Row className='formBox'>
                      <Form.Label column="sm" lg={4}>
                        Volume (ml)
                      </Form.Label>
                      <Col>
                        {/* <Form.Control size="sm" type="text" placeholder="Small text" /> */}
                        <RangeSlider
                          value={manualWateringVolume}
                          onChange={changeEvent => setManualWateringVolume(changeEvent.target.value)}
                          min={50}
                          max={300}
                        />
                      </Col>
                      <Col xs="3">
                        <Form.Control value={manualWateringVolume} onChange={changeEvent => setManualWateringVolume(changeEvent.target.value)} />
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
                  </Container> :
                  <Container>
                    <Row className='formBox'>
                      <Form.Label column="sm" lg={4}>
                        Volume (ml)
                      </Form.Label>
                      <Col>
                        {/* <Form.Control size="sm" type="text" placeholder="Small text" /> */}
                        <RangeSlider
                          value={manualFertiliserVolume}
                          onChange={changeEvent => setManualFertiliserVolume(changeEvent.target.value)}
                          min={50}
                          max={300}
                        />
                      </Col>
                      <Col xs="3">
                        <Form.Control value={manualFertiliserVolume} onChange={changeEvent => setManualFertiliserVolume(changeEvent.target.value)} />
                      </Col>
                    </Row>
                    <Row>
                      <Col className='p-3'>
                        <Button
                          variant="outline-success"
                          className="chartButton waterPlant"
                          onClick={() => manualFertiliserSubmit()}
                        >
                          {manualLoading ? <Spinner animation="border" role="status" >
                            <span className="visually-hidden">Loading...</span>
                          </Spinner> : <img src={fertilizer} className="waterIcon"></img>}
                        </Button>
                      </Col>
                    </Row>
                  </Container>}

              </div>
            </div>
          </Col>
        </Row>
      </Container>

    </div>
  );
}

export default App;
