import React, { Component } from 'react'
import Beaconinfo from './components/BeaconInfo'
import Room from './components/Room'
import GyroInfo from './components/GyroInfo'
import {trilaterate} from './components/trilateration'

export class App extends Component {

  state = {
    beacons1: {
      name: 'beacon1',
      rssi: [],
      txPower: 0,
      distance: 0
    },
    beacons2: {
      name: 'beacon2',
      rssi: [],
      txPower: 0,
      distance: 0
    },
    beacons3: {
      name: 'beacon3',
      rssi: [],
      txPower: 0,
      distance: 0
    },
    beacons4: {
      name: 'beacon4',
      rssi: [],
      txPower: 0,
      distance: 0
    },
    room: {
      width: 400,
      height: 300,
    },
    dimensions: {
      width: 400,
      height: 300,
    },
    gyro: {
      x: 0,
      y: 0,
      z: 0,
    },
    userPos: {
      x: 0,
      y: 0,
    }
  }

  myCharacteristic = null;

  byteString = (n) => {
    if (n < 0 || n > 255 || n % 1 !== 0) {
      throw new Error(n + " does not fit in a byte");
    }
    return ("000000000" + n.toString(2)).substr(-8)
  }

  int16 = (v) => {
    return (v << 16) >> 16;
  }

  onStartButtonClick = () => {
    let serviceUuid = '0000ffe5-0000-1000-8000-00805f9a34fb';
    if (serviceUuid.startsWith('0x')) {
      serviceUuid = parseInt(serviceUuid);
    }

    let characteristicUuid = '0000ffe4-0000-1000-8000-00805f9a34fb';
    if (characteristicUuid.startsWith('0x')) {
      characteristicUuid = parseInt(characteristicUuid);
    }

    console.log('Requesting Bluetooth Device...');
    navigator.bluetooth.requestDevice({ filters: [{ services: [serviceUuid] }] })
      .then(device => {
        console.log('Connecting to GATT Server...');
        return device.gatt.connect();
      })
      .then(server => {
        console.log('Getting Service...');
        return server.getPrimaryService(serviceUuid);
      })
      .then(service => {
        console.log('Getting Characteristic...');
        return service.getCharacteristic(characteristicUuid);
      })
      .then(characteristic => {
        this.myCharacteristic = characteristic;
        return this.myCharacteristic.startNotifications().then(_ => {
          console.log('> Notifications started');
          this.myCharacteristic.addEventListener('characteristicvaluechanged',
            this.handleNotifications);
        });
      })
      .catch(error => {
        console.log('Argh! ' + error);
      });
  }

  onStopButtonClick = () => {
    if (this.myCharacteristic) {
      this.myCharacteristic.stopNotifications()
        .then(_ => {
          console.log('> Notifications stopped');
          this.myCharacteristic.removeEventListener('characteristicvaluechanged',
            this.handleNotifications);
        })
        .catch(error => {
          console.log('Argh! ' + error);
        });
    }
  }

  handleNotifications = (event) => {
    let value = event.target.value;
    let a = [];
    // Convert raw data bytes to hex values just for the sake of showing something.
    // In the "real" world, you'd use data.getUint8, data.getUint16 or even
    // TextDecoder to process raw data bytes.
    for (let i = 0; i < value.byteLength; i++) {
      //document.getElementById("val").innerText = value.getUint8(14).toString(2) + ' ' + value.getUint8(15).toString(2);((RollH<<8)|RollL)/32768*180(°)

      //log(value.getUint8(i).toString());
      //a.push(' ' + ('00' + value.getUint8(i).toString(16)).slice(-2));
    }
    var rollL = this.byteString(value.getUint8(14));
    var rollH = this.byteString(value.getUint8(15));
    var valRoll = parseInt((rollH + rollL), 2);

    var pitchL = this.byteString(value.getUint8(16));
    var pitchH = this.byteString(value.getUint8(17));
    var valPitch = parseInt((pitchH + pitchL), 2);

    var yawL = this.byteString(value.getUint8(18));
    var yawH = this.byteString(value.getUint8(19));
    var valYaw = parseInt((yawH + yawL), 2);
    // document.getElementById("val").innerText = (rollH.toString() + rollL.toString()) + " ";
    // document.getElementById("angleX").innerText = ((int16(valRoll) / 32768 * 180)).toString();;
    // document.getElementById("angleY").innerText = ((int16(valPitch) / 32768 * 180)).toString();;
    // document.getElementById("angleZ").innerText = ((int16(valYaw) / 32768 * 180)).toString();;
    this.setState({
      gyro: {
        x: (this.int16(valRoll) / 32768 * 180),
        y: (this.int16(valPitch) / 32768 * 180),
        z: (this.int16(valYaw) / 32768 * 180),
      }
    })
  }

