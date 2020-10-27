import React, { Component } from 'react'

export class BeaconInfo extends Component {
    render() {
        const {beacon} = this.props;
        return (
            <div style={{fontSize:'10px'}} >
                {beacon.name}({beacon.txPower}): rssi = {JSON.stringify(beacon.rssi)}, distance(m) = {beacon.distance}
            </div>
        )
    }
}

export default BeaconInfo
