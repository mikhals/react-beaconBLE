import React, { Component, Text } from 'react'

export class GyroInfo extends Component {
    render() {
        const { x, y, z } = this.props.gyro;
        return (
            <div style={{ fontSize: '10px' }} >
                <p>x = {x}</p>
                <p>y = {y}</p>
                <p>z = {z} </p>
            </div>
        )
    }
}

export default GyroInfo