  onWatchAdvertisementsButtonClick = (beaconNum) => {
    console.log('Requesting any Bluetooth device...');
    navigator.bluetooth.requestDevice({
      // filters: [...] <- Prefer filters to save energy & show relevant devices.
      acceptAllDevices: true
    })
      .then(device => {
        console.log('> Requested ' + device.name);

        device.addEventListener('advertisementreceived', (event) => {
          const { device, rssi, txPower } = event;
          // var rssiArray = [...this.state.rssi, rssi];
          var Tx = -128;
          let distance = this.calculateDistance(-69, rssi);
          switch (beaconNum) {
            case 1: this.setState(state => {
              var rssiArray = [...this.state.beacons1.rssi, rssi];
              if (rssiArray.length > 10) {
                rssiArray = rssiArray.slice(1);
              }
              var aveRssi = this.rssiAverage(rssiArray);
              let distance = this.calculateDistance(Tx, aveRssi);
              return {
                beacons1: {
                  name: device.name,
                  rssi: rssiArray,
                  txPower,
                  distance,
                }
              }
            });
              break;
            case 2: this.setState(state => {
              var rssiArray = [...this.state.beacons2.rssi, rssi];
              if (rssiArray.length > 10) {
                rssiArray = rssiArray.slice(1);
              }
              var aveRssi = this.rssiAverage(rssiArray);
              let distance = this.calculateDistance(Tx, aveRssi);
              return {
                beacons2: {
                  name: device.name,
                  rssi: rssiArray,
                  txPower,
                  distance,
                }
              }
            });
              break;
            case 3: this.setState(state => {
              var rssiArray = [...this.state.beacons3.rssi, rssi];
              if (rssiArray.length > 10) {
                rssiArray = rssiArray.slice(1);
              }
              var aveRssi = this.rssiAverage(rssiArray);
              let distance = this.calculateDistance(Tx, aveRssi);
              return {
                beacons3: {
                  name: device.name,
                  rssi: rssiArray,
                  txPower,
                  distance,
                }
              }
            });
              break;
            case 4: this.setState(state => {
              var rssiArray = [...this.state.beacons4.rssi, rssi];
              if (rssiArray.length > 10) {
                rssiArray = rssiArray.slice(1);
              }
              var aveRssi = this.rssiAverage(rssiArray);
              let distance = this.calculateDistance(Tx, aveRssi);
              return {
                beacons4: {
                  name: device.name,
                  rssi: rssiArray,
                  txPower,
                  distance,
                }
              }
            });
              break;
            default:
              console.log('not valid num');

          }

          


          var p1 = [0,0,0,1];
          var p2 = [1,1,0,1];
          var p3 = [0,0,0,1];
          var p4 = [0,0,0,1];
          // var output =trilaterate(p1,p2,p3,true) ;
          // console.log(output);
          var pos = [0,0];
          var sum = this.state.beacons1.distance + this.state.beacons3.distance + this.state.beacons2.distance + this.state.beacons4.distance;
          pos[0] = (this.state.beacons1.distance + this.state.beacons4.distance - this.state.beacons2.distance - this.state.beacons3.distance)/sum;
          pos[0] = pos[0]*200 ;
          pos[1] = (this.state.beacons1.distance + this.state.beacons2.distance - this.state.beacons3.distance - this.state.beacons4.distance)/sum;
          pos[1] = pos[1]*150 ;
          this.setState({userPos:{
            x: 200 + pos[0],
            y: 150 + pos[1],
          }})

          console.log('Advertisement received.');
          console.log('  Device Name: ' + event.device.name);
          console.log('  Device ID: ' + event.device.id);
          console.log('  RSSI: ' + event.rssi);
          console.log('  TX Power: ' + event.txPower);
          console.log('  UUIDs: ' + event.uuids);
        });

        console.log('Watching advertisements from "' + device.name + '"...');
        return device.watchAdvertisements();
      })
      .catch(error => {
        console.log('Argh! ' + error);
      });
  }
  calculateDistance = (txPower, rssi) => {
    if (rssi === 0) {
      return -1; // if we cannot determine accuracy, return -1.
    }

    var ratio = (txPower - (rssi)) / (10 * 2);
    return Math.pow(10, ratio);
    // if (ratio < 1.0) {
    //   return Math.pow(ratio, 10);
    // } else {
    //   return (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
    // }
  }

  rssiAverage = (rssiArray) => {
    var total = 0;
    for (var i = 0; i < rssiArray.length; i++) {
      total += rssiArray[i];
    }
    return total / rssiArray.length;
  }




  componentDidMount() {
    this.setState({
      dimensions: {
        width: this.container.offsetWidth,
        height: this.container.offsetHeight,
      },
    });
  }

  handleChangeWidth(event) {
    this.setState({
      room: {
        width: event.target.value,
      }
    });
    this.forceUpdate();
  }
  handleChangeHeight(event) {
    this.setState({
      room: {
        height: event.target.value,
      }
    })
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }

  posStyle = (x,y) =>{
    return <div style={{ backgroundColor: 'red', height: 10, width: 10, borderRadius: 5, position: 'relative', 
    top: y + 10, 
    left: x }} 
    />
  }


  render() {
    return (
      <div style={{ flex: 1, flexDirection: 'column' }} ref={el => (this.container = el)} >
        <div>
          <Beaconinfo beacon={this.state.beacons1} />
          <Beaconinfo beacon={this.state.beacons2} />
          <Beaconinfo beacon={this.state.beacons3} />
          <Beaconinfo beacon={this.state.beacons4} />
          <GyroInfo gyro={this.state.gyro} />
          {this.state.dimensions.width}/
          {this.state.dimensions.height}
          <p>
            <button onClick={() => { this.onWatchAdvertisementsButtonClick(1) }} >Request Beacon 1</button>
            <button onClick={() => { this.onWatchAdvertisementsButtonClick(2) }} >Request Beacon 2</button>
            <button onClick={() => { this.onWatchAdvertisementsButtonClick(3) }} >Request Beacon 3</button>
            <button onClick={() => { this.onWatchAdvertisementsButtonClick(4) }} >Request Beacon 4</button>
            <button onClick={this.onStartButtonClick} >Request Gyro</button>
            <button onClick={this.onStopButtonClick} >Stop Gyro</button>
          </p>
          <form onSubmit={this.handleSubmit}>
            <p>
              <label>
                Width:
              <input type="text" value={this.state.room.width} onChange={(e) => this.handleChangeWidth(e)} />
              </label>
            </p>
            <label>
              Height:
              <input type="text" value={this.state.room.height} onChange={(e) => this.handleChangeHeight(e)} />
            </label>
          </form>
          <div>
            {this.posStyle(this.state.userPos.x,this.state.userPos.y)}
            <Room room={this.state.room} />
            {this.state.userPos.x}/{this.state.userPos.y}
          </div>

        </div>
      </div>
    )
  }
}

export default App
